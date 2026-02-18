from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
import numpy as np
import sqlite3
import os
from datetime import datetime
import json
from typing import Optional

app = FastAPI()

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permiten todas las orígenes para desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para depurar las solicitudes entrantes
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Solicitud recibida: {request.method} {request.url}")
    content_type = request.headers.get("Content-Type", "")
    body = await request.body()
    if "multipart/form-data" in content_type:
        print(f"Cuerpo de la solicitud: [Contenido binario - {len(body)} bytes]")
    else:
        print(f"Cuerpo de la solicitud: {body.decode('utf-8') if body else 'Vacío'}")
    try:
        response = await call_next(request)
        print(f"Respuesta enviada: {response.status_code}")
        return response
    except Exception as e:
        print(f"Error en el procesamiento de la solicitud: {str(e)}")
        raise

# Modelos Pydantic
class UserProfile(BaseModel):
    name: Optional[str] = None
    first_surname: Optional[str] = None
    second_surname: Optional[str] = None
    birth_date: Optional[str] = None  # Formato: "YYYY-MM-DD"
    height: Optional[float] = None  # En metros (por ejemplo, 1.75)
    weight: Optional[float] = None  # En kilogramos (por ejemplo, 70.5)

class UpdateWeight(BaseModel):
    weight: float

# Conexión a la base de datos SQLite
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    print("Creando tablas en database.db...")
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )''')
    # Ensure default user exists
    c.execute("INSERT OR IGNORE INTO users (id, email, password) VALUES (1, 'default@user.com', 'default')")
    
    c.execute('''CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        prediction TEXT NOT NULL,
        type TEXT NOT NULL,
        probabilities TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INTEGER PRIMARY KEY,
        name TEXT,
        first_surname TEXT,
        second_surname TEXT,
        birth_date TEXT,
        height REAL,
        weight REAL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )''')
    conn.commit()
    conn.close()
    print("Tablas creadas y usuario por defecto verificado.")

init_db()

# Carpeta para almacenar imágenes
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Cargar el modelo al iniciar la API
try:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.resnet18(weights=None)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 8)
    model.load_state_dict(torch.load("bcn20000_model_8classes.pth", map_location=device))
    model = model.to(device)
    model.eval()
    print("Modelo PyTorch cargado correctamente.")
except Exception as e:
    print(f"Error al cargar el modelo PyTorch: {str(e)}")
    model = None

# Transformaciones para preprocesar la imagen
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Mapeo de etiquetas
label_map = {
    0: {"name": "Nevus", "type": "Benigno"},
    1: {"name": "Melanoma", "type": "Maligno"},
    2: {"name": "Carcinoma basocelular", "type": "Maligno"},
    3: {"name": "Queratosis benigna", "type": "Benigno"},
    4: {"name": "Queratosis actínica", "type": "Maligno"},
    5: {"name": "Carcinoma escamoso", "type": "Maligno"},
    6: {"name": "Dermatofibroma", "type": "Benigno"},
    7: {"name": "Vascular", "type": "Benigno"}
}

# Helper to get the default user
def get_current_user_id():
    # Hardcoded to user ID 1
    return 1

# Endpoints de la API
@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de identificación de lunares."}

@app.options("/predict")
async def options_predict():
    return JSONResponse(content={}, status_code=200)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    user_id = get_current_user_id()
    print(f"Iniciando predicción para usuario: {user_id}")
    try:
        if model is None:
            raise HTTPException(status_code=503, detail="Modelo de machine learning no disponible")

        contents = await file.read()
        print(f"Archivo recibido: {file.filename}, tamaño: {len(contents)} bytes")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_path = os.path.join(UPLOAD_DIR, f"{user_id}_{timestamp}_{file.filename}")
        with open(image_path, "wb") as f:
            f.write(contents)
        print(f"Imagen guardada en: {image_path}")

        image = Image.open(io.BytesIO(contents)).convert("RGB")
        print("Imagen abierta y convertida a RGB")
        image = transform(image).unsqueeze(0).to(device)
        print("Imagen preprocesada y enviada al dispositivo")

        with torch.no_grad():
            outputs = model(image)
            probabilities = torch.softmax(outputs, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()
            predicted_label = label_map[predicted_class]["name"]
            predicted_type = label_map[predicted_class]["type"]
            probs = probabilities[0].cpu().numpy() * 100
        print(f"Predicción realizada: {predicted_label} ({predicted_type})")

        response = {
            "prediction": predicted_label,
            "type": predicted_type,
            "probabilities": {
                f"{info['name']} ({info['type']})": float(probs[i]) for i, info in label_map.items()
            }
        }

        conn = sqlite3.connect("database.db")
        c = conn.cursor()
        c.execute(
            "INSERT INTO predictions (user_id, image_path, prediction, type, probabilities, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (
                user_id,
                image_path,
                predicted_label,
                predicted_type,
                json.dumps(response["probabilities"]),
                datetime.now().isoformat()
            )
        )
        conn.commit()
        conn.close()
        print("Predicción guardada en la base de datos")

        return JSONResponse(content=response, status_code=200)
    
    except Exception as e:
        print(f"Error en /predict: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al procesar la imagen: {str(e)}")

@app.get("/predictions")
async def get_predictions():
    user_id = get_current_user_id()
    print(f"Cargando historial para usuario: {user_id}")
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("""
        SELECT p.image_path, p.prediction, p.type, p.probabilities, p.created_at, up.name, up.first_surname 
        FROM predictions p 
        LEFT JOIN user_profiles up ON p.user_id = up.user_id 
        WHERE p.user_id = ? 
        ORDER BY p.created_at DESC
    """, (user_id,))
    predictions = c.fetchall()
    conn.close()
    
    return [
        {
            "image_path": pred[0],
            "prediction": pred[1],
            "type": pred[2],
            "probabilities": json.loads(pred[3]),
            "created_at": pred[4],
            "user_name": f"{pred[5] or ''} {pred[6] or ''}".strip() or "Usuario"
        }
        for pred in predictions
    ]

@app.get("/profile")
async def get_profile():
    user_id = get_current_user_id()
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT name, first_surname, second_surname, birth_date, height, weight FROM user_profiles WHERE user_id = ?", (user_id,))
    profile = c.fetchone()
    conn.close()
    
    if not profile:
        return {
            "name": None,
            "first_surname": None,
            "second_surname": None,
            "birth_date": None,
            "height": None,
            "weight": None
        }
    
    return {
        "name": profile[0],
        "first_surname": profile[1],
        "second_surname": profile[2],
        "birth_date": profile[3],
        "height": profile[4],
        "weight": profile[5]
    }

@app.post("/profile")
async def update_profile(profile: UserProfile):
    user_id = get_current_user_id()
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    
    c.execute(
        "INSERT OR REPLACE INTO user_profiles (user_id, name, first_surname, second_surname, birth_date, height, weight) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            user_id,
            profile.name,
            profile.first_surname,
            profile.second_surname,
            profile.birth_date,
            profile.height,
            profile.weight
        )
    )
    conn.commit()
    conn.close()
    
    return {"message": "Perfil actualizado con éxito"}

@app.patch("/profile/weight")
async def update_weight(weight_data: UpdateWeight):
    user_id = get_current_user_id()
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    
    c.execute("INSERT OR IGNORE INTO user_profiles (user_id) VALUES (?)", (user_id,))
    c.execute("UPDATE user_profiles SET weight = ? WHERE user_id = ?", (weight_data.weight, user_id))
    conn.commit()
    conn.close()
    
    return {"message": "Peso actualizado con éxito"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
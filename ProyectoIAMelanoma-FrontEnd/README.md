# 📸🩺 Melanoma AI Detector  
**Seguimiento y detección temprana de melanomas mediante IA (Flutter + Web App)**

Este proyecto tiene como objetivo **ayudar en la detección temprana del melanoma** utilizando **inteligencia artificial** aplicada a fotografías tomadas con un dispositivo móvil.  
Mediante un modelo de lenguaje/visión (LLM multimodal), la aplicación analiza imágenes cutáneas y proporciona una clasificación preliminar, junto con un sistema de seguimiento evolutivo.

> ⚠️ **Aviso importante**: Esta herramienta **no sustituye** el diagnóstico médico profesional. Se trata de un proyecto educativo/investigador.

---

## 🧠 ¿Cómo funciona?

1. El usuario toma una fotografía de la lesión cutánea con su móvil o la sube desde su dispositivo.  
2. La imagen se procesa mediante un **modelo de IA multimodal** encargado de identificar características asociadas al melanoma u otras lesiones.  
3. El resultado ofrece:
   - Un análisis preliminar  
   - Grado estimado de riesgo  
   - Sugerencias orientativas (no médicas)  
   - Posibilidad de guardar la imagen para **seguimiento temporal**

---

## 📱🕸️ Aplicaciones disponibles

El proyecto incluye dos implementaciones:

### **1. Aplicación Móvil – Flutter**
- Multiplataforma (Android / iOS)  
- Captura directa con la cámara  
- Historial local o sincronizado  
- Interfaz optimizada para pantallas pequeñas  
- Integración con el backend de análisis  

### **2. Aplicación Web**
- Accesible desde navegador  
- Subida de imágenes y análisis inmediato  
- Vista comparativa para seguimiento  
- Panel de administración / investigación  

---

## 🗂️ Dataset utilizado: **BCN 20k**

El modelo está entrenado (o validado) usando **BCN 20k**, un conjunto de datos dermatológicos creado por la **Universitat de Barcelona**.

- Contiene más de 20.000 imágenes de lesiones cutáneas  
- Clasificadas y etiquetadas para investigación  
- Usado para:  
  - Detección de melanoma  
  - Clasificación de lesiones benignas  
  - Segmentación y análisis dermatoscópico  

📚 Más información disponible en las publicaciones oficiales de la Universidad de Barcelona.

---

## 🧬 Arquitectura del proyecto

### **Frontend**
- Flutter (versión móvil)  
- Flutter Web (versión web)

### **Backend / IA**
- Modelo multimodal de lenguaje-visión  
- API para análisis de imágenes  
- Procesamiento seguro de fotografías  
- Sistema de guardado y seguimiento

### **Estructura general**
/mobile_app_flutter
/web_app
/models
/api
/docs


---

## 🚀 Objetivos del proyecto

- Facilitar herramientas accesibles para la **detección temprana del melanoma**  
- Crear una solución híbrida (móvil + web)  
- Investigar la viabilidad de modelos LLM para el análisis dermatológico  
- Ofrecer un sistema de seguimiento longitudinal para pacientes o investigadores  

---

## ⚡ Roadmap

- [x] MVP para análisis de imágenes  
- [x] Implementación Flutter  
- [x] Versión Web funcional  
- [ ] Mejoras en UX/UI  
- [ ] Incorporación de segmentación automática  
- [ ] Pipeline de retraining con imágenes anónimas  
- [ ] Validación clínica con profesionales  

---

## 🛡️ Disclaimer

Este proyecto **no está destinado a uso clínico**.  
No proporciona diagnósticos médicos y no debe utilizarse como sustituto de una consulta profesional.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas.  
Si deseas mejorar el modelo, documentar, optimizar código o añadir funcionalidades, ¡adelante!

---

## 📄 Licencia





***** PARA INICIAR *****
- Ejecutar el script start-servers.py
- Abrir en el navegador http://localhost:8080



***** MÉTODO PARA LOSERS *****

Asegúrate de que la API esté corriendo:
Verifica que la API esté ejecutándose en http://127.0.0.1:8000. Si no está corriendo, inicia la API:

uvicorn api:app --host 127.0.0.1 --port 8000

Si la API no está corriendo, esa podría ser la razón por la que el Service Worker intentó manejar la solicitud y devolvió el mensaje de error.

Inicia el servidor local para el frontend:
Asegúrate de que el servidor local esté corriendo:

python -m http.server 8080

Prueba nuevamente:
Abre tu navegador y visita http://localhost:8080.

Inicia sesión o regístrate si es necesario.

Sube una imagen y haz clic en "Predecir".

Ahora deberías ver los resultados de la predicción sin el error de JSON.



la interfaz ha cambiado, quiero que me proporciones la misma interfaz que habia antes, cambia index, registerm, style o lo que haga falta, pero quiero la interfaz que teniamos hace una hora, manteniendo todas las funcionalidades actualizadas. ademas quiero que me hagas un script o ejecutable para iniciar la web sin tener que hacer uvicorn api:app --host 127.0.0.1 --port 8000 y python -m http.server 8080 cada vez



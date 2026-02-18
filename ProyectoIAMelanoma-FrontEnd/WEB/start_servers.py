import subprocess
import sys
import os
from threading import Thread
import time
import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def run_uvicorn():
    port = 8000
    if is_port_in_use(port):
        print(f"ERROR: El puerto {port} ya está en uso. Por favor, cierra la aplicación que lo usa.")
        return
    print("Iniciando el backend (uvicorn)...")
    try:
        subprocess.run([sys.executable, "-m", "uvicorn", "api:app", "--host", "127.0.0.1", "--port", str(port)])
    except Exception as e:
        print(f"Error al iniciar uvicorn: {e}")

def run_http_server():
    port = 8080
    if is_port_in_use(port):
        print(f"ERROR: El puerto {port} ya está en uso. Por favor, cierra la aplicación que lo usa.")
        return
    print("Iniciando el frontend (http.server manejado manualmente)...")
    
    # Change directory to the folder containing this script (and the web files)
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    import http.server
    import socketserver
    
    Handler = http.server.SimpleHTTPRequestHandler
    # Explicitly map .css to text/css just in case
    Handler.extensions_map['.css'] = 'text/css'
    
    try:
        with socketserver.TCPServer(("0.0.0.0", port), Handler) as httpd:
            print(f"Frontend servido en http://localhost:{port}")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error al iniciar el servidor HTTP: {e}")

def main():
    # Iniciar el backend en un hilo separado
    uvicorn_thread = Thread(target=run_uvicorn)
    uvicorn_thread.start()

    # Dar un momento para que el backend se inicie
    time.sleep(2)

    # Iniciar el frontend en otro hilo
    http_server_thread = Thread(target=run_http_server)
    http_server_thread.start()

    # Esperar a que ambos hilos terminen
    uvicorn_thread.join()
    http_server_thread.join()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nDeteniendo los servidores...")
        os._exit(0)
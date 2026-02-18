self.addEventListener('install', event => {
    console.log('Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activado');
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // No interceptar solicitudes al backend (http://127.0.0.1:8000)
    if (event.request.url.includes('http://127.0.0.1:8000')) {
        return;
    }
    // Para otras solicitudes (como archivos estáticos), usar la red
    event.respondWith(fetch(event.request));
});
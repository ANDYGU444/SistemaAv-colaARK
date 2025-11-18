// Service Worker CORREGIDO - 100% funcional
const CACHE_NAME = 'avicola-app-v3.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/transacciones.html',
    '/produccion.html', 
    '/inventario.html',
    '/compradores.html',
    '/styles/backup.css',
    '/styles/mobile.css',
    '/js/exportador.js',
    '/js/main.js',
    // ELIMINA esta línea ↓
    // '/js/app.js',
    '/manifest.json',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalar
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Service Worker: Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker: Todos los recursos cacheados');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Error cacheando:', error);
            })
    );
});

// Activar
self.addEventListener('activate', (event) => {
    console.log('🎉 Service Worker: Activado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Eliminando cache viejo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch
self.addEventListener('fetch', (event) => {
    // No cachear requests de analytics o APIs externas
    if (event.request.url.includes('google-analytics') || 
        event.request.url.includes('api.')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devuelve el recurso cacheado si existe
                if (response) {
                    return response;
                }

                // Clona el request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then((response) => {
                        // Verifica si la respuesta es válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clona la respuesta
                        const responseToCache = response.clone();

                        // Cachea el nuevo recurso
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Fallback para páginas
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});
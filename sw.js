
const CACHE_NAME = 'maderas-dr-cache-v2'; // Increment version to force update
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/icon-192.png',
    '/icon-512.png',
    '/db.js', // <-- Add the database script
    '/productos-data.js', // <-- Add the data script
    '/logo.png',
    '/manifest.json'
    // Add cotizador.html and its scripts if you want that page to work offline too
    // '/cotizador.html',
    // '/cotizador-style.css',
    // '/cotizador-script.js'
];

// --- Evento de Instalación ---
// Se abre el caché y se añaden los archivos del app shell.
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache abierto, añadiendo app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// --- Evento de Activación ---
// Limpia cachés antiguos para evitar conflictos.
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// --- Evento Fetch ---
// Decide cómo responder a las peticiones: desde el caché o desde la red.
self.addEventListener('fetch', function(event) {
    event.respondWith(
        // 1. Intenta encontrar la petición en el caché
        caches.match(event.request)
            .then(function(response) {
                // 2. Si se encuentra en el caché, la devuelve.
                // Si no, la busca en la red.
                return response || fetch(event.request);
            })
    );
});

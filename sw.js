// B2B Loterias - Service Worker Estável v3.0
// SEM loop de reload, SEM auto-destruição

var CACHE_NAME = 'b2b-loterias-v4';

self.addEventListener('install', function(event) {
    console.log('[SW] Instalado - versão estável');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('[SW] Ativado');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function(name) { return name !== CACHE_NAME; })
                    .map(function(name) { return caches.delete(name); })
            );
        }).then(function() {
            // NUNCA forçar navigate/reload nas páginas
            return self.clients.claim();
        })
    );
});

// Estratégia: rede primeiro, cache como fallback
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request, { cache: 'no-store' })
            .catch(function() {
                return caches.match(event.request);
            })
    );
});

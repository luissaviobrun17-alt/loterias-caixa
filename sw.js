// ═══ B2B Loterias — Service Worker AUTO-DESTRUIÇÃO ═══
// Este SW se auto-desregistra e limpa todos os caches
// para resolver o problema de cache stale

self.addEventListener('install', function(event) {
    console.log('[SW] AUTO-DESTRUIÇÃO: Pulando espera...');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('[SW] AUTO-DESTRUIÇÃO: Limpando caches e desregistrando...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    console.log('[SW] Deletando cache: ' + cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(function() {
            console.log('[SW] Todos os caches deletados! Desregistrando...');
            return self.registration.unregister();
        }).then(function() {
            console.log('[SW] DESREGISTRADO com sucesso!');
            return self.clients.matchAll();
        }).then(function(clients) {
            // Forçar reload em todos os clientes
            clients.forEach(function(client) {
                client.navigate(client.url);
            });
        })
    );
});

// Qualquer fetch vai direto para a rede (sem cache)
self.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request));
});

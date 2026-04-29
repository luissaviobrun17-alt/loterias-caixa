// ═══ B2B Loterias — Service Worker NUCLEAR RESET v2.0 ═══
// MISSÃO: Destruir TODO cache e forçar reload da rede

var CACHE_VERSION = 'v-DESTROY-ALL-' + Date.now();

self.addEventListener('install', function(event) {
    console.log('[SW-NUCLEAR] INSTALANDO — vai destruir todo cache');
    self.skipWaiting(); // Ativa imediatamente
});

self.addEventListener('activate', function(event) {
    console.log('[SW-NUCLEAR] ATIVANDO — limpando TUDO');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    console.log('[SW-NUCLEAR] DELETANDO cache: ' + cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(function() {
            console.log('[SW-NUCLEAR] TODOS os caches DESTRUÍDOS!');
            // Tomar controle de todas as páginas
            return self.clients.claim();
        }).then(function() {
            return self.clients.matchAll();
        }).then(function(clients) {
            console.log('[SW-NUCLEAR] Forçando reload em ' + clients.length + ' abas');
            clients.forEach(function(client) {
                client.navigate(client.url);
            });
            // Auto-destruição final
            return self.registration.unregister();
        }).then(function() {
            console.log('[SW-NUCLEAR] SERVICE WORKER DESREGISTRADO! Cache LIMPO!');
        })
    );
});

// TUDO vai direto pra rede — ZERO cache
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request, { cache: 'no-store' }).catch(function() {
            return caches.match(event.request);
        })
    );
});

// ╔══════════════════════════════════════════════════════════╗
// ║  B2B Loterias — Service Worker (PWA Offline)            ║
// ║  Versão: 10.0                                           ║
// ╚══════════════════════════════════════════════════════════╝

const CACHE_NAME = 'b2b-loterias-v10';
const ASSETS_TO_CACHE = [
    '/loterias-caixa/',
    '/loterias-caixa/index.html',
    '/loterias-caixa/styles/main.css',
    '/loterias-caixa/styles/components.css',
    '/loterias-caixa/styles/lottery.css',
    '/loterias-caixa/styles/responsive.css',
    '/loterias-caixa/js/engines/games.js',
    '/loterias-caixa/js/data/history_db.js',
    '/loterias-caixa/js/stats.js',
    '/loterias-caixa/js/engines/combinations.js',
    '/loterias-caixa/js/engines/quantum.js',
    '/loterias-caixa/js/engines/quantum_god_mode.js',
    '/loterias-caixa/js/engines/smart_bets.js',
    '/loterias-caixa/js/ui.js',
    '/loterias-caixa/js/main.js',
    '/loterias-caixa/js/license.js',
    '/loterias-caixa/img/logo_atom.png',
    '/loterias-caixa/manifest.json'
];

// Instalar: cachear todos os assets
self.addEventListener('install', event => {
    console.log('[SW] Instalando B2B Loterias PWA v10...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.warn('[SW] Erro ao cachear (continuando):', err);
                return self.skipWaiting();
            })
    );
});

// Ativar: limpar caches antigos
self.addEventListener('activate', event => {
    console.log('[SW] Ativando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Removendo cache antigo:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Network First para APIs, Cache First para assets
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // APIs da Caixa — sempre tentar rede primeiro
    if (url.hostname.includes('caixa.gov.br') || url.hostname.includes('loteriascaixa')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cachear resposta da API
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Sem rede — usar cache
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Assets estáticos — Cache First
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(response => {
                    // Cachear novos requests
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
            .catch(() => {
                // Fallback para página principal
                if (event.request.mode === 'navigate') {
                    return caches.match('/loterias-caixa/');
                }
            })
    );
});

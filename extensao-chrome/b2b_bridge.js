// ═══════════════════════════════════════════════════════════════
// B2B LOTERIAS → BRIDGE: Captura jogos e envia para a extensão
// Roda no site do B2B Loterias (127.0.0.1:8080)
// FIX: Sem window.open() — evita 403 Akamai WAF (Referer: localhost)
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';

    document.documentElement.setAttribute('data-b2b-extension-active', 'true');
    window.__B2B_EXTENSION_ACTIVE__ = true;

    // Escuta o evento customizado do B2B quando o user clica APOSTE ONLINE
    document.addEventListener('b2b-aposte-online', function(e) {
        const data = e.detail;
        if (!data || !data.games || !data.config) {
            console.warn('[B2B Extension] Dados inválidos recebidos');
            return;
        }

        console.log('[B2B Extension] 📦 ' + data.games.length + ' jogos de ' + data.config.name);

        // Salva os jogos no storage da extensão
        chrome.storage.local.set({
            b2b_games: data.games,
            b2b_config: data.config,
            b2b_timestamp: Date.now()
        }, function() {
            console.log('[B2B Extension] ✅ Jogos salvos! Aguardando usuário abrir a Caixa.');

            // Notifica a página que os jogos foram salvos com sucesso
            // (A página B2B mostrará o painel com o link para o usuário clicar manualmente)
            document.dispatchEvent(new CustomEvent('b2b-jogos-salvos', {
                detail: {
                    count: data.games.length,
                    config: data.config,
                    url: 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + (data.config.url || 'mega-sena')
                }
            }));
        });

        // NÃO chamamos window.open() aqui.
        // O Akamai WAF bloqueia abas abertas programaticamente com Referer: localhost.
        // O usuário clica no link manualmente no painel B2B → sem bloqueio.
    });
})();

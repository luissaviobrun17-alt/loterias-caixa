// ═══════════════════════════════════════════════════════════════
// B2B LOTERIAS → BRIDGE: Captura jogos e envia para a extensão
// Roda no site do B2B Loterias (127.0.0.1:8080)
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';
    
    console.log('[B2B Extension] 🔌 Bridge ativo no B2B Loterias');

    // Escuta o evento customizado do B2B quando o user clica APOSTE ONLINE
    document.addEventListener('b2b-aposte-online', function(e) {
        const data = e.detail;
        if (!data || !data.games || !data.config) {
            console.warn('[B2B Extension] Dados inválidos recebidos');
            return;
        }

        console.log('[B2B Extension] 📦 Recebendo ' + data.games.length + ' jogos de ' + data.config.name);

        // Salva os jogos no storage da extensão
        chrome.storage.local.set({
            b2b_games: data.games,
            b2b_config: data.config,
            b2b_timestamp: Date.now()
        }, function() {
            console.log('[B2B Extension] ✅ ' + data.games.length + ' jogos salvos! Abrindo Caixa...');
            
            // Abre o site da Caixa
            const url = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + data.config.url;
            window.open(url, '_blank');
        });
    });
})();

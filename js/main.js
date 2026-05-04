// Global UI usage

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Garantir prêmios visíveis IMEDIATAMENTE na inicialização (fallback offline)
        var gameKeys = ['megasena', 'lotofacil', 'quina', 'duplasena', 'lotomania', 'timemania', 'diadesorte'];
        gameKeys.forEach(function(key) {
            var game = typeof GAMES !== 'undefined' ? GAMES[key] : null;
            if (game && game.estimatedPrizeFallback) {
                var navElem = document.getElementById('prize-nav-' + key);
                if (navElem && (navElem.textContent === '--' || navElem.textContent.trim() === '')) {
                    var amount = game.estimatedPrizeFallback;
                    if (amount >= 1000000) {
                        navElem.textContent = 'R$ ' + (amount / 1000000).toFixed(1).replace('.', ',') + ' M';
                    } else if (amount >= 1000) {
                        navElem.textContent = 'R$ ' + (amount / 1000).toFixed(0) + 'K';
                    }
                }
            }
        });

        // Mostrar prêmio principal (Mega Sena = jogo padrão)
        var prizeDisplay = document.getElementById('prize-display');
        var prizeValue = document.getElementById('prize-value');
        if (prizeDisplay && prizeValue) {
            var megaFallback = typeof GAMES !== 'undefined' && GAMES.megasena ? GAMES.megasena.estimatedPrizeFallback : 30000000;
            prizeValue.textContent = megaFallback.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
            prizeDisplay.style.display = 'block';
        }

        var ui = new UI();
        ui.initEvents();
        ui.updateGameInfo('megasena');
        ui.addInstallButton();

        // ══════════════════════════════════════════════
        // AUTO UPDATER — Atualizar dados automaticamente
        // ══════════════════════════════════════════════
        if (typeof AutoUpdater !== 'undefined') {
            // Delay de 500ms para garantir que UI está pronta
            setTimeout(function() {
                AutoUpdater.init();
                // Nota: O AutoUpdater já atualiza prêmios e countdown diretamente.
                // NÃO chamar updateGameInfo() no evento pois ele reseta seleções e jogos.
            }, 500);
        }

    } catch(e) {
        alert('ERRO B2B: ' + e.message + '\n\nLinha: ' + (e.stack || ''));
    }
});

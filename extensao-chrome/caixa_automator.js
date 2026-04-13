// ═══════════════════════════════════════════════════════════════
// CAIXA AUTOMATOR: Preenche apostas automaticamente
// Roda no site da Caixa Loterias Online  
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // Verifica se existem jogos pendentes
    chrome.storage.local.get(['b2b_games', 'b2b_config', 'b2b_timestamp'], function(data) {
        if (!data.b2b_games || !data.b2b_config) {
            return; // Nada para fazer
        }

        // Verificar se os dados são recentes (máximo 10 minutos)
        const age = Date.now() - (data.b2b_timestamp || 0);
        if (age > 10 * 60 * 1000) {
            console.log('[B2B Auto] ⏳ Dados expirados, ignorando');
            chrome.storage.local.remove(['b2b_games', 'b2b_config', 'b2b_timestamp']);
            return;
        }

        const games = data.b2b_games;
        const config = data.b2b_config;

        console.log('[B2B Auto] 🎯 ' + games.length + ' jogos de ' + config.name + ' detectados!');

        // Mostrar painel de status flutuante
        showStatusPanel(games.length, config.name);

        // Esperar a página carregar completamente (Angular/SPA precisa de tempo)
        waitForGrid(function() {
            console.log('[B2B Auto] ✅ Grid detectado! Iniciando preenchimento...');
            updateStatus('Preenchendo jogos...', 'running');
            fillGames(games, config);
        });
    });

    function waitForGrid(callback, attempts) {
        attempts = attempts || 0;
        if (attempts > 30) {
            updateStatus('❌ Grid não encontrado. Recarregue a página.', 'error');
            return;
        }

        // Procurar por elementos numéricos do volante
        var grid = document.querySelector('#n01, a#n01, [id^="n0"]');
        if (!grid) {
            // Tentar seletores alternativos
            var allBtns = document.querySelectorAll('.number, .dezena, .num, [class*=number]');
            if (allBtns.length > 5) {
                grid = allBtns[0];
            }
        }

        if (grid) {
            // Grid encontrado, esperar mais um pouco para estabilizar
            setTimeout(callback, 2000);
        } else {
            setTimeout(function() {
                waitForGrid(callback, attempts + 1);
            }, 2000);
        }
    }

    function showStatusPanel(count, name) {
        var panel = document.createElement('div');
        panel.id = 'b2b-status-panel';
        panel.style.cssText = 'position:fixed;top:10px;right:10px;z-index:999999;background:linear-gradient(135deg,#0F172A,#1E293B);color:white;padding:16px 20px;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:1px solid #22C55E40;min-width:280px;';
        panel.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
            '<span style="font-size:20px;">🎰</span>' +
            '<span style="font-weight:800;color:#22C55E;">B2B Loterias</span>' +
            '</div>' +
            '<div id="b2b-status-text" style="color:#E2E8F0;font-size:13px;">Preparando ' + count + ' jogos de ' + name + '...</div>' +
            '<div id="b2b-progress" style="margin-top:8px;height:4px;background:#334155;border-radius:4px;overflow:hidden;">' +
            '<div id="b2b-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#22C55E,#16A34A);transition:width 0.3s;border-radius:4px;"></div>' +
            '</div>' +
            '<div id="b2b-progress-text" style="color:#94A3B8;font-size:11px;margin-top:4px;">0/' + count + '</div>';
        document.body.appendChild(panel);
    }

    function updateStatus(text, type) {
        var el = document.getElementById('b2b-status-text');
        if (el) {
            el.textContent = text;
            if (type === 'done') el.style.color = '#22C55E';
            if (type === 'error') el.style.color = '#EF4444';
        }
    }

    function updateProgress(current, total) {
        var bar = document.getElementById('b2b-progress-bar');
        var text = document.getElementById('b2b-progress-text');
        if (bar) bar.style.width = (current / total * 100) + '%';
        if (text) text.textContent = current + '/' + total;
    }

    async function fillGames(games, config) {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
        var total = games.length;

        for (var i = 0; i < total; i++) {
            var jogo = games[i];
            updateStatus('Jogo ' + (i + 1) + '/' + total + ' — preenchendo...', 'running');
            updateProgress(i, total);

            // Limpar volante se não for o primeiro jogo
            if (i > 0) {
                limparVolante();
                await delay(500);
            }

            // Clicar em cada número
            for (var j = 0; j < jogo.length; j++) {
                clicarNumero(jogo[j]);
                await delay(120);
            }

            // Esperar e colocar no carrinho
            await delay(600);
            colocarNoCarrinho();
            
            if (i < total - 1) {
                await delay(2500);
            }
        }

        updateProgress(total, total);
        updateStatus('✅ PRONTO! ' + total + ' jogos de ' + config.name + ' no carrinho!', 'done');
        
        // Limpar dados usados
        chrome.storage.local.remove(['b2b_games', 'b2b_config', 'b2b_timestamp']);

        // Alerta final
        setTimeout(function() {
            alert('🎉 Pronto! ' + total + ' jogos de ' + config.name + ' no carrinho!\n\nFinalize o pagamento.');
        }, 500);
    }

    function clicarNumero(num) {
        var id = 'n' + String(num).padStart(2, '0');
        var el = document.querySelector('#' + id) || document.querySelector('a#' + id);
        if (el) { el.click(); return true; }
        
        var allNums = document.querySelectorAll('.number, .dezena, .num, [class*=number]');
        for (var k = 0; k < allNums.length; k++) {
            var txt = allNums[k].textContent.trim();
            if (txt === String(num).padStart(2, '0') || txt === String(num)) {
                allNums[k].click();
                return true;
            }
        }
        console.warn('[B2B Auto] Número ' + num + ' não encontrado');
        return false;
    }

    function colocarNoCarrinho() {
        var btn = document.querySelector('#colocarnocarrinho') || document.querySelector('[id*=carrinho]');
        if (btn) { btn.click(); return; }
        var allBtns = document.querySelectorAll('button');
        for (var k = 0; k < allBtns.length; k++) {
            if (allBtns[k].textContent.toLowerCase().includes('carrinho')) {
                allBtns[k].click();
                return;
            }
        }
    }

    function limparVolante() {
        var btn = document.querySelector('#limparvolante') || document.querySelector('[id*=limpar]');
        if (btn) { btn.click(); return; }
        var allBtns = document.querySelectorAll('button');
        for (var k = 0; k < allBtns.length; k++) {
            if (allBtns[k].textContent.toLowerCase().includes('limpar')) {
                allBtns[k].click();
                return;
            }
        }
    }
})();

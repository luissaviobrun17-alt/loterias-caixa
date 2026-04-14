// ═══════════════════════════════════════════════════════════════
// CAIXA AUTOMATOR v5.0: Preenche apostas automaticamente
// Roda no site da Caixa Loterias Online  
// Com auto-fechamento de modais e delays otimizados
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // Verifica se existem jogos pendentes
    chrome.storage.local.get(['b2b_games', 'b2b_config', 'b2b_timestamp'], function(data) {
        if (!data.b2b_games || !data.b2b_config) {
            return; // Nada para fazer
        }

        // Verificar se os dados são recentes (máximo 30 minutos)
        const age = Date.now() - (data.b2b_timestamp || 0);
        if (age > 30 * 60 * 1000) {
            console.log('[B2B v5.0] ⏳ Dados expirados, ignorando');
            chrome.storage.local.remove(['b2b_games', 'b2b_config', 'b2b_timestamp']);
            return;
        }

        const games = data.b2b_games;
        const config = data.b2b_config;

        console.log('[B2B v5.0] 🎯 ' + games.length + ' jogos de ' + config.name + ' detectados!');

        // Mostrar painel de status flutuante
        showStatusPanel(games.length, config.name);

        // Esperar a página carregar completamente (Angular/SPA precisa de tempo)
        waitForGrid(function() {
            console.log('[B2B v5.0] ✅ Grid detectado! Iniciando preenchimento...');
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
            setTimeout(callback, 3000);
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
            '<span style="font-weight:800;color:#22C55E;">B2B Loterias v5.0</span>' +
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

    // ═══ FECHAR MODAIS DA CAIXA (IDs exatos) ═══
    function fecharModais() {
        // IDs específicos dos botões de fechar modais da Caixa
        var ids = ["fecharModalAlerta", "fecharModalErro", "fecharModalInfo", "confirmarModalConfirmacao"];
        for (var k = 0; k < ids.length; k++) {
            var el = document.getElementById(ids[k]);
            if (el && el.offsetParent !== null) {
                try {
                    el.click();
                    console.log('[B2B v5.0] Modal fechado: ' + ids[k]);
                } catch(e) {}
            }
        }
        // Fallback: botões genéricos OK/Fechar/Confirmar
        var bts = document.querySelectorAll("button");
        for (var j = 0; j < bts.length; j++) {
            var t = bts[j].textContent.trim().toLowerCase();
            if ((t === "ok" || t === "entendi" || t === "fechar" || t === "confirmar" || t === "sim") && 
                bts[j].offsetParent !== null && bts[j].offsetWidth > 0) {
                try { bts[j].click(); } catch(e) {}
            }
        }
    }

    async function fillGames(games, config) {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
        var total = games.length;
        var ok = 0;
        var erros = 0;

        for (var i = 0; i < total; i++) {
            var jogo = games[i];
            updateStatus('Jogo ' + (i + 1) + '/' + total + ' — preenchendo...', 'running');
            updateProgress(i, total);

            // Fechar modais antes de cada jogo
            fecharModais();

            // Limpar volante se não for o primeiro jogo
            if (i > 0) {
                limparVolante();
                await delay(2000);
                fecharModais();
                await delay(500);
            }

            // Clicar em cada número
            var acertos = 0;
            for (var j = 0; j < jogo.length; j++) {
                if (clicarNumero(jogo[j])) acertos++;
                await delay(250);
            }

            if (acertos < jogo.length) {
                console.warn('[B2B v5.0] Jogo ' + (i+1) + ': ' + acertos + '/' + jogo.length + ' números');
            }

            // Esperar e colocar no carrinho (com retry)
            await delay(1000);
            var cartOk = await colocarNoCarrinhoComRetry();
            
            if (cartOk) {
                ok++;
                console.log('[B2B v5.0] ✅ Jogo ' + (i+1) + ' OK (' + ok + '/' + total + ')');
            } else {
                erros++;
                console.error('[B2B v5.0] ❌ Jogo ' + (i+1) + ' FALHOU');
            }
            
            if (i < total - 1) {
                await delay(3000);
                fecharModais();
            }

            // Log de progresso a cada 10 jogos
            if ((i + 1) % 10 === 0) {
                console.log('[B2B v5.0] Progresso: ' + (i+1) + '/' + total + ' (' + Math.round((i+1)/total*100) + '%)');
            }
        }

        updateProgress(total, total);
        updateStatus('✅ ' + ok + '/' + total + ' jogos de ' + config.name + ' no carrinho!', 'done');
        
        // Limpar dados usados
        chrome.storage.local.remove(['b2b_games', 'b2b_config', 'b2b_timestamp']);

        // Alerta final
        setTimeout(function() {
            alert('[B2B v5.0] ' + ok + '/' + total + ' jogos de ' + config.name + ' no carrinho!' + 
                  (erros > 0 ? '\n' + erros + ' com erro.' : '') + 
                  '\nFinalize o pagamento.');
        }, 500);
    }

    function clicarNumero(num) {
        var id = 'n' + String(num).padStart(2, '0');
        var el = document.querySelector('#' + id) || document.querySelector('a#' + id);
        if (el) { el.click(); return true; }
        
        // Tentativa por role=button
        var todos = document.querySelectorAll('a[role=button]');
        for (var k = 0; k < todos.length; k++) {
            if (todos[k].textContent.trim() === String(num).padStart(2, '0')) {
                todos[k].click();
                return true;
            }
        }

        // Tentativa genérica
        var allNums = document.querySelectorAll('.number, .dezena, .num, [class*=number]');
        for (var k2 = 0; k2 < allNums.length; k2++) {
            var txt = allNums[k2].textContent.trim();
            if (txt === String(num).padStart(2, '0') || txt === String(num)) {
                allNums[k2].click();
                return true;
            }
        }
        console.warn('[B2B v5.0] Número ' + num + ' não encontrado');
        return false;
    }

    // Colocar no carrinho COM retry e fechamento de modais
    async function colocarNoCarrinhoComRetry() {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
        
        fecharModais();
        await delay(300);

        for (var t = 0; t < 5; t++) {
            var btn = document.getElementById('colocarnocarrinho');
            if (btn) {
                btn.click();
                await delay(1500);
                fecharModais();
                await delay(500);
                fecharModais();
                return true;
            }
            
            // Buscar por texto
            var allBtns = document.querySelectorAll('button');
            for (var k = 0; k < allBtns.length; k++) {
                var txt = allBtns[k].textContent.toLowerCase();
                if (txt.includes('colocar no carrinho') || 
                    (txt.includes('carrinho') && !txt.includes('ir para'))) {
                    allBtns[k].click();
                    await delay(1500);
                    fecharModais();
                    await delay(500);
                    fecharModais();
                    return true;
                }
            }
            
            console.warn('[B2B v5.0] Carrinho tentativa ' + (t+1) + '/5');
            await delay(1000);
            fecharModais();
        }
        return false;
    }

    function limparVolante() {
        fecharModais();
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

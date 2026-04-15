// ═══════════════════════════════════════════════════════════════
// CAIXA AUTOMATOR v6.0: Preenche apostas automaticamente
// Roda no site da Caixa Loterias Online  
// Com fechamento de modal de idade, modais internos e retry 
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';

    console.log('[B2B v6.0] 🔌 Automator carregado em: ' + window.location.href);

    // ═══ 1. FECHAR MODAL DE IDADE (PRIMEIRA BARREIRA) ═══
    function fecharModalIdade() {
        // ID exato do botão "Sim" no modal "Você tem mais de 18 anos?"
        var btnSim = document.getElementById('botaosim');
        if (btnSim && btnSim.offsetParent !== null) {
            btnSim.click();
            console.log('[B2B v6.0] ✅ Modal de idade fechado (botaosim)');
            return true;
        }
        // Fallback: buscar por texto
        var bts = document.querySelectorAll('button, a');
        for (var i = 0; i < bts.length; i++) {
            var t = bts[i].textContent.trim().toLowerCase();
            if (t === 'sim' && bts[i].offsetParent !== null && bts[i].offsetWidth > 10) {
                bts[i].click();
                console.log('[B2B v6.0] ✅ Modal de idade fechado (fallback "Sim")');
                return true;
            }
        }
        return false;
    }

    // Auto-fechar modal de idade ao carregar
    var idadeInterval = setInterval(function() {
        if (fecharModalIdade()) {
            clearInterval(idadeInterval);
        }
    }, 1000);
    // Parar de tentar após 15 segundos
    setTimeout(function() { clearInterval(idadeInterval); }, 15000);

    // ═══ 2. VERIFICAR SE TEM JOGOS PENDENTES ═══
    chrome.storage.local.get(['b2b_games', 'b2b_config', 'b2b_timestamp'], function(data) {
        if (!data.b2b_games || !data.b2b_config) {
            console.log('[B2B v6.0] Nenhum jogo pendente.');
            return;
        }

        // Verificar se os dados são recentes (máximo 60 minutos)
        var age = Date.now() - (data.b2b_timestamp || 0);
        if (age > 60 * 60 * 1000) {
            console.log('[B2B v6.0] ⏳ Dados expirados (' + Math.round(age/60000) + ' min), ignorando');
            chrome.storage.local.remove(['b2b_games', 'b2b_config', 'b2b_timestamp']);
            return;
        }

        var games = data.b2b_games;
        var config = data.b2b_config;

        console.log('[B2B v6.0] 🎯 ' + games.length + ' jogos de ' + config.name + ' detectados!');

        // Mostrar painel de status flutuante
        showStatusPanel(games.length, config.name);

        // Esperar a página carregar (incluindo fechar modal de idade)
        waitForGrid(function() {
            console.log('[B2B v6.0] ✅ Grid detectado! Iniciando em 2s...');
            updateStatus('Grid encontrado! Iniciando...', 'running');
            setTimeout(function() {
                fillGames(games, config);
            }, 2000);
        });
    });

    // ═══ 3. ESPERAR GRID DO VOLANTE ═══
    function waitForGrid(callback, attempts) {
        attempts = attempts || 0;
        if (attempts > 60) { // 2 minutos de tentativas
            updateStatus('❌ Grid não encontrado após 2min. Recarregue.', 'error');
            return;
        }

        // Fechar modal de idade se ainda estiver aberto
        fecharModalIdade();

        // Procurar números do volante
        var grid = document.querySelector('#n01') || 
                   document.querySelector('a#n01') || 
                   document.querySelector('[id="n01"]');
        
        if (!grid) {
            // Tentar seletores alternativos
            var ids = ['n02','n03','n05','n10'];
            for (var k = 0; k < ids.length; k++) {
                grid = document.getElementById(ids[k]);
                if (grid) break;
            }
        }

        if (grid) {
            // Grid encontrado! Esperar estabilizar
            console.log('[B2B v6.0] 📍 Grid encontrado (tentativa ' + (attempts + 1) + ')');
            setTimeout(callback, 2000);
        } else {
            if (attempts % 10 === 0) {
                console.log('[B2B v6.0] ⏳ Aguardando grid... tentativa ' + (attempts + 1));
            }
            setTimeout(function() {
                waitForGrid(callback, attempts + 1);
            }, 2000);
        }
    }

    // ═══ 4. PAINEL DE STATUS FLUTUANTE ═══
    function showStatusPanel(count, name) {
        // Remover painel anterior se existir
        var old = document.getElementById('b2b-status-panel');
        if (old) old.remove();

        var panel = document.createElement('div');
        panel.id = 'b2b-status-panel';
        panel.style.cssText = 'position:fixed;top:10px;right:10px;z-index:999999;background:linear-gradient(135deg,#0F172A,#1E293B);color:white;padding:16px 20px;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:1px solid #22C55E40;min-width:300px;max-width:400px;';
        panel.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
            '<span style="font-size:20px;">🎰</span>' +
            '<span style="font-weight:800;color:#22C55E;">B2B Loterias v6.0</span>' +
            '<span style="margin-left:auto;cursor:pointer;font-size:16px;color:#94A3B8;" onclick="this.parentElement.parentElement.remove()" title="Fechar">✕</span>' +
            '</div>' +
            '<div id="b2b-status-text" style="color:#E2E8F0;font-size:13px;">Preparando ' + count + ' jogos de ' + name + '...</div>' +
            '<div id="b2b-progress" style="margin-top:8px;height:4px;background:#334155;border-radius:4px;overflow:hidden;">' +
            '<div id="b2b-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#22C55E,#16A34A);transition:width 0.3s;border-radius:4px;"></div>' +
            '</div>' +
            '<div id="b2b-progress-text" style="color:#94A3B8;font-size:11px;margin-top:4px;">0/' + count + '</div>' +
            '<div id="b2b-log" style="margin-top:8px;max-height:120px;overflow-y:auto;font-size:11px;font-family:monospace;color:#94A3B8;background:rgba(0,0,0,0.3);padding:6px;border-radius:6px;display:none;"></div>';
        document.body.appendChild(panel);
    }

    function updateStatus(text, type) {
        var el = document.getElementById('b2b-status-text');
        if (el) {
            el.textContent = text;
            if (type === 'done') el.style.color = '#22C55E';
            if (type === 'error') el.style.color = '#EF4444';
            if (type === 'running') el.style.color = '#E2E8F0';
        }
    }

    function updateProgress(current, total) {
        var bar = document.getElementById('b2b-progress-bar');
        var text = document.getElementById('b2b-progress-text');
        if (bar) bar.style.width = (current / total * 100) + '%';
        if (text) text.textContent = current + '/' + total;
    }

    function addLog(msg) {
        var log = document.getElementById('b2b-log');
        if (log) {
            log.style.display = 'block';
            log.innerHTML += msg + '<br>';
            log.scrollTop = log.scrollHeight;
        }
        console.log('[B2B v6.0] ' + msg);
    }

    // ═══ 5. FECHAR TODOS OS MODAIS DA CAIXA ═══
    function fecharModais() {
        var fechados = 0;
        
        // IDs específicos dos botões de fechar modais
        var ids = [
            'fecharModalAlerta', 'fecharModalErro', 'fecharModalInfo',
            'confirmarModalConfirmacao', 'botaosim',
            'btnFecharModal', 'btnOk', 'btnConfirmar'
        ];
        for (var k = 0; k < ids.length; k++) {
            var el = document.getElementById(ids[k]);
            if (el && el.offsetParent !== null && el.offsetWidth > 0) {
                try {
                    el.click();
                    fechados++;
                    console.log('[B2B v6.0] Modal fechado: ' + ids[k]);
                } catch(e) {}
            }
        }

        // Botões genéricos OK/Fechar/Confirmar/Entendi/Sim
        var bts = document.querySelectorAll('button');
        for (var j = 0; j < bts.length; j++) {
            var t = bts[j].textContent.trim().toLowerCase();
            if ((t === 'ok' || t === 'entendi' || t === 'fechar' || t === 'confirmar' || t === 'sim' || t === 'continuar') &&
                bts[j].offsetParent !== null && bts[j].offsetWidth > 0 && bts[j].offsetHeight > 0) {
                // Não fechar o botão do carrinho por acidente
                var isBtnCarrinho = bts[j].id && bts[j].id.toLowerCase().includes('carrinho');
                if (!isBtnCarrinho) {
                    try { bts[j].click(); fechados++; } catch(e) {}
                }
            }
        }

        // Fechar overlays/backdrop de modal
        var overlays = document.querySelectorAll('.modal-backdrop, .cdk-overlay-backdrop');
        for (var m = 0; m < overlays.length; m++) {
            try { overlays[m].click(); } catch(e) {}
        }

        return fechados;
    }

    // ═══ 6. PREENCHER JOGOS ═══
    async function fillGames(games, config) {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
        var total = games.length;
        var ok = 0;
        var erros = 0;

        addLog('🎬 Iniciando ' + total + ' jogos de ' + config.name);

        for (var i = 0; i < total; i++) {
            var jogo = games[i];
            updateStatus('Jogo ' + (i + 1) + '/' + total + ' — preenchendo [' + jogo.join(',') + ']', 'running');
            updateProgress(i, total);

            // Fechar qualquer modal antes
            fecharModais();
            await delay(500);

            // Limpar volante (exceto primeiro jogo)
            if (i > 0) {
                var limped = limparVolante();
                addLog('🧹 Limpar: ' + (limped ? 'OK' : 'SKIP'));
                await delay(2500);
                fecharModais();
                await delay(500);
            }

            // Clicar em cada número
            var acertos = 0;
            for (var j = 0; j < jogo.length; j++) {
                if (clicarNumero(jogo[j])) {
                    acertos++;
                } else {
                    addLog('⚠️ Num ' + jogo[j] + ' não achado');
                }
                await delay(300); // delay entre cliques
            }

            addLog('🔢 Jogo ' + (i+1) + ': ' + acertos + '/' + jogo.length + ' números');

            if (acertos < jogo.length) {
                addLog('⚠️ Jogo ' + (i+1) + ': faltaram ' + (jogo.length - acertos) + ' números');
            }

            // Esperar e colocar no carrinho
            await delay(1500);
            fecharModais();
            await delay(500);
            
            var cartOk = await colocarNoCarrinhoComRetry();

            if (cartOk) {
                ok++;
                addLog('✅ Jogo ' + (i+1) + ' → carrinho (' + ok + '/' + total + ')');
            } else {
                erros++;
                addLog('❌ Jogo ' + (i+1) + ' FALHOU no carrinho');
            }

            // Esperar entre jogos
            if (i < total - 1) {
                await delay(3500);
                fecharModais();
                await delay(500);
            }
        }

        updateProgress(total, total);
        var msg = '✅ ' + ok + '/' + total + ' jogos de ' + config.name + ' no carrinho!';
        if (erros > 0) msg += ' (' + erros + ' com erro)';
        updateStatus(msg, 'done');
        addLog('🏆 ' + msg);

        // Limpar dados usados
        chrome.storage.local.remove(['b2b_games', 'b2b_config', 'b2b_timestamp']);

        // Alerta final
        setTimeout(function() {
            alert('[B2B v6.0] ' + ok + '/' + total + ' jogos de ' + config.name + ' no carrinho!' +
                  (erros > 0 ? '\n' + erros + ' com erro.' : '') +
                  '\nFinalize o pagamento.');
        }, 1000);
    }

    // ═══ 7. CLICAR NÚMERO ═══
    function clicarNumero(num) {
        var padded = String(num).padStart(2, '0');
        var id = 'n' + padded;

        // Tentativa 1: ID direto
        var el = document.getElementById(id);
        if (el) {
            el.click();
            return true;
        }

        // Tentativa 2: querySelector com #
        el = document.querySelector('#' + id);
        if (el) {
            el.click();
            return true;
        }

        // Tentativa 3: querySelector com a#
        el = document.querySelector('a#' + id);
        if (el) {
            el.click();
            return true;
        }

        // Tentativa 4: Buscar por role=button com texto
        var todos = document.querySelectorAll('a[role=button], a.dezena, a.numero');
        for (var k = 0; k < todos.length; k++) {
            if (todos[k].textContent.trim() === padded) {
                todos[k].click();
                return true;
            }
        }

        // Tentativa 5: Buscar qualquer elemento com o número
        var allNums = document.querySelectorAll('.number, .dezena, .num, [class*=number], [class*=dezena]');
        for (var k2 = 0; k2 < allNums.length; k2++) {
            var txt = allNums[k2].textContent.trim();
            if (txt === padded || txt === String(num)) {
                allNums[k2].click();
                return true;
            }
        }

        console.warn('[B2B v6.0] ⚠️ Número ' + num + ' (id=' + id + ') não encontrado');
        return false;
    }

    // ═══ 8. COLOCAR NO CARRINHO COM RETRY ═══
    async function colocarNoCarrinhoComRetry() {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };

        fecharModais();
        await delay(500);

        for (var t = 0; t < 8; t++) {
            // Tentativa 1: ID exato
            var btn = document.getElementById('colocarnocarrinho');
            if (btn && btn.offsetParent !== null) {
                btn.click();
                addLog('🛒 Carrinho clicado (ID direto, tent ' + (t+1) + ')');
                await delay(2000);
                fecharModais();
                await delay(800);
                fecharModais();
                return true;
            }

            // Tentativa 2: querySelector
            btn = document.querySelector('#colocarnocarrinho') || 
                  document.querySelector('button#colocarnocarrinho');
            if (btn) {
                btn.click();
                addLog('🛒 Carrinho clicado (querySelector, tent ' + (t+1) + ')');
                await delay(2000);
                fecharModais();
                await delay(800);
                fecharModais();
                return true;
            }

            // Tentativa 3: Buscar por texto nos botões
            var allBtns = document.querySelectorAll('button');
            for (var k = 0; k < allBtns.length; k++) {
                var txt = allBtns[k].textContent.toLowerCase().trim();
                if (txt.includes('colocar no carrinho') ||
                    (txt.includes('carrinho') && !txt.includes('ir para') && !txt.includes('ver'))) {
                    allBtns[k].click();
                    addLog('🛒 Carrinho clicado (texto, tent ' + (t+1) + ')');
                    await delay(2000);
                    fecharModais();
                    await delay(800);
                    fecharModais();
                    return true;
                }
            }

            if (t % 2 === 0) {
                addLog('⏳ Carrinho não achado, tentativa ' + (t+1) + '/8...');
            }
            fecharModais();
            await delay(1500);
        }

        addLog('❌ Carrinho não encontrado após 8 tentativas');
        return false;
    }

    // ═══ 9. LIMPAR VOLANTE ═══
    function limparVolante() {
        fecharModais();

        // ID exato
        var btn = document.getElementById('limparvolante');
        if (btn) {
            btn.click();
            return true;
        }

        // querySelector
        btn = document.querySelector('#limparvolante') || 
              document.querySelector('button#limparvolante') ||
              document.querySelector('[id*="limpar"]');
        if (btn) {
            btn.click();
            return true;
        }

        // Buscar por texto
        var allBtns = document.querySelectorAll('button');
        for (var k = 0; k < allBtns.length; k++) {
            var txt = allBtns[k].textContent.toLowerCase().trim();
            if (txt.includes('limpar') || txt.includes('apagar')) {
                allBtns[k].click();
                return true;
            }
        }

        return false;
    }
})();

// ═══════════════════════════════════════════════════════════════
// CAIXA AUTOMATOR v8.0 TURBO: Preenche e FINALIZA apostas  
// Roda no site da Caixa Loterias Online
// FIX: Completa fluxo até pagamento + lotes de 10 + retry robusto
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';

    var VERSION = '8.0 TURBO';
    console.log('[B2B v' + VERSION + '] 🔌 Automator carregado em: ' + window.location.href);

    // ═══ CONFIGURAÇÕES ═══
    var BATCH_SIZE = 10;         // Processar 10 jogos por vez
    var DELAY_CLICK = 120;       // ms entre cliques de números
    var DELAY_CART = 800;        // ms após clicar no carrinho
    var DELAY_BETWEEN = 600;     // ms entre jogos
    var DELAY_MODAL = 200;       // ms para fechar modais
    var MAX_CART_RETRY = 10;     // tentativas de colocar no carrinho

    // ═══ 1. FECHAR MODAL DE IDADE ═══
    function fecharModalIdade() {
        var btnSim = document.getElementById('botaosim');
        if (btnSim && btnSim.offsetParent !== null) {
            dispatchRealClick(btnSim);
            console.log('[B2B v' + VERSION + '] ✅ Modal de idade fechado');
            return true;
        }
        // Fallback: buscar por texto
        var bts = document.querySelectorAll('button, a');
        for (var i = 0; i < bts.length; i++) {
            var t = bts[i].textContent.trim().toLowerCase();
            if (t === 'sim' && bts[i].offsetParent !== null && bts[i].offsetWidth > 10) {
                dispatchRealClick(bts[i]);
                console.log('[B2B v' + VERSION + '] ✅ Modal de idade fechado (fallback)');
                return true;
            }
        }
        return false;
    }

    // Auto-fechar modal de idade
    var idadeInterval = setInterval(function() {
        if (fecharModalIdade()) clearInterval(idadeInterval);
    }, 800);
    setTimeout(function() { clearInterval(idadeInterval); }, 20000);

    // ═══ 2. DISPATCH REAL CLICK (Angular compatible) ═══
    function dispatchRealClick(el) {
        if (!el) return false;
        try {
            // Scroll into view
            el.scrollIntoView({ block: 'center', behavior: 'instant' });
            
            // Dispatch real mouse events for Angular change detection
            var rect = el.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            
            var events = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
            for (var i = 0; i < events.length; i++) {
                var evt = new MouseEvent(events[i], {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: cx,
                    clientY: cy,
                    button: 0
                });
                el.dispatchEvent(evt);
            }
            try { var scope = angular.element(el).scope(); if (scope && scope.$apply) scope.$apply(); } catch(ae) {}
            return true;
        } catch(e) {
            // Fallback: simple click
            try { el.click(); return true; } catch(e2) { return false; }
        }
    }

    // ═══ 3. VERIFICAR JOGOS PENDENTES ═══
    chrome.storage.local.get(['b2b_games', 'b2b_config', 'b2b_timestamp'], function(data) {
        if (!data.b2b_games || !data.b2b_config) {
            console.log('[B2B v' + VERSION + '] Nenhum jogo pendente.');
            return;
        }

        var age = Date.now() - (data.b2b_timestamp || 0);
        if (age > 120 * 60 * 1000) { // 2 horas
            console.log('[B2B v' + VERSION + '] ⏳ Dados expirados');
            chrome.storage.local.remove(['b2b_games', 'b2b_config', 'b2b_timestamp']);
            return;
        }

        var games = data.b2b_games;
        var config = data.b2b_config;
        var IS_TIMEMANIA = (config.url === 'timemania');
        var IS_DIADESORTE = (config.url === 'dia-de-sorte');

        console.log('[B2B v' + VERSION + '] 🎯 ' + games.length + ' jogos de ' + config.name);
        if (IS_TIMEMANIA) console.log('[B2B v' + VERSION + '] ⚽ Modo TIMEMANIA ativado');
        if (IS_DIADESORTE) console.log('[B2B v' + VERSION + '] 📅 Modo DIA DE SORTE ativado');

        showStatusPanel(games.length, config.name);

        waitForGrid(function() {
            console.log('[B2B v' + VERSION + '] ✅ Grid detectado!');
            updateStatus('Grid encontrado! Iniciando em 3s...', 'running');
            setTimeout(function() {
                fillGamesInBatches(games, config, IS_TIMEMANIA, IS_DIADESORTE);
            }, 3000);
        });
    });

    // ═══ 4. ESPERAR GRID DO VOLANTE ═══
    function waitForGrid(callback, attempts) {
        attempts = attempts || 0;
        if (attempts > 90) { // 3 minutos
            updateStatus('❌ Grid não encontrado. Recarregue a página.', 'error');
            return;
        }

        fecharModalIdade();

        // Procurar números do volante - múltiplos seletores
        var grid = document.getElementById('n01') ||
                   document.getElementById('n02') ||
                   document.getElementById('n05') ||
                   document.getElementById('n10') ||
                   document.querySelector('a[id^="n0"]') ||
                   document.querySelector('[id="n01"]');

        if (grid) {
            console.log('[B2B v' + VERSION + '] 📍 Grid encontrado (tentativa ' + (attempts + 1) + ')');
            setTimeout(callback, 2000);
        } else {
            if (attempts % 15 === 0) {
                console.log('[B2B v' + VERSION + '] ⏳ Aguardando grid... (' + (attempts + 1) + ')');
            }
            setTimeout(function() { waitForGrid(callback, attempts + 1); }, 2000);
        }
    }

    // ═══ 5. PAINEL DE STATUS FLUTUANTE ═══
    function showStatusPanel(count, name) {
        var old = document.getElementById('b2b-status-panel');
        if (old) old.remove();

        var panel = document.createElement('div');
        panel.id = 'b2b-status-panel';
        panel.style.cssText = 'position:fixed;top:10px;right:10px;z-index:999999;' +
            'background:linear-gradient(135deg,#0F172A 0%,#1E293B 100%);color:white;' +
            'padding:18px 22px;border-radius:14px;font-family:Arial,sans-serif;font-size:14px;' +
            'box-shadow:0 8px 40px rgba(0,0,0,0.6),0 0 20px rgba(34,197,94,0.15);' +
            'border:2px solid rgba(34,197,94,0.4);min-width:340px;max-width:420px;' +
            'backdrop-filter:blur(10px);';
        panel.innerHTML = 
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                '<span style="font-size:22px;">🎰</span>' +
                '<span style="font-weight:800;color:#22C55E;font-size:15px;">B2B Loterias v' + VERSION + '</span>' +
                '<span style="margin-left:auto;cursor:pointer;font-size:18px;color:#94A3B8;' +
                    'transition:color 0.2s;" onmouseover="this.style.color=\'#EF4444\'" ' +
                    'onmouseout="this.style.color=\'#94A3B8\'" ' +
                    'onclick="this.parentElement.parentElement.remove()" title="Fechar">✕</span>' +
            '</div>' +
            '<div id="b2b-status-text" style="color:#E2E8F0;font-size:13px;line-height:1.4;">' +
                'Preparando ' + count + ' jogos de ' + name + '...</div>' +
            '<div id="b2b-progress" style="margin-top:10px;height:6px;background:#1E293B;' +
                'border-radius:6px;overflow:hidden;border:1px solid #334155;">' +
                '<div id="b2b-progress-bar" style="width:0%;height:100%;' +
                    'background:linear-gradient(90deg,#22C55E,#16A34A,#10B981);' +
                    'transition:width 0.4s ease;border-radius:6px;' +
                    'box-shadow:0 0 8px rgba(34,197,94,0.5);"></div>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;margin-top:5px;">' +
                '<span id="b2b-progress-text" style="color:#94A3B8;font-size:11px;">0/' + count + '</span>' +
                '<span id="b2b-time-text" style="color:#94A3B8;font-size:11px;"></span>' +
            '</div>' +
            '<div id="b2b-log" style="margin-top:10px;max-height:150px;overflow-y:auto;' +
                'font-size:11px;font-family:\'Courier New\',monospace;color:#94A3B8;' +
                'background:rgba(0,0,0,0.4);padding:8px;border-radius:8px;display:none;' +
                'border:1px solid #334155;"></div>' +
            '<div id="b2b-final-actions" style="display:none;margin-top:12px;"></div>';
        document.body.appendChild(panel);
    }

    function updateStatus(text, type) {
        var el = document.getElementById('b2b-status-text');
        if (!el) return;
        el.textContent = text;
        if (type === 'done') el.style.color = '#22C55E';
        if (type === 'error') el.style.color = '#EF4444';
        if (type === 'running') el.style.color = '#E2E8F0';
        if (type === 'warning') el.style.color = '#F59E0B';
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
            var ts = new Date().toLocaleTimeString('pt-BR');
            log.innerHTML += '<span style="color:#64748B;">[' + ts + ']</span> ' + msg + '<br>';
            log.scrollTop = log.scrollHeight;
        }
        console.log('[B2B v' + VERSION + '] ' + msg);
    }

    // ═══ 6. FECHAR MODAIS DA CAIXA ═══
    function fecharModais() {
        var fechados = 0;
        
        // IDs específicos dos botões de fechar
        var ids = [
            'fecharModalAlerta', 'fecharModalErro', 'fecharModalInfo',
            'confirmarModalConfirmacao', 'botaosim',
            'btnFecharModal', 'btnOk', 'btnConfirmar'
        ];
        for (var k = 0; k < ids.length; k++) {
            var el = document.getElementById(ids[k]);
            if (el && el.offsetParent !== null && el.offsetWidth > 0) {
                try { dispatchRealClick(el); fechados++; } catch(e) {}
            }
        }

        // Botões genéricos
        var bts = document.querySelectorAll('button');
        for (var j = 0; j < bts.length; j++) {
            var t = bts[j].textContent.trim().toLowerCase();
            if ((t === 'ok' || t === 'entendi' || t === 'fechar' || t === 'confirmar' || t === 'continuar') &&
                bts[j].offsetParent !== null && bts[j].offsetWidth > 0 && bts[j].offsetHeight > 0) {
                var isBtnCarrinho = (bts[j].id && bts[j].id.toLowerCase().indexOf('carrinho') >= 0) ||
                                    (bts[j].id && bts[j].id.toLowerCase().indexOf('pagamento') >= 0);
                if (!isBtnCarrinho) {
                    try { dispatchRealClick(bts[j]); fechados++; } catch(e) {}
                }
            }
        }

        // Fechar overlays
        var overlays = document.querySelectorAll('.modal-backdrop, .cdk-overlay-backdrop');
        for (var m = 0; m < overlays.length; m++) {
            try { overlays[m].click(); } catch(e) {}
        }

        return fechados;
    }

    // ═══ 7. PREENCHER JOGOS EM LOTES ═══
    async function fillGamesInBatches(games, config, IS_TIMEMANIA, IS_DIADESORTE) {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
        var total = games.length;
        var ok = 0;
        var erros = 0;
        var startTime = Date.now();

        addLog('🎬 Iniciando ' + total + ' jogos de ' + config.name);
        addLog('⚡ Modo TURBO: lotes de ' + BATCH_SIZE);
        if (IS_TIMEMANIA) addLog('⚽ Time do Coração será selecionado automaticamente');
        if (IS_DIADESORTE) addLog('📅 Mês da Sorte será selecionado automaticamente');

        for (var i = 0; i < total; i++) {
            var jogo = games[i];
            var elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            updateStatus('Jogo ' + (i + 1) + '/' + total + ' — preenchendo...', 'running');
            updateProgress(i, total);

            var timeEl = document.getElementById('b2b-time-text');
            if (timeEl) timeEl.textContent = elapsed + 's';

            // Fechar modais antes
            fecharModais();
            await delay(DELAY_MODAL);

            // Limpar volante (exceto primeiro)
            if (i > 0) {
                var limped = await limparVolanteComRetry();
                addLog('🧹 Limpar: ' + (limped ? 'OK' : 'SKIP'));
                await delay(500);
                fecharModais();
                await delay(DELAY_MODAL);
            }

            // Clicar em cada número
            var acertos = 0;
            var nums = jogo.slice(); // Cópia para não modificar original
            
            for (var j = 0; j < nums.length; j++) {
                var clicked = clicarNumero(nums[j]);
                if (clicked) {
                    acertos++;
                } else {
                    // Retry: esperar um pouco e tentar de novo
                    await delay(300);
                    clicked = clicarNumero(nums[j]);
                    if (clicked) acertos++;
                    else addLog('⚠️ Num ' + nums[j] + ' não encontrado');
                }
                await delay(DELAY_CLICK);
            }

            addLog('🔢 Jogo ' + (i+1) + ': ' + acertos + '/' + nums.length + ' [' + nums.join(',') + ']');

            // Force Angular digest IMMEDIATELY after number selection (BEFORE delay)
            try { var rs = angular.element(document.body).scope(); if (rs && rs.$apply) rs.$apply(); } catch(ae) {}
            await delay(400);
            fecharModais();
            await delay(DELAY_MODAL);

            // Selecionar Time/Mês antes de colocar no carrinho
            if (IS_TIMEMANIA) {
                var timeOk = await selecionarTimeDoCoracao();
                addLog('⚽ Time: ' + (timeOk ? 'OK' : 'FALHOU'));
                await delay(300);
            }
            if (IS_DIADESORTE) {
                var mesOk = await selecionarMesDaSorte();
                addLog('📅 Mês: ' + (mesOk ? 'OK' : 'FALHOU'));
                await delay(300);
            }

            var cartOk = await colocarNoCarrinhoComRetry(IS_TIMEMANIA, IS_DIADESORTE);

            if (cartOk) {
                ok++;
                addLog('✅ Jogo ' + (i+1) + ' → carrinho (' + ok + '/' + total + ')');
            } else {
                erros++;
                addLog('❌ Jogo ' + (i+1) + ' FALHOU');
            }

            // Delay entre jogos (menor dentro do lote)
            if (i < total - 1) {
                var isEndOfBatch = (i + 1) % BATCH_SIZE === 0;
                if (isEndOfBatch) {
                    addLog('⏸️ Pausa após lote ' + Math.ceil((i+1)/BATCH_SIZE) + '...');
                    await delay(1500); // Pausa maior entre lotes
                } else {
                    await delay(DELAY_BETWEEN);
                }
                fecharModais();
                await delay(DELAY_MODAL);
            }
        }

        // ═══ FINALIZAÇÃO ═══
        updateProgress(total, total);
        var totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        var msg = '✅ ' + ok + '/' + total + ' jogos no carrinho! (' + totalTime + 's)';
        if (erros > 0) msg += ' ⚠️ ' + erros + ' erro(s)';
        updateStatus(msg, 'done');
        addLog('🏆 ' + msg);

        // Limpar dados usados
        chrome.storage.local.remove(['b2b_games', 'b2b_config', 'b2b_timestamp']);

        // Mostrar botões de ação final
        showFinalActions(ok, total, config.name);
    }

    // ═══ 8. CLICAR NÚMERO ═══
    function clicarNumero(num) {
        var padded = String(num).padStart(2, '0');
        var id = 'n' + padded;

        // Tentativa 1: ID direto
        var el = document.getElementById(id);
        if (el) {
            dispatchRealClick(el);
            return true;
        }

        // Tentativa 2: querySelector
        el = document.querySelector('#' + id) || document.querySelector('a#' + id);
        if (el) {
            dispatchRealClick(el);
            return true;
        }

        // Tentativa 3: buscar por texto
        var todos = document.querySelectorAll('a[role=button], a.dezena, a.numero, a[id^="n"]');
        for (var k = 0; k < todos.length; k++) {
            if (todos[k].textContent.trim() === padded) {
                dispatchRealClick(todos[k]);
                return true;
            }
        }

        // Tentativa 4: qualquer elemento com classe número
        var allNums = document.querySelectorAll('.number, .dezena, .num, [class*=number], [class*=dezena]');
        for (var k2 = 0; k2 < allNums.length; k2++) {
            var txt = allNums[k2].textContent.trim();
            if (txt === padded || txt === String(num)) {
                dispatchRealClick(allNums[k2]);
                return true;
            }
        }

        return false;
    }

    // ═══ 9. COLOCAR NO CARRINHO COM RETRY ROBUSTO ═══
    async function colocarNoCarrinhoComRetry(IS_TIMEMANIA, IS_DIADESORTE) {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };

        fecharModais();
        await delay(DELAY_MODAL);

        for (var t = 0; t < MAX_CART_RETRY; t++) {
            // Tentativa 1: ID exato "colocarnocarrinho"
            var btn = document.getElementById('colocarnocarrinho');
            if (btn && btn.offsetParent !== null) {
                // FIX CRÍTICO: Verificar se o botão está HABILITADO antes de clicar
                if (btn.disabled || btn.classList.contains('disabled')) {
                    addLog('⏳ Carrinho desabilitado, tentativa ' + (t+1) + '/' + MAX_CART_RETRY);
                    // Forçar Angular digest - pode ser que os cliques não foram processados
                    try { var rs = angular.element(document.body).scope(); if (rs && rs.$apply) rs.$apply(); } catch(ae) {}
                    await delay(800);
                    // Re-selecionar Time/Mês se necessário
                    if (IS_TIMEMANIA) { await selecionarTimeDoCoracao(); await delay(400); }
                    if (IS_DIADESORTE) { await selecionarMesDaSorte(); await delay(400); }
                    continue;
                }
                dispatchRealClick(btn);
                addLog('🛒 Carrinho OK (ID, tent ' + (t+1) + ')');
                await delay(DELAY_CART);
                fecharModais();
                await delay(300);
                fecharModais();
                return true;
            }

            // Tentativa 2: querySelector variantes
            btn = document.querySelector('#colocarnocarrinho') ||
                  document.querySelector('button#colocarnocarrinho') ||
                  document.querySelector('[id="colocarnocarrinho"]') ||
                  document.querySelector('button[id*="colocar"]');
            if (btn) {
                if (btn.disabled || btn.classList.contains('disabled')) {
                    try { var rs2 = angular.element(document.body).scope(); if (rs2 && rs2.$apply) rs2.$apply(); } catch(ae2) {}
                    await delay(800);
                    if (IS_TIMEMANIA) { await selecionarTimeDoCoracao(); await delay(400); }
                    if (IS_DIADESORTE) { await selecionarMesDaSorte(); await delay(400); }
                    continue;
                }
                dispatchRealClick(btn);
                addLog('🛒 Carrinho OK (query, tent ' + (t+1) + ')');
                await delay(DELAY_CART);
                fecharModais();
                await delay(300);
                fecharModais();
                return true;
            }

            // Tentativa 3: botões com texto que contém "carrinho"
            var allBtns = document.querySelectorAll('button, a');
            var foundCart = false;
            for (var k = 0; k < allBtns.length; k++) {
                var txt = allBtns[k].textContent.toLowerCase().trim();
                if ((txt.indexOf('colocar no carrinho') >= 0 || txt.indexOf('colocar no carr') >= 0) &&
                    allBtns[k].offsetParent !== null && allBtns[k].offsetWidth > 0) {
                    if (allBtns[k].disabled || allBtns[k].classList.contains('disabled')) {
                        try { var rs3 = angular.element(document.body).scope(); if (rs3 && rs3.$apply) rs3.$apply(); } catch(ae3) {}
                        await delay(800);
                        foundCart = true;
                        break;
                    }
                    dispatchRealClick(allBtns[k]);
                    addLog('🛒 Carrinho OK (texto, tent ' + (t+1) + ')');
                    await delay(DELAY_CART);
                    fecharModais();
                    await delay(300);
                    fecharModais();
                    return true;
                }
            }

            if (t % 3 === 0) {
                addLog('⏳ Carrinho: tentativa ' + (t+1) + '/' + MAX_CART_RETRY);
            }
            fecharModais();
            await delay(500);
        }

        addLog('❌ Carrinho não encontrado/habilitado após ' + MAX_CART_RETRY + ' tentativas');
        return false;
    }

    // ═══ 9B. SELECIONAR TIME DO CORAÇÃO (TIMEMANIA) ═══
    async function selecionarTimeDoCoracao() {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
        await delay(300);

        // Seletores REAIS do site da Caixa (AngularJS)
        var times = document.querySelectorAll('img[name=btnTime],.data-selecionar-time-do-coracao,li[ng-repeat*=listaEquipe] img,li[ng-click*=Time] img,li[ng-click*=time] img');

        // Fallback: procurar LIs com ng-repeat de equipes
        if (times.length === 0) {
            var tLis = document.querySelectorAll('li[ng-repeat*=listaEquipe],li[ng-repeat*=equipe]');
            if (tLis.length > 0) {
                var tImgs = [];
                for (var q = 0; q < tLis.length; q++) {
                    var tImg = tLis[q].querySelector('img');
                    if (tImg) tImgs.push(tImg);
                }
                if (tImgs.length > 0) times = tImgs;
            }
        }

        // Fallback 2: UL com muitas imagens (>20 = lista de times)
        if (times.length === 0) {
            var allUls = document.querySelectorAll('ul');
            for (var u = 0; u < allUls.length; u++) {
                var uImgs = allUls[u].querySelectorAll('img');
                if (uImgs.length > 20) { times = uImgs; break; }
            }
        }

        if (times.length > 0) {
            var idx = Math.floor(Math.random() * times.length);
            var chosen = times[idx];
            chosen.scrollIntoView({ block: 'center', behavior: 'instant' });
            await delay(150);
            dispatchRealClick(chosen);
            await delay(250);
            // Clicar no LI pai para garantir trigger Angular
            if (chosen.parentElement && chosen.parentElement.tagName === 'LI') {
                dispatchRealClick(chosen.parentElement);
                await delay(200);
            }
            try { var scope = angular.element(chosen).scope(); if (scope && scope.$apply) scope.$apply(); } catch(e) {}
            var nome = chosen.alt || chosen.title || (chosen.parentElement ? chosen.parentElement.textContent.trim().substring(0, 30) : 'Time #' + (idx+1));
            addLog('⚽ Time selecionado: ' + nome);
            return true;
        }
        addLog('⚠️ Nenhum time encontrado na página');
        return false;
    }

    // ═══ 9C. SELECIONAR MÊS DA SORTE (DIA DE SORTE) ═══
    async function selecionarMesDaSorte() {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
        await delay(300);

        // Seletores REAIS do site da Caixa (AngularJS)
        var meses = document.querySelectorAll('li[ng-repeat*=listaMeses],li[ng-click*=configurarMes],[id=mes] li,ul.meses li,.meses-list li');

        // Fallback: procurar meses por nome em português
        if (meses.length === 0) {
            var nomesMeses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
            var allLi = document.querySelectorAll('li,a,span,div');
            var found = [];
            for (var q = 0; q < allLi.length; q++) {
                var tx = allLi[q].textContent.trim().toLowerCase();
                for (var m = 0; m < nomesMeses.length; m++) {
                    if (tx === nomesMeses[m] && allLi[q].children.length <= 1) {
                        found.push(allLi[q]);
                        break;
                    }
                }
            }
            if (found.length > 0) meses = found;
        }

        // Fallback 2: select/option
        if (meses.length === 0) {
            var sel = document.querySelector('select');
            if (sel && sel.options.length > 1) {
                sel.selectedIndex = Math.floor(Math.random() * (sel.options.length - 1)) + 1;
                sel.dispatchEvent(new Event('change', { bubbles: true }));
                addLog('📅 Mês (select): ' + sel.options[sel.selectedIndex].text);
                return true;
            }
        }

        if (meses.length > 0) {
            var idx = Math.floor(Math.random() * meses.length);
            var mesEl = meses[idx];
            dispatchRealClick(mesEl);
            await delay(400);
            if (mesEl.tagName !== 'LI' && mesEl.parentElement && mesEl.parentElement.tagName === 'LI') {
                dispatchRealClick(mesEl.parentElement);
                await delay(200);
            }
            try { var scope = angular.element(mesEl).scope(); if (scope && scope.$apply) scope.$apply(); } catch(e) {}
            var mesNome = mesEl.textContent.trim() || 'Mês #' + (idx+1);
            addLog('📅 Mês selecionado: ' + mesNome);
            return true;
        }
        addLog('⚠️ Nenhum mês encontrado na página');
        return false;
    }

    // ═══ 10. LIMPAR VOLANTE COM RETRY ═══
    async function limparVolanteComRetry() {
        var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
        
        for (var t = 0; t < 5; t++) {
            fecharModais();

            // ID exato
            var btn = document.getElementById('limparvolante');
            if (btn) {
                dispatchRealClick(btn);
                await delay(400);
                fecharModais();
                await delay(200);
                return true;
            }

            // querySelector variantes
            btn = document.querySelector('#limparvolante') ||
                  document.querySelector('button#limparvolante') ||
                  document.querySelector('[id*="limpar"]');
            if (btn) {
                dispatchRealClick(btn);
                await delay(400);
                fecharModais();
                await delay(200);
                return true;
            }

            // Buscar por texto
            var allBtns = document.querySelectorAll('button, a');
            for (var k = 0; k < allBtns.length; k++) {
                var txt = allBtns[k].textContent.toLowerCase().trim();
                if ((txt.indexOf('limpar') >= 0 || txt.indexOf('apagar') >= 0) &&
                    allBtns[k].offsetParent !== null) {
                    dispatchRealClick(allBtns[k]);
                    await delay(400);
                    fecharModais();
                    await delay(200);
                    return true;
                }
            }

            await delay(500);
        }
        return false;
    }

    // ═══ 11. AÇÕES FINAIS — IR PARA PAGAMENTO ═══
    function showFinalActions(ok, total, name) {
        var container = document.getElementById('b2b-final-actions');
        if (!container) return;

        container.style.display = 'block';
        container.innerHTML = 
            '<div style="border-top:1px solid #334155;padding-top:12px;">' +
                '<div style="color:#F59E0B;font-weight:700;font-size:12px;margin-bottom:8px;">' +
                    '⚠️ PRÓXIMO PASSO: Finalizar pagamento</div>' +
                '<div style="display:flex;gap:8px;">' +
                    '<button id="b2b-btn-pay" style="flex:1;padding:10px;background:linear-gradient(135deg,#22C55E,#16A34A);' +
                        'color:white;border:none;border-radius:8px;font-weight:800;font-size:13px;cursor:pointer;' +
                        'transition:all 0.2s;box-shadow:0 4px 12px rgba(34,197,94,0.3);" ' +
                        'onmouseover="this.style.transform=\'scale(1.02)\'" ' +
                        'onmouseout="this.style.transform=\'scale(1)\'">' +
                        '💳 Ir para Pagamento</button>' +
                    '<button id="b2b-btn-cart" style="flex:1;padding:10px;background:linear-gradient(135deg,#3B82F6,#1D4ED8);' +
                        'color:white;border:none;border-radius:8px;font-weight:800;font-size:13px;cursor:pointer;' +
                        'transition:all 0.2s;box-shadow:0 4px 12px rgba(59,130,246,0.3);" ' +
                        'onmouseover="this.style.transform=\'scale(1.02)\'" ' +
                        'onmouseout="this.style.transform=\'scale(1)\'">' +
                        '🛒 Ver Carrinho</button>' +
                '</div>' +
                '<div style="margin-top:8px;padding:8px;background:rgba(245,158,11,0.1);' +
                    'border:1px solid rgba(245,158,11,0.3);border-radius:6px;">' +
                    '<p style="margin:0;color:#FCD34D;font-size:11px;line-height:1.5;">' +
                        '📝 <strong>' + ok + ' jogos</strong> de ' + name + ' estão no carrinho.<br>' +
                        'Clique em <strong>"Ir para Pagamento"</strong> e faça login na Caixa para concluir sua aposta.' +
                    '</p>' +
                '</div>' +
            '</div>';

        // Botão IR PARA PAGAMENTO
        var btnPay = document.getElementById('b2b-btn-pay');
        if (btnPay) {
            btnPay.addEventListener('click', function() {
                irParaPagamento();
            });
        }

        // Botão VER CARRINHO
        var btnCart = document.getElementById('b2b-btn-cart');
        if (btnCart) {
            btnCart.addEventListener('click', function() {
                acessarCarrinho();
            });
        }

        // Auto-tentar ir para pagamento após 2s
        setTimeout(function() {
            addLog('🔔 Clique "Ir para Pagamento" para finalizar!');
        }, 2000);
    }

    // ═══ 12. IR PARA PAGAMENTO ═══
    function irParaPagamento() {
        addLog('💳 Tentando ir para pagamento...');

        // Tentativa 1: botão pelo ID direto
        var btn = document.getElementById('irparapagamento');
        if (btn) {
            dispatchRealClick(btn);
            addLog('✅ Clicou em #irparapagamento');
            return;
        }

        // Tentativa 2: buscar botão de pagamento
        var allBtns = document.querySelectorAll('button, a');
        for (var k = 0; k < allBtns.length; k++) {
            var txt = allBtns[k].textContent.toLowerCase().trim();
            if ((txt.indexOf('pagamento') >= 0 || txt.indexOf('pagar') >= 0 || 
                 txt.indexOf('finalizar') >= 0 || txt.indexOf('ir para pagamento') >= 0) &&
                allBtns[k].offsetParent !== null) {
                dispatchRealClick(allBtns[k]);
                addLog('✅ Clicou em botão de pagamento (' + txt.substring(0, 30) + ')');
                return;
            }
        }

        // Tentativa 3: navegar direto
        addLog('⚠️ Botão de pagamento não encontrado, tentando via carrinho...');
        acessarCarrinho();
    }

    // ═══ 13. ACESSAR CARRINHO ═══
    function acessarCarrinho() {
        // Tentativa 1: ID do carrinho
        var btn = document.getElementById('acessarcarrrinhoapostas') || 
                  document.getElementById('acessarcarrinhoapostas');
        if (btn) {
            dispatchRealClick(btn);
            addLog('✅ Clicou em carrinho de apostas');
            return;
        }

        // Tentativa 2: buscar por ícone de carrinho
        var allLinks = document.querySelectorAll('a, button, div');
        for (var k = 0; k < allLinks.length; k++) {
            var txt = allLinks[k].textContent.toLowerCase().trim();
            if ((txt.indexOf('acessar') >= 0 && allLinks[k].closest('[class*="carrinho"]')) ||
                (txt.indexOf('carrinho') >= 0 && txt.indexOf('colocar') < 0)) {
                if (allLinks[k].offsetParent !== null && allLinks[k].offsetWidth > 0) {
                    dispatchRealClick(allLinks[k]);
                    addLog('✅ Clicou no carrinho (' + txt.substring(0, 30) + ')');
                    return;
                }
            }
        }

        // Tentativa 3: o número do carrinho no header
        var cartCount = document.querySelector('[class*="carrinho"] span, [class*="cart"] span');
        if (cartCount && cartCount.parentElement) {
            dispatchRealClick(cartCount.parentElement);
            addLog('✅ Clicou no contador do carrinho');
            return;
        }

        addLog('⚠️ Carrinho não encontrado — clique manualmente no ícone 🛒 no topo da página');
    }

})();

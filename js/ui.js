const L99_MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const L99_TIMES = ["ABC/RN", "América/MG", "América/RJ", "América/RN", "Atlético/GO", "Atlético/MG", "Atlético/PR", "Avaí/SC", "Bahia/BA", "Bangu/RJ", "Barueri/SP", "Botafogo/PB", "Botafogo/RJ", "Botafogo/SP", "Bragantino/SP", "Brasiliense/DF", "Campinense/PB", "Ceará/CE", "Corinthians/SP", "Coritiba/PR", "CRB/AL", "Criciúma/SC", "Cruzeiro/MG", "CSA/AL", "Desportiva/ES", "Figueirense/SC", "Flamengo/RJ", "Fluminense/RJ", "Fortaleza/CE", "Gama/DF", "Goiás/GO", "Grêmio/RS", "Guarani/SP", "Inter Limeira/SP", "Internacional/RS", "Ipatinga/MG", "Ituano/SP", "Ji-Paraná/RO", "Joinville/SC", "Juventude/RS", "Juventus/SP", "Londrina/PR", "Marília/SP", "Mixto/MT", "Moto Clube/MA", "Náutico/PE", "Nacional/AM", "Olaria/RJ", "Operário/MS", "Palmeiras/SP", "Paraná/PR", "Paulista/SP", "Paysandu/PA", "Ponte Preta/SP", "Portuguesa/SP", "Remo/PA", "Rio Branco/AC", "Rio Branco/ES", "River/PI", "Roraima/RR", "Sampaio Corrêa/MA", "Santa Cruz/PE", "Santo André/SP", "Santos/SP", "São Caetano/SP", "São Paulo/SP", "São Raimundo/AM", "Sergipe/SE", "Sport/PE", "Treze/PB", "Tuna Luso/PA", "Uberlândia/MG", "União Bandeirante/PR", "União São João/SP", "Vasco/RJ", "Vila Nova/GO", "Villa Nova/MG", "Vitória/BA", "Volta Redonda/RJ", "Ypiranga/AP"];

class UI {
    constructor() {
        // ══ Helper para getElementById seguro ══
        const _el = (id) => document.getElementById(id);

        this.navButtons = document.querySelectorAll('.nav-btn') || [];
        this.currentGameTitle = _el('current-game-title');
        this.closingSelect = _el('closing-type');
        this.gamesQuantityInput = _el('games-quantity');
        this.generateBtn = _el('generate-btn');
        this.generateCoverageBtn = _el('generate-coverage-btn');
        this.smartDrawSizeSelect = _el('smart-draw-size');
        this.copyBtn = _el('copy-btn');
        this.gamesContainer = _el('games-container');
        this.currentBetCostElem = _el('current-bet-cost');

        // Action Buttons
        this.saveBtn = _el('save-btn');
        this.checkBtn = _el('check-btn');
        this.playCaixaBtn = _el('btn-play-caixa');

        // Modal Elements
        this.checkModal = _el('check-modal');
        this.closeCheckModalBtn = document.querySelector('.close-check-modal');
        this.inputCheckNumbers = _el('check-input-numbers');
        this.confirmCheckBtn = _el('confirm-check-btn');

        this.copyModal = _el('copy-modal');
        this.closeCopyModalBtns = document.querySelectorAll('.close-copy-modal') || [];
        this.copyTextarea = _el('copy-textarea');

        this.currentGeneratedGames = []; // Store generated games — FONTE ÚNICA DE VERDADE

        this.hotNumbersContainer = _el('hot-numbers');
        this.coldNumbersContainer = _el('cold-numbers');
        this.gridContainer = _el('number-selection-grid');
        this.selectedCountElem = _el('selected-count');
        this.maxSelectionElem = _el('max-selection');
        this.timerElem = _el('timer');

        this.recentResultsContainer = _el('recent-results-list');
        this.loadGamesInput = _el('load-games-input');
        this.checkSummaryContainer = _el('check-summary');

        // Fixed Mode Elements
        this.btnFixedMode = _el('btn-fixed-mode');
        this.fixedInfoPanel = _el('fixed-info-panel');
        this.fixedNumbersList = _el('fixed-numbers-list');
        this.isFixedMode = false;
        this.fixedNumbers = new Set();

        // Stats Controls
        this.statsButtons = document.querySelectorAll('.stat-toggle') || [];
        this.currentStatsRange = 10;

        // Investment Panel Elements
        this.costSelectedCount = _el('cost-selected-count');
        this.costTotalCombinations = _el('cost-total-combinations');
        this.costTotalValue = _el('cost-total-value');
        this.costUserGames = _el('cost-user-games');
        this.costUserGamesDetail = _el('cost-user-games-detail');
        this.closingEstimatesContainer = _el('closing-estimates');

        this.root = document.documentElement;

        this.selectedNumbers = new Set();
        this.currentGameKey = 'megasena';

        // ── Rastreamento de Modo de Geração (para Estatísticas) ──
        this._lastGenerationMode = localStorage.getItem('l99_lastMode') || 'manual';   // quantum_l99 | gerar_jogos | dual_2g | fechamento | manual
        this._lastPrecisionMode = false;
        this._lastDrawSize = 6;
        this._lastCheckDrawInfo = '';

        // ── Flag de geração em andamento (previne double-click) ──
        this._isGenerating = false;

        // Quantum/IA Elements
        this.quantumFormula = _el('quantum-formula');
        this.quantumCountInput = _el('quantum-count');
        this.btnQuantumCalculate = _el('btn-quantum-calculate');
        this.quantumResults = _el('quantum-results');
        this.btnUseQuantum = _el('btn-use-quantum');

        // Tutorial Elements
        this.btnTutorial = _el('btn-tutorial');
        this.tutorialModal = _el('tutorial-modal');
        this.closeTutorialModalBtns = document.querySelectorAll('.close-tutorial-modal') || [];
        this.btnPrintTutorial = _el('print-tutorial');

        // Install Elements
        this.btnInstall = _el('btn-install');
        this.installModal = _el('install-modal');
        this.closeInstallModalBtns = document.querySelectorAll('.close-install-modal') || [];
        this.btnCopyPath = _el('btn-copy-path');
        this.folderPathElem = _el('folder-path');

        // Backup Button
        this.btnBackup = _el('btn-backup');

        // Prize Display Elements
        this.prizeDisplay = _el('prize-display');
        this.prizeValue = _el('prize-value');
        this.prizeBadge = _el('prize-badge');
    }

    // ════════════════════════════════════════════════════════════
    //  INICIALIZACAO DE EVENTOS — CHAMADO POR main.js
    // ════════════════════════════════════════════════════════════
    initEvents() {
        // === NAVEGACAO ENTRE LOTERIAS ===
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const gameKey = btn.dataset.game;
                if (gameKey && typeof GAMES !== 'undefined' && GAMES[gameKey]) {
                    this.updateGameInfo(gameKey);
                }
            });
        });

        // === BOTOES DE SELECAO ===
        const btnRandom = document.getElementById('btn-random-select');
        if (btnRandom) btnRandom.onclick = () => this.selectRandom();

        const btnClear = document.getElementById('btn-clear-selection');
        if (btnClear) btnClear.onclick = () => this.clearSelection();

        if (this.btnFixedMode) {
            this.btnFixedMode.onclick = () => this.toggleFixedMode();
        }

        // === BOTÃO ⚔️ COMPARAR ESTRATÉGIAS ===
        const btnCompare = document.getElementById('btn-compare');
        if (btnCompare) {
            btnCompare.onclick = () => {
                const container = document.getElementById('comparison-container');
                if (!container) return;
                container.style.display = 'block';
                if (typeof ComparisonEngine !== 'undefined') {
                    ComparisonEngine.render(container, this.currentGameKey);
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    container.innerHTML = '<div style="padding:20px;text-align:center;color:#EF4444;">ComparisonEngine não carregado.</div>';
                }
            };
        }

        // === BOTÃO 🎲 MANUAL v14.0 — MotorFechamentoManual ===
        // Delega TODA lógica ao motor. Zero lógica inline.
        if (this.generateBtn) {
            this.generateBtn.onclick = () => {
                const game = GAMES[this.currentGameKey];
                if (!game) return;
                const qty = parseInt(this.gamesQuantityInput.value) || 10;
                const drawSizeSelect = document.getElementById('smart-draw-size');
                const customDrawSize = drawSizeSelect ? parseInt(drawSizeSelect.value) : 0;
                const drawSize = (customDrawSize && customDrawSize >= game.minBet) ? customDrawSize : game.minBet;

                // Coletar escolhas do apostador
                const selectedArr = Array.from(this.selectedNumbers).filter(n => n >= game.range[0] && n <= game.range[1]);
                const fixedArr = Array.from(this.fixedNumbers).filter(n => n >= game.range[0] && n <= game.range[1]);

                // Pool = todos os números escolhidos (selecionados + fixos)
                const poolSet = new Set([...selectedArr, ...fixedArr]);
                const pool = Array.from(poolSet).sort((a, b) => a - b);

                this._lastGenerationMode = 'manual';
                localStorage.setItem('l99_lastMode', 'manual');
                document.body.setAttribute('data-l99-mode', 'manual');

                let result;
                let bannerMsg = '';

                if (typeof MotorFechamentoManual === 'undefined') {
                    this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">MotorFechamentoManual não carregado. Recarregue (Ctrl+Shift+R).</div>';
                    return;
                }

                if (pool.length < drawSize) {
                    // ═══ BLOQUEADO: Apostador precisa selecionar números ═══
                    const msg = pool.length === 0
                        ? '⚠️ <strong>Selecione seus números!</strong><br>O botão Manual usa SOMENTE os números que VOCÊ escolhe.<br>Selecione pelo menos <strong>' + drawSize + '</strong> números no grid acima.'
                        : '⚠️ <strong>Seleção insuficiente!</strong><br>Você selecionou <strong>' + pool.length + '</strong> número(s), mas precisa de pelo menos <strong>' + drawSize + '</strong>.<br>Selecione mais <strong>' + (drawSize - pool.length) + '</strong> número(s) no grid.';
                    this.gamesContainer.innerHTML = '<div style="text-align:center;padding:30px 20px;color:#FCD34D;font-size:0.9rem;line-height:1.6;">' + msg + '</div>';
                    return;
                }

                // ═══ Apostador selecionou números suficientes ═══
                const closingVal = this.closingSelect ? this.closingSelect.value : '';
                
                if (closingVal.startsWith('close_')) {
                    const guarantee = parseInt(closingVal.replace('close_', ''));
                    if (typeof ClosingEngine === 'undefined') {
                        this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">ClosingEngine não carregado.</div>';
                        return;
                    }
                    
                    this.gamesContainer.innerHTML = '<div style="text-align:center;padding:40px;"><div class="sync-loader" style="font-size:1.2em;">Fechando ' + guarantee + ' pontos com IA...</div></div>';
                    
                    setTimeout(() => {
                        result = ClosingEngine.generateClosure(poolSet, guarantee, drawSize, this.currentGameKey, fixedArr);
                        
                        if (result.error) {
                            this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#F59E0B;">' + result.error + '</div>';
                            return;
                        }
                        
                        bannerMsg = '🎯 <strong>FECHAMENTO HÍBRIDO (IA + STEINER)</strong> — ' + result.games.length + ' jogos<br>';
                        bannerMsg += 'Garantia: <strong>' + guarantee + ' pontos</strong> | Cobertura Exata: <strong>' + result.coveragePct + '%</strong><br>';
                        if (fixedArr.length > 0) bannerMsg += 'Fixos: ' + fixedArr.join(', ') + '<br>';
                        bannerMsg += 'Investimento: <strong>R$ ' + result.cost.toFixed(2) + '</strong> | Ordenado por Sinergia IA 🔥';
                        
                        const games = result.games || [];
                        this.currentGeneratedGames = games;
                        this._lastGeneratedGames = games;
                        this.renderGames({ pool: pool, games: games, smartAnalysis: null }, this.currentGameKey);
                        
                        setTimeout(() => {
                            var b = document.createElement('div');
                            b.className = 'smart-gen-analysis';
                            b.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:12px 16px;border-radius:10px;background:linear-gradient(135deg, rgba(255,215,0,0.1), rgba(220,38,38,0.1));border:1px solid rgba(255,215,0,0.3);font-size:0.8rem;color:#FCD34D;';
                            b.innerHTML = bannerMsg;
                            var old = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
                            if (old) old.remove();
                            this.gamesContainer.parentNode.insertBefore(b, this.gamesContainer);
                        }, 50);
                        setTimeout(() => { if (this.gamesContainer) this.gamesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
                    }, 50);
                    
                } else {
                    // Sem fechamento exato -> Motor Genérico
                    // ═══ v15.0: GERAÇÃO ASSÍNCRONA para grandes volumes ═══
                    if (typeof AsyncGenerator !== 'undefined' && AsyncGenerator.shouldUseAsync(qty, this.currentGameKey)) {
                        this.gamesContainer.innerHTML = '<div style="text-align:center;padding:40px;"><div class="sync-loader" style="font-size:1.2em;">Preparando geração assíncrona...</div></div>';
                        AsyncGenerator.generateManualAsync(this.currentGameKey, pool, fixedArr, qty, drawSize, (result, cancelled, error) => {
                            if (cancelled) {
                                this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#F59E0B;">⚠️ Geração cancelada pelo usuário.</div>';
                                return;
                            }
                            if (error || !result || !result.games || result.games.length === 0) {
                                this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">Erro: ' + (error ? error.message : 'Nenhum jogo gerado.') + '</div>';
                                return;
                            }
                            const a = result.analysis || {};
                            let asyncBanner = '🎲 <strong>MANUAL</strong> — ' + result.games.length + ' jogos dos seus ' + a.poolSize + ' números';
                            if (a.fixedCount > 0) asyncBanner += ' (fixos: ' + a.fixedNumbers.join(', ') + ')';
                            asyncBanner += '<br>📊 Investimento: <strong>R$ ' + a.investimento.toFixed(2) + '</strong> | ⚡ Geração Assíncrona (' + a.chunksProcessed + ' lotes) | ' + a.elapsed + 'ms';
                            if (a.isComplete) asyncBanner += '<br>✅ <strong style="color:#22C55E;">FECHAMENTO COMPLETO</strong>';

                            this.currentGeneratedGames = result.games;
                            this._lastGeneratedGames = result.games;
                            if (typeof ComparisonEngine !== 'undefined') ComparisonEngine.saveResult('manual', result.games, result.analysis, this.currentGameKey);
                            this.renderGames({ pool: pool, games: result.games, smartAnalysis: null }, this.currentGameKey);

                            setTimeout(() => {
                                var b = document.createElement('div');
                                b.className = 'smart-gen-analysis';
                                b.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:12px 16px;border-radius:10px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.3);font-size:0.8rem;color:#FCD34D;';
                                b.innerHTML = asyncBanner;
                                var old = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
                                if (old) old.remove();
                                this.gamesContainer.parentNode.insertBefore(b, this.gamesContainer);
                            }, 50);
                            setTimeout(() => { if (this.gamesContainer) this.gamesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
                        });
                        return; // Sai do onclick — o callback cuidará do resultado
                    }

                    // Geração síncrona (quantidades pequenas — rápido o bastante)
                    result = MotorFechamentoManual.generate(this.currentGameKey, pool, fixedArr, qty, drawSize);
                    const a = result.analysis || {};
                    bannerMsg = '🎲 <strong>MANUAL</strong> — ' + result.games.length + ' jogos dos seus ' + a.poolSize + ' números';
                    if (a.fixedCount > 0) bannerMsg += ' (fixos: ' + a.fixedNumbers.join(', ') + ')';
                    bannerMsg += '<br>📊 Combinações possíveis: <strong>' + a.totalPossible + '</strong> | Investimento: <strong>R$ ' + a.investimento.toFixed(2) + '</strong>';
                    if (a.pairCoveragePct !== undefined) bannerMsg += '<br>📐 Pares cobertos: <strong>' + a.pairCoveragePct + '%</strong>';
                    if (a.avgHamming !== undefined) bannerMsg += ' | Hamming: <strong>' + a.avgHamming + '</strong>';
                    if (a.duplicatesRejected) bannerMsg += ' | Duplicatas rejeitadas: ' + a.duplicatesRejected;
                    if (a.roi && a.roi.roiPercent !== undefined) bannerMsg += '<br>💰 ROI esperado: <strong style="color:' + (a.roi.roiPercent > -60 ? '#F59E0B' : '#EF4444') + ';">' + a.roi.roiPercent.toFixed(1) + '%</strong> <span style="font-size:0.7rem;color:#64748B;">(hipergeométrica exata)</span>';
                    if (a.isComplete) bannerMsg += '<br>✅ <strong style="color:#22C55E;">FECHAMENTO COMPLETO</strong>';
    
                    const games = result.games || [];
                    if (games.length === 0) {
                        this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#F59E0B;">' + (result.error || 'Nenhum jogo gerado.') + '</div>';
                        return;
                    }
                    this.currentGeneratedGames = games;
                    this._lastGeneratedGames = games;
                    if (typeof ComparisonEngine !== 'undefined') ComparisonEngine.saveResult('manual', games, result.analysis, this.currentGameKey);
                    this.renderGames({ pool: pool, games: games, smartAnalysis: null }, this.currentGameKey);
    
                    // Banner informativo
                    setTimeout(() => {
                        var b = document.createElement('div');
                        b.className = 'smart-gen-analysis';
                        b.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:12px 16px;border-radius:10px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.3);font-size:0.8rem;color:#FCD34D;';
                        b.innerHTML = bannerMsg;
                        var old = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
                        if (old) old.remove();
                        this.gamesContainer.parentNode.insertBefore(b, this.gamesContainer);
                    }, 50);
                    setTimeout(() => { if (this.gamesContainer) this.gamesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
                }
            };
        }

        // === BOTÃO 📐 COBERTURA UNIFICADA v14 (Motor Unificado: Estatística + Cobertura + Sniper) ===
        if (this.generateCoverageBtn) {
            this.generateCoverageBtn.onclick = () => {
                const game = GAMES[this.currentGameKey];
                if (!game) return;
                const qty = parseInt(this.gamesQuantityInput.value) || 10;
                const drawSizeSelect = document.getElementById('smart-draw-size');
                const customDrawSize = drawSizeSelect ? parseInt(drawSizeSelect.value) : 0;
                const drawSize = (customDrawSize && customDrawSize >= game.minBet) ? customDrawSize : game.minBet;

                // Verificar modo Sniper
                const sniperToggle = document.getElementById('precision-mode-toggle');
                const sniperMode = sniperToggle ? sniperToggle.checked : false;
                const poolInput = document.getElementById('precision-pool-size');
                const sniperPoolSize = poolInput ? parseInt(poolInput.value) || 20 : 20;

                this._lastGenerationMode = sniperMode ? 'cobertura_sniper' : 'cobertura';
                localStorage.setItem('l99_lastMode', this._lastGenerationMode);
                document.body.setAttribute('data-l99-mode', this._lastGenerationMode);

                const modeLabel = sniperMode ? '🎯 SNIPER + Cobertura' : '📐 Cobertura Estatística';
                this.gamesContainer.innerHTML = '<div style="text-align:center;padding:40px;"><div class="sync-loader" style="font-size:1.2em;">' + modeLabel + '...</div></div>';

                // ═══ v15.0: GERAÇÃO ASSÍNCRONA — sempre para Cobertura (motor pesado) ═══
                if (typeof AsyncGenerator !== 'undefined') {
                    const coverageOpts = { precisionMode: sniperMode, precisionPoolSize: sniperPoolSize };
                    const selectedArr = this.getSelectedNumbers() || [];
                    if (sniperMode && selectedArr.length >= drawSize) {
                        alert('Aviso de Transparência:\n\nVocê ativou o Sniper, mas também selecionou números manualmente no volante.\n\nO sistema respeitará SEUS números e o Sniper automático será DESATIVADO para esta geração.');
                    }
                    AsyncGenerator.generateCoverageAsync(
                        this.currentGameKey, qty, this.getSelectedNumbers(), this.fixedNumbers, drawSize, coverageOpts,
                        (result, cancelled, error) => {
                            if (cancelled) {
                                this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#F59E0B;">⚠️ Geração cancelada pelo usuário.</div>';
                                return;
                            }
                            if (error || !result || !result.games || result.games.length === 0) {
                                this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">Erro: ' + (error ? error.message : 'Nenhum jogo gerado.') + '</div>';
                                return;
                            }

                            this.currentGeneratedGames = result.games;
                            this._lastGeneratedGames = result.games;
                            if (typeof ComparisonEngine !== 'undefined') ComparisonEngine.saveResult(sniperMode ? 'sniper' : 'cobertura', result.games, result.analysis, this.currentGameKey);
                            this.renderGames(result, this.currentGameKey);

                            const a = result.analysis || {};
                            const strategyName = a.strategy === 'CLOSURE' ? 'Fechamento Exato (Steiner)' 
                                               : a.strategy === 'COVERAGE_FAST' ? 'Set Cover (Rápido)' 
                                               : 'Set Cover (Greedy)';
                            
                            let probHtml = '';
                            if (typeof SmartCoverageEngine !== 'undefined' && SmartCoverageEngine.calcRealMetrics) {
                                const realMetrics = SmartCoverageEngine.calcRealMetrics(result.games, this.currentGameKey);
                                if (realMetrics && realMetrics.prizes) {
                                    probHtml = '<div style="margin-top:10px;padding:8px;background:rgba(0,0,0,0.4);border-radius:8px;font-size:0.75rem;">' +
                                               '<div style="color:#10B981;font-weight:bold;margin-bottom:4px;">PROBABILIDADES EXATAS (HIPERGEOMÉTRICA)</div>';
                                    realMetrics.prizes.slice(0, 3).forEach(p => {
                                        probHtml += '<div style="display:flex;justify-content:space-between;color:#D1D5DB;margin-bottom:2px;">' +
                                                    '<span>Acertar ' + p.hits + ':</span><span>' + p.probAtLeastOnePct + '% (em ' + result.games.length + ' jogos)</span></div>';
                                    });
                                    probHtml += '<div style="color:#6B7280;font-size:0.65rem;margin-top:4px;text-align:right;">* Eventos independentes</div></div>';
                                }
                            }
                            let evHtml = '';
                            if (typeof EVCalculator !== 'undefined') {
                                try {
                                    const evData = EVCalculator.calcMultiGameEV(this.currentGameKey, result.games.length);
                                    if (evData) {
                                        const retColor = evData.retornoPct >= 100 ? '#22C55E' : '#F59E0B';
                                        const retStr = evData.retornoPct.toFixed(1);
                                        evHtml = '<div style="margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:0.7rem;">' +
                                            '<div style="text-align:center;padding:6px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid rgba(16,185,129,0.1);">' +
                                                '<div style="color:#6EE7B7;font-size:0.55rem;font-weight:700;">INVESTIMENTO</div>' +
                                                '<div style="color:#10B981;font-weight:900;font-size:1rem;">' + evData.custoTotalFormatado + '</div>' +
                                            '</div>' +
                                            '<div style="text-align:center;padding:6px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid rgba(16,185,129,0.1);">' +
                                                '<div style="color:#6EE7B7;font-size:0.55rem;font-weight:700;">EV ESPERADO</div>' +
                                                '<div style="color:#10B981;font-weight:900;font-size:1rem;">' + evData.evBrutoTotalFormatado + '</div>' +
                                            '</div>' +
                                            '<div style="text-align:center;padding:6px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid ' + retColor + '20;">' +
                                                '<div style="color:#6EE7B7;font-size:0.55rem;font-weight:700;">RETORNO</div>' +
                                                '<div style="color:' + retColor + ';font-weight:900;font-size:1rem;">' + retStr + '%</div>' +
                                            '</div>' +
                                        '</div>';
                                    }
                                } catch(e) { /* EVCalculator opcional */ }
                            }

                            var banner = document.createElement('div');
                            banner.className = 'smart-gen-analysis';
                            banner.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:14px 18px;border-radius:12px;background:linear-gradient(145deg,rgba(4,120,87,0.12),rgba(15,23,42,0.95));border:1px solid rgba(16,185,129,0.3);';
                            banner.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-size:1.3rem;">📐</span><div><div style="font-weight:900;color:#10B981;font-size:1rem;text-transform:uppercase;letter-spacing:1px;">MATEMÁTICA PURA — ' + strategyName + '</div><div style="font-size:0.72rem;color:#94A3B8;">Motor: SmartCoverageEngine-Async | ' + result.games.length + ' jogos | ⚡ ' + (a.chunksProcessed || '—') + ' lotes</div></div></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:0.75rem;"><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(16,185,129,0.2);"><div style="color:#6EE7B7;font-size:0.6rem;font-weight:700;">DIVERSIDADE (HAMMING)</div><div style="color:#10B981;font-weight:900;font-size:1.3rem;">' + (a.avgHamming || 'N/A') + '</div></div><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(16,185,129,0.2);"><div style="color:#6EE7B7;font-size:0.6rem;font-weight:700;">TEMPO DE PROCESSAMENTO</div><div style="color:#10B981;font-weight:900;font-size:1.3rem;">' + (a.elapsed || 'N/A') + '</div></div></div>' + probHtml + evHtml;

                            var oldBanner = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
                            if (oldBanner) oldBanner.remove();
                            this.gamesContainer.parentNode.insertBefore(banner, this.gamesContainer);
                            banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    );
                    return; // Sai do onclick — o callback cuidará do resultado
                }

                // Geração síncrona (quantidades pequenas — rápido o bastante)
                setTimeout(() => {
                    try {
                        if (typeof SmartCoverageEngine === 'undefined') {
                            alert('SmartCoverageEngine não carregado. Recarregue (Ctrl+Shift+R).');
                            return;
                        }
                        const selectedArr = this.getSelectedNumbers() || [];
                        if (sniperMode && selectedArr.length >= drawSize) {
                            alert('Aviso de Transparência:\n\nVocê ativou o Sniper, mas também selecionou números manualmente no volante.\n\nO sistema respeitará SEUS números e o Sniper automático será DESATIVADO para esta geração.');
                        }
                        const coverageOpts = { precisionMode: sniperMode, precisionPoolSize: sniperPoolSize };
                        const result = SmartCoverageEngine.generate(
                            this.currentGameKey, 
                            qty, 
                            this.getSelectedNumbers(), 
                            this.fixedNumbers, 
                            drawSize, 
                            coverageOpts
                        );

                        if (!result || !result.games || result.games.length === 0) {
                            this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#F59E0B;">Nenhum jogo gerado. Tente novamente.</div>';
                            return;
                        }

                        this.currentGeneratedGames = result.games;
                        this._lastGeneratedGames = result.games;
                        if (typeof ComparisonEngine !== 'undefined') ComparisonEngine.saveResult(sniperMode ? 'sniper' : 'cobertura', result.games, result.analysis, this.currentGameKey);
                        this.renderGames(result, this.currentGameKey);

                        // Banner Unificado com Métricas Reais
                        const a = result.analysis || {};
                        const strategyName = a.strategy === 'CLOSURE' ? 'Fechamento Exato (Steiner)' 
                                           : a.strategy === 'COVERAGE_FAST' ? 'Set Cover (Rápido)' 
                                           : 'Set Cover (Greedy)';
                        
                        let probHtml = '';
                        if (typeof SmartCoverageEngine !== 'undefined' && SmartCoverageEngine.calcRealMetrics) {
                            const realMetrics = SmartCoverageEngine.calcRealMetrics(result.games, this.currentGameKey);
                            if (realMetrics && realMetrics.prizes) {
                                probHtml = '<div style="margin-top:10px;padding:8px;background:rgba(0,0,0,0.4);border-radius:8px;font-size:0.75rem;">' +
                                           '<div style="color:#10B981;font-weight:bold;margin-bottom:4px;">PROBABILIDADES EXATAS (HIPERGEOMÉTRICA)</div>';
                                realMetrics.prizes.slice(0, 3).forEach(p => {
                                    probHtml += '<div style="display:flex;justify-content:space-between;color:#D1D5DB;margin-bottom:2px;">' +
                                                '<span>Acertar ' + p.hits + ':</span><span>' + p.probAtLeastOnePct + '% (em ' + qty + ' jogos)</span></div>';
                                });
                                probHtml += '<div style="color:#6B7280;font-size:0.65rem;margin-top:4px;text-align:right;">* Eventos independentes</div></div>';
                            }
                        }

                        var banner = document.createElement('div');
                        banner.className = 'smart-gen-analysis';
                        banner.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:14px 18px;border-radius:12px;background:linear-gradient(145deg,rgba(4,120,87,0.12),rgba(15,23,42,0.95));border:1px solid rgba(16,185,129,0.3);';
                        banner.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-size:1.3rem;">📐</span><div><div style="font-weight:900;color:#10B981;font-size:1rem;text-transform:uppercase;letter-spacing:1px;">MATEMÁTICA PURA — ' + strategyName + '</div><div style="font-size:0.72rem;color:#94A3B8;">Motor: SmartCoverageEngine | ' + qty + ' jogos</div></div></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:0.75rem;"><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(16,185,129,0.2);"><div style="color:#6EE7B7;font-size:0.6rem;font-weight:700;">DIVERSIDADE (HAMMING)</div><div style="color:#10B981;font-weight:900;font-size:1.3rem;">' + (a.avgHamming || 'N/A') + '</div></div><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(16,185,129,0.2);"><div style="color:#6EE7B7;font-size:0.6rem;font-weight:700;">TEMPO DE PROCESSAMENTO</div><div style="color:#10B981;font-weight:900;font-size:1.3rem;">' + (a.elapsed || 'N/A') + '</div></div></div>' + probHtml;

                        var oldBanner = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
                        if (oldBanner) oldBanner.remove();
                        this.gamesContainer.parentNode.insertBefore(banner, this.gamesContainer);
                        banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } catch(e) {
                        console.error('Erro Cobertura Unificada:', e);
                        this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">Erro: ' + e.message + '</div>';
                    }
                }, 50);
            };
        }

        // === BOTÃO 🎯 GERADOR INTELIGENTE (Motor Unificado v15.0) ===
        const btnGeradorInteligente = document.getElementById('btn-gerador-inteligente');
        if (btnGeradorInteligente) {
            btnGeradorInteligente.onclick = () => {
                const game = GAMES[this.currentGameKey];
                if (!game) return;
                const qty = parseInt(this.gamesQuantityInput.value) || 10;
                const drawSizeSelect = document.getElementById('smart-draw-size');
                const customDrawSize = drawSizeSelect ? parseInt(drawSizeSelect.value) : 0;
                const drawSize = (customDrawSize && customDrawSize >= game.minBet) ? customDrawSize : game.minBet;

                // Verificar modo Sniper
                const sniperToggle = document.getElementById('precision-mode-toggle');
                const sniperMode = sniperToggle ? sniperToggle.checked : false;
                const poolInput = document.getElementById('precision-pool-size');
                const sniperPoolSize = poolInput ? parseInt(poolInput.value) || 20 : 20;

                this._lastGenerationMode = sniperMode ? 'inteligente_sniper' : 'inteligente';
                localStorage.setItem('l99_lastMode', this._lastGenerationMode);
                document.body.setAttribute('data-l99-mode', this._lastGenerationMode);

                // Mostrar ROI Preview ANTES de gerar
                const roiContainer = document.getElementById('roi-preview-container');
                if (roiContainer && typeof ROIDashboard !== 'undefined') {
                    try {
                        roiContainer.innerHTML = ROIDashboard.generateROIPreview(this.currentGameKey, qty);
                        roiContainer.style.display = 'block';
                    } catch(e) { console.warn('[UI] ROIPreview erro:', e); }
                }

                const modeLabel = sniperMode ? '🎯 Gerador Inteligente + Sniper' : '🎯 Gerador Inteligente';
                this.gamesContainer.innerHTML = '<div style="text-align:center;padding:20px;"><div class="sync-loader">' + modeLabel + '...</div></div>';
                if (typeof AsyncGenerator !== 'undefined') {
                    let sp = null;
                    if (sniperMode && typeof StatisticalBiasEngine !== 'undefined') { try { let h = []; if (typeof StatsService !== 'undefined') h = StatsService.getRecentResults(this.currentGameKey, 200) || []; if (h.length === 0 && typeof REAL_HISTORY_DB !== 'undefined') h = REAL_HISTORY_DB[this.currentGameKey] || []; if (h.length >= 30) { const br = StatisticalBiasEngine.analyze(this.currentGameKey, h, sniperPoolSize); if (br && br.topNumbers) sp = br.topNumbers.slice(0, sniperPoolSize); } } catch(e) {} }
                    const sa = this.getSelectedNumbers ? this.getSelectedNumbers() : [];
                    const fa = this.fixedNumbers ? Array.from(this.fixedNumbers) : [];
                    const ao = { precisionMode: sniperMode, precisionPoolSize: sniperPoolSize, drawSize: drawSize };
                    if (sp && sp.length >= drawSize) ao.pool = sp;
                    AsyncGenerator.generatePureAsync(this.currentGameKey, qty, ao, (result, cancelled, error) => {
                        if (cancelled) { this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#F59E0B;">⚠️ Cancelado.</div>'; return; }
                        if (error || !result || !result.games || result.games.length === 0) { this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">Erro: ' + (error ? error.message : 'Nenhum jogo.') + '</div>'; return; }
                        this.currentGeneratedGames = result.games; this._lastGeneratedGames = result.games;
                        if (typeof ComparisonEngine !== 'undefined') ComparisonEngine.saveResult('inteligente', result.games, result.analysis, this.currentGameKey);
                        this.renderGames(result, this.currentGameKey);
                        const a = result.analysis || {};
                        var banner = document.createElement('div'); banner.className = 'smart-gen-analysis';
                        banner.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:14px 18px;border-radius:12px;background:linear-gradient(145deg,rgba(14,165,233,0.12),rgba(15,23,42,0.95));border:1px solid rgba(56,189,248,0.3);';
                        banner.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-size:1.3rem;">🎯</span><div><div style="font-weight:900;color:#38BDF8;font-size:1rem;text-transform:uppercase;">GERADOR INTELIGENTE</div><div style="font-size:0.72rem;color:#94A3B8;">CoverageEngine | ' + result.games.length + ' jogos | ' + (a.elapsed || '') + '</div></div></div>';
                        var ob = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis'); if (ob) ob.remove();
                        this.gamesContainer.parentNode.insertBefore(banner, this.gamesContainer);
                        banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                    return;
                }
                setTimeout(() => {
                    try { const r = PureCoverageEngine.generate(this.currentGameKey, qty, {drawSize}); if (!r||!r.games) return; this.currentGeneratedGames=r.games; this._lastGeneratedGames=r.games; this.renderGames(r, this.currentGameKey); } catch(e) { this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">Erro: '+e.message+'</div>'; }
                }, 50)
            };
        }

        // Pool de Precisão (Sniper) — agora vinculado ao botão Cobertura
        const precisionPoolRow = document.createElement('div');
        precisionPoolRow.id = 'precision-pool-row';
        precisionPoolRow.style.cssText = 'display:none; align-items:center; gap:10px; margin-top:8px; padding:10px 14px; background:linear-gradient(145deg,rgba(245,158,11,0.08),rgba(15,23,42,0.95)); border:1px solid rgba(245,158,11,0.3); border-radius:10px;';
        precisionPoolRow.innerHTML = '<span style="color:#F59E0B;font-size:0.85rem;font-weight:700;white-space:nowrap;">Pool Sniper:</span><input type="number" id="precision-pool-size" min="7" max="100" value="20" style="width:70px;padding:6px 8px;border-radius:8px;border:1px solid rgba(255,215,0,0.5);background:rgba(0,0,0,0.4);color:#FFD700;font-weight:800;font-size:0.95rem;text-align:center;outline:none;height:36px;"><span id="precision-pool-info" style="color:#94A3B8;font-size:0.75rem;flex:1;">números no pool</span>';
        const smartNumbersRow = document.getElementById('smart-numbers-row');
        if (smartNumbersRow && smartNumbersRow.parentNode) {
            smartNumbersRow.parentNode.insertBefore(precisionPoolRow, smartNumbersRow.nextSibling);
        }

        // Toggle Sniper — agora controla o botão Cobertura
        const toggle = document.getElementById('precision-mode-toggle');
        if (toggle && this.generateCoverageBtn) {
            const _self = this;
            const _applyPrecisionUI = (checked) => {
                if (checked) {
                    _self.generateCoverageBtn.innerHTML = '🎯 SNIPER';
                    _self.generateCoverageBtn.style.background = 'linear-gradient(135deg, #D97706, #92400E)';
                    _self.generateCoverageBtn.style.boxShadow = '0 6px 25px rgba(217, 119, 6, 0.5)';
                    _self.generateCoverageBtn.style.borderColor = '#F59E0B';
                    precisionPoolRow.style.display = 'flex';
                    _self._updatePrecisionPoolLimits();
                } else {
                    _self.generateCoverageBtn.innerHTML = '📐 Cobertura IA';
                    _self.generateCoverageBtn.style.background = 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)';
                    _self.generateCoverageBtn.style.boxShadow = '';
                    _self.generateCoverageBtn.style.borderColor = '#10B981';
                    precisionPoolRow.style.display = 'none';
                }
            };
            toggle.addEventListener('change', () => {
                localStorage.setItem('l99_precision_on', toggle.checked ? '1' : '0');
                _applyPrecisionUI(toggle.checked);
            });
            const savedPrecision = localStorage.getItem('l99_precision_on');
            if (savedPrecision === '1') { toggle.checked = true; _applyPrecisionUI(true); }
            // A inicialização do valor agora é feita no _updatePrecisionPoolLimits() para ser sensível à loteria atual
            const poolInput = document.getElementById('precision-pool-size');
            if (poolInput) {
                poolInput.addEventListener('change', () => localStorage.setItem('l99_precision_pool_' + _self.currentGameKey, poolInput.value));
                poolInput.addEventListener('input', () => localStorage.setItem('l99_precision_pool_' + _self.currentGameKey, poolInput.value));
            }
        }

        // === ACOES SECUNDARIAS ===
        if (this.copyBtn) this.copyBtn.onclick = () => this.copyGames();
        if (this.saveBtn) this.saveBtn.onclick = () => this.saveGames();
        if (this.gamesQuantityInput) this.gamesQuantityInput.addEventListener('input', () => this.updateCurrentCostDisplay());
        if (this.smartDrawSizeSelect) this.smartDrawSizeSelect.addEventListener('change', () => this.updateCurrentCostDisplay());
        if (this.checkBtn) this.checkBtn.onclick = () => this.openCheckModal();
        if (this.playCaixaBtn) {
            this.playCaixaBtn.onclick = (e) => {
                e.preventDefault();
                this.openCaixa();
            };
        }

        // Individual Game Copy (Delegation)
        if (this.gamesContainer) {
            this.gamesContainer.addEventListener('click', (e) => {
                const copyBtn = e.target.closest('.copy-single-btn');
                if (copyBtn) {
                    const text = copyBtn.dataset.numbers;
                    this.copyToClipboard(text).then(success => {
                        if (success === true) {
                            const original = copyBtn.innerHTML;
                            copyBtn.innerHTML = 'OK';
                            setTimeout(() => copyBtn.innerHTML = original, 1000);
                        }
                    });
                }
            });
        }

        // Check Modal Events
        if (this.confirmCheckBtn) this.confirmCheckBtn.onclick = () => this.confirmCheck();
        if (this.closeCheckModalBtn) this.closeCheckModalBtn.onclick = () => this.closeCheckModal();

        // Carregar jogos salvos (btn-listar-jogos-salvos)
        const btnListarSalvos = document.getElementById('btn-listar-jogos-salvos');
        const loadGamesInput = document.getElementById('load-games-input');
        if (btnListarSalvos && loadGamesInput) {
            btnListarSalvos.onclick = () => loadGamesInput.click();
            loadGamesInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const text = evt.target.result;
                    const checkInput = document.getElementById('check-input-numbers');
                    if (checkInput) {
                        checkInput.value = text.trim();
                        if (typeof Guardian !== 'undefined' && Guardian.toast) {
                            Guardian.toast(`Arquivo "${file.name}" carregado com sucesso!`, 'success');
                        }
                    }
                    loadGamesInput.value = ''; // Reset para permitir re-seleção
                };
                reader.readAsText(file);
            });
        }

        // Print Button
        const btnPrint = document.getElementById('btn-print');
        if (btnPrint) btnPrint.onclick = () => window.print();

        // Stats Range Toggles
        this.statsButtons.forEach(btn => {
            btn.onclick = () => {
                this.currentStatsRange = parseInt(btn.dataset.range);
                this.statsButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateStats();
            };
        });

        // Clean Header for Print
        window.addEventListener('beforeprint', () => {
            document.title = '\u200B';
            this.insertPrintTimestamp();
        });

        // Initialize Modules
        this.initTutorialEvents();
        this.initInstallEvents();
        this.initQuantum();
        this.initCopyEvents();
        this.initShareEvents();
        this.initStatisticsPanel();

        // Carregar Hot/Cold inicial
        this.updateStats();

        console.log('[UI] initEvents() concluido com sucesso');
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // ════════════════════════════════════════════════════════════
    //  ATUALIZAR ESTATÍSTICAS (Números Quentes / Frios)
    // ════════════════════════════════════════════════════════════
    updateStats() {
        if (typeof StatsService === 'undefined') {
            console.warn('[UI] StatsService não disponível');
            return;
        }
        try {
            const stats = StatsService.getStats(this.currentGameKey, this.currentStatsRange);
            this.renderHotCold(stats);
        } catch (e) {
            console.warn('[UI] Erro ao atualizar stats:', e.message);
        }
    }

    renderHotCold(stats) {
        const hotContainer = this.hotNumbersContainer || document.getElementById('hot-numbers');
        const coldContainer = this.coldNumbersContainer || document.getElementById('cold-numbers');
        if (!hotContainer || !coldContainer) return;

        const gameConfig = (typeof GAMES !== 'undefined') ? GAMES[this.currentGameKey] : null;
        const color = gameConfig ? gameConfig.color : '#10B981';
        const statsCount = gameConfig ? (gameConfig.statsCount || 15) : 15;

        const hotNums = (stats && stats.hot) ? stats.hot.slice(0, statsCount) : [];
        const coldNums = (stats && stats.cold) ? stats.cold.slice(0, statsCount) : [];

        // Render Hot
        hotContainer.innerHTML = hotNums.map(item => {
            const num = String(item.number).padStart(2, '0');
            return '<span class="stat-ball hot" style="--ball-color:' + color + '" title="Saiu ' + item.count + 'x">' + num + '</span>';
        }).join('');

        // Render Cold
        coldContainer.innerHTML = coldNums.map(item => {
            const num = String(item.number).padStart(2, '0');
            return '<span class="stat-ball cold" title="Saiu ' + item.count + 'x | Atraso: ' + item.delay + '">' + num + '</span>';
        }).join('');

        console.log('[UI] Hot/Cold renderizado: ' + hotNums.length + ' quentes, ' + coldNums.length + ' frios (range=' + this.currentStatsRange + ')');
    }

    initCopyEvents() {
        if (this.closeCopyModalBtns) {
            this.closeCopyModalBtns.forEach(btn => {
                btn.onclick = () => {
                    this.copyModal.style.display = 'none';
                };
            });
        }

        const btnSelectAll = document.getElementById('btn-select-all');
        if (btnSelectAll && this.copyTextarea) {
            btnSelectAll.onclick = this.debounce(() => {
                this.copyTextarea.focus();
                this.copyTextarea.select();
            }, 300);
        }
    }

    initTutorialEvents() {
        if (this.btnTutorial && this.tutorialModal) {
            this.btnTutorial.addEventListener('click', () => {
                this.tutorialModal.style.display = 'flex';
            });
        }

        if (this.closeTutorialModalBtns) {
            this.closeTutorialModalBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.tutorialModal.style.display = 'none';
                });
            });
        }

        if (this.btnPrintTutorial) {
            this.btnPrintTutorial.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.getElementById('tutorial-modal');
                if (!modal) return;
                const body = modal.querySelector('.modal-body');
                if (!body) return;

                const printWin = window.open('', '_blank', 'width=800,height=600');
                if (!printWin) { alert('Permita pop-ups para imprimir o tutorial.'); return; }

                printWin.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>B2B Loterias v14.0 — Tutorial Completo</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: #000 !important;
    background: #fff !important;
    padding: 20px 30px;
  }
  h3 { font-size: 18px; margin-bottom: 12px; text-align: center; }
  h4 { font-size: 14px; margin: 14px 0 6px 0; color: #000 !important; }
  p { margin: 4px 0; color: #000 !important; }
  li { color: #000 !important; margin-bottom: 2px; }
  strong { color: #000 !important; }
  ul { margin-left: 20px; }
  div { color: #000 !important; background: none !important; border-color: #999 !important; }
  a { color: #000 !important; text-decoration: none; }
  button { display: none !important; }
  /* Forçar preto e branco */
  @media print {
    * { color: #000 !important; background: #fff !important; -webkit-print-color-adjust: exact; }
    body { padding: 10px 15px; font-size: 12px; }
    div[style*="gradient"] { background: #f5f5f5 !important; border: 1px solid #ccc !important; }
    div[style*="border-left"] { border-left: 3px solid #333 !important; }
    @page { margin: 1.5cm; }
  }
</style>
</head><body>
<h3>📚 B2B Loterias v14.0 — Tutorial Completo</h3>
<hr style="margin:10px 0;border:1px solid #ccc;">
${body.innerHTML}
</body></html>`);
                printWin.document.close();
                setTimeout(() => { printWin.print(); }, 400);
            });
        }
    }

    initInstallEvents() {
        // btn-install agora é um link <a> para INSTALAR_B2B.html — não precisa de handler
        // Apenas garante que o modal antigo não seja aberto por acidente
        if (this.installModal) {
            // Fechar modal antigo se ainda existir (retrocompatibilidade)
            if (this.closeInstallModalBtns) {
                this.closeInstallModalBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.installModal.style.display = 'none';
                    });
                });
            }
        }

        if (this.btnCopyPath && this.folderPathElem) {
            this.btnCopyPath.addEventListener('click', async () => {
                const path = this.folderPathElem.textContent.trim();
                const success = await this.copyToClipboard(path);
                if (success === true) {
                    const originalText = this.btnCopyPath.textContent;
                    this.btnCopyPath.textContent = 'Caminho Copiado!';
                    setTimeout(() => this.btnCopyPath.textContent = originalText, 2000);
                }
            });
        }

        // Backup Button
        if (this.btnBackup) {
            this.btnBackup.addEventListener('click', () => this.exportBackup());
        }
    }

    runQuantumCalculation() {
        const game = typeof GAMES !== 'undefined' ? GAMES[this.currentGameKey] : null;
        if (!game) {
            console.error('[UI] GAMES não carregado ou jogo inválido:', this.currentGameKey);
            if (typeof Guardian !== 'undefined' && Guardian.toast) Guardian.toast('Erro: dados do jogo não carregados. Recarregue a página.', 'error');
            return;
        }

        const count = parseInt(this.quantumCountInput ? this.quantumCountInput.value : 6) || game.minBet;
        const constraints = (typeof QuantumGodEngine !== 'undefined' && QuantumGodEngine.getConstraints) 
            ? QuantumGodEngine.getConstraints(this.currentGameKey) 
            : null;
        const totalNumbers = constraints ? constraints.totalNumbers : (game.range[1] - game.range[0] + 1);

        // Validação: mínimo é o minBet do jogo
        if (count < game.minBet) {
            if (typeof Guardian !== 'undefined' && Guardian.toast) {
                Guardian.toast(`Mínimo de ${game.minBet} números para ${game.name}.`, 'warning');
            } else {
                alert(`Mínimo de ${game.minBet} números para ${game.name}.`);
            }
            if (this.quantumCountInput) this.quantumCountInput.value = game.minBet;
            return;
        }

        // Validação: máximo é o total de números da loteria
        if (count > totalNumbers) {
            if (typeof Guardian !== 'undefined' && Guardian.toast) {
                Guardian.toast(`Limite excedido: ${game.name} possui apenas ${totalNumbers} números.`, 'warning');
            } else {
                alert(`Limite excedido: ${game.name} possui apenas ${totalNumbers} números.`);
            }
            return;
        }

        const statusDiv = this.quantumResults;
        if (!statusDiv) {
            console.error('[UI] quantum-results não encontrado no DOM');
            return;
        }

        statusDiv.innerHTML = '<div class="quantum-placeholder" style="opacity: 1; color: #8B5CF6; font-style: normal;">★ MODO DEUS v9.5 — 21 Camadas + Ciclo Individual + Superposição Quântica...</div>';

        // Phase 1: Analysis
        setTimeout(() => {
            if (!statusDiv.parentNode) return; // Elemento removido do DOM
            statusDiv.innerHTML = '<div class="quantum-placeholder" style="opacity: 1; color: #6366f1; font-style: normal;">★ Bayesian + Markov + Posicional + Cadeias Sequenciais...</div>';

            // Phase 2: Processing
            setTimeout(() => {
                if (!statusDiv.parentNode) return;
                statusDiv.innerHTML = '<div class="quantum-placeholder" style="opacity: 1; color: #ec4899; font-style: normal;">★ Análise 21 Camadas + Walk-Forward → Próximo Sorteio...</div>';

                // Phase 3: Run Engine (with robust error handling + fallback chain)
                setTimeout(() => {
                    try {
                        let suggestion = null;
                        let history = [];
                        try {
                            history = (typeof StatsService !== 'undefined') 
                                ? (StatsService.getRecentResults(this.currentGameKey, 100) || []) 
                                : [];
                        } catch(e) { console.warn('[UI] StatsService.getRecentResults falhou:', e.message); }

                        // Fallback 2: REAL_HISTORY_DB
                        if (history.length < 3 && typeof REAL_HISTORY_DB !== 'undefined' && REAL_HISTORY_DB[this.currentGameKey]) {
                            history = REAL_HISTORY_DB[this.currentGameKey].slice(0, 100);
                            console.log('[UI] Fallback para REAL_HISTORY_DB:', history.length, 'registros');
                        }

                        // Motor 1: NovaEraEngine (preferido)
                        if (typeof NovaEraEngine !== 'undefined' && typeof NovaEraEngine.suggestNumbers === 'function') {
                            try {
                                console.log('[UI] Usando NovaEraEngine.suggestNumbers para ' + this.currentGameKey);
                                // v10.0: Walk-Forward OUT-OF-SAMPLE
                                // Treinar com history[10+], testar contra history[0..9]
                                const trainHistory = history.length > 12 ? history.slice(10) : history;
                                suggestion = NovaEraEngine.suggestNumbers(this.currentGameKey, count, trainHistory);
                            } catch(neErr) {
                                console.warn('[UI] NovaEraEngine falhou:', neErr.message);
                                suggestion = null;
                            }
                        }

                        // Motor 2: QuantumGodEngine (fallback)
                        if ((!suggestion || suggestion.length === 0) && typeof QuantumGodEngine !== 'undefined') {
                            try {
                                console.log('[UI] Fallback para QuantumGodEngine.runSimulation');
                                suggestion = QuantumGodEngine.runSimulation(this.currentGameKey, count, history);
                            } catch(qgeErr) {
                                console.warn('[UI] QuantumGodEngine falhou:', qgeErr.message);
                                suggestion = null;
                            }
                        }

                        // Motor 3: Fallback aleatório (último recurso)
                        let _usedRandomFallback = false;
                        if (!suggestion || suggestion.length === 0) {
                            console.warn('[UI] Todos os motores falharam, usando fallback aleatório');
                            _usedRandomFallback = true;
                            suggestion = [];
                            const pool = [];
                            for (let i = game.range[0]; i <= game.range[1]; i++) pool.push(i);
                            while (suggestion.length < count && pool.length > 0) {
                                suggestion.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
                            }
                            suggestion.sort((a, b) => a - b);
                        }

                        // ★ v11.0: Confiança via Walk-Forward OUT-OF-SAMPLE + Hipergeométrica
                        if (suggestion && suggestion.length > 0 && history.length >= 5) {
                            try {
                                // Walk-Forward REAL: gerar sugestão NOVA para cada sorteio usando só dados posteriores
                                const wfCount = Math.min(10, history.length - 3);
                                const lotteryDraw = game.lotteryDraw || game.minBet;
                                const actualDrawn = this.currentGameKey === 'duplasena' ? lotteryDraw * 2 : lotteryDraw;
                                let totalHits = 0;
                                let totalHitsRandom = 0;
                                for (let t = 0; t < wfCount; t++) {
                                    // Gerar sugestão usando SÓ dados POSTERIORES ao sorteio t (sem data leaking)
                                    const trainHistory = history.slice(t + 1);
                                    let wfSuggestion = suggestion; // fallback
                                    try {
                                        if (typeof NovaEraEngine !== 'undefined' && NovaEraEngine.suggestNumbers) {
                                            wfSuggestion = NovaEraEngine.suggestNumbers(this.currentGameKey, count, trainHistory);
                                        }
                                    } catch(wfErr) { /* usa suggestion original como fallback */ }
                                    
                                    const drawn = new Set((history[t].numbers || []).concat(history[t].numbers2 || []));
                                    let hits = 0;
                                    for (const n of wfSuggestion) { if (drawn.has(n)) hits++; }
                                    totalHits += hits;
                                    
                                    // Baseline aleatório para comparação
                                    totalHitsRandom += suggestion.length * actualDrawn / (game.range[1] - game.range[0] + 1);
                                }
                                const avgHits = totalHits / Math.max(1, wfCount);
                                const totalRange = game.range[1] - game.range[0] + 1;
                                const expectedRandom = totalHitsRandom / Math.max(1, wfCount);
                                const improvement = avgHits / Math.max(0.01, expectedRandom);
                                
                                // v11.0: Confiança = Probabilidade hipergeométrica REAL
                                // P(X >= k) via hipergeométrica: P exata de acertar >= faixa mínima de prêmio
                                let wfConfidence = 10;
                                if (!_usedRandomFallback && typeof MathPureEngine !== 'undefined') {
                                    try {
                                        const minPrize = lotteryDraw >= 15 ? lotteryDraw - 4 : Math.max(2, lotteryDraw - 2);
                                        wfConfidence = Math.round(MathPureEngine.hypergeometricCDF(totalRange, suggestion.length, actualDrawn, minPrize) * 100);
                                    } catch(hErr) {
                                        // Fallback: escala linear baseada em improvement real
                                        wfConfidence = Math.round(Math.min(95, Math.max(5, (improvement - 0.5) * 40)));
                                    }
                                } else if (!_usedRandomFallback) {
                                    wfConfidence = Math.round(Math.min(95, Math.max(5, (improvement - 0.5) * 40)));
                                }

                                if (typeof QuantumGodEngine !== 'undefined') {
                                    QuantumGodEngine._lastConfidence = wfConfidence;
                                    QuantumGodEngine._lastBacktest = {
                                        confidence: wfConfidence,
                                        avgHits: avgHits,
                                        expectedByChance: expectedRandom,
                                        improvement: improvement,
                                        winRate: totalHits > 0 ? avgHits / suggestion.length : 0
                                    };
                                }
                                console.log('[v10.0] Walk-Forward Sugestão: avg=' + avgHits.toFixed(2) + ' vs acaso=' + expectedRandom.toFixed(2) + ' | ' + improvement.toFixed(2) + 'x | Conf=' + wfConfidence + '%');
                            } catch(btErr) {
                                console.warn('[v10.0] Walk-Forward falhou:', btErr.message);
                                if (typeof QuantumGodEngine !== 'undefined') QuantumGodEngine._lastConfidence = 30;
                            }
                        }

                                                // v10.0: Indicador visual de fallback aleatorio
                        if (_usedRandomFallback) {
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.style.cssText = 'text-align:center;padding:8px;margin:6px 0;border-radius:8px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);font-size:0.78rem;color:#EF4444;font-weight:700;';
                            fallbackDiv.textContent = '\u26a0\ufe0f Gerado ALEATORIAMENTE \u2014 motores IA falharam. Recarregue a p\u00e1gina (Ctrl+Shift+R)';
                            this.quantumResults.innerHTML = '';
                            this.quantumResults.appendChild(fallbackDiv);
                        }
console.log('[UI] Sugestão gerada: ' + (suggestion ? suggestion.length : 0) + ' números');
                        this.renderQuantumResults(suggestion);
                    } catch (err) {
                        console.error('[UI] ERRO CRÍTICO no engine:', err);
                        statusDiv.innerHTML = '<div style="color: #ef4444; text-align: center; padding: 10px;">❌ Erro: ' + err.message + '<br><small>Verifique o console (F12) para detalhes</small></div>';
                    }
                }, 100);

            }, 600);

        }, 600);
    }

    renderQuantumResults(numbers) {
        const game = GAMES[this.currentGameKey];
        this.quantumResults.innerHTML = '';
        const card = document.createElement('div');
        card.style.display = 'flex';
        card.style.flexWrap = 'wrap';
        card.style.gap = '6px';
        card.style.justifyContent = 'center';
        card.style.width = '100%';

        if (!numbers || numbers.length === 0) {
            this.quantumResults.innerHTML = '<div style="color: var(--text-secondary); text-align: center; font-size: 0.8rem;">Nenhum número gerado. Tente novamente.</div>';
            return;
        }

        numbers.forEach(num => {
            const ball = this.createBall(num);
            // RESET ALL INLINE STYLES first to avoid conflicts
            ball.style = '';

            // Apply specific styles for the suggestion ball
            ball.style.width = '30px';
            ball.style.height = '30px';
            ball.style.fontSize = '0.85rem';
            ball.style.lineHeight = '28px';

            // Use Game-specific color/accent
            ball.style.backgroundColor = game.color || '#10B981';
            ball.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            ball.style.color = '#ffffff';

            ball.style.fontWeight = '800';
            ball.style.display = 'flex';
            ball.style.alignItems = 'center';
            ball.style.justifyContent = 'center';
            ball.style.borderRadius = '50%';
            ball.style.margin = '1px';
            ball.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
            ball.style.border = '1px solid rgba(255,255,255,0.15)';

            card.appendChild(ball);
        });

        this.quantumResults.appendChild(card);

        // Indicador de Confiança V9
        try {
            const confidence = QuantumGodEngine.getLastConfidence ? QuantumGodEngine.getLastConfidence() : 50;
            const backtest = QuantumGodEngine.getLastBacktest ? QuantumGodEngine.getLastBacktest() : null;
            const confColor = confidence >= 70 ? '#22C55E' : confidence >= 50 ? '#EAB308' : '#EF4444';
            const confEmoji = confidence >= 70 ? '🟢' : confidence >= 50 ? '🟡' : '🔴';
            const confLabel = confidence >= 70 ? 'ALTA' : confidence >= 50 ? 'MODERADA' : 'BAIXA';

            let confHTML = `<div style="margin-top:10px;padding:8px 12px;border-radius:8px;background:rgba(0,0,0,0.3);border:1px solid ${confColor}40;font-size:0.78rem;">`;
            confHTML += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">`;
            confHTML += `<span style="color:${confColor};font-weight:800;">${confEmoji} Confiança: ${confidence}% (${confLabel})</span>`;
            if (backtest && backtest.improvement) {
                const impColor = backtest.improvement >= 1.0 ? '#22C55E' : '#EF4444';
                confHTML += `<span style="color:${impColor};font-weight:700;">${backtest.improvement >= 1.0 ? '↑' : '↓'} ${(backtest.improvement * 100 - 100).toFixed(0)}% vs chance</span>`;
            }
            confHTML += `</div>`;
            if (backtest && backtest.avgHits !== undefined) {
                confHTML += `<div style="color:#94a3b8;font-size:0.72rem;">Média: ${backtest.avgHits.toFixed(1)} acertos (esperado: ${(backtest.expectedByChance || 0).toFixed(1)}) | Taxa de vitória: ${((backtest.winRate || 0) * 100).toFixed(0)}%</div>`;
            }
            confHTML += `</div>`;

            const confDiv = document.createElement('div');
            confDiv.innerHTML = confHTML;
            this.quantumResults.appendChild(confDiv);
        } catch(e) { console.log('Conf indicator error:', e); }

        // Update formula again for "Next Run"
        try { this.quantumFormula.textContent = QuantumService.getFormula(); } catch(e) {}

        // ── HELPER: obter histórico robusto (StatsService + fallback REAL_HISTORY_DB) ────
        const _getHistory = (gameKey, maxCount) => {
            let h = [];
            try { h = StatsService.getRecentResults(gameKey, maxCount) || []; } catch(e) { console.warn('[UI] Falha no StatsService (historico):', e.message); }
            // Fallback: usar REAL_HISTORY_DB diretamente se StatsService retornar vazio
            if (h.length < 3 && typeof REAL_HISTORY_DB !== 'undefined' && REAL_HISTORY_DB[gameKey]) {
                h = REAL_HISTORY_DB[gameKey].slice(0, maxCount);
                console.log('[UI] Fallback para REAL_HISTORY_DB:', h.length, 'registros');
            }
            return h;
        };


        // v10.0: DIAGNOSTICO REAL de engines carregados
        const enginesLoaded = [
            typeof NovaEraEngine !== 'undefined'        ? '\u269b\ufe0fNE-v10'  : null,
            typeof PrecisionEngine !== 'undefined'      ? '\ud83c\udfafPE-v2'   : null,
            typeof SmartBetsEngine !== 'undefined'      ? '\ud83e\udde0SB-v1'   : null,
            typeof PrecisionCalibrator !== 'undefined'  ? '\ud83d\udcd0PC-v1'   : null,
        ].filter(Boolean);
        const diagDiv = document.createElement('div');
        diagDiv.style.cssText = 'text-align:center;font-size:0.58rem;color:#475569;padding:3px 0 1px;letter-spacing:0.5px;';
        diagDiv.textContent = 'v10.0 | 21 Dimensões | ' + enginesLoaded.join(' \u00b7 ');
        this.quantumResults.appendChild(diagDiv);
    }

    useQuantumNumbers() {
        const resultDiv = this.quantumResults;
        const balls = resultDiv.querySelectorAll('.ball');

        if (balls.length === 0) {
            alert("Gere uma sugestão quântica primeiro!");
            return;
        }

        // IMPORTANTE: Extrair números ANTES de clearSelection (que limpa o DOM)
        const numbersToSelect = [];
        balls.forEach(b => {
            const n = parseInt(b.textContent);
            if (!isNaN(n)) numbersToSelect.push(n);
        });

        if (numbersToSelect.length === 0) return;

        // Limpar seleção atual (mas preservar os números já extraídos)
        this.selectedNumbers.clear();
        this.fixedNumbers.clear();
        this.isFixedMode = false;
        this.btnFixedMode.classList.remove('active');
        this.fixedInfoPanel.style.display = 'none';
        const selectedEls = this.gridContainer.querySelectorAll('.selected, .fixed');
        selectedEls.forEach(el => {
            el.classList.remove('selected');
            el.classList.remove('fixed');
        });
        this.gamesContainer.innerHTML = '<div class="empty-state">Selecione as opções e clique em Gerar Jogos</div>';

        const game = GAMES[this.currentGameKey];

        let addedCount = 0;
        numbersToSelect.forEach(num => {
            const el = this.gridContainer.querySelector(`.grid-num[data-number="${num}"]`);
            if (el) {
                this.selectedNumbers.add(num);
                el.classList.add('selected');
                addedCount++;
            }
        });

        this.updateSelectionInfo();

        // Scroll para a grade
        this.gridContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ╔══════════════════════════════════════════════════════════╗
    // ║  MANUAL: Métodos auxiliares de fechamento combinatório   ║
    // ╚══════════════════════════════════════════════════════════╝

    // ╔══════════════════════════════════════════════════════════╗
    // ║  POOL PRECISÃO — LIMITES DINÂMICOS POR LOTERIA           ║
    // ╚══════════════════════════════════════════════════════════╝
    _updatePrecisionPoolLimits() {
        const poolInput = document.getElementById('precision-pool-size');
        if (!poolInput) return;

        const game = GAMES[this.currentGameKey];
        if (!game) return;

        const drawSize = game.minBet;
        const totalRange = game.range[1] - game.range[0] + 1;
        const minPool = drawSize + 1; // Mínimo: drawSize + 1
        const maxPool = totalRange; // Máximo: total de números

        // Default inteligente por loteria
        let defaultPool = Math.min(totalRange, Math.max(20, drawSize + Math.ceil(drawSize * 0.45)));
        if (this.currentGameKey === 'lotomania') defaultPool = 90; // Exigência do usuário
        if (this.currentGameKey === 'lotofacil') defaultPool = 21;
        if (this.currentGameKey === 'megasena') defaultPool = 40;

        poolInput.min = minPool;
        poolInput.max = maxPool;
        
        // Ao invés de preservar o valor da loteria anterior, 
        // vamos carregar o valor salvo especificamente para ESTA loteria, ou usar o default inteligente!
        const savedPool = localStorage.getItem('l99_precision_pool_' + this.currentGameKey);
        
        let targetValue = savedPool ? parseInt(savedPool) : defaultPool;
        
        // Se o valor estiver corrompido ou fora dos limites, forçar o default
        if (targetValue < minPool || targetValue > maxPool) {
            targetValue = defaultPool;
        }

        poolInput.value = targetValue;
        
        poolInput.title = `Mín: ${minPool} | Máx: ${maxPool} | Padrão: ${defaultPool}`;

        // Atualizar texto info
        const infoSpan = document.getElementById('precision-pool-info');
        if (infoSpan) {
            infoSpan.textContent = `Mín: ${minPool} | Máx: ${maxPool} | Padrão: ${defaultPool}`;
        }
    }

    // ╔══════════════════════════════════════════════════════════╗
    // ║  GERAR JOGOS COM IA (SMART BETS + MODO PRECISÃO)        ║
    // ╚══════════════════════════════════════════════════════════╝
    runSmartGeneration() {
        const game = GAMES[this.currentGameKey];
        if (!game) return;

        // ── PROTEÇÃO DOUBLE-CLICK ──
        if (this._isGenerating) {
            console.warn('[SmartBets] Geração já em andamento, ignorando clique duplo');
            return;
        }
        this._isGenerating = true;

        // Verificar se Modo Precisão está ativo
        const precisionCheckbox = document.getElementById('precision-mode-toggle');
        const isPrecisionMode = precisionCheckbox && precisionCheckbox.checked;

        // ── RASTREAMENTO DE MODO ── ★ FIX v14: QUANTUM L99 grava como 'quantum_l99'
        const _modeKey = 'quantum_l99';
        this._lastGenerationMode = _modeKey; localStorage.setItem('l99_lastMode', _modeKey); document.body.setAttribute('data-l99-mode', _modeKey);
        this._lastPrecisionMode = isPrecisionMode;
        this._lastDrawSize = this.smartDrawSizeSelect ? parseInt(this.smartDrawSizeSelect.value) || game.minBet : game.minBet;

        const quantity = parseInt(this.gamesQuantityInput.value) || 10;
        let selectedArr = Array.from(this.selectedNumbers);
        const fixedArr = Array.from(this.fixedNumbers);

        // Ler quantidade de números por jogo IA
        const customDrawSize = this.smartDrawSizeSelect
            ? parseInt(this.smartDrawSizeSelect.value) || game.minBet
            : game.minBet;

        // V10 FIX: Expand pool to full board if user only selected fixed numbers
        if (fixedArr.length > 0 && selectedArr.length === fixedArr.length) {
            selectedArr = [];
            for (let i = game.range[0]; i <= game.range[1]; i++) selectedArr.push(i);
        }

        // AUTO-USAR números sugeridos pela fórmula IA (se nenhum selecionado no grid)
        let _quantumInjected = false;
        if (selectedArr.length === 0 && this.quantumResults) {
            const quantumBalls = this.quantumResults.querySelectorAll('.ball');
            if (quantumBalls.length > 0) {
                const quantumNums = [];
                quantumBalls.forEach(b => {
                    const n = parseInt(b.textContent);
                    if (!isNaN(n)) quantumNums.push(n);
                });
                if (quantumNums.length > 0) {
                    selectedArr = quantumNums;
                    _quantumInjected = true;
                    console.log(`[SmartBets] 🔮 Usando ${quantumNums.length} números da Telepatia Quântica como pool`);
                }
            }
        }

        // V9: Sem validação restritiva — qualquer quantidade de selecionados é aceita
        // O motor IA usa os selecionados como pool preferencial (veja smart_bets.js)
        // Só bloquear se 0 < selected < 2 (impossível de fazer qualquer jogo)
        if (selectedArr.length > 0 && selectedArr.length < 2) {
            alert(`Selecione pelo menos ${customDrawSize} números (ou nenhum para usar análise completa).`);
            return;
        }

        // Limpar feedback anterior
        const oldFeedback = this.gamesContainer.parentNode.querySelector('.generation-feedback');
        if (oldFeedback) oldFeedback.remove();
        const oldAnalysis = this.gamesContainer.parentNode.querySelector('.smart-analysis-panel');
        if (oldAnalysis) oldAnalysis.remove();
        const oldCaixaBtn = document.getElementById('caixa-panel');
        if (oldCaixaBtn) oldCaixaBtn.remove();

        // V9: Indicador de modo ★ FIX: mostrar quando usa Quantum auto-injeção
        const modeLabel = _quantumInjected
            ? `🔮 ${selectedArr.length} números da Telepatia Quântica → pool preferencial`
            : selectedArr.length > 0
                ? `🎯 ${selectedArr.length} números selecionados → gerando variantes`
                : '🧠 Análise IA completa do universo';

        // Loading - QUANTUM L99 (Honesto)
        this.gamesContainer.innerHTML = `
            <div style="text-align:center;padding:40px;background:linear-gradient(145deg,rgba(10,10,30,0.95),rgba(20,10,40,0.9));border-radius:16px;border:1px solid rgba(139,92,246,0.3);">
                <div style="font-size:2.5rem;margin-bottom:8px;">⚙️</div>
                <div style="color:#A78BFA;font-weight:900;font-size:1rem;text-transform:uppercase;letter-spacing:1px;">PROCESSANDO ANÁLISE + SET COVER</div>
                <div style="color:#94A3B8;font-size:0.8rem;margin-top:6px;">${modeLabel}</div>
                <div style="margin-top:12px;width:70%;height:4px;background:rgba(139,92,246,0.15);border-radius:4px;margin-left:auto;margin-right:auto;overflow:hidden;">
                    <div style="width:30%;height:100%;background:linear-gradient(90deg,#8B5CF6,#FFD700);border-radius:4px;animation:smartProgress 1s ease-in-out infinite;"></div>
                </div>
            </div>
            <style>@keyframes smartProgress{0%{width:10%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:10%;margin-left:90%}}</style>
        `;

        // ═══ v15.0: GERAÇÃO ASSÍNCRONA para grandes volumes ═══
        if (typeof AsyncGenerator !== 'undefined' && AsyncGenerator.shouldUseAsync(quantity, this.currentGameKey)) {
            const sniperToggle = document.getElementById('precision-mode-toggle');
            const sniperMode = sniperToggle ? sniperToggle.checked : false;
            const poolInput = document.getElementById('precision-pool-size');
            const sniperPoolSize = poolInput ? parseInt(poolInput.value) || 20 : 20;
            const aiOpts = { precisionMode: sniperMode, precisionPoolSize: sniperPoolSize };

            AsyncGenerator.generateCoverageAsync(
                this.currentGameKey, quantity,
                selectedArr.length >= customDrawSize ? selectedArr : null,
                fixedArr, customDrawSize, aiOpts,
                (result, cancelled, error) => {
                    this._isGenerating = false;
                    if (cancelled) {
                        this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#F59E0B;">⚠️ Geração cancelada pelo usuário.</div>';
                        return;
                    }
                    if (error || !result || !result.games || result.games.length === 0) {
                        this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">Erro: ' + (error ? error.message : 'Nenhum jogo gerado.') + '</div>';
                        return;
                    }

                    this.currentGeneratedGames = result.games;
                    this._lastGeneratedGames = result.games;
                    if (typeof ComparisonEngine !== 'undefined') ComparisonEngine.saveResult('quantum_l99', result.games, result.analysis, this.currentGameKey);
                    this.renderGames(result, this.currentGameKey);

                    var sa = result.analysis || {};
                    var banner = document.createElement('div');
                    banner.className = 'smart-gen-analysis';
                    banner.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:14px 18px;border-radius:12px;background:linear-gradient(145deg,rgba(139,92,246,0.12),rgba(15,23,42,0.95));border:1px solid rgba(139,92,246,0.3);';
                    banner.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-size:1.3rem;">&#x26A1;</span><div><div style="font-weight:900;color:#A78BFA;font-size:1rem;text-transform:uppercase;letter-spacing:1px;">QUANTUM L99 — ESTATÍSTICA + SET COVER</div><div style="font-size:0.72rem;color:#94A3B8;">Motor: Ciência 21-Dim → CoverageEngine-Async | ' + result.games.length + ' jogos | ⚡ ' + (sa.chunksProcessed || '—') + ' lotes</div></div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.75rem;"><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(139,92,246,0.2);" title="Cobertura de dezenas únicas sobre o universo da loteria"><div style="color:#C4B5FD;font-size:0.6rem;font-weight:700;">COBERTURA NUMÉRICA</div><div style="color:#A78BFA;font-weight:900;font-size:1.3rem;">' + (sa.coverage||0) + '%</div></div><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(139,92,246,0.2);" title="Diversidade combinatória entre os jogos"><div style="color:#C4B5FD;font-size:0.6rem;font-weight:700;">DIVERSIDADE</div><div style="color:#A78BFA;font-weight:900;font-size:1.3rem;">' + (sa.diversity||0) + '%</div></div><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(139,92,246,0.2);" title="Tempo real de processamento do algoritmo"><div style="color:#C4B5FD;font-size:0.6rem;font-weight:700;">TEMPO REAL</div><div style="color:#A78BFA;font-weight:900;font-size:1.3rem;">' + (sa.elapsed || 'N/A') + '</div></div></div>';
                    var ob = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
                    if (ob) ob.remove();
                    this.gamesContainer.parentNode.insertBefore(banner, this.gamesContainer);
                    banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            );
            return; // Sai — o callback cuidará do resultado
        }

        // Geração síncrona (quantidades pequenas — rápido o bastante)
        setTimeout(() => {
            try {
                if (typeof NovaEraEngine === 'undefined') {
                    this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">NovaEraEngine nao carregado. Recarregue (Ctrl+Shift+R).</div>';
                    this._isGenerating = false;
                    return;
                }
                const sniperToggle = document.getElementById('precision-mode-toggle');
                const sniperMode = sniperToggle ? sniperToggle.checked : false;
                const poolInput = document.getElementById('precision-pool-size');
                const sniperPoolSize = poolInput ? parseInt(poolInput.value) || 20 : 20;
                const aiOpts = { precisionMode: sniperMode, precisionPoolSize: sniperPoolSize };

                const smartResult = NovaEraEngine.generate(this.currentGameKey, quantity, selectedArr.length >= customDrawSize ? selectedArr : null, fixedArr, customDrawSize, aiOpts);
                if (!smartResult || !smartResult.games || smartResult.games.length === 0) {
                    this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#F59E0B;">Nenhum jogo gerado. Tente novamente.</div>';
                    this._isGenerating = false;
                    return;
                }
                this.currentGeneratedGames = smartResult.games;
                this._lastGeneratedGames = smartResult.games;
                if (typeof ComparisonEngine !== 'undefined') ComparisonEngine.saveResult('quantum_l99', smartResult.games, smartResult.analysis, this.currentGameKey);
                this.renderGames(smartResult, this.currentGameKey);
                // Banner HONESTO — Métricas reais do Set Cover + Ciência
                var sa = smartResult.analysis || {};
                var banner = document.createElement('div');
                banner.className = 'smart-gen-analysis';
                banner.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:14px 18px;border-radius:12px;background:linear-gradient(145deg,rgba(139,92,246,0.12),rgba(15,23,42,0.95));border:1px solid rgba(139,92,246,0.3);';
                banner.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span style="font-size:1.3rem;">&#x26A1;</span><div><div style="font-weight:900;color:#A78BFA;font-size:1rem;text-transform:uppercase;letter-spacing:1px;">QUANTUM L99 — ESTATÍSTICA + SET COVER</div><div style="font-size:0.72rem;color:#94A3B8;">Motor: Ciência 21-Dim → CoverageEngine Multi-Tier | ' + quantity + ' jogos</div></div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.75rem;"><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(139,92,246,0.2);" title="Cobertura de dezenas únicas sobre o universo da loteria"><div style="color:#C4B5FD;font-size:0.6rem;font-weight:700;">COBERTURA NUMÉRICA</div><div style="color:#A78BFA;font-weight:900;font-size:1.3rem;">' + (sa.coverage||0) + '%</div></div><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(139,92,246,0.2);" title="Diversidade combinatória entre os jogos"><div style="color:#C4B5FD;font-size:0.6rem;font-weight:700;">DIVERSIDADE</div><div style="color:#A78BFA;font-weight:900;font-size:1.3rem;">' + (sa.diversity||0) + '%</div></div><div style="text-align:center;padding:10px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(139,92,246,0.2);" title="Tempo real de processamento do algoritmo"><div style="color:#C4B5FD;font-size:0.6rem;font-weight:700;">TEMPO REAL</div><div style="color:#A78BFA;font-weight:900;font-size:1.3rem;">' + (sa.elapsed || 'N/A') + 'ms</div></div></div>';
                var ob = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
                if (ob) ob.remove();
                this.gamesContainer.parentNode.insertBefore(banner, this.gamesContainer);
                banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch(e) {
                console.error('[SmartBets] Erro:', e);
                this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">Erro: ' + e.message + '</div>';
            } finally {
                this._isGenerating = false;
            }
        }, 50);
    }


    initQuantum() {
        if (this.btnQuantumCalculate) {
            this.btnQuantumCalculate.onclick = () => this.runQuantumCalculation();
        }
        if (this.btnUseQuantum) {
            this.btnUseQuantum.onclick = () => this.useQuantumNumbers();
        }

        // ── Botão de Análise Manual da Seleção ──────────────────────────────
        const btnAnalyse = document.getElementById('btn-analyse-selection');
        if (btnAnalyse) {
            btnAnalyse.onclick = () => {
                const container = document.getElementById('ae-manual-container');
                if (!container) return;

                const nums = [...this.selectedNumbers].sort((a, b) => a - b);
                if (nums.length < 2) {
                    container.innerHTML = '<div style="color:#EF4444;font-size:0.72rem;padding:8px;text-align:center;">⚠️ Selecione pelo menos 2 números no grid para analisar.</div>';
                    return;
                }

                container.innerHTML = '<div style="color:#8B5CF6;font-size:0.72rem;padding:8px;text-align:center;">🔬 Analisando ' + nums.length + ' números em 12 dimensões...</div>';

                setTimeout(() => {
                    try {
                        const history = StatsService.getRecentResults(this.currentGameKey, 100) || [];
                        const analysis = AnalysisEngine.analyze(this.currentGameKey, nums, history);
                        if (analysis) {
                            AnalysisEngine.renderPanel(analysis, container);
                        } else {
                            container.innerHTML = '<div style="color:#EF4444;font-size:0.72rem;padding:8px;text-align:center;">⚠️ Histórico insuficiente para análise.</div>';
                        }
                    } catch (e) {
                        container.innerHTML = '<div style="color:#EF4444;font-size:0.72rem;padding:8px;text-align:center;">⚠️ Erro: ' + e.message + '</div>';
                        console.error('[AE] Erro análise manual:', e);
                    }
                }, 150);
            };
        }

        // ── Botão de Análise por Grupos (Lotofácil exclusivo) ────────────────
        const btnGroup = document.getElementById('btn-group-analysis');
        if (btnGroup) {
            btnGroup.onclick = () => {
                const container = document.getElementById('lge-group-container');
                if (!container) return;
                container.innerHTML = '<div style="color:#c026d3;font-size:0.72rem;padding:8px;text-align:center;">🎯 Carregando análise de grupos...</div>';
                setTimeout(() => {
                    try {
                        const history = StatsService.getRecentResults(this.currentGameKey, 200) || [];
                        if (history.length < 5) {
                            container.innerHTML = '<div style="color:#EF4444;font-size:0.72rem;padding:8px;text-align:center;">⚠️ Histórico insuficiente.</div>';
                            return;
                        }
                        // Usar UniversalGroupEngine para todas as loterias
                        if (typeof UniversalGroupEngine !== 'undefined' && UniversalGroupEngine.CONFIGS[this.currentGameKey]) {
                            const result = UniversalGroupEngine.generate(this.currentGameKey, history);
                            container.innerHTML = '';
                            UniversalGroupEngine.renderPanel(result.analysis, container, result);
                        } else if (this.currentGameKey === 'lotofacil' && typeof LotofacilGroupEngine !== 'undefined') {
                            // Fallback para o motor específico da Lotofácil
                            const result = LotofacilGroupEngine.generate(history, 15, true);
                            container.innerHTML = '';
                            LotofacilGroupEngine.renderPanel(result.analysis, container, result);
                        } else {
                            container.innerHTML = '<div style="color:#EF4444;font-size:0.72rem;padding:8px;text-align:center;">⚠️ Motor de grupos não disponível.</div>';
                        }
                    } catch (e) {
                        container.innerHTML = '<div style="color:#EF4444;font-size:0.72rem;padding:8px;text-align:center;">⚠️ Erro: ' + e.message + '</div>';
                        console.error('[UGE] Erro análise por grupos:', e);
                    }
                }, 100);
            };
        }

        // ── Botão Estratégia Dual 2 Grupos (Lotofácil exclusivo) ────────────────
        const btnDualStrat = document.getElementById('btn-dual-strategy');
        if (btnDualStrat) {
            btnDualStrat.onclick = () => {
                if (this.currentGameKey !== 'lotofacil') return;
                const container = document.getElementById('dual-strategy-container');
                if (!container) return;

                const gameCount = Math.max(1, Math.min(100, parseInt(this.gamesQuantityInput?.value) || 10));

                container.innerHTML = `<div style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(76,29,149,0.1));border:1px solid #7c3aed60;border-radius:10px;padding:14px;text-align:center;margin-top:8px;">
                    <div style="font-size:1.5rem;margin-bottom:6px;">⚡</div>
                    <div style="color:#a78bfa;font-weight:700;font-size:0.88rem;">Analisando Estratégia Dual 2G...</div>
                    <div style="color:#6d28d9;font-size:0.72rem;margin-top:4px;">Calculando melhor divisão dos 25 números em 2 macro-grupos para ${gameCount} jogo${gameCount>1?'s':''}...</div>
                    <div style="margin-top:10px;height:3px;background:rgba(124,58,237,0.2);border-radius:2px;overflow:hidden;">
                        <div style="height:100%;background:linear-gradient(90deg,#7c3aed,#a855f7,#c084fc);border-radius:2px;animation:dualProgress 1.2s ease-in-out infinite;width:40%;"></div>
                    </div>
                    <style>@keyframes dualProgress{0%{width:10%;margin-left:0}50%{width:70%;margin-left:15%}100%{width:10%;margin-left:90%}}</style>
                </div>`;

                setTimeout(() => {
                    try {
                        if (typeof LotofacilDualStrategy === 'undefined') {
                            container.innerHTML = '<div style="color:#EF4444;padding:10px;text-align:center;">⚠️ Motor LDSE-V1 não carregado. Recarregue (Ctrl+Shift+R).</div>';
                            return;
                        }

                        let history = [];
                        try { history = StatsService.getRecentResults('lotofacil', 300) || []; } catch(e) {}
                        if (history.length < 5 && typeof REAL_HISTORY_DB !== 'undefined' && REAL_HISTORY_DB.lotofacil) {
                            history = REAL_HISTORY_DB.lotofacil.slice(0, 300);
                        }
                        if (history.length < 5) {
                            container.innerHTML = '<div style="color:#EF4444;padding:10px;text-align:center;">⚠️ Histórico insuficiente para análise dual.</div>';
                            return;
                        }

                        const result = LotofacilDualStrategy.generate(history, gameCount);

                        if (!result || !result.games || result.games.length === 0) {
                            container.innerHTML = '<div style="color:#EF4444;padding:10px;text-align:center;">⚠️ Não foi possível gerar jogos com a estratégia dual.</div>';
                            return;
                        }

                        container.innerHTML = '';
                        LotofacilDualStrategy.renderPanel(result.analysis, result, container);

                        // Renderizar jogos na área principal
                        const gamesData = {
                            games: result.games.map(g => g.numbers),
                            analysis: {
                                confidence: 79,
                                coverage: Math.round(new Set(result.games.flatMap(g => g.numbers)).size / 25 * 100),
                                diversity: 87,
                                mode: 'DUAL-2G',
                                uniqueNumbers: new Set(result.games.flatMap(g => g.numbers)).size
                            }
                        };
                        this.renderGames(gamesData, 'lotofacil');

                        // Feedback
                        const fb = document.createElement('div');
                        fb.className = 'generation-feedback';
                        fb.style.cssText = 'color:#a78bfa;text-align:center;padding:10px;font-weight:bold;margin-top:8px;font-size:0.88rem;';
                        fb.textContent = `⚡ ${result.games.length} jogos gerados via Estratégia Dual 2G — Split: ${result.bestSplit?.id || 'S4'}`;
                        const oldFb = this.gamesContainer.parentNode.querySelector('.generation-feedback');
                        if (oldFb) oldFb.remove();
                        this.gamesContainer.parentNode.insertBefore(fb, this.gamesContainer);

                        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        console.log(`[LDSE] ✅ ${result.games.length} jogos | Split: ${result.bestSplit?.name}`);

                    } catch (e) {
                        container.innerHTML = `<div style="color:#EF4444;padding:10px;text-align:center;">⚠️ Erro LDSE: ${e.message}</div>`;
                        console.error('[LDSE] Erro:', e);
                    }
                }, 150);
            };
        }
    }

    initShareEvents() {
        // Handler de share é gerenciado pelo script inline no HTML
    }

    updateUrlHash() {
        // Disabled: prevents auto-generation bug on page refresh
    }

    restoreGamesFromHash() {
        // Disabled: prevents auto-generation bug on page refresh
        // Clear any leftover hash
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname);
        }
    }

    insertPrintTimestamp() {
        // Remove old dynamic div if it exists (cleanup)
        const old = document.getElementById('print-timestamp-display');
        if (old) old.remove();

        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR');

        // Capture Game Name
        const game = GAMES[this.currentGameKey];
        const gameName = game ? game.name : 'Loteria';

        // Get Next Draw Number
        StatsService.ensureHistory(this.currentGameKey);
        const latestResult = StatsService.getRecentResults(this.currentGameKey, 1)[0];
        const nextDrawNumber = latestResult ? latestResult.drawNumber + 1 : '???';

        // Target the existing Print Title H1
        const printTitle = document.querySelector('.print-title');
        if (printTitle) {
            printTitle.style.display = 'block'; // Ensure it's visible
            printTitle.innerHTML = `
                <div style="font-size: 18pt; margin-bottom: 5px;">${gameName}</div>
                <div style="font-size: 11pt; font-weight: normal; text-transform: none;">
                    <span>Concurso: <strong>${nextDrawNumber}</strong></span>
                    <span style="margin: 0 10px;">|</span>
                    <span>Data: ${dateStr} - ${timeStr}</span>
                </div>
            `;
        }
    }

    addInstallButton() {
        // Carregar prêmios nos botões de navegação
        this.loadAllNavPrizes();
    }

    async loadAllNavPrizes() {
        const gameKeys = Object.keys(GAMES);
        for (const key of gameKeys) {
            // Mostrar fallback imediatamente enquanto carrega API
            const elemFallback = document.getElementById(`prize-nav-${key}`);
            const fallbackAmount = GAMES[key].estimatedPrizeFallback || 0;
            if (elemFallback && fallbackAmount > 0) {
                elemFallback.textContent = this._formatPrizeShort(fallbackAmount);
            }

            (async () => {
                try {
                    await StatsService.ensureHistory(key);
                    const prizeInfo = StatsService.getPrizeInfo(key);
                    const elem = document.getElementById(`prize-nav-${key}`);
                    if (!elem) return;

                    const amount = prizeInfo ? (prizeInfo.estimatedPrize || prizeInfo.accumulatedPrize || 0) : 0;
                    if (amount > 0) {
                        elem.textContent = this._formatPrizeShort(amount);
                        if (prizeInfo.accumulated) {
                            elem.textContent += ' 🔥';
                        }
                        // Also update main prize display if this is the currently active game
                        if (key === this.currentGameKey) {
                            this.updatePrizeDisplay(key);
                        }
                    }
                    // Se API não retornou nada, mantém o fallback já exibido
                } catch (e) {
                    // Mantém o fallback já exibido
                }
            })();
        }
    }

    _formatPrizeShort(amount) {
        if (amount >= 1_000_000) {
            return `R$ ${(amount / 1_000_000).toFixed(1).replace('.', ',')} M`;
        } else if (amount >= 1_000) {
            return `R$ ${(amount / 1_000).toFixed(0)}K`;
        }
        return `R$ ${amount.toFixed(0)}`;
    }

    updateTheme(color) {
        this.root.style.setProperty('--primary-accent', color);
    }

    updateGameInfo(gameKey) {
        this.currentGameKey = gameKey;
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        if (!game) {
            console.error('[UI] Dados da loteria não encontrados para: ' + gameKey);
            return;
        }

        this.updateTheme(game.color);
        this.updateCountdown(gameKey);

        // Atualizar link do botão Jogar Online com a loteria atual
        var cfgLink = this._getCaixaLotteryConfig();
        if (this.playCaixaBtn && cfgLink[gameKey]) {
            this.playCaixaBtn.href = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + cfgLink[gameKey].url;
        }
        // Atualizar link da Caixa na sidebar também
        var sidebarCaixaLink = document.getElementById('btn-caixa-link');
        if (sidebarCaixaLink && cfgLink[gameKey]) {
            sidebarCaixaLink.href = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + cfgLink[gameKey].url;
        }

        // Botão de análise de grupos: disponível para TODAS as loterias via UniversalGroupEngine
        const btnGroup = document.getElementById('btn-group-analysis');
        const lgeContainer = document.getElementById('lge-group-container');
        if (btnGroup) {
            const hasConfig = typeof UniversalGroupEngine !== 'undefined' &&
                              UniversalGroupEngine.CONFIGS && UniversalGroupEngine.CONFIGS[gameKey];
            btnGroup.style.display = hasConfig ? 'block' : 'none';
            if (hasConfig) {
                const groupCount = UniversalGroupEngine.CONFIGS[gameKey].groups.length;
                btnGroup.textContent = `🎯 Análise por Grupos (${groupCount}G) — ${game.name}`;
            }
        }
        if (lgeContainer) lgeContainer.innerHTML = '';

        // Botão Estratégia Dual 2G — exclusivo Lotofácil
        const btnDual = document.getElementById('btn-dual-strategy');
        const dualContainer = document.getElementById('dual-strategy-container');
        if (btnDual) {
            btnDual.style.display = gameKey === 'lotofacil' ? 'block' : 'none';
        }
        if (dualContainer) dualContainer.innerHTML = '';

        this.navButtons.forEach(btn => {
            const isActive = btn.dataset.game === gameKey;
            const gameData = GAMES[btn.dataset.game];
            const c1 = gameData ? gameData.color : '#10B981';

            if (isActive) {
                btn.classList.add('active');
                btn.style.background = `linear-gradient(135deg, ${game.color}, ${game.colorGrad || game.color})`;
                btn.style.boxShadow = `0 8px 32px ${game.color}aa, 0 0 15px #FFD70088, inset 0 0 0 1px rgba(255,255,255,0.5)`;
                btn.style.borderColor = `#FFD700`; // Always Gold
                btn.style.color = 'white';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'rgba(255,255,255,0.08)';
                btn.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.2)';
                btn.style.borderColor = `#FFD70066`; // Semi-transparent Gold
                btn.style.color = 'rgba(255,255,255,0.9)';
            }
        });

        // Initialize display to avoid jumpiness
        this.currentGameTitle.innerHTML = `${game.name} <span class="next-draw-tag" style="font-size: 0.6em; opacity: 0.8; margin-left:10px;">(Concurso: ...)</span>`;

        if (this.recentResultsContainer) {
            this.recentResultsContainer.innerHTML = '<div class="sync-loader">Sincronizando com a Caixa...</div>';
        }

        // ━━ DROPDOWN DINÂMICO v3.0 ━━
        this._rebuildClosingDropdown(gameKey, true); // true = forçar 'generate'

        // ━━ EVENTO: Preview do Fechamento em tempo real ━━
        this.closingSelect.onchange = () => this._updateClosingPreview();

        this.maxSelectionElem.textContent = game.maxBet;
        this.selectedNumbers.clear();
        this.fixedNumbers.clear();
        this.isFixedMode = false;
        this.btnFixedMode.classList.remove('active');
        this.btnFixedMode.textContent = '📌 Fixar';
        this.fixedInfoPanel.style.display = 'none';

        // ━━ MÊS DA SORTE — visível apenas para Dia de Sorte ━━
        const mesSorteRow = document.getElementById('mes-sorte-row');
        if (mesSorteRow) {
            mesSorteRow.style.display = gameKey === 'diadesorte' ? 'grid' : 'none';
        }

        // Mostrar toggle Modo Sniper para todas as loterias
        const sniperToggleParent = document.getElementById('sniper-label-text');
        if (sniperToggleParent && sniperToggleParent.parentElement) {
            sniperToggleParent.parentElement.style.display = 'flex';
            this._updatePrecisionPoolLimits();
        }

        if (this.quantumCountInput) {
            // Sugestão IA: padrão = 50% dos números da loteria, mas mínimo é minBet
            const qConstraints = QuantumGodEngine.getConstraints(gameKey);
            const totalNums = qConstraints ? qConstraints.totalNumbers : (game.range[1] - game.range[0] + 1);
            const defaultSuggestion = Math.ceil(totalNums * 0.5);
            this.quantumCountInput.value = defaultSuggestion;
            this.quantumCountInput.min = game.minBet;
            this.quantumCountInput.max = totalNums;
        }
        if (this.quantumResults) {
            this.quantumResults.innerHTML = '<div class="quantum-placeholder">Clique em "Gerar Sugestão" para começar</div>';
        }

        // Atualizar seletor de números por jogo IA
        this.updateSmartDrawSizeSelect(gameKey, game);

        // RENDER GRID IMMEDIATELY
        this.renderNumberGrid(game);
        this.updateSelectionInfo();
        this.updateCurrentCostDisplay();

        // Mostrar prêmio fallback IMEDIATAMENTE (sem depender da API)
        this.updatePrizeDisplayWithFallback(gameKey);

        // ASYNC LOAD FOR DATA
        (async () => {
            try {
                await StatsService.ensureHistory(gameKey);

                // Update stats and results once data is ready
                this.updateStats();
                this.updateRecentResults();

                // Update Tag with REAL draw number
                const latestResult = StatsService.getRecentResults(gameKey, 1)[0];
                const nextDrawNumber = latestResult ? latestResult.drawNumber + 1 : '???';
                const tag = this.currentGameTitle.querySelector('.next-draw-tag');
                if (tag) tag.textContent = `(Concurso: ${nextDrawNumber})`;

                // Update Prize Display com dados reais da API
                this.updatePrizeDisplay(gameKey);
            } catch (e) {
                console.warn("Async history load failed:", e);
                // Mantém o fallback exibido
                if (this.recentResultsContainer) {
                    this.recentResultsContainer.innerHTML = '<div class="empty-state">Usando dados offline.</div>';
                }
            }
        })();

        // ═══ LIMPEZA ao trocar de loteria (bugs #1-#5 fix) ═══
        // Bug 1: Limpar banner que fica fora do gamesContainer
        const oldBanner = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
        if (oldBanner) oldBanner.remove();

        // Bug 2+5: Limpar arrays de jogos da loteria anterior
        this.currentGeneratedGames = [];
        this._lastGeneratedGames = [];

        // Bug 3: Cancelar geração assíncrona em andamento
        if (typeof AsyncGenerator !== 'undefined' && AsyncGenerator._isRunning) {
            AsyncGenerator._cancelled = true;
            AsyncGenerator._isRunning = false;
        }
        const asyncProgress = document.getElementById('async-progress-inline');
        if (asyncProgress) { asyncProgress.style.display = 'none'; asyncProgress.innerHTML = ''; }

        this.gamesContainer.innerHTML = '<div class="empty-state">Selecione as opções e clique em Gerar Jogos</div>';
    }

    // ╔══════════════════════════════════════════════════════════╗
    // ║  ATUALIZAR SELECT DE NÚMEROS POR JOGO IA              ║
    // ╚══════════════════════════════════════════════════════════╝
    updateSmartDrawSizeSelect(gameKey, game) {
        if (!this.smartDrawSizeSelect) return;

        this.smartDrawSizeSelect.innerHTML = '';
        const min = game.minBet;
        // Limitar max a algo razoável para o select
        const maxDisplay = Math.min(game.maxBet, min + 14); // Até 15 opções iniciais
        
        for (let i = min; i <= maxDisplay; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i + ' núm.';
            if (i === min) opt.textContent += ' ★'; // Marcar padrão
            this.smartDrawSizeSelect.appendChild(opt);
        }

        // ★ v9.5: Para loterias com range grande (Lotomania), adicionar opções extras
        // de 5 em 5 até 90% do range total
        if (game.maxBet > maxDisplay + 5) {
            const extendedMax = Math.min(game.maxBet, Math.round((game.range[1] - game.range[0] + 1) * 0.90));
            for (let i = maxDisplay + 5; i <= extendedMax; i += 5) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = i + ' núm.';
                this.smartDrawSizeSelect.appendChild(opt);
            }
        }

        // Se max for maior que a última opção, adicionar como última opção
        const lastOpt = parseInt(this.smartDrawSizeSelect.lastChild?.value || 0);
        if (game.maxBet > lastOpt) {
            const optMax = document.createElement('option');
            optMax.value = game.maxBet;
            optMax.textContent = game.maxBet + ' núm. (máx)';
            this.smartDrawSizeSelect.appendChild(optMax);
        }

        // Definir padrão como minBet
        this.smartDrawSizeSelect.value = min;

        // Atualizar info
        if (this.smartDrawInfo) {
            if (min === game.maxBet) {
                this.smartDrawInfo.textContent = `Fixo: ${min} números`;
            } else {
                this.smartDrawInfo.textContent = `Mín: ${min} | Máx: ${game.maxBet}`;
            }
        }
    }

    updateRecentResults() {
        const results = StatsService.getRecentResults(this.currentGameKey, 5);
        this.renderRecentResults(results);
    }

    // Exibe prêmio fallback IMEDIATAMENTE (sem precisar de API)
    updatePrizeDisplayWithFallback(gameKey) {
        if (!this.prizeDisplay) return;
        
        // Primeiro tenta dados reais da API (se já tiver carregado)
        const prizeInfo = StatsService.getPrizeInfo(gameKey);
        if (prizeInfo && (prizeInfo.estimatedPrize > 0 || prizeInfo.accumulatedPrize > 0)) {
            this.updatePrizeDisplay(gameKey);
            return;
        }

        // Se não tem dados da API, usa o fallback definido em games.js
        const game = GAMES[gameKey];
        const fallbackAmount = game ? (game.estimatedPrizeFallback || 0) : 0;
        
        if (fallbackAmount > 0) {
            const formatted = fallbackAmount.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            this.prizeValue.textContent = formatted;
            this.prizeDisplay.style.display = 'block';
            
            if (this.prizeBadge) {
                this.prizeBadge.style.display = 'none';
            }
        } else {
            this.prizeDisplay.style.display = 'none';
        }
    }

    updatePrizeDisplay(gameKey) {
        const prizeInfo = StatsService.getPrizeInfo(gameKey);
        
        if (!prizeInfo || !this.prizeDisplay) return;

        const prizeAmount = prizeInfo.estimatedPrize || prizeInfo.accumulatedPrize || 0;

        if (prizeAmount > 0) {
            const formatted = prizeAmount.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });

            this.prizeValue.textContent = formatted;
            this.prizeDisplay.style.display = 'block';

            // Show ACUMULADO badge
            if (prizeInfo.accumulated && this.prizeBadge) {
                this.prizeBadge.style.display = 'inline-block';
            } else if (this.prizeBadge) {
                this.prizeBadge.style.display = 'none';
            }

            // Sincronizar botão de navegação com valor real da API
            const navElem = document.getElementById(`prize-nav-${gameKey}`);
            if (navElem) {
                navElem.textContent = this._formatPrizeShort(prizeAmount);
                if (prizeInfo.accumulated) {
                    navElem.textContent += ' 🔥';
                }
            }
        } else {
            this.prizeDisplay.style.display = 'none';
        }
    }

    renderNumberGrid(game) {
        this.gridContainer.innerHTML = '';
        const rangeStart = game.range[0];
        const rangeEnd = game.range[1];

        for (let i = rangeStart; i <= rangeEnd; i++) {
            const numDiv = document.createElement('div');
            numDiv.className = 'grid-num';
            numDiv.textContent = i.toString().padStart(2, '0');
            numDiv.dataset.number = i;
            numDiv.onclick = () => this.toggleNumber(i, numDiv);
            this.gridContainer.appendChild(numDiv);
        }
    }

    toggleFixedMode() {
        this.isFixedMode = !this.isFixedMode;
        if (this.isFixedMode) {
            this.btnFixedMode.classList.add('active');
            this.btnFixedMode.textContent = '📌 Modo Fixo (ON)';
            // Visual Hint
            // alert("Clique nos números para FIXÁ-LOS (Borda Dourada). Eles aparecerão em TODOS os jogos.");
        } else {
            this.btnFixedMode.classList.remove('active');
            this.btnFixedMode.textContent = '📌 Fixar';
        }
    }

    toggleNumber(number, element) {
        const game = GAMES[this.currentGameKey];

        // If element is not provided, find it in the grid
        if (!element) {
            element = this.gridContainer.querySelector(`.grid-num[data-number="${number}"]`);
        }

        if (this.isFixedMode) {
            // FIXED MODE LOGIC
            if (this.fixedNumbers.has(number)) {
                this.fixedNumbers.delete(number);
                if (element) element.classList.remove('fixed');
            } else {
                // Validation: Limit Fixed Numbers (50% minBet or maxFixed)
                const limit = game.maxFixed || Math.floor(game.minBet / 2);
                if (this.fixedNumbers.size >= limit) {
                    alert(`Máximo de ${limit} números fixos permitidos para ${game.name}.`);
                    return;
                }

                // If fixing, ensure it's selected
                if (!this.selectedNumbers.has(number)) {
                    if (this.selectedNumbers.size >= game.maxBet) {
                        alert("Limite de números selecionados atingido! Remove alguns para fixar este.");
                        return;
                    }
                    this.selectedNumbers.add(number);
                    if (element) element.classList.add('selected');
                }

                this.fixedNumbers.add(number);
                if (element) element.classList.add('fixed');
            }
            this.updateFixedInfo();
            return;
        }

        // NORMAL SELECTION LOGIC
        if (this.selectedNumbers.has(number)) {
            // Prevent unselecting if fixed (unless in fixed mode)
            if (this.fixedNumbers.has(number)) {
                alert("Este número está FIXO. Desative o 'Modo Fixo' ou clique em 'Fixar' para removê-lo.");
                return;
            }
            this.selectedNumbers.delete(number);
            if (element) element.classList.remove('selected');
        } else {
            if (this.selectedNumbers.size >= game.maxBet) {
                alert(`Máximo de ${game.maxBet} números permitidos.`);
                return;
            }
            this.selectedNumbers.add(number);
            if (element) element.classList.add('selected');
        }
        this.updateSelectionInfo();
    }

    updateFixedInfo() {
        const list = Array.from(this.fixedNumbers).sort((a, b) => a - b).map(n => n.toString().padStart(2, '0')).join(', ');
        this.fixedNumbersList.textContent = list;
        this.fixedInfoPanel.style.display = this.fixedNumbers.size > 0 ? 'block' : 'none';
        this.updateSelectionInfo(); // Updates cost too
        // v3.0: Reconstruir dropdown de fechamento com níveis dinâmicos
        this._rebuildClosingDropdown(this.currentGameKey);
    }

    selectRandom() {
        const game = GAMES[this.currentGameKey];
        const targetCount = game.minBet; // Pick minimum for random suggestion

        this.clearSelection();

        const universe = [];
        for (let i = game.range[0]; i <= game.range[1]; i++) {
            universe.push(i);
        }

        // Fisher-Yates shuffle para aleatoriedade verdadeira
        for (let i = universe.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = universe[i];
            universe[i] = universe[j];
            universe[j] = temp;
        }
        const selected = universe.slice(0, targetCount);

        selected.forEach(num => {
            const el = this.gridContainer.querySelector(`.grid-num[data-number="${num}"]`);
            if (el) {
                this.selectedNumbers.add(num);
                el.classList.add('selected');
            }
        });

        this.updateSelectionInfo();
    }



    clearSelection() {
        this.selectedNumbers.clear();
        this.fixedNumbers.clear();
        this.isFixedMode = false;
        if (this.btnFixedMode) {
            this.btnFixedMode.classList.remove('active');
            this.btnFixedMode.textContent = '📌 Fixar';
        }
        if (this.fixedInfoPanel) this.fixedInfoPanel.style.display = 'none';

        if (this.gridContainer) {
            const selected = this.gridContainer.querySelectorAll('.selected, .fixed');
            selected.forEach(el => {
                el.classList.remove('selected');
                el.classList.remove('fixed');
            });
        }
        this.updateSelectionInfo();

        // Clear generated games
        this.currentGeneratedGames = [];
        this.gamesContainer.innerHTML = '<div class="empty-state">Selecione as opções e clique em Gerar Jogos</div>';

        // Clear check summary
        if (this.checkSummaryContainer) this.checkSummaryContainer.style.display = 'none';

        // Clear generation feedback
        const feedback = document.querySelector('.generation-feedback');
        if (feedback) feedback.remove();

        // Clear Quantum Suggestions
        if (this.quantumResults) this.quantumResults.innerHTML = '';
    }

    updateSelectionInfo() {
        const count = this.selectedNumbers.size;
        this.selectedCountElem.textContent = count;
        this.updateInvestmentPanel();
        this.updateCurrentCostDisplay();
        this._updateClosingPreview();

        // v12: Wheel System removido — substituído por MotorFechamentoManual
    }

    updateCurrentCostDisplay() {
        const game = GAMES[this.currentGameKey];
        const qty = parseInt(this.gamesQuantityInput.value) || 10;

                // Calcular preço por jogo baseado no número de números selecionados
        let pricePerGame = game.price;
        const smartDrawSize = this.smartDrawSizeSelect 
            ? parseInt(this.smartDrawSizeSelect.value) || game.minBet
            : game.minBet;

        // ★ v9.5: Se Sniper ativo, dropdown = pool size, cada jogo custa minBet
        const precisionCheckbox = document.getElementById('precision-mode-toggle');
        const isSniperActive = precisionCheckbox && precisionCheckbox.checked;
        
        if (isSniperActive) {
            // Sniper: cada jogo é minBet números → preço base
            pricePerGame = game.price;
        } else if (smartDrawSize > game.minBet) {
            // Normal: se jogador escolheu mais números, calcular combinações
            const combinations = this._calcCombinations(smartDrawSize, game.minBet);
            pricePerGame = combinations * game.price;
        }

        const cost = qty * pricePerGame;
        if (this.currentBetCostElem) {
            this.currentBetCostElem.textContent = cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        // Atualizar custo no Simulador de Custo
        if (this.costUserGames) {
            this.costUserGames.textContent = cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        if (this.costUserGamesDetail) {
            const priceFormatted = pricePerGame.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const detail = smartDrawSize > game.minBet
                ? `${qty} jogo${qty > 1 ? 's' : ''} × ${priceFormatted} (${smartDrawSize} núm.)`
                : `${qty} jogo${qty > 1 ? 's' : ''} × ${priceFormatted}`;
            this.costUserGamesDetail.textContent = detail;
        }

        // Atualizar info de preço no painel IA
        if (this.smartDrawInfo) {
            if (smartDrawSize > game.minBet) {
                const priceFormatted = pricePerGame.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                this.smartDrawInfo.textContent = `${priceFormatted}/jogo`;
                this.smartDrawInfo.style.color = '#F59E0B';
                this.smartDrawInfo.style.fontWeight = '700';
            } else {
                const basePrice = game.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                this.smartDrawInfo.textContent = `${basePrice}/jogo`;
                this.smartDrawInfo.style.color = '#94A3B8';
                this.smartDrawInfo.style.fontWeight = '400';
            }
        }
    }

    // Calcular C(n, k) = n! / (k! × (n-k)!)
    _calcCombinations(n, k) {
        if (k > n) return 0;
        if (k === 0 || k === n) return 1;
        let result = 1;
        for (let i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return Math.round(result);
    }

    // ━━ PREVIEW DO FECHAMENTO v3.1 (CONDICIONAL) ━━
    // ━━ CÁLCULO SEGURO C(n,k) ━━
    _nCrSafe(n, k) {
        if (k > n || k < 0) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n - k) k = n - k;
        let result = 1;
        for (let i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
            if (result > 1e9) return result; // Evitar overflow
        }
        return Math.round(result);
    }

    _updateClosingPreview() {
        const closingVal = this.closingSelect ? this.closingSelect.value : '';
        if (!closingVal || !closingVal.startsWith('close_')) return;

        const guarantee = parseInt(closingVal.replace('close_', ''));
        const game = GAMES[this.currentGameKey];
        if (!game) return;

        const numSelected = this.selectedNumbers.size;
        const fixedCount = this.fixedNumbers ? this.fixedNumbers.size : 0;
        if (typeof ClosingEngine === 'undefined') return;

        const preview = ClosingEngine.getClosurePreview(numSelected, guarantee, game.minBet, this.currentGameKey, fixedCount);

        if (preview.possible && preview.games > 0) {
            this.gamesQuantityInput.value = preview.games;
        }

        if (this.closingEstimatesContainer) {
            if (!preview.possible || numSelected < game.minBet) {
                this.closingEstimatesContainer.innerHTML = '<p class="helper-text" style="color:#F59E0B;">' + preview.msg + '</p>';
            } else {
                const guaranteeIcons = { 20: '🎯', 19: '⭐', 18: '🔥', 17: '✅', 15: '🎯', 14: '⭐', 13: '🔥', 12: '💎', 11: '💎', 10: '👑', 9: '👑', 8: '🔥', 7: '🎯', 6: '🎯', 5: '⭐', 4: '🔥', 3: '✅' };
                const effG = preview.effectiveGuarantee || (guarantee - fixedCount);
                const fixedBadge = fixedCount > 0
                    ? '<div style="font-size:0.75em;color:#10B981;margin-top:4px;font-weight:600;">📌 ' + fixedCount + ' fixos → efetivo: ' + effG + ' variáveis a cobrir (↓ menos jogos!)</div>'
                    : '';
                this.closingEstimatesContainer.innerHTML =
                    '<div style="padding:8px 12px;border-radius:8px;background:rgba(234,179,8,0.1);border:1px solid #EAB30830;">' +
                    '<div style="font-weight:700;color:#EAB308;">' + (guaranteeIcons[guarantee] || '🎯') + ' ' + preview.msg + '</div>' +
                    fixedBadge +
                    '<div style="font-size:0.8em;color:#9CA3AF;margin-top:4px;">Subconjuntos: C(' + numSelected + ',' + guarantee + ') = ' + preview.subsets.toLocaleString('pt-BR') + '</div>' +
                    '<div style="font-size:0.75em;color:' + (preview.possible ? '#10B981' : '#F59E0B') + ';margin-top:3px;">Confiança: ' + (preview.possible ? '✅ Alta' : '⚠️ Muitos jogos') + '</div>' +
                    '</div>';
            }
        }
    }

    // ━━ RECONSTRUIR DROPDOWN DE FECHAMENTO v3.0 ━━
    _rebuildClosingDropdown(gameKey, forceGenerate = false) {
        if (!gameKey) gameKey = this.currentGameKey;
        const game = GAMES[gameKey];
        if (!game || !this.closingSelect) return;

        const fixedCount = this.fixedNumbers ? this.fixedNumbers.size : 0;
        const savedValue = forceGenerate ? '' : this.closingSelect.value;

        this.closingSelect.innerHTML = '';

        // v3.2 FIX: Opção padrão "Gerar Jogos" — respeita a quantidade solicitada
        const defaultOpt = document.createElement('option');
        defaultOpt.value = 'generate';
        defaultOpt.textContent = '🎲 Gerar Jogos (Quantidade)';
        defaultOpt.style.fontWeight = '700';
        this.closingSelect.appendChild(defaultOpt);

        // v3.1: TODOS os níveis são viáveis (fixos REDUZEM jogos)
        if (typeof ClosingEngine !== 'undefined' && game.closingLevels && game.closingLevels.length > 0) {
            const dynamicLevels = ClosingEngine.getDynamicClosingLevels(gameKey, fixedCount);
            const optGroup1 = document.createElement('optgroup');
            optGroup1.label = fixedCount > 0
                ? '🎯 Fechamento (' + fixedCount + ' fixos → menos jogos!)'
                : '🎯 Fechamento Objetivo (Garantido)';
            dynamicLevels.forEach(cl => {
                const option = document.createElement('option');
                option.value = 'close_' + cl.guarantee;
                option.textContent = cl.icon + ' ' + cl.label;
                option.dataset.closing = 'true';
                optGroup1.appendChild(option);
            });
            this.closingSelect.appendChild(optGroup1);
        } else if (game.closingLevels && game.closingLevels.length > 0) {
            const optGroup1 = document.createElement('optgroup');
            optGroup1.label = '🎯 Fechamento Objetivo (Garantido)';
            game.closingLevels.forEach(cl => {
                const option = document.createElement('option');
                option.value = 'close_' + cl.guarantee;
                option.textContent = cl.icon + ' ' + cl.label;
                option.dataset.closing = 'true';
                optGroup1.appendChild(option);
            });
            this.closingSelect.appendChild(optGroup1);
        }

        const optGroup2 = document.createElement('optgroup');
        optGroup2.label = 'Garantia de Fechamento';
        game.strategies.forEach(strat => {
            const option = document.createElement('option');
            option.value = strat.match;
            option.textContent = strat.label;
            optGroup2.appendChild(option);
        });
        this.closingSelect.appendChild(optGroup2);

        // v3.3 FIX: Ao trocar de loteria, SEMPRE resetar para 'generate'
        // para evitar que close_7 de outra loteria persista e gere 80k jogos
        if (forceGenerate) {
            this.closingSelect.value = 'generate';
        } else {
            const savedOption = Array.from(this.closingSelect.options).find(o => o.value === savedValue);
            if (savedOption && savedValue !== '') {
                this.closingSelect.value = savedValue;
            } else {
                this.closingSelect.value = 'generate';
            }
        }
        this._updateClosingPreview();
    }

    updateInvestmentPanel() {
        const count = this.selectedNumbers ? this.selectedNumbers.size : 0;
        if (typeof CombinationEngine === 'undefined') return;
        const result = CombinationEngine.calculateInvestment(this.currentGameKey, count);

        if (!result) return;

        this.costSelectedCount.textContent = count;

        if (!result.valid) {
            this.costTotalCombinations.textContent = "0";
            this.costTotalValue.textContent = "R$ 0,00";
            this.closingEstimatesContainer.innerHTML = '<p class="helper-text">Selecione mais números...</p>';
            return;
        }

        const fmt = (n) => n.toLocaleString('pt-BR');
        const currency = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        this.costTotalCombinations.textContent = fmt(result.totalCombinations);
        this.costTotalValue.textContent = currency(result.totalCost);

        this.closingEstimatesContainer.innerHTML = '';
        if (result.estimates && result.estimates.length > 0) {
            result.estimates.forEach(est => {
                const item = document.createElement('div');
                item.className = 'estimate-item';
                item.style.cursor = 'pointer';
                item.title = "Clique para aplicar esta configuração";

                item.onclick = () => {
                    this.gamesQuantityInput.value = est.qty;
                    // Try to match strategy
                    if (est.strategyId) {
                        // Find option with this value
                        const opt = Array.from(this.closingSelect.options).find(o => o.value == est.strategyId);
                        if (opt) this.closingSelect.value = est.strategyId;
                    }
                    this.updateCurrentCostDisplay();

                    // Visual feedback
                    item.style.borderColor = 'var(--primary-accent)';
                    setTimeout(() => item.style.borderColor = '', 500);
                };

                item.innerHTML = `
                    <span class="estimate-label">${est.label}</span>
                    <div class="estimate-value">
                        <span>${fmt(est.qty)} jogos</span>
                        <span>${currency(est.cost)}</span>
                    </div>
                `;
                this.closingEstimatesContainer.appendChild(item);
            });
        } else {
            this.closingEstimatesContainer.innerHTML = '<p class="helper-text">Sem estimativas extras.</p>';
        }
    }

    updateStats() {
        if (typeof StatsService === 'undefined') return;
        try {
            const stats = StatsService.getStats(this.currentGameKey, this.currentStatsRange);
            this.renderStats(stats);

            const recents = StatsService.getRecentResults(this.currentGameKey, 5);
            this.renderRecentResults(recents);

            // ── Painel de Frequência Multi-Faixa ──
            this.renderFrequencyPanel();
        } catch(e) {
            console.warn('[UI] Erro ao atualizar estatísticas:', e.message);
        }
    }

    renderRecentResults(recents) {
        if (!this.recentResultsContainer) return;
        this.recentResultsContainer.innerHTML = '';

        if (!recents || recents.length === 0) {
            this.recentResultsContainer.innerHTML = '<div class="empty-state" style="padding:1rem;">Sem dados recentes.</div>';
            return;
        }

        const self = this;

        recents.forEach(item => {
            const row = document.createElement('div');
            row.className = 'recent-row';
            row.style.display = 'flex';
            row.style.flexDirection = 'column';
            row.style.gap = '5px';
            row.style.marginBottom = '0.8rem';
            row.style.padding = '0.5rem';
            row.style.background = 'var(--bg-surface)';
            row.style.borderRadius = 'var(--radius-sm)';
            row.style.border = '1px solid var(--border-color)';

            const label = document.createElement('span');
            label.className = 'recent-label';
            label.style.fontWeight = 'bold';
            label.style.color = '#F59E0B';
            label.style.fontSize = '0.85rem';
            label.textContent = `Concurso ${item.drawNumber}`;
            row.appendChild(label);

            // Função auxiliar para criar linha de bolas
            function createBallsRow(numbers, labelText) {
                if (labelText) {
                    const sortLabel = document.createElement('span');
                    sortLabel.style.fontSize = '0.7rem';
                    sortLabel.style.color = '#94A3B8';
                    sortLabel.style.fontWeight = '600';
                    sortLabel.style.marginTop = '2px';
                    sortLabel.textContent = labelText;
                    row.appendChild(sortLabel);
                }
                const numbersDiv = document.createElement('div');
                numbersDiv.className = 'recent-numbers';
                numbersDiv.style.display = 'flex';
                numbersDiv.style.gap = '4px';
                numbersDiv.style.flexWrap = 'wrap';

                numbers.forEach(num => {
                    const ball = document.createElement('span');
                    ball.className = 'mini-ball';
                    ball.textContent = num.toString().padStart(2, '0');
                    ball.style.display = 'inline-flex';
                    ball.style.alignItems = 'center';
                    ball.style.justifyContent = 'center';
                    ball.style.width = '20px';
                    ball.style.height = '20px';
                    ball.style.borderRadius = '50%';
                    ball.style.backgroundColor = 'var(--bg-main)';
                    ball.style.border = '1px solid var(--border-color)';
                    ball.style.fontSize = '0.75rem';
                    ball.style.color = 'var(--text-primary)';
                    numbersDiv.appendChild(ball);
                });
                row.appendChild(numbersDiv);
            }

            // Dupla Sena: exibir Sorteio 1 e Sorteio 2 separados
            if (item.numbers2 && item.numbers2.length > 0) {
                createBallsRow(item.numbers, '1º Sorteio');
                createBallsRow(item.numbers2, '2º Sorteio');
            } else {
                createBallsRow(item.numbers, null);
            }

            this.recentResultsContainer.appendChild(row);
        });
    }

    renderStats(stats) {
        if (!this.hotNumbersContainer || !this.coldNumbersContainer) return;
        if (!stats || !stats.hot || !stats.cold) return;
        this.hotNumbersContainer.innerHTML = '';
        this.coldNumbersContainer.innerHTML = '';

        // Atualizar header com total de sorteios e split 50/50
        const statsHeader = document.querySelector('.stats-header h3');
        if (statsHeader) {
            const label = stats.totalDraws
                ? `Estatísticas <span style="font-size:0.7em;color:#94A3B8;font-weight:400;">(${stats.totalDraws} sorteios analisados — 50% hot / 50% cold)</span>`
                : 'Estatísticas';
            statsHeader.innerHTML = label;
        }

        // Atualizar títulos das seções com contagem
        const hotHeader = document.querySelector('.stat-box.hot h4');
        const coldHeader = document.querySelector('.stat-box.cold h4');
        if (hotHeader) hotHeader.textContent = `Mais Sorteados (${stats.hot.length})`;
        if (coldHeader) coldHeader.textContent = `Menos Sorteados (${stats.cold.length})`;

        // Container sem scroll — todos os números visíveis
        const listStyle = 'display:flex;flex-wrap:wrap;gap:8px;padding:4px 2px;';
        if (this.hotNumbersContainer)  this.hotNumbersContainer.setAttribute('style', listStyle);
        if (this.coldNumbersContainer) this.coldNumbersContainer.setAttribute('style', listStyle);

        const createStatItem = (stat, isHot) => {
            const container = document.createElement('div');
            container.className = 'stat-ball-wrapper';
            container.style.cssText = 'position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;';
            container.title = `Clique para adicionar ao jogo`;

            const ball = this.createBall(stat.number);
            ball.classList.add('stat-ball');

            // Estado inicial baseado na seleção atual
            if (this.selectedNumbers.has(stat.number)) {
                ball.classList.add('selected');
            }

            // Badge de frequência
            if (stat.count > 0) {
                const badge = document.createElement('span');
                badge.style.cssText = 'position:absolute;top:-4px;right:-4px;background:#F59E0B;color:#000;font-size:0.6rem;font-weight:800;padding:1px 3px;border-radius:6px;min-width:14px;text-align:center;line-height:1.2;z-index:2;pointer-events:none;';
                badge.textContent = stat.count + '×';
                container.appendChild(badge);
            }

            const addIcon = document.createElement('div');
            addIcon.className = 'stat-add-icon';
            addIcon.innerHTML = this.selectedNumbers.has(stat.number) ? '✓' : '+';
            addIcon.title = 'Adicionar ao jogo';

            // Click: adicionar/remover do grid de jogo acima
            container.onclick = (e) => {
                e.stopPropagation();
                this.toggleNumber(stat.number);
                const isSelected = this.selectedNumbers.has(stat.number);
                if (isSelected) {
                    ball.classList.add('selected');
                    addIcon.innerHTML = '✓';
                    addIcon.style.background = '#10B981';
                    // Pulsar para confirmar
                    ball.style.transform = 'scale(1.3)';
                    setTimeout(() => { ball.style.transform = ''; }, 300);
                } else {
                    ball.classList.remove('selected');
                    addIcon.innerHTML = '+';
                    addIcon.style.background = '';
                }
            };

            container.appendChild(ball);
            container.appendChild(addIcon);

            // Badge de atraso (delay)
            if (stat.delay !== undefined && stat.delay > 0) {
                const delayBadge = document.createElement('span');
                const delayColor = stat.delay >= 10 ? '#EF4444' : stat.delay >= 5 ? '#F59E0B' : '#64748B';
                const delayBg    = stat.delay >= 10 ? 'rgba(239,68,68,0.12)' : stat.delay >= 5 ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.10)';
                const delayIcon  = stat.delay >= 10 ? '⏳' : stat.delay >= 5 ? '🕑' : '•';
                delayBadge.style.cssText = `font-size:0.58rem;font-weight:700;color:${delayColor};background:${delayBg};padding:1px 4px;border-radius:4px;line-height:1.3;white-space:nowrap;margin-top:1px;pointer-events:none;`;
                delayBadge.textContent = `${delayIcon} ${stat.delay}d`;
                delayBadge.title = `Há ${stat.delay} sorteio${stat.delay !== 1 ? 's' : ''} sem sair`;
                container.appendChild(delayBadge);
            } else if (stat.delay === 0) {
                const freshBadge = document.createElement('span');
                freshBadge.style.cssText = 'font-size:0.58rem;font-weight:700;color:#22C55E;background:rgba(34,197,94,0.10);padding:1px 4px;border-radius:4px;line-height:1.3;margin-top:1px;pointer-events:none;';
                freshBadge.textContent = '✔ recente';
                freshBadge.title = 'Saiu no último sorteio';
                container.appendChild(freshBadge);
            }

            return container;
        };

        stats.hot.forEach(stat => {
            this.hotNumbersContainer.appendChild(createStatItem(stat, true));
        });

        stats.cold.forEach(stat => {
            this.coldNumbersContainer.appendChild(createStatItem(stat, false));
        });
    }

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  PAINEL DE FREQUÊNCIA MULTI-FAIXA — 3, 5, 10 e 15 Sorteios   ║
    // ║  Mostra os números mais e menos sorteados em 4 faixas         ║
    // ╚══════════════════════════════════════════════════════════════════╝
    renderFrequencyPanel() {
        const container = document.getElementById('freq-content');
        if (!container) return;

        const game = GAMES[this.currentGameKey];
        if (!game) return;

        const ranges = [3, 5, 10, 15];
        // Exibir no máximo 15 números por seção (hot/cold) — compacto para todas as loterias
        const totalNumbers = game.range[1] - game.range[0] + 1;
        const topNDisplay = Math.min(15, Math.ceil(totalNumbers * 0.25));

        // Verificar se temos dados
        const history = StatsService.historyStore ? StatsService.historyStore[this.currentGameKey] : null;
        if (!history || history.length === 0) {
            container.innerHTML = '<div class="freq-loading"><span class="freq-spinner"></span>Aguardando dados da API da Caixa...</div>';
            // Tentar novamente em 2s — COM LIMITE de 3 retries
            const retryKey = 'freqPanel_' + this.currentGameKey;
            if (typeof Guardian !== 'undefined' && Guardian.canRetry(retryKey, 3)) {
                Guardian.setTimeout(retryKey, () => this.renderFrequencyPanel(), 2000);
            } else {
                container.innerHTML = '<div class="freq-loading" style="color:#94A3B8;">Dados indisponíveis — usando modo offline</div>';
            }
            return;
        }
        // Reset retry counter quando dados chegam
        if (typeof Guardian !== 'undefined') Guardian.resetRetry('freqPanel_' + this.currentGameKey);

        let html = '<div class="freq-grid">';

        ranges.forEach(range => {
            const stats = StatsService.getStats(this.currentGameKey, range);
            const actualDraws = stats.totalDraws || 0;
            const hotSlice = stats.hot.slice(0, topNDisplay);
            const coldSlice = stats.cold.slice(0, topNDisplay);

            html += '<div class="freq-column">';
            html += '<div class="freq-col-header">';
            html += `<span class="freq-range-label">${range} Sorteios</span>`;
            html += `<span class="freq-range-sub">${actualDraws} analisados</span>`;
            html += '</div>';

            // ── HOT ──
            html += '<div class="freq-section">';
            html += '<div class="freq-section-title hot">🔥 Mais Sorteados</div>';
            html += '<div class="freq-nums">';
            hotSlice.forEach((stat, idx) => {
                const tier = idx < 3 ? 'hot-1' : idx < 6 ? 'hot-2' : 'hot-3';
                const num = String(stat.number).padStart(2, '0');
                html += `<div class="freq-ball ${tier}" title="${stat.number}: ${stat.count}x em ${actualDraws} sorteios">`;
                html += `${num}`;
                html += `<span class="freq-tooltip">${stat.number}: ${stat.count}× (atraso: ${stat.delay})</span>`;
                html += '</div>';
            });
            html += '</div></div>';

            // ── COLD ──
            html += '<div class="freq-section">';
            html += '<div class="freq-section-title cold">❄️ Menos Sorteados</div>';
            html += '<div class="freq-nums">';
            coldSlice.forEach((stat, idx) => {
                const tier = idx < 3 ? 'cold-1' : idx < 6 ? 'cold-2' : 'cold-3';
                const num = String(stat.number).padStart(2, '0');
                html += `<div class="freq-ball ${tier}" title="${stat.number}: ${stat.count}x em ${actualDraws} sorteios">`;
                html += `${num}`;
                html += `<span class="freq-tooltip">${stat.number}: ${stat.count}× (atraso: ${stat.delay})</span>`;
                html += '</div>';
            });
            html += '</div></div>';

            html += '</div>'; // freq-column
        });

        html += '</div>'; // freq-grid

        // ── LEGENDA ──
        html += '<div style="margin-top:10px;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;font-size:0.6rem;color:#64748B;">';
        html += '<span>🔥 <span style="color:#FACC15;">■</span> Top 3 | <span style="color:#FCD34D;">■</span> Top 6 | <span style="color:#F59E0B;">■</span> Top 10</span>';
        html += '<span>❄️ <span style="color:#60A5FA;">■</span> Top 3 | <span style="color:#93C5FD;">■</span> Top 6 | <span style="color:#BFDBFE;">■</span> Top 10</span>';
        html += '</div>';

        container.innerHTML = html;
    }

    _generateExtras(gameKey, count) {
        let pool = [];
        if (gameKey === 'diadesorte') pool = L99_MESES.map((_, i) => i);
        else if (gameKey === 'timemania') pool = L99_TIMES.map((_, i) => i);
        else return null;

        function shuffle(array) {
            let currentIndex = array.length, randomIndex;
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        }

        let extras = [];
        let currentPool = [];
        for (let i = 0; i < count; i++) {
            if (currentPool.length === 0) {
                currentPool = shuffle([...pool]);
            }
            extras.push(currentPool.pop());
        }
        return extras;
    }

    renderGames(result, gameKey, updateHash = true) {
        // Validação defensiva de dados de entrada
        if (!result) result = { games: [] };
        if (!result.games) result.games = [];

        // ── ORDENAÇÃO GLOBAL POR SINERGIA IA 🔥 ──
        // Isso garante que TODOS os motores (Sniper, Cobertura, Manual Simples, etc) 
        // entreguem os melhores jogos estatisticamente no topo da lista.
        if (result.games.length > 0 && typeof ClosingEngine !== 'undefined') {
            let pool = result.pool;
            if (!pool || pool.length === 0) {
                pool = Array.from(this.selectedNumbers || []);
            }
            if (!pool || pool.length === 0) {
                const gameConfig = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
                if (gameConfig && gameConfig.range) {
                    pool = [];
                    for(let i = gameConfig.range[0]; i <= gameConfig.range[1]; i++) pool.push(i);
                }
            }
            
            try {
                if (pool && pool.length > 0) {
                    const aiSynergy = ClosingEngine._getAISynergy(gameKey, pool);
                    if (aiSynergy) {
                        const fixedArr = Array.from(this.fixedNumbers || []);
                        result.games.sort((a, b) => {
                            const scoreA = ClosingEngine._evalSynergy(a.filter(n => !fixedArr.includes(n)), fixedArr, aiSynergy);
                            const scoreB = ClosingEngine._evalSynergy(b.filter(n => !fixedArr.includes(n)), fixedArr, aiSynergy);
                            return scoreB - scoreA;
                        });
                        console.log('[GLOBAL-SORT] 🔥 Jogos globais ordenados por Sinergia IA.');
                    }
                }
            } catch(e) {
                console.warn('[GLOBAL-SORT] Falha ao ordenar por sinergia', e);
            }
        }

        this.currentGeneratedGames = result.games;
        this._lastInternalEngine = result.internalEngine || 'Desconhecido';
        
        // Gerar múltiplos times/meses distribuídos com máxima cobertura (sem repetição precoce)
        if (gameKey === 'timemania' || gameKey === 'diadesorte') {
            this.currentGeneratedExtras = this._generateExtras(gameKey, result.games.length);
        } else {
            this.currentGeneratedExtras = null;
        }

        if (!this.gamesContainer) return;
        this.gamesContainer.innerHTML = '';
        this.gamesContainer.dataset.gameKey = gameKey || this.currentGameKey;

        if (updateHash) this.updateUrlHash();

        if (!result.games || result.games.length === 0) {
            this.gamesContainer.innerHTML = '<div class="empty-state">Nenhum jogo gerado.</div>';
            return;
        }

        const gameName = GAMES[gameKey] ? GAMES[gameKey].name : 'Loteria';

        // OTIMIZACAO BULK: Para >100 jogos, usar innerHTML em bloco
        // v3.2 FIX: Destacar números fixos em amarelo/dourado no modo bulk
        if (result.games.length > 100) {
            const fixedSet = this.fixedNumbers || new Set();
            const hasFixed = fixedSet.size > 0;
            const chunks = [];
            
            // v4.0 HIGH VOLUME SPECIALIST: Cap rendering to 1000 games to prevent browser freeze
            const renderLimit = Math.min(result.games.length, 1000);
            const isCapped = result.games.length > 1000;

            result.games.slice(0, renderLimit).forEach((gameNumbers, index) => {
                const nums = gameNumbers.map(n => {
                    const padded = n.toString().padStart(2, '0');
                    if (hasFixed && fixedSet.has(n)) {
                        return `<div class="ball fixed" style="border-color:#F59E0B;color:#F59E0B;text-shadow:0 0 6px rgba(245,158,11,0.4);font-weight:900">${padded}</div>`;
                    }
                    return `<div class="ball">${padded}</div>`;
                }).join('');
                
                let extraHtml = '';
                if (this.currentGeneratedExtras && this.currentGeneratedExtras[index] !== undefined) {
                    if (gameKey === 'diadesorte') {
                        extraHtml = `<span style="font-size:0.75em;color:#F59E0B;background:rgba(245,158,11,0.1);padding:2px 6px;border-radius:4px;margin-left:auto;">📅 ${L99_MESES[this.currentGeneratedExtras[index]]}</span>`;
                    } else if (gameKey === 'timemania') {
                        extraHtml = `<span style="font-size:0.75em;color:#10B981;background:rgba(16,185,129,0.1);padding:2px 6px;border-radius:4px;margin-left:auto;">⚽ ${L99_TIMES[this.currentGeneratedExtras[index]]}</span>`;
                    }
                }
                chunks.push(`<div class="game-card"><div style="display:flex;align-items:center;margin-bottom:5px"><div class="game-index-badge" style="position:static">Jogo ${index + 1}</div>${extraHtml}</div><div class="game-numbers-wrapper">${nums}</div></div>`);
            });

            this.gamesContainer.innerHTML = chunks.join('');
            
            if (isCapped) {
                this.gamesContainer.innerHTML += `
                    <div style="padding: 15px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #F59E0B; text-align: center; margin-top: 15px; border-radius: 8px;">
                        <strong style="font-size: 1.1rem;">⚠️ ALTO VOLUME DE JOGOS</strong><br>
                        Por questões de performance extrema, o sistema exibiu na tela apenas os primeiros 1.000 volantes.<br><br>
                        Fique tranquilo: Os seus <b>${result.games.length} jogos únicos</b> foram processados com sucesso no Cérebro Matemático e estão prontos na memória.<br>
                        Utilize os botões abaixo para <b>Copiar</b> ou <b>Exportar</b> todos os jogos de uma vez.
                    </div>`;
            }
            return;
        }
        
        result.games.forEach((gameNumbers, index) => {
            const card = document.createElement('div');
            card.className = 'game-card';

            // Index Badge + Local Copy
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.marginBottom = '5px';

            const leftGroup = document.createElement('div');
            leftGroup.style.display = 'flex';
            leftGroup.style.alignItems = 'center';
            leftGroup.style.gap = '8px';

            const indexBadge = document.createElement('div');
            indexBadge.className = 'game-index-badge';
            indexBadge.style.position = 'static'; // Override absolutism
            indexBadge.textContent = `Jogo ${index + 1}`;
            leftGroup.appendChild(indexBadge);
            
            if (this.currentGeneratedExtras && this.currentGeneratedExtras[index] !== undefined) {
                const extraBadge = document.createElement('span');
                extraBadge.style.fontSize = '0.75rem';
                extraBadge.style.borderRadius = '4px';
                extraBadge.style.padding = '2px 6px';
                if (gameKey === 'diadesorte') {
                    extraBadge.style.color = '#F59E0B';
                    extraBadge.style.background = 'rgba(245,158,11,0.1)';
                    extraBadge.textContent = '📅 ' + L99_MESES[this.currentGeneratedExtras[index]];
                } else if (gameKey === 'timemania') {
                    extraBadge.style.color = '#10B981';
                    extraBadge.style.background = 'rgba(16,185,129,0.1)';
                    extraBadge.textContent = '⚽ ' + L99_TIMES[this.currentGeneratedExtras[index]];
                }
                leftGroup.appendChild(extraBadge);
            }
            header.appendChild(leftGroup);

            const copySingleBtn = document.createElement('button');
            copySingleBtn.className = 'card-copy-btn copy-single-btn';
            copySingleBtn.innerHTML = '<span>📋</span> Copiar';
            copySingleBtn.title = "Copiar este jogo";
            copySingleBtn.dataset.numbers = gameNumbers.map(n => n.toString().padStart(2, '0')).join(' - ');
            header.appendChild(copySingleBtn);

            card.appendChild(header);

            // Wrapper for numbers
            const numbersWrapper = document.createElement('div');
            numbersWrapper.className = 'game-numbers-wrapper';

            gameNumbers.forEach(num => {
                const ball = this.createBall(num);
                if (this.fixedNumbers.has(num)) {
                    ball.classList.add('fixed');
                    ball.style.borderColor = '#F59E0B';
                    ball.style.color = '#F59E0B';
                }
                numbersWrapper.appendChild(ball);
            });

            card.appendChild(numbersWrapper);
            this.gamesContainer.appendChild(card);
        });
    }

    createBall(number) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.textContent = number.toString().padStart(2, '0');
        return ball;
    }

    updateCountdown(gameKey) {
        const game = GAMES[gameKey];
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        const updateTimer = () => {
            if (!this.timerElem) return;
            const now = new Date();
            const nextDraw = this.getNextDrawDate(game.drawDays, game.drawTime);
            const diff = nextDraw - now;

            if (diff <= 0) {
                this.timerElem.textContent = "Hoje!";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (days < 1) {
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                this.timerElem.textContent = `${hours}h ${m}m ${s}s`;
            } else {
                this.timerElem.textContent = `${days} dias, ${hours}h`;
            }
        };

        updateTimer();
        this.countdownInterval = setInterval(updateTimer, 1000);
    }

    getNextDrawDate(drawDays, drawTime) {
        if (!drawDays || !drawTime) return new Date();
        const now = new Date();
        const [hours, minutes] = drawTime.split(':').map(Number);
        let targetDate = new Date(now);
        targetDate.setHours(hours, minutes, 0, 0);

        if (drawDays.includes(targetDate.getDay()) && targetDate > now) {
            return targetDate;
        }
        for (let i = 1; i <= 7; i++) {
            let d = new Date(now);
            d.setDate(now.getDate() + i);
            d.setHours(hours, minutes, 0, 0);
            if (drawDays.includes(d.getDay())) {
                return d;
            }
        }
        return now;
    }

    async copyToClipboard(text) {
        console.log('Attempting to copy text to clipboard...');

        // 1. Modern API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                console.log('Copy successful via navigator.clipboard');
                return true;
            } catch (err) {
                console.warn('navigator.clipboard failed, trying fallback:', err);
            }
        }

        // 2. Fallback document.execCommand
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);

            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999);

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                console.log('Copy successful via execCommand');
                return true;
            }
        } catch (err) {
            console.error('execCommand failed:', err);
        }

        // 3. Manual Copy Modal Fallback
        if (this.copyModal && this.copyTextarea) {
            this.copyTextarea.value = text;
            this.copyModal.style.display = 'flex';
            this.copyTextarea.focus();
            this.copyTextarea.select();

            // Return 'modal' to let the caller know the modal is handling it
            return 'modal';
        }

        // 4. Absolute Last Resort: window.prompt
        try {
            window.prompt("O navegador bloqueou a cópia automática. \nPressione Ctrl+C para copiar:", text);
            return true;
        } catch (err) {
            console.error('Window prompt failed:', err);
            return false;
        }
    }

    async copyGames() {
        const cards = document.querySelectorAll('.game-card');
        if (cards.length === 0) {
            console.warn('No games found to copy.');
            return false;
        }

        let text = '';
        const gameName = GAMES[this.currentGameKey] ? GAMES[this.currentGameKey].name : 'Loteria';

        text += `--- JOGOS DA ${gameName.toUpperCase()} ---\n`;
        text += `Data: ${new Date().toLocaleString()}\n\n`;

        cards.forEach((card, index) => {
            const numbers = Array.from(card.querySelectorAll('.ball'))
                .map(b => b.textContent.trim().padStart(2, '0'))
                .join(' - ');
            text += `Jogo ${index + 1}: ${numbers}\n`;
        });

        text += `\n--- B2B Loterias ---`;

        const success = await this.copyToClipboard(text);

        if (success === true) {
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copiado!';
            setTimeout(() => this.copyBtn.textContent = originalText, 2000);
            return true;
        } else if (success === 'modal') {
            // Modal is shown, no error alert needed, but we can update button briefly
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Veja a Janela';
            setTimeout(() => this.copyBtn.textContent = originalText, 2000);
            return true;
        } else {
            alert("Erro ao copiar. Seu navegador pode estar bloqueando o acesso à área de transferência.");
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🏦 MÉTODOS AUXILIARES — APOSTAR NA CAIXA
    // ═══════════════════════════════════════════════════════════════

    _getCaixaLotteryConfig() {
        return {
            megasena:   { name: 'Mega-Sena',    url: 'mega-sena' },
            lotofacil:  { name: 'Lotofácil',     url: 'lotofacil' },
            quina:      { name: 'Quina',          url: 'quina' },
            duplasena:  { name: 'Dupla Sena',    url: 'dupla-sena' },
            lotomania:  { name: 'Lotomania',     url: 'lotomania' },
            timemania:  { name: 'Timemania',     url: 'timemania' },
            diadesorte: { name: 'Dia de Sorte',  url: 'dia-de-sorte' }
        };
    }

    _isMobile() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
    }

    _generateCaixaScript_LEGACY(cfg, games) {
        // Gera um script JavaScript que, ao ser colado no console F12 do site da Caixa,
        // preenche automaticamente os jogos no volante.
        // FIX LOTOMANIA: números de 00-99, aposta fixa de 50 números
        const isTM = cfg.url === 'timemania';
        const isDS = cfg.url === 'dia-de-sorte';
        const gamesJSON = JSON.stringify(games);

        return `(async function(){
var LOTTERY_URL="${cfg.url}";
var J=${gamesJSON};var T=J.length;var OK=0;var ER=0;var TM=${isTM};var DS=${isDS};
function d(ms){return new Promise(function(r){setTimeout(r,ms)})}
function rc(e){if(!e)return!1;try{e.scrollIntoView({block:"center",behavior:"instant"});var r=e.getBoundingClientRect();var x=r.left+r.width/2;var y=r.top+r.height/2;["pointerdown","mousedown","pointerup","mouseup","click"].forEach(function(ev){e.dispatchEvent(new MouseEvent(ev,{view:window,bubbles:!0,cancelable:!0,clientX:x,clientY:y,button:0}))});try{var s=angular.element(e).scope();if(s&&s.$apply)s.$apply()}catch(ae){}return!0}catch(x){try{e.click();return!0}catch(x2){return!1}}}
function fm(){["fecharModalAlerta","fecharModalErro","fecharModalInfo","confirmarModalConfirmacao","botaosim","btnFecharModal","btnOk","btnConfirmar"].forEach(function(id){var e=document.getElementById(id);if(e&&e.offsetParent!==null)try{rc(e)}catch(x){}});document.querySelectorAll("button,a").forEach(function(b){var t=b.textContent.trim().toLowerCase();if((t==="ok"||t==="entendi"||t==="fechar"||t==="confirmar"||t==="sim"||t==="continuar")&&b.offsetParent!==null&&b.offsetWidth>0){var ic=b.id&&(b.id.toLowerCase().indexOf("carrinho")>=0||b.id.toLowerCase().indexOf("pagamento")>=0);if(!ic)try{rc(b)}catch(x){}}})}
function cn(n){var p=String(n).padStart(2,"0");var e=document.getElementById("n"+p);if(e)return rc(e);e=document.querySelector("a#n"+p)||document.querySelector("#n"+p);if(e)return rc(e);var all=document.querySelectorAll("a[role=button],a.dezena,a.numero,a[id^=n]");for(var i=0;i<all.length;i++){var tx=all[i].textContent.trim();if(tx===p||tx===String(n))return rc(all[i])}return!1}
function lmp(){fm();var b=document.getElementById("limparvolante");if(b)return rc(b);b=document.querySelector("[id*=limpar]");if(b)return rc(b);var bs=document.querySelectorAll("button");for(var k=0;k<bs.length;k++)if(bs[k].textContent.toLowerCase().indexOf("limpar")>=0)return rc(bs[k]);return!1}
async function selTime(){if(!TM)return!0;await d(500);var ts=document.querySelectorAll("[data-selecionar-time-do-coracao],img[name=btnTime],.time-coracao img");if(ts.length>0){rc(ts[Math.floor(Math.random()*ts.length)]);await d(800);return!0}return!1}
async function selMes(){if(!DS)return!0;await d(500);var s=document.querySelector("select");if(s&&s.options.length>1){s.selectedIndex=Math.floor(Math.random()*(s.options.length-1))+1;s.dispatchEvent(new Event("change",{bubbles:!0}));return!0}return!1}
async function car(){fm();await d(300);if(TM){await selTime();await d(600)}if(DS){await selMes();await d(600)}for(var t=0;t<10;t++){var b=document.getElementById("colocarnocarrinho");if(b&&b.offsetParent!==null){if(b.disabled||b.classList.contains("disabled")){try{var rs=angular.element(document.body).scope();if(rs&&rs.$apply)rs.$apply()}catch(ae){}await d(1200);continue}rc(b);await d(1500);fm();await d(600);fm();return!0}var ab=document.querySelectorAll("button,a");for(var k=0;k<ab.length;k++){var tx=ab[k].textContent.toLowerCase().trim();if((tx.indexOf("colocar no carrinho")>=0)&&ab[k].offsetParent!==null&&ab[k].offsetWidth>0){if(ab[k].disabled)continue;rc(ab[k]);await d(1500);fm();await d(600);fm();return!0}}fm();await d(800)}return!1}
async function waitVolante(){for(var w=0;w<40;w++){var el=document.getElementById("n01");if(el&&el.offsetParent!==null){console.log("[B2B] Volante encontrado!");return!0}fm();await d(1000);if(w%5===0)console.log("[B2B] Aguardando volante... "+w+"s")}return!1}
async function navLoteria(){
console.log("[B2B] Hash atual: "+window.location.hash);
fm();await d(500);fm();
var hash=window.location.hash||"";
if(hash.indexOf(LOTTERY_URL)>=0){console.log("[B2B] Ja na pagina correta");var ok=await waitVolante();if(ok)return!0}
console.log("[B2B] Metodo 1: ui-router $state.go...");
try{var inj=angular.element(document.body).injector();if(inj){var st=inj.get("$state");if(st&&st.go){st.go(LOTTERY_URL);console.log("[B2B] $state.go('"+LOTTERY_URL+"') executado!");await d(5000);fm();await d(1000);var ok=await waitVolante();if(ok)return!0;console.log("[B2B] $state.go nao carregou volante")}}}catch(e){console.log("[B2B] $state.go falhou: "+e.message)}
console.log("[B2B] Metodo 2: Clicando no menu...");
var menuLinks=document.querySelectorAll("a[ui-sref],a[href]");for(var i=0;i<menuLinks.length;i++){var href=(menuLinks[i].getAttribute("ui-sref")||menuLinks[i].getAttribute("href")||"").toLowerCase();if(href===LOTTERY_URL||href.indexOf("#/"+LOTTERY_URL)>=0||href.indexOf("#!/"+LOTTERY_URL)>=0){console.log("[B2B] Clicando: "+menuLinks[i].textContent.trim());menuLinks[i].click();await d(5000);fm();await d(1000);var ok=await waitVolante();if(ok)return!0}}
console.log("[B2B] Metodo 3: location.href completo...");
window.location.href="https://www.loteriasonline.caixa.gov.br/silce-web/#!/"+LOTTERY_URL;await d(5000);fm();await d(1000);return await waitVolante()
}
var pg=document.createElement("div");pg.id="b2b-pg";pg.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(145deg,#0F172A,#1E293B);border-bottom:2px solid #FFD700;padding:12px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.6);font-family:sans-serif;";pg.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#FFD700;font-weight:800;font-size:0.85rem;">B2B Loterias</span><span id="b2b-pt" style="color:#E2E8F0;font-size:0.8rem;font-weight:600;">Navegando...</span><button onclick="this.parentNode.parentNode.remove()" style="background:none;border:none;color:#94A3B8;font-size:1.2rem;cursor:pointer;">X</button></div><div style="margin-top:6px;background:rgba(255,255,255,0.1);border-radius:4px;height:6px;overflow:hidden;"><div id="b2b-pb" style="width:0%;height:100%;background:linear-gradient(90deg,#FFD700,#22C55E);border-radius:4px;transition:width 0.3s;"></div></div>';document.body.appendChild(pg);
var volOk=await navLoteria();
if(!volOk){var pp=document.getElementById("b2b-pg");if(pp)pp.innerHTML='<div style="text-align:center;padding:8px;"><div style="color:#EF4444;font-weight:800;">ERRO: Volante nao carregou. Navegue manualmente para '+LOTTERY_URL+' e tente novamente.</div></div>';return}
var pt0=document.getElementById("b2b-pt");if(pt0)pt0.textContent="0/"+T;
fm();await d(800);
for(var i=0;i<T;i++){var j=J[i];var pt=document.getElementById("b2b-pt");var pb=document.getElementById("b2b-pb");if(pt)pt.textContent=(i+1)+"/"+T;if(pb)pb.style.width=((i+1)/T*100).toFixed(0)+"%";fm();if(i>0){lmp();await d(1200);fm();await d(400)}for(var n=0;n<j.length;n++){if(!cn(j[n])){await d(200);cn(j[n])}await d(150)}try{var rs=angular.element(document.body).scope();if(rs&&rs.$apply)rs.$apply()}catch(ae){}await d(1200);fm();await d(400);var ok=await car();if(ok){OK++}else{ER++}if(i<T-1){await d(1500);fm()}}
var pp=document.getElementById("b2b-pg");if(pp){pp.style.borderColor="#22C55E";pp.innerHTML='<div style="text-align:center;padding:8px;"><div style="color:#22C55E;font-weight:800;font-size:1rem;">PRONTO! '+OK+'/'+T+' jogos no carrinho!</div><button onclick="this.parentNode.parentNode.remove()" style="margin-top:8px;background:#22C55E;color:white;border:none;padding:8px 20px;border-radius:8px;font-weight:700;cursor:pointer;">OK</button></div>'}
alert(OK+"/"+T+" jogos no carrinho!"+(ER>0?"\\n"+ER+" erro(s).":"")+"\\nToque no carrinho para finalizar.");
})()`;
    }

    _openMobileBetModal(games, gameKey) {
        const allConfigs = this._getCaixaLotteryConfig();
        const cfg = allConfigs[gameKey] || { name: 'Loteria', url: '' };
        const caixaUrl = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + cfg.url;

        // Remover modal anterior se existir
        const old = document.getElementById('mobile-bet-modal');
        if (old) old.remove();

        // Gerar script para console F12
        const freshScript = this._generateCaixaScript_LEGACY(cfg, games);

        // Gerar HTML dos jogos para aba manual
        let jogosHTML = '';
        games.forEach((g, i) => {
            const nums = g.map(n => String(n).padStart(2, '0'));
            jogosHTML += '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;margin-bottom:6px;border:1px solid rgba(255,255,255,0.06);">' +
                '<div style="flex:1;"><div style="color:#60A5FA;font-weight:700;font-size:0.72rem;margin-bottom:3px;">Jogo ' + (i + 1) + '</div>' +
                '<div style="color:#E2E8F0;font-size:1rem;font-weight:600;font-family:monospace;letter-spacing:1px;">' + nums.join('  ') + '</div></div>' +
                '<button class="mobile-copy-game-btn" data-nums="' + nums.join(', ') + '" style="background:linear-gradient(135deg,#22C55E,#16A34A);color:white;border:none;padding:10px 14px;border-radius:10px;font-size:0.8rem;font-weight:800;cursor:pointer;white-space:nowrap;min-width:70px;">📋 Copiar</button></div>';
        });
        const allFmt = games.map((g, i) => 'Jogo ' + (i + 1) + ': ' + g.map(n => String(n).padStart(2, '0')).join(' - ')).join('\n');

        // Criar modal
        const modal = document.createElement('div');
        modal.id = 'mobile-bet-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding:10px;box-sizing:border-box;overflow-y:auto;-webkit-overflow-scrolling:touch;';

        modal.innerHTML = `<div style="background:linear-gradient(145deg,#0F172A,#1E293B);border-radius:16px;border:1px solid #FFD70040;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding:18px;color:#E2E8F0;box-shadow:0 20px 60px rgba(0,0,0,0.6);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <h2 style="margin:0;font-size:1.1rem;color:#FFD700;">🎰 Apostar Online — ${cfg.name}</h2>
                <button id="close-mobile-bet-modal" style="background:none;border:none;color:#94A3B8;font-size:1.8rem;cursor:pointer;padding:4px 8px;">✕</button>
            </div>
            <div style="background:linear-gradient(135deg,rgba(255,215,0,0.12),rgba(0,60,120,0.1));border:1px solid #FFD70030;border-radius:12px;padding:12px;margin-bottom:14px;">
                <div style="font-weight:800;color:#FFD700;font-size:0.95rem;margin-bottom:4px;">🎰 ${games.length} jogos de ${cfg.name}</div>
                <div style="font-size:0.75rem;color:#94A3B8;">Escolha o método de aposta.</div>
            </div>
            <div style="display:flex;gap:4px;margin-bottom:14px;">
                <button id="tab-auto-btn-m" style="flex:1;padding:12px 6px;border-radius:10px;border:2px solid #FFD700;background:linear-gradient(135deg,#FFD70020,#FFD70008);color:#FFD700;font-weight:800;font-size:0.78rem;cursor:pointer;">⚡ F12 Console</button>
                <button id="tab-manual-btn-m" style="flex:1;padding:12px 6px;border-radius:10px;border:1px solid #47556940;background:transparent;color:#94A3B8;font-weight:700;font-size:0.78rem;cursor:pointer;">📋 Manual</button>
            </div>
            <div id="tab-auto-content-m">
                <div style="background:linear-gradient(145deg,rgba(34,197,94,0.1),rgba(0,60,120,0.08));border:1px solid #22C55E30;border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="color:#22C55E;font-weight:800;font-size:0.9rem;margin-bottom:8px;">⚡ Preenchimento Automático</div>
                    <div style="font-size:0.78rem;color:#CBD5E1;line-height:1.6;">Copie o script, abra o site da Caixa, pressione F12 → Console, cole e Enter.</div>
                </div>
                <div style="margin-bottom:14px;">
                    <button id="btn-copy-script-m" style="width:100%;background:linear-gradient(135deg,#22C55E,#16A34A);color:white;border:none;padding:14px;border-radius:10px;font-size:0.95rem;font-weight:800;cursor:pointer;margin-bottom:10px;">📋 COPIAR SCRIPT DE AUTOMAÇÃO</button>
                    <a href="${caixaUrl}" target="_blank" rel="noopener" style="display:block;width:100%;background:linear-gradient(135deg,#0066CC,#003D80);color:white;padding:14px;border-radius:10px;font-size:0.9rem;font-weight:800;text-align:center;text-decoration:none;box-sizing:border-box;">🌐 ABRIR ${cfg.name.toUpperCase()} NA CAIXA</a>
                </div>
                <div style="background:rgba(255,215,0,0.06);border:1px solid #FFD70020;border-radius:10px;padding:10px;">
                    <div style="color:#FFD700;font-weight:700;font-size:0.72rem;margin-bottom:6px;">⚠️ Se aparecer aviso no Console, digite: <strong>allow pasting</strong> e pressione Enter</div>
                </div>
            </div>
            <div id="tab-manual-content-m" style="display:none;">
                <div style="background:linear-gradient(135deg,rgba(0,102,204,0.1),rgba(0,60,120,0.08));border:1px solid #0066CC20;border-radius:12px;padding:10px;margin-bottom:12px;">
                    <div style="font-size:0.78rem;color:#94A3B8;">Copie cada jogo e preencha manualmente no site da Caixa.</div>
                </div>
                <div style="margin-bottom:12px;">${jogosHTML}</div>
                <button id="mobile-copy-all-btn-m" style="width:100%;background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:white;border:none;padding:14px;border-radius:12px;font-size:0.95rem;font-weight:800;cursor:pointer;margin-bottom:10px;">📋 COPIAR TODOS OS ${games.length} JOGOS</button>
                <a href="${caixaUrl}" target="_blank" rel="noopener" style="display:block;width:100%;background:linear-gradient(135deg,#0066CC,#003D80);color:white;padding:14px;border-radius:12px;font-size:0.95rem;font-weight:800;text-align:center;text-decoration:none;box-sizing:border-box;">🌐 ABRIR SITE DA CAIXA — ${cfg.name}</a>
            </div>
        </div>`;

        document.body.appendChild(modal);

        // Handlers
        document.getElementById('close-mobile-bet-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        const tabAutoBtn = document.getElementById('tab-auto-btn-m');
        const tabManualBtn = document.getElementById('tab-manual-btn-m');
        const tabAutoContent = document.getElementById('tab-auto-content-m');
        const tabManualContent = document.getElementById('tab-manual-content-m');
        const inactiveStyle = 'flex:1;padding:12px 6px;border-radius:10px;border:1px solid #47556940;background:transparent;color:#94A3B8;font-weight:700;font-size:0.78rem;cursor:pointer;';

        tabAutoBtn.addEventListener('click', () => {
            tabAutoContent.style.display = 'block';
            tabManualContent.style.display = 'none';
            tabAutoBtn.style.cssText = 'flex:1;padding:12px 6px;border-radius:10px;border:2px solid #FFD700;background:linear-gradient(135deg,#FFD70020,#FFD70008);color:#FFD700;font-weight:800;font-size:0.78rem;cursor:pointer;';
            tabManualBtn.style.cssText = inactiveStyle;
        });
        tabManualBtn.addEventListener('click', () => {
            tabAutoContent.style.display = 'none';
            tabManualContent.style.display = 'block';
            tabManualBtn.style.cssText = 'flex:1;padding:12px 6px;border-radius:10px;border:2px solid #0066CC;background:linear-gradient(135deg,#0066CC20,#0066CC08);color:#60A5FA;font-weight:800;font-size:0.78rem;cursor:pointer;';
            tabAutoBtn.style.cssText = inactiveStyle;
        });

        // Copiar script
        const copyScriptBtn = document.getElementById('btn-copy-script-m');
        if (copyScriptBtn) {
            copyScriptBtn.addEventListener('click', async () => {
                try { await navigator.clipboard.writeText(freshScript); } catch(e) {
                    const ta = document.createElement('textarea');
                    ta.value = freshScript; ta.style.cssText = 'position:fixed;left:-9999px;';
                    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                }
                copyScriptBtn.textContent = '✅ SCRIPT COPIADO!';
                copyScriptBtn.style.background = 'linear-gradient(135deg,#059669,#047857)';
                setTimeout(() => {
                    copyScriptBtn.textContent = '📋 COPIAR SCRIPT DE AUTOMAÇÃO';
                    copyScriptBtn.style.background = 'linear-gradient(135deg,#22C55E,#16A34A)';
                }, 3000);
            });
        }

        // Copiar jogos individuais
        modal.querySelectorAll('.mobile-copy-game-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const nums = btn.getAttribute('data-nums');
                try { await navigator.clipboard.writeText(nums); } catch(e) {
                    const ta = document.createElement('textarea');
                    ta.value = nums; ta.style.cssText = 'position:fixed;left:-9999px;';
                    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                }
                btn.textContent = '✅';
                setTimeout(() => { btn.textContent = '📋 Copiar'; }, 2000);
            });
        });

        // Copiar todos
        const copyAllBtn = document.getElementById('mobile-copy-all-btn-m');
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', async () => {
                try { await navigator.clipboard.writeText(allFmt); } catch(e) {
                    const ta = document.createElement('textarea');
                    ta.value = allFmt; ta.style.cssText = 'position:fixed;left:-9999px;';
                    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                }
                copyAllBtn.textContent = '✅ TODOS COPIADOS!';
                copyAllBtn.style.background = 'linear-gradient(135deg,#059669,#047857)';
                setTimeout(() => {
                    copyAllBtn.textContent = '📋 COPIAR TODOS OS ' + games.length + ' JOGOS';
                    copyAllBtn.style.background = 'linear-gradient(135deg,#8B5CF6,#7C3AED)';
                }, 3000);
            });
        }
    }

    async openCaixa() {
        const allConfigs = this._getCaixaLotteryConfig();
        const cfg = allConfigs[this.currentGameKey];
        const caixaUrl = cfg
            ? 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + cfg.url
            : 'https://www.loteriasonline.caixa.gov.br/';

        const games = this._lastGeneratedGames || this.currentGeneratedGames || [];

        // ══════ MOBILE: Modal com jogos formatados ══════
        if (this._isMobile()) {
            if (games.length > 0 && cfg) {
                this._openMobileBetModal(games, this.currentGameKey);
            } else {
                // Sem jogos — navegar via link direto
                var linkMobile = document.createElement('a');
                linkMobile.href = caixaUrl;
                linkMobile.target = '_blank';
                linkMobile.rel = 'noopener';
                document.body.appendChild(linkMobile);
                linkMobile.click();
                document.body.removeChild(linkMobile);
            }
            return;
        }

        // ══════ DESKTOP: Fluxo de script (Console F12) ══════
        if (games.length > 0 && cfg) {
            const freshScript = this._generateCaixaScript_LEGACY(cfg, games);
            
            // Link direto será usado após copiar o script

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(freshScript);
                } else {
                    throw new Error('Clipboard API not available');
                }
                console.log('[B2B] ✅ ' + games.length + ' jogos de ' + cfg.name + ' copiados!');
            } catch(e) {
                var ta = document.createElement('textarea');
                ta.value = freshScript;
                ta.style.cssText = 'position:fixed;left:-9999px;';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }

            document.dispatchEvent(new CustomEvent('b2b-aposte-online', {
                detail: { games: games, config: cfg }
            }));

            // Notificação visual (sem alert bloqueante)
            if (typeof Guardian !== 'undefined' && Guardian.toast) {
                Guardian.toast('\u2705 ' + games.length + ' jogos de ' + cfg.name + ' copiados! No site da Caixa: F12 \u2192 Console \u2192 Ctrl+V \u2192 Enter', 'success', 8000);
            }
        }

        // Mostrar painel flutuante com link real para a Caixa
        var oldPanel = document.getElementById('caixa-link-panel');
        if (oldPanel) oldPanel.remove();
        var linkPanel = document.createElement('div');
        linkPanel.id = 'caixa-link-panel';
        linkPanel.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999;background:linear-gradient(135deg,#0F172A,#1E293B);border:2px solid #22C55E;border-radius:16px;padding:16px 24px;box-shadow:0 10px 40px rgba(0,0,0,0.6);text-align:center;max-width:400px;width:90%;animation:slideUp 0.3s ease;';
        var linkHtml = '<div style="color:#22C55E;font-weight:800;font-size:1rem;margin-bottom:10px;">\u2705 Script copiado!</div>';
        linkHtml += '<a href="' + caixaUrl + '" target="_blank" rel="noopener" style="display:block;background:linear-gradient(135deg,#22C55E,#16A34A);color:white;text-decoration:none;padding:14px 24px;border-radius:12px;font-weight:900;font-size:1rem;margin-bottom:8px;">\uD83C\uDFE6 ABRIR SITE DA CAIXA</a>';
        linkHtml += '<div style="color:#94A3B8;font-size:0.72rem;">No site: F12 \u2192 Console \u2192 Ctrl+V \u2192 Enter</div>';
        linkHtml += '<button onclick="this.parentNode.remove()" style="margin-top:8px;background:none;border:1px solid #475569;color:#94A3B8;padding:6px 16px;border-radius:8px;cursor:pointer;font-size:0.75rem;">Fechar</button>';
        linkPanel.innerHTML = linkHtml;
        document.body.appendChild(linkPanel);
        // Auto-remover apos 15 segundos
        setTimeout(function() { var p = document.getElementById('caixa-link-panel'); if (p) p.remove(); }, 15000);
    }

    getSelectedNumbers() {
        return Array.from(this.selectedNumbers);
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 SALVAR JOGOS — DIRETO na pasta da loteria (sem diálogo)
    //    POST /salvar → server.js grava em:
    //    Desktop/LOTERIAS JOGOS SALVOS L99/<Loteria>/arquivo.txt
    // ═══════════════════════════════════════════════════════════════

    async saveGames() {
        if (!this.currentGeneratedGames || this.currentGeneratedGames.length === 0) {
            if (typeof Guardian !== 'undefined') {
                Guardian.toast('Gere jogos primeiro antes de salvar.', 'warning');
            } else {
                alert('Gere jogos primeiro antes de salvar.');
            }
            return;
        }

        const game = typeof GAMES !== 'undefined' ? GAMES[this.currentGameKey] : null;
        const gameName = game ? game.name : 'Loteria';
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
        const fileName = `${gameName}_${dateStr}_${timeStr}.txt`;

        // ── Extras: Time do Coração (Timemania) e Mês da Sorte (Dia de Sorte) ──
        const mesSorteSelect = document.getElementById('mes-sorte-select');
        const mesSorte = (this.currentGameKey === 'diadesorte' && mesSorteSelect) ? mesSorteSelect.value : null;

        // currentGeneratedExtras: array paralelo aos jogos com índice do time (Timemania)
        // ou null/undefined para outras loterias
        const extras = this.currentGeneratedExtras || [];
        const isTimemania = this.currentGameKey === 'timemania';
        const isDiaDeSorte = this.currentGameKey === 'diadesorte';

        let content = `═══════════════════════════════════════\n`;
        content += `  JOGOS — ${gameName.toUpperCase()}\n`;
        if (mesSorte) content += `  Mês da Sorte (cabeçalho): ${mesSorte}\n`;
        if (isTimemania) content += `  Time do Coração: registrado por jogo abaixo\n`;
        content += `  Data: ${now.toLocaleString('pt-BR')}\n`;
        content += `  Total de Jogos: ${this.currentGeneratedGames.length}\n`;
        content += `═══════════════════════════════════════\n\n`;

        this.currentGeneratedGames.forEach((game, index) => {
            const nums = game.map(n => n.toString().padStart(2, '0')).join(' - ');
            let extra = '';
            if (isTimemania && extras[index] !== undefined && extras[index] !== null) {
                // L99_TIMES é o array global dos times da Timemania
                const timeName = (typeof L99_TIMES !== 'undefined' && L99_TIMES[extras[index]])
                    ? L99_TIMES[extras[index]]
                    : `Time #${extras[index]}`;
                extra = ` | Time: ${timeName}`;
            } else if (isDiaDeSorte) {
                // Dia de Sorte: usa L99_MESES[extras[index]] (mesmo padrão da UI)
                // L99_MESES = ['Janeiro','Fevereiro',...,'Dezembro']
                if (extras[index] !== undefined && extras[index] !== null) {
                    const mesNome = (typeof L99_MESES !== 'undefined' && L99_MESES[extras[index]])
                        ? L99_MESES[extras[index]]
                        : (mesSorte || `Mês #${extras[index]}`);
                    extra = ` | Mês: ${mesNome}`;
                } else if (mesSorte) {
                    extra = ` | Mês: ${mesSorte}`;
                }
            }
            content += `Jogo ${String(index + 1).padStart(3, '0')}: ${nums}${extra}\n`;
        });

        content += `\n═══════════════════════════════════════\n`;
        content += `  B2B Loterias — Boa Sorte! 🍀\n`;
        content += `═══════════════════════════════════════\n`;

        // ══════ SALVAR DIRETO VIA SERVIDOR LOCAL ══════
        try {
            const response = await fetch('/salvar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameKey: this.currentGameKey,
                    fileName: fileName,
                    content: content,
                }),
            });

            const result = await response.json();

            if (result.ok) {
                // ✅ Feedback visual — salvou direto na pasta!
                const btn = this.saveBtn;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '✅ Salvo!';
                btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
                btn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.style.transform = '';
                }, 3000);

                // Toast com o caminho da pasta onde foi salvo
                const pastaRelativa = result.relativePath || result.path || 'Jogos_Salvos';
                if (typeof Guardian !== 'undefined' && Guardian.toast) {
                    Guardian.toast(`✅ Jogo salvo em:\n📁 ${pastaRelativa}`, 'success', 5000);
                } else {
                    // Notificação nativa como fallback
                    const toast = document.createElement('div');
                    toast.style.cssText = `
                        position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
                        background:linear-gradient(135deg,#166534,#15803d); color:#fff;
                        padding:14px 22px; border-radius:12px; font-size:13px;
                        box-shadow:0 8px 32px rgba(0,0,0,0.4); z-index:99999;
                        max-width:420px; text-align:center; line-height:1.5;
                        animation: fadeInUp 0.3s ease;
                    `;
                    toast.innerHTML = `✅ <strong>Jogo salvo automaticamente!</strong><br>
                        <span style="font-size:11px;opacity:0.85">📁 ${pastaRelativa}</span>`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 5000);
                }

                console.log(`[B2B] ✅ Salvo direto: ${result.path}`);
                return;
            } else {
                console.error('[Save] Servidor retornou erro:', result.error);
            }
        } catch (err) {
            console.warn('[Save] Servidor local indisponível, usando fallback:', err.message);
        }

        // ══════ FALLBACK: Download direto (se servidor não estiver rodando) ══════
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const urlObj = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlObj;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(urlObj);

        // Feedback visual fallback
        const btn = this.saveBtn;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '⬇️ Baixado!';
        btn.style.background = 'linear-gradient(135deg, #2563EB, #1D4ED8)';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2500);
    }

    openCheckModal() {
        // We now allow opening even without current generated games, to check saved files
        // if (!this.currentGeneratedGames || this.currentGeneratedGames.length === 0) { ... } REMOVED CHECK


        // Auto-fill with last draw number for convenience
        const recent = StatsService.getRecentResults(this.currentGameKey, 1)[0];
        let autoFillValue = "";

        if (recent) {
            autoFillValue = recent.drawNumber.toString();
        }

        this.checkModal.style.display = 'flex';
        this.inputCheckNumbers.value = autoFillValue;
        if (this.loadGamesInput) this.loadGamesInput.value = ''; // Reset file input


        // Add a visual hint about using last draw
        if (recent) {
            this.inputCheckNumbers.title = `Concurso sugerido: ${autoFillValue}`;
        }

        this.inputCheckNumbers.focus();

        // ── L99: Botão para listar jogos salvos da pasta ──
        const self = this;
        const listarBtn = document.getElementById('btn-listar-jogos-salvos');
        const listArea = document.getElementById('saved-games-list');
        if (listarBtn && listArea) {
            listarBtn.onclick = async function() {
                listarBtn.innerHTML = '⏳ Carregando...';
                try {
                    const resp = await fetch('/listar-jogos?gameKey=' + self.currentGameKey);
                    const data = await resp.json();
                    if (data.ok && data.files && data.files.length > 0) {
                        // Filtrar apenas arquivos de jogos (não relatórios CONFERIDO_...Concurso)
                        const gameFiles = data.files.filter(function(f) {
                            return !f.name.includes('Concurso_');
                        });
                        listArea.style.display = 'block';
                        listArea.innerHTML = '';
                        if (gameFiles.length === 0) {
                            listArea.innerHTML = '<div style="padding:12px;color:#94A3B8;text-align:center;">Nenhum arquivo de jogo encontrado (apenas relatórios de conferência)</div>';
                            listarBtn.innerHTML = '📂 Carregar da Pasta LOTERIAS JOGOS SALVOS L99';
                            return;
                        }
                        gameFiles.forEach(function(file) {
                            var modified = new Date(file.modified).toLocaleDateString('pt-BR') + ' ' + new Date(file.modified).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
                            var isChecked = file.name.includes('CONFERIDO');
                            var icon = isChecked ? '✅' : '📄';
                            var item = document.createElement('div');
                            item.style.cssText = 'padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:background 0.2s;font-size:0.8rem;';
                            item.innerHTML = '<span style="color:#E2E8F0;font-weight:600;">' + icon + ' ' + file.name + '</span><span style="color:#64748b;font-size:0.7rem;">' + modified + '</span>';
                            item.onmouseenter = function() { item.style.background = 'rgba(59,130,246,0.15)'; };
                            item.onmouseleave = function() { item.style.background = ''; };
                            item.onclick = async function() {
                                item.innerHTML = '<span style="color:#22C55E;">⏳ Carregando...</span>';
                                try {
                                    var readResp = await fetch('/ler-jogo', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ gameKey: self.currentGameKey, fileName: file.name }) });
                                    var readData = await readResp.json();
                                    if (readData.ok && readData.content) {
                                        var parsedGames = self.parseSavedGames(readData.content);
                                        if (parsedGames && parsedGames.length > 0) {
                                            self.currentGeneratedGames = parsedGames;
                                            self._lastLoadedFileName = file.name;
                                            self.renderGames({ games: parsedGames }, self.currentGameKey);
                                            listArea.style.display = 'none';
                                            listarBtn.innerHTML = '✅ ' + parsedGames.length + ' jogos carregados de ' + file.name;
                                            setTimeout(function() { listarBtn.innerHTML = '📂 Carregar da Pasta LOTERIAS JOGOS SALVOS L99'; }, 3000);
                                        } else {
                                            alert('Nenhum jogo encontrado no arquivo: ' + file.name);
                                            item.innerHTML = '<span style="color:#EF4444;">❌ Formato inválido</span>';
                                        }
                                    }
                                } catch(e) {
                                    alert('Erro ao ler arquivo: ' + e.message);
                                }
                            };
                            listArea.appendChild(item);
                        });
                    } else {
                        listArea.style.display = 'block';
                        listArea.innerHTML = '<div style="padding:12px;color:#94A3B8;text-align:center;">Nenhum jogo salvo encontrado para esta loteria.<br><small>Pasta: ' + (data.path || '') + '</small></div>';
                    }
                } catch(e) {
                    alert('Erro ao listar jogos: ' + e.message + '\nVerifique se o servidor está rodando.');
                }
                listarBtn.innerHTML = '📂 Carregar da Pasta LOTERIAS JOGOS SALVOS L99';
            };
        }
    }

    closeCheckModal() {
        this.checkModal.style.display = 'none';
        // Remove highlights on close? Maybe not, user might want to see.
    }

    async confirmCheck() {
        const input = this.inputCheckNumbers ? this.inputCheckNumbers.value.trim() : '';
        const game = typeof GAMES !== 'undefined' ? GAMES[this.currentGameKey] : null;
        if (!game) {
            alert('Erro: jogo não carregado.');
            return;
        }

        let targetNumbers = [];
        let drawInfo = "Manual";

        // Check if input is a Draw Number (single integer) or Manual List of numbers
        const isDrawNumber = /^\d+$/.test(input) && !input.includes(' ') && !input.includes(',');

        if (isDrawNumber) {
            const drawNum = parseInt(input);
            
            // 1. Primeiro tenta o cache local (historyStore)
            let result = StatsService.getResultByDrawNumber(this.currentGameKey, drawNum);

            // 2. Se não encontrou, busca da API em tempo real
            if (!result) {
                console.log('[CONFERIR] Concurso ' + drawNum + ' não encontrado no cache. Buscando da API...');
                
                // Feedback visual: buscando...
                const confirmBtn = document.getElementById('confirm-check-btn');
                const originalText = confirmBtn ? confirmBtn.innerHTML : '';
                if (confirmBtn) {
                    confirmBtn.innerHTML = '⏳ Buscando resultado do Concurso ' + drawNum + '...';
                    confirmBtn.disabled = true;
                }

                try {
                    const fetched = await StatsService._fetchSingleDraw(this.currentGameKey, drawNum);
                    if (fetched && fetched.numbers && fetched.numbers.length > 0) {
                        // Inserir no historyStore para futuras consultas
                        if (!StatsService.historyStore[this.currentGameKey]) {
                            StatsService.historyStore[this.currentGameKey] = [];
                        }
                        StatsService.historyStore[this.currentGameKey].push(fetched);
                        result = fetched;
                        console.log('[CONFERIR] ✅ Resultado obtido da API: Concurso ' + drawNum + ' → [' + fetched.numbers.join(', ') + ']');
                    }
                } catch(apiErr) {
                    console.warn('[CONFERIR] API falhou:', apiErr.message);
                }

                // Restaurar botão
                if (confirmBtn) {
                    confirmBtn.innerHTML = originalText;
                    confirmBtn.disabled = false;
                }
            }

            // 3. Fallback: busca no REAL_HISTORY_DB
            if (!result && typeof REAL_HISTORY_DB !== 'undefined' && REAL_HISTORY_DB[this.currentGameKey]) {
                const db = REAL_HISTORY_DB[this.currentGameKey];
                for (let i = 0; i < db.length; i++) {
                    if (db[i].drawNumber == drawNum) {
                        result = db[i];
                        console.log('[CONFERIR] Encontrado no REAL_HISTORY_DB');
                        break;
                    }
                }
            }

            if (result && result.numbers && result.numbers.length > 0) {
                targetNumbers = result.numbers;
                drawInfo = `Concurso ${result.drawNumber}`;
                // ★ v10.9: Salvar resultado completo para conferência de extras (mês/time)
                this._lastDrawResult = result;
                // ★ v13.0: Dupla Sena — incluir 2º sorteio na conferência
                if (this.currentGameKey === 'duplasena' && result.numbers2 && result.numbers2.length > 0) {
                    this._lastDrawNumbers2 = result.numbers2;
                } else {
                    this._lastDrawNumbers2 = null;
                }
            } else {
                // Concurso realmente não encontrado em nenhuma fonte
                alert(`❌ Concurso ${drawNum} não encontrado.\n\nVerifique se o número do concurso está correto ou digite os números sorteados manualmente separados por espaço ou vírgula.\n\nExemplo: 08 24 27 37 47 55`);
                return;
            }
        } else {
            this._lastDrawResult = null; // v10.9: entrada manual, sem dados extras da API
            targetNumbers = input.split(/[\s,-]+/).map(n => parseInt(n)).filter(n => !isNaN(n));
            if (targetNumbers.length < game.draw) {
                alert(`Por favor, insira o Número do Concurso OU pelo menos ${game.draw} números.`);
                return;
            }
        }

        const file = this.loadGamesInput ? this.loadGamesInput.files[0] : null;
        if (file) {
            // Check from File
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const parsedGames = this.parseSavedGames(text);
                if (parsedGames && parsedGames.length > 0) {
                    this.currentGeneratedGames = parsedGames;
                    this.renderGames({ games: parsedGames }, this.currentGameKey);
                    this.closeCheckModal();
                    setTimeout(() => this.highlightResults(targetNumbers, drawInfo, this._lastDrawResult), 100);
                } else {
                    alert('Erro ao ler jogos do arquivo.');
                }
            };
            reader.readAsText(file);
        } else {
            // Check Current
            if (!this.currentGeneratedGames || this.currentGeneratedGames.length === 0) {
                alert('Nenhum jogo carregado para conferir.\n\nGere jogos primeiro usando "Gerar Jogos" ou "QUANTUM L99".');
                return;
            }
            this.closeCheckModal();
            this.highlightResults(targetNumbers, drawInfo, this._lastDrawResult);
        }
    }

    parseSavedGames(text) {
        const games = [];
        const lines = text.split('\n');
        lines.forEach(line => {
            // Expected format: "Jogo 1: 01 - 02 - 03..."
            if (line.trim().startsWith('Jogo')) {
                const parts = line.split(':');
                if (parts.length > 1) {
                    const numbersStr = parts[1].trim();
                    const numbers = numbersStr.split(' - ').map(n => parseInt(n)).filter(n => !isNaN(n));
                    if (numbers.length > 0) {
                        games.push(numbers);
                    }
                }
            }
        });
        return games;
    }

    highlightResults(drawnNumbers, drawInfo = "", drawResult = null) {
        const drawnSet = new Set(drawnNumbers);
        const cards = document.querySelectorAll('.game-card');
        const game = GAMES[this.currentGameKey];

        // ═══ V13: Dupla Sena — conferir contra AMBOS os sorteios ═══
        const isDuplaSena = this.currentGameKey === 'duplasena';
        const drawnSet2 = (isDuplaSena && this._lastDrawNumbers2) ? new Set(this._lastDrawNumbers2) : null;

        // ═══ V10: Conferência Completa — Todas as Faixas ═══
        const paidStrategies = game.strategies.filter(s => s.paid !== false);
        const awardCounts = {};
        paidStrategies.forEach(s => awardCounts[s.id] = 0);

        // Distribuição de acertos para gráfico
        const hitDistribution = {};
        let maxPossibleHits = 0;

        // V11: Coletar jogos ganhadores para exibição agrupada
        const winningGames = [];

        // V13 FIX: Para Dupla Sena, cada jogo é conferido contra AMBOS os sorteios.
        // Regra oficial: premiações de cada sorteio são INDEPENDENTES e ACUMULAM.
        // Um mesmo jogo pode ganhar Terno no 1º sorteio E Quadra no 2º sorteio.
        this.currentGeneratedGames.forEach((gameNumbers, index) => {
            // Hits no 1º sorteio
            let hits1 = 0;
            for (let i = 0; i < gameNumbers.length; i++) {
                if (drawnSet.has(gameNumbers[i])) hits1++;
            }

            // Hits no 2º sorteio (Dupla Sena)
            let hits2 = 0;
            if (drawnSet2) {
                for (let i = 0; i < gameNumbers.length; i++) {
                    if (drawnSet2.has(gameNumbers[i])) hits2++;
                }
            }

            // Para Dupla Sena: premiar em AMBOS os sorteios (acumula)
            // Para outras loterias: apenas hits1
            const hits = isDuplaSena ? Math.max(hits1, hits2) : hits1;

            if (hits > maxPossibleHits) maxPossibleHits = hits;
            hitDistribution[hits] = (hitDistribution[hits] || 0) + 1;

            const hitsToCheck = (this.currentGameKey === 'lotomania' && hits === 0) ? 0 : hits;

            if (isDuplaSena && drawnSet2) {
                // Dupla Sena: conferir cada sorteio INDEPENDENTEMENTE
                const strat1 = paidStrategies.find(s => s.match === hits1);
                const strat2 = paidStrategies.find(s => s.match === hits2);

                let totalPrize = 0;
                let bestStrat = null;

                if (strat1) {
                    awardCounts[strat1.id]++;
                    totalPrize += (strat1.prize || 0);
                    bestStrat = strat1;
                }
                if (strat2) {
                    awardCounts[strat2.id]++;
                    totalPrize += (strat2.prize || 0);
                    if (!bestStrat || strat2.match > bestStrat.match) bestStrat = strat2;
                }

                if (bestStrat) {
                    winningGames.push({
                        index: index,
                        numbers: gameNumbers,
                        hits: Math.max(hits1, hits2),
                        hits1: hits1,
                        hits2: hits2,
                        strat: bestStrat,
                        prize: totalPrize
                    });
                }
            } else {
                // Todas as outras loterias
                const matchedStrat = paidStrategies.find(s => s.match === hitsToCheck);
                if (matchedStrat) {
                    awardCounts[matchedStrat.id]++;
                    winningGames.push({
                        index: index,
                        numbers: gameNumbers,
                        hits: hits,
                        strat: matchedStrat,
                        prize: matchedStrat.prize || 0
                    });
                }
            }
        });

        // Atualização Visual Otimizada (DOM)
        // Se houver muitos jogos (>500), faremos atualizações assíncronas para não travar a UI
        const CHUNK_SIZE = 250;
        let currentChunk = 0;

        const updateCardsChunk = () => {
            const start = currentChunk * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, cards.length);

            for (let i = start; i < end; i++) {
                const card = cards[i];
                const gameNumbers = this.currentGeneratedGames[i];
                if (!gameNumbers) continue;

                // Hits no 1º sorteio
                let hits1 = 0;
                for (let k = 0; k < gameNumbers.length; k++) {
                    if (drawnSet.has(gameNumbers[k])) hits1++;
                }

                // Hits no 2º sorteio (Dupla Sena)
                let hits2 = 0;
                if (drawnSet2) {
                    for (let k = 0; k < gameNumbers.length; k++) {
                        if (drawnSet2.has(gameNumbers[k])) hits2++;
                    }
                }

                const hits = isDuplaSena ? Math.max(hits1, hits2) : hits1;
                const hitsToCheck = (this.currentGameKey === 'lotomania' && hits === 0) ? 0 : hits;

                // Update balls — Dupla Sena: verde=1º, azul=2º, dourado=ambos
                const balls = card.querySelectorAll('.ball');
                balls.forEach((ball, bIdx) => {
                    const num = gameNumbers[bIdx];
                    const inDraw1 = drawnSet.has(num);
                    const inDraw2 = drawnSet2 ? drawnSet2.has(num) : false;

                    if (inDraw1 && inDraw2) {
                        // Acertou em AMBOS os sorteios
                        ball.classList.add('hit');
                        ball.style.backgroundColor = '#FFD700';
                        ball.style.color = '#000';
                        ball.style.borderColor = '#FFD700';
                        ball.style.boxShadow = '0 0 10px rgba(255,215,0,0.6)';
                    } else if (inDraw1) {
                        ball.classList.add('hit');
                        ball.style.backgroundColor = '#22C55E';
                        ball.style.color = '#fff';
                        ball.style.borderColor = '#22C55E';
                        ball.style.boxShadow = '0 0 8px rgba(34,197,94,0.5)';
                    } else if (inDraw2) {
                        ball.classList.add('hit');
                        ball.style.backgroundColor = '#3B82F6';
                        ball.style.color = '#fff';
                        ball.style.borderColor = '#3B82F6';
                        ball.style.boxShadow = '0 0 8px rgba(59,130,246,0.5)';
                    } else {
                        if (!ball.classList.contains('fixed')) {
                            ball.style.backgroundColor = '';
                            ball.style.color = '';
                            ball.style.borderColor = '';
                            ball.style.boxShadow = '';
                            ball.classList.remove('hit');
                        }
                    }
                });

                // Update Summary
                let summary = card.querySelector('.hit-summary');
                if (!summary) {
                    summary = document.createElement('div');
                    summary.className = 'hit-summary';
                    summary.style.cssText = 'width:100%;text-align:right;font-size:0.8rem;font-weight:bold;margin-top:5px;padding:4px 6px;border-radius:6px;';
                    card.appendChild(summary);
                }

                if (isDuplaSena && drawnSet2) {
                    // Dupla Sena: mostrar resultado de AMBOS os sorteios
                    const strat1 = paidStrategies.find(s => s.match === hits1);
                    const strat2 = paidStrategies.find(s => s.match === hits2);
                    const bestStrat = strat1 || strat2;
                    let totalPrize = (strat1 ? strat1.prize : 0) + (strat2 ? strat2.prize : 0);

                    if (bestStrat) {
                        const isJackpot = (strat1 && strat1.match === game.draw) || (strat2 && strat2.match === game.draw);
                        summary.style.color = isJackpot ? '#FFD700' : '#22C55E';
                        summary.style.background = isJackpot ? 'rgba(255,215,0,0.08)' : 'rgba(34,197,94,0.08)';
                        const s1Label = strat1 ? `1º: ${hits1}ac (${strat1.label})` : `1º: ${hits1}ac`;
                        const s2Label = strat2 ? `2º: ${hits2}ac (${strat2.label})` : `2º: ${hits2}ac`;
                        const prizeHint = totalPrize > 0 ? ` ≈ R$ ${totalPrize.toFixed(2).replace('.', ',')}` : '';
                        summary.innerHTML = `🏆 ${s1Label} | ${s2Label}${prizeHint}`;
                    } else if (hits1 > 0 || hits2 > 0) {
                        summary.style.color = '#94A3B8';
                        summary.style.background = 'rgba(255,255,255,0.03)';
                        summary.textContent = `1º: ${hits1}ac | 2º: ${hits2}ac — sem premiação`;
                    } else {
                        summary.style.color = '#475569';
                        summary.style.background = '';
                        summary.textContent = 'Nenhum acerto em ambos sorteios';
                    }
                } else {
                    // Todas as outras loterias
                    const displayHits = (this.currentGameKey === 'lotomania' && hits1 === 0) ? '0 (Mania!)' : hits1;
                    const matchedStrat = paidStrategies.find(s => s.match === hitsToCheck);

                    if (matchedStrat) {
                        const isJackpot = matchedStrat.match === game.draw;
                        summary.style.color = isJackpot ? '#FFD700' : '#22C55E';
                        summary.style.background = isJackpot ? 'rgba(255,215,0,0.08)' : 'rgba(34,197,94,0.08)';
                        const prizeHint = matchedStrat.prize > 100
                            ? ` ≈ ${matchedStrat.prize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                            : (matchedStrat.prize > 0 ? ` ≈ R$ ${matchedStrat.prize.toFixed(2).replace('.', ',')}` : '');
                        summary.innerHTML = `🏆 ${displayHits} acertos — <strong>${matchedStrat.label}</strong>${prizeHint}`;
                    } else if (hits1 > 0) {
                        summary.style.color = '#94A3B8';
                        summary.style.background = 'rgba(255,255,255,0.03)';
                        summary.textContent = `${hits1} acerto${hits1 > 1 ? 's' : ''} — sem premiação nesta faixa`;
                    } else {
                        summary.style.color = '#475569';
                        summary.style.background = '';
                        summary.textContent = 'Nenhum acerto';
                    }
                }
            }

            currentChunk++;
            if (currentChunk * CHUNK_SIZE < cards.length) {
                requestAnimationFrame(updateCardsChunk);
            }
        };

        // Iniciar atualização visual
        requestAnimationFrame(updateCardsChunk);

        // ═══ RESUMO DA CONFERÊNCIA V10 — COMPLETO E DETALHADO ═══
        const currency = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const totalJogos = this.currentGeneratedGames.length;
        const totalGanhos = Object.values(awardCounts).reduce((s, v) => s + v, 0);
        const minStrat = paidStrategies.length > 0 ? Math.min(...paidStrategies.map(s => s.match)) : 0;
        const maxStrat = paidStrategies.length > 0 ? Math.max(...paidStrategies.map(s => s.match)) : 0;

        let summaryHTML = `<div style="font-family:'Outfit','Inter',sans-serif;">`;

        
// ── CABEÇALHO ──
        summaryHTML += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">`;
        summaryHTML += `<div style="font-size:1.8rem;">🔍</div>`;
        summaryHTML += `<div>`;
        summaryHTML += `<h4 style="margin:0;color:${game.color};font-size:1rem;font-weight:800;">CONFERÊNCIA — ${game.name.toUpperCase()}</h4>`;
        summaryHTML += `<div style="font-size:0.72rem;color:#94A3B8;">${drawInfo || 'Resultado informado manualmente'} · Faixas premiadas: ${minStrat} a ${maxStrat} acertos</div>`;
        if (isDuplaSena && this._lastDrawNumbers2) {
            summaryHTML += `<div style="font-size:0.72rem;color:#94A3B8;margin-top:4px;">`;
            summaryHTML += `<span style="color:#22C55E;">● 1º Sorteio:</span> ${drawnNumbers.map(n => String(n).padStart(2,'0')).join(' - ')} `;
            summaryHTML += `<span style="color:#3B82F6;margin-left:8px;">● 2º Sorteio:</span> ${this._lastDrawNumbers2.map(n => String(n).padStart(2,'0')).join(' - ')}`;
            summaryHTML += `</div>`;
        }
        summaryHTML += `</div></div>`;

        
// ── RESUMO RÁPIDO ──
        summaryHTML += `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">`;
        summaryHTML += `<div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:6px 12px;font-size:0.82rem;"><strong>${totalJogos}</strong> jogo${totalJogos > 1 ? 's' : ''} conferidos</div>`;
        if (totalGanhos > 0) {
            summaryHTML += `<div style="background:rgba(34,197,94,0.15);border:1px solid #22C55E50;border-radius:8px;padding:6px 12px;color:#22C55E;font-size:0.82rem;font-weight:700;">🏆 ${totalGanhos} prêmio${totalGanhos > 1 ? 's' : ''} ganho${totalGanhos > 1 ? 's' : ''}!</div>`;
        } else {
            summaryHTML += `<div style="background:rgba(239,68,68,0.1);border:1px solid #EF444440;border-radius:8px;padding:6px 12px;color:#EF4444;font-size:0.82rem;">Nenhuma faixa premiada desta vez</div>`;
        }
        summaryHTML += `</div>`;

        
// ── DISTRIBUIÇÃO DE ACERTOS (gráfico de barras) ──
        summaryHTML += `<div style="margin-bottom:12px;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">`;
        summaryHTML += `<div style="font-size:0.68rem;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Distribuição de Acertos</div>`;
        const maxHitCount = Math.max(...Object.values(hitDistribution), 1);
        for (let h = maxPossibleHits; h >= 0; h--) {
            const count = hitDistribution[h] || 0;
            if (count === 0 && h > maxPossibleHits) continue;
            const pct = totalJogos > 0 ? (count / totalJogos * 100) : 0;
            const barW = maxHitCount > 0 ? (count / maxHitCount * 100) : 0;
            const isPrized = paidStrategies.some(s => s.match === h);
            const barColor = isPrized ? (h === game.draw ? '#FFD700' : '#22C55E') : '#334155';
            const textColor = isPrized ? '#f1f5f9' : '#64748b';
            if (count > 0 || isPrized) {
                summaryHTML += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">`;
                summaryHTML += `<span style="min-width:55px;font-size:0.72rem;color:${textColor};font-weight:${isPrized?'700':'400'};text-align:right;">${h} acerto${h !== 1 ? 's' : ''}</span>`;
                summaryHTML += `<div style="flex:1;height:14px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:hidden;">`;
                summaryHTML += `<div style="height:100%;width:${barW}%;background:${barColor};border-radius:4px;transition:width 0.5s;min-width:${count>0?'2px':'0'};"></div>`;
                summaryHTML += `</div>`;
                summaryHTML += `<span style="min-width:50px;font-size:0.72rem;color:${textColor};font-weight:600;">${count}x (${pct.toFixed(0)}%)</span>`;
                summaryHTML += `${isPrized ? '<span style="font-size:0.65rem;">💰</span>' : ''}`;
                summaryHTML += `</div>`;
            }
        }
        summaryHTML += `</div>`;

        
// ── TABELA DE FAIXAS PREMIADAS ──
        summaryHTML += `<div style="font-size:0.72rem;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">💎 Faixas de Premiação — ${game.name}</div>`;
        summaryHTML += `<div style="display:flex;flex-direction:column;gap:4px;">`;

        // ── Buscar prêmios REAIS da API (se disponíveis) ──
        let realPrizes = {};
        try {
            const prizeInfo = StatsService.getPrizeInfo(this.currentGameKey);
            if (prizeInfo && prizeInfo.prizes && prizeInfo.prizes.length > 0) {
                prizeInfo.prizes.forEach(p => {
                    // API da Caixa: { descricaoFaixa, faixa, numeroDeGanhadores, valorPremio }
                    const faixa = parseInt(p.faixa);
                    if (p.valorPremio !== undefined) {
                        realPrizes[faixa] = {
                            valor: parseFloat(p.valorPremio) || 0,
                            ganhadores: parseInt(p.numeroDeGanhadores) || 0,
                            descricao: p.descricaoFaixa || ''
                        };
                    }
                });
            }
        } catch(e) { /* fallback para valores estáticos */ }

        let estimatedTotal = 0;
        let faixaIndex = 0;
        paidStrategies.forEach(strat => {
            faixaIndex++;
            const count = awardCounts[strat.id] || 0;
            const isJackpot = strat.match === game.draw;

            // Usar prêmio real da API se disponível, senão fallback estático
            const realPrize = realPrizes[faixaIndex];
            const prizeValue = realPrize ? realPrize.valor : (strat.prize || 0);

            // Para prêmio principal: NÃO multiplicar por count (é o valor total do rateio)
            // Para faixas menores: prêmio é por volante
            let subtotal;
            if (isJackpot) {
                // Jackpot: se temos count ganhadores nossos, o valor é prizeValue dividido
                // entre TODOS os ganhadores (nossos + outros). Usamos como estimativa.
                subtotal = count > 0 ? prizeValue : 0;
            } else {
                subtotal = count * prizeValue;
            }
            if (count > 0) estimatedTotal += subtotal;

            const rowBg = count > 0
                ? (isJackpot ? 'rgba(255,215,0,0.15)' : 'rgba(34,197,94,0.12)')
                : 'rgba(255,255,255,0.03)';
            const borderCol = count > 0
                ? (isJackpot ? '#FFD70060' : '#22C55E50')
                : 'rgba(255,255,255,0.06)';
            const textCol = count > 0
                ? (isJackpot ? '#FFD700' : '#22C55E')
                : '#475569';

            let prizeStr;
            if (isJackpot) {
                prizeStr = `~${currency(prizeValue)} (acumulado)`;
            } else if (prizeValue >= 1) {
                prizeStr = `~${currency(prizeValue)} (rateio)`;
            } else if (prizeValue > 0) {
                prizeStr = `~R$ ${prizeValue.toFixed(2).replace('.', ',')} (rateio)`;
            } else {
                prizeStr = 'Valor por rateio';
            }

            summaryHTML += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:${rowBg};border:1px solid ${borderCol};border-radius:8px;transition:all 0.3s;">`;
            summaryHTML += `<div style="display:flex;align-items:center;gap:8px;">`;
            summaryHTML += `<span style="font-size:0.9rem;">${count > 0 ? (isJackpot ? '🥇' : '✅') : '◻️'}</span>`;
            summaryHTML += `<div>`;
            summaryHTML += `<div style="font-size:0.82rem;font-weight:${count > 0 ? '700' : '400'};color:${count > 0 ? '#f1f5f9' : '#64748b'};">${strat.label}</div>`;
            summaryHTML += `<div style="font-size:0.66rem;color:#64748b;">${strat.match === 0 ? 'Nenhum número acertado' : strat.match + ' acertos'} · ${prizeStr}</div>`;
            summaryHTML += `</div></div>`;
            summaryHTML += `<div style="text-align:right;">`;
            summaryHTML += `<div style="font-size:0.9rem;font-weight:800;color:${textCol};">${count > 0 ? count + 'x' : '—'}</div>`;
            if (count > 0 && prizeValue > 0) {
                summaryHTML += `<div style="font-size:0.68rem;color:${textCol};opacity:0.85;">≈ ${currency(subtotal)}</div>`;
            }
            summaryHTML += `</div></div>`;
        });

        summaryHTML += `</div>`;

        
// ── TOTAL ESTIMADO ──
        // Somar prêmio dos extras (Time do Coração / Mês da Sorte) ao total visual
        // ★ v10.9 FIX: Prêmio de extras (Mês/Time) — SÓ contar se realmente acertou
        // Bug anterior: contava TODOS os jogos como acerto porque todo jogo tem um mês/time gerado
        if ((this.currentGameKey === 'timemania' || this.currentGameKey === 'diadesorte') && this.currentGeneratedExtras) {
            let extrasHitCount = 0;
            const extraPrizeUnit = this.currentGameKey === 'timemania' ? 7.50 : 3.00;
            const extrasLabel = this.currentGameKey === 'timemania' ? 'Time' : 'Mês';

            // Determinar o extra REAL sorteado (da API)
            let drawnExtraIdx = -1; // -1 = desconhecido (API não retornou)
            if (drawResult) {
                if (this.currentGameKey === 'diadesorte' && drawResult.mesSorte) {
                    // mesSorte vem como "Janeiro", "Fevereiro", etc.
                    drawnExtraIdx = L99_MESES.findIndex(m => m.toLowerCase() === drawResult.mesSorte.toLowerCase());
                } else if (this.currentGameKey === 'timemania' && drawResult.timeCoracao) {
                    drawnExtraIdx = L99_TIMES.findIndex(t => t.toLowerCase() === drawResult.timeCoracao.toLowerCase());
                }
            }

            if (drawnExtraIdx >= 0) {
                // Temos o resultado real — verificar quais jogos acertaram
                this.currentGeneratedGames.forEach((nums, idx) => {
                    if (this.currentGeneratedExtras[idx] === drawnExtraIdx) {
                        extrasHitCount++;
                    }
                });
            }
            // Se drawnExtraIdx === -1 (sem dados da API), não contar nenhum extra como prêmio

            if (extrasHitCount > 0) {
                const extrasTotalPrize = extrasHitCount * extraPrizeUnit;
                estimatedTotal += extrasTotalPrize;
                const extraName = this.currentGameKey === 'diadesorte' 
                    ? (drawnExtraIdx >= 0 ? L99_MESES[drawnExtraIdx] : '?')
                    : (drawnExtraIdx >= 0 ? L99_TIMES[drawnExtraIdx] : '?');
                summaryHTML += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:8px;margin-top:6px;">`
                + `<div style="display:flex;align-items:center;gap:8px;">`
                + `<span style="font-size:0.9rem;">${this.currentGameKey === 'timemania' ? '⚽' : '📅'}</span>`
                + `<div><div style="font-size:0.82rem;font-weight:700;color:#f1f5f9;">${extrasLabel} Acertado: ${extraName}</div>`
                + `<div style="font-size:0.66rem;color:#64748b;">${extrasHitCount}x acertos → R$ ${extraPrizeUnit.toFixed(2).replace('.',',')} cada</div></div></div>`
                + `<div style="text-align:right;"><div style="font-size:0.9rem;font-weight:800;color:#10B981;">${extrasHitCount}x</div>`
                + `<div style="font-size:0.68rem;color:#10B981;opacity:0.85;">→ R$ ${extrasTotalPrize.toFixed(2).replace('.',',')}</div></div></div>`;
            } else if (drawnExtraIdx >= 0) {
                // Ninguém acertou — mostrar qual era o mês/time correto
                const extraName = this.currentGameKey === 'diadesorte'
                    ? L99_MESES[drawnExtraIdx]
                    : L99_TIMES[drawnExtraIdx];
                summaryHTML += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;margin-top:6px;">`
                + `<div style="display:flex;align-items:center;gap:8px;">`
                + `<span style="font-size:0.9rem;">${this.currentGameKey === 'timemania' ? '⚽' : '📅'}</span>`
                + `<div><div style="font-size:0.82rem;font-weight:400;color:#64748b;">${extrasLabel} Sorteado: ${extraName}</div>`
                + `<div style="font-size:0.66rem;color:#475569;">Nenhum jogo acertou o ${extrasLabel.toLowerCase()}</div></div></div>`
                + `<div style="text-align:right;"><div style="font-size:0.9rem;font-weight:800;color:#475569;">—</div></div></div>`;
            }
        }

        if (estimatedTotal > 0) {
            summaryHTML += `<div style="margin-top:12px;padding:12px 16px;background:linear-gradient(135deg,rgba(34,197,94,0.2),rgba(16,185,129,0.1));border:2px solid #22C55E80;border-radius:12px;display:flex;justify-content:space-between;align-items:center;">`;
            summaryHTML += `<span style="color:#86efac;font-weight:700;font-size:0.88rem;">💰 Prêmio Estimado Total</span>`;
            summaryHTML += `<span style="color:#22C55E;font-weight:900;font-size:1.1rem;">${currency(estimatedTotal)}</span>`;
            summaryHTML += `</div>`;
        }

        
// ── NÚMEROS SORTEADOS ──
        const sortedDrawn = [...drawnNumbers].sort((a, b) => a - b);
        summaryHTML += `<div style="margin-bottom:12px;padding:10px 14px;background:linear-gradient(145deg,rgba(0,0,0,0.4),rgba(0,0,0,0.2));border:1px solid ${game.color}50;border-radius:10px;">`;
        summaryHTML += `<div style="font-size:0.68rem;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Resultado Oficial</div>`;
        summaryHTML += `<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">`;
        sortedDrawn.forEach(n => {
            summaryHTML += `<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:${game.color};color:#fff;font-weight:800;font-size:0.88rem;box-shadow:0 2px 8px ${game.color}60;">${String(n).padStart(2,'0')}</span>`;
        });
        summaryHTML += `</div></div>`;

        
// ── V11: JOGOS GANHADORES — Agrupados do maior ao menor prêmio ──
        if (winningGames.length > 0) {
            // Ordenar do maior prêmio (mais acertos) para o menor
            winningGames.sort((a, b) => b.hits - a.hits || b.prize - a.prize);

            summaryHTML += `<div style="margin-bottom:12px;padding:12px 14px;background:linear-gradient(145deg,rgba(34,197,94,0.06),rgba(0,0,0,0.2));border:2px solid #22C55E40;border-radius:12px;">`;
            summaryHTML += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">`;
            summaryHTML += `<span style="font-size:1.2rem;">🏆</span>`;
            summaryHTML += `<div style="font-size:0.78rem;color:#22C55E;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Jogos Ganhadores (${winningGames.length})</div>`;
            summaryHTML += `</div>`;

            let currentTier = null;
            winningGames.forEach(wg => {
                // Separador por faixa de prêmio
                if (currentTier !== wg.strat.id) {
                    currentTier = wg.strat.id;
                    const isJP = wg.strat.match === game.draw;
                    const tierColor = isJP ? '#FFD700' : '#22C55E';
                    summaryHTML += `<div style="display:flex;align-items:center;gap:6px;margin:${currentTier === winningGames[0].strat.id ? '0' : '8px'} 0 6px 0;">`;
                    summaryHTML += `<span style="font-size:0.7rem;">${isJP ? '🥇' : '✅'}</span>`;
                    summaryHTML += `<span style="font-size:0.72rem;font-weight:700;color:${tierColor};">${wg.strat.label}</span>`;
                    summaryHTML += `<div style="flex:1;height:1px;background:${tierColor}30;"></div>`;
                    const tierPrize = wg.prize > 100 ? ` ≈ ${currency(wg.prize)}` : (wg.prize > 0 ? ` ≈ R$ ${wg.prize.toFixed(2).replace('.',',')}` : '');
                    summaryHTML += `<span style="font-size:0.62rem;color:${tierColor};opacity:0.8;">${tierPrize}/jogo</span>`;
                    summaryHTML += `</div>`;
                }

                // Card do jogo ganhador
                const isJP = wg.strat.match === game.draw;
                const cardBorder = isJP ? '#FFD70050' : '#22C55E40';
                const cardBg = isJP ? 'rgba(255,215,0,0.06)' : 'rgba(34,197,94,0.04)';
                summaryHTML += `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:4px;background:${cardBg};border:1px solid ${cardBorder};border-radius:8px;flex-wrap:wrap;">`;
                summaryHTML += `<span style="font-size:0.68rem;color:#94A3B8;font-weight:600;min-width:42px;">Jogo ${wg.index + 1}</span>`;
                
                // ★ v10.9 FIX: Badge de Time/Mês — SÓ mostrar ✓ se realmente acertou
                if (this.currentGeneratedExtras && this.currentGeneratedExtras[wg.index] !== undefined && drawResult) {
                    const genExtraIdx = this.currentGeneratedExtras[wg.index];
                    let drawnExtraIdx2 = -1;
                    if (this.currentGameKey === 'diadesorte' && drawResult.mesSorte) {
                        drawnExtraIdx2 = L99_MESES.findIndex(m => m.toLowerCase() === drawResult.mesSorte.toLowerCase());
                    } else if (this.currentGameKey === 'timemania' && drawResult.timeCoracao) {
                        drawnExtraIdx2 = L99_TIMES.findIndex(t => t.toLowerCase() === drawResult.timeCoracao.toLowerCase());
                    }
                    if (drawnExtraIdx2 >= 0 && genExtraIdx === drawnExtraIdx2) {
                        const extraLabel = this.currentGameKey === 'timemania' ? '⚽ Time ✓' : '📅 Mês ✓';
                        summaryHTML += `<span style="font-size:0.62rem;color:#10B981;background:rgba(16,185,129,0.15);padding:1px 5px;border-radius:4px;font-weight:600;">${extraLabel}</span>`;
                    }
                }
                
                summaryHTML += `<div style="display:flex;flex-wrap:wrap;gap:3px;flex:1;">`;
                wg.numbers.forEach(n => {
                    const isHit = drawnSet.has(n);
                    const bg = isHit ? '#22C55E' : 'rgba(255,255,255,0.06)';
                    const col = isHit ? '#fff' : '#64748b';
                    const shadow = isHit ? 'box-shadow:0 0 6px rgba(34,197,94,0.4);' : '';
                    summaryHTML += `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${bg};color:${col};font-weight:700;font-size:0.7rem;border:1px solid ${isHit ? '#22C55E' : 'rgba(255,255,255,0.1)'};${shadow}">${String(n).padStart(2,'0')}</span>`;
                });
                summaryHTML += `</div>`;
                
                // ★ v9.5: Mostrar acertos e valor estimado do prêmio por jogo
                const prizePerGame = wg.prize || 0;
                summaryHTML += `<div style="text-align:right;min-width:60px;">`;
                summaryHTML += `<div style="font-size:0.68rem;font-weight:700;color:${isJP ? '#FFD700' : '#22C55E'};">${wg.hits}/${game.draw}</div>`;
                if (prizePerGame > 0) {
                    const prizeDisplay = prizePerGame >= 100 
                        ? prizePerGame.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'R$ ' + prizePerGame.toFixed(2).replace('.', ',');
                    summaryHTML += `<div style="font-size:0.58rem;color:${isJP ? '#FFD70090' : '#22C55E90'};">≈ ${prizeDisplay}</div>`;
                }
                summaryHTML += `</div>`;
                summaryHTML += `</div>`;
            });
            summaryHTML += `</div>`;
        }

        
// ── DISCLAIMER ──
        summaryHTML += `<div style="margin-top:10px;padding:8px 12px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);border-radius:8px;font-size:0.65rem;color:#EAB308;">`;
        summaryHTML += `⚠️ <strong>Importante:</strong> Os valores de prêmios exibidos são estimativas médias baseadas nos sorteios recentes da Caixa. `;
        summaryHTML += `O prêmio real depende do rateio oficial (número de ganhadores em cada faixa). `;
        summaryHTML += `Confira sempre o resultado oficial em <strong>loterias.caixa.gov.br</strong>`;
        summaryHTML += `</div>`;

        summaryHTML += `</div>`;

        if (this.checkSummaryContainer) {
            this.checkSummaryContainer.innerHTML = summaryHTML;
            this.checkSummaryContainer.style.display = 'block';
            this.checkSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // ═══════════════════════════════════════════════════════
        // AUTO-SALVAR ESTATÍSTICAS (StatisticsTracker)
        // ═══════════════════════════════════════════════════════
        try {
            if (typeof StatisticsTracker !== 'undefined') {
                // Detectar drawSize real dos jogos gerados
                const actualDrawSize = (this.currentGeneratedGames && this.currentGeneratedGames[0])
                    ? this.currentGeneratedGames[0].length
                    : (this._lastDrawSize || game.minBet);
                const pricePerGame = game.price || 3.00;

                // Calcular fator de combinação para jogos com mais números
                let priceFactor = 1;
                if (actualDrawSize > game.minBet) {
                    const _comb = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= (n - i) / (i + 1); return r; };
                    priceFactor = _comb(actualDrawSize, game.minBet);
                }
                const valorInvestido = totalJogos * pricePerGame * priceFactor;

                // Construir faixas detalhadas com prêmios reais
                const faixasDetail = {};
                let fIdx = 0;
                paidStrategies.forEach(s => {
                    fIdx++;
                    const real = realPrizes[fIdx];
                    faixasDetail[s.id] = {
                        label: s.label,
                        match: s.match,
                        count: awardCounts[s.id] || 0,
                        prizeUnit: real ? real.valor : (s.prize || 0)
                    };
                });

                // Extrair número do concurso do drawInfo
                let concursoNum = 0;
                const concursoMatch = drawInfo.match(/(\d+)/);
                if (concursoMatch) concursoNum = parseInt(concursoMatch[1]);

                // Precisão: ler rastreamento + fallback do checkbox (para QUALQUER modo)
                let isPrecisao = this._lastPrecisionMode === true;
                if (!isPrecisao) {
                    const pc = document.getElementById('precision-mode-toggle');
                    if (pc && pc.checked) {
                        isPrecisao = true;
                    }
                }

                // ★ v10.9 FIX: Coletar times/meses dos jogos que REALMENTE acertaram
                let extrasGanhadores = [];
                if ((this.currentGameKey === 'timemania' || this.currentGameKey === 'diadesorte') && this.currentGeneratedExtras && drawResult) {
                    let drawnExtraIdx = -1;
                    if (this.currentGameKey === 'diadesorte' && drawResult.mesSorte) {
                        drawnExtraIdx = L99_MESES.findIndex(m => m.toLowerCase() === drawResult.mesSorte.toLowerCase());
                    } else if (this.currentGameKey === 'timemania' && drawResult.timeCoracao) {
                        drawnExtraIdx = L99_TIMES.findIndex(t => t.toLowerCase() === drawResult.timeCoracao.toLowerCase());
                    }

                    if (drawnExtraIdx >= 0) {
                        winningGames.forEach(wg => {
                            const extraIdx = this.currentGeneratedExtras[wg.index];
                            if (extraIdx === drawnExtraIdx) {
                                const premioExtra = this.currentGameKey === 'timemania' ? 7.50 : 3.00;
                                extrasGanhadores.push({ jogo: wg.index + 1, extra: extraIdx, acertos: wg.hits, premio: wg.prize, premioExtra: premioExtra });
                            }
                        });
                    }
                }

                // Somar prêmio dos extras que REALMENTE acertaram ao total
                if (extrasGanhadores.length > 0) {
                    const extrasPrizeTotal = extrasGanhadores.reduce((sum, eg) => sum + (eg.premioExtra || 0), 0);
                    estimatedTotal += extrasPrizeTotal;
                }

                const record = {
                    lotteryKey: this.currentGameKey,
                    lotteryName: game.name,
                    concurso: concursoNum,
                    drawInfo: drawInfo,
                    data: new Date().toISOString(),
                    qtdJogos: totalJogos,
                    modoGeracao: localStorage.getItem('l99_lastMode') || document.body.getAttribute('data-l99-mode') || this._lastGenerationMode || 'manual',
                    internalEngine: this._lastInternalEngine || 'Desconhecido',
                    precisao: isPrecisao,
                    numPorJogo: actualDrawSize,
                    faixas: faixasDetail,
                    volantesPremiados: totalGanhos,
                    valorPremio: estimatedTotal,
                    valorInvestido: valorInvestido,
                    drawnNumbers: [...drawnNumbers],
                    extrasGanhadores: extrasGanhadores.length > 0 ? extrasGanhadores : undefined
                };
                record.pctRetorno = valorInvestido > 0 ? ((estimatedTotal - valorInvestido) / valorInvestido * 100) : 0;

                console.log('%c[L99-STATS] SALVANDO RECORD', 'color: #22C55E; font-weight: bold;', {
                    modo: record.modoGeracao,
                    concurso: record.concurso,
                    jogos: record.qtdJogos,
                    this_mode: this._lastGenerationMode,
                    dom_mode: document.body.getAttribute('data-l99-mode'),
                    ls_mode: localStorage.getItem('l99_lastMode')
                });
                StatisticsTracker.save(record);
                // ALERTA VISUAL de confirmação
                var modoSalvo = record.modoGeracao;
                var toast = document.createElement('div');
                toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#22C55E;color:#fff;padding:12px 20px;border-radius:12px;z-index:999999;font-size:14px;font-weight:bold;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
                toast.textContent = '📊 Estatística salva! Modo: ' + modoSalvo + ' | Jogos: ' + record.qtdJogos;
                document.body.appendChild(toast);
                setTimeout(function() { toast.remove(); }, 5000);
                console.log('%c[L99-STATS] RECORD SALVO COM SUCESSO', 'color: #22C55E; font-weight: bold;');

                var self = this;
                // ── SALVAR CONFERÊNCIA NA PASTA (async para não travar) ──
                setTimeout(function() { try {
                    var reportText = '════════════════════════════════════════════\n';
                    reportText += '  📊 CONFERÊNCIA L99 — ' + game.name + '\n';
                    reportText += '  Concurso ' + concursoNum + '\n';
                    reportText += '  Data: ' + new Date().toLocaleString('pt-BR') + '\n';
                    reportText += '════════════════════════════════════════════\n\n';
                    reportText += '📊 RESUMO\n';
                    reportText += '  Jogos Conferidos: ' + totalJogos + '\n';
                    reportText += '  Modo: ' + (localStorage.getItem('l99_lastMode') || document.body.getAttribute('data-l99-mode') || self._lastGenerationMode || 'manual') + '\n';
                    reportText += '  Nº por Jogo: ' + actualDrawSize + '\n\n';
                    reportText += '🔢 NÚMEROS SORTEADOS: ' + drawnNumbers.join(' - ') + '\n\n';
                    reportText += '🏅 FAIXAS DE PREMIAÇÃO\n';
                    paidStrategies.forEach(function(s) {
                        var count = awardCounts[s.id] || 0;
                        reportText += '  ' + s.label + ': ' + count + ' volante(s)\n';
                    });
                    reportText += '\n  Total Premiados: ' + totalGanhos + ' volante(s)\n';
                    reportText += '  Valor Estimado: R$ ' + estimatedTotal.toLocaleString('pt-BR', {minimumFractionDigits:2}) + '\n\n';
                    if (winningGames.length > 0) {
                        reportText += '🏆 JOGOS GANHADORES\n';
                        winningGames.forEach(function(w) {
                            reportText += '  Jogo ' + (w.index + 1) + ': ' + w.numbers.join(' - ') + ' → ' + w.hits + ' acertos (' + w.strat.label + ')\n';
                        });
                    }
                    var maxListJogos = Math.min(self.currentGeneratedGames.length, 200);
                    reportText += '\n📋 JOGOS CONFERIDOS (' + maxListJogos + ' de ' + self.currentGeneratedGames.length + ')\n';
                    var drawnS2 = new Set(drawnNumbers);
                    var minPrize = paidStrategies.length > 0 ? paidStrategies[paidStrategies.length-1].match : 3;
                    self.currentGeneratedGames.slice(0, maxListJogos).forEach(function(nums, idx) {
                        var h2 = 0;
                        nums.forEach(function(n) { if (drawnS2.has(n)) h2++; });
                        var sinal = h2 >= minPrize ? '✅' : '  ';
                        reportText += sinal + ' Jogo ' + String(idx+1).padStart(4,' ') + ': ' + nums.map(function(n){return String(n).padStart(2,'0')}).join(' - ') + ' = ' + h2 + ' acertos\n';
                    });
                    reportText += '\n════════════════════════════════════════════\n';
                    reportText += '  L99 B2B Loterias — Relatório Automático\n';
                    reportText += '════════════════════════════════════════════\n';
                    fetch('/salvar-conferencia', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ gameKey: self.currentGameKey, concurso: concursoNum, content: reportText })
                    }).then(function(r) { return r.json(); }).then(function(result) {
                        if (result.ok) console.log('[L99] ✅ Conferência salva em: ' + result.fileName);
                    }).catch(function() {});
                    // Marcar arquivo original como conferido
                    if (self._lastLoadedFileName && !self._lastLoadedFileName.startsWith('✅')) {
                        fetch('/marcar-conferido', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ gameKey: self.currentGameKey, fileName: self._lastLoadedFileName })
                        }).catch(function() {});
                    }
                } catch(saveErr) {
                    console.warn('[L99] Erro ao salvar conferência:', saveErr);
                } }, 100); // setTimeout
            }
        } catch(statsErr) {
            console.warn('[Stats] Erro ao salvar estatística:', statsErr);
        }
    }
    exportBackup() {
        if (this.currentGeneratedGames.length === 0) {
            alert('Nenhum jogo gerado para fazer backup.\nGere seus jogos primeiro!');
            return;
        }

        const game = GAMES[this.currentGameKey];
        const gameName = game ? game.name : 'Loteria';
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR');
        const dateFile = now.toISOString().slice(0, 10).replace(/-/g, '');

        let content = '═══════════════════════════════════════\n';
        content += `  BACKUP - B2B LOTERIAS\n`;
        content += '═══════════════════════════════════════\n';
        content += `  Jogo: ${gameName}\n`;
        content += `  Data: ${dateStr} às ${timeStr}\n`;
        content += `  Total de Jogos: ${this.currentGeneratedGames.length}\n`;

        // Números fixos
        if (this.fixedNumbers.size > 0) {
            const fixedArr = Array.from(this.fixedNumbers).sort((a, b) => a - b);
            content += `  Números Fixos: ${fixedArr.map(n => n.toString().padStart(2, '0')).join(' ')}\n`;
        }

        content += '═══════════════════════════════════════\n\n';

        this.currentGeneratedGames.forEach((nums, i) => {
            const formatted = nums.map(n => n.toString().padStart(2, '0')).join('  ');
            content += `Jogo ${(i + 1).toString().padStart(3, '0')}:  ${formatted}\n`;
        });

        content += '\n═══════════════════════════════════════\n';
        content += '  Gerado por B2B Loterias - Boa Sorte!\n';
        content += '═══════════════════════════════════════\n';

        // Download como arquivo
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${gameName.replace(/\s+/g, '_')}_${dateFile}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Feedback visual no botão
        const h3 = this.btnBackup.querySelector('h3');
        if (h3) {
            const original = h3.textContent;
            h3.textContent = '✅ BACKUP SALVO!';
            h3.style.color = '#10B981';
            setTimeout(() => {
                h3.textContent = original;
                h3.style.color = '';
            }, 2500);
        }
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  PAINEL ESTATÍSTICAS — Conferência de Resultados & ROI     ║
    // ║  Rastreia performance de apostas para calibrar o motor      ║
    // ╚══════════════════════════════════════════════════════════════╝

    initStatisticsPanel() {
        const statsBtn = document.getElementById('btn-statistics');
        const overlay = document.getElementById('stats-modal-overlay');
        const closeBtn = document.getElementById('stats-modal-close');
        if (!statsBtn || !overlay) return;

        const _self = this;
        this._statsActiveLottery = null;

        // ── Abrir Modal ──
        statsBtn.addEventListener('click', () => {
            overlay.classList.add('active');
            this._buildStatsLotteryGrid();
        });

        // ── Fechar Modal ──
        if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });

        // ── Filtros ──
        ['stats-filter-modo', 'stats-filter-precisao', 'stats-filter-qtd', 'stats-filter-numjogo'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => _self._applyStatsFilters());
        });

        // ── Exportar CSV ──
        const exportBtn = document.getElementById('stats-export-csv');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                try {
                    const csv = StatisticsTracker.exportCSV(this._statsActiveLottery);
                    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const lName = this._statsActiveLottery || 'todas';
                    a.href = url;
                    a.download = `b2b_estatisticas_${lName}_${new Date().toISOString().slice(0,10)}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    exportBtn.textContent = '✅ Exportado!';
                    setTimeout(() => exportBtn.textContent = '📥 Exportar CSV', 2000);
                } catch(e) {
                    alert('Erro ao exportar: ' + e.message);
                }
            });
        }

        // ── Importar CSV ──
        const importBtn = document.getElementById('stats-import-csv');
        const importInput = document.getElementById('stats-import-input');
        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const count = StatisticsTracker.importCSV(ev.target.result);
                        alert(`✅ ${count} registros importados com sucesso!`);
                        this._buildStatsLotteryGrid();
                        if (this._statsActiveLottery) this.renderStatisticsTable(this._statsActiveLottery);
                    } catch(err) {
                        alert('Erro ao importar: ' + err.message);
                    }
                };
                reader.readAsText(file);
                importInput.value = '';
            });
        }

        // ── Limpar Dados ──
        const clearBtn = document.getElementById('stats-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const lName = this._statsActiveLottery
                    ? (GAMES[this._statsActiveLottery]?.name || this._statsActiveLottery)
                    : 'TODAS AS LOTERIAS';
                if (confirm(`⚠️ Tem certeza que deseja limpar TODOS os dados de estatísticas de ${lName}?\n\nEsta ação não pode ser desfeita.`)) {
                    StatisticsTracker.clear(this._statsActiveLottery);
                    this._buildStatsLotteryGrid();
                    if (this._statsActiveLottery) this.renderStatisticsTable(this._statsActiveLottery);
                }
            });
        }
    }

    // ── Construir Grid de Loterias ──
    _buildStatsLotteryGrid() {
        const grid = document.getElementById('stats-lottery-grid');
        if (!grid) return;

        const counts = typeof StatisticsTracker !== 'undefined' ? StatisticsTracker.getCounts() : {};
        const gameKeys = ['megasena', 'lotofacil', 'quina', 'duplasena', 'lotomania', 'timemania', 'diadesorte'];

        grid.innerHTML = '';
        gameKeys.forEach(key => {
            const game = GAMES[key];
            if (!game) return;
            const count = counts[key] || 0;
            const btn = document.createElement('button');
            btn.className = 'stats-lottery-btn' + (this._statsActiveLottery === key ? ' active' : '');
            btn.style.setProperty('--stats-lottery-color', game.color);
            btn.innerHTML = `
                <div class="stats-lot-dot" style="background:${game.color};"></div>
                <div class="stats-lot-name">${game.name}</div>
                <div class="stats-lot-count">${count} registro${count !== 1 ? 's' : ''}</div>
            `;
            btn.addEventListener('click', () => {
                this._statsActiveLottery = key;
                grid.querySelectorAll('.stats-lottery-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderStatisticsTable(key);
            });
            grid.appendChild(btn);
        });
    }

    // ── Aplicar Filtros ──
    _applyStatsFilters() {
        if (!this._statsActiveLottery) return;
        this.renderStatisticsTable(this._statsActiveLottery);
    }

    // ── Renderizar Tabela de Estatísticas ──
    renderStatisticsTable(lotteryKey) {
        const tableArea = document.getElementById('stats-table-area');
        const filterBar = document.getElementById('stats-filter-bar');
        const totalsBar = document.getElementById('stats-totals');
        const actionsBar = document.getElementById('stats-actions');
        if (!tableArea) return;

        const game = GAMES[lotteryKey];
        if (!game) return;

        // Mostrar controles
        if (filterBar) filterBar.style.display = 'flex';
        if (actionsBar) actionsBar.style.display = 'flex';

        // Ler filtros
        const filters = {
            modoGeracao: document.getElementById('stats-filter-modo')?.value || 'todos',
            precisao: document.getElementById('stats-filter-precisao')?.value || 'todos',
            qtdJogos: document.getElementById('stats-filter-qtd')?.value || 'todos',
            numPorJogo: document.getElementById('stats-filter-numjogo')?.value || 'todos'
        };

        // Ajustar filtro de precisão
        if (filters.precisao === 'sim') filters.precisao = true;
        else if (filters.precisao === 'nao') filters.precisao = false;
        else filters.precisao = 'todos';

        const records = StatisticsTracker.filter(lotteryKey, filters);

        // Popular filtros dinâmicos
        const allRecords = StatisticsTracker.getAll(lotteryKey);
        this._populateStatsFilter('stats-filter-qtd', 'Qtd Jogos', allRecords.map(r => r.qtdJogos), filters.qtdJogos);
        this._populateStatsFilter('stats-filter-numjogo', 'Nº/Jogo', allRecords.map(r => r.numPorJogo), filters.numPorJogo);

        // ── Sem dados ──
        if (records.length === 0) {
            tableArea.innerHTML = `
                <div class="stats-empty">
                    <div class="stats-empty-icon">📭</div>
                    <div class="stats-empty-title">Nenhum registro encontrado</div>
                    <div class="stats-empty-desc">
                        ${allRecords.length > 0
                            ? 'Nenhum resultado corresponde aos filtros selecionados. Tente alterar os filtros.'
                            : `Ainda não há conferências registradas para <strong>${game.name}</strong>.<br>Gere jogos, depois use o botão <strong>"Conferir"</strong> para verificar os resultados.`}
                    </div>
                </div>`;
            if (totalsBar) { totalsBar.style.display = 'none'; totalsBar.innerHTML = ''; }
            return;
        }

        // ── Aggregates ──
        const agg = StatisticsTracker.aggregate(records);
        if (totalsBar) {
            totalsBar.style.display = 'grid';
            const currency = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
            const retClass = agg.pctRetornoMedio >= 0 ? 'positive' : 'negative';
            totalsBar.innerHTML = `
                <div class="stats-total-card"><div class="stats-total-label">Conferências</div><div class="stats-total-value">${agg.total}</div></div>
                <div class="stats-total-card"><div class="stats-total-label">Total Jogos</div><div class="stats-total-value">${agg.totalJogos}</div></div>
                <div class="stats-total-card"><div class="stats-total-label">Investido</div><div class="stats-total-value">${currency(agg.totalInvestido)}</div></div>
                <div class="stats-total-card"><div class="stats-total-label">Premiado</div><div class="stats-total-value stats-cell-prize">${currency(agg.totalPremio)}</div></div>
                <div class="stats-total-card"><div class="stats-total-label">Volantes Premiados</div><div class="stats-total-value">${agg.totalVolantesPremiados}</div></div>
                <div class="stats-total-card"><div class="stats-total-label">Retorno Médio</div><div class="stats-total-value ${retClass}">${agg.pctRetornoMedio >= 0 ? '+' : ''}${agg.pctRetornoMedio.toFixed(1)}%</div></div>
            `;
        }

        // ── Tabela ──
        const paidStrats = game.strategies.filter(s => s.paid !== false);
        const currency = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

        // ── Adicionar Banner de Premiação (Timemania / Dia de Sorte) ──
        let prizeBannerHtml = '';
        if (lotteryKey === 'timemania' || lotteryKey === 'diadesorte') {
            const prizeInfo = typeof StatsService !== 'undefined' ? StatsService.getPrizeInfo(lotteryKey) : null;
            if (prizeInfo && prizeInfo.estimatedPrize) {
                const prizeFormatted = prizeInfo.estimatedPrize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                prizeBannerHtml = `
                    <div style="margin-bottom:15px;padding:12px 16px;background:linear-gradient(145deg,rgba(16,185,129,0.1),rgba(15,23,42,0.9));border:1px solid #10B98150;border-radius:8px;display:flex;align-items:center;gap:12px;">
                        <div style="font-size:2rem;">💰</div>
                        <div>
                            <div style="color:#10B981;font-weight:700;font-size:1.1rem;">Premiação Estimada ${game.name}</div>
                            <div style="color:#E2E8F0;font-size:0.9rem;">Próximo Concurso: <span style="font-weight:800;color:#FFD700;">${prizeFormatted}</span></div>
                        </div>
                    </div>
                `;
            }
        }

        const isTimemania = lotteryKey === 'timemania';
        const isDiaDeSorte = lotteryKey === 'diadesorte';
        const hasExtrasCol = isTimemania || isDiaDeSorte;
        const extrasColLabel = isTimemania ? 'Time' : 'Mês';

        let html = prizeBannerHtml + '<div class="stats-table-wrapper"><table class="stats-table"><thead><tr>';
        html += '<th>Data</th>';
        html += '<th>Concurso</th>';
        html += '<th>Jogos</th>';
        html += '<th>Modo</th>';
        html += '<th>Precisão</th>';
        html += '<th>Nº/Jogo</th>';

        paidStrats.forEach(s => {
            html += `<th>${s.label.replace(/\(.+?\)/, '').trim()}</th>`;
        });

        html += '<th>Premiados</th>';
        // ★ v9.5: Coluna Time/Mês para Timemania e Dia de Sorte
        if (hasExtrasCol) html += `<th>${extrasColLabel}</th>`;
        html += '<th>Valor Prêmio</th>';
        html += '<th>Investido</th>';
        html += '<th>% Retorno</th>';
        html += '<th></th>';
        html += '</tr></thead><tbody>';

        records.forEach(r => {
            const data = r.data ? new Date(r.data).toLocaleDateString('pt-BR') : '—';

            // Badge de modo
            const modoBadgeClass = {
                'manual': 'manual',
                'estatistica': 'quantum',
                'manual_sniper': 'manual',
                'cobertura': 'gerar',
                'cobertura_sniper': 'gerar',
                'precision': 'quantum',
                'precision_sniper': 'quantum',
                'quantum_l99': 'quantum',
                'precision_l99': 'quantum',
                'gerar_jogos': 'manual',
                'dual_2g': 'dual',
                'fechamento': 'fech'
            }[r.modoGeracao] || 'manual';
            const modoLabel = StatisticsTracker.getModoLabel(r.modoGeracao);

            // Badge de precisão
            const precBadge = r.precisao
                ? '<span class="stats-badge sim">Sim</span>'
                : '<span class="stats-badge nao">Não</span>';

            // Retorno
            const retorno = r.pctRetorno || 0;
            const retClass = retorno > 0 ? 'stats-cell-positive' : (retorno < 0 ? 'stats-cell-negative' : 'stats-cell-neutral');
            const retStr = (retorno >= 0 ? '+' : '') + retorno.toFixed(1) + '%';

            // Valor prêmio
            const premioStr = r.valorPremio > 0 ? currency(r.valorPremio) : '—';
            const premioClass = r.valorPremio > 0 ? 'stats-cell-prize' : 'stats-cell-neutral';

            html += '<tr>';
            html += `<td>${data}</td>`;
            html += `<td>${r.concurso || '—'}</td>`;
            html += `<td>${r.qtdJogos || 0}</td>`;
            html += `<td><span class="stats-badge ${modoBadgeClass}">${modoLabel}</span></td>`;
            html += `<td>${precBadge}</td>`;
            html += `<td>${r.numPorJogo || '—'}</td>`;

            // Faixas de premiação
            paidStrats.forEach(s => {
                const faixa = r.faixas && r.faixas[s.id];
                const count = faixa ? faixa.count : 0;
                if (count > 0) {
                    html += `<td><strong style="color:#22C55E;">${count}x</strong></td>`;
                } else {
                    html += `<td style="color:#334155;">—</td>`;
                }
            });

            html += `<td>${r.volantesPremiados > 0 ? '<strong style="color:#22C55E;">' + r.volantesPremiados + '</strong>' : '0'}</td>`;

            // ★ v9.5: Coluna Time/Mês com badges dos ganhadores
            if (hasExtrasCol) {
                if (r.extrasGanhadores && r.extrasGanhadores.length > 0) {
                    const badgeColor = isTimemania ? '#10B981' : '#F59E0B';
                    const badgeBg = isTimemania ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)';
                    const icon = isTimemania ? '⚽' : '📅';
                    const extrasCount = r.extrasGanhadores.length;
                    const extrasTotal = r.extrasGanhadores.reduce((sum, eg) => sum + (eg.premioExtra || 0), 0);
                    const extrasTotalStr = extrasTotal > 0 ? `<div style="font-size:0.55rem;color:${badgeColor};margin-top:2px;">+R$ ${extrasTotal.toFixed(2).replace('.',',')}</div>` : '';
                    html += `<td style="text-align:center;"><strong style="color:${badgeColor};font-size:0.85rem;">${extrasCount}x</strong>${extrasTotalStr}</td>`;
                } else {
                    html += `<td style="color:#334155;">—</td>`;
                }
            }

            html += `<td class="${premioClass}">${premioStr}</td>`;
            html += `<td>${currency(r.valorInvestido || 0)}</td>`;
            html += `<td class="${retClass}">${retStr}</td>`;
            html += `<td><button class="stats-delete-btn" data-id="${r.id}" data-lottery="${lotteryKey}" title="Excluir registro">🗑️</button></td>`;
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        tableArea.innerHTML = html;

        // ── Delete handlers ──
        tableArea.querySelectorAll('.stats-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const lk = btn.dataset.lottery;
                if (confirm('Excluir este registro?')) {
                    StatisticsTracker.remove(lk, id);
                    this._buildStatsLotteryGrid();
                    this.renderStatisticsTable(lk);
                }
            });
        });
    }

    // ── Popular filtro dinâmico ──
    _populateStatsFilter(selectId, label, values, currentValue) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        const unique = [...new Set(values.filter(v => v != null))].sort((a, b) => a - b);
        const oldVal = currentValue || sel.value;
        sel.innerHTML = `<option value="todos">${label}: Todos</option>`;
        unique.forEach(v => {
            sel.innerHTML += `<option value="${v}" ${String(v) === String(oldVal) ? 'selected' : ''}>${v}</option>`;
        });
    }

    // ─── Métodos auxiliares para fechamento manual ─────────────────────────
    // Calcula C(n, k) — número de combinações possíveis
    _manualComb(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        k = Math.min(k, n - k);
        let result = 1;
        for (let i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return Math.round(result);
    }

    // Gera todas as combinações C(pool, drawSize) com suporte a fixos
    _manualGenCombos(pool, drawSize, start, current, result, fixedArr) {
        if (result.length >= 5000) return; // Limite de segurança
        if (current.length === drawSize) {
            // Verificar que todos os fixos estão incluídos
            const s = new Set(current);
            const fixedOk = !fixedArr || fixedArr.every(f => s.has(f));
            if (fixedOk) result.push(current.slice().sort((a, b) => a - b));
            return;
        }
        const remaining = drawSize - current.length;
        const available = pool.length - start;
        if (available < remaining) return; // Poda: não há números suficientes
        for (let i = start; i < pool.length; i++) {
            current.push(pool[i]);
            this._manualGenCombos(pool, drawSize, i + 1, current, result, fixedArr);
            current.pop();
        }
    }
}

// Export removed for global script compatibility
/* Cache bust: 20260511171042 */









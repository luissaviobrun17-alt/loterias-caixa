class UI {
    constructor() {
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.currentGameTitle = document.getElementById('current-game-title');
        this.closingSelect = document.getElementById('closing-type');
        this.gamesQuantityInput = document.getElementById('games-quantity');
        this.generateBtn = document.getElementById('generate-btn');
        this.generateSmartBtn = document.getElementById('generate-smart-btn');
        this.smartDrawSizeSelect = document.getElementById('smart-draw-size');
        this.smartDrawInfo = document.getElementById('smart-draw-info');
        this.copyBtn = document.getElementById('copy-btn');
        this.gamesContainer = document.getElementById('games-container');
        this.currentBetCostElem = document.getElementById('current-bet-cost');

        // Action Buttons
        this.saveBtn = document.getElementById('save-btn');
        this.checkBtn = document.getElementById('check-btn');
        this.playCaixaBtn = document.getElementById('btn-play-caixa');

        // Modal Elements
        this.checkModal = document.getElementById('check-modal');
        this.closeCheckModalBtn = document.querySelector('.close-check-modal');
        this.inputCheckNumbers = document.getElementById('check-input-numbers');
        this.confirmCheckBtn = document.getElementById('confirm-check-btn');

        this.copyModal = document.getElementById('copy-modal');
        this.closeCopyModalBtns = document.querySelectorAll('.close-copy-modal');
        this.copyTextarea = document.getElementById('copy-textarea');

        this.currentGeneratedGames = []; // Store generated games

        this.hotNumbersContainer = document.getElementById('hot-numbers');
        this.coldNumbersContainer = document.getElementById('cold-numbers');
        this.gridContainer = document.getElementById('number-selection-grid');
        this.selectedCountElem = document.getElementById('selected-count');
        this.maxSelectionElem = document.getElementById('max-selection');
        this.timerElem = document.getElementById('timer');

        this.recentResultsContainer = document.getElementById('recent-results-list');
        this.loadGamesInput = document.getElementById('load-games-input');
        this.checkSummaryContainer = document.getElementById('check-summary');

        // Fixed Mode Elements
        this.btnFixedMode = document.getElementById('btn-fixed-mode');
        this.fixedInfoPanel = document.getElementById('fixed-info-panel');
        this.fixedNumbersList = document.getElementById('fixed-numbers-list');
        this.isFixedMode = false;
        this.fixedNumbers = new Set();

        // Stats Controls
        this.statsButtons = document.querySelectorAll('.stat-toggle');
        this.currentStatsRange = 10;

        // Investment Panel Elements
        this.costSelectedCount = document.getElementById('cost-selected-count');
        this.costTotalCombinations = document.getElementById('cost-total-combinations');
        this.costTotalValue = document.getElementById('cost-total-value');
        this.costUserGames = document.getElementById('cost-user-games');
        this.costUserGamesDetail = document.getElementById('cost-user-games-detail');
        this.closingEstimatesContainer = document.getElementById('closing-estimates');

        this.root = document.documentElement;

        this.selectedNumbers = new Set();
        this.currentGameKey = 'megasena';

        // ── Rastreamento de Modo de Geração (para Estatísticas) ──
        this._lastGenerationMode = 'manual';   // quantum_l99 | gerar_jogos | dual_2g | fechamento | manual
        this._lastPrecisionMode = false;
        this._lastDrawSize = 6;
        this._lastCheckDrawInfo = '';

        // Quantum/IA Elements
        this.quantumFormula = document.getElementById('quantum-formula');
        this.quantumCountInput = document.getElementById('quantum-count');
        this.btnQuantumCalculate = document.getElementById('btn-quantum-calculate');
        this.quantumResults = document.getElementById('quantum-results');
        this.btnUseQuantum = document.getElementById('btn-use-quantum');

        // Tutorial Elements
        this.btnTutorial = document.getElementById('btn-tutorial');
        this.tutorialModal = document.getElementById('tutorial-modal');
        this.closeTutorialModalBtns = document.querySelectorAll('.close-tutorial-modal');
        this.btnPrintTutorial = document.getElementById('print-tutorial');

        // Install Elements
        this.btnInstall = document.getElementById('btn-install');
        this.installModal = document.getElementById('install-modal');
        this.closeInstallModalBtns = document.querySelectorAll('.close-install-modal');
        this.btnCopyPath = document.getElementById('btn-copy-path');
        this.folderPathElem = document.getElementById('folder-path');

        // Backup Button
        this.btnBackup = document.getElementById('btn-backup');

        // Prize Display Elements
        this.prizeDisplay = document.getElementById('prize-display');
        this.prizeValue = document.getElementById('prize-value');
        this.prizeBadge = document.getElementById('prize-badge');
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
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
                window.print();
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
        const count = parseInt(this.quantumCountInput.value) || 6;
        const game = GAMES[this.currentGameKey];
        const constraints = QuantumGodEngine.getConstraints(this.currentGameKey);
        const totalNumbers = constraints ? constraints.totalNumbers : (game.range[1] - game.range[0] + 1);

        // Validação: mínimo é o minBet do jogo
        if (count < game.minBet) {
            alert(`Mínimo de ${game.minBet} números para ${game.name}.`);
            this.quantumCountInput.value = game.minBet;
            return;
        }

        // Validação: máximo é o total de números da loteria
        if (count > totalNumbers) {
            alert(`Limite excedido: ${game.name} possui apenas ${totalNumbers} números.`);
            return;
        }

        const statusDiv = this.quantumResults;
        statusDiv.innerHTML = '<div class="quantum-placeholder" style="opacity: 1; color: #8B5CF6; font-style: normal;">★ MODO DEUS — 12 Camadas de Predição Ativadas...</div>';

        // Phase 1: Analysis
        setTimeout(() => {
            statusDiv.innerHTML = '<div class="quantum-placeholder" style="opacity: 1; color: #6366f1; font-style: normal;">★ Bayesian + Markov + Posicional + Cadeias Sequenciais...</div>';

            // Phase 2: Processing
            setTimeout(() => {
                statusDiv.innerHTML = '<div class="quantum-placeholder" style="opacity: 1; color: #ec4899; font-style: normal;">★ Convergência Bayesiana + Monte Carlo → Próximo Sorteio...</div>';

                // Phase 3: Run Engine (with error handling)
                setTimeout(() => {
                    try {
                        let suggestion;
                        const history = StatsService.getRecentResults(this.currentGameKey, 100) || [];
                        if (typeof NovaEraEngine !== 'undefined') {
                            // NOVA ERA V1: Sugestão sintética e objetiva
                            console.log('[UI] Usando NovaEraEngine.suggestNumbers para ' + this.currentGameKey);
                            suggestion = NovaEraEngine.suggestNumbers(this.currentGameKey, count);
                            // Calcular confiança via backtest do QuantumGodEngine
                            if (suggestion && suggestion.length > 0 && history.length >= 3) {
                                try {
                                    const bt = QuantumGodEngine._backtestResult(suggestion, history, this.currentGameKey);
                                    QuantumGodEngine._lastConfidence = bt.confidence;
                                    QuantumGodEngine._lastBacktest = bt;
                                    console.log('[UI] Confiança calculada via backtest: ' + bt.confidence + '%');
                                } catch(btErr) {
                                    console.warn('[UI] Backtest falhou:', btErr.message);
                                    QuantumGodEngine._lastConfidence = 65;
                                }
                            }
                        } else {
                            // Fallback: motor legado
                            suggestion = QuantumGodEngine.runSimulation(this.currentGameKey, count, history);
                        }
                        console.log('[UI] Sugestão gerada: ' + (suggestion ? suggestion.length : 0) + ' números');
                        this.renderQuantumResults(suggestion);
                    } catch (err) {
                        console.error('[UI] ERRO no engine:', err);
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
            try { h = StatsService.getRecentResults(gameKey, maxCount) || []; } catch(e) {}
            // Fallback: usar REAL_HISTORY_DB diretamente se StatsService retornar vazio
            if (h.length < 3 && typeof REAL_HISTORY_DB !== 'undefined' && REAL_HISTORY_DB[gameKey]) {
                h = REAL_HISTORY_DB[gameKey].slice(0, maxCount);
                console.log('[UI] Fallback para REAL_HISTORY_DB:', h.length, 'registros');
            }
            return h;
        };

        // ── DIAGNÓSTICO: quais engines estão carregados ────────────────────────
        const enginesLoaded = [
            typeof AnalysisEngine !== 'undefined'       ? '🔬AE-V2'  : null,
            typeof DecisionEngine !== 'undefined'       ? '✅DE-V1'  : null,
            typeof UniversalGroupEngine !== 'undefined' ? '🎯UGE-V1' : null,
        ].filter(Boolean);
        if (enginesLoaded.length > 0) {
            const diagDiv = document.createElement('div');
            diagDiv.style.cssText = 'text-align:center;font-size:0.58rem;color:#475569;padding:3px 0 1px;letter-spacing:0.5px;';
            diagDiv.textContent = 'Motores: ' + enginesLoaded.join(' · ');
            this.quantumResults.appendChild(diagDiv);
        } else {
            const diagDiv = document.createElement('div');
            diagDiv.style.cssText = 'text-align:center;font-size:0.65rem;color:#EF4444;padding:4px;';
            diagDiv.textContent = '⚠️ Motores de análise não carregados — recarregue a página (Ctrl+Shift+R)';
            this.quantumResults.appendChild(diagDiv);
        }

        // ── ANÁLISE PROFUNDA DE EFICIÊNCIA ──────────────────────────────────
        try {
            if (typeof AnalysisEngine !== 'undefined' && numbers && numbers.length > 0) {
                const aeStatus = document.createElement('div');
                aeStatus.style.cssText = 'text-align:center;color:#8B5CF6;font-size:0.72rem;padding:6px;opacity:0.8;';
                aeStatus.textContent = '🔬 Analisando eficiência da seleção em 12 dimensões...';
                this.quantumResults.appendChild(aeStatus);

                setTimeout(() => {
                    try {
                        const history = _getHistory(this.currentGameKey, 100);
                        if (history.length < 3) {
                            aeStatus.textContent = '⚠️ AE-V2: histórico insuficiente (' + history.length + ' registros)';
                            return;
                        }
                        const analysis = AnalysisEngine.analyze(this.currentGameKey, numbers, history);
                        aeStatus.remove();
                        if (analysis) {
                            const aeContainer = document.createElement('div');
                            AnalysisEngine.renderPanel(analysis, aeContainer);
                            this.quantumResults.appendChild(aeContainer);
                        } else {
                            aeStatus.textContent = '⚠️ AE-V2: análise retornou null';
                        }
                    } catch (aeErr) {
                        aeStatus.style.color = '#EF4444';
                        aeStatus.textContent = '⚠️ AE-V2 erro: ' + aeErr.message;
                        console.warn('[AE] Erro:', aeErr);
                    }
                }, 200);
            }
        } catch(e) { console.warn('[AE] Erro ao iniciar análise:', e); }

        // ── PAINEL DE DECISÃO INTEGRADO ──────────────────────────────────────
        try {
            if (typeof DecisionEngine !== 'undefined' && numbers && numbers.length > 0) {
                setTimeout(() => {
                    try {
                        const history = _getHistory(this.currentGameKey, 200);
                        if (history.length < 3) return;
                        const decision = DecisionEngine.decide(this.currentGameKey, numbers, history);
                        if (decision) {
                            const deContainer = document.createElement('div');
                            DecisionEngine.renderDecisionPanel(decision, deContainer);
                            this.quantumResults.appendChild(deContainer);
                        }
                    } catch (deErr) {
                        const errDiv = document.createElement('div');
                        errDiv.style.cssText = 'color:#EF4444;font-size:0.65rem;padding:6px;text-align:center;';
                        errDiv.textContent = '⚠️ Decisão erro: ' + deErr.message;
                        this.quantumResults.appendChild(errDiv);
                        console.warn('[DE] Erro motor de decisão:', deErr);
                    }
                }, 600);
            }
        } catch(e) { console.warn('[DE] Erro ao iniciar decisão:', e); }
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
    // ║  POOL PRECISÃO — LIMITES DINÂMICOS POR LOTERIA           ║
    // ╚══════════════════════════════════════════════════════════╝
    _updatePrecisionPoolLimits() {
        const poolInput = document.getElementById('precision-pool-size');
        if (!poolInput) return;

        const game = GAMES[this.currentGameKey];
        if (!game) return;

        const drawSize = game.minBet;
        const totalRange = game.range[1] - game.range[0] + 1;
        const minPool = drawSize + 1; // Mínimo: drawSize + 1 (ex: Mega Sena = 7)
        const maxPool = totalRange; // Máximo: total de números da loteria (ex: Timemania = 80)
        const defaultPool = Math.min(totalRange, Math.max(20, drawSize + Math.ceil(drawSize * 0.45)));

        poolInput.min = minPool;
        poolInput.max = maxPool;
        // Só atualiza o valor se estiver fora dos limites
        const current = parseInt(poolInput.value) || defaultPool;
        if (current < minPool || current > maxPool) {
            poolInput.value = defaultPool;
        }
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

        // Verificar se Modo Precisão está ativo
        const precisionCheckbox = document.getElementById('precision-mode-toggle');
        const isPrecisionMode = precisionCheckbox && precisionCheckbox.checked;

        // ── RASTREAMENTO DE MODO ──
        this._lastGenerationMode = 'quantum_l99';
        this._lastPrecisionMode = isPrecisionMode;
        this._lastDrawSize = this.smartDrawSizeSelect ? parseInt(this.smartDrawSizeSelect.value) || game.minBet : game.minBet;

        const quantity = parseInt(this.gamesQuantityInput.value) || 10;
        let selectedArr = Array.from(this.selectedNumbers);
        const fixedArr = Array.from(this.fixedNumbers);

        // Ler quantidade de números por jogo IA
        const customDrawSize = this.smartDrawSizeSelect
            ? parseInt(this.smartDrawSizeSelect.value) || game.minBet
            : game.minBet;

        // AUTO-USAR números sugeridos pela fórmula IA (se nenhum selecionado no grid)
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
                    console.log(`[SmartBets] 🔮 Usando ${quantumNums.length} números da Telepatia Quântica`);
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

        // V9: Indicador de modo
        const modeLabel = selectedArr.length > 0
            ? `🎯 ${selectedArr.length} números selecionados → gerando variantes`
            : '🧠 Análise IA completa do universo';

        // Loading - QUANTUM L99 Premium
        this.gamesContainer.innerHTML = `
            <div style="text-align:center;padding:30px;background:linear-gradient(145deg,rgba(10,10,30,0.95),rgba(20,10,40,0.9));border-radius:16px;border:1px solid rgba(139,92,246,0.3);">
                <div style="font-size:2.5rem;margin-bottom:8px;filter:drop-shadow(0 0 15px rgba(255,215,0,0.5));">⚡</div>
                <div style="color:#FFD700;font-weight:900;font-size:1.1rem;text-transform:uppercase;letter-spacing:2px;text-shadow:0 0 10px rgba(255,215,0,0.4);">QUANTUM L99 — Motor de Predição</div>
                <div style="color:#94A3B8;font-size:0.8rem;margin-top:6px;margin-bottom:15px;">${modeLabel}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px auto;max-width:450px;">
                    <div id="q-phase-1" style="padding:10px 8px;border-radius:10px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);transition:all 0.5s;">
                        <div style="font-size:1.2rem;margin-bottom:4px;">⚛️</div>
                        <div style="color:#C4B5FD;font-size:0.7rem;font-weight:700;">COMPUTAÇÃO</div>
                        <div style="color:#8B5CF6;font-size:0.6rem;">QUÂNTICA</div>
                    </div>
                    <div id="q-phase-2" style="padding:10px 8px;border-radius:10px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);transition:all 0.5s;opacity:0.4;">
                        <div style="font-size:1.2rem;margin-bottom:4px;">🔮</div>
                        <div style="color:#6EE7B7;font-size:0.7rem;font-weight:700;">FUTUROLOGIA</div>
                        <div style="color:#10B981;font-size:0.6rem;">PREDITIVA</div>
                    </div>
                    <div id="q-phase-3" style="padding:10px 8px;border-radius:10px;background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.15);transition:all 0.5s;opacity:0.4;">
                        <div style="font-size:1.2rem;margin-bottom:4px;">🧿</div>
                        <div style="color:#F9A8D4;font-size:0.7rem;font-weight:700;">CLARIVIDÊNCIA</div>
                        <div style="color:#EC4899;font-size:0.6rem;">COMPUTACIONAL</div>
                    </div>
                </div>
                <div id="q-status" style="color:#C4B5FD;font-weight:600;font-size:0.82rem;margin-top:8px;">⚛️ Processando entrelaçamento quântico...</div>
                <div style="margin-top:12px;width:70%;height:4px;background:rgba(139,92,246,0.15);border-radius:4px;margin-left:auto;margin-right:auto;overflow:hidden;">
                    <div style="width:30%;height:100%;background:linear-gradient(90deg,#8B5CF6,#FFD700,#EC4899);border-radius:4px;animation:smartProgress 2s ease-in-out infinite;"></div>
                </div>
            </div>
            <style>@keyframes smartProgress{0%{width:10%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:10%;margin-left:90%}}</style>
        `;

        if (this.generateSmartBtn) {
            this.generateSmartBtn.disabled = true;
            this.generateSmartBtn.style.opacity = '0.6';
        }

        // Fase 2: Futurologia Preditiva
        setTimeout(() => {
            try {
                const p2 = document.getElementById('q-phase-2');
                const st = document.getElementById('q-status');
                if (p2) { p2.style.opacity = '1'; p2.style.background = 'rgba(16,185,129,0.2)'; p2.style.borderColor = 'rgba(16,185,129,0.5)'; }
                if (st) st.innerHTML = '🔮 Projeção futura: tendências temporais + Monte Carlo...';
            } catch(e) {}

            // Fase 3: Clarividência Computacional
            setTimeout(() => {
                try {
                    const p3 = document.getElementById('q-phase-3');
                    const st = document.getElementById('q-status');
                    if (p3) { p3.style.opacity = '1'; p3.style.background = 'rgba(236,72,153,0.2)'; p3.style.borderColor = 'rgba(236,72,153,0.5)'; }
                    if (st) st.innerHTML = '🧿 Clarividência: convergência de 19 camadas → Próximo Sorteio...';
                } catch(e) {}

                setTimeout(() => {
                    try {
                        let result;
                        if (isPrecisionMode && typeof SmartBetsEngine.generatePrecisionMode === 'function') {
                            // ── MODO PRECISÃO: Pool reduzido + geração sistemática ──
                            try {
                                // Ler tamanho do pool personalizado pelo apostador
                                const poolSizeInput = document.getElementById('precision-pool-size');
                                const customPool = poolSizeInput ? parseInt(poolSizeInput.value) || null : null;
                                result = SmartBetsEngine.generatePrecisionMode(
                                    this.currentGameKey,
                                    quantity,
                                    customPool
                                );
                                // Se o resultado veio sem métricas completas, recalcular via NovaEraEngine
                                if (result && result.analysis && (result.analysis.pairsCovered == null || result.analysis.pairsCovered === '-')) {
                                    if (typeof NovaEraEngine !== 'undefined' && result.games && result.games.length > 0) {
                                        try {
                                            const profile = NovaEraEngine.getProfile(this.currentGameKey);
                                            const history = (typeof REAL_HISTORY_DB !== 'undefined' ? REAL_HISTORY_DB[this.currentGameKey] : null) || StatsService.getHistory(this.currentGameKey);
                                            const neAnalysis = NovaEraEngine._backtestHonest(result.games, history, profile, this.currentGameKey, profile.range[1] - profile.range[0] + 1, result.games[0].length);
                                            // Mesclar análise do NovaEraEngine com a do Precisão
                                            result.analysis.confidence = Math.max(result.analysis.confidence, neAnalysis.confidence);
                                            result.analysis.pairsCovered = neAnalysis.pairsCovered;
                                            result.analysis.triosCovered = neAnalysis.triosCovered;
                                            result.analysis.backtestScore = neAnalysis.backtestScore;
                                            result.analysis.uniqueNumbers = neAnalysis.uniqueNumbers || result.analysis.uniqueNumbers;
                                            console.log('[Precisão] ✅ Métricas enriquecidas via NovaEraEngine');
                                        } catch(neErr) {
                                            console.warn('[Precisão] NovaEraEngine backtest falhou:', neErr.message);
                                        }
                                    }
                                }
                            } catch(precErr) {
                                console.error('[Precisão] Erro:', precErr.message);
                                // Fallback para modo padrão
                                result = SmartBetsEngine.generate(
                                    this.currentGameKey, quantity, selectedArr, fixedArr, customDrawSize
                                );
                            }
                        } else {
                            // ── MODO PADRÃO: Geração com diversidade V9 ──
                            // V9 BUG FIX: sempre passa selectedArr ao motor
                            // O motor decide como usar (pool completo ou preferencial)
                            result = SmartBetsEngine.generate(
                                this.currentGameKey,
                                quantity,
                                selectedArr, // V9: SEMPRE passar, motor gerencia o uso
                                fixedArr,
                                customDrawSize
                            );
                        }

                        if (!result || !result.games || result.games.length === 0) {
                            this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">❌ Não foi possível gerar jogos. Tente selecionar mais números.</div>';
                            return;
                        }

                        // ── LIMPEZA COMPLETA antes de renderizar (FIX: painéis do fechamento anterior) ──
                        const _parent = this.gamesContainer.parentNode;
                        if (_parent) {
                            _parent.querySelectorAll('.generation-feedback, .smart-analysis-panel, .smart-gen-analysis').forEach(el => el.remove());
                            const _oldCaixa = document.getElementById('caixa-panel');
                            if (_oldCaixa) _oldCaixa.remove();
                        }

                        // Renderizar jogos (mesmo visual do CombinationEngine)
                        this.renderGames(result, this.currentGameKey);
                        if (this.checkSummaryContainer) this.checkSummaryContainer.style.display = 'none';

                        // ── PAINEL DE ANÁLISE IA ──
                        const analysis = result.analysis;
                        if (analysis) {
                            const confColor = analysis.confidence >= 70 ? '#22C55E' : analysis.confidence >= 50 ? '#EAB308' : '#EF4444';
                            const confEmoji = analysis.confidence >= 70 ? '🟢' : analysis.confidence >= 50 ? '🟡' : '🔴';
                            const confLabel = analysis.confidence >= 70 ? 'ALTA' : analysis.confidence >= 50 ? 'MODERADA' : 'BAIXA';
                            const modeLabel = analysis.mode === 'PRECISÃO' ? '🎯 Modo Precisão' : '🧠 Smart Bets';

                            let analysisHTML = `
                                <div class="smart-analysis-panel" style="margin-top:10px;margin-bottom:10px;padding:12px 16px;border-radius:12px;background:linear-gradient(145deg,rgba(15,23,42,0.95),rgba(30,41,59,0.9));border:1px solid ${confColor}40;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                                        <span style="color:${confColor};font-weight:800;font-size:0.9rem;">${confEmoji} Confiança IA: ${analysis.confidence}% (${confLabel})</span>
                                        <span style="color:${analysis.mode === 'PRECISÃO' ? '#F59E0B' : '#8B5CF6'};font-weight:700;font-size:0.78rem;">${modeLabel}</span>
                                    </div>
                                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;font-size:0.75rem;">
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Cobertura</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.coverage}%</div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Diversidade</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.diversity}%</div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Duplas Top</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.pairsCovered != null ? analysis.pairsCovered + '%' : '-'}</div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Trios Top</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.triosCovered != null ? analysis.triosCovered + '%' : '-'}</div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Backtest</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.backtestScore != null ? analysis.backtestScore : '-'}%</div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Nº Únicos</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.uniqueNumbers != null ? analysis.uniqueNumbers : '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            `;

                            // ── PAINEL EXTRA MODO PRECISÃO ──
                            if (analysis.mode === 'PRECISÃO' && analysis.precisionPool) {
                                analysisHTML += `
                                <div class="smart-analysis-panel" style="margin-top:6px;margin-bottom:10px;padding:10px 14px;border-radius:10px;background:linear-gradient(145deg,rgba(245,158,11,0.08),rgba(15,23,42,0.95));border:1px solid #F59E0B30;">
                                    <div style="color:#F59E0B;font-weight:700;font-size:0.82rem;margin-bottom:6px;">🎯 Pool de Precisão: ${analysis.poolSize} números</div>
                                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
                                        ${analysis.precisionPool.map(n => '<span style="background:#F59E0B22;color:#F59E0B;padding:2px 7px;border-radius:12px;font-size:0.75rem;font-weight:700;">' + String(n).padStart(2,'0') + '</span>').join('')}
                                    </div>
                                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:0.72rem;">
                                        <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:4px;text-align:center;"><span style="color:#94A3B8;">14+ hits</span><br><span style="color:#22C55E;font-weight:700;">${analysis.backtestHits['14+']}/10</span></div>
                                        <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:4px;text-align:center;"><span style="color:#94A3B8;">13+ hits</span><br><span style="color:#EAB308;font-weight:700;">${analysis.backtestHits['13+']}/10</span></div>
                                        <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:4px;text-align:center;"><span style="color:#94A3B8;">Pool Match</span><br><span style="color:#E2E8F0;font-weight:700;">${analysis.avgPoolMatch}/15</span></div>
                                    </div>
                                </div>`;
                            }

                            const analysisDiv = document.createElement('div');
                            analysisDiv.innerHTML = analysisHTML;
                            this.gamesContainer.parentNode.insertBefore(analysisDiv.firstElementChild, this.gamesContainer);
                        }

                        // Feedback
                        const feedback = document.createElement('div');
                        feedback.className = 'generation-feedback';
                        feedback.style.cssText = 'text-align:center;padding:14px 16px;font-weight:800;margin-top:10px;margin-bottom:10px;background:linear-gradient(145deg,rgba(10,10,30,0.95),rgba(20,10,40,0.9));border:1px solid rgba(255,215,0,0.3);border-radius:12px;';
                        feedback.innerHTML = `<span style="color:#FFD700;font-size:1rem;">⚡ QUANTUM L99</span><br><span style="color:#C4B5FD;font-size:0.9rem;">${result.games.length} jogos gerados — Computação Quântica + Futurologia + Clarividência</span>`;
                        this.gamesContainer.parentNode.insertBefore(feedback, this.gamesContainer);

                        // ── APOSTAR NA CAIXA — PAINEL UNIVERSAL ──
                        this._insertCaixaPanel(result.games, this.currentGameKey);

                        // ── BACKTESTING AUTOMÁTICO V3 ──
                        try {
                            if (typeof BacktestingEngine !== 'undefined') {
                                const btMetrics = BacktestingEngine.run(this.currentGameKey, 'smart', 10, 8);
                                if (btMetrics) {
                                    const btHTML = BacktestingEngine.formatForUI(btMetrics);
                                    const btDiv = document.createElement('div');
                                    btDiv.className = 'smart-analysis-panel';
                                    btDiv.innerHTML = btHTML;
                                    this.gamesContainer.parentNode.insertBefore(btDiv, this.gamesContainer);
                                }
                            }
                        } catch(btErr) {
                            console.warn('[Backtest] Erro no backtesting:', btErr.message);
                        }

                        feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    } catch (err) {
                        console.error('[SmartBets] ERRO:', err);
                        this.gamesContainer.innerHTML = `<div class="empty-state" style="color:#EF4444;">❌ Erro: ${err.message}<br><small>Verifique o console (F12)</small></div>`;
                    } finally {
                        if (this.generateSmartBtn) {
                            this.generateSmartBtn.disabled = false;
                            this.generateSmartBtn.style.opacity = '1';
                        }
                    }
                }, 200);
            }, 500);
        }, 500);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  SISTEMA DE APOSTA ONLINE — CAIXA LOTERIAS                  ║
    // ║  Gera script de automação para preencher jogos no site      ║
    // ║  da Caixa Econômica Federal (Loterias Online)               ║
    // ╚══════════════════════════════════════════════════════════════╝
    // [REMOVIDO] _generateBookmarklet — obsoleto, usava alert('Pronto!') que conflitava com v5.0

    _generateCaixaScript_LEGACY(config, games) {
        const gamesJSON = JSON.stringify(games);
        const lName = config.name;
        const isTimemania = config.url === 'timemania';
        const isDiaDeSorte = config.url === 'dia-de-sorte';

        // ═══════════════════════════════════════════════════════════════
        // B2B v9.0 TURBO — Script de Automação COMPLETO
        // Suporta: Mega Sena, Lotofácil, Quina, Dupla Sena, Lotomania,
        //          Timemania (com Time do Coração), Dia de Sorte (com Mês)
        // ═══════════════════════════════════════════════════════════════
        let script = '(async function(){';
        script += 'var JOGOS=' + gamesJSON + ';';
        script += 'var TOTAL=JOGOS.length;var OK=0;var ERROS=0;var BLOCO=10;';
        script += 'var IS_TIMEMANIA=' + (isTimemania ? 'true' : 'false') + ';';
        script += 'var IS_DIADESORTE=' + (isDiaDeSorte ? 'true' : 'false') + ';';
        script += 'console.clear();';
        script += 'console.log("%c[B2B v9.0 TURBO] "+TOTAL+" jogos de ' + lName + '","color:#22C55E;font-size:14px;font-weight:bold");';
        script += 'if(IS_TIMEMANIA)console.log("%c⚽ Modo TIMEMANIA: Seleção automática de time ativada","color:#F59E0B;font-weight:bold");';
        script += 'if(IS_DIADESORTE)console.log("%c📅 Modo DIA DE SORTE: Seleção de mês ativada","color:#F59E0B;font-weight:bold");';
        script += 'console.log("%cProcessando em blocos de "+BLOCO+"...","color:#60A5FA");';
        script += 'var t0=Date.now();';
        script += 'var delay=function(ms){return new Promise(function(r){setTimeout(r,ms)})};';

        // ── realClick: simula clique real com todos os eventos + Angular ──
        script += 'function realClick(el){if(!el)return false;try{el.scrollIntoView({block:"center",behavior:"instant"});var r=el.getBoundingClientRect();var cx=r.left+r.width/2;var cy=r.top+r.height/2;var evts=["pointerdown","mousedown","pointerup","mouseup","click"];for(var i=0;i<evts.length;i++){el.dispatchEvent(new MouseEvent(evts[i],{view:window,bubbles:true,cancelable:true,clientX:cx,clientY:cy,button:0}))}try{var scope=angular.element(el).scope();if(scope&&scope.$apply)scope.$apply()}catch(ae){}return true}catch(e){try{el.click();return true}catch(e2){return false}}}';

        // ── fecharModais: fecha alertas/modais do site ──
        script += 'function fecharModais(){var ids=["fecharModalAlerta","fecharModalErro","fecharModalInfo","confirmarModalConfirmacao","botaosim","btnFecharModal","btnOk","btnConfirmar"];for(var k=0;k<ids.length;k++){var el=document.getElementById(ids[k]);if(el&&el.offsetParent!==null&&el.offsetWidth>0){try{realClick(el)}catch(e){}}}var bts=document.querySelectorAll("button,a");for(var j=0;j<bts.length;j++){var t=bts[j].textContent.trim().toLowerCase();if((t==="ok"||t==="entendi"||t==="fechar"||t==="confirmar"||t==="sim"||t==="continuar")&&bts[j].offsetParent!==null&&bts[j].offsetWidth>0){var isCart=bts[j].id&&(bts[j].id.toLowerCase().indexOf("carrinho")>=0||bts[j].id.toLowerCase().indexOf("pagamento")>=0);if(!isCart){try{realClick(bts[j])}catch(e){}}}}}';

        // ── clicarNumero: seleciona um número no volante ──
        script += 'function clicarNumero(num){var p=String(num).padStart(2,"0");var el=document.getElementById("n"+p);if(el)return realClick(el);el=document.querySelector("a#n"+p)||document.querySelector("#n"+p);if(el)return realClick(el);var todos=document.querySelectorAll("a[role=button],a.dezena,a.numero,a[id^=n]");for(var i=0;i<todos.length;i++){if(todos[i].textContent.trim()===p)return realClick(todos[i])}var allN=document.querySelectorAll(".number,.dezena,.num,[class*=number],[class*=dezena]");for(var k=0;k<allN.length;k++){var txt=allN[k].textContent.trim();if(txt===p||txt===String(num))return realClick(allN[k])}return false}';

        // ── limpar: limpa a seleção atual ──
        script += 'function limpar(){fecharModais();var btn=document.getElementById("limparvolante");if(btn)return realClick(btn);btn=document.querySelector("[id*=limpar]");if(btn)return realClick(btn);var bts=document.querySelectorAll("button");for(var k=0;k<bts.length;k++){if(bts[k].textContent.toLowerCase().indexOf("limpar")>=0)return realClick(bts[k])}return false}';

        // ═══════════════════════════════════════════════════════
        // ⚽ TIMEMANIA: Selecionar Time do Coração (OBRIGATÓRIO)
        // Site da Caixa usa AngularJS: li[ng-repeat="equipe in listaEquipe"]
        // e img[name="btnTime"] com classe .data-selecionar-time-do-coracao
        // ═══════════════════════════════════════════════════════
        script += 'async function selecionarTime(){if(!IS_TIMEMANIA)return true;';
        script += 'console.log("[B2B] ⚽ Selecionando Time do Coração...");';
        script += 'await delay(300);';
        // Seletores REAIS do site da Caixa (AngularJS)
        script += 'var times=document.querySelectorAll("img[name=btnTime],.data-selecionar-time-do-coracao,li[ng-repeat*=listaEquipe] img,li[ng-click*=Time] img,li[ng-click*=time] img");';
        // Fallback: procurar LIs com ng-repeat de equipes
        script += 'if(times.length===0){var tLis=document.querySelectorAll("li[ng-repeat*=listaEquipe],li[ng-repeat*=equipe]");if(tLis.length>0){var tImgs=[];for(var q=0;q<tLis.length;q++){var tImg=tLis[q].querySelector("img");if(tImg)tImgs.push(tImg)}if(tImgs.length>0)times=tImgs}}';
        // Fallback 2: UL com muitas imagens (>20 = lista de times)
        script += 'if(times.length===0){var allUls=document.querySelectorAll("ul");for(var u=0;u<allUls.length;u++){var uImgs=allUls[u].querySelectorAll("img");if(uImgs.length>20){times=uImgs;console.log("[B2B] ⚽ Encontrada lista de "+uImgs.length+" times");break}}}';
        // Clicar no time
        script += 'if(times.length>0){';
        script += 'var idx=Math.floor(Math.random()*times.length);';
        script += 'var chosen=times[idx];';
        // Garantir visibilidade e clique Angular
        script += 'chosen.scrollIntoView({block:"center",behavior:"instant"});';
        script += 'await delay(150);';
        script += 'realClick(chosen);';
        script += 'await delay(250);';
        // Também clica no LI pai para garantir trigger Angular
        script += 'if(chosen.parentElement&&chosen.parentElement.tagName==="LI"){realClick(chosen.parentElement);await delay(200)}';
        // Forçar digest cycle do AngularJS se disponível
        script += 'try{var scope=angular.element(chosen).scope();if(scope&&scope.$apply)scope.$apply()}catch(e){}';
        script += 'await delay(200);';
        script += 'var nome=chosen.alt||chosen.title||(chosen.parentElement?chosen.parentElement.textContent.trim().substring(0,30):"Time #"+(idx+1));';
        script += 'console.log("[B2B] ⚽ Time selecionado: "+nome);return true}';
        script += 'console.warn("[B2B] ⚠️ Nenhum time encontrado!");return false}';

        // ═══════════════════════════════════════════════════════
        // 📅 DIA DE SORTE: Selecionar Mês da Sorte (OBRIGATÓRIO)
        // Site da Caixa usa AngularJS: li[ng-repeat*="listaMeses"]
        // e ng-click="configurarMes(mes)" para cada mês
        // ═══════════════════════════════════════════════════════
        script += 'async function selecionarMes(){if(!IS_DIADESORTE)return true;';
        script += 'console.log("[B2B] 📅 Selecionando Mês da Sorte...");';
        script += 'await delay(300);';
        // Seletores REAIS do site da Caixa (AngularJS)
        script += 'var meses=document.querySelectorAll("li[ng-repeat*=listaMeses],li[ng-click*=configurarMes],[id=mes] li,ul.meses li,.meses-list li");';
        // Fallback: procurar meses por nome em português
        script += 'if(meses.length===0){var nomesMeses=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];var allLi=document.querySelectorAll("li,a,span,div");var found=[];for(var q=0;q<allLi.length;q++){var tx=allLi[q].textContent.trim().toLowerCase();for(var m=0;m<nomesMeses.length;m++){if(tx===nomesMeses[m]&&allLi[q].children.length<=1){found.push(allLi[q]);break}}}if(found.length>0)meses=found}';
        // Fallback 2: select/option
        script += 'if(meses.length===0){var sel=document.querySelector("select");if(sel&&sel.options.length>1){sel.selectedIndex=Math.floor(Math.random()*(sel.options.length-1))+1;sel.dispatchEvent(new Event("change",{bubbles:true}));console.log("[B2B] 📅 Mês (select): "+sel.options[sel.selectedIndex].text);return true}}';
        // Clicar no mês
        script += 'if(meses.length>0){';
        script += 'var idx=Math.floor(Math.random()*meses.length);';
        script += 'var mesEl=meses[idx];';
        script += 'realClick(mesEl);';
        script += 'await delay(400);';
        // Se clicou em um filho, também clica no LI pai
        script += 'if(mesEl.tagName!=="LI"&&mesEl.parentElement&&mesEl.parentElement.tagName==="LI"){realClick(mesEl.parentElement);await delay(200)}';
        // Forçar digest cycle do AngularJS
        script += 'try{var scope=angular.element(mesEl).scope();if(scope&&scope.$apply)scope.$apply()}catch(e){}';
        script += 'await delay(200);';
        // Verificar se o mês ficou selecionado
        script += 'var mesNome=mesEl.textContent.trim()||"Mês #"+(idx+1);';
        script += 'console.log("[B2B] 📅 Mês selecionado: "+mesNome);';
        script += 'return true}';
        script += 'console.warn("[B2B] ⚠️ Nenhum mês encontrado na página!");return false}';

        // ── carrinho: coloca no carrinho com retry ──
        script += 'async function carrinho(){fecharModais();await delay(100);';
        script += 'if(IS_TIMEMANIA){await selecionarTime();await delay(300)}';
        script += 'if(IS_DIADESORTE){await selecionarMes();await delay(300)}';
        script += 'for(var t=0;t<8;t++){var btn=document.getElementById("colocarnocarrinho");if(btn&&btn.offsetParent!==null){';
        script += 'if(btn.disabled||btn.classList.contains("disabled")){console.log("[B2B] ⏳ Carrinho desabilitado, aguardando...");await delay(800);';
        script += 'if(IS_TIMEMANIA){await selecionarTime();await delay(400)}';
        script += 'if(IS_DIADESORTE){await selecionarMes();await delay(400)}';
        script += 'continue}';
        script += 'realClick(btn);await delay(800);fecharModais();await delay(300);fecharModais();return true}';
        script += 'var allB=document.querySelectorAll("button,a");for(var k=0;k<allB.length;k++){var tx=allB[k].textContent.toLowerCase().trim();if((tx.indexOf("colocar no carrinho")>=0||(tx.indexOf("carrinho")>=0&&tx.indexOf("ir para")<0&&tx.indexOf("ver")<0))&&allB[k].offsetParent!==null&&allB[k].offsetWidth>0){realClick(allB[k]);await delay(800);fecharModais();await delay(300);fecharModais();return true}}';
        script += 'fecharModais();await delay(400)}return false}';

        // ── LOOP PRINCIPAL: processar todos os jogos ──
        script += 'fecharModais();await delay(400);';
        script += 'for(var i=0;i<TOTAL;i++){';
        script += 'var jogo=JOGOS[i];var blocoN=Math.floor(i/BLOCO)+1;var blocoT=Math.ceil(TOTAL/BLOCO);';
        script += 'if(i%BLOCO===0)console.log("%c=== BLOCO "+blocoN+"/"+blocoT+" ===","color:#F59E0B;font-weight:bold;font-size:12px");';
        script += 'console.log("[B2B] "+(i+1)+"/"+TOTAL+" ["+jogo.join(",")+"]");';
        script += 'fecharModais();';
        script += 'if(i>0){limpar();await delay(500);fecharModais();await delay(200)}';
        script += 'var ac=0;for(var n=0;n<jogo.length;n++){if(clicarNumero(jogo[n])){ac++}else{await delay(150);if(clicarNumero(jogo[n]))ac++}await delay(120)}';
        script += 'if(ac<jogo.length)console.warn("[B2B] Jogo "+(i+1)+": "+ac+"/"+jogo.length+" nums");';
        script += 'try{var rs=angular.element(document.body).scope();if(rs&&rs.$apply)rs.$apply()}catch(ae){}await delay(400);fecharModais();await delay(200);';
        script += 'var ok=await carrinho();';
        script += 'if(ok){OK++;console.log("[B2B] ✅ "+(i+1)+" ("+OK+"/"+TOTAL+")")}else{ERROS++;console.error("[B2B] ❌ "+(i+1)+"'+(isTimemania ? ' — Verifique se o Time do Coração foi selecionado' : '')+'")}';
        script += 'if(i<TOTAL-1){await delay(600);fecharModais()}';
        script += 'if((i+1)%BLOCO===0){var el=((Date.now()-t0)/1000).toFixed(0);var sp=((i+1)/el*60).toFixed(0);console.log("%c[B2B] Bloco "+blocoN+" OK! "+OK+"/"+TOTAL+" | "+el+"s | ~"+sp+" jogos/min","color:#22C55E;font-weight:bold");if(i+1<TOTAL){console.log("[B2B] Proximo bloco em 1s...");await delay(1000)}}';
        script += '}';

        // ── RESULTADO FINAL ──
        script += 'var tt=((Date.now()-t0)/1000).toFixed(1);';
        script += 'console.log("%c[B2B v9.0] ✅ PRONTO! "+OK+"/"+TOTAL+" de ' + lName + ' em "+tt+"s","color:#22C55E;font-size:16px;font-weight:bold");';
        script += 'console.log("%c[B2B] 💳 Clique no carrinho (🛒) no topo da pagina para finalizar.","color:#F59E0B;font-size:13px");';
        script += 'alert("[B2B v9.0 TURBO] ✅ "+OK+"/"+TOTAL+" jogos de ' + lName + ' em "+tt+"s!"+(ERROS>0?"\\n"+ERROS+" erro(s).":"")+"\\n\\n💳 PRÓXIMO PASSO:\\nClique no ícone do carrinho (🛒) no topo da página\\ne finalize o pagamento.")';
        script += '})()';

        return script;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  PAINEL APOSTE ONLINE — UNIVERSAL (TODAS AS LOTERIAS)       ║
    // ║  Insere botão de aposta automática após qualquer geração    ║
    // ╚══════════════════════════════════════════════════════════════╝
    _getCaixaLotteryConfig() {
        return {
            megasena:   { name: 'Mega-Sena',   url: 'mega-sena' },
            lotofacil:  { name: 'Lotofácil',    url: 'lotofacil' },
            quina:      { name: 'Quina',        url: 'quina' },
            lotomania:  { name: 'Lotomania',    url: 'lotomania' },
            duplasena:  { name: 'Dupla Sena',   url: 'dupla-sena' },
            timemania:  { name: 'Timemania',    url: 'timemania' },
            diadesorte: { name: 'Dia de Sorte', url: 'dia-de-sorte' }
        };
    }

    // ── Detectar se é mobile ──
    _isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || (window.innerWidth <= 768)
            || ('ontouchstart' in window);
    }

    // ══════════════════════════════════════════════════════════════════
    // ║  MODAL MOBILE v2.0 — COM AUTOMAÇÃO VIA BOOKMARKLET            ║
    // ║  Resolve o problema de não ter F12 no celular                  ║
    // ║  Duas abas: ⚡ Automático (bookmarklet) e 📋 Manual (copiar)  ║
    // ══════════════════════════════════════════════════════════════════

    // ── Gerar o bookmarklet de automação (minificado, cabe num bookmark) ──
    _generateMobileBookmarklet(games, config) {
        const gamesJSON = JSON.stringify(games);
        const isTimemania = config.url === 'timemania';
        const isDiaDeSorte = config.url === 'dia-de-sorte';
        // Minified automation script embedded in bookmarklet
        const script = `javascript:void((async function(){var J=${gamesJSON};var T=J.length;var OK=0;var ER=0;var TM=${isTimemania};var DS=${isDiaDeSorte};function d(ms){return new Promise(function(r){setTimeout(r,ms)})}function rc(e){if(!e)return!1;try{e.scrollIntoView({block:"center",behavior:"instant"});var r=e.getBoundingClientRect();var x=r.left+r.width/2;var y=r.top+r.height/2;["pointerdown","mousedown","pointerup","mouseup","click"].forEach(function(ev){e.dispatchEvent(new MouseEvent(ev,{view:window,bubbles:!0,cancelable:!0,clientX:x,clientY:y,button:0}))});try{var sc=angular.element(e).scope();if(sc&&sc.$apply)sc.$apply()}catch(ae){}return!0}catch(x){try{e.click();return!0}catch(x2){return!1}}}function fm(){["fecharModalAlerta","fecharModalErro","fecharModalInfo","confirmarModalConfirmacao","botaosim","btnFecharModal","btnOk","btnConfirmar"].forEach(function(id){var e=document.getElementById(id);if(e&&e.offsetParent!==null)try{rc(e)}catch(x){}});document.querySelectorAll("button,a").forEach(function(b){var t=b.textContent.trim().toLowerCase();if((t==="ok"||t==="entendi"||t==="fechar"||t==="confirmar"||t==="sim"||t==="continuar")&&b.offsetParent!==null&&b.offsetWidth>0){var ic=b.id&&(b.id.toLowerCase().indexOf("carrinho")>=0||b.id.toLowerCase().indexOf("pagamento")>=0);if(!ic)try{rc(b)}catch(x){}}})}function cn(n){var p=String(n).padStart(2,"0");var e=document.getElementById("n"+p);if(e)return rc(e);e=document.querySelector("a#n"+p)||document.querySelector("#n"+p);if(e)return rc(e);var all=document.querySelectorAll("a[role=button],a.dezena,a.numero,a[id^=n]");for(var i=0;i<all.length;i++)if(all[i].textContent.trim()===p)return rc(all[i]);var allN=document.querySelectorAll(".number,.dezena,.num,[class*=number],[class*=dezena]");for(var k=0;k<allN.length;k++){var t=allN[k].textContent.trim();if(t===p||t===String(n))return rc(allN[k])}return!1}function lmp(){fm();var b=document.getElementById("limparvolante");if(b)return rc(b);b=document.querySelector("[id*=limpar]");if(b)return rc(b);var bs=document.querySelectorAll("button");for(var k=0;k<bs.length;k++)if(bs[k].textContent.toLowerCase().indexOf("limpar")>=0)return rc(bs[k]);return!1}async function selTime(){if(!TM)return!0;await d(500);var ts=document.querySelectorAll("[data-selecionar-time-do-coracao],img[name=btnTime],.time-coracao img,li img[src*=time],.times-list img,.team-item img");if(ts.length===0){var al=document.querySelectorAll("li");for(var k=0;k<al.length;k++){var im=al[k].querySelectorAll("img");if(im.length>0&&al[k].querySelector("span")){ts=im;break}}}if(ts.length===0){var tb=document.querySelectorAll("a[class*=time],button[class*=time],div[class*=time]");if(tb.length>0)ts=tb}if(ts.length>0){var idx=Math.floor(Math.random()*ts.length);rc(ts[idx]);await d(400);if(ts[idx].parentElement&&ts[idx].parentElement.tagName==="LI"&&!ts[idx].parentElement.classList.contains("active")){rc(ts[idx].parentElement);await d(200)}return!0}return!1}async function selMes(){if(!DS)return!0;await d(500);var ms=document.querySelectorAll("[data-selecionar-mes],select#mes option,.mes-sorte,.month-item");if(ms.length===0){var s=document.querySelector("select");if(s&&s.options.length>1){s.selectedIndex=Math.floor(Math.random()*(s.options.length-1))+1;s.dispatchEvent(new Event("change",{bubbles:!0}));return!0}}if(ms.length>0){var idx=Math.floor(Math.random()*ms.length);rc(ms[idx]);await d(250);return!0}return!1}async function car(){fm();await d(100);if(TM){await selTime();await d(300)}if(DS){await selMes();await d(300)}for(var t=0;t<8;t++){var b=document.getElementById("colocarnocarrinho");if(b&&b.offsetParent!==null){if(b.disabled||b.classList.contains("disabled")){await d(800);if(TM){await selTime();await d(400)}if(DS){await selMes();await d(400)}continue}rc(b);await d(800);fm();await d(300);fm();return!0}var ab=document.querySelectorAll("button,a");for(var k=0;k<ab.length;k++){var tx=ab[k].textContent.toLowerCase().trim();if((tx.indexOf("colocar no carrinho")>=0||(tx.indexOf("carrinho")>=0&&tx.indexOf("ir para")<0&&tx.indexOf("ver")<0))&&ab[k].offsetParent!==null&&ab[k].offsetWidth>0){rc(ab[k]);await d(800);fm();await d(300);fm();return!0}}fm();await d(400)}return!1}var pg=document.createElement("div");pg.id="b2b-mob-progress";pg.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(145deg,#0F172A,#1E293B);border-bottom:2px solid #FFD700;padding:12px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.6);font-family:Inter,sans-serif;";pg.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#FFD700;font-weight:800;font-size:0.85rem;">⚡ B2B TURBO</span><span id="b2b-pg-txt" style="color:#E2E8F0;font-size:0.8rem;font-weight:600;">0/'+T+'</span><button onclick="this.parentNode.parentNode.remove()" style="background:none;border:none;color:#94A3B8;font-size:1.2rem;cursor:pointer;">✕</button></div><div style="margin-top:6px;background:rgba(255,255,255,0.1);border-radius:4px;height:6px;overflow:hidden;"><div id="b2b-pg-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#FFD700,#22C55E);border-radius:4px;transition:width 0.3s;"></div></div>';document.body.appendChild(pg);fm();await d(400);for(var i=0;i<T;i++){var j=J[i];var pt=document.getElementById("b2b-pg-txt");var pb=document.getElementById("b2b-pg-bar");if(pt)pt.textContent=(i+1)+"/"+T+" ["+j.join(",")+"]";if(pb)pb.style.width=((i+1)/T*100).toFixed(0)+"%";fm();if(i>0){lmp();await d(500);fm();await d(200)}var ac=0;for(var n=0;n<j.length;n++){if(cn(j[n]))ac++;else{await d(150);if(cn(j[n]))ac++}await d(120)}try{var rs=angular.element(document.body).scope();if(rs&&rs.$apply)rs.$apply()}catch(ae){}await d(400);fm();await d(200);var ok=await car();if(ok){OK++}else{ER++}if(i<T-1){await d(600);fm()}}var pp=document.getElementById("b2b-mob-progress");if(pp){pp.style.borderColor="#22C55E";pp.innerHTML='<div style="text-align:center;padding:8px;"><div style="color:#22C55E;font-weight:800;font-size:1rem;">✅ PRONTO! '+OK+'/'+T+' jogos no carrinho!</div><div style="color:#E2E8F0;font-size:0.8rem;margin-top:4px;">💳 Toque no carrinho (🛒) para finalizar o pagamento.</div><button onclick="this.parentNode.parentNode.remove()" style="margin-top:8px;background:#22C55E;color:white;border:none;padding:8px 20px;border-radius:8px;font-weight:700;cursor:pointer;">OK</button></div>'}alert("✅ "+OK+"/"+T+" jogos no carrinho!"+(ER>0?"\\n"+ER+" erro(s).":"")+"\\n\\n💳 Toque no carrinho (🛒) para finalizar.")})())`;
        return script;
    }

    // ── Modal MOBILE v2.0: Abas Automático + Manual ──
    _openMobileBetModal(games, gameKey) {
        const allConfigs = this._getCaixaLotteryConfig();
        const cfg = allConfigs[gameKey];
        if (!cfg) return;
        const caixaUrl = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + cfg.url;

        // Remover modal anterior
        const old = document.getElementById('mobile-bet-modal');
        if (old) old.remove();

        // ═══ SALVAR JOGOS NO LOCALSTORAGE ═══
        try {
            localStorage.setItem('b2b_mobile_games', JSON.stringify(games));
            localStorage.setItem('b2b_mobile_config', JSON.stringify(cfg));
            localStorage.setItem('b2b_mobile_timestamp', Date.now().toString());
        } catch(e) { console.warn('[B2B] localStorage indisponível:', e); }

        // ═══ GERAR BOOKMARKLET ═══
        const bookmarkletCode = this._generateMobileBookmarklet(games, cfg);

        // ═══ GERAR HTML DOS JOGOS (aba manual) ═══
        let jogosHTML = '';
        games.forEach((g, i) => {
            const nums = g.map(n => String(n).padStart(2, '0')).join('  ');
            const numsCSV = g.map(n => String(n).padStart(2, '0')).join(', ');
            jogosHTML += '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;margin-bottom:6px;border:1px solid rgba(255,255,255,0.06);"><div style="flex:1;"><div style="color:#60A5FA;font-weight:700;font-size:0.72rem;margin-bottom:3px;">Jogo ' + (i+1) + '</div><div style="color:#E2E8F0;font-size:1rem;font-weight:600;font-family:monospace;letter-spacing:1px;">' + nums + '</div></div><button class="mobile-copy-game-btn" data-nums="' + numsCSV + '" style="background:linear-gradient(135deg,#22C55E,#16A34A);color:white;border:none;padding:10px 14px;border-radius:10px;font-size:0.8rem;font-weight:800;cursor:pointer;white-space:nowrap;min-width:70px;">📋 Copiar</button></div>';
        });

        const allFormatted = games.map((g, i) =>
            'Jogo ' + (i+1) + ': ' + g.map(n => String(n).padStart(2,'0')).join(' - ')
        ).join('\n');

        const modal = document.createElement('div');
        modal.id = 'mobile-bet-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding:10px;box-sizing:border-box;overflow-y:auto;-webkit-overflow-scrolling:touch;';

        modal.innerHTML = `
        <div style="background:linear-gradient(145deg,#0F172A,#1E293B);border-radius:16px;border:1px solid #FFD70040;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;padding:18px;color:#E2E8F0;box-shadow:0 20px 60px rgba(0,0,0,0.6);">
            <!-- HEADER -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <h2 style="margin:0;font-size:1.1rem;color:#FFD700;">📱 Apostar no Celular</h2>
                <button id="close-mobile-bet-modal" style="background:none;border:none;color:#94A3B8;font-size:1.8rem;cursor:pointer;padding:4px 8px;">✕</button>
            </div>

            <!-- INFO BAR -->
            <div style="background:linear-gradient(135deg,rgba(255,215,0,0.12),rgba(0,60,120,0.1));border:1px solid #FFD70030;border-radius:12px;padding:12px;margin-bottom:14px;">
                <div style="font-weight:800;color:#FFD700;font-size:0.95rem;margin-bottom:4px;">🎰 ${games.length} jogos de ${cfg.name}</div>
                <div style="font-size:0.75rem;color:#94A3B8;line-height:1.4;">Escolha como apostar: automático (recomendado) ou copiar manualmente.</div>
            </div>

            <!-- TABS -->
            <div style="display:flex;gap:4px;margin-bottom:14px;">
                <button id="tab-auto-btn" style="flex:1;padding:12px 8px;border-radius:10px;border:2px solid #FFD700;background:linear-gradient(135deg,#FFD70020,#FFD70008);color:#FFD700;font-weight:800;font-size:0.82rem;cursor:pointer;transition:all 0.2s;">⚡ AUTOMÁTICO</button>
                <button id="tab-manual-btn" style="flex:1;padding:12px 8px;border-radius:10px;border:1px solid #47556940;background:transparent;color:#94A3B8;font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.2s;">📋 Manual</button>
            </div>

            <!-- ═══════════ ABA AUTOMÁTICO ═══════════ -->
            <div id="tab-auto-content">
                <div style="background:linear-gradient(145deg,rgba(34,197,94,0.1),rgba(0,60,120,0.08));border:1px solid #22C55E30;border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="color:#22C55E;font-weight:800;font-size:0.9rem;margin-bottom:8px;">⚡ Preenchimento Automático — Sem F12!</div>
                    <div style="font-size:0.78rem;color:#CBD5E1;line-height:1.6;">
                        O sistema preenche seus jogos automaticamente no site da Caixa.<br>
                        <strong style="color:#FFD700;">Nenhum conhecimento técnico necessário.</strong>
                    </div>
                </div>

                <!-- PASSO A PASSO -->
                <div style="margin-bottom:14px;">
                    <div style="color:#FFD700;font-weight:800;font-size:0.82rem;margin-bottom:10px;">📝 Passo a Passo (uma vez só!):</div>

                    <!-- PASSO 1: Copiar o Bookmarklet -->
                    <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
                        <span style="background:#FFD700;color:#000;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">1</span>
                        <div style="flex:1;">
                            <div style="font-size:0.8rem;font-weight:700;color:#E2E8F0;margin-bottom:6px;">Copie o link de automação:</div>
                            <button id="btn-copy-bookmarklet" style="width:100%;background:linear-gradient(135deg,#22C55E,#16A34A);color:white;border:none;padding:12px;border-radius:10px;font-size:0.88rem;font-weight:800;cursor:pointer;box-shadow:0 4px 15px rgba(34,197,94,0.35);">📋 COPIAR LINK DE AUTOMAÇÃO</button>
                        </div>
                    </div>

                    <!-- PASSO 2: Abrir Site da Caixa -->
                    <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
                        <span style="background:#0066CC;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">2</span>
                        <div style="flex:1;">
                            <div style="font-size:0.8rem;font-weight:700;color:#E2E8F0;margin-bottom:6px;">Abra o site da Caixa e faça login:</div>
                            <a href="${caixaUrl}" target="_blank" rel="noopener" style="display:block;width:100%;background:linear-gradient(135deg,#0066CC,#003D80);color:white;border:none;padding:12px;border-radius:10px;font-size:0.85rem;font-weight:800;cursor:pointer;text-align:center;text-decoration:none;box-sizing:border-box;">🌐 ABRIR ${cfg.name.toUpperCase()}</a>
                        </div>
                    </div>

                    <!-- PASSO 3: Criar o Bookmark -->
                    <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">
                        <span style="background:#8B5CF6;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">3</span>
                        <div style="flex:1;">
                            <div style="font-size:0.8rem;font-weight:700;color:#E2E8F0;margin-bottom:4px;">No site da Caixa, crie um favorito:</div>
                            <div style="font-size:0.72rem;color:#CBD5E1;line-height:1.6;">
                                <div style="margin-bottom:4px;"><strong style="color:#60A5FA;">Chrome:</strong> ⋮ → ☆ (Adicionar favorito) → OK</div>
                                <div><strong style="color:#60A5FA;">Safari:</strong> 📤 Compartilhar → "Adicionar Favorito"</div>
                            </div>
                        </div>
                    </div>

                    <!-- PASSO 4: Editar o Favorito -->
                    <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;padding:10px;background:rgba(255,215,0,0.06);border-radius:10px;border:1px solid rgba(255,215,0,0.15);">
                        <span style="background:#F59E0B;color:#000;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">4</span>
                        <div style="flex:1;">
                            <div style="font-size:0.8rem;font-weight:700;color:#E2E8F0;margin-bottom:4px;">Edite o favorito recém-criado:</div>
                            <div style="font-size:0.72rem;color:#CBD5E1;line-height:1.6;">
                                <div>• Abra os favoritos do navegador</div>
                                <div>• Toque e segure no favorito recém-criado</div>
                                <div>• Toque em <strong style="color:#FFD700;">"Editar"</strong></div>
                                <div>• No campo <strong style="color:#FFD700;">URL / Endereço</strong>:</div>
                                <div style="padding:4px 0;">  → Apague tudo que estiver lá</div>
                                <div style="padding:4px 0;">  → <strong style="color:#22C55E;">Cole</strong> o link copiado no passo 1</div>
                                <div>• Renomeie para <strong style="color:#FFD700;">"⚡ B2B Apostar"</strong></div>
                                <div>• Salve</div>
                            </div>
                        </div>
                    </div>

                    <!-- PASSO 5: Executar -->
                    <div style="display:flex;gap:10px;align-items:flex-start;padding:10px;background:rgba(34,197,94,0.08);border-radius:10px;border:1px solid rgba(34,197,94,0.2);">
                        <span style="background:#22C55E;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;flex-shrink:0;">5</span>
                        <div style="flex:1;">
                            <div style="font-size:0.8rem;font-weight:700;color:#22C55E;margin-bottom:4px;">Execute! 🚀</div>
                            <div style="font-size:0.72rem;color:#CBD5E1;line-height:1.6;">
                                <div>Na página do jogo da Caixa (já logado):</div>
                                <div style="margin-top:3px;"><strong style="color:#FFD700;">Abra seus favoritos e toque em "⚡ B2B Apostar"</strong></div>
                                <div style="margin-top:3px;color:#22C55E;font-weight:600;">✅ Os ${games.length} jogos serão preenchidos automaticamente!</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ALTERNATIVA RÁPIDA: Cole na barra de endereço -->
                <div style="background:rgba(139,92,246,0.08);border:1px solid #8B5CF640;border-radius:12px;padding:12px;margin-bottom:12px;">
                    <div style="color:#C4B5FD;font-weight:800;font-size:0.82rem;margin-bottom:8px;">🚀 Alternativa Rápida (Sem criar favorito):</div>
                    <div style="font-size:0.72rem;color:#CBD5E1;line-height:1.6;margin-bottom:8px;">
                        <div>① Copie o link acima (passo 1)</div>
                        <div>② No site da Caixa, toque na <strong style="color:#C4B5FD;">barra de endereço</strong></div>
                        <div>③ Apague o endereço atual</div>
                        <div>④ Cole o link e toque <strong style="color:#C4B5FD;">Ir / Enter</strong></div>
                    </div>
                    <div style="font-size:0.68rem;color:#F59E0B;line-height:1.4;">
                        ⚠️ <strong>Importante:</strong> Alguns navegadores removem o "javascript:" do início ao colar. Se não funcionar, digite <strong style="color:#FFD700;">javascript:</strong> manualmente antes de colar.
                    </div>
                </div>

                <!-- LISTA RESUMIDA DOS JOGOS -->
                <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px;margin-bottom:12px;">
                    <div style="color:#94A3B8;font-size:0.72rem;font-weight:700;margin-bottom:6px;">🎰 Jogos que serão apostados:</div>
                    <div style="font-size:0.7rem;color:#CBD5E1;font-family:monospace;line-height:1.8;max-height:120px;overflow-y:auto;">
                        ${games.map((g, i) => '<div><span style="color:#60A5FA;">' + (i+1) + '.</span> ' + g.map(n => String(n).padStart(2,'0')).join(' ') + '</div>').join('')}
                    </div>
                </div>

                <div style="text-align:center;font-size:0.65rem;color:#475569;line-height:1.4;">
                    💡 O script seleciona números e coloca no carrinho automaticamente.<br>
                    O pagamento é feito manualmente por você.
                </div>
            </div>

            <!-- ═══════════ ABA MANUAL ═══════════ -->
            <div id="tab-manual-content" style="display:none;">
                <div style="background:linear-gradient(135deg,rgba(0,102,204,0.1),rgba(0,60,120,0.08));border:1px solid #0066CC20;border-radius:12px;padding:10px;margin-bottom:12px;">
                    <div style="font-size:0.78rem;color:#94A3B8;line-height:1.5;">Copie cada jogo e preencha manualmente no site da Caixa.</div>
                </div>
                <div style="margin-bottom:12px;">${jogosHTML}</div>
                <button id="mobile-copy-all-btn" style="width:100%;background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:white;border:none;padding:14px;border-radius:12px;font-size:0.95rem;font-weight:800;cursor:pointer;margin-bottom:10px;box-shadow:0 4px 15px rgba(139,92,246,0.4);">📋 COPIAR TODOS OS ${games.length} JOGOS</button>
                <a href="${caixaUrl}" target="_blank" rel="noopener" style="display:block;width:100%;background:linear-gradient(135deg,#0066CC,#003D80);color:white;border:none;padding:14px;border-radius:12px;font-size:0.95rem;font-weight:800;cursor:pointer;text-align:center;text-decoration:none;box-shadow:0 4px 15px rgba(0,102,204,0.4);box-sizing:border-box;">🌐 ABRIR SITE DA CAIXA — ${cfg.name}</a>
                <div style="margin-top:12px;padding:10px;background:rgba(245,158,11,0.08);border:1px solid #F59E0B30;border-radius:10px;">
                    <div style="color:#F59E0B;font-weight:700;font-size:0.82rem;margin-bottom:6px;">📝 Como apostar manualmente:</div>
                    <div style="font-size:0.75rem;color:#CBD5E1;line-height:1.7;">
                        <div>① Copie os números de um jogo acima</div>
                        <div>② Toque em "Abrir Site da Caixa"</div>
                        <div>③ Faça login na sua conta</div>
                        <div>④ Selecione os números manualmente</div>
                        <div>⑤ Toque em "Colocar no Carrinho"</div>
                        <div>⑥ Repita para cada jogo</div>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.appendChild(modal);

        // ═══ EVENT HANDLERS ═══

        // Fechar modal
        document.getElementById('close-mobile-bet-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        // ── Abas ──
        const tabAutoBtn = document.getElementById('tab-auto-btn');
        const tabManualBtn = document.getElementById('tab-manual-btn');
        const tabAutoContent = document.getElementById('tab-auto-content');
        const tabManualContent = document.getElementById('tab-manual-content');

        tabAutoBtn.addEventListener('click', () => {
            tabAutoContent.style.display = 'block';
            tabManualContent.style.display = 'none';
            tabAutoBtn.style.border = '2px solid #FFD700';
            tabAutoBtn.style.background = 'linear-gradient(135deg,#FFD70020,#FFD70008)';
            tabAutoBtn.style.color = '#FFD700';
            tabManualBtn.style.border = '1px solid #47556940';
            tabManualBtn.style.background = 'transparent';
            tabManualBtn.style.color = '#94A3B8';
        });

        tabManualBtn.addEventListener('click', () => {
            tabAutoContent.style.display = 'none';
            tabManualContent.style.display = 'block';
            tabManualBtn.style.border = '2px solid #0066CC';
            tabManualBtn.style.background = 'linear-gradient(135deg,#0066CC20,#0066CC08)';
            tabManualBtn.style.color = '#60A5FA';
            tabAutoBtn.style.border = '1px solid #47556940';
            tabAutoBtn.style.background = 'transparent';
            tabAutoBtn.style.color = '#94A3B8';
        });

        // ── Copiar Bookmarklet ──
        const bookmarkletBtn = document.getElementById('btn-copy-bookmarklet');
        if (bookmarkletBtn) {
            bookmarkletBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(bookmarkletCode);
                } catch(e) {
                    const ta = document.createElement('textarea');
                    ta.value = bookmarkletCode;
                    ta.style.cssText = 'position:fixed;left:-9999px;';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }
                bookmarkletBtn.textContent = '✅ LINK COPIADO!';
                bookmarkletBtn.style.background = 'linear-gradient(135deg,#059669,#047857)';
                setTimeout(() => {
                    bookmarkletBtn.textContent = '📋 COPIAR LINK DE AUTOMAÇÃO';
                    bookmarkletBtn.style.background = 'linear-gradient(135deg,#22C55E,#16A34A)';
                }, 3000);
            });
        }

        // ── Copiar jogo individual ──
        modal.querySelectorAll('.mobile-copy-game-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const nums = btn.getAttribute('data-nums');
                try { await navigator.clipboard.writeText(nums); } catch(e) {
                    const ta = document.createElement('textarea'); ta.value = nums; ta.style.cssText = 'position:fixed;left:-9999px;';
                    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                }
                btn.textContent = '✅ Copiado!'; btn.style.background = 'linear-gradient(135deg,#059669,#047857)';
                setTimeout(() => { btn.textContent = '📋 Copiar'; btn.style.background = 'linear-gradient(135deg,#22C55E,#16A34A)'; }, 2000);
            });
        });

        // ── Copiar todos ──
        const copyAllBtn = document.getElementById('mobile-copy-all-btn');
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', async () => {
                try { await navigator.clipboard.writeText(allFormatted); } catch(e) {
                    const ta = document.createElement('textarea'); ta.value = allFormatted; ta.style.cssText = 'position:fixed;left:-9999px;';
                    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                }
                copyAllBtn.textContent = '✅ TODOS COPIADOS!'; copyAllBtn.style.background = 'linear-gradient(135deg,#059669,#047857)';
                setTimeout(() => { copyAllBtn.textContent = '📋 COPIAR TODOS OS ' + games.length + ' JOGOS'; copyAllBtn.style.background = 'linear-gradient(135deg,#8B5CF6,#7C3AED)'; }, 3000);
            });
        }
    }

    _insertCaixaPanel(games, gameKey) {
        if (!games || games.length === 0) return;
        this._lastGeneratedGames = games;
        this._lastGameKey = gameKey;
        const allConfigs = this._getCaixaLotteryConfig();
        const lotteryConfig = allConfigs[gameKey];
        if (!lotteryConfig) return;
        const isMobile = this._isMobile();

        var oldPanel = document.getElementById('caixa-panel');
        if (oldPanel) oldPanel.remove();

        var _self = this;
        var _cp = document.createElement('div');
        _cp.id = 'caixa-panel';
        _cp.style.cssText = 'margin:16px 0;text-align:center;';

        var _btn = document.createElement('button');
        _btn.id = 'btn-aposte-online';
        _btn.style.cssText = 'width:100%;background:linear-gradient(135deg,#0066CC,#003D80);color:white;border:none;padding:18px 28px;border-radius:14px;font-size:1.1rem;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(0,102,204,0.4);transition:all 0.3s ease;letter-spacing:0.3px;';
        _btn.textContent = '\u{1F3E6} APOSTE ONLINE \u{2014} ' + games.length + ' jogos de ' + lotteryConfig.name;
        _btn.onmouseenter = function() { this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 8px 28px rgba(0,102,204,0.5)'; };
        _btn.onmouseleave = function() { this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 6px 20px rgba(0,102,204,0.4)'; };

        var _st = document.createElement('div');
        _st.id = 'caixa-status';
        _st.style.cssText = 'display:none;margin-top:12px;padding:14px;background:linear-gradient(145deg,rgba(34,197,94,0.15),rgba(0,60,120,0.1));border:1px solid #22C55E50;border-radius:12px;';

        var _info = document.createElement('div');
        _info.style.cssText = 'margin-top:8px;font-size:0.72rem;color:#94A3B8;line-height:1.5;';
        if (isMobile) {
            _info.innerHTML = '📱 <strong style="color:#60A5FA;">Celular:</strong> Toque para ver seus jogos formatados e copiar para o site da Caixa.';
        } else {
            _info.innerHTML = '💡 <strong style="color:#60A5FA;">Como funciona:</strong> O script é copiado automaticamente. No site da Caixa, pressione <kbd style="background:#1E293B;padding:2px 6px;border-radius:4px;border:1px solid #475569;color:#E2E8F0;font-size:0.7rem;">F12</kbd> → aba <strong>Console</strong> → cole com <kbd style="background:#1E293B;padding:2px 6px;border-radius:4px;border:1px solid #475569;color:#E2E8F0;font-size:0.7rem;">Ctrl+V</kbd> → pressione <kbd style="background:#1E293B;padding:2px 6px;border-radius:4px;border:1px solid #475569;color:#E2E8F0;font-size:0.7rem;">Enter</kbd>';
        }

        _cp.appendChild(_btn);
        _cp.appendChild(_st);
        _cp.appendChild(_info);

        if (this.gamesContainer && this.gamesContainer.parentNode) {
            this.gamesContainer.parentNode.insertBefore(_cp, this.gamesContainer);
        }

        // Handler — DETECTA MOBILE vs DESKTOP
        _btn.addEventListener('click', async function() {
            var currentGames = _self._lastGeneratedGames || _self.currentGeneratedGames || games;
            var currentKey = _self._lastGameKey || gameKey;
            var cfg = allConfigs[currentKey] || lotteryConfig;

            if (_self._isMobile()) {
                // ══════ MOBILE: Abrir modal com jogos formatados ══════
                _self._openMobileBetModal(currentGames, currentKey);
            } else {
                // ══════ DESKTOP: Fluxo de script (Console F12) ══════
                console.log('[B2B] Enviando ' + currentGames.length + ' jogos para ' + currentKey);
                var freshUrl = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + cfg.url;
                var freshScript = _self._generateCaixaScript_LEGACY(cfg, currentGames);

                try {
                    await navigator.clipboard.writeText(freshScript);
                    console.log('[B2B] ✅ ' + currentGames.length + ' jogos de ' + cfg.name + ' copiados!');
                } catch(e) {
                    var ta = document.createElement('textarea'); ta.value = freshScript; ta.style.cssText = 'position:fixed;left:-9999px;';
                    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                }

                document.dispatchEvent(new CustomEvent('b2b-aposte-online', { detail: { games: currentGames, config: cfg } }));

                alert('✅ Script v7.0 TURBO copiado! ' + currentGames.length + ' jogos de ' + cfg.name + '\n\n⚠️ IMPORTANTE:\n1. Na Caixa, pressione F12\n2. Clique na aba "Console"\n3. Cole com Ctrl+V\n4. Pressione Enter');
                setTimeout(function() { if (!window._b2bExtensionOpened) window.open(freshUrl, '_blank'); }, 300);

                _st.style.display = 'block';
                _st.innerHTML = '<div style="color:#22C55E;font-weight:800;font-size:1.1rem;margin-bottom:8px;">✅ ' + currentGames.length + ' jogos de ' + cfg.name + ' copiados!</div><div style="color:#E2E8F0;font-size:0.88rem;">Site da Caixa abrindo em <strong>' + cfg.name + '</strong>... cole com <strong>Ctrl+V</strong> no Console (F12).</div>';
                _btn.style.background = 'linear-gradient(135deg,#059669,#047857)';
                _btn.textContent = '✅ ' + currentGames.length + ' JOGOS DE ' + cfg.name.toUpperCase() + ' COPIADOS — Cole no Console (F12)';
                setTimeout(function() {
                    _btn.style.background = 'linear-gradient(135deg,#0066CC,#003D80)';
                    _btn.textContent = '\u{1F3E6} APOSTE ONLINE \u{2014} ' + currentGames.length + ' jogos de ' + cfg.name;
                }, 5000);
            }
        });
    }


    // Mantido como fallback — não usado diretamente
    _showCaixaAutomationPanel_LEGACY(config, games) {
        // Remover modal anterior se existir
        const existing = document.getElementById('caixa-automation-modal');
        if (existing) existing.remove();

        // Gerar o script de automação
        const gamesJSON = JSON.stringify(games);
        const automationScript = this._generateCaixaScript(config, games);

        // Criar modal
        const modal = document.createElement('div');
        modal.id = 'caixa-automation-modal';
        modal.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.85);z-index:10000;
            display:flex;align-items:center;justify-content:center;
            padding:20px;box-sizing:border-box;
        `;
        modal.innerHTML = `
            <div style="
                background:linear-gradient(145deg,#0F172A,#1E293B);
                border-radius:16px;border:1px solid #0066CC40;
                max-width:520px;width:100%;max-height:90vh;overflow-y:auto;
                padding:24px;color:#E2E8F0;
                box-shadow:0 20px 60px rgba(0,0,0,0.5);
            ">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 style="margin:0;font-size:1.2rem;color:#0066CC;">
                        🏦 Apostar na Caixa Online
                    </h2>
                    <button id="close-caixa-modal" style="
                        background:none;border:none;color:#94A3B8;font-size:1.5rem;cursor:pointer;
                    ">✕</button>
                </div>

                <div style="background:rgba(0,102,204,0.1);border:1px solid #0066CC30;border-radius:10px;padding:14px;margin-bottom:16px;">
                    <div style="font-weight:700;color:#60A5FA;margin-bottom:8px;">📋 ${games.length} jogos de ${config.name} prontos</div>
                    <div style="font-size:0.8rem;color:#94A3B8;">
                        ${games.map((g, i) => '<span style="color:#E2E8F0;font-weight:600;">Jogo ' + (i+1) + ':</span> ' + g.map(n => String(n).padStart(2,'0')).join(', ')).join('<br>')}
                    </div>
                </div>

                <div style="margin-bottom:16px;">
                    <div style="font-weight:700;color:#F59E0B;margin-bottom:10px;">📝 Passo a passo:</div>
                    <div style="font-size:0.85rem;line-height:1.8;">
                        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;">
                            <span style="background:#0066CC;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;flex-shrink:0;">1</span>
                            <span>Abra: <a href="https://www.loteriasonline.caixa.gov.br/silce-web/#/${config.url}" target="_blank" style="color:#60A5FA;text-decoration:underline;">Loterias Online — ${config.name}</a></span>
                        </div>
                        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;">
                            <span style="background:#0066CC;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;flex-shrink:0;">2</span>
                            <span>Faça login na sua conta da Caixa</span>
                        </div>
                        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;">
                            <span style="background:#0066CC;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;flex-shrink:0;">3</span>
                            <span>Na página do jogo, pressione <kbd style="background:#334155;padding:2px 6px;border-radius:4px;font-size:0.75rem;">F12</kbd> para abrir o Console</span>
                        </div>
                        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;">
                            <span style="background:#0066CC;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;flex-shrink:0;">4</span>
                            <span>Clique em <strong>"Copiar Script"</strong> abaixo</span>
                        </div>
                        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;">
                            <span style="background:#0066CC;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;flex-shrink:0;">5</span>
                            <span>Cole <kbd style="background:#334155;padding:2px 6px;border-radius:4px;font-size:0.75rem;">Ctrl+V</kbd> no Console e pressione <kbd style="background:#334155;padding:2px 6px;border-radius:4px;font-size:0.75rem;">Enter</kbd></span>
                        </div>
                        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;">
                            <span style="background:#22C55E;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;flex-shrink:0;">✓</span>
                            <span style="color:#22C55E;font-weight:700;">O script preenche cada jogo automaticamente!</span>
                        </div>
                        <div style="display:flex;gap:8px;align-items:flex-start;">
                            <span style="background:#F59E0B;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;flex-shrink:0;">6</span>
                            <span>Após todos os jogos, finalize o pagamento manualmente</span>
                        </div>
                    </div>
                </div>

                <button id="copy-caixa-script" style="
                    background: linear-gradient(135deg, #22C55E, #16A34A);
                    color: white;
                    border: none;
                    padding: 14px 24px;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 800;
                    cursor: pointer;
                    width: 100%;
                    margin-bottom: 10px;
                    transition: all 0.3s ease;
                ">📋 Copiar Script de Automação</button>

                <button id="open-caixa-site" style="
                    background: linear-gradient(135deg, #0066CC, #003D80);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                ">🌐 Abrir Loterias Online da Caixa</button>

                <div style="margin-top:12px;padding:10px;background:rgba(245,158,11,0.08);border:1px solid #F59E0B30;border-radius:8px;font-size:0.72rem;color:#F59E0B;">
                    ⚠️ O script seleciona os números e adiciona ao carrinho automaticamente. O pagamento é feito manualmente por você. Delay entre jogos: 3 segundos.
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('close-caixa-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        document.getElementById('copy-caixa-script').addEventListener('click', () => {
            navigator.clipboard.writeText(automationScript).then(() => {
                const btn = document.getElementById('copy-caixa-script');
                btn.textContent = '✅ Script Copiado!';
                btn.style.background = 'linear-gradient(135deg, #059669, #047857)';
                setTimeout(() => {
                    btn.textContent = '📋 Copiar Script de Automação';
                    btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
                }, 3000);
            }).catch(() => {
                // Fallback: mostrar textarea
                const ta = document.createElement('textarea');
                ta.value = automationScript;
                ta.style.cssText = 'width:100%;height:200px;margin-top:10px;background:#0F172A;color:#E2E8F0;border:1px solid #334155;border-radius:8px;padding:10px;font-family:monospace;font-size:0.7rem;';
                document.getElementById('copy-caixa-script').parentNode.insertBefore(ta, document.getElementById('open-caixa-site'));
                ta.select();
            });
        });

        document.getElementById('open-caixa-site').addEventListener('click', () => {
            window.open('https://www.loteriasonline.caixa.gov.br/silce-web/#/' + config.url, '_blank');
        });
    }

    // Gerar o script JavaScript para automação no site da Caixa
    // Redireciona para o script TURBO que funciona com AngularJS
    _generateCaixaScript(config, games) {
        return this._generateCaixaScript_LEGACY(config, games);
    }

    initHeaderAnimations() {
        // Disabled to improve performance and prevent server crashes
        /*
        const container = document.createElement('div');
        ...
        */
    }

    initEvents() {
        // Navigation Buttons — apply game color gradients
        this.navButtons.forEach(btn => {
            const gameKey = btn.dataset.game;
            const game = GAMES[gameKey];
            if (game) {
                const c1 = game.color || '#10B981';
                const c2 = game.colorGrad || '#065f35';
                btn.style.setProperty('--btn-gradient', `linear-gradient(135deg, ${c1}, ${c2})`);
                // Set subtle colored border
                btn.style.borderColor = `${c1}55`;
            }
            btn.onclick = () => {
                this.updateGameInfo(gameKey);
            };
        });

        // Grid Controls
        document.getElementById('btn-random-select').onclick = () => this.selectRandom();
        document.getElementById('btn-clear-selection').onclick = () => this.clearSelection();

        // Fixed Mode Toggle
        this.btnFixedMode.onclick = () => this.toggleFixedMode();

        // Generate (Fechamento) — Motor Inteligente v3 + Fechamento Objetivo L99
        this.generateBtn.onclick = () => {
            // ── RASTREAMENTO DE MODO ──
            this._lastPrecisionMode = false;
            const closingVal = this.closingSelect.value;
            if (closingVal && closingVal.startsWith('close_')) {
                this._lastGenerationMode = 'fechamento';
            } else {
                this._lastGenerationMode = 'gerar_jogos';
            }
            this._lastDrawSize = parseInt(this.smartDrawSizeSelect?.value) || GAMES[this.currentGameKey]?.minBet || 6;

            // ━━ FECHAMENTO OBJETIVO (ClosingEngine v3.0) ━━
            if (closingVal && closingVal.startsWith('close_')) {
                const guarantee = parseInt(closingVal.replace('close_', ''));
                const selectedArr = Array.from(this.selectedNumbers);
                const fixedArr = Array.from(this.fixedNumbers);
                const game = GAMES[this.currentGameKey];
                const closingBetSize = typeof ClosingEngine !== 'undefined' ? ClosingEngine.getBetSize(this.currentGameKey) : game.draw;

                if (selectedArr.length < closingBetSize) {
                    alert('Selecione pelo menos ' + closingBetSize + ' números para o fechamento objetivo de ' + game.name + '.');
                    return;
                }

                // Limpar painéis anteriores (incluindo painéis do QUANTUM L99)
                const _clParent = this.gamesContainer.parentNode;
                if (_clParent) {
                    _clParent.querySelectorAll('.generation-feedback, .smart-analysis-panel, .smart-gen-analysis').forEach(el => el.remove());
                    const _oldCaixaCl = document.getElementById('caixa-panel');
                    if (_oldCaixaCl) _oldCaixaCl.remove();
                }

                // Mostrar loading
                const fixedInfo = fixedArr.length > 0 ? '<br><small style="color:#F59E0B;">📌 ' + fixedArr.length + ' números fixos: ' + fixedArr.sort((a,b)=>a-b).join(', ') + '</small>' : '';
                this.gamesContainer.innerHTML = '<div style="text-align:center;padding:40px;"><div class="sync-loader" style="font-size:1.2em;">🎯 Calculando Fechamento Objetivo v3.0...<br><small>Garantia de ' + guarantee + ' acertos | ' + selectedArr.length + ' números | ' + game.name + '</small>' + fixedInfo + '</div></div>';

                setTimeout(() => {
                  try {
                    // v3.0: Passar fixedNumbers ao ClosingEngine
                    if (typeof ClosingEngine === 'undefined') {
                        this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">❌ Motor de Fechamento (ClosingEngine) não carregado.<br><small>Recarregue a página com Ctrl+Shift+R</small></div>';
                        return;
                    }

                    const closingResult = ClosingEngine.generateClosure(
                        selectedArr, guarantee, closingBetSize, this.currentGameKey, fixedArr
                    );

                    if (closingResult.error) {
                        const errorStyle = closingResult.impossible
                            ? 'background:rgba(239,68,68,0.1);border:1px solid #EF444440;border-radius:12px;padding:20px;color:#F87171;text-align:center;'
                            : '';
                        this.gamesContainer.innerHTML = '<div class="empty-state" style="' + errorStyle + 'color:#EF4444;">❌ ' + closingResult.error + '</div>';
                        return;
                    }

                    // Converter para formato do renderGames
                    const result = {
                        pool: closingResult.selectedNumbers,
                        games: closingResult.games,
                        smartAnalysis: null
                    };

                    this.renderGames(result, this.currentGameKey);

                    // Inserir banner de resultado do fechamento
                    const banner = document.createElement('div');
                    banner.className = 'smart-gen-analysis';
                    banner.style.cssText = 'margin-top:8px;margin-bottom:8px;padding:14px 18px;border-radius:12px;background:linear-gradient(145deg,rgba(234,179,8,0.12),rgba(15,23,42,0.95));border:1px solid #EAB30840;';
                    const guaranteeLabels = { 20: '20 PONTOS', 19: '19 PONTOS', 18: '18 PONTOS', 17: '17 PONTOS', 15: '15 PONTOS', 14: '14 PONTOS', 13: '13 PONTOS', 12: '12 PONTOS', 11: '11 PONTOS', 10: '10 PONTOS', 9: '9 PONTOS', 8: '8 PONTOS', 7: '7 PONTOS', 6: 'SENA', 5: 'QUINA', 4: 'QUADRA', 3: 'TERNO' };
                    const guaranteeIcons = { 20: '🎯', 19: '⭐', 18: '🔥', 17: '✅', 15: '🎯', 14: '⭐', 13: '🔥', 12: '💎', 11: '💎', 10: '👑', 9: '👑', 8: '🔥', 7: '⭐', 6: '🎯', 5: '⭐', 4: '🔥', 3: '✅' };
                    const modeLabel = closingResult.mode ? ' <span style="font-size:0.7em;color:#94A3B8;">(' + closingResult.mode + ')</span>' : '';

                    // v3.0: Badge de confiança
                    const confPct = closingResult.confidence || closingResult.coveragePct;
                    const confColor = confPct >= 99 ? '#10B981' : confPct >= 95 ? '#22C55E' : confPct >= 80 ? '#F59E0B' : '#EF4444';
                    const confBadge = '<div style="margin-top:8px;padding:6px 10px;background:rgba(16,185,129,0.08);border:1px solid ' + confColor + '30;border-radius:8px;font-size:0.82em;color:' + confColor + ';font-weight:600;">🔒 Confiança: ' + confPct.toFixed(1) + '% | Modo: ' + (closingResult.mode || 'EXATO') + '</div>';

                    // v3.0: Badge de números fixos
                    const fixedBadge = fixedArr.length > 0 ? '<div style="margin-top:8px;padding:6px 10px;background:rgba(245,158,11,0.12);border:1px solid #F59E0B30;border-radius:8px;font-size:0.8em;color:#F59E0B;">📌 <strong>Números Fixos (' + fixedArr.length + '):</strong> ' + fixedArr.sort((a,b)=>a-b).map(n => '<span style="background:#F59E0B22;padding:1px 6px;border-radius:10px;font-weight:700;">' + String(n).padStart(2,'0') + '</span>').join(' ') + ' — presentes em TODOS os ' + closingResult.totalGames + ' jogos</div>' : '';

                    banner.innerHTML = '<div style="font-size:1.1em;font-weight:700;color:#EAB308;margin-bottom:6px;">' + (guaranteeIcons[guarantee] || '🎯') + ' FECHAMENTO OBJETIVO — ' + (guaranteeLabels[guarantee] || guarantee) + modeLabel + '</div>' +
                        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:0.85em;">' +
                        '<div style="text-align:center;"><div style="color:#9CA3AF;">Jogos</div><div style="font-weight:700;color:#F59E0B;font-size:1.3em;">' + closingResult.totalGames + '</div></div>' +
                        '<div style="text-align:center;"><div style="color:#9CA3AF;">Cobertura</div><div style="font-weight:700;color:#10B981;font-size:1.3em;">' + closingResult.coveragePct + '%</div></div>' +
                        '<div style="text-align:center;"><div style="color:#9CA3AF;">Custo</div><div style="font-weight:700;color:#F59E0B;font-size:1.3em;">R$ ' + closingResult.cost.toLocaleString('pt-BR', {minimumFractionDigits:2}) + '</div></div>' +
                        '<div style="text-align:center;"><div style="color:#9CA3AF;">Tempo</div><div style="font-weight:700;color:#94A3B8;font-size:1.3em;">' + (closingResult.elapsed / 1000).toFixed(1) + 's</div></div>' +
                        '</div>' +
                        confBadge +
                        fixedBadge +
                        '<div style="margin-top:8px;padding:6px 10px;background:rgba(234,179,8,0.1);border-radius:8px;font-size:0.8em;color:#D97706;">💡 <strong>Garantia matemática:</strong> Se ' + guarantee + ' dos números sorteados estiverem entre os ' + selectedArr.length + ' selecionados, pelo menos 1 jogo terá ' + guarantee + ' acertos.</div>' +
                    (closingResult.note ? '<div style="margin-top:6px;padding:6px 10px;background:rgba(148,163,184,0.08);border-radius:8px;font-size:0.75em;color:#94A3B8;">ℹ️ ' + closingResult.note + '</div>' : '');
                    this.gamesContainer.parentNode.insertBefore(banner, this.gamesContainer);

                    // ★ V4.0: Scroll automático para os resultados
                    banner.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // v3.0: Painel Aposte Online
                    if (typeof this._insertCaixaPanel === 'function') {
                        this._insertCaixaPanel(closingResult.games, this.currentGameKey);
                    }
                  } catch (closingErr) {
                    console.error('[ClosingEngine] ERRO FATAL:', closingErr);
                    this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;background:rgba(239,68,68,0.1);border:1px solid #EF444440;border-radius:12px;padding:20px;">❌ Erro no Fechamento: ' + closingErr.message + '<br><small>Verifique o console (F12) para detalhes.<br>Tente recarregar com Ctrl+Shift+R</small></div>';
                  }
                }, 50);

                if (this.checkSummaryContainer) this.checkSummaryContainer.style.display = 'none';
                return;
            }

            // ━━ MODO PADRÃO (CombinationEngine) ━━
            // ── LIMPEZA COMPLETA antes de renderizar (FIX: painéis do QUANTUM anterior) ──
            const _cgParent = this.gamesContainer.parentNode;
            if (_cgParent) {
                _cgParent.querySelectorAll('.generation-feedback, .smart-analysis-panel, .smart-gen-analysis').forEach(el => el.remove());
                const _oldCaixaP = document.getElementById('caixa-panel');
                if (_oldCaixaP) _oldCaixaP.remove();
            }

            try {
                if (typeof CombinationEngine === 'undefined') {
                    this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;">❌ Motor de Combinação (CombinationEngine) não carregado.<br><small>Recarregue a página com Ctrl+Shift+R</small></div>';
                    return;
                }
                const result = CombinationEngine.generate(
                    this.currentGameKey,
                    closingVal,
                    parseInt(this.gamesQuantityInput.value),
                    Array.from(this.selectedNumbers),
                    Array.from(this.fixedNumbers)
                );
                this.renderGames(result, this.currentGameKey);
            if (this.checkSummaryContainer) this.checkSummaryContainer.style.display = 'none';

            // Info se o motor expandiu automaticamente o pool
            const qtdSolicitada = parseInt(this.gamesQuantityInput.value);
            if (result.games.length < qtdSolicitada) {
                console.log(`[B2B] ℹ️ Gerados ${result.games.length}/${qtdSolicitada} jogos (pool auto-expandido)`);
            }

            // Painel de análise inteligente
            if (result.smartAnalysis) {
                const sa = result.smartAnalysis;
                const allNums = new Set();
                result.games.forEach(g => g.forEach(n => allNums.add(n)));

                let html = `
                    <div class="smart-gen-analysis" style="margin-top:8px;margin-bottom:8px;padding:10px 14px;border-radius:10px;background:linear-gradient(145deg,rgba(16,185,129,0.08),rgba(15,23,42,0.95));border:1px solid #10B98130;">
                        <div style="color:#10B981;font-weight:700;font-size:0.85rem;margin-bottom:6px;">🧠 Motor ${sa.engineVersion || 'v4.0'}</div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:0.68rem;">
                            <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:6px;">
                                <span style="color:#94A3B8;">Sorteios</span><br>
                                <span style="color:#E2E8F0;font-weight:700;">${sa.historySize}</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:6px;">
                                <span style="color:#94A3B8;">Candidatos</span><br>
                                <span style="color:#E2E8F0;font-weight:700;">${sa.candidatesGenerated || '—'}</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:6px;">
                                <span style="color:#94A3B8;">Score médio</span><br>
                                <span style="color:#10B981;font-weight:700;">${sa.avgScore || '—'}</span>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:0.68rem;margin-top:4px;">
                            <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:6px;">
                                <span style="color:#94A3B8;">Soma esperada</span><br>
                                <span style="color:#E2E8F0;font-weight:600;">${sa.sumRange || '—'}</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:6px;">
                                <span style="color:#94A3B8;">Par/Ímpar</span><br>
                                <span style="color:#E2E8F0;font-weight:600;">${sa.parImparRatio || '—'}</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.04);padding:4px 6px;border-radius:6px;">
                                <span style="color:#94A3B8;">Nº Únicos</span><br>
                                <span style="color:#E2E8F0;font-weight:700;">${allNums.size}</span>
                            </div>
                        </div>`;
                
                if (sa.pairsUsed && sa.pairsUsed.length > 0) {
                    html += `<div style="margin-top:6px;font-size:0.68rem;">
                        <span style="color:#F59E0B;font-weight:600;">🔗 Duplas:</span>
                        <span style="color:#CBD5E1;">${sa.pairsUsed.join(' | ')}</span>
                    </div>`;
                }
                if (sa.triosUsed && sa.triosUsed.length > 0) {
                    html += `<div style="margin-top:3px;font-size:0.68rem;">
                        <span style="color:#8B5CF6;font-weight:600;">🔺 Trios:</span>
                        <span style="color:#CBD5E1;">${sa.triosUsed.join(' | ')}</span>
                    </div>`;
                }

                // Padrões Ocultos
                let hasPatterns = false;
                let patternHtml = '<div style="margin-top:6px;padding:6px 8px;border-radius:6px;background:rgba(139,92,246,0.08);border:1px solid #8B5CF620;">';
                patternHtml += '<div style="color:#A78BFA;font-weight:700;font-size:0.72rem;margin-bottom:4px;">🔍 Padrões Ocultos Detectados</div>';

                if (sa.cycleNumbers && sa.cycleNumbers.length > 0) {
                    hasPatterns = true;
                    patternHtml += `<div style="font-size:0.66rem;margin-top:2px;">
                        <span style="color:#F59E0B;">⏰ Ciclos:</span>
                        <span style="color:#CBD5E1;">${sa.cycleNumbers.join(', ')}</span>
                    </div>`;
                }
                if (sa.mirrorsDetected && sa.mirrorsDetected.length > 0) {
                    hasPatterns = true;
                    patternHtml += `<div style="font-size:0.66rem;margin-top:2px;">
                        <span style="color:#EC4899;">🪞 Espelhos:</span>
                        <span style="color:#CBD5E1;">${sa.mirrorsDetected.join(', ')}</span>
                    </div>`;
                }
                if (sa.fibonacciRatio) {
                    hasPatterns = true;
                    patternHtml += `<div style="font-size:0.66rem;margin-top:2px;">
                        <span style="color:#14B8A6;">🌀 Fibonacci:</span>
                        <span style="color:#CBD5E1;">${sa.fibonacciRatio} dos gaps</span>
                    </div>`;
                }
                if (sa.sumModPatterns && sa.sumModPatterns.length > 0) {
                    hasPatterns = true;
                    patternHtml += `<div style="font-size:0.66rem;margin-top:2px;">
                        <span style="color:#6366F1;">🔢 Soma mod:</span>
                        <span style="color:#CBD5E1;">${sa.sumModPatterns.join(', ')}</span>
                    </div>`;
                }
                if (sa.delayedNumbers && sa.delayedNumbers.length > 0) {
                    hasPatterns = true;
                    patternHtml += `<div style="font-size:0.66rem;margin-top:2px;">
                        <span style="color:#EF4444;">⏳ Atrasados:</span>
                        <span style="color:#CBD5E1;">${sa.delayedNumbers.join(', ')}</span>
                    </div>`;
                }

                patternHtml += '</div>';
                if (hasPatterns) html += patternHtml;

                html += `</div>`;

                const analysisDiv = document.createElement('div');
                analysisDiv.innerHTML = html;
                this.gamesContainer.parentNode.insertBefore(analysisDiv.firstElementChild, this.gamesContainer);
            }

            // ── BOTÃO APOSTE ONLINE — TODAS AS LOTERIAS ──
            this._insertCaixaPanel(result.games, this.currentGameKey);

            // Feedback
            const feedback = document.createElement('div');
            feedback.style.color = '#10B981';
            feedback.style.textAlign = 'center';
            feedback.style.padding = '10px';
            feedback.style.fontWeight = 'bold';
            feedback.textContent = `🧠 ${result.games.length} jogos inteligentes gerados!`;
            feedback.classList.add('generation-feedback');
            feedback.style.marginTop = '10px';
            feedback.style.marginBottom = '10px';
            if (this.gamesContainer.parentNode) {
                this.gamesContainer.parentNode.insertBefore(feedback, this.gamesContainer);
            }
            feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (combErr) {
                console.error('[CombEngine] ERRO:', combErr);
                this.gamesContainer.innerHTML = '<div class="empty-state" style="color:#EF4444;background:rgba(239,68,68,0.1);border:1px solid #EF444440;border-radius:12px;padding:20px;">❌ Erro na Geração: ' + combErr.message + '<br><small>Verifique o console (F12) para detalhes.<br>Tente recarregar com Ctrl+Shift+R</small></div>';
            }
        };

        // Generate (IA Smart Bets)
        if (this.generateSmartBtn) {
            this.generateSmartBtn.onclick = () => this.runSmartGeneration();

            // ── ADICIONAR TOGGLE MODO PRECISÃO ──
            const actionRow = document.getElementById('action-buttons-row');
            const precisionLabel = document.createElement('label');
            precisionLabel.id = 'precision-mode-label';
            precisionLabel.className = 'action-btn';
            precisionLabel.style.cssText = 'cursor:pointer; background: linear-gradient(135deg, #F59E0B, #D97706); box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35); white-space: nowrap; flex: 1; min-width: 0; display: none;';
            precisionLabel.innerHTML = `<input type="checkbox" id="precision-mode-toggle" style="accent-color:#FFD700;width:16px;height:16px;cursor:pointer;"> 🎯 Precisão`;
            if (actionRow) {
                actionRow.appendChild(precisionLabel);
            } else {
                this.generateSmartBtn.parentNode.appendChild(precisionLabel);
            }

            // ── LINHA SEPARADA: Pool de Precisão (aparece ABAIXO dos botões) ──
            const precisionPoolRow = document.createElement('div');
            precisionPoolRow.id = 'precision-pool-row';
            precisionPoolRow.style.cssText = 'display:none; align-items:center; gap:10px; margin-top:8px; padding:10px 14px; background:linear-gradient(145deg,rgba(245,158,11,0.08),rgba(15,23,42,0.95)); border:1px solid rgba(245,158,11,0.3); border-radius:10px;';
            precisionPoolRow.innerHTML = `
                <span style="color:#F59E0B;font-size:0.85rem;font-weight:700;white-space:nowrap;">🎯 Pool de Precisão:</span>
                <input type="number" id="precision-pool-size" min="7" max="60" value="20" 
                    style="width:70px;padding:6px 8px;border-radius:8px;border:1px solid rgba(255,215,0,0.5);background:rgba(0,0,0,0.4);color:#FFD700;font-weight:800;font-size:0.95rem;text-align:center;outline:none;height:36px;"
                >
                <span id="precision-pool-info" style="color:#94A3B8;font-size:0.75rem;flex:1;">números no pool</span>
            `;
            // Inserir abaixo do action-buttons-row (dentro do mesmo container)
            if (actionRow && actionRow.parentNode) {
                actionRow.parentNode.insertBefore(precisionPoolRow, actionRow.nextSibling);
            } else if (this.generateSmartBtn && this.generateSmartBtn.parentNode) {
                this.generateSmartBtn.parentNode.appendChild(precisionPoolRow);
            }

            // Lógica para toggle visual + mostrar/esconder pool row
            const toggle = precisionLabel.querySelector('#precision-mode-toggle');
            toggle.onchange = () => {
                if (toggle.checked) {
                    precisionLabel.style.background = 'linear-gradient(135deg, #FFD700, #F59E0B)';
                    precisionLabel.style.color = '#000';
                    precisionLabel.style.boxShadow = '0 6px 25px rgba(255, 215, 0, 0.5)';
                    precisionPoolRow.style.display = 'flex';
                    // Atualizar min/max baseado na loteria atual
                    this._updatePrecisionPoolLimits();
                } else {
                    precisionLabel.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
                    precisionLabel.style.color = '#fff';
                    precisionLabel.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.35)';
                    precisionPoolRow.style.display = 'none';
                }
            };
        }

        this.copyBtn.onclick = () => this.copyGames();
        this.saveBtn.onclick = () => this.saveGames();

        // Atualizar custo em tempo real ao mudar quantidade de jogos
        this.gamesQuantityInput.addEventListener('input', () => this.updateCurrentCostDisplay());

        // Atualizar custo ao mudar nº por jogo IA
        if (this.smartDrawSizeSelect) {
            this.smartDrawSizeSelect.addEventListener('change', () => this.updateCurrentCostDisplay());
        }

        this.checkBtn.onclick = () => this.openCheckModal();
        this.playCaixaBtn.onclick = () => this.openCaixa();

        // Individual Game Copy (Delegation)
        this.gamesContainer.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.copy-single-btn');
            if (copyBtn) {
                const text = copyBtn.dataset.numbers;
                this.copyToClipboard(text).then(success => {
                    if (success === true) {
                        const original = copyBtn.innerHTML;
                        copyBtn.innerHTML = '✅';
                        setTimeout(() => copyBtn.innerHTML = original, 1000);
                    }
                });
            }
        });

        // Check Modal Events
        if (this.confirmCheckBtn) this.confirmCheckBtn.onclick = () => this.confirmCheck();
        if (this.closeCheckModalBtn) this.closeCheckModalBtn.onclick = () => this.closeCheckModal();

        // Print Button
        const btnPrint = document.getElementById('btn-print');
        if (btnPrint) {
            btnPrint.onclick = () => window.print();
        }

        // Stats Range Toggles
        this.statsButtons.forEach(btn => {
            btn.onclick = () => {
                this.currentStatsRange = parseInt(btn.dataset.range);

                // Update active class
                this.statsButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.updateStats();
            };
        });

        // Clean Header for Print (Remove "B2B Loterias" from browser header, keep Date/Time)
        window.addEventListener('beforeprint', () => {
            document.title = '\u200B'; // Zero-width space to prevent filename fallback
            this.insertPrintTimestamp();
        });

        // Initialize Modules
        this.initTutorialEvents();
        this.initInstallEvents();
        this.initQuantum();
        this.initCopyEvents();
        this.initShareEvents();
        this.initStatisticsPanel();
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
        // WhatsApp removed as per user request
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
        const game = GAMES[gameKey];
        if (!game) {
            console.error(`Game data not found for key: ${gameKey}`);
            return;
        }

        this.updateTheme(game.color);
        this.updateCountdown(gameKey);

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
        this._rebuildClosingDropdown(gameKey);

        // ━━ EVENTO: Preview do Fechamento em tempo real ━━
        this.closingSelect.onchange = () => this._updateClosingPreview();

        this.maxSelectionElem.textContent = game.maxBet;
        this.selectedNumbers.clear();
        this.fixedNumbers.clear();
        this.isFixedMode = false;
        this.btnFixedMode.classList.remove('active');
        this.btnFixedMode.textContent = '📌 Fixar';
        this.fixedInfoPanel.style.display = 'none';

        // Mostrar toggle Modo Precisão APENAS para Lotofácil
        const precisionEl = document.getElementById('precision-mode-label');
        if (precisionEl) {
            // ★ v7.0: Botão Precisão visível para TODAS as loterias
            precisionEl.style.display = 'flex';
            // ★ v9.0: Atualizar limites do pool para a loteria selecionada
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

        this.gamesContainer.innerHTML = '<div class="empty-state">Selecione as opções e clique em Gerar Jogos</div>';
    }

    // ╔══════════════════════════════════════════════════════════╗
    // ║  ATUALIZAR SELECT DE NÚMEROS POR JOGO IA              ║
    // ╚══════════════════════════════════════════════════════════╝
    updateSmartDrawSizeSelect(gameKey, game) {
        if (!this.smartDrawSizeSelect) return;

        this.smartDrawSizeSelect.innerHTML = '';
        const min = game.minBet;
        // Limitar max a algo razoável para o select (ex: Mega Sena não precisa até 60)
        const maxDisplay = Math.min(game.maxBet, min + 14); // Até 15 opções
        
        for (let i = min; i <= maxDisplay; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i + ' núm.';
            if (i === min) opt.textContent += ' ★'; // Marcar padrão
            this.smartDrawSizeSelect.appendChild(opt);
        }

        // Se max for maior que maxDisplay, adicionar como última opção
        if (game.maxBet > maxDisplay) {
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
        this.btnFixedMode.classList.remove('active');
        this.btnFixedMode.textContent = '📌 Fixar';
        this.fixedInfoPanel.style.display = 'none';

        const selected = this.gridContainer.querySelectorAll('.selected, .fixed');
        selected.forEach(el => {
            el.classList.remove('selected');
            el.classList.remove('fixed');
        });
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
    }

    updateCurrentCostDisplay() {
        const game = GAMES[this.currentGameKey];
        const qty = parseInt(this.gamesQuantityInput.value) || 10;

        // Calcular preço por jogo baseado no número de números selecionados
        let pricePerGame = game.price;
        const smartDrawSize = this.smartDrawSizeSelect 
            ? parseInt(this.smartDrawSizeSelect.value) || game.minBet
            : game.minBet;

        // Se o jogador escolheu mais números que o mínimo, calcular combinações
        if (smartDrawSize > game.minBet) {
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
    _rebuildClosingDropdown(gameKey) {
        if (!gameKey) gameKey = this.currentGameKey;
        const game = GAMES[gameKey];
        if (!game || !this.closingSelect) return;

        const fixedCount = this.fixedNumbers ? this.fixedNumbers.size : 0;
        const savedValue = this.closingSelect.value;

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

        // v3.2 FIX: Se não há valor salvo ou o salvo não existe, usar 'generate' como padrão
        const savedOption = Array.from(this.closingSelect.options).find(o => o.value === savedValue);
        if (savedOption && savedValue !== '') {
            this.closingSelect.value = savedValue;
        } else {
            this.closingSelect.value = 'generate';
        }
        this._updateClosingPreview();
    }

    updateInvestmentPanel() {
        const count = this.selectedNumbers.size;
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
        const stats = StatsService.getStats(this.currentGameKey, this.currentStatsRange);
        this.renderStats(stats);

        const recents = StatsService.getRecentResults(this.currentGameKey, 5);
        this.renderRecentResults(recents);

        // ── Painel de Frequência Multi-Faixa ──
        this.renderFrequencyPanel();
    }

    renderRecentResults(recents) {
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

        // Container scrollável quando há muitos números
        const listStyle = 'display:flex;flex-wrap:wrap;gap:8px;max-height:260px;overflow-y:auto;padding:4px 2px;';
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
        const topN = Math.min(10, Math.ceil((game.range[1] - game.range[0] + 1) * 0.15));
        const topNDisplay = Math.max(5, topN);

        // Verificar se temos dados
        const history = StatsService.historyStore[this.currentGameKey];
        if (!history || history.length === 0) {
            container.innerHTML = '<div class="freq-loading"><span class="freq-spinner"></span>Aguardando dados da API da Caixa...</div>';
            // Tentar novamente em 2s
            setTimeout(() => this.renderFrequencyPanel(), 2000);
            return;
        }

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

    renderGames(result, gameKey, updateHash = true) {
        this.currentGeneratedGames = result.games || [];
        this.gamesContainer.innerHTML = '';
        this.gamesContainer.dataset.gameKey = gameKey;

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
            result.games.forEach((gameNumbers, index) => {
                const nums = gameNumbers.map(n => {
                    const padded = n.toString().padStart(2, '0');
                    if (hasFixed && fixedSet.has(n)) {
                        return `<div class="ball fixed" style="border-color:#F59E0B;color:#F59E0B;text-shadow:0 0 6px rgba(245,158,11,0.4);font-weight:900">${padded}</div>`;
                    }
                    return `<div class="ball">${padded}</div>`;
                }).join('');
                chunks.push(`<div class="game-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px"><div class="game-index-badge" style="position:static">Jogo ${index + 1}</div></div><div class="game-numbers-wrapper">${nums}</div></div>`);
            });
            this.gamesContainer.innerHTML = chunks.join('');
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

            const indexBadge = document.createElement('div');
            indexBadge.className = 'game-index-badge';
            indexBadge.style.position = 'static'; // Override absolutism
            indexBadge.textContent = `Jogo ${index + 1}`;
            header.appendChild(indexBadge);

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
                // Sem jogos — abrir direto o site da Caixa
                window.open(caixaUrl, '_blank');
            }
            return;
        }

        // ══════ DESKTOP: Fluxo de script (Console F12) ══════
        if (games.length > 0 && cfg) {
            const freshScript = this._generateCaixaScript_LEGACY(cfg, games);

            try {
                await navigator.clipboard.writeText(freshScript);
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

            alert('✅ ' + games.length + ' jogos de ' + cfg.name + ' copiados!\n\n' +
                'O site da Caixa abrirá em ' + cfg.name + '.\n' +
                'No site: pressione F12 → Console → Ctrl+V → Enter\n\n' +
                'Os jogos serão preenchidos automaticamente!');
        } else {
            alert('Atenção: Nenhum jogo foi gerado para copiar.\nO site da Caixa abrirá em ' + (cfg ? cfg.name : 'Loterias Online') + '.');
        }

        setTimeout(() => {
            window.open(caixaUrl, '_blank');
        }, 200);
    }

    getSelectedNumbers() {
        return Array.from(this.selectedNumbers);
    }

    // ═══════════════════════════════════════════════════════════════
    // 💾 SALVAR JOGOS — Direto na Área de Trabalho
    //    Pasta: Desktop/loterias jogos salvos/<Nome da Loteria>/
    //    Handle persistido em IndexedDB para salvar sem diálogo
    // ═══════════════════════════════════════════════════════════════

    async _openSaveDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('B2B_SaveDir', 1);
            req.onupgradeneeded = () => req.result.createObjectStore('handles');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async _getSavedDirHandle() {
        try {
            const db = await this._openSaveDB();
            return new Promise((resolve) => {
                const tx = db.transaction('handles', 'readonly');
                const store = tx.objectStore('handles');
                const req = store.get('rootDir');
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch { return null; }
    }

    async _persistDirHandle(handle) {
        try {
            const db = await this._openSaveDB();
            const tx = db.transaction('handles', 'readwrite');
            tx.objectStore('handles').put(handle, 'rootDir');
        } catch (e) {
            console.warn('[Save] Não foi possível persistir o handle:', e);
        }
    }

    async saveGames() {
        if (!this.currentGeneratedGames || this.currentGeneratedGames.length === 0) {
            alert('Gere jogos primeiro antes de salvar.');
            return;
        }

        const gameName = GAMES[this.currentGameKey]?.name || 'Loteria';
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
        const fileName = `${gameName}_${dateStr}_${timeStr}.txt`;

        let content = `═══════════════════════════════════════\n`;
        content += `  JOGOS — ${gameName.toUpperCase()}\n`;
        content += `  Data: ${now.toLocaleString('pt-BR')}\n`;
        content += `  Total de Jogos: ${this.currentGeneratedGames.length}\n`;
        content += `═══════════════════════════════════════\n\n`;

        this.currentGeneratedGames.forEach((game, index) => {
            content += `Jogo ${String(index + 1).padStart(3, '0')}: ${game.map(n => n.toString().padStart(2, '0')).join(' - ')}\n`;
        });

        content += `\n═══════════════════════════════════════\n`;
        content += `  B2B Loterias — Boa Sorte! 🍀\n`;
        content += `═══════════════════════════════════════\n`;

        // ══════ MÉTODO 1: File System Access API (Chrome/Edge) ══════
        if ('showDirectoryPicker' in window) {
            try {
                let rootHandle = await this._getSavedDirHandle();

                // Verificar se o handle salvo ainda tem permissão
                if (rootHandle) {
                    const perm = await rootHandle.queryPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') {
                        const reqPerm = await rootHandle.requestPermission({ mode: 'readwrite' });
                        if (reqPerm !== 'granted') rootHandle = null;
                    }
                }

                // Se não tem handle, pedir ao usuário para escolher a pasta
                if (!rootHandle) {
                    alert(
                        '📁 PRIMEIRA VEZ — Selecione a pasta de destino\n\n' +
                        'Recomendado: Área de Trabalho → "loterias jogos salvos"\n\n' +
                        'Se a pasta não existir, crie-a antes.\n' +
                        'Nas próximas vezes, o salvamento será automático!'
                    );
                    rootHandle = await window.showDirectoryPicker({
                        id: 'b2b-loterias-save',
                        mode: 'readwrite',
                        startIn: 'desktop'
                    });
                    // Persistir para próximas vezes
                    await this._persistDirHandle(rootHandle);
                }

                // Criar/acessar subpasta com o nome da loteria
                const subFolderName = gameName;
                const subDir = await rootHandle.getDirectoryHandle(subFolderName, { create: true });

                // Criar o arquivo na subpasta
                const fileHandle = await subDir.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(content);
                await writable.close();

                // Feedback visual no botão
                const btn = this.saveBtn;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '✅ Salvo!';
                btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
                btn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.style.transform = '';
                }, 2500);

                console.log(`[B2B] ✅ Salvo: ${subFolderName}/${fileName}`);
                return;

            } catch (err) {
                if (err.name === 'AbortError') return; // Usuário cancelou
                console.error('[Save] Erro File System API:', err);
                // Fallback para download clássico
            }
        }

        // ══════ MÉTODO 2: Download Clássico (fallback) ══════
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Feedback visual
        const btn = this.saveBtn;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '✅ Baixado!';
        btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
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
            this.inputCheckNumbers.title = `Último Concurso: ${recent.drawNumber}`;
        }

        this.inputCheckNumbers.focus();
    }

    closeCheckModal() {
        this.checkModal.style.display = 'none';
        // Remove highlights on close? Maybe not, user might want to see.
    }

    confirmCheck() {
        const input = this.inputCheckNumbers.value.trim();
        const game = GAMES[this.currentGameKey];

        let targetNumbers = [];
        let drawInfo = "Manual";

        // Check if input is a Draw Number (single integer, reasonable size e.g. > 100) or Manual List
        const isDrawNumber = /^\d+$/.test(input) && !input.includes(' ') && !input.includes(',');

        if (isDrawNumber) {
            const drawNum = parseInt(input);
            const result = StatsService.getResultByDrawNumber(this.currentGameKey, drawNum);

            if (result) {
                targetNumbers = result.numbers;
                drawInfo = `Concurso ${result.drawNumber}`;
            } else {
                // Fallback or Alert? User implies they want to check against "results that have value".
                // Since we mock, we can generate a consistent random result for this ID if not in history?
                // For now, let's just use what we have or alert.
                // Actually, simulating a draw for this ID is better to satisfy user expectation.
                // (Using simple hash or random for now)
                // alert(`Concurso ${drawNum} não encontrado na base simulada.`);
                // return;

                // Simulating for the requested ID if not found (better UX for demo)
                targetNumbers = StatsService.simulateDraw(game);
                drawInfo = `Concurso ${drawNum} (Simulado)`;
            }
        } else {
            targetNumbers = input.split(/[\s,-]+/).map(n => parseInt(n)).filter(n => !isNaN(n));
            if (targetNumbers.length < game.draw) {
                alert(`Por favor, insira o Número do Concurso OU pelo menos ${game.draw} números.`);
                return;
            }
        }

        const file = this.loadGamesInput.files[0];
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
                    setTimeout(() => this.highlightResults(targetNumbers, drawInfo), 100);
                } else {
                    alert('Erro ao ler jogos do arquivo.');
                }
            };
            reader.readAsText(file);
        } else {
            // Check Current
            if (!this.currentGeneratedGames || this.currentGeneratedGames.length === 0) {
                alert('Nenhum jogo carregado para conferir.');
                return;
            }
            this.closeCheckModal();
            this.highlightResults(targetNumbers, drawInfo);
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

    highlightResults(drawnNumbers, drawInfo = "") {
        const drawnSet = new Set(drawnNumbers);
        const cards = document.querySelectorAll('.game-card');
        const game = GAMES[this.currentGameKey];

        // ═══ V10: Conferência Completa — Todas as Faixas ═══
        const paidStrategies = game.strategies.filter(s => s.paid !== false);
        const awardCounts = {};
        paidStrategies.forEach(s => awardCounts[s.id] = 0);

        // Distribuição de acertos para gráfico
        const hitDistribution = {};
        let maxPossibleHits = 0;

        // V11: Coletar jogos ganhadores para exibição agrupada
        const winningGames = [];

        cards.forEach((card, index) => {
            const gameNumbers = this.currentGeneratedGames[index];
            if (!gameNumbers) return;
            let hits = 0;
            const balls = card.querySelectorAll('.ball');

            balls.forEach(ball => {
                const num = parseInt(ball.textContent);
                if (drawnSet.has(num)) {
                    ball.classList.add('hit');
                    ball.style.backgroundColor = '#22C55E';
                    ball.style.color = '#fff';
                    ball.style.borderColor = '#22C55E';
                    ball.style.boxShadow = '0 0 8px rgba(34,197,94,0.5)';
                    hits++;
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

            if (hits > maxPossibleHits) maxPossibleHits = hits;
            hitDistribution[hits] = (hitDistribution[hits] || 0) + 1;

            // Lotomania: 0 acertos também é premiado
            const hitsToCheck = (this.currentGameKey === 'lotomania' && hits === 0) ? 0 : hits;

            // V10: Encontrar TODAS as faixas premiadas que o jogo atinge
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

            // Indicador visual em cada card — V10 melhorado
            let summary = card.querySelector('.hit-summary');
            if (!summary) {
                summary = document.createElement('div');
                summary.className = 'hit-summary';
                summary.style.cssText = 'width:100%;text-align:right;font-size:0.8rem;font-weight:bold;margin-top:5px;padding:4px 6px;border-radius:6px;';
                card.appendChild(summary);
            }

            summary.innerHTML = '';
            const displayHits = (this.currentGameKey === 'lotomania' && hits === 0) ? '0 (Mania!)' : hits;

            if (matchedStrat) {
                const isJackpot = matchedStrat.match === game.draw;
                summary.style.color = isJackpot ? '#FFD700' : '#22C55E';
                summary.style.background = isJackpot ? 'rgba(255,215,0,0.08)' : 'rgba(34,197,94,0.08)';
                const prizeHint = matchedStrat.prize > 100
                    ? ` ≈ ${matchedStrat.prize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : (matchedStrat.prize > 0 ? ` ≈ R$ ${matchedStrat.prize.toFixed(2).replace('.', ',')}` : '');
                summary.innerHTML = `🏆 ${displayHits} acertos — <strong>${matchedStrat.label}</strong>${prizeHint}`;
            } else if (hits > 0) {
                summary.style.color = '#94A3B8';
                summary.style.background = 'rgba(255,255,255,0.03)';
                summary.textContent = `${hits} acerto${hits > 1 ? 's' : ''} — sem premiação nesta faixa`;
            } else {
                summary.style.color = '#475569';
                summary.style.background = '';
                summary.textContent = 'Nenhum acerto';
            }
        });

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
        summaryHTML += `</div></div>`;

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
                summaryHTML += `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:4px;background:${cardBg};border:1px solid ${cardBorder};border-radius:8px;">`;
                summaryHTML += `<span style="font-size:0.68rem;color:#94A3B8;font-weight:600;min-width:42px;">Jogo ${wg.index + 1}</span>`;
                summaryHTML += `<div style="display:flex;flex-wrap:wrap;gap:3px;flex:1;">`;
                wg.numbers.forEach(n => {
                    const isHit = drawnSet.has(n);
                    const bg = isHit ? '#22C55E' : 'rgba(255,255,255,0.06)';
                    const col = isHit ? '#fff' : '#64748b';
                    const shadow = isHit ? 'box-shadow:0 0 6px rgba(34,197,94,0.4);' : '';
                    summaryHTML += `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${bg};color:${col};font-weight:700;font-size:0.7rem;border:1px solid ${isHit ? '#22C55E' : 'rgba(255,255,255,0.1)'};${shadow}">${String(n).padStart(2,'0')}</span>`;
                });
                summaryHTML += `</div>`;
                summaryHTML += `<span style="font-size:0.68rem;font-weight:700;color:${isJP ? '#FFD700' : '#22C55E'};min-width:28px;text-align:right;">${wg.hits}/${game.draw}</span>`;
                summaryHTML += `</div>`;
            });
            summaryHTML += `</div>`;
        }

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
        if (estimatedTotal > 0) {
            summaryHTML += `<div style="margin-top:12px;padding:12px 16px;background:linear-gradient(135deg,rgba(34,197,94,0.2),rgba(16,185,129,0.1));border:2px solid #22C55E80;border-radius:12px;display:flex;justify-content:space-between;align-items:center;">`;
            summaryHTML += `<span style="color:#86efac;font-weight:700;font-size:0.88rem;">💰 Prêmio Estimado Total</span>`;
            summaryHTML += `<span style="color:#22C55E;font-weight:900;font-size:1.1rem;">${currency(estimatedTotal)}</span>`;
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

                // Precisão: ler rastreamento + fallback do checkbox
                let isPrecisao = this._lastPrecisionMode === true;
                if (!isPrecisao) {
                    const pc = document.getElementById('precision-mode-toggle');
                    if (pc && pc.checked && this._lastGenerationMode === 'quantum_l99') {
                        isPrecisao = true;
                    }
                }

                const record = {
                    lotteryKey: this.currentGameKey,
                    lotteryName: game.name,
                    concurso: concursoNum,
                    drawInfo: drawInfo,
                    data: new Date().toISOString(),
                    qtdJogos: totalJogos,
                    modoGeracao: this._lastGenerationMode || 'manual',
                    precisao: isPrecisao,
                    numPorJogo: actualDrawSize,
                    faixas: faixasDetail,
                    volantesPremiados: totalGanhos,
                    valorPremio: estimatedTotal,
                    valorInvestido: valorInvestido,
                    drawnNumbers: [...drawnNumbers]
                };
                record.pctRetorno = valorInvestido > 0 ? ((estimatedTotal - valorInvestido) / valorInvestido * 100) : 0;

                StatisticsTracker.save(record);
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

        let html = '<div class="stats-table-wrapper"><table class="stats-table"><thead><tr>';
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
        html += '<th>Valor Prêmio</th>';
        html += '<th>Investido</th>';
        html += '<th>% Retorno</th>';
        html += '<th></th>';
        html += '</tr></thead><tbody>';

        records.forEach(r => {
            const data = r.data ? new Date(r.data).toLocaleDateString('pt-BR') : '—';

            // Badge de modo
            const modoBadgeClass = {
                'quantum_l99': 'quantum',
                'gerar_jogos': 'gerar',
                'dual_2g': 'dual',
                'fechamento': 'fech',
                'manual': 'manual'
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
}

// Export removed for global script compatibility

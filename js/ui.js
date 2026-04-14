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
                        if (typeof NovaEraEngine !== 'undefined') {
                            // NOVA ERA V1: Sugestão sintética e objetiva
                            console.log('[UI] Usando NovaEraEngine.suggestNumbers para ' + this.currentGameKey);
                            suggestion = NovaEraEngine.suggestNumbers(this.currentGameKey, count);
                        } else {
                            // Fallback: motor legado
                            const history = StatsService.getRecentResults(this.currentGameKey, 100);
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
    // ║  GERAR JOGOS COM IA (SMART BETS + MODO PRECISÃO)        ║
    // ╚══════════════════════════════════════════════════════════╝
    runSmartGeneration() {
        const game = GAMES[this.currentGameKey];
        if (!game) return;

        // Verificar se Modo Precisão está ativo
        const precisionCheckbox = document.getElementById('precision-mode-toggle');
        const isPrecisionMode = precisionCheckbox && precisionCheckbox.checked;

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

        // Loading - Fase 1
        this.gamesContainer.innerHTML = `
            <div style="text-align:center;padding:30px;">
                <div style="font-size:2rem;margin-bottom:10px;">🔮</div>
                <div style="color:#8B5CF6;font-weight:700;font-size:1rem;">★ MODO DEUS — 12 Camadas de Predição</div>
                <div style="color:#94A3B8;font-size:0.85rem;margin-top:5px;">${modeLabel}</div>
                <div style="margin-top:15px;width:60%;height:4px;background:rgba(139,92,246,0.15);border-radius:4px;margin-left:auto;margin-right:auto;overflow:hidden;">
                    <div style="width:30%;height:100%;background:linear-gradient(90deg,#8B5CF6,#EC4899);border-radius:4px;animation:smartProgress 1.5s ease-in-out infinite;"></div>
                </div>
            </div>
            <style>@keyframes smartProgress{0%{width:10%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:10%;margin-left:90%}}</style>
        `;

        if (this.generateSmartBtn) {
            this.generateSmartBtn.disabled = true;
            this.generateSmartBtn.style.opacity = '0.6';
        }

        // Fase 2: Análise profunda
        setTimeout(() => {
            try { this.gamesContainer.querySelector('div > div:nth-child(3)').textContent = '★ Bayesian + Posicional + Cadeias + Momentum...'; } catch(e) {}

            // Fase 3: Geração
            setTimeout(() => {
                try { this.gamesContainer.querySelector('div > div:nth-child(3)').textContent = '★ Monte Carlo + Convergência Bayesiana → Próximo Sorteio...'; } catch(e) {}

                setTimeout(() => {
                    try {
                        let result;
                        if (isPrecisionMode && typeof SmartBetsEngine.generatePrecisionMode === 'function') {
                            // ── MODO PRECISÃO: Pool reduzido + geração sistemática ──
                            result = SmartBetsEngine.generatePrecisionMode(
                                this.currentGameKey,
                                quantity
                            );
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
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.pairsCovered || '-'}</div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Trios Top</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.triosCovered || '-'}</div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Backtest</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.backtestScore || '-'}%</div>
                                        </div>
                                        <div style="background:rgba(255,255,255,0.04);padding:6px 8px;border-radius:6px;text-align:center;">
                                            <div style="color:#94A3B8;">Nº Únicos</div>
                                            <div style="color:#E2E8F0;font-weight:700;">${analysis.uniqueNumbers || '-'}</div>
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
                        feedback.style.cssText = 'color:#8B5CF6;text-align:center;padding:10px;font-weight:bold;margin-top:10px;margin-bottom:10px;';
                        feedback.textContent = `🧠 ${result.games.length} jogos inteligentes gerados com sucesso!`;
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
    _generateBookmarklet(games) {
        const gJSON = JSON.stringify(games);
        const script = `(async()=>{var J=${gJSON};var d=ms=>new Promise(r=>setTimeout(r,ms));var C=n=>{var e=document.querySelector('#n'+String(n).padStart(2,'0'));if(e){e.click();return}var a=document.querySelectorAll('a,span,div');for(var b of a){if(b.textContent.trim()===String(n).padStart(2,'0')){b.click();return}}};var K=()=>{var b=document.querySelector('#colocarnocarrinho')||document.querySelector('[id*=carrinho]');if(b){b.click();return 1}var a=document.querySelectorAll('button');for(var x of a){if(x.textContent.toLowerCase().includes('carrinho')){x.click();return 1}}return 0};var L=()=>{var b=document.querySelector('#limparvolante')||document.querySelector('[id*=limpar]');if(b)b.click();else{var a=document.querySelectorAll('button');for(var x of a){if(x.textContent.toLowerCase().includes('limpar')){x.click();break}}}};for(var i=0;i<J.length;i++){if(i>0){L();await d(500)}for(var n of J[i]){C(n);await d(150)}await d(800);K();await d(3000)}alert('Pronto! '+J.length+' jogos no carrinho! Finalize o pagamento.')})()`;
        return 'javascript:' + encodeURIComponent(script);
    }


    // Gera script de automacao para o site da Caixa
    _generateCaixaScript_LEGACY(config, games) {
        const gamesJSON = JSON.stringify(games);
        const lName = config.name;
        return '(async function(){var JOGOS=' + gamesJSON + ';var TOTAL=JOGOS.length;var OK=0;var ERROS=0;console.clear();console.log("B2B v3 "+TOTAL+" jogos de ' + lName + '");var delay=function(ms){return new Promise(function(r){setTimeout(r,ms)})};function clicarNumero(num){var p=String(num).padStart(2,"0");var el=document.getElementById("n"+p);if(el){el.click();return true}el=document.querySelector("a#n"+p);if(el){el.click();return true}var todos=document.querySelectorAll(".numbers li,.numbers a,.numero,.dezena,[class*=number] li,[class*=number] a,li a");for(var i=0;i<todos.length;i++){var t=todos[i].textContent.trim();if(t===p||t===String(num)){todos[i].click();return true}}var all=document.querySelectorAll("a,span,li");for(var j=0;j<all.length;j++){if(all[j].children.length===0&&all[j].textContent.trim()===p){all[j].click();return true}}console.warn("Num "+p+" nao achado");return false}function limpar(){var btn=document.getElementById("limparvolante");if(btn){btn.click();return}btn=document.querySelector("[id*=limpar]");if(btn){btn.click();return}var bs=document.querySelectorAll("button,a,span");for(var i=0;i<bs.length;i++){if(bs[i].textContent.toLowerCase().includes("limpar")){bs[i].click();return}}}async function carrinho(){for(var t=0;t<3;t++){var btn=document.getElementById("colocarnocarrinho");if(!btn)btn=document.querySelector("[id*=colocarnocarrinho]");if(!btn)btn=document.querySelector("[id*=carrinho]");if(btn&&btn.textContent&&!btn.textContent.toLowerCase().includes("ir para")){btn.click();await delay(800);return true}var bs=document.querySelectorAll("button,a");for(var i=0;i<bs.length;i++){var tx=bs[i].textContent.toLowerCase();if(tx.includes("colocar no carrinho")||(tx.includes("carrinho")&&!tx.includes("ir para"))){bs[i].click();await delay(800);return true}}console.warn("Tent "+(t+1)+"/3");await delay(2000)}return false}for(var i=0;i<TOTAL;i++){var jogo=JOGOS[i];console.log("Jogo "+(i+1)+"/"+TOTAL+" ["+jogo.join(", ")+"]");if(i>0){limpar();await delay(1500)}var ac=0;for(var n=0;n<jogo.length;n++){if(clicarNumero(jogo[n]))ac++;await delay(300)}if(ac<jogo.length)console.warn("Jogo "+(i+1)+": "+ac+"/"+jogo.length);await delay(1500);var ok=await carrinho();if(ok){OK++;console.log("OK Jogo "+(i+1)+" ("+OK+"/"+TOTAL+")")}else{ERROS++;console.error("FALHOU Jogo "+(i+1))}if(i<TOTAL-1)await delay(4000);if((i+1)%10===0)console.log("Progresso "+(i+1)+"/"+TOTAL+" ("+Math.round((i+1)/TOTAL*100)+"%)")}console.log("PRONTO! "+OK+"/"+TOTAL+" jogos de ' + lName + ' no carrinho!");alert("Pronto! "+OK+"/"+TOTAL+" jogos de ' + lName + '!"+(ERROS>0?"\\n"+ERROS+" com erro.":"")+"\\nFinalize o pagamento.")})()';
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

    _insertCaixaPanel(games, gameKey) {
        if (!games || games.length === 0) return;

        // Salvar referência dos jogos mais recentes
        this._lastGeneratedGames = games;
        this._lastGameKey = gameKey;

        const allConfigs = this._getCaixaLotteryConfig();
        const lotteryConfig = allConfigs[gameKey];
        if (!lotteryConfig) return;

        // Remover painel anterior
        var oldPanel = document.getElementById('caixa-panel');
        if (oldPanel) oldPanel.remove();

        var _self = this;
        var _cp = document.createElement('div');
        _cp.id = 'caixa-panel';
        _cp.style.cssText = 'margin:16px 0;text-align:center;';

        // Botão principal
        var _btn = document.createElement('button');
        _btn.id = 'btn-aposte-online';
        _btn.style.cssText = 'width:100%;background:linear-gradient(135deg,#0066CC,#003D80);color:white;border:none;padding:18px 28px;border-radius:14px;font-size:1.1rem;font-weight:900;cursor:pointer;box-shadow:0 6px 20px rgba(0,102,204,0.4);transition:all 0.3s ease;letter-spacing:0.3px;';
        _btn.textContent = '\u{1F3E6} APOSTE ONLINE \u{2014} ' + games.length + ' jogos de ' + lotteryConfig.name;
        _btn.onmouseenter = function() { this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 8px 28px rgba(0,102,204,0.5)'; };
        _btn.onmouseleave = function() { this.style.transform = 'translateY(0)'; this.style.boxShadow = '0 6px 20px rgba(0,102,204,0.4)'; };

        // Painel de status
        var _st = document.createElement('div');
        _st.id = 'caixa-status';
        _st.style.cssText = 'display:none;margin-top:12px;padding:14px;background:linear-gradient(145deg,rgba(34,197,94,0.15),rgba(0,60,120,0.1));border:1px solid #22C55E50;border-radius:12px;';

        // Instruções
        var _info = document.createElement('div');
        _info.style.cssText = 'margin-top:8px;font-size:0.72rem;color:#94A3B8;line-height:1.5;';
        _info.innerHTML = '💡 <strong style="color:#60A5FA;">Como funciona:</strong> O script é copiado automaticamente. No site da Caixa, pressione <kbd style="background:#1E293B;padding:2px 6px;border-radius:4px;border:1px solid #475569;color:#E2E8F0;font-size:0.7rem;">F12</kbd> → aba <strong>Console</strong> → cole com <kbd style="background:#1E293B;padding:2px 6px;border-radius:4px;border:1px solid #475569;color:#E2E8F0;font-size:0.7rem;">Ctrl+V</kbd> → pressione <kbd style="background:#1E293B;padding:2px 6px;border-radius:4px;border:1px solid #475569;color:#E2E8F0;font-size:0.7rem;">Enter</kbd>';

        _cp.appendChild(_btn);
        _cp.appendChild(_st);
        _cp.appendChild(_info);

        // Inserir antes do container de jogos
        if (this.gamesContainer && this.gamesContainer.parentNode) {
            this.gamesContainer.parentNode.insertBefore(_cp, this.gamesContainer);
        }

        // Handler do botão — SEMPRE usa dados mais recentes
        _btn.addEventListener('click', async function() {
            // Pegar os jogos mais recentes (prioridade: _lastGeneratedGames > currentGeneratedGames)
            var currentGames = _self._lastGeneratedGames || _self.currentGeneratedGames || games;
            var currentKey = _self._lastGameKey || gameKey;
            console.log('[B2B] Enviando ' + currentGames.length + ' jogos para ' + currentKey);
            var cfg = allConfigs[currentKey] || lotteryConfig;
            var freshUrl = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/' + cfg.url;
            var freshScript = _self._generateCaixaScript_LEGACY(cfg, currentGames);

            // COPIAR PRIMEIRO, ABRIR DEPOIS
            try {
                await navigator.clipboard.writeText(freshScript);
                console.log('[B2B] ✅ ' + currentGames.length + ' jogos de ' + cfg.name + ' copiados com sucesso!');
            } catch(e) {
                // Fallback: textarea escondido
                var ta = document.createElement('textarea');
                ta.value = freshScript;
                ta.style.cssText = 'position:fixed;left:-9999px;';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                console.log('[B2B] ✅ ' + currentGames.length + ' jogos copiados (fallback)');
            }

            // Extensão Chrome (se instalada)
            document.dispatchEvent(new CustomEvent('b2b-aposte-online', {
                detail: { games: currentGames, config: cfg }
            }));

            // Abrir site da Caixa na loteria correta
            setTimeout(function() {
                if (!window._b2bExtensionOpened) window.open(freshUrl, '_blank');
            }, 300);

            // Atualizar status visual
            _st.style.display = 'block';
            _st.innerHTML = '<div style="color:#22C55E;font-weight:800;font-size:1.1rem;margin-bottom:8px;">\u2705 ' + currentGames.length + ' jogos de ' + cfg.name + ' copiados!</div>' +
                '<div style="color:#E2E8F0;font-size:0.88rem;">Site da Caixa abrindo em <strong>' + cfg.name + '</strong>... cole com <strong>Ctrl+V</strong> no Console (F12).</div>';
            _btn.style.background = 'linear-gradient(135deg,#059669,#047857)';
            _btn.textContent = '\u2705 ' + currentGames.length + ' JOGOS DE ' + cfg.name.toUpperCase() + ' COPIADOS — Cole no Console (F12)';

            // Permitir clicar novamente após 3 segundos
            setTimeout(function() {
                _btn.style.background = 'linear-gradient(135deg,#0066CC,#003D80)';
                _btn.textContent = '\u{1F3E6} APOSTE ONLINE \u{2014} ' + currentGames.length + ' jogos de ' + cfg.name;
            }, 5000);
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
    _generateCaixaScript(config, games) {
        const gamesJSON = JSON.stringify(games);
        return `
// ╔══════════════════════════════════════════════════════════════╗
// ║  B2B Loterias — Script de Aposta Automática                  ║
// ║  ${config.name}: ${games.length} jogos                                     ║
// ║  Gerado pelo MODO DEUS+ — 12 Camadas de Predição            ║
// ╚══════════════════════════════════════════════════════════════╝
(async function() {
    const JOGOS = ${gamesJSON};
    const DELAY_ENTRE_JOGOS = 3000; // 3 segundos entre jogos
    const DELAY_ENTRE_CLIQUES = 150; // 150ms entre cliques de números

    console.log('🏦 B2B Loterias — Iniciando ${games.length} jogos de ${config.name}...');

    // Função para aguardar
    const delay = ms => new Promise(r => setTimeout(r, ms));

    // Função para clicar em um número
    function clicarNumero(num) {
        const id = 'n' + String(num).padStart(2, '0');
        const el = document.querySelector('#' + id) || document.querySelector('a#' + id);
        if (el) {
            el.click();
            return true;
        }
        // Tentativa alternativa: buscar por texto
        const allNums = document.querySelectorAll('.number, .dezena, .num, [class*="number"]');
        for (const btn of allNums) {
            if (btn.textContent.trim() === String(num).padStart(2, '0') || btn.textContent.trim() === String(num)) {
                btn.click();
                return true;
            }
        }
        console.warn('⚠️ Número ' + num + ' não encontrado (id: ' + id + ')');
        return false;
    }

    // Função para clicar no botão "Colocar no Carrinho"
    function colocarNoCarrinho() {
        const btn = document.querySelector('#colocarnocarrinho') || 
                    document.querySelector('button#colocarnocarrinho') ||
                    document.querySelector('[id*="carrinho"]') ||
                    document.querySelector('button[class*="carrinho"]');
        if (btn) {
            btn.click();
            return true;
        }
        // Buscar por texto
        const allBtns = document.querySelectorAll('button');
        for (const b of allBtns) {
            const txt = b.textContent.toLowerCase();
            if (txt.includes('carrinho') || txt.includes('adicionar') || txt.includes('colocar')) {
                b.click();
                return true;
            }
        }
        console.warn('⚠️ Botão "Colocar no Carrinho" não encontrado');
        return false;
    }

    // Função para limpar o volante
    function limparVolante() {
        const btn = document.querySelector('#limparvolante') || 
                    document.querySelector('button#limparvolante') ||
                    document.querySelector('[id*="limpar"]');
        if (btn) {
            btn.click();
            return true;
        }
        const allBtns = document.querySelectorAll('button');
        for (const b of allBtns) {
            if (b.textContent.toLowerCase().includes('limpar')) {
                b.click();
                return true;
            }
        }
        return false;
    }

    // Processar cada jogo
    for (let i = 0; i < JOGOS.length; i++) {
        const jogo = JOGOS[i];
        console.log('🎯 Jogo ' + (i + 1) + '/' + JOGOS.length + ': [' + jogo.join(', ') + ']');

        // Limpar seleção anterior (exceto no primeiro jogo)
        if (i > 0) {
            limparVolante();
            await delay(500);
        }

        // Clicar em cada número do jogo
        for (const num of jogo) {
            clicarNumero(num);
            await delay(DELAY_ENTRE_CLIQUES);
        }

        // Aguardar um pouco para a seleção ser processada
        await delay(800);

        // Colocar no carrinho
        const ok = colocarNoCarrinho();
        if (ok) {
            console.log('✅ Jogo ' + (i + 1) + ' adicionado ao carrinho!');
        } else {
            console.error('❌ Falha ao adicionar jogo ' + (i + 1) + ' ao carrinho. Adicione manualmente.');
        }

        // Aguardar entre jogos
        if (i < JOGOS.length - 1) {
            console.log('⏳ Aguardando ' + (DELAY_ENTRE_JOGOS/1000) + 's para o próximo jogo...');
            await delay(DELAY_ENTRE_JOGOS);
        }
    }

    console.log('');
    console.log('🏆 ═══════════════════════════════════════════════════');
    console.log('🏆  CONCLUÍDO! ' + JOGOS.length + ' jogos de ${config.name} no carrinho!');
    console.log('🏆  Agora finalize o pagamento manualmente.');
    console.log('🏆 ═══════════════════════════════════════════════════');
    alert('✅ ' + JOGOS.length + ' jogos de ${config.name} foram adicionados ao carrinho!\\n\\nFinalize o pagamento manualmente.');
})();
`.trim();
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

        // Generate (Fechamento) — Motor Inteligente v3
        this.generateBtn.onclick = () => {
            const result = CombinationEngine.generate(
                this.currentGameKey,
                this.closingSelect.value,
                parseInt(this.gamesQuantityInput.value),
                Array.from(this.selectedNumbers),
                Array.from(this.fixedNumbers)
            );
            this.renderGames(result, this.currentGameKey);
            if (this.checkSummaryContainer) this.checkSummaryContainer.style.display = 'none';

            // Aviso se gerou menos jogos do que solicitado
            const qtdSolicitada = parseInt(this.gamesQuantityInput.value);
            if (result.games.length < qtdSolicitada) {
                const game = GAMES[this.currentGameKey];
                const minNums = game ? game.drawSize : '?';
                alert('⚠️ Você solicitou ' + qtdSolicitada + ' jogos mas só foi possível gerar ' + result.games.length + '.\n\n' +
                    '💡 Motivo: Com ' + this.selectedNumbers.size + ' números selecionados, existem poucas combinações possíveis.\n\n' +
                    '✅ Solução: Selecione MAIS números (pelo menos ' + (parseInt(minNums) + 3) + '+) para gerar mais jogos.\n' +
                    'Ou use "Gerar com IA" que seleciona automaticamente os melhores números.');
            }

            // Limpar feedback/análise anterior
            const oldFeedback = this.gamesContainer.parentNode.querySelector('.generation-feedback');
            if (oldFeedback) oldFeedback.remove();
            const oldAnalysis = this.gamesContainer.parentNode.querySelector('.smart-gen-analysis');
            if (oldAnalysis) oldAnalysis.remove();
            const oldCaixaBtn = document.getElementById('caixa-panel');
            if (oldCaixaBtn) oldCaixaBtn.remove();

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
        };

        // Generate (IA Smart Bets)
        if (this.generateSmartBtn) {
            this.generateSmartBtn.onclick = () => this.runSmartGeneration();

            // ── ADICIONAR TOGGLE MODO PRECISÃO (só Lotofácil) ──
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

            // Lógica para toggle visual (classe active)
            const toggle = precisionLabel.querySelector('#precision-mode-toggle');
            toggle.onchange = () => {
                if (toggle.checked) {
                    precisionLabel.style.background = 'linear-gradient(135deg, #FFD700, #F59E0B)';
                    precisionLabel.style.color = '#000';
                    precisionLabel.style.boxShadow = '0 6px 25px rgba(255, 215, 0, 0.5)';
                } else {
                    precisionLabel.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
                    precisionLabel.style.color = '#fff';
                    precisionLabel.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.35)';
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

        this.closingSelect.innerHTML = '';
        game.strategies.forEach(strat => {
            const option = document.createElement('option');
            option.value = strat.match;
            option.textContent = strat.label;
            this.closingSelect.appendChild(option);
        });

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
            precisionEl.style.display = gameKey === 'lotofacil' ? 'flex' : 'none';
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

        // Se existem jogos gerados, copiar script e abrir com automação
        const games = this._lastGeneratedGames || this.currentGeneratedGames || [];
        if (games.length > 0 && cfg) {
            const freshScript = this._generateCaixaScript_LEGACY(cfg, games);

            // Copiar script para clipboard
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

            // Extensão Chrome
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

        // Abrir site da Caixa na loteria correta
        setTimeout(() => {
            window.open(caixaUrl, '_blank');
        }, 200);
    }

    getSelectedNumbers() {
        return Array.from(this.selectedNumbers);
    }

    async saveGames() {
        if (!this.currentGeneratedGames || this.currentGeneratedGames.length === 0) {
            alert('Gere jogos primeiro antes de salvar.');
            return;
        }

        let content = `JOGOS - ${GAMES[this.currentGameKey].name.toUpperCase()}\n`;
        content += `Data: ${new Date().toLocaleString()}\n`;
        content += `Total de Jogos: ${this.currentGeneratedGames.length}\n\n`;

        this.currentGeneratedGames.forEach((game, index) => {
            content += `Jogo ${index + 1}: ${game.map(n => n.toString().padStart(2, '0')).join(' - ')}\n`;
        });

        const fileName = `jogos_${this.currentGameKey}_${new Date().getTime()}.txt`;

        // Modern File System Access API
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Arquivo de Texto',
                        accept: { 'text/plain': ['.txt'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
                alert('Arquivo salvo com sucesso!');
                return;
            } catch (err) {
                if (err.name === 'AbortError') return; // User cancelled
                console.error('Erro ao usar showSaveFilePicker:', err);
                // Fallback to classic download
            }
        }

        // Classic Fallback
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert(`Arquivo salvo em Downloads!\n\nSalvo como: ${fileName}`);
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

        // Inicializar contadores apenas para faixas com prêmio pago
        const paidStrategies = game.strategies.filter(s => s.paid !== false);
        const awardCounts = {};
        paidStrategies.forEach(s => awardCounts[s.id] = 0);

        cards.forEach((card, index) => {
            const gameNumbers = this.currentGeneratedGames[index];
            let hits = 0;
            const balls = card.querySelectorAll('.ball');

            balls.forEach(ball => {
                const num = parseInt(ball.textContent);
                if (drawnSet.has(num)) {
                    ball.classList.add('hit');
                    ball.style.backgroundColor = '#22C55E';
                    ball.style.color = '#fff';
                    ball.style.borderColor = '#22C55E';
                    hits++;
                } else {
                    if (!ball.classList.contains('fixed')) {
                        ball.style.backgroundColor = '';
                        ball.style.color = '';
                        ball.style.borderColor = '';
                        ball.classList.remove('hit');
                    }
                }
            });

            // Lotomania: 0 acertos também é premiado
            const hitsToCheck = (this.currentGameKey === 'lotomania' && hits === 0) ? 0 : hits;

            // Encontrar a faixa premiada correspondente
            const matchedStrat = game.strategies.find(s => s.match === hitsToCheck && s.paid !== false);

            if (matchedStrat) {
                awardCounts[matchedStrat.id]++;
            }

            // Indicador visual em cada card
            let summary = card.querySelector('.hit-summary');
            if (!summary) {
                summary = document.createElement('div');
                summary.className = 'hit-summary';
                summary.style.cssText = 'width:100%;text-align:right;font-size:0.8rem;font-weight:bold;margin-top:5px;padding:3px 0;';
                card.appendChild(summary);
            }

            summary.innerHTML = '';

            // Lotomania: mostrar 0 hits como ganho especial
            const displayHits = (this.currentGameKey === 'lotomania' && hits === 0) ? '0 (Mania!)' : hits;

            if (matchedStrat) {
                // É uma faixa premiada
                const isJackpot = matchedStrat.match === game.draw;
                summary.style.color = isJackpot ? '#FFD700' : '#22C55E';
                const prizeHint = matchedStrat.prize > 100
                    ? ` — aprox. ${matchedStrat.prize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    : (matchedStrat.prize > 0 ? ` — R$ ${matchedStrat.prize.toFixed(2).replace('.', ',')}` : '');
                summary.innerHTML = `🏆 ${displayHits} acertos — <strong>${matchedStrat.label}</strong>${prizeHint}`;
            } else if (hits > 0) {
                // Acertou alguns, mas não é faixa premiada
                summary.style.color = '#94A3B8';
                summary.textContent = `${hits} acerto${hits > 1 ? 's' : ''} — sem premiação`;
            } else {
                summary.style.color = '#475569';
                summary.textContent = 'Sem acertos';
            }
        });

        // ── RESUMO DA CONFERÊNCIA ────────────────────────────────────────────
        const currency = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const totalJogos = this.currentGeneratedGames.length;
        const totalGanhos = Object.values(awardCounts).reduce((s, v) => s + v, 0);

        let summaryHTML = `<div style="font-family:'Outfit','Inter',sans-serif;">`;
        summaryHTML += `<h4 style="margin:0 0 10px;color:var(--primary-accent);font-size:0.95rem;">📋 Conferência${drawInfo ? ' — ' + drawInfo : ''}</h4>`;

        // Linha de resumo geral
        summaryHTML += `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">`;
        summaryHTML += `<div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:6px 12px;font-size:0.82rem;"><strong>${totalJogos}</strong> jogo${totalJogos > 1 ? 's' : ''} conferidos</div>`;
        if (totalGanhos > 0) {
            summaryHTML += `<div style="background:rgba(34,197,94,0.15);border:1px solid #22C55E50;border-radius:8px;padding:6px 12px;color:#22C55E;font-size:0.82rem;font-weight:700;">🏆 ${totalGanhos} prêmio${totalGanhos > 1 ? 's' : ''} ganho${totalGanhos > 1 ? 's' : ''}!</div>`;
        } else {
            summaryHTML += `<div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 12px;color:#94A3B8;font-size:0.82rem;">Nenhuma faixa premiada desta vez</div>`;
        }
        summaryHTML += `</div>`;

        // Tabela de faixas premiadas
        summaryHTML += `<div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Faixas de premiação — ${game.name}</div>`;
        summaryHTML += `<div style="display:flex;flex-direction:column;gap:4px;">`;

        let estimatedTotal = 0;
        paidStrategies.forEach(strat => {
            const count = awardCounts[strat.id] || 0;
            const isJackpot = strat.match === game.draw;
            const prizeValue = strat.prize || 0;
            const subtotal = count * prizeValue;
            if (count > 0) estimatedTotal += subtotal;

            const rowBg = count > 0
                ? (isJackpot ? 'rgba(255,215,0,0.15)' : 'rgba(34,197,94,0.12)')
                : 'rgba(255,255,255,0.03)';
            const borderCol = count > 0
                ? (isJackpot ? '#FFD70060' : '#22C55E50')
                : 'rgba(255,255,255,0.05)';
            const textCol = count > 0
                ? (isJackpot ? '#FFD700' : '#22C55E')
                : '#475569';

            // Formatar prêmio
            let prizeStr;
            if (isJackpot) {
                prizeStr = `~${currency(prizeValue)} (acumulado)`;
            } else if (prizeValue >= 1) {
                prizeStr = currency(prizeValue);
            } else if (prizeValue > 0) {
                prizeStr = `R$ ${prizeValue.toFixed(2).replace('.', ',')}`;
            } else {
                prizeStr = 'Simulado';
            }

            summaryHTML += `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 12px;background:${rowBg};border:1px solid ${borderCol};border-radius:8px;">`;
            summaryHTML += `<div style="display:flex;align-items:center;gap:8px;">`;
            summaryHTML += `<span style="font-size:0.85rem;">${count > 0 ? (isJackpot ? '🥇' : '✅') : '◻️'}</span>`;
            summaryHTML += `<div>`;
            summaryHTML += `<div style="font-size:0.82rem;font-weight:${count > 0 ? '700' : '400'};color:${count > 0 ? '#f1f5f9' : '#475569'};">${strat.label}</div>`;
            summaryHTML += `<div style="font-size:0.68rem;color:#64748b;">${strat.match === 0 ? 'Acertar NENHUM número' : strat.match + ' acertos necessários'} · ${prizeStr}/jogo</div>`;
            summaryHTML += `</div></div>`;
            summaryHTML += `<div style="text-align:right;">`;
            summaryHTML += `<div style="font-size:0.88rem;font-weight:800;color:${textCol};">${count > 0 ? count + 'x' : '—'}</div>`;
            if (count > 0 && prizeValue > 0) {
                summaryHTML += `<div style="font-size:0.68rem;color:${textCol};opacity:0.8;">≈ ${currency(subtotal)}</div>`;
            }
            summaryHTML += `</div></div>`;
        });

        summaryHTML += `</div>`;

        // Total estimado
        if (estimatedTotal > 0) {
            summaryHTML += `<div style="margin-top:10px;padding:10px 14px;background:linear-gradient(135deg,rgba(34,197,94,0.2),rgba(16,185,129,0.1));border:2px solid #22C55E80;border-radius:10px;display:flex;justify-content:space-between;align-items:center;">`;
            summaryHTML += `<span style="color:#86efac;font-weight:700;font-size:0.85rem;">💰 Prêmio Estimado Total</span>`;
            summaryHTML += `<span style="color:#22C55E;font-weight:800;font-size:1rem;">${currency(estimatedTotal)}</span>`;
            summaryHTML += `</div>`;
        }

        summaryHTML += `<div style="margin-top:8px;font-size:0.62rem;color:#475569;">⚠️ Valores são estimativas baseadas nas faixas fixas/referência. O prêmio real pode variar pelo rateio oficial da Caixa.</div>`;
        summaryHTML += `</div>`;

        if (this.checkSummaryContainer) {
            this.checkSummaryContainer.innerHTML = summaryHTML;
            this.checkSummaryContainer.style.display = 'block';
            this.checkSummaryContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
}

// Export removed for global script compatibility

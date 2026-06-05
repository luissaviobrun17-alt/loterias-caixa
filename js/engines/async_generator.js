/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ASYNC GENERATOR v1.0 — Motor de Geração Assíncrona com Progresso     ║
 * ║                                                                        ║
 * ║  PROBLEMA: Gerar 5.000–50.000 jogos de uma vez bloqueia a thread      ║
 * ║  principal do navegador, causando "Página sem resposta".               ║
 * ║                                                                        ║
 * ║  SOLUÇÃO: Quebrar a geração em chunks (lotes) com setTimeout(0)       ║
 * ║  entre cada lote, permitindo que o navegador processe eventos de UI,  ║
 * ║  repinte a tela e mantenha a responsividade.                          ║
 * ║                                                                        ║
 * ║  FEATURES:                                                             ║
 * ║  • Overlay de progresso premium com glassmorphism                     ║
 * ║  • Barra de progresso animada com porcentagem                         ║
 * ║  • Contador de jogos gerados em tempo real                            ║
 * ║  • Estimativa de tempo restante                                       ║
 * ║  • Botão de cancelamento                                              ║
 * ║  • Funciona com TODOS os motores existentes                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class AsyncGenerator {

    // ═══════════════════════════════════════════════════════════
    //  CONFIGURAÇÃO
    // ═══════════════════════════════════════════════════════════

    static CHUNK_SIZE = 200;          // Jogos por lote (ajustável por loteria)
    static MIN_ASYNC_THRESHOLD = 200; // Quantidade mínima para ativar modo assíncrono
    static _overlay = null;
    static _cancelled = false;
    static _isRunning = false;

    // Chunk sizes otimizados por loteria (maiores loterias = chunks menores)
    static CHUNK_SIZES = {
        megasena:    250,
        lotofacil:   150,  // 15 números por jogo = mais pesado
        quina:       250,
        duplasena:   250,
        lotomania:   80,   // 50 números por jogo = MUITO pesado
        timemania:   200,
        diadesorte:  250
    };

    // ═══════════════════════════════════════════════════════════
    //  OVERLAY DE PROGRESSO — UI Premium
    // ═══════════════════════════════════════════════════════════

    static _createOverlay() {
        if (this._overlay) this._removeOverlay();

        const overlay = document.createElement('div');
        overlay.id = 'async-gen-overlay';
        overlay.innerHTML = `
            <div class="async-gen-modal">
                <div class="async-gen-header">
                    <div class="async-gen-pulse"></div>
                    <span class="async-gen-title">⚡ Gerando Jogos</span>
                </div>
                
                <div class="async-gen-lottery-name" id="async-gen-lottery"></div>
                
                <div class="async-gen-stats">
                    <div class="async-gen-stat">
                        <span class="async-gen-stat-value" id="async-gen-count">0</span>
                        <span class="async-gen-stat-label">Jogos Gerados</span>
                    </div>
                    <div class="async-gen-stat">
                        <span class="async-gen-stat-value" id="async-gen-total">0</span>
                        <span class="async-gen-stat-label">Total Solicitado</span>
                    </div>
                    <div class="async-gen-stat">
                        <span class="async-gen-stat-value" id="async-gen-eta">--</span>
                        <span class="async-gen-stat-label">Tempo Restante</span>
                    </div>
                </div>

                <div class="async-gen-progress-container">
                    <div class="async-gen-progress-track">
                        <div class="async-gen-progress-fill" id="async-gen-bar"></div>
                        <div class="async-gen-progress-glow" id="async-gen-glow"></div>
                    </div>
                    <div class="async-gen-progress-text">
                        <span id="async-gen-pct">0%</span>
                        <span id="async-gen-elapsed">0.0s</span>
                    </div>
                </div>

                <div class="async-gen-phase" id="async-gen-phase">Preparando motor de geração...</div>

                <button class="async-gen-cancel" id="async-gen-cancel-btn">✕ Cancelar</button>
            </div>
        `;

        // Injetar estilos (apenas uma vez)
        if (!document.getElementById('async-gen-styles')) {
            const style = document.createElement('style');
            style.id = 'async-gen-styles';
            style.textContent = `
                #async-gen-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: asyncFadeIn 0.3s ease;
                }
                @keyframes asyncFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .async-gen-modal {
                    background: linear-gradient(165deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 20px;
                    padding: 32px 36px;
                    min-width: 380px;
                    max-width: 440px;
                    box-shadow: 
                        0 25px 60px rgba(0, 0, 0, 0.6),
                        0 0 40px rgba(16, 185, 129, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                    animation: asyncSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes asyncSlideUp {
                    from { transform: translateY(30px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .async-gen-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }
                .async-gen-pulse {
                    width: 12px; height: 12px;
                    border-radius: 50%;
                    background: #10B981;
                    box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
                    animation: asyncPulse 1.5s ease-in-out infinite;
                }
                @keyframes asyncPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.7; }
                }
                .async-gen-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #E2E8F0;
                    letter-spacing: 0.5px;
                }
                .async-gen-lottery-name {
                    font-size: 0.8rem;
                    color: #10B981;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 20px;
                }
                .async-gen-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .async-gen-stat {
                    text-align: center;
                    padding: 12px 8px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    border: 1px solid rgba(16, 185, 129, 0.15);
                }
                .async-gen-stat-value {
                    display: block;
                    font-size: 1.4rem;
                    font-weight: 900;
                    color: #10B981;
                    font-family: 'Inter', monospace;
                    line-height: 1.2;
                }
                .async-gen-stat-label {
                    display: block;
                    font-size: 0.6rem;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-top: 4px;
                    font-weight: 600;
                }
                .async-gen-progress-container {
                    margin-bottom: 16px;
                }
                .async-gen-progress-track {
                    width: 100%;
                    height: 10px;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 5px;
                    overflow: hidden;
                    position: relative;
                    border: 1px solid rgba(16, 185, 129, 0.1);
                }
                .async-gen-progress-fill {
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, #059669, #10B981, #34D399);
                    border-radius: 5px;
                    transition: width 0.3s ease;
                    position: relative;
                    z-index: 2;
                }
                .async-gen-progress-glow {
                    position: absolute;
                    top: 0; left: 0;
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.4), transparent);
                    border-radius: 5px;
                    animation: asyncGlow 2s ease-in-out infinite;
                    z-index: 1;
                }
                @keyframes asyncGlow {
                    0% { opacity: 0.3; }
                    50% { opacity: 1; }
                    100% { opacity: 0.3; }
                }
                .async-gen-progress-text {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }
                #async-gen-pct {
                    color: #10B981;
                }
                #async-gen-elapsed {
                    color: #64748B;
                }
                .async-gen-phase {
                    text-align: center;
                    font-size: 0.75rem;
                    color: #94A3B8;
                    margin-bottom: 20px;
                    min-height: 18px;
                    font-style: italic;
                }
                .async-gen-cancel {
                    width: 100%;
                    padding: 10px 20px;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    background: rgba(239, 68, 68, 0.1);
                    color: #F87171;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 0.5px;
                }
                .async-gen-cancel:hover {
                    background: rgba(239, 68, 68, 0.25);
                    border-color: #EF4444;
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
                }
                /* Responsive */
                @media (max-width: 480px) {
                    .async-gen-modal {
                        min-width: 300px;
                        max-width: 90vw;
                        padding: 24px 20px;
                    }
                    .async-gen-stat-value { font-size: 1.1rem; }
                    .async-gen-stats { gap: 8px; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(overlay);
        this._overlay = overlay;

        // Botão cancelar
        document.getElementById('async-gen-cancel-btn').onclick = () => {
            this._cancelled = true;
        };
    }

    static _updateOverlay(current, total, startTime, phase) {
        if (!this._overlay) return;

        const pct = Math.min(100, Math.round((current / total) * 100));
        const elapsed = (Date.now() - startTime) / 1000;
        
        // ETA calculation
        let eta = '--';
        if (current > 0 && pct < 100) {
            const rate = current / elapsed; // jogos por segundo
            const remaining = total - current;
            const etaSeconds = remaining / rate;
            if (etaSeconds < 60) {
                eta = Math.ceil(etaSeconds) + 's';
            } else {
                eta = Math.floor(etaSeconds / 60) + 'm ' + Math.ceil(etaSeconds % 60) + 's';
            }
        } else if (pct >= 100) {
            eta = '✓';
        }

        const countEl = document.getElementById('async-gen-count');
        const pctEl = document.getElementById('async-gen-pct');
        const barEl = document.getElementById('async-gen-bar');
        const glowEl = document.getElementById('async-gen-glow');
        const elapsedEl = document.getElementById('async-gen-elapsed');
        const etaEl = document.getElementById('async-gen-eta');
        const phaseEl = document.getElementById('async-gen-phase');

        if (countEl) countEl.textContent = current.toLocaleString('pt-BR');
        if (pctEl) pctEl.textContent = pct + '%';
        if (barEl) barEl.style.width = pct + '%';
        if (glowEl) glowEl.style.width = pct + '%';
        if (elapsedEl) elapsedEl.textContent = elapsed.toFixed(1) + 's';
        if (etaEl) etaEl.textContent = eta;
        if (phaseEl && phase) phaseEl.textContent = phase;
    }

    static _removeOverlay() {
        if (this._overlay) {
            this._overlay.style.animation = 'asyncFadeIn 0.2s ease reverse';
            setTimeout(() => {
                if (this._overlay && this._overlay.parentNode) {
                    this._overlay.parentNode.removeChild(this._overlay);
                }
                this._overlay = null;
            }, 200);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO ASSÍNCRONA DO MOTOR MANUAL
    // ═══════════════════════════════════════════════════════════

    static async generateManualAsync(gameKey, pool, fixedNumbers, numGames, drawSize, callback) {
        if (this._isRunning) return;
        this._isRunning = true;
        this._cancelled = false;

        const chunkSize = this.CHUNK_SIZES[gameKey] || this.CHUNK_SIZE;
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const lotteryName = game ? game.name : gameKey;

        // Mostrar overlay
        this._createOverlay();
        const totalEl = document.getElementById('async-gen-total');
        const lotteryEl = document.getElementById('async-gen-lottery');
        if (totalEl) totalEl.textContent = numGames.toLocaleString('pt-BR');
        if (lotteryEl) lotteryEl.textContent = lotteryName + ' — Motor Manual';

        const startTime = Date.now();

        try {
            // Verificar se o motor está disponível
            if (typeof MotorFechamentoManual === 'undefined') {
                throw new Error('MotorFechamentoManual não carregado');
            }

            // Gerar em chunks
            const allGames = [];
            let chunksProcessed = 0;
            const totalChunks = Math.ceil(numGames / chunkSize);

            for (let i = 0; i < numGames && !this._cancelled; i += chunkSize) {
                const batchSize = Math.min(chunkSize, numGames - i);
                
                // Atualizar fase
                chunksProcessed++;
                const phase = `Lote ${chunksProcessed}/${totalChunks} • ${batchSize} jogos por lote`;
                
                // Gerar o lote de forma síncrona (pequeno o suficiente para não travar)
                const result = MotorFechamentoManual.generate(gameKey, pool, fixedNumbers, batchSize, drawSize);
                
                if (result && result.games) {
                    allGames.push(...result.games);
                }

                // Atualizar progresso
                this._updateOverlay(allGames.length, numGames, startTime, phase);

                // Liberar a thread principal para o navegador processar UI
                await this._yieldToUI();
            }

            if (this._cancelled) {
                this._removeOverlay();
                this._isRunning = false;
                if (callback) callback(null, true); // cancelled = true
                return;
            }

            // Deduplicar
            const uniqueGames = this._deduplicateGames(allGames);

            // Atualizar overlay para "Finalizando"
            this._updateOverlay(uniqueGames.length, numGames, startTime, 
                `✅ Concluído! ${uniqueGames.length} jogos únicos (${(Date.now() - startTime)}ms)`);

            // Construir resultado final no formato esperado
            const analysis = {
                totalGames: uniqueGames.length,
                totalPossible: '—',
                poolSize: pool.length,
                fixedCount: (fixedNumbers || []).length,
                fixedNumbers: fixedNumbers || [],
                drawSize: drawSize,
                pricePerGame: game ? game.price : 0,
                investimento: uniqueGames.length * (game ? game.price : 0),
                isComplete: false,
                elapsed: Date.now() - startTime,
                asyncMode: true,
                chunksProcessed: chunksProcessed
            };

            const result = { games: uniqueGames, analysis };

            // Pequeno delay para o usuário ver a barra em 100%
            await new Promise(resolve => setTimeout(resolve, 500));
            this._removeOverlay();
            this._isRunning = false;

            if (callback) callback(result, false);

        } catch (error) {
            console.error('[AsyncGenerator] Erro:', error);
            this._removeOverlay();
            this._isRunning = false;
            if (callback) callback(null, false, error);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO ASSÍNCRONA DO MOTOR COBERTURA IA
    // ═══════════════════════════════════════════════════════════

    static async generateCoverageAsync(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options, callback) {
        if (this._isRunning) return;
        this._isRunning = true;
        this._cancelled = false;

        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const lotteryName = game ? game.name : gameKey;
        const chunkSize = this.CHUNK_SIZES[gameKey] || this.CHUNK_SIZE;

        // Mostrar overlay
        this._createOverlay();
        const totalEl = document.getElementById('async-gen-total');
        const lotteryEl = document.getElementById('async-gen-lottery');
        if (totalEl) totalEl.textContent = numGames.toLocaleString('pt-BR');
        if (lotteryEl) lotteryEl.textContent = lotteryName + ' — Cobertura IA';

        const startTime = Date.now();

        try {
            if (typeof SmartCoverageEngine === 'undefined') {
                throw new Error('SmartCoverageEngine não carregado');
            }

            // Para volumes grandes, dividir em lotes
            if (numGames <= this.MIN_ASYNC_THRESHOLD) {
                // Volume pequeno — executa direto (suficientemente rápido)
                this._updateOverlay(0, numGames, startTime, 'Processamento rápido...');
                await this._yieldToUI();

                const result = SmartCoverageEngine.generate(
                    gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options
                );

                this._updateOverlay(numGames, numGames, startTime, '✅ Concluído!');
                await new Promise(resolve => setTimeout(resolve, 400));
                this._removeOverlay();
                this._isRunning = false;

                if (callback) callback(result, false);
                return;
            }

            // Volume grande — dividir em chunks
            const allGames = [];
            const dedupeSet = new Set();
            let chunksProcessed = 0;
            const totalChunks = Math.ceil(numGames / chunkSize);

            for (let i = 0; i < numGames && !this._cancelled; i += chunkSize) {
                const batchSize = Math.min(chunkSize, numGames - allGames.length);
                if (batchSize <= 0) break;

                chunksProcessed++;
                const phase = `Lote ${chunksProcessed}/${totalChunks} • Motor Greedy Set Cover`;

                // Gerar lote
                let batchResult;
                try {
                    batchResult = SmartCoverageEngine.generate(
                        gameKey, batchSize, selectedNumbers, fixedNumbers, drawSize, options
                    );
                } catch (e) {
                    console.warn('[AsyncGenerator] Lote', chunksProcessed, 'falhou:', e.message);
                    batchResult = { games: [] };
                }

                if (batchResult && batchResult.games) {
                    for (const game of batchResult.games) {
                        const key = game.join(',');
                        if (!dedupeSet.has(key)) {
                            dedupeSet.add(key);
                            allGames.push(game);
                        }
                    }
                }

                this._updateOverlay(allGames.length, numGames, startTime, phase);
                await this._yieldToUI();
            }

            if (this._cancelled) {
                this._removeOverlay();
                this._isRunning = false;
                if (callback) callback(null, true);
                return;
            }

            // Resultado final
            const result = {
                games: allGames,
                pool: [...new Set(allGames.flat())].sort((a, b) => a - b),
                analysis: {
                    engine: 'CoverageEngine-Async',
                    totalGames: allGames.length,
                    elapsed: (Date.now() - startTime) + 'ms',
                    strategy: 'COVERAGE_FAST',
                    engineVersion: 'SmartCoverage-v1.1-Async',
                    asyncMode: true,
                    chunksProcessed: chunksProcessed
                }
            };

            // Calcular métricas de Hamming
            if (typeof SmartCoverageEngine !== 'undefined' && SmartCoverageEngine._calcAvgHamming) {
                result.analysis.avgHamming = SmartCoverageEngine._calcAvgHamming(allGames, drawSize);
            }

            this._updateOverlay(allGames.length, numGames, startTime, 
                `✅ Concluído! ${allGames.length} jogos únicos`);
            await new Promise(resolve => setTimeout(resolve, 500));
            this._removeOverlay();
            this._isRunning = false;

            if (callback) callback(result, false);

        } catch (error) {
            console.error('[AsyncGenerator] Erro:', error);
            this._removeOverlay();
            this._isRunning = false;
            if (callback) callback(null, false, error);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    // Liberar a thread principal para o navegador processar UI events
    static _yieldToUI() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    // Deduplicar array de jogos
    static _deduplicateGames(games) {
        const seen = new Set();
        const unique = [];
        for (const game of games) {
            const key = game.join(',');
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(game);
            }
        }
        return unique;
    }

    // Verificar se deve usar modo assíncrono
    static shouldUseAsync(numGames, gameKey) {
        // Lotomania é SEMPRE assíncrono acima de 100 jogos (50 números por jogo)
        if (gameKey === 'lotomania' && numGames > 100) return true;
        // Lotofácil é assíncrono acima de 150 (15 números por jogo)
        if (gameKey === 'lotofacil' && numGames > 150) return true;
        // Para outros, threshold padrão
        return numGames >= this.MIN_ASYNC_THRESHOLD;
    }
}

// Exportar para o escopo global
if (typeof window !== 'undefined') window.AsyncGenerator = AsyncGenerator;

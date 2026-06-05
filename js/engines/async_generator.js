/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ASYNC GENERATOR v2.0 — Gráfico de Linha Inline                       ║
 * ║                                                                        ║
 * ║  v2.0: Substituído overlay modal por gráfico de linha INLINE           ║
 * ║  que fica abaixo dos botões de geração, sem cobrir a tela.            ║
 * ║  Mostra o andamento da produção em tempo real com canvas.             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class AsyncGenerator {

    static CHUNK_SIZE = 200;
    static MIN_ASYNC_THRESHOLD = 200;
    static _cancelled = false;
    static _isRunning = false;
    static _chartData = [];
    static _chartCanvas = null;
    static _startTime = 0;

    static CHUNK_SIZES = {
        megasena:    250,
        lotofacil:   150,
        quina:       250,
        duplasena:   250,
        lotomania:   80,
        timemania:   200,
        diadesorte:  250
    };

    // ═══════════════════════════════════════════════════════════
    //  PAINEL INLINE COM GRÁFICO DE LINHA (Canvas)
    // ═══════════════════════════════════════════════════════════

    static _createInlinePanel(lotteryName, total) {
        this._removeInlinePanel();
        this._chartData = [{ time: 0, count: 0 }];
        this._startTime = Date.now();

        const container = document.getElementById('async-progress-inline');
        if (!container) return;

        container.style.display = 'block';
        container.innerHTML = `
            <div class="apg-panel">
                <div class="apg-header">
                    <div class="apg-header-left">
                        <span class="apg-pulse"></span>
                        <span class="apg-title">⚡ Gerando Jogos</span>
                        <span class="apg-lottery">${lotteryName}</span>
                    </div>
                    <div class="apg-header-right">
                        <span class="apg-pct" id="apg-pct">0%</span>
                        <button class="apg-cancel" id="apg-cancel">✕</button>
                    </div>
                </div>
                
                <div class="apg-chart-area">
                    <canvas id="apg-canvas" width="600" height="120"></canvas>
                </div>

                <div class="apg-stats-row">
                    <div class="apg-stat">
                        <span class="apg-stat-val" id="apg-count">0</span>
                        <span class="apg-stat-lbl">Gerados</span>
                    </div>
                    <div class="apg-stat">
                        <span class="apg-stat-val" id="apg-total">${total.toLocaleString('pt-BR')}</span>
                        <span class="apg-stat-lbl">Total</span>
                    </div>
                    <div class="apg-stat">
                        <span class="apg-stat-val" id="apg-speed">—</span>
                        <span class="apg-stat-lbl">Jogos/s</span>
                    </div>
                    <div class="apg-stat">
                        <span class="apg-stat-val" id="apg-eta">—</span>
                        <span class="apg-stat-lbl">Restante</span>
                    </div>
                </div>

                <div class="apg-bar-track">
                    <div class="apg-bar-fill" id="apg-bar"></div>
                </div>
            </div>
        `;

        // Injetar estilos (apenas uma vez)
        if (!document.getElementById('apg-styles')) {
            const style = document.createElement('style');
            style.id = 'apg-styles';
            style.textContent = `
                .apg-panel {
                    margin-top: 10px;
                    background: linear-gradient(165deg, rgba(15,23,42,0.98), rgba(30,41,59,0.95));
                    border: 1px solid rgba(16,185,129,0.25);
                    border-radius: 14px;
                    padding: 14px 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03);
                    animation: apgFadeIn 0.3s ease;
                }
                @keyframes apgFadeIn {
                    from { opacity: 0; max-height: 0; }
                    to { opacity: 1; max-height: 400px; }
                }
                .apg-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .apg-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .apg-header-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .apg-pulse {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: #10B981;
                    box-shadow: 0 0 8px rgba(16,185,129,0.6);
                    animation: apgPulse 1.5s ease-in-out infinite;
                    flex-shrink: 0;
                }
                @keyframes apgPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 0.6; }
                }
                .apg-title {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #E2E8F0;
                    letter-spacing: 0.3px;
                }
                .apg-lottery {
                    font-size: 0.65rem;
                    color: #10B981;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding: 2px 8px;
                    background: rgba(16,185,129,0.1);
                    border-radius: 6px;
                    border: 1px solid rgba(16,185,129,0.2);
                }
                .apg-pct {
                    font-size: 1.1rem;
                    font-weight: 900;
                    color: #10B981;
                    font-family: 'Inter', monospace;
                    min-width: 45px;
                    text-align: right;
                }
                .apg-cancel {
                    width: 24px; height: 24px;
                    border-radius: 6px;
                    border: 1px solid rgba(239,68,68,0.3);
                    background: rgba(239,68,68,0.1);
                    color: #F87171;
                    font-size: 0.7rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .apg-cancel:hover {
                    background: rgba(239,68,68,0.25);
                    border-color: #EF4444;
                }
                /* Gráfico */
                .apg-chart-area {
                    background: rgba(0,0,0,0.3);
                    border-radius: 10px;
                    padding: 8px 4px 4px;
                    margin-bottom: 10px;
                    border: 1px solid rgba(16,185,129,0.08);
                }
                #apg-canvas {
                    width: 100%;
                    height: 100px;
                    display: block;
                }
                /* Stats */
                .apg-stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-bottom: 10px;
                }
                .apg-stat {
                    text-align: center;
                    padding: 6px 4px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    border: 1px solid rgba(16,185,129,0.08);
                }
                .apg-stat-val {
                    display: block;
                    font-size: 0.95rem;
                    font-weight: 900;
                    color: #10B981;
                    font-family: 'Inter', monospace;
                    line-height: 1.2;
                }
                .apg-stat-lbl {
                    display: block;
                    font-size: 0.55rem;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-top: 2px;
                    font-weight: 700;
                }
                /* Barra de progresso */
                .apg-bar-track {
                    width: 100%;
                    height: 6px;
                    background: rgba(0,0,0,0.35);
                    border-radius: 3px;
                    overflow: hidden;
                    border: 1px solid rgba(16,185,129,0.08);
                }
                .apg-bar-fill {
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, #059669, #10B981, #34D399);
                    border-radius: 3px;
                    transition: width 0.3s ease;
                    box-shadow: 0 0 8px rgba(16,185,129,0.4);
                }
                /* Completed state */
                .apg-panel.apg-done {
                    border-color: rgba(34,197,94,0.4);
                }
                .apg-panel.apg-done .apg-pulse {
                    animation: none;
                    background: #22C55E;
                }
                /* Responsive */
                @media (max-width: 480px) {
                    .apg-panel { padding: 10px 12px; }
                    .apg-stats-row { grid-template-columns: repeat(2, 1fr); }
                    .apg-stat-val { font-size: 0.8rem; }
                    .apg-title { font-size: 0.75rem; }
                    #apg-canvas { height: 80px; }
                }
            `;
            document.head.appendChild(style);
        }

        // Setup canvas
        this._chartCanvas = document.getElementById('apg-canvas');
        if (this._chartCanvas) {
            const rect = this._chartCanvas.parentElement.getBoundingClientRect();
            this._chartCanvas.width = Math.floor(rect.width - 8) * (window.devicePixelRatio || 1);
            this._chartCanvas.height = 100 * (window.devicePixelRatio || 1);
            this._chartCanvas.style.width = (rect.width - 8) + 'px';
            this._chartCanvas.style.height = '100px';
            const ctx = this._chartCanvas.getContext('2d');
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }

        // Cancelar
        document.getElementById('apg-cancel').onclick = () => { this._cancelled = true; };
    }

    static _updateInlinePanel(current, total) {
        const elapsed = (Date.now() - this._startTime) / 1000;
        const pct = Math.min(100, Math.round((current / total) * 100));
        const speed = elapsed > 0 ? Math.round(current / elapsed) : 0;

        let eta = '—';
        if (current > 0 && pct < 100) {
            const remaining = (total - current) / (current / elapsed);
            eta = remaining < 60 ? Math.ceil(remaining) + 's' : Math.floor(remaining / 60) + 'm' + Math.ceil(remaining % 60) + 's';
        } else if (pct >= 100) {
            eta = '✓';
        }

        // Adicionar ponto ao gráfico
        this._chartData.push({ time: elapsed, count: current });

        // Atualizar texto
        const el = (id) => document.getElementById(id);
        const countEl = el('apg-count');
        const pctEl = el('apg-pct');
        const barEl = el('apg-bar');
        const speedEl = el('apg-speed');
        const etaEl = el('apg-eta');

        if (countEl) countEl.textContent = current.toLocaleString('pt-BR');
        if (pctEl) pctEl.textContent = pct + '%';
        if (barEl) barEl.style.width = pct + '%';
        if (speedEl) speedEl.textContent = speed.toLocaleString('pt-BR');
        if (etaEl) etaEl.textContent = eta;

        // Desenhar gráfico
        this._drawChart(total);
    }

    static _drawChart(total) {
        const canvas = this._chartCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const data = this._chartData;
        if (data.length < 2) return;

        ctx.clearRect(0, 0, w, h);

        const maxTime = Math.max(data[data.length - 1].time, 1);
        const padding = { left: 6, right: 6, top: 8, bottom: 18 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        // Grid horizontal
        ctx.strokeStyle = 'rgba(16,185,129,0.08)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();
        }

        // Labels do eixo Y
        ctx.fillStyle = '#475569';
        ctx.font = '9px Inter, monospace';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const val = Math.round(total - (total / 4) * i);
            const y = padding.top + (chartH / 4) * i;
            if (i === 0 || i === 4) {
                ctx.fillText(val.toLocaleString('pt-BR'), padding.left + chartW, y + 3);
            }
        }

        // Área preenchida (gradiente)
        const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        gradient.addColorStop(0, 'rgba(16,185,129,0.25)');
        gradient.addColorStop(1, 'rgba(16,185,129,0.02)');

        ctx.beginPath();
        ctx.moveTo(padding.left, h - padding.bottom);
        for (let i = 0; i < data.length; i++) {
            const x = padding.left + (data[i].time / maxTime) * chartW;
            const y = padding.top + chartH - (data[i].count / total) * chartH;
            if (i === 0) ctx.lineTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.lineTo(padding.left + (data[data.length - 1].time / maxTime) * chartW, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Linha principal
        ctx.beginPath();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        for (let i = 0; i < data.length; i++) {
            const x = padding.left + (data[i].time / maxTime) * chartW;
            const y = padding.top + chartH - (data[i].count / total) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Ponto atual (último)
        const last = data[data.length - 1];
        const lastX = padding.left + (last.time / maxTime) * chartW;
        const lastY = padding.top + chartH - (last.count / total) * chartH;

        // Glow do ponto
        ctx.beginPath();
        ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16,185,129,0.3)';
        ctx.fill();

        // Ponto sólido
        ctx.beginPath();
        ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label do tempo no eixo X
        ctx.fillStyle = '#475569';
        ctx.font = '8px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('0s', padding.left, h - 4);
        ctx.fillText(maxTime.toFixed(1) + 's', w - padding.right, h - 4);
    }

    static _completeInlinePanel(gamesCount, elapsed) {
        const panel = document.querySelector('.apg-panel');
        if (panel) panel.classList.add('apg-done');

        const pctEl = document.getElementById('apg-pct');
        if (pctEl) { pctEl.textContent = '✅'; pctEl.style.color = '#22C55E'; }

        const titleEl = document.querySelector('.apg-title');
        if (titleEl) titleEl.textContent = '✅ Concluído';

        const barEl = document.getElementById('apg-bar');
        if (barEl) { barEl.style.width = '100%'; barEl.style.background = 'linear-gradient(90deg, #059669, #22C55E)'; }

        const etaEl = document.getElementById('apg-eta');
        if (etaEl) { etaEl.textContent = '✓'; etaEl.style.color = '#22C55E'; }

        // Auto-esconder após 5 segundos
        setTimeout(() => { this._removeInlinePanel(); }, 5000);
    }

    static _removeInlinePanel() {
        const container = document.getElementById('async-progress-inline');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
        this._chartCanvas = null;
        this._chartData = [];
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

        this._createInlinePanel(lotteryName + ' — Manual', numGames);
        const startTime = Date.now();

        try {
            if (typeof MotorFechamentoManual === 'undefined') {
                throw new Error('MotorFechamentoManual não carregado');
            }

            const allGames = [];
            let chunksProcessed = 0;

            for (let i = 0; i < numGames && !this._cancelled; i += chunkSize) {
                const batchSize = Math.min(chunkSize, numGames - i);
                chunksProcessed++;

                const result = MotorFechamentoManual.generate(gameKey, pool, fixedNumbers, batchSize, drawSize);
                if (result && result.games) {
                    allGames.push(...result.games);
                }

                this._updateInlinePanel(allGames.length, numGames);
                await this._yieldToUI();
            }

            if (this._cancelled) {
                this._removeInlinePanel();
                this._isRunning = false;
                if (callback) callback(null, true);
                return;
            }

            const uniqueGames = this._deduplicateGames(allGames);
            this._updateInlinePanel(uniqueGames.length, numGames);

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

            const resultFinal = { games: uniqueGames, analysis };

            this._completeInlinePanel(uniqueGames.length, analysis.elapsed);
            this._isRunning = false;
            if (callback) callback(resultFinal, false);

        } catch (error) {
            console.error('[AsyncGenerator] Erro:', error);
            this._removeInlinePanel();
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

        this._createInlinePanel(lotteryName + ' — Cobertura IA', numGames);
        const startTime = Date.now();

        try {
            if (typeof SmartCoverageEngine === 'undefined') {
                throw new Error('SmartCoverageEngine não carregado');
            }

            if (numGames <= this.MIN_ASYNC_THRESHOLD) {
                this._updateInlinePanel(0, numGames);
                await this._yieldToUI();

                const result = SmartCoverageEngine.generate(
                    gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options
                );

                this._updateInlinePanel(numGames, numGames);
                this._completeInlinePanel(result.games.length, Date.now() - startTime);
                this._isRunning = false;
                if (callback) callback(result, false);
                return;
            }

            const allGames = [];
            const dedupeSet = new Set();
            let chunksProcessed = 0;

            for (let i = 0; i < numGames && !this._cancelled; i += chunkSize) {
                const batchSize = Math.min(chunkSize, numGames - allGames.length);
                if (batchSize <= 0) break;

                chunksProcessed++;

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
                    for (const g of batchResult.games) {
                        const key = g.join(',');
                        if (!dedupeSet.has(key)) {
                            dedupeSet.add(key);
                            allGames.push(g);
                        }
                    }
                }

                this._updateInlinePanel(allGames.length, numGames);
                await this._yieldToUI();
            }

            if (this._cancelled) {
                this._removeInlinePanel();
                this._isRunning = false;
                if (callback) callback(null, true);
                return;
            }

            const result = {
                games: allGames,
                pool: [...new Set(allGames.flat())].sort((a, b) => a - b),
                analysis: {
                    engine: 'CoverageEngine-Async',
                    totalGames: allGames.length,
                    elapsed: (Date.now() - startTime) + 'ms',
                    strategy: 'COVERAGE_FAST',
                    engineVersion: 'SmartCoverage-v2.0-Async',
                    asyncMode: true,
                    chunksProcessed: chunksProcessed
                }
            };

            if (typeof SmartCoverageEngine !== 'undefined' && SmartCoverageEngine._calcAvgHamming) {
                result.analysis.avgHamming = SmartCoverageEngine._calcAvgHamming(allGames, drawSize);
            }

            this._completeInlinePanel(allGames.length, Date.now() - startTime);
            this._isRunning = false;
            if (callback) callback(result, false);

        } catch (error) {
            console.error('[AsyncGenerator] Erro:', error);
            this._removeInlinePanel();
            this._isRunning = false;
            if (callback) callback(null, false, error);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    static _yieldToUI() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

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

    static shouldUseAsync(numGames, gameKey) {
        // v2.1: Sempre usa modo assíncrono com gráfico para QUALQUER quantidade
        return numGames >= 1;
    }
}

if (typeof window !== 'undefined') window.AsyncGenerator = AsyncGenerator;

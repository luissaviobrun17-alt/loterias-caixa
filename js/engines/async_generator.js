/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ASYNC GENERATOR v5.0 — Gráfico de Linha + Motor v4 Melhorado         ║
 * ║                                                                        ║
 * ║  v5.0: Restaura gráfico de linha Canvas inline com estatísticas        ║
 * ║  em tempo real (Gerados, Total, Jogos/s, ETA).                        ║
 * ║  Mantém lógica v4: deduplicação contínua + detecção de estagnação.    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class AsyncGenerator {

    static _cancelled = false;
    static _isRunning = false;
    static _chartData = [];
    static _chartCanvas = null;
    static _startTime = 0;

    // ═══════════════════════════════════════════════════════════
    //  PAINEL INLINE COM GRÁFICO DE LINHA (Canvas)
    // ═══════════════════════════════════════════════════════════

    static _createInlinePanel(lotteryName, total) {
        this._removeInlinePanel();
        this._chartData = [{ time: 0, count: 0 }];
        this._startTime = Date.now();
        this._cancelled = false;

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
                }
            `;
            document.head.appendChild(style);
        }

        // Configurar Canvas
        const canvas = document.getElementById('apg-canvas');
        if (canvas) {
            this._chartCanvas = canvas;
            canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
            canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
            const ctx = canvas.getContext('2d');
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
            this._drawChart(0, total);
        }

        // Botão cancelar
        document.getElementById('apg-cancel').onclick = () => { this._cancelled = true; };
    }

    // ═══════════════════════════════════════════════════════════
    //  DESENHAR GRÁFICO DE LINHA (Canvas)
    // ═══════════════════════════════════════════════════════════

    static _drawChart(current, total) {
        const canvas = this._chartCanvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const W = canvas.offsetWidth;
        const H = canvas.offsetHeight;

        ctx.clearRect(0, 0, W, H);

        // Grid de fundo
        ctx.strokeStyle = 'rgba(16,185,129,0.06)';
        ctx.lineWidth = 0.5;
        for (let y = 0; y < H; y += H / 5) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Linha guia (progresso linear ideal)
        ctx.strokeStyle = 'rgba(100,116,139,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(W, 0);
        ctx.stroke();
        ctx.setLineDash([]);

        if (this._chartData.length < 2) return;

        const maxTime = Math.max(...this._chartData.map(d => d.time), 1);
        const maxCount = Math.max(total, 1);

        // Área preenchida
        const gradient = ctx.createLinearGradient(0, H, 0, 0);
        gradient.addColorStop(0, 'rgba(16,185,129,0.02)');
        gradient.addColorStop(1, 'rgba(16,185,129,0.15)');

        ctx.beginPath();
        ctx.moveTo(0, H);
        for (const d of this._chartData) {
            const x = (d.time / maxTime) * W;
            const y = H - (d.count / maxCount) * H;
            ctx.lineTo(x, y);
        }
        ctx.lineTo((this._chartData[this._chartData.length - 1].time / maxTime) * W, H);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Linha principal
        ctx.beginPath();
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        for (let i = 0; i < this._chartData.length; i++) {
            const d = this._chartData[i];
            const x = (d.time / maxTime) * W;
            const y = H - (d.count / maxCount) * H;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Ponto atual (último)
        const last = this._chartData[this._chartData.length - 1];
        const lx = (last.time / maxTime) * W;
        const ly = H - (last.count / maxCount) * H;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lx, ly, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16,185,129,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // ═══════════════════════════════════════════════════════════
    //  ATUALIZAR PAINEL
    // ═══════════════════════════════════════════════════════════

    static _updateInlinePanel(current, total) {
        const elapsed = (Date.now() - this._startTime) / 1000;
        const pct = Math.min(100, Math.round((current / total) * 100));
        const speed = elapsed > 0 ? Math.round(current / elapsed) : 0;
        const remaining = speed > 0 ? Math.ceil((total - current) / speed) : 0;

        // Atualizar chart data
        this._chartData.push({ time: elapsed, count: current });
        // Manter máximo de 200 pontos
        if (this._chartData.length > 200) {
            this._chartData = this._chartData.filter((_, i) => i % 2 === 0 || i === this._chartData.length - 1);
        }

        // Atualizar DOM
        const pctEl = document.getElementById('apg-pct');
        if (pctEl) pctEl.textContent = pct + '%';

        const countEl = document.getElementById('apg-count');
        if (countEl) countEl.textContent = current.toLocaleString('pt-BR');

        const speedEl = document.getElementById('apg-speed');
        if (speedEl) speedEl.textContent = speed.toLocaleString('pt-BR');

        const etaEl = document.getElementById('apg-eta');
        if (etaEl) {
            if (remaining > 60) {
                etaEl.textContent = Math.ceil(remaining / 60) + 'min';
            } else if (remaining > 0) {
                etaEl.textContent = remaining + 's';
            } else {
                etaEl.textContent = '—';
            }
        }

        const barEl = document.getElementById('apg-bar');
        if (barEl) barEl.style.width = pct + '%';

        // Redesenhar gráfico
        this._drawChart(current, total);
    }

    static _completeInlinePanel(total, elapsedMs) {
        const elapsed = (elapsedMs / 1000).toFixed(1);
        const speed = Math.round(total / (elapsedMs / 1000));

        // Atualizar chart final
        this._chartData.push({ time: elapsedMs / 1000, count: total });
        this._drawChart(total, total);

        const panel = document.querySelector('.apg-panel');
        if (panel) panel.classList.add('apg-done');

        const pctEl = document.getElementById('apg-pct');
        if (pctEl) { pctEl.textContent = '✅'; pctEl.style.color = '#22C55E'; }

        const titleEl = document.querySelector('.apg-title');
        if (titleEl) titleEl.textContent = '✅ Concluído';

        const countEl = document.getElementById('apg-count');
        if (countEl) countEl.textContent = total.toLocaleString('pt-BR');

        const speedEl = document.getElementById('apg-speed');
        if (speedEl) { speedEl.textContent = speed.toLocaleString('pt-BR'); speedEl.style.color = '#22C55E'; }

        const barEl = document.getElementById('apg-bar');
        if (barEl) { barEl.style.width = '100%'; barEl.style.background = 'linear-gradient(90deg, #059669, #22C55E)'; }

        const etaEl = document.getElementById('apg-eta');
        if (etaEl) { etaEl.textContent = elapsed + 's'; etaEl.style.color = '#22C55E'; }

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
    //  GERAÇÃO MANUAL ASSÍNCRONA (v4 dedup + chart v2)
    // ═══════════════════════════════════════════════════════════

    static async generateManualAsync(gameKey, pool, fixedNumbers, numGames, drawSize, callback) {
        this._isRunning = true;
        this._cancelled = false;

        const baseChunkSize = Math.max(50, Math.min(500, Math.floor(numGames / 15)));
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const name = game ? game.name : gameKey;

        this._createInlinePanel(name + ' — Manual', numGames);
        await this._yield();

        try {
            if (typeof MotorFechamentoManual === 'undefined') throw new Error('MotorFechamentoManual não carregado');

            const uniqueGames = [];
            const globalKeys = new Set();
            let chunks = 0;
            let staleRounds = 0;
            const MAX_STALE_ROUNDS = 15;
            const MAX_CHUNKS = 80;

            while (uniqueGames.length < numGames && !this._cancelled && staleRounds < MAX_STALE_ROUNDS && chunks < MAX_CHUNKS) {
                const remaining = numGames - uniqueGames.length;
                const compensatedBatch = Math.min(
                    Math.ceil(remaining * 1.08),
                    Math.max(baseChunkSize, remaining)
                );
                const batch = Math.min(compensatedBatch, remaining + Math.ceil(remaining * 0.15));
                chunks++;

                const prevCount = uniqueGames.length;
                const r = MotorFechamentoManual.generate(gameKey, pool, fixedNumbers, batch, drawSize);

                if (r && r.games) {
                    for (const g of r.games) {
                        if (uniqueGames.length >= numGames) break;
                        const key = g.join(',');
                        if (!globalKeys.has(key)) {
                            globalKeys.add(key);
                            uniqueGames.push(g);
                        }
                    }
                }

                const added = uniqueGames.length - prevCount;
                if (added === 0) {
                    staleRounds++;
                    console.warn('[AsyncGen] Estagnação round ' + staleRounds + '/' + MAX_STALE_ROUNDS + ' — ' + uniqueGames.length + '/' + numGames + ' jogos únicos');
                } else {
                    staleRounds = 0;
                }

                this._updateInlinePanel(Math.min(uniqueGames.length, numGames), numGames);
                await this._yield();
            }

            if (this._cancelled) {
                this._isRunning = false;
                this._removeInlinePanel();
                callback(null, true);
                return;
            }

            const elapsed = Date.now() - this._startTime;
            this._completeInlinePanel(uniqueGames.length, elapsed);

            const analysis = {
                totalGames: uniqueGames.length, poolSize: pool.length,
                fixedCount: (fixedNumbers||[]).length, fixedNumbers: fixedNumbers||[],
                drawSize, pricePerGame: game?game.price:0,
                investimento: uniqueGames.length * (game?game.price:0),
                isComplete: false, elapsed,
                asyncMode: true, chunksProcessed: chunks, totalPossible: '—'
            };

            this._isRunning = false;
            setTimeout(() => callback({ games: uniqueGames, analysis }, false), 400);

        } catch (e) {
            console.error('[AsyncGen Manual]', e);
            this._isRunning = false;
            this._removeInlinePanel();
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO COBERTURA IA ASSÍNCRONA (v4 dedup + chart v2)
    // ═══════════════════════════════════════════════════════════

    static async generateCoverageAsync(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options, callback) {
        this._isRunning = true;
        this._cancelled = false;

        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const name = game ? game.name : gameKey;

        this._createInlinePanel(name + ' — Gerador Inteligente', numGames);
        await this._yield();

        try {
            if (typeof SmartCoverageEngine === 'undefined') throw new Error('SmartCoverageEngine não carregado');

            const allGames = [];
            const seen = new Set();
            let chunks = 0;
            let staleCount = 0;

            let batchSize = numGames > 1000 ? 250 : (numGames > 200 ? 100 : 50);
            const originalBatchSize = batchSize;

            while (allGames.length < numGames && !this._cancelled) {
                const remaining = numGames - allGames.length;
                const batch = Math.min(batchSize, remaining);
                chunks++;

                const prevLen = allGames.length;

                let r;
                try {
                    const batchOpts = { ...options, _excludeKeys: seen };
                    r = SmartCoverageEngine.generate(gameKey, batch, selectedNumbers, fixedNumbers, drawSize, batchOpts);
                } catch(e) {
                    r = { games: [] };
                }

                if (r && r.games) {
                    for (const g of r.games) {
                        const k = g.join(',');
                        if (!seen.has(k)) {
                            seen.add(k);
                            allGames.push(g);
                        }
                    }
                }

                if (allGames.length === prevLen) {
                    staleCount++;
                    batchSize = Math.max(10, Math.floor(batchSize * 0.7));
                    if (staleCount > 50) {
                        console.warn('[AsyncGen] Estagnação após ' + staleCount + ' tentativas em ' + allGames.length + '/' + numGames);
                        break;
                    }
                } else {
                    staleCount = 0;
                    batchSize = originalBatchSize;
                }

                this._updateInlinePanel(allGames.length, numGames);
                await this._yieldReal();
            }

            if (this._cancelled) {
                this._isRunning = false;
                this._removeInlinePanel();
                callback(null, true);
                return;
            }

            const elapsed = Date.now() - this._startTime;
            this._completeInlinePanel(allGames.length, elapsed);

            const result = {
                games: allGames,
                pool: [...new Set(allGames.flat())].sort((a,b) => a-b),
                analysis: {
                    engine: 'CoverageEngine-Async', totalGames: allGames.length,
                    elapsed: elapsed + 'ms',
                    strategy: 'COVERAGE_FAST', asyncMode: true, chunksProcessed: chunks
                }
            };

            if (typeof SmartCoverageEngine !== 'undefined' && SmartCoverageEngine._calcAvgHamming) {
                result.analysis.avgHamming = SmartCoverageEngine._calcAvgHamming(allGames, drawSize);
            }

            this._isRunning = false;
            setTimeout(() => callback(result, false), 400);

        } catch (e) {
            console.error('[AsyncGen Coverage]', e);
            this._isRunning = false;
            this._removeInlinePanel();
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    static _yield() { return new Promise(r => setTimeout(r, 0)); }
    static _yieldReal() { return new Promise(r => setTimeout(r, 8)); }

    static _dedupe(games) {
        const seen = new Set();
        return games.filter(g => { const k = g.join(','); if (seen.has(k)) return false; seen.add(k); return true; });
    }

    // Threshold: quase tudo passa por async
    static shouldUseAsync(numGames, gameKey) { return numGames >= 1; }
}

if (typeof window !== 'undefined') window.AsyncGenerator = AsyncGenerator;

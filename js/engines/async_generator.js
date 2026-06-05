/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ASYNC GENERATOR v3.0 — Barra de Progresso Simples e Direta           ║
 * ║                                                                        ║
 * ║  Mostra barra horizontal com porcentagem e contagem de jogos           ║
 * ║  diretamente na área dos jogos (games-container).                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class AsyncGenerator {

    static _cancelled = false;
    static _isRunning = false;
    static _startTime = 0;

    static CHUNK_SIZES = {
        megasena: 250, lotofacil: 150, quina: 250,
        duplasena: 250, lotomania: 80, timemania: 200, diadesorte: 250
    };

    // ═══════════════════════════════════════════════════════════
    //  BARRA DE PROGRESSO — diretamente no games-container
    // ═══════════════════════════════════════════════════════════

    static _showProgress(container, lotteryName, total) {
        this._startTime = Date.now();
        this._cancelled = false;

        // Injetar estilos uma vez
        if (!document.getElementById('apg-css')) {
            const s = document.createElement('style');
            s.id = 'apg-css';
            s.textContent = `
                .apg-box{padding:20px;text-align:center}
                .apg-label{font-size:0.8rem;color:#94A3B8;margin-bottom:6px}
                .apg-lottery-name{color:#10B981;font-weight:800;text-transform:uppercase;letter-spacing:1px;font-size:0.7rem;margin-bottom:12px}
                .apg-pct-big{font-size:2.5rem;font-weight:900;color:#10B981;font-family:'Inter',monospace;line-height:1;margin-bottom:4px;transition:color .3s}
                .apg-count-text{font-size:0.85rem;color:#CBD5E1;font-weight:700;margin-bottom:14px}
                .apg-track{width:100%;height:18px;background:rgba(0,0,0,0.4);border-radius:9px;overflow:hidden;border:1px solid rgba(16,185,129,0.15);position:relative}
                .apg-fill{height:100%;width:0%;background:linear-gradient(90deg,#059669,#10B981,#34D399);border-radius:9px;transition:width .3s ease;position:relative}
                .apg-fill::after{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);animation:apgShine 1.5s ease-in-out infinite}
                @keyframes apgShine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
                .apg-stats{display:flex;justify-content:center;gap:20px;margin-top:12px;font-size:0.72rem;color:#64748B}
                .apg-stats span{color:#10B981;font-weight:800}
                .apg-cancel-btn{margin-top:10px;padding:6px 18px;border-radius:8px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);color:#F87171;font-size:0.72rem;font-weight:700;cursor:pointer;transition:all .2s}
                .apg-cancel-btn:hover{background:rgba(239,68,68,0.2);border-color:#EF4444}
                .apg-done .apg-pct-big{color:#22C55E}
                .apg-done .apg-fill{background:linear-gradient(90deg,#059669,#22C55E)}
                .apg-done .apg-fill::after{animation:none}
            `;
            document.head.appendChild(s);
        }

        container.innerHTML = `
            <div class="apg-box" id="apg-box">
                <div class="apg-label">⚡ Gerando Jogos</div>
                <div class="apg-lottery-name">${lotteryName}</div>
                <div class="apg-pct-big" id="apg-pct">0%</div>
                <div class="apg-count-text" id="apg-count-text">0 de ${total.toLocaleString('pt-BR')} jogos</div>
                <div class="apg-track">
                    <div class="apg-fill" id="apg-fill"></div>
                </div>
                <div class="apg-stats">
                    <div>Velocidade: <span id="apg-speed">—</span> jogos/s</div>
                    <div>Restante: <span id="apg-eta">calculando...</span></div>
                </div>
                <button class="apg-cancel-btn" id="apg-cancel-btn">✕ Cancelar</button>
            </div>
        `;

        document.getElementById('apg-cancel-btn').onclick = () => { this._cancelled = true; };
    }

    static _updateProgress(current, total) {
        const elapsed = (Date.now() - this._startTime) / 1000;
        const pct = Math.min(100, Math.round((current / total) * 100));
        const speed = elapsed > 0 ? Math.round(current / elapsed) : 0;

        let eta = 'calculando...';
        if (current > 0 && pct < 100) {
            const rem = (total - current) / (current / elapsed);
            eta = rem < 60 ? Math.ceil(rem) + 's' : Math.floor(rem / 60) + 'm ' + Math.ceil(rem % 60) + 's';
        } else if (pct >= 100) {
            eta = '✓';
        }

        const pctEl = document.getElementById('apg-pct');
        const countEl = document.getElementById('apg-count-text');
        const fillEl = document.getElementById('apg-fill');
        const speedEl = document.getElementById('apg-speed');
        const etaEl = document.getElementById('apg-eta');

        if (pctEl) pctEl.textContent = pct + '%';
        if (countEl) countEl.textContent = current.toLocaleString('pt-BR') + ' de ' + total.toLocaleString('pt-BR') + ' jogos';
        if (fillEl) fillEl.style.width = pct + '%';
        if (speedEl) speedEl.textContent = speed.toLocaleString('pt-BR');
        if (etaEl) etaEl.textContent = eta;
    }

    static _completeProgress() {
        const box = document.getElementById('apg-box');
        if (box) box.classList.add('apg-done');
        const pctEl = document.getElementById('apg-pct');
        if (pctEl) pctEl.textContent = '✅ 100%';
        const fillEl = document.getElementById('apg-fill');
        if (fillEl) fillEl.style.width = '100%';
        const etaEl = document.getElementById('apg-eta');
        if (etaEl) etaEl.textContent = '✓';
        const btn = document.getElementById('apg-cancel-btn');
        if (btn) btn.style.display = 'none';
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO MANUAL ASSÍNCRONA
    // ═══════════════════════════════════════════════════════════

    static async generateManualAsync(gameKey, pool, fixedNumbers, numGames, drawSize, callback) {
        if (this._isRunning) return;
        this._isRunning = true;

        const chunkSize = this.CHUNK_SIZES[gameKey] || 200;
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const container = document.getElementById('games-container');

        this._showProgress(container, game ? game.name : gameKey, numGames);
        await this._yield();

        try {
            if (typeof MotorFechamentoManual === 'undefined') throw new Error('MotorFechamentoManual não carregado');

            const allGames = [];
            let chunks = 0;

            for (let i = 0; i < numGames && !this._cancelled; i += chunkSize) {
                const batch = Math.min(chunkSize, numGames - i);
                chunks++;
                const r = MotorFechamentoManual.generate(gameKey, pool, fixedNumbers, batch, drawSize);
                if (r && r.games) allGames.push(...r.games);
                this._updateProgress(allGames.length, numGames);
                await this._yield();
            }

            if (this._cancelled) { this._isRunning = false; callback(null, true); return; }

            const unique = this._dedupe(allGames);
            this._updateProgress(unique.length, numGames);
            this._completeProgress();

            const analysis = {
                totalGames: unique.length, poolSize: pool.length,
                fixedCount: (fixedNumbers||[]).length, fixedNumbers: fixedNumbers||[],
                drawSize, pricePerGame: game?game.price:0,
                investimento: unique.length * (game?game.price:0),
                isComplete: false, elapsed: Date.now() - this._startTime,
                asyncMode: true, chunksProcessed: chunks,
                totalPossible: '—'
            };

            this._isRunning = false;
            setTimeout(() => callback({ games: unique, analysis }, false), 800);

        } catch (e) {
            console.error('[AsyncGen]', e);
            this._isRunning = false;
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO COBERTURA IA ASSÍNCRONA
    // ═══════════════════════════════════════════════════════════

    static async generateCoverageAsync(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options, callback) {
        if (this._isRunning) return;
        this._isRunning = true;

        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const chunkSize = this.CHUNK_SIZES[gameKey] || 200;
        const container = document.getElementById('games-container');

        this._showProgress(container, game ? game.name : gameKey, numGames);
        await this._yield();

        try {
            if (typeof SmartCoverageEngine === 'undefined') throw new Error('SmartCoverageEngine não carregado');

            const allGames = [];
            const seen = new Set();
            let chunks = 0;

            for (let i = 0; i < numGames && !this._cancelled;) {
                const batch = Math.min(chunkSize, numGames - allGames.length);
                if (batch <= 0) break;
                chunks++;

                let r;
                try {
                    r = SmartCoverageEngine.generate(gameKey, batch, selectedNumbers, fixedNumbers, drawSize, options);
                } catch(e) { r = { games: [] }; }

                if (r && r.games) {
                    for (const g of r.games) {
                        const k = g.join(',');
                        if (!seen.has(k)) { seen.add(k); allGames.push(g); }
                    }
                }

                i += chunkSize;
                this._updateProgress(allGames.length, numGames);
                await this._yield();
            }

            if (this._cancelled) { this._isRunning = false; callback(null, true); return; }

            this._updateProgress(allGames.length, numGames);
            this._completeProgress();

            const result = {
                games: allGames,
                pool: [...new Set(allGames.flat())].sort((a,b) => a-b),
                analysis: {
                    engine: 'CoverageEngine-Async', totalGames: allGames.length,
                    elapsed: (Date.now() - this._startTime) + 'ms',
                    strategy: 'COVERAGE_FAST', asyncMode: true, chunksProcessed: chunks
                }
            };

            if (typeof SmartCoverageEngine !== 'undefined' && SmartCoverageEngine._calcAvgHamming) {
                result.analysis.avgHamming = SmartCoverageEngine._calcAvgHamming(allGames, drawSize);
            }

            this._isRunning = false;
            setTimeout(() => callback(result, false), 800);

        } catch (e) {
            console.error('[AsyncGen]', e);
            this._isRunning = false;
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    static _yield() { return new Promise(r => setTimeout(r, 0)); }

    static _dedupe(games) {
        const seen = new Set();
        return games.filter(g => { const k = g.join(','); if (seen.has(k)) return false; seen.add(k); return true; });
    }

    static shouldUseAsync() { return true; }
}

if (typeof window !== 'undefined') window.AsyncGenerator = AsyncGenerator;

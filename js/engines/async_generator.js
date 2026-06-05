/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ASYNC GENERATOR v3.1 — Barra Compacta + Progresso Granular           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class AsyncGenerator {

    static _cancelled = false;
    static _isRunning = false;
    static _startTime = 0;

    // Lotes PEQUENOS para progresso suave (5–20 jogos por lote)
    static CHUNK_SIZES = {
        megasena: 15, lotofacil: 8, quina: 15,
        duplasena: 15, lotomania: 5, timemania: 12, diadesorte: 15
    };

    // ═══════════════════════════════════════════════════════════
    //  BARRA COMPACTA — uma linha fina abaixo dos botões
    // ═══════════════════════════════════════════════════════════

    static _showProgress(lotteryName, total) {
        this._startTime = Date.now();
        this._cancelled = false;

        if (!document.getElementById('apg-css')) {
            const s = document.createElement('style');
            s.id = 'apg-css';
            s.textContent = `
                .apg-compact{margin-top:8px;padding:8px 12px;background:rgba(15,23,42,0.95);border:1px solid rgba(16,185,129,0.2);border-radius:8px}
                .apg-row{display:flex;align-items:center;gap:10px;margin-bottom:5px}
                .apg-dot{width:6px;height:6px;border-radius:50%;background:#10B981;box-shadow:0 0 6px rgba(16,185,129,0.5);flex-shrink:0;animation:apgBlink 1s ease-in-out infinite}
                @keyframes apgBlink{0%,100%{opacity:1}50%{opacity:.4}}
                .apg-info{font-size:0.7rem;color:#94A3B8;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .apg-info b{color:#10B981}
                .apg-pct{font-size:0.75rem;font-weight:900;color:#10B981;font-family:'Inter',monospace;min-width:32px;text-align:right}
                .apg-xbtn{background:none;border:none;color:#64748B;font-size:0.65rem;cursor:pointer;padding:0 2px;transition:color .2s}
                .apg-xbtn:hover{color:#EF4444}
                .apg-track{width:100%;height:4px;background:rgba(0,0,0,0.4);border-radius:2px;overflow:hidden}
                .apg-fill{height:100%;width:0%;background:linear-gradient(90deg,#059669,#10B981,#34D399);border-radius:2px;transition:width .15s linear}
                .apg-done .apg-dot{animation:none;background:#22C55E}
                .apg-done .apg-pct{color:#22C55E}
                .apg-done .apg-fill{background:#22C55E}
            `;
            document.head.appendChild(s);
        }

        const container = document.getElementById('async-progress-inline');
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = `
            <div class="apg-compact" id="apg-box">
                <div class="apg-row">
                    <span class="apg-dot"></span>
                    <span class="apg-info" id="apg-info">⚡ <b>${lotteryName}</b> — 0 de ${total.toLocaleString('pt-BR')} jogos</span>
                    <span class="apg-pct" id="apg-pct">0%</span>
                    <button class="apg-xbtn" id="apg-cancel" title="Cancelar">✕</button>
                </div>
                <div class="apg-track"><div class="apg-fill" id="apg-fill"></div></div>
            </div>
        `;

        document.getElementById('apg-cancel').onclick = () => { this._cancelled = true; };
    }

    static _updateProgress(current, total, lotteryName) {
        const pct = Math.min(100, Math.round((current / total) * 100));

        const pctEl = document.getElementById('apg-pct');
        const infoEl = document.getElementById('apg-info');
        const fillEl = document.getElementById('apg-fill');

        if (pctEl) pctEl.textContent = pct + '%';
        if (infoEl) infoEl.innerHTML = '⚡ <b>' + lotteryName + '</b> — ' + current.toLocaleString('pt-BR') + ' de ' + total.toLocaleString('pt-BR') + ' jogos';
        if (fillEl) fillEl.style.width = pct + '%';
    }

    static _completeProgress(total, lotteryName) {
        const box = document.getElementById('apg-box');
        if (box) box.classList.add('apg-done');
        const pctEl = document.getElementById('apg-pct');
        if (pctEl) pctEl.textContent = '✓';
        const infoEl = document.getElementById('apg-info');
        if (infoEl) infoEl.innerHTML = '✅ <b>' + lotteryName + '</b> — ' + total.toLocaleString('pt-BR') + ' jogos gerados';
        const fillEl = document.getElementById('apg-fill');
        if (fillEl) fillEl.style.width = '100%';
        const btn = document.getElementById('apg-cancel');
        if (btn) btn.style.display = 'none';

        setTimeout(() => {
            const c = document.getElementById('async-progress-inline');
            if (c) { c.style.display = 'none'; c.innerHTML = ''; }
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO MANUAL ASSÍNCRONA
    // ═══════════════════════════════════════════════════════════

    static async generateManualAsync(gameKey, pool, fixedNumbers, numGames, drawSize, callback) {
        if (this._isRunning) return;
        this._isRunning = true;

        const chunkSize = this.CHUNK_SIZES[gameKey] || 10;
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const name = game ? game.name : gameKey;

        this._showProgress(name, numGames);
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
                this._updateProgress(Math.min(allGames.length, numGames), numGames, name);
                await this._yield();
            }

            if (this._cancelled) {
                this._isRunning = false;
                const c = document.getElementById('async-progress-inline');
                if (c) { c.style.display = 'none'; c.innerHTML = ''; }
                callback(null, true);
                return;
            }

            const unique = this._dedupe(allGames);
            this._completeProgress(unique.length, name);

            const analysis = {
                totalGames: unique.length, poolSize: pool.length,
                fixedCount: (fixedNumbers||[]).length, fixedNumbers: fixedNumbers||[],
                drawSize, pricePerGame: game?game.price:0,
                investimento: unique.length * (game?game.price:0),
                isComplete: false, elapsed: Date.now() - this._startTime,
                asyncMode: true, chunksProcessed: chunks, totalPossible: '—'
            };

            this._isRunning = false;
            setTimeout(() => callback({ games: unique, analysis }, false), 600);

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
        const chunkSize = this.CHUNK_SIZES[gameKey] || 10;
        const name = game ? game.name : gameKey;

        this._showProgress(name, numGames);
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
                try { r = SmartCoverageEngine.generate(gameKey, batch, selectedNumbers, fixedNumbers, drawSize, options); }
                catch(e) { r = { games: [] }; }

                if (r && r.games) {
                    for (const g of r.games) {
                        const k = g.join(',');
                        if (!seen.has(k)) { seen.add(k); allGames.push(g); }
                    }
                }

                i += chunkSize;
                this._updateProgress(Math.min(allGames.length, numGames), numGames, name);
                await this._yield();
            }

            if (this._cancelled) {
                this._isRunning = false;
                const c = document.getElementById('async-progress-inline');
                if (c) { c.style.display = 'none'; c.innerHTML = ''; }
                callback(null, true);
                return;
            }

            this._completeProgress(allGames.length, name);

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
            setTimeout(() => callback(result, false), 600);

        } catch (e) {
            console.error('[AsyncGen]', e);
            this._isRunning = false;
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════

    static _yield() { return new Promise(r => setTimeout(r, 0)); }

    static _dedupe(games) {
        const seen = new Set();
        return games.filter(g => { const k = g.join(','); if (seen.has(k)) return false; seen.add(k); return true; });
    }

    static shouldUseAsync() { return true; }
}

if (typeof window !== 'undefined') window.AsyncGenerator = AsyncGenerator;

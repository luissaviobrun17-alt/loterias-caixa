/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ASYNC GENERATOR v5.4 — Barra de Evolução + Qualidade Preservada     ║
 * ║                                                                        ║
 * ║  Cobertura IA: gera TUDO de uma vez (Set Cover global = qualidade)    ║
 * ║  Barra aparece ANTES da geração via requestAnimationFrame.            ║
 * ║  Manual: chunks reais (motor leve, não afeta qualidade).              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class AsyncGenerator {

    static _cancelled = false;
    static _isRunning = false;
    static _startTime = 0;

    // ═══════════════════════════════════════════════════════════
    //  BARRA DE EVOLUÇÃO COMPACTA
    // ═══════════════════════════════════════════════════════════

    static _showProgress(lotteryName, total) {
        this._startTime = Date.now();
        this._cancelled = false;

        if (!document.getElementById('apg-css')) {
            const s = document.createElement('style');
            s.id = 'apg-css';
            s.textContent = `
                .apg-panel{margin-top:10px;background:linear-gradient(165deg,rgba(15,23,42,0.98),rgba(30,41,59,0.95));border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:14px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.03);animation:apgFade .3s ease}
                @keyframes apgFade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
                .apg-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
                .apg-header-left{display:flex;align-items:center;gap:8px}
                .apg-pulse{width:8px;height:8px;border-radius:50%;background:#10B981;box-shadow:0 0 8px rgba(16,185,129,0.6);animation:apgPulse 1.5s ease-in-out infinite;flex-shrink:0}
                @keyframes apgPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
                .apg-title{font-size:0.85rem;font-weight:800;color:#E2E8F0;letter-spacing:.3px}
                .apg-lottery{font-size:0.65rem;color:#10B981;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:2px 8px;background:rgba(16,185,129,0.1);border-radius:6px;border:1px solid rgba(16,185,129,0.2)}
                .apg-pct{font-size:1.1rem;font-weight:900;color:#10B981;font-family:'Inter',monospace;min-width:45px;text-align:right}
                .apg-cancel{width:24px;height:24px;border-radius:6px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.1);color:#F87171;font-size:0.7rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
                .apg-cancel:hover{background:rgba(239,68,68,0.25);border-color:#EF4444}
                .apg-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}
                .apg-stat{text-align:center;padding:6px 4px;background:rgba(0,0,0,0.2);border-radius:8px;border:1px solid rgba(16,185,129,0.08)}
                .apg-stat-val{display:block;font-size:0.95rem;font-weight:900;color:#10B981;font-family:'Inter',monospace;line-height:1.2}
                .apg-stat-lbl{display:block;font-size:0.55rem;color:#475569;text-transform:uppercase;letter-spacing:.8px;margin-top:2px;font-weight:700}
                .apg-bar-track{width:100%;height:8px;background:rgba(0,0,0,0.35);border-radius:4px;overflow:hidden;border:1px solid rgba(16,185,129,0.08)}
                .apg-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#059669,#10B981,#34D399);border-radius:4px;transition:width .3s ease;box-shadow:0 0 8px rgba(16,185,129,0.4)}
                .apg-bar-fill.apg-indeterminate{width:30%!important;animation:apgSlide 1.2s ease-in-out infinite}
                @keyframes apgSlide{0%{margin-left:0;width:30%}50%{margin-left:35%;width:40%}100%{margin-left:70%;width:30%}}
                .apg-panel.apg-done{border-color:rgba(34,197,94,0.4)}
                .apg-panel.apg-done .apg-pulse{animation:none;background:#22C55E}
                .apg-panel.apg-done .apg-bar-fill{background:#22C55E;animation:none;margin-left:0}
                @media(max-width:480px){.apg-panel{padding:10px 12px}.apg-stats-row{grid-template-columns:repeat(2,1fr)}.apg-stat-val{font-size:.8rem}.apg-title{font-size:.75rem}}
            `;
            document.head.appendChild(s);
        }

        const container = document.getElementById('async-progress-inline');
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = `
            <div class="apg-panel" id="apg-box">
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
                    <div class="apg-bar-fill apg-indeterminate" id="apg-bar"></div>
                </div>
            </div>
        `;

        document.getElementById('apg-cancel').onclick = () => { this._cancelled = true; };
    }

    static _updateProgress(current, total) {
        const elapsed = (Date.now() - this._startTime) / 1000;
        const pct = Math.min(100, Math.round((current / total) * 100));
        const speed = elapsed > 0 ? Math.round(current / elapsed) : 0;
        const remaining = speed > 0 ? Math.ceil((total - current) / speed) : 0;

        const pctEl = document.getElementById('apg-pct');
        if (pctEl) pctEl.textContent = pct + '%';

        const countEl = document.getElementById('apg-count');
        if (countEl) countEl.textContent = current.toLocaleString('pt-BR');

        const speedEl = document.getElementById('apg-speed');
        if (speedEl) speedEl.textContent = speed.toLocaleString('pt-BR');

        const etaEl = document.getElementById('apg-eta');
        if (etaEl) {
            if (remaining > 60) etaEl.textContent = Math.ceil(remaining / 60) + 'min';
            else if (remaining > 0) etaEl.textContent = remaining + 's';
            else etaEl.textContent = '—';
        }

        const barEl = document.getElementById('apg-bar');
        if (barEl) {
            barEl.classList.remove('apg-indeterminate');
            barEl.style.width = pct + '%';
        }
    }

    static _completeProgress(total) {
        const elapsed = ((Date.now() - this._startTime) / 1000).toFixed(1);
        const speed = Math.round(total / ((Date.now() - this._startTime) / 1000));

        const box = document.getElementById('apg-box');
        if (box) box.classList.add('apg-done');

        const pctEl = document.getElementById('apg-pct');
        if (pctEl) { pctEl.textContent = '✅'; pctEl.style.color = '#22C55E'; }

        const titleEl = document.querySelector('.apg-title');
        if (titleEl) titleEl.textContent = '✅ Concluído';

        const countEl = document.getElementById('apg-count');
        if (countEl) { countEl.textContent = total.toLocaleString('pt-BR'); countEl.style.color = '#22C55E'; }

        const speedEl = document.getElementById('apg-speed');
        if (speedEl) { speedEl.textContent = speed.toLocaleString('pt-BR'); speedEl.style.color = '#22C55E'; }

        const barEl = document.getElementById('apg-bar');
        if (barEl) {
            barEl.classList.remove('apg-indeterminate');
            barEl.style.width = '100%';
            barEl.style.background = 'linear-gradient(90deg, #059669, #22C55E)';
        }

        const etaEl = document.getElementById('apg-eta');
        if (etaEl) { etaEl.textContent = elapsed + 's'; etaEl.style.color = '#22C55E'; }

        const btn = document.getElementById('apg-cancel');
        if (btn) btn.style.display = 'none';

        setTimeout(() => {
            const c = document.getElementById('async-progress-inline');
            if (c) { c.style.display = 'none'; c.innerHTML = ''; }
        }, 4000);
    }

    static _hideProgress() {
        const c = document.getElementById('async-progress-inline');
        if (c) { c.style.display = 'none'; c.innerHTML = ''; }
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO MANUAL ASSÍNCRONA (chunks — motor leve)
    //  MotorFechamentoManual é leve e não faz Set Cover global,
    //  então chunks NÃO afetam a qualidade.
    // ═══════════════════════════════════════════════════════════

    static async generateManualAsync(gameKey, pool, fixedNumbers, numGames, drawSize, callback) {
        this._isRunning = true;
        this._cancelled = false;

        const chunkSize = Math.max(20, Math.min(200, Math.floor(numGames / 10)));
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const name = game ? game.name : gameKey;

        this._showProgress(name + ' — Manual', numGames);

        // 2 frames para a barra pintar
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 0))));

        try {
            if (typeof MotorFechamentoManual === 'undefined') throw new Error('MotorFechamentoManual não carregado');

            const uniqueGames = [];
            const globalKeys = new Set();
            let chunks = 0;
            let staleRounds = 0;

            while (uniqueGames.length < numGames && !this._cancelled && staleRounds < 15 && chunks < 200) {
                const remaining = numGames - uniqueGames.length;
                const batch = Math.min(chunkSize, Math.ceil(remaining * 1.08));
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

                if (uniqueGames.length - prevCount === 0) staleRounds++;
                else staleRounds = 0;

                this._updateProgress(Math.min(uniqueGames.length, numGames), numGames);
                await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
            }

            if (this._cancelled) {
                this._isRunning = false;
                this._hideProgress();
                callback(null, true);
                return;
            }

            this._completeProgress(uniqueGames.length);

            const analysis = {
                totalGames: uniqueGames.length, poolSize: pool.length,
                fixedCount: (fixedNumbers||[]).length, fixedNumbers: fixedNumbers||[],
                drawSize, pricePerGame: game?game.price:0,
                investimento: uniqueGames.length * (game?game.price:0),
                isComplete: false, elapsed: Date.now() - this._startTime,
                asyncMode: true, chunksProcessed: chunks, totalPossible: '—'
            };

            this._isRunning = false;
            setTimeout(() => callback({ games: uniqueGames, analysis }, false), 500);

        } catch (e) {
            console.error('[AsyncGen Manual]', e);
            this._isRunning = false;
            this._hideProgress();
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO COBERTURA IA — UMA CHAMADA (qualidade máxima)
    //  SmartCoverageEngine usa Greedy Set Cover GLOBAL.
    //  Fragmentar em batches DEGRADA a cobertura.
    //  Solução: gerar TUDO de uma vez, barra indeterminada.
    // ═══════════════════════════════════════════════════════════

    static async generateCoverageAsync(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options, callback) {
        this._isRunning = true;
        this._cancelled = false;

        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const name = game ? game.name : gameKey;

        this._showProgress(name + ' — Gerador Inteligente', numGames);

        // 2 frames para a barra INDETERMINADA pintar e animar
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 0))));

        try {
            if (typeof SmartCoverageEngine === 'undefined') throw new Error('SmartCoverageEngine não carregado');

            // ═══ CHAMADA ÚNICA — Set Cover global = qualidade máxima ═══
            // A barra indeterminada anima enquanto o motor processa.
            // setTimeout(0) garante que a barra está visível antes do processamento.
            const result = await new Promise((resolve) => {
                setTimeout(() => {
                    try {
                        const r = SmartCoverageEngine.generate(
                            gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options
                        );
                        resolve(r);
                    } catch(e) {
                        console.error('[AsyncGen Coverage] Engine error:', e);
                        resolve({ games: [] });
                    }
                }, 0);
            });

            if (this._cancelled) {
                this._isRunning = false;
                this._hideProgress();
                callback(null, true);
                return;
            }

            // Deduplicar resultado (por segurança)
            const seen = new Set();
            const uniqueGames = [];
            if (result && result.games) {
                for (const g of result.games) {
                    const k = g.join(',');
                    if (!seen.has(k)) {
                        seen.add(k);
                        uniqueGames.push(g);
                    }
                }
            }

            this._updateProgress(uniqueGames.length, numGames);
            this._completeProgress(uniqueGames.length);

            const elapsed = Date.now() - this._startTime;
            const finalResult = {
                games: uniqueGames,
                pool: result.pool || [...new Set(uniqueGames.flat())].sort((a,b) => a-b),
                analysis: {
                    ...(result.analysis || {}),
                    engine: 'CoverageEngine-Async',
                    totalGames: uniqueGames.length,
                    elapsed: elapsed + 'ms',
                    strategy: 'COVERAGE_FAST',
                    asyncMode: true,
                    chunksProcessed: 1
                }
            };

            if (typeof SmartCoverageEngine !== 'undefined' && SmartCoverageEngine._calcAvgHamming) {
                finalResult.analysis.avgHamming = SmartCoverageEngine._calcAvgHamming(uniqueGames, drawSize);
            }

            this._isRunning = false;
            setTimeout(() => callback(finalResult, false), 500);

        } catch (e) {
            console.error('[AsyncGen Coverage]', e);
            this._isRunning = false;
            this._hideProgress();
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    static _dedupe(games) {
        const seen = new Set();
        return games.filter(g => { const k = g.join(','); if (seen.has(k)) return false; seen.add(k); return true; });
    }

    static shouldUseAsync(numGames, gameKey) { return numGames >= 1; }
}

if (typeof window !== 'undefined') window.AsyncGenerator = AsyncGenerator;

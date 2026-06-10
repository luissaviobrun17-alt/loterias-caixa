/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ASYNC GENERATOR v6.0 — setTimeout puro (sem async/await)             ║
 * ║                                                                        ║
 * ║  A barra de evolução é inserida no DOM e então setTimeout(fn, 200)    ║
 * ║  garante que o browser PINTA antes do motor pesado começar.           ║
 * ║  Cobertura IA: UMA chamada (Set Cover global = qualidade máxima).     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class AsyncGenerator {

    static _cancelled = false;
    static _isRunning = false;
    static _startTime = 0;

    // ═══════════════════════════════════════════════════════════
    //  BARRA DE EVOLUÇÃO
    // ═══════════════════════════════════════════════════════════

    static _injectCSS() {
        if (document.getElementById('apg-css')) return;
        const s = document.createElement('style');
        s.id = 'apg-css';
        s.textContent = `
            .apg-panel{margin-top:10px;background:linear-gradient(165deg,rgba(15,23,42,0.98),rgba(30,41,59,0.95));border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:14px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.03);animation:apgFade .3s ease}
            @keyframes apgFade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
            .apg-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
            .apg-left{display:flex;align-items:center;gap:8px}
            .apg-dot{width:8px;height:8px;border-radius:50%;background:#10B981;box-shadow:0 0 8px rgba(16,185,129,0.6);animation:apgBlink 1.5s ease-in-out infinite;flex-shrink:0}
            @keyframes apgBlink{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
            .apg-title{font-size:0.85rem;font-weight:800;color:#E2E8F0}
            .apg-badge{font-size:0.65rem;color:#10B981;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:2px 8px;background:rgba(16,185,129,0.1);border-radius:6px;border:1px solid rgba(16,185,129,0.2)}
            .apg-pct{font-size:1.1rem;font-weight:900;color:#10B981;font-family:'Inter',monospace;min-width:45px;text-align:right}
            .apg-x{width:24px;height:24px;border-radius:6px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.1);color:#F87171;font-size:0.7rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center}
            .apg-x:hover{background:rgba(239,68,68,0.25)}
            .apg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}
            .apg-cell{text-align:center;padding:6px 4px;background:rgba(0,0,0,0.2);border-radius:8px;border:1px solid rgba(16,185,129,0.08)}
            .apg-val{display:block;font-size:0.95rem;font-weight:900;color:#10B981;font-family:'Inter',monospace;line-height:1.2}
            .apg-lbl{display:block;font-size:0.55rem;color:#475569;text-transform:uppercase;letter-spacing:.8px;margin-top:2px;font-weight:700}
            .apg-track{width:100%;height:8px;background:rgba(0,0,0,0.35);border-radius:4px;overflow:hidden}
            .apg-fill{height:100%;width:0%;background:linear-gradient(90deg,#059669,#10B981,#34D399);border-radius:4px;transition:width .3s ease;box-shadow:0 0 8px rgba(16,185,129,0.4)}
            .apg-slide{width:30%!important;animation:apgSlide 1.2s ease-in-out infinite}
            @keyframes apgSlide{0%{margin-left:0;width:30%}50%{margin-left:35%;width:40%}100%{margin-left:70%;width:30%}}
            .apg-done .apg-dot{animation:none;background:#22C55E}
            .apg-done .apg-fill{background:#22C55E;animation:none!important;margin-left:0!important;width:100%!important}
            @media(max-width:480px){.apg-panel{padding:10px 12px}.apg-grid{grid-template-columns:repeat(2,1fr)}.apg-val{font-size:.8rem}.apg-title{font-size:.75rem}}
        `;
        document.head.appendChild(s);
    }

    static _showBar(label, total) {
        this._injectCSS();
        this._startTime = Date.now();
        this._cancelled = false;
        const c = document.getElementById('async-progress-inline');
        if (!c) return;
        c.style.display = 'block';
        c.innerHTML = '<div class="apg-panel" id="apg-box">'
            + '<div class="apg-header"><div class="apg-left">'
            + '<span class="apg-dot"></span>'
            + '<span class="apg-title">⚡ Gerando Jogos</span>'
            + '<span class="apg-badge">' + label + '</span>'
            + '</div><div style="display:flex;align-items:center;gap:10px">'
            + '<span class="apg-pct" id="apg-pct">⏳</span>'
            + '<button class="apg-x" id="apg-x">✕</button>'
            + '</div></div>'
            + '<div class="apg-grid">'
            + '<div class="apg-cell"><span class="apg-val" id="apg-n">0</span><span class="apg-lbl">Gerados</span></div>'
            + '<div class="apg-cell"><span class="apg-val" id="apg-t">' + total.toLocaleString('pt-BR') + '</span><span class="apg-lbl">Total</span></div>'
            + '<div class="apg-cell"><span class="apg-val" id="apg-s">—</span><span class="apg-lbl">Jogos/s</span></div>'
            + '<div class="apg-cell"><span class="apg-val" id="apg-e">—</span><span class="apg-lbl">Restante</span></div>'
            + '</div>'
            + '<div class="apg-track"><div class="apg-fill apg-slide" id="apg-bar"></div></div>'
            + '</div>';
        var xb = document.getElementById('apg-x');
        if (xb) xb.onclick = function() { AsyncGenerator._cancelled = true; };
    }

    static _updateBar(cur, tot) {
        var el = (Date.now() - this._startTime) / 1000;
        var p = Math.min(100, Math.round(cur / tot * 100));
        var sp = el > 0 ? Math.round(cur / el) : 0;
        var rem = sp > 0 ? Math.ceil((tot - cur) / sp) : 0;
        var pe = document.getElementById('apg-pct'); if (pe) pe.textContent = p + '%';
        var ne = document.getElementById('apg-n'); if (ne) ne.textContent = cur.toLocaleString('pt-BR');
        var se = document.getElementById('apg-s'); if (se) se.textContent = sp.toLocaleString('pt-BR');
        var ee = document.getElementById('apg-e');
        if (ee) { if (rem > 60) ee.textContent = Math.ceil(rem/60) + 'min'; else if (rem > 0) ee.textContent = rem + 's'; else ee.textContent = '—'; }
        var be = document.getElementById('apg-bar');
        if (be) { be.classList.remove('apg-slide'); be.style.width = p + '%'; }
    }

    static _doneBar(tot) {
        var el = ((Date.now() - this._startTime) / 1000).toFixed(1);
        var sp = Math.round(tot / ((Date.now() - this._startTime) / 1000));
        var bx = document.getElementById('apg-box'); if (bx) bx.classList.add('apg-done');
        var pe = document.getElementById('apg-pct'); if (pe) { pe.textContent = '✅'; pe.style.color = '#22C55E'; }
        var ne = document.getElementById('apg-n'); if (ne) { ne.textContent = tot.toLocaleString('pt-BR'); ne.style.color = '#22C55E'; }
        var se = document.getElementById('apg-s'); if (se) { se.textContent = sp.toLocaleString('pt-BR'); se.style.color = '#22C55E'; }
        var ee = document.getElementById('apg-e'); if (ee) { ee.textContent = el + 's'; ee.style.color = '#22C55E'; }
        var xb = document.getElementById('apg-x'); if (xb) xb.style.display = 'none';
        var tt = document.querySelector('.apg-title'); if (tt) tt.textContent = '✅ Concluído';
        setTimeout(function() {
            var c = document.getElementById('async-progress-inline');
            if (c) { c.style.display = 'none'; c.innerHTML = ''; }
        }, 4000);
    }

    static _hideBar() {
        var c = document.getElementById('async-progress-inline');
        if (c) { c.style.display = 'none'; c.innerHTML = ''; }
    }

    // ═══════════════════════════════════════════════════════════
    //  MANUAL — chunks (motor leve, qualidade ok)
    // ═══════════════════════════════════════════════════════════

    static generateManualAsync(gameKey, pool, fixedNumbers, numGames, drawSize, callback) {
        var self = this;
        self._isRunning = true;
        self._cancelled = false;
        var game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        var name = game ? game.name : gameKey;
        var chunkSize = Math.max(20, Math.min(200, Math.floor(numGames / 10)));

        // 1) Mostrar barra
        self._showBar(name + ' — Manual', numGames);

        // 2) setTimeout(200ms) = browser PINTA a barra
        setTimeout(function() {
            try {
                if (typeof MotorFechamentoManual === 'undefined') throw new Error('MotorFechamentoManual não carregado');

                var uniqueGames = [];
                var keys = {};
                var chunks = 0;
                var stale = 0;

                function nextChunk() {
                    if (uniqueGames.length >= numGames || self._cancelled || stale >= 15 || chunks >= 200) {
                        // Terminado
                        if (self._cancelled) {
                            self._isRunning = false;
                            self._hideBar();
                            callback(null, true);
                            return;
                        }
                        self._doneBar(uniqueGames.length);
                        var analysis = {
                            totalGames: uniqueGames.length, poolSize: pool.length,
                            fixedCount: (fixedNumbers||[]).length, fixedNumbers: fixedNumbers||[],
                            drawSize: drawSize, pricePerGame: game?game.price:0,
                            investimento: uniqueGames.length * (game?game.price:0),
                            isComplete: false, elapsed: Date.now() - self._startTime,
                            asyncMode: true, chunksProcessed: chunks, totalPossible: '—'
                        };
                        self._isRunning = false;
                        setTimeout(function() { callback({ games: uniqueGames, analysis: analysis }, false); }, 500);
                        return;
                    }

                    var remaining = numGames - uniqueGames.length;
                    var batch = Math.min(chunkSize, Math.ceil(remaining * 1.08));
                    chunks++;
                    var prev = uniqueGames.length;

                    var r = MotorFechamentoManual.generate(gameKey, pool, fixedNumbers, batch, drawSize);
                    if (r && r.games) {
                        for (var i = 0; i < r.games.length; i++) {
                            if (uniqueGames.length >= numGames) break;
                            var k = r.games[i].join(',');
                            if (!keys[k]) {
                                keys[k] = true;
                                uniqueGames.push(r.games[i]);
                            }
                        }
                    }
                    if (uniqueGames.length === prev) stale++;
                    else stale = 0;

                    self._updateBar(Math.min(uniqueGames.length, numGames), numGames);
                    // Próximo chunk via setTimeout = browser pinta
                    setTimeout(nextChunk, 0);
                }

                nextChunk();

            } catch (e) {
                console.error('[AsyncGen Manual]', e);
                self._isRunning = false;
                self._hideBar();
                callback(null, false, e);
            }
        }, 200);
    }

    // ═══════════════════════════════════════════════════════════
    //  COBERTURA IA — UMA chamada (Set Cover global = qualidade)
    //  Barra indeterminada anima enquanto o motor processa.
    // ═══════════════════════════════════════════════════════════

    static generateCoverageAsync(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options, callback) {
        var self = this;
        self._isRunning = true;
        self._cancelled = false;
        var game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        var name = game ? game.name : gameKey;

        // 1) Mostrar barra com animação indeterminada
        self._showBar(name + ' — Gerador Inteligente', numGames);

        // 2) setTimeout(200ms) = browser PINTA a barra ANTES do motor pesado
        setTimeout(function() {
            try {
                if (typeof SmartCoverageEngine === 'undefined') throw new Error('SmartCoverageEngine não carregado');

                if (self._cancelled) {
                    self._isRunning = false;
                    self._hideBar();
                    callback(null, true);
                    return;
                }

                // ═══ CHAMADA ÚNICA — qualidade máxima (Set Cover global) ═══
                var result = SmartCoverageEngine.generate(
                    gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options
                );

                // Deduplicar
                var seen = {};
                var uniqueGames = [];
                if (result && result.games) {
                    for (var i = 0; i < result.games.length; i++) {
                        var k = result.games[i].join(',');
                        if (!seen[k]) {
                            seen[k] = true;
                            uniqueGames.push(result.games[i]);
                        }
                    }
                }

                self._updateBar(uniqueGames.length, numGames);
                self._doneBar(uniqueGames.length);

                var elapsed = Date.now() - self._startTime;
                var finalResult = {
                    games: uniqueGames,
                    pool: result.pool || (function() { var s = {}; for (var j = 0; j < uniqueGames.length; j++) for (var m = 0; m < uniqueGames[j].length; m++) s[uniqueGames[j][m]] = true; return Object.keys(s).map(Number).sort(function(a,b){return a-b}); })(),
                    analysis: Object.assign({}, result.analysis || {}, {
                        engine: 'CoverageEngine', totalGames: uniqueGames.length,
                        elapsed: elapsed + 'ms', strategy: 'COVERAGE_FAST',
                        asyncMode: true, chunksProcessed: 1
                    })
                };

                if (typeof SmartCoverageEngine !== 'undefined' && SmartCoverageEngine._calcAvgHamming) {
                    finalResult.analysis.avgHamming = SmartCoverageEngine._calcAvgHamming(uniqueGames, drawSize);
                }

                self._isRunning = false;
                setTimeout(function() { callback(finalResult, false); }, 500);

            } catch (e) {
                console.error('[AsyncGen Coverage]', e);
                self._isRunning = false;
                self._hideBar();
                callback(null, false, e);
            }
        }, 200);
    }

    // ═══════════════════════════════════════════════════════════


    // PURE COVERAGE - PureCoverageEngine (motor original)
    static generatePureAsync(gameKey, numGames, options, callback) {
        var self = this;
        self._isRunning = true;
        self._cancelled = false;
        var game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        var name = game ? game.name : gameKey;
        self._showBar(name, numGames);
        setTimeout(function() {
            try {
                if (typeof PureCoverageEngine === 'undefined') throw new Error('PureCoverageEngine nao carregado');
                if (self._cancelled) { self._isRunning = false; self._hideBar(); callback(null, true); return; }
                var result = PureCoverageEngine.generate(gameKey, numGames, options);
                var seen = {}, ug = [];
                if (result && result.games) {
                    for (var i = 0; i < result.games.length; i++) {
                        var k = result.games[i].join(',');
                        if (!seen[k]) { seen[k] = true; ug.push(result.games[i]); }
                    }
                }
                self._updateBar(Math.min(ug.length, numGames), numGames);
                self._doneBar(ug.length);
                var elapsed = Date.now() - self._startTime;
                var fr = { games: ug, pool: result.pool || [], analysis: Object.assign({}, result.analysis || {}, { engine: 'PureCoverageEngine', totalGames: ug.length, elapsed: elapsed + 'ms', asyncMode: true }) };
                self._isRunning = false;
                setTimeout(function() { callback(fr, false); }, 500);
            } catch (e) {
                console.error('[AsyncGen Pure]', e);
                self._isRunning = false;
                self._hideBar();
                callback(null, false, e);
            }
        }, 200);
    }

    static _dedupe(games) {
        var seen = {};
        return games.filter(function(g) { var k = g.join(','); if (seen[k]) return false; seen[k] = true; return true; });
    }

    static shouldUseAsync(numGames, gameKey) { return numGames >= 1; }
}

if (typeof window !== 'undefined') window.AsyncGenerator = AsyncGenerator;

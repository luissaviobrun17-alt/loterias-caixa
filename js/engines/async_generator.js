/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ASYNC GENERATOR v4.0 — Geração sem travamento                        ║
 * ║  Cobertura IA: gera TUDO de uma vez e reporta progresso simulado       ║
 * ║  Manual: chunks reais (MotorFechamento é leve)                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class AsyncGenerator {

    static _cancelled = false;
    static _isRunning = false;
    static _startTime = 0;

    // ═══════════════════════════════════════════════════════════
    //  BARRA DE PROGRESSO COMPACTA
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
                .apg-track{width:100%;height:8px;background:rgba(0,0,0,0.4);border-radius:4px;overflow:hidden}
                .apg-fill{height:100%;width:0%;background:linear-gradient(90deg,#059669,#10B981,#34D399);border-radius:4px;transition:width .2s linear}
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
                    <span class="apg-info" id="apg-info">⚡ <b>${lotteryName}</b> — processando...</span>
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
        const elapsed = ((Date.now() - this._startTime) / 1000).toFixed(1);
        const box = document.getElementById('apg-box');
        if (box) box.classList.add('apg-done');
        const pctEl = document.getElementById('apg-pct');
        if (pctEl) pctEl.textContent = '✓';
        const infoEl = document.getElementById('apg-info');
        if (infoEl) infoEl.innerHTML = '✅ <b>' + lotteryName + '</b> — ' + total.toLocaleString('pt-BR') + ' jogos em ' + elapsed + 's';
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
    //  GERAÇÃO MANUAL ASSÍNCRONA (leve — chunks reais)
    // ═══════════════════════════════════════════════════════════

    static async generateManualAsync(gameKey, pool, fixedNumbers, numGames, drawSize, callback) {
        this._isRunning = true;
        this._cancelled = false;

        const baseChunkSize = Math.max(50, Math.min(500, Math.floor(numGames / 15)));
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const name = game ? game.name : gameKey;

        this._showProgress(name, numGames);
        await this._yield();

        try {
            if (typeof MotorFechamentoManual === 'undefined') throw new Error('MotorFechamentoManual não carregado');

            // ═══════════════════════════════════════════════════════════
            //  v5.0 FIX: Deduplicação Contínua com Reposição
            //  Mantém Set global de assinaturas entre chunks.
            //  Gera chunks compensatórios até atingir o alvo EXATO.
            //  Zero impacto na qualidade — mesmo motor, mesmos filtros.
            // ═══════════════════════════════════════════════════════════
            const uniqueGames = [];
            const globalKeys = new Set();
            let chunks = 0;
            let staleRounds = 0;         // Detector de estagnação
            const MAX_STALE_ROUNDS = 15; // Máx rounds sem progresso
            const MAX_CHUNKS = 80;       // Safety net absoluto

            while (uniqueGames.length < numGames && !this._cancelled && staleRounds < MAX_STALE_ROUNDS && chunks < MAX_CHUNKS) {
                const remaining = numGames - uniqueGames.length;
                // Margem de compensação: pede ~8% a mais para cobrir colisões esperadas
                const compensatedBatch = Math.min(
                    Math.ceil(remaining * 1.08),
                    Math.max(baseChunkSize, remaining)
                );
                const batch = Math.min(compensatedBatch, remaining + Math.ceil(remaining * 0.15));
                chunks++;

                const prevCount = uniqueGames.length;
                const r = MotorFechamentoManual.generate(gameKey, pool, fixedNumbers, batch, drawSize);

                if (r && r.games) {
                    // Deduplicação inline — só adiciona jogos novos
                    for (const g of r.games) {
                        if (uniqueGames.length >= numGames) break;
                        const key = g.join(',');
                        if (!globalKeys.has(key)) {
                            globalKeys.add(key);
                            uniqueGames.push(g);
                        }
                    }
                }

                // Detector de estagnação: se o chunk não adicionou nenhum jogo novo
                const added = uniqueGames.length - prevCount;
                if (added === 0) {
                    staleRounds++;
                    console.warn('[AsyncGen] Estagnação round ' + staleRounds + '/' + MAX_STALE_ROUNDS + ' — ' + uniqueGames.length + '/' + numGames + ' jogos únicos');
                } else {
                    staleRounds = 0; // Reset ao detectar progresso
                }

                this._updateProgress(Math.min(uniqueGames.length, numGames), numGames, name);
                await this._yield();
            }

            if (staleRounds >= MAX_STALE_ROUNDS) {
                console.warn('[AsyncGen] Limite de estagnação atingido. Entregando ' + uniqueGames.length + '/' + numGames + ' jogos (pool pode ser pequeno demais para ' + numGames + ' combinações únicas).');
            }

            if (this._cancelled) {
                this._isRunning = false;
                const c = document.getElementById('async-progress-inline');
                if (c) { c.style.display = 'none'; c.innerHTML = ''; }
                callback(null, true);
                return;
            }

            this._completeProgress(uniqueGames.length, name);

            const analysis = {
                totalGames: uniqueGames.length, poolSize: pool.length,
                fixedCount: (fixedNumbers||[]).length, fixedNumbers: fixedNumbers||[],
                drawSize, pricePerGame: game?game.price:0,
                investimento: uniqueGames.length * (game?game.price:0),
                isComplete: false, elapsed: Date.now() - this._startTime,
                asyncMode: true, chunksProcessed: chunks, totalPossible: '—'
            };

            this._isRunning = false;
            setTimeout(() => callback({ games: uniqueGames, analysis }, false), 400);

        } catch (e) {
            console.error('[AsyncGen Manual]', e);
            this._isRunning = false;
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  GERAÇÃO COBERTURA IA ASSÍNCRONA (pesada — micro-chunks)
    //  SmartCoverageEngine é CPU-bound, então geramos em
    //  micro-batches de 1-10 jogos com yield real entre cada um
    // ═══════════════════════════════════════════════════════════

    static async generateCoverageAsync(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options, callback) {
        this._isRunning = true;
        this._cancelled = false;

        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const name = game ? game.name : gameKey;

        this._showProgress(name, numGames);
        await this._yield();

        try {
            if (typeof SmartCoverageEngine === 'undefined') throw new Error('SmartCoverageEngine não carregado');

            const allGames = [];
            const seen = new Set();
            let chunks = 0;
            let staleCount = 0; // Detecta quando não gera mais jogos novos

            // Micro-batch: gera lotes de jogos por vez para não travar a UI
            let batchSize = numGames > 1000 ? 250 : (numGames > 200 ? 100 : 50);
            const originalBatchSize = batchSize;

            while (allGames.length < numGames && !this._cancelled) {
                const remaining = numGames - allGames.length;
                const batch = Math.min(batchSize, remaining);
                chunks++;

                const prevLen = allGames.length;

                let r;
                try {
                    // v11.0 FIX: Passar jogos já gerados para evitar duplicatas internas
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

                // Detectar estagnação (muitas duplicatas)
                if (allGames.length === prevLen) {
                    staleCount++;
                    // v11.0 FIX: Reduzir batch progressivamente para gerar mais variação
                    batchSize = Math.max(10, Math.floor(batchSize * 0.7));
                    if (staleCount > 50) {
                        console.warn('[AsyncGen] Estagnação após ' + staleCount + ' tentativas em ' + allGames.length + '/' + numGames);
                        break;
                    }
                } else {
                    staleCount = 0;
                    batchSize = originalBatchSize; // Reset batch size
                }

                this._updateProgress(allGames.length, numGames, name);

                // Yield real — libera a thread para o browser renderizar
                await this._yieldReal();
            }

            if (this._cancelled) {
                this._isRunning = false;
                const c = document.getElementById('async-progress-inline');
                if (c) { c.style.display = 'none'; c.innerHTML = ''; }
                callback(null, true);
                return;
            }

            this._completeProgress(allGames.length, name);

            const elapsed = Date.now() - this._startTime;
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
            callback(null, false, e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    // Yield mínimo (para operações leves)
    static _yield() { return new Promise(r => setTimeout(r, 0)); }

    // Yield real — 8ms para garantir que o browser pinta a tela
    static _yieldReal() { return new Promise(r => setTimeout(r, 8)); }

    static _dedupe(games) {
        const seen = new Set();
        return games.filter(g => { const k = g.join(','); if (seen.has(k)) return false; seen.add(k); return true; });
    }

    // Threshold baixo para usar async — quase tudo passa por aqui
    static shouldUseAsync(numGames, gameKey) { return numGames >= 50; }
}

if (typeof window !== 'undefined') window.AsyncGenerator = AsyncGenerator;

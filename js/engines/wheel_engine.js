/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  WHEEL ENGINE v1.0 — Motor de Cobertura Combinatória C(v,k,t)  ║
 * ║                                                                  ║
 * ║  Covering Design: dado um pool de v números, gera o MÍNIMO     ║
 * ║  de blocos de k números que GARANTEM cobertura de todo          ║
 * ║  subconjunto de t números do pool.                              ║
 * ║                                                                  ║
 * ║  FASES:                                                          ║
 * ║  1. Enumeração de t-subsets                                      ║
 * ║  2. Greedy Set Cover + Filtros Gaussianos + Frequência          ║
 * ║  3. Busca Local para redução de blocos redundantes              ║
 * ║  4. Relatório de cobertura exato                                 ║
 * ║  5. Backtesting contra histórico real                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
class WheelEngine {

    // ═══════════════════════════════════════════════════════
    //  PONTO DE ENTRADA
    // ═══════════════════════════════════════════════════════
    static generate(gameKey, pool, drawSize, guarantee, maxGamesLimit, fixedNumbers) {
        const t0 = Date.now();
        // Garantir que fixos estejam no pool
        const fixedSet = new Set((fixedNumbers || []).filter(n => pool.includes(n)));
        const fixedArr = Array.from(fixedSet);
        if (fixedArr.length > 0) {
            console.log('[WHEEL] Números FIXOS (obrigatórios em todo bloco): ' + fixedArr.join(', '));
        }
        const v = pool.length;
        const k = drawSize;
        const t = guarantee;

        console.log('%c[WHEEL] ══════════════════════════════════════', 'color: #FFD700; font-weight: bold; font-size: 14px;');
        console.log('%c[WHEEL] COVERING DESIGN C(' + v + ',' + k + ',' + t + ')', 'color: #FFD700; font-weight: bold; font-size: 14px;');

        // Validações
        if (t > k) { console.error('[WHEEL] t > k inválido'); return this._fallbackRandom(pool, k, 10); }
        if (v < k) { console.error('[WHEEL] v < k inválido'); return this._fallbackRandom(pool, k, 10); }
        if (v === k) {
            // Pool = drawSize → só 1 jogo possível
            return { games: [pool.slice().sort((a,b)=>a-b)], pool, analysis: { engine:'WheelEngine', coverageType:'C('+v+','+k+','+t+')', v,k,t, totalTSubsets:1, coveredTSubsets:1, coveragePct:100, totalBlocks:1, reducedBlocks:1, removed:0 }};
        }

        // Verificar limite de performance
        const totalTS = this._comb(v, t);
        if (totalTS > 100000) {
            console.warn('[WHEEL] C(' + v + ',' + t + ') = ' + totalTS + ' — muito grande. Limitando pool.');
            // Truncar pool aos primeiros 25 números
            pool = pool.slice(0, 25);
        }

        // Carregar config de filtros
        const filterCfg = this._getFilterConfig(gameKey, k);

        // Fase 1: Enumerar t-subsets
        console.log('[WHEEL] Fase 1: Enumerando C(' + pool.length + ',' + t + ') = ' + this._comb(pool.length, t) + ' t-subsets...');
        const uncovered = new Set();
        this._enumSubsets(pool, t, 0, [], (subset) => {
            uncovered.add(subset.join(','));
        });
        const totalTSubsets = uncovered.size;
        console.log('[WHEEL] Fase 1: ' + totalTSubsets + ' t-subsets enumerados');

        // Carregar scores de frequência para tie-breaking
        const freqScores = this._loadFrequencyScores(gameKey, pool);

        // Fase 2: Greedy Set Cover
        console.log('[WHEEL] Fase 2: Greedy Set Cover...');
        const limit = maxGamesLimit || Math.min(totalTSubsets * 2, 2000);
        const blocks = [];
        const usedKeys = new Set();

        while (uncovered.size > 0 && blocks.length < limit) {
            let bestBlock = null;
            let bestScore = -1;
            const numCandidates = Math.max(80, Math.min(600, Math.ceil(uncovered.size / 2)));

            for (let c = 0; c < numCandidates; c++) {
                const candidate = this._genFilteredCandidate(pool, k, filterCfg, fixedArr);
                if (!candidate) continue;
                const ck = candidate.join(',');
                if (usedKeys.has(ck)) continue;

                // Contar t-subsets não cobertos que este candidato cobre
                let newCov = 0;
                this._enumSubsets(candidate, t, 0, [], (sub) => {
                    if (uncovered.has(sub.join(','))) newCov++;
                });

                // Bônus de frequência (tie-breaker)
                let fBonus = 0;
                if (freqScores) {
                    for (const n of candidate) fBonus += (freqScores[n] || 0);
                }

                const score = newCov * 100 + fBonus;
                if (score > bestScore) { bestScore = score; bestBlock = candidate; }
            }

            if (!bestBlock) bestBlock = this._genFilteredCandidate(pool, k, filterCfg, fixedArr);
            if (!bestBlock) break;

            blocks.push(bestBlock);
            usedKeys.add(bestBlock.join(','));

            // Marcar t-subsets cobertos
            this._enumSubsets(bestBlock, t, 0, [], (sub) => {
                uncovered.delete(sub.join(','));
            });

            // Log progresso a cada 50 blocos
            if (blocks.length % 50 === 0) {
                const pct = ((totalTSubsets - uncovered.size) / totalTSubsets * 100).toFixed(1);
                console.log('[WHEEL] Greedy: ' + blocks.length + ' blocos | Cobertura: ' + pct + '%');
            }
        }
        const greedyCount = blocks.length;
        const greedyCovPct = ((totalTSubsets - uncovered.size) / totalTSubsets * 100).toFixed(1);
        console.log('[WHEEL] Fase 2: ' + greedyCount + ' blocos | Cobertura: ' + greedyCovPct + '%');

        // Fase 3: Busca Local — remover blocos redundantes
        console.log('[WHEEL] Fase 3: Busca Local (redução)...');
        const reduced = this._localSearchReduce(blocks, t);
        console.log('[WHEEL] Fase 3: ' + greedyCount + ' → ' + reduced.length + ' blocos (' + (greedyCount - reduced.length) + ' removidos)');

        // Fase 4: Relatório de cobertura
        const covReport = this._coverageReport(reduced, pool, t, k, gameKey);

        // Fase 5: Backtesting
        const backtest = this._backtest(reduced, pool, gameKey, 50);

        const elapsed = Date.now() - t0;
        console.log('[WHEEL] ✓ Completo em ' + elapsed + 'ms | ' + reduced.length + ' jogos finais');

        return {
            games: reduced,
            pool: pool,
            analysis: {
                engine: 'WheelEngine',
                coverageType: 'C(' + v + ',' + k + ',' + t + ')',
                v, k, t,
                totalTSubsets,
                coveredTSubsets: covReport.coveredCount,
                coveragePct: covReport.coveragePct,
                totalBlocks: greedyCount,
                reducedBlocks: reduced.length,
                removed: greedyCount - reduced.length,
                elapsed,
                guaranteeLabel: covReport.guaranteeLabel,
                investimento: reduced.length * (typeof GAMES !== 'undefined' && GAMES[gameKey] ? GAMES[gameKey].price : 5),
                backtest,
                freqBalance: covReport.freqBalance
            }
        };
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 1: Enumeração de subsets (callback-based, sem armazenar tudo)
    // ═══════════════════════════════════════════════════════
    static _enumSubsets(arr, size, start, current, callback) {
        if (current.length === size) { callback(current); return; }
        for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            this._enumSubsets(arr, size, i + 1, current, callback);
            current.pop();
        }
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 2: Gerar candidato com filtros Gaussianos
    // ═══════════════════════════════════════════════════════
    static _genFilteredCandidate(pool, k, cfg, fixedArr) {
        const fixed = fixedArr || [];
        for (let attempt = 0; attempt < 150; attempt++) {
            // Começar com números fixos (obrigatórios)
            const chosen = new Set(fixed);
            // Completar com aleatórios do pool (excluindo fixos)
            const remaining = pool.filter(n => !chosen.has(n));
            // Fisher-Yates shuffle nos restantes
            for (let i = remaining.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
            }
            // Preencher até k
            for (const n of remaining) {
                if (chosen.size >= k) break;
                chosen.add(n);
            }
            if (chosen.size < k) continue;
            const candidate = Array.from(chosen).sort((a, b) => a - b);

            // Filtros Gaussianos
            if (!this._isGaussianValid(candidate, cfg)) continue;
            return candidate;
        }
        // Fallback: fixos + aleatório sem filtro
        const chosen = new Set(fixed);
        const remaining = pool.filter(n => !chosen.has(n));
        for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        for (const n of remaining) { if (chosen.size >= k) break; chosen.add(n); }
        return Array.from(chosen).sort((a, b) => a - b);
    }

    // ═══════════════════════════════════════════════════════
    //  FILTROS GAUSSIANOS
    // ═══════════════════════════════════════════════════════
    static _isGaussianValid(game, cfg) {
        const n = game.length;

        // 1. Soma
        const sum = game.reduce((a, b) => a + b, 0);
        if (sum < cfg.sumRange[0] || sum > cfg.sumRange[1]) return false;

        // 2. Paridade (pares)
        const evens = game.filter(x => x % 2 === 0).length;
        if (evens < cfg.parityRange[0] || evens > cfg.parityRange[1]) return false;

        // 3. Consecutivos máximos
        let maxRun = 1, curRun = 1;
        for (let i = 1; i < n; i++) {
            if (game[i] === game[i - 1] + 1) { curRun++; maxRun = Math.max(maxRun, curRun); }
            else curRun = 1;
        }
        if (maxRun > cfg.maxConsecutive) return false;

        // 4. Cobertura de zonas
        if (cfg.zones && cfg.zoneSize && cfg.minZones) {
            const zones = new Set();
            for (const num of game) zones.add(Math.floor((num - cfg.rangeStart) / cfg.zoneSize));
            if (zones.size < cfg.minZones) return false;
        }

        // 5. Max mesmo terminal (último dígito)
        if (cfg.maxSameEnding) {
            const endings = {};
            for (const num of game) {
                const e = num % 10;
                endings[e] = (endings[e] || 0) + 1;
                if (endings[e] > cfg.maxSameEnding) return false;
            }
        }

        // 6. Alto/Baixo
        if (cfg.highLowBalance) {
            const mid = Math.floor((cfg.rangeStart + cfg.rangeEnd) / 2);
            let low = 0;
            for (const num of game) if (num <= mid) low++;
            if (low < cfg.highLowBalance[0] || low > cfg.highLowBalance[1]) return false;
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════
    //  Config de filtros por loteria
    // ═══════════════════════════════════════════════════════
    static _getFilterConfig(gameKey, drawSize) {
        const configs = {
            megasena:   { sumRange:[95,265], parityRange:[2,4], maxConsecutive:2, zones:6, zoneSize:10, minZones:3, rangeStart:1, rangeEnd:60, maxSameEnding:2, highLowBalance:[2,4] },
            lotofacil:  { sumRange:[155,235], parityRange:[5,10], maxConsecutive:10, zones:5, zoneSize:5, minZones:5, rangeStart:1, rangeEnd:25 },
            quina:      { sumRange:[50,340], parityRange:[1,4], maxConsecutive:2, zones:8, zoneSize:10, minZones:3, rangeStart:1, rangeEnd:80 },
            duplasena:  { sumRange:[55,245], parityRange:[2,4], maxConsecutive:2, zones:5, zoneSize:10, minZones:3, rangeStart:1, rangeEnd:50 },
            lotomania:  { sumRange:[2050,2950], parityRange:[22,28], maxConsecutive:5, zones:10, zoneSize:10, minZones:8, rangeStart:0, rangeEnd:99 },
            timemania:  { sumRange:[200,610], parityRange:[3,7], maxConsecutive:2, zones:8, zoneSize:10, minZones:4, rangeStart:1, rangeEnd:80 },
            diadesorte: { sumRange:[55,170], parityRange:[2,5], maxConsecutive:3, zones:4, zoneSize:8, minZones:3, rangeStart:1, rangeEnd:31 }
        };
        const cfg = configs[gameKey] || configs.megasena;
        cfg.gameKey = gameKey;
        // Ajustar filtros proporcionalmente ao drawSize customizado
        if (drawSize && drawSize !== (gameKey === 'lotofacil' ? 15 : gameKey === 'lotomania' ? 50 : gameKey === 'timemania' ? 10 : gameKey === 'diadesorte' ? 7 : gameKey === 'quina' ? 5 : 6)) {
            const ratio = drawSize / (cfg.parityRange[1] + cfg.parityRange[0]) * 2;
            cfg.parityRange = [Math.max(0, Math.floor(cfg.parityRange[0] * ratio)), Math.ceil(cfg.parityRange[1] * ratio)];
        }
        return cfg;
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 3: Busca Local — Remover blocos redundantes
    // ═══════════════════════════════════════════════════════
    static _localSearchReduce(blocks, t) {
        if (blocks.length <= 2) return blocks;

        // Construir mapa: t-subset → quais blocos o cobrem
        const coverMap = new Map();
        for (let bi = 0; bi < blocks.length; bi++) {
            this._enumSubsets(blocks[bi], t, 0, [], (sub) => {
                const key = sub.join(',');
                if (!coverMap.has(key)) coverMap.set(key, new Set());
                coverMap.get(key).add(bi);
            });
        }

        const removed = new Set();

        // Calcular "unicidade" de cada bloco: quantos t-subsets só ele cobre
        const scores = [];
        for (let bi = 0; bi < blocks.length; bi++) {
            let unique = 0;
            this._enumSubsets(blocks[bi], t, 0, [], (sub) => {
                const coverers = coverMap.get(sub.join(','));
                if (coverers && coverers.size === 1) unique++;
            });
            scores.push({ idx: bi, unique });
        }
        // Tentar remover os menos únicos primeiro
        scores.sort((a, b) => a.unique - b.unique);

        for (const { idx, unique } of scores) {
            if (unique > 0 || removed.has(idx)) continue;

            // Verificar se TODOS os t-subsets deste bloco têm cobertura ≥ 2
            let canRemove = true;
            this._enumSubsets(blocks[idx], t, 0, [], (sub) => {
                if (!canRemove) return;
                const key = sub.join(',');
                const coverers = coverMap.get(key);
                if (!coverers) { canRemove = false; return; }
                let active = 0;
                for (const ci of coverers) { if (!removed.has(ci)) active++; }
                if (active <= 1) canRemove = false;
            });

            if (canRemove) {
                removed.add(idx);
                // Atualizar coverMap
                this._enumSubsets(blocks[idx], t, 0, [], (sub) => {
                    const key = sub.join(',');
                    const coverers = coverMap.get(key);
                    if (coverers) coverers.delete(idx);
                });
            }
        }

        return blocks.filter((_, i) => !removed.has(i));
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 4: Relatório de Cobertura
    // ═══════════════════════════════════════════════════════
    static _coverageReport(blocks, pool, t, k, gameKey) {
        // Verificar cobertura real
        const coveredSet = new Set();
        for (const block of blocks) {
            this._enumSubsets(block, t, 0, [], (sub) => {
                coveredSet.add(sub.join(','));
            });
        }
        const totalTS = this._comb(pool.length, t);
        const coveredCount = coveredSet.size;
        const coveragePct = totalTS > 0 ? Math.round(coveredCount / totalTS * 1000) / 10 : 0;

        // Label de garantia
        const game = (typeof GAMES !== 'undefined') ? GAMES[gameKey] : null;
        let guaranteeLabel = t + ' acertos';
        if (game && game.strategies) {
            const strat = game.strategies.find(s => s.match === t);
            if (strat) guaranteeLabel = strat.label;
        }

        // Balanço de frequência
        let freqBalance = null;
        try {
            if (typeof StatsService !== 'undefined') {
                const stats = StatsService.getStats(gameKey, 15);
                if (stats && stats.hot && stats.cold) {
                    const hotSet = new Set(stats.hot.slice(0, 10).map(h => h.number || h.num || h));
                    const coldSet = new Set(stats.cold.slice(0, 10).map(c => c.number || c.num || c));
                    let hotInPool = 0, coldInPool = 0;
                    for (const n of pool) {
                        if (hotSet.has(n)) hotInPool++;
                        if (coldSet.has(n)) coldInPool++;
                    }
                    freqBalance = { hotInPool, coldInPool, poolSize: pool.length };
                }
            }
        } catch(e) { /* sem stats */ }

        return { coveredCount, coveragePct, totalTS, guaranteeLabel, freqBalance };
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 5: Backtesting
    // ═══════════════════════════════════════════════════════
    static _backtest(blocks, pool, gameKey, numDraws) {
        let history = [];
        try {
            if (typeof StatsService !== 'undefined')
                history = StatsService.getRecentResults(gameKey, numDraws) || [];
        } catch(e) { return null; }
        if (history.length === 0) return null;

        const poolSet = new Set(pool);
        const results = [];
        const matchSummary = {};

        for (const draw of history) {
            const drawn = draw.numbers || draw;
            if (!Array.isArray(drawn)) continue;

            // Quantos sorteados estão no pool
            let inPool = 0;
            for (const n of drawn) if (poolSet.has(n)) inPool++;

            // Melhor acerto entre todos os blocos
            let bestMatch = 0;
            let prizesWon = 0;
            for (const block of blocks) {
                let matches = 0;
                for (const n of block) {
                    if (drawn.includes(n)) matches++;
                }
                if (matches > bestMatch) bestMatch = matches;
            }

            matchSummary[bestMatch] = (matchSummary[bestMatch] || 0) + 1;
            results.push({
                concurso: draw.drawNumber || draw.concurso || '?',
                inPool,
                bestMatch
            });
        }

        return { results: results.slice(0, 20), summary: matchSummary, totalDraws: results.length };
    }

    // ═══════════════════════════════════════════════════════
    //  Frequência para tie-breaking no Greedy
    // ═══════════════════════════════════════════════════════
    static _loadFrequencyScores(gameKey, pool) {
        try {
            if (typeof StatsService === 'undefined') return null;
            const stats = StatsService.getStats(gameKey, 15);
            if (!stats || !stats.hot) return null;

            const scores = {};
            const hotNums = stats.hot || [];
            const coldNums = stats.cold || [];

            // Hot = score positivo, cold = score neutro (regressão à média)
            for (let i = 0; i < hotNums.length; i++) {
                const n = hotNums[i].number || hotNums[i].num || hotNums[i];
                scores[n] = Math.max(1, 10 - i); // Top hot = 10, decrescente
            }
            for (let i = 0; i < coldNums.length; i++) {
                const n = coldNums[i].number || coldNums[i].num || coldNums[i];
                if (!scores[n]) scores[n] = Math.max(1, 5 - i); // Cold overdue = 5, decrescente
            }
            return scores;
        } catch(e) { return null; }
    }

    // ═══════════════════════════════════════════════════════
    //  Sugerir pool baseado em frequência
    // ═══════════════════════════════════════════════════════
    static suggestPool(gameKey, poolSize) {
        try {
            if (typeof StatsService === 'undefined') return null;
            const stats = StatsService.getStats(gameKey, 15);
            if (!stats || !stats.hot || !stats.cold) return null;

            const hot = (stats.hot || []).map(h => h.number || h.num || h);
            const cold = (stats.cold || []).map(c => c.number || c.num || c);

            // 60% hot, 30% mornos, 10% cold
            const hotCount = Math.ceil(poolSize * 0.6);
            const coldCount = Math.ceil(poolSize * 0.1);
            const warmCount = poolSize - hotCount - coldCount;

            const pool = new Set();
            // Adicionar hot
            for (let i = 0; i < hot.length && pool.size < hotCount; i++) pool.add(hot[i]);
            // Adicionar cold (overdue)
            for (let i = 0; i < cold.length && pool.size < hotCount + coldCount; i++) pool.add(cold[i]);
            // Completar com mornos (aleatório do range)
            const game = (typeof GAMES !== 'undefined') ? GAMES[gameKey] : null;
            if (game) {
                const all = [];
                for (let n = game.range[0]; n <= game.range[1]; n++) if (!pool.has(n)) all.push(n);
                for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [all[i],all[j]]=[all[j],all[i]]; }
                for (let i = 0; pool.size < poolSize && i < all.length; i++) pool.add(all[i]);
            }

            return Array.from(pool).sort((a, b) => a - b);
        } catch(e) { return null; }
    }

    // ═══════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════
    static _comb(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;
        if (r > n - r) r = n - r;
        let result = 1;
        for (let i = 0; i < r; i++) { result = result * (n - i) / (i + 1); }
        return Math.round(result);
    }

    static _fallbackRandom(pool, k, qty) {
        const games = [];
        for (let g = 0; g < qty; g++) {
            const copy = pool.slice();
            for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
            games.push(copy.slice(0, k).sort((a, b) => a - b));
        }
        return { games, pool, analysis: { engine: 'WheelEngine (fallback)', coveragePct: 0 } };
    }
}

console.log('[L99] WheelEngine v1.0 carregado');

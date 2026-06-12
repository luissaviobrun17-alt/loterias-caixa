/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  GAME BUILDER ENGINE — Otimização Multi-Objetivo para Formação de Jogos ║
 * ║                                                                          ║
 * ║  ARQUITETURA:                                                            ║
 * ║   Cada Otimizador analisa o pool de um ângulo diferente e propõe         ║
 * ║   jogos candidatos. O ConvergenceEngine (Terceiro) encontra os jogos     ║
 * ║   que estão na FRONTEIRA DE PARETO — onde todos os critérios convergem.  ║
 * ║                                                                          ║
 * ║  OTIMIZADORES:                                                           ║
 * ║   1. PairOptimizer     — duplas que co-ocorrem historicamente            ║
 * ║   2. TripleOptimizer   — trios que co-ocorrem historicamente             ║
 * ║   3. ZoneDistributor   — cobertura de zonas do volante                   ║
 * ║   4. SumBalancer       — faixa de soma histórica [P10, P90]              ║
 * ║   5. CoverageMaximizer — mínimo overlap entre jogos (Set Cover)          ║
 * ║                                                                          ║
 * ║  TERCEIRO (ConvergenceEngine):                                           ║
 * ║   Recebe todos os candidatos, pontua cada um pelos 5 critérios,          ║
 * ║   encontra a fronteira de Pareto e seleciona N jogos com diversidade.    ║
 * ║                                                                          ║
 * ║  HONESTIDADE: Não prevê números. Forma jogos otimizados combinatoriamente║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
class GameBuilderEngine {

    // ═══════════════════════════════════════════════════════════
    //  PONTO DE ENTRADA PRINCIPAL
    // ═══════════════════════════════════════════════════════════
    static generate(gameKey, numGames, pool, drawSize, history, options) {
        const opts = options || {};
        const t0 = Date.now();

        console.log('%c[GAMEBUILDER] ══════════════════════════════════', 'color: #F59E0B; font-weight:bold');
        console.log('[GAMEBUILDER] Loteria: ' + gameKey + ' | Jogos: ' + numGames + ' | Pool: ' + pool.length + ' | Draw: ' + drawSize);

        if (!pool || pool.length < drawSize) {
            console.warn('[GAMEBUILDER] Pool insuficiente. Fallback.');
            return this._fallback(gameKey, numGames, pool, drawSize, opts);
        }

        const profile = this._getProfile(gameKey);
        const hist = history || this._getHistory(gameKey);

        // ── 1. Analisar estrutura histórica ──
        const structural = StructuralAnalyzer.analyze(hist, profile.startNum, profile.endNum, drawSize);
        console.log('[GAMEBUILDER] Estrutura histórica analisada:',
            'soma[' + structural.sumP10 + '-' + structural.sumP90 + ']',
            'paridade mais comum: ' + structural.topParity,
            'zonas médias: ' + structural.avgZones.toFixed(1));

        // ── 2. Cada otimizador gera candidatos ──
        const candidateMultiplier = Math.min(15, Math.max(5, Math.ceil(100 / numGames)));
        const targetCandidates = numGames * candidateMultiplier;

        const candidateSets = {
            pairs:    PairOptimizer.generate(pool, drawSize, structural, hist, targetCandidates),
            triples:  TripleOptimizer.generate(pool, drawSize, structural, hist, targetCandidates),
            zones:    ZoneDistributor.generate(pool, drawSize, structural, profile, targetCandidates),
            sum:      SumBalancer.generate(pool, drawSize, structural, targetCandidates),
            coverage: CoverageMaximizer.generate(pool, drawSize, numGames * 3)
        };

        const totalCandidates = Object.values(candidateSets).reduce((s, c) => s + c.length, 0);
        console.log('[GAMEBUILDER] Candidatos gerados: pairs=' + candidateSets.pairs.length +
            ' triples=' + candidateSets.triples.length + ' zones=' + candidateSets.zones.length +
            ' sum=' + candidateSets.sum.length + ' coverage=' + candidateSets.coverage.length +
            ' | Total: ' + totalCandidates);

        // ── 3. ConvergenceEngine encontra a fronteira de Pareto ──
        const result = ConvergenceEngine.select(
            candidateSets, structural, numGames, drawSize, pool
        );

        // ── 4. Montar resultado ──
        const elapsed = Date.now() - t0;
        console.log('%c[GAMEBUILDER] ✓ ' + result.games.length + ' jogos formados em ' + elapsed + 'ms' +
            ' | Convergência média: ' + result.avgConvergence.toFixed(2) + '/5',
            'color: #F59E0B; font-weight:bold');

        return {
            games: result.games,
            analysis: {
                strategy: 'GAMEBUILDER_CONVERGENCE',
                engineVersion: 'GameBuilderEngine-v1.0',
                structural: structural,
                convergenceStats: result.stats,
                avgConvergence: result.avgConvergence,
                elapsed: elapsed + 'ms'
            }
        };
    }

    // ═══════════════════════════════════════════════════════════
    //  SCORE DE UM JOGO PELOS 5 CRITÉRIOS (usado pelo Árbitro)
    // ═══════════════════════════════════════════════════════════
    static scoreGame(game, structural, alreadySelected) {
        return ConvergenceEngine.scoreVector(game, structural, alreadySelected || []);
    }

    static _getHistory(gameKey) {
        try {
            if (typeof StatsService !== 'undefined') {
                const h = StatsService.getRecentResults(gameKey, 200);
                if (h && h.length > 0) return h;
            }
            if (typeof REAL_HISTORY_DB !== 'undefined') {
                return REAL_HISTORY_DB[gameKey] || [];
            }
        } catch (e) {}
        return [];
    }

    static _getProfile(gameKey) {
        const profiles = {
            megasena:   { startNum: 1,  endNum: 60, drawSize: 6,  zones: 6 },
            lotofacil:  { startNum: 1,  endNum: 25, drawSize: 15, zones: 5 },
            quina:      { startNum: 1,  endNum: 80, drawSize: 5,  zones: 8 },
            duplasena:  { startNum: 1,  endNum: 50, drawSize: 6,  zones: 5 },
            lotomania:  { startNum: 0,  endNum: 99, drawSize: 20, zones: 10 },
            timemania:  { startNum: 1,  endNum: 80, drawSize: 7,  zones: 8 },
            diadesorte: { startNum: 1,  endNum: 31, drawSize: 7,  zones: 4 }
        };
        return profiles[gameKey] || profiles.megasena;
    }

    static _fallback(gameKey, numGames, pool, drawSize, opts) {
        if (typeof SmartCoverageEngine !== 'undefined') {
            return SmartCoverageEngine.generate(gameKey, numGames, pool, [], drawSize, opts);
        }
        const games = [];
        const p = [...pool].sort(() => Math.random() - 0.5);
        for (let i = 0; i < numGames; i++) {
            const start = (i * drawSize) % p.length;
            const game = [];
            for (let j = 0; j < drawSize; j++) game.push(p[(start + j) % p.length]);
            games.push([...new Set(game)].slice(0, drawSize).sort((a, b) => a - b));
        }
        return { games, analysis: { strategy: 'FALLBACK_RANDOM' } };
    }
}

// ═══════════════════════════════════════════════════════════════════
//  STRUCTURAL ANALYZER — Mede o perfil estrutural do histórico real
// ═══════════════════════════════════════════════════════════════════
class StructuralAnalyzer {
    static analyze(history, startNum, endNum, drawSize) {
        const N = history.length;
        const totalRange = endNum - startNum + 1;
        const zoneSize = Math.ceil(totalRange / Math.max(4, Math.floor(totalRange / 10)));
        const numZones = Math.ceil(totalRange / zoneSize);

        if (N === 0) return this._defaults(drawSize, startNum, endNum, zoneSize, numZones);

        // Calcular somas
        const sums = [];
        const parities = {};
        const zoneCounts = [];
        const consecutiveCounts = [];
        const repetitions = [];

        // Top pares com decay temporal
        const pairFreq = {};
        const tripleFreq = {};

        for (let i = 0; i < N; i++) {
            const nums = (history[i].numbers || [])
                .concat(history[i].numbers2 || [])
                .filter(n => n >= startNum && n <= endNum)
                .sort((a, b) => a - b);

            if (nums.length < 2) continue;

            const decay = 1 / (1 + i * 0.05); // Sorteios recentes pesam mais

            // Soma
            sums.push(nums.reduce((s, n) => s + n, 0));

            // Paridade
            const evens = nums.filter(n => n % 2 === 0).length;
            const odds = nums.length - evens;
            const parKey = evens + 'p' + odds + 'i';
            parities[parKey] = (parities[parKey] || 0) + 1;

            // Zonas cobertas
            const zones = new Set(nums.map(n => Math.floor((n - startNum) / zoneSize)));
            zoneCounts.push(zones.size);

            // Consecutivos
            let runs = 0;
            for (let j = 1; j < nums.length; j++) {
                if (nums[j] === nums[j-1] + 1) runs++;
            }
            consecutiveCounts.push(runs);

            // Repetição com sorteio anterior
            if (i > 0) {
                const prev = new Set((history[i-1].numbers || []).concat(history[i-1].numbers2 || []));
                const rep = nums.filter(n => prev.has(n)).length;
                repetitions.push(rep);
            }

            // Pares (últimos 30 sorteios para pares)
            if (i < 30) {
                for (let a = 0; a < nums.length; a++) {
                    for (let b = a + 1; b < nums.length; b++) {
                        const key = nums[a] + '-' + nums[b];
                        pairFreq[key] = (pairFreq[key] || 0) + decay;
                    }
                }
            }

            // Trios (últimos 20 sorteios)
            if (i < 20 && nums.length >= 3) {
                for (let a = 0; a < nums.length; a++) {
                    for (let b = a + 1; b < nums.length; b++) {
                        for (let c = b + 1; c < nums.length; c++) {
                            const key = nums[a] + '-' + nums[b] + '-' + nums[c];
                            tripleFreq[key] = (tripleFreq[key] || 0) + decay;
                        }
                    }
                }
            }
        }

        // Percentis da soma
        sums.sort((a, b) => a - b);
        const sumP10 = sums[Math.floor(sums.length * 0.10)] || sums[0];
        const sumP25 = sums[Math.floor(sums.length * 0.25)] || sums[0];
        const sumP50 = sums[Math.floor(sums.length * 0.50)] || sums[0];
        const sumP75 = sums[Math.floor(sums.length * 0.75)] || sums[sums.length - 1];
        const sumP90 = sums[Math.floor(sums.length * 0.90)] || sums[sums.length - 1];

        // Paridade mais comum
        const topParity = Object.entries(parities).sort((a, b) => b[1] - a[1])[0];

        // Zonas médias
        const avgZones = zoneCounts.length > 0
            ? zoneCounts.reduce((s, v) => s + v, 0) / zoneCounts.length : numZones * 0.7;
        const minZones = Math.floor(avgZones - 0.5);

        // Consecutivos: range aceitável
        consecutiveCounts.sort((a, b) => a - b);
        const consP10 = consecutiveCounts[Math.floor(consecutiveCounts.length * 0.10)] || 0;
        const consP90 = consecutiveCounts[Math.floor(consecutiveCounts.length * 0.90)] || 3;

        // Repetição média
        const repMean = repetitions.length > 0
            ? repetitions.reduce((s, v) => s + v, 0) / repetitions.length : 1.5;
        const repStd = repetitions.length > 1
            ? Math.sqrt(repetitions.reduce((s, v) => s + (v - repMean) ** 2, 0) / repetitions.length) : 1.5;

        // Top pares ordenados
        const topPairs = Object.entries(pairFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([key, freq]) => ({ nums: key.split('-').map(Number), freq }));

        // Top trios ordenados
        const topTriples = Object.entries(tripleFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([key, freq]) => ({ nums: key.split('-').map(Number), freq }));

        // Último sorteio (para RepetitionAnalyzer)
        const lastDraw = N > 0
            ? (history[0].numbers || []).concat(history[0].numbers2 || [])
                .filter(n => n >= startNum && n <= endNum)
            : [];

        return {
            sumP10, sumP25, sumP50, sumP75, sumP90,
            topParity: topParity ? topParity[0] : (Math.floor(drawSize/2) + 'p' + Math.ceil(drawSize/2) + 'i'),
            topParityEven: topParity ? parseInt(topParity[0]) : Math.floor(drawSize / 2),
            avgZones, minZones,
            consP10, consP90,
            repMean, repStd,
            repMin: Math.max(0, Math.round(repMean - repStd)),
            repMax: Math.round(repMean + repStd),
            topPairs, topTriples,
            lastDraw,
            zoneSize, numZones,
            startNum, endNum, drawSize,
            historyLength: N
        };
    }

    static _defaults(drawSize, startNum, endNum, zoneSize, numZones) {
        const mid = (startNum + endNum) / 2;
        const approxSum = mid * drawSize;
        return {
            sumP10: approxSum * 0.7, sumP25: approxSum * 0.85,
            sumP50: approxSum, sumP75: approxSum * 1.15, sumP90: approxSum * 1.3,
            topParity: Math.floor(drawSize/2) + 'p' + Math.ceil(drawSize/2) + 'i',
            topParityEven: Math.floor(drawSize / 2),
            avgZones: numZones * 0.7, minZones: Math.floor(numZones * 0.6),
            consP10: 0, consP90: 2,
            repMean: 1.5, repStd: 1.5, repMin: 0, repMax: 3,
            topPairs: [], topTriples: [], lastDraw: [],
            zoneSize, numZones, startNum, endNum, drawSize, historyLength: 0
        };
    }
}

// ═══════════════════════════════════════════════════════════════
//  1. PAIR OPTIMIZER — Gera candidatos ancorados em duplas fortes
// ═══════════════════════════════════════════════════════════════
class PairOptimizer {
    static generate(pool, drawSize, structural, history, target) {
        const candidates = [];
        const poolSet = new Set(pool);
        const { topPairs } = structural;

        // Filtrar pares que estão no pool atual
        const validPairs = topPairs.filter(p => poolSet.has(p.nums[0]) && poolSet.has(p.nums[1]));

        if (validPairs.length === 0) return [];

        // Para cada par forte, construir um jogo em torno dele
        const limit = Math.min(validPairs.length, target);
        for (let i = 0; i < limit; i++) {
            const pair = validPairs[i].nums;
            const game = this._buildAroundPair(pair, pool, drawSize, structural);
            if (game && game.length === drawSize) {
                candidates.push({ game, source: 'pairs', anchorScore: validPairs[i].freq });
            }
        }

        return candidates;
    }

    static _buildAroundPair(pair, pool, drawSize, structural) {
        const game = [...pair];
        const usedZones = new Set(pair.map(n =>
            Math.floor((n - structural.startNum) / structural.zoneSize)));

        // Preencher restante priorizando zonas não cobertas e soma-alvo
        const remaining = pool.filter(n => !game.includes(n));
        const targetSum = structural.sumP50;
        const currentSum = game.reduce((s, n) => s + n, 0);
        const needed = drawSize - game.length;

        // Ordenar remaining: zonas novas > soma-alvo
        remaining.sort((a, b) => {
            const zoneA = Math.floor((a - structural.startNum) / structural.zoneSize);
            const zoneB = Math.floor((b - structural.startNum) / structural.zoneSize);
            const newZoneA = usedZones.has(zoneA) ? 0 : 1;
            const newZoneB = usedZones.has(zoneB) ? 0 : 1;
            if (newZoneA !== newZoneB) return newZoneB - newZoneA;
            // Aproximar da soma alvo
            const targetRemain = (targetSum - currentSum) / needed;
            return Math.abs(a - targetRemain) - Math.abs(b - targetRemain);
        });

        for (let i = 0; i < needed && i < remaining.length; i++) {
            game.push(remaining[i]);
            usedZones.add(Math.floor((remaining[i] - structural.startNum) / structural.zoneSize));
        }

        return game.length === drawSize ? game.sort((a, b) => a - b) : null;
    }
}

// ═══════════════════════════════════════════════════════════════
//  2. TRIPLE OPTIMIZER — Gera candidatos ancorados em trios fortes
// ═══════════════════════════════════════════════════════════════
class TripleOptimizer {
    static generate(pool, drawSize, structural, history, target) {
        const candidates = [];
        const poolSet = new Set(pool);
        const { topTriples } = structural;

        if (structural.historyLength < 15 || topTriples.length === 0) return [];

        const validTriples = topTriples.filter(t =>
            t.nums.every(n => poolSet.has(n)));

        const limit = Math.min(validTriples.length, target);
        for (let i = 0; i < limit; i++) {
            const triple = validTriples[i].nums;
            const game = this._buildAroundTriple(triple, pool, drawSize, structural);
            if (game && game.length === drawSize) {
                candidates.push({ game, source: 'triples', anchorScore: validTriples[i].freq });
            }
        }

        return candidates;
    }

    static _buildAroundTriple(triple, pool, drawSize, structural) {
        const game = [...triple];
        const usedZones = new Set(triple.map(n =>
            Math.floor((n - structural.startNum) / structural.zoneSize)));
        const needed = drawSize - game.length;
        const remaining = pool.filter(n => !game.includes(n));

        // Preencher com zonas novas, aproximando soma alvo
        const targetRemain = (structural.sumP50 - game.reduce((s, n) => s + n, 0)) / needed;
        remaining.sort((a, b) => {
            const zA = Math.floor((a - structural.startNum) / structural.zoneSize);
            const zB = Math.floor((b - structural.startNum) / structural.zoneSize);
            const nA = usedZones.has(zA) ? 0 : 1;
            const nB = usedZones.has(zB) ? 0 : 1;
            if (nA !== nB) return nB - nA;
            return Math.abs(a - targetRemain) - Math.abs(b - targetRemain);
        });

        for (let i = 0; i < needed && i < remaining.length; i++) {
            game.push(remaining[i]);
            usedZones.add(Math.floor((remaining[i] - structural.startNum) / structural.zoneSize));
        }

        return game.length === drawSize ? game.sort((a, b) => a - b) : null;
    }
}

// ═══════════════════════════════════════════════════════════════
//  3. ZONE DISTRIBUTOR — Gera candidatos com cobertura de zonas
// ═══════════════════════════════════════════════════════════════
class ZoneDistributor {
    static generate(pool, drawSize, structural, profile, target) {
        const candidates = [];
        const { startNum, zoneSize, numZones, minZones } = structural;

        // Agrupar pool por zona
        const byZone = {};
        for (const n of pool) {
            const z = Math.floor((n - startNum) / zoneSize);
            if (!byZone[z]) byZone[z] = [];
            byZone[z].push(n);
        }

        const availableZones = Object.keys(byZone).map(Number).sort((a, b) => a - b);
        if (availableZones.length === 0) return [];

        for (let attempt = 0; attempt < target; attempt++) {
            const game = this._buildWithZoneCoverage(byZone, availableZones, drawSize, structural, attempt);
            if (game && game.length === drawSize) {
                candidates.push({ game, source: 'zones', anchorScore: new Set(game.map(n =>
                    Math.floor((n - startNum) / zoneSize))).size });
            }
        }

        return candidates;
    }

    static _buildWithZoneCoverage(byZone, availableZones, drawSize, structural, seed) {
        const game = [];
        const usedZones = new Set();

        // Rotacionar zona de início para diversidade
        const startZoneIdx = seed % availableZones.length;
        const zoneOrder = [
            ...availableZones.slice(startZoneIdx),
            ...availableZones.slice(0, startZoneIdx)
        ];

        // 1. Pegar 1 número de cada zona até ter drawSize números
        for (const z of zoneOrder) {
            if (game.length >= drawSize) break;
            const candidates = byZone[z].filter(n => !game.includes(n));
            if (candidates.length === 0) continue;
            // Escolher número desta zona que mais aproxima a soma alvo
            const needed = drawSize - game.length;
            const currentSum = game.reduce((s, n) => s + n, 0);
            const targetN = (structural.sumP50 - currentSum) / needed;
            candidates.sort((a, b) => Math.abs(a - targetN) - Math.abs(b - targetN));
            game.push(candidates[0]);
            usedZones.add(z);
        }

        // 2. Completar se necessário
        if (game.length < drawSize) {
            const remaining = Object.values(byZone).flat()
                .filter(n => !game.includes(n))
                .sort(() => Math.random() - 0.5);
            while (game.length < drawSize && remaining.length > 0) {
                game.push(remaining.shift());
            }
        }

        return game.length === drawSize ? game.sort((a, b) => a - b) : null;
    }
}

// ═══════════════════════════════════════════════════════════════
//  4. SUM BALANCER — Gera candidatos dentro da faixa de soma
// ═══════════════════════════════════════════════════════════════
class SumBalancer {
    static generate(pool, drawSize, structural, target) {
        const candidates = [];
        const { sumP10, sumP90, sumP50 } = structural;

        // Tentar construir jogos aleatórios que passem no filtro de soma
        let attempts = 0;
        const maxAttempts = target * 10;

        while (candidates.length < target && attempts < maxAttempts) {
            attempts++;
            const game = this._sampleWithSumTarget(pool, drawSize, sumP50, sumP10, sumP90);
            if (game) {
                candidates.push({ game, source: 'sum', anchorScore: 1.0 - Math.abs(game.reduce((s,n)=>s+n,0) - sumP50) / (sumP90 - sumP10 + 1) });
            }
        }

        return candidates;
    }

    static _sampleWithSumTarget(pool, drawSize, targetSum, minSum, maxSum) {
        // Embaralhar e pegar primeiros drawSize elementos que somem no range
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const game = shuffled.slice(0, drawSize).sort((a, b) => a - b);
        const sum = game.reduce((s, n) => s + n, 0);
        if (sum >= minSum && sum <= maxSum) return game;

        // Ajuste: se soma alta, trocar números grandes por pequenos
        if (sum > maxSum) {
            const sorted = [...pool].sort((a, b) => a - b);
            const highGame = [...pool].sort((a, b) => b - a).slice(0, drawSize);
            for (let i = 0; i < highGame.length; i++) {
                const candidate = [...highGame];
                // Trocar número mais alto por um menor
                for (const small of sorted) {
                    if (!candidate.includes(small)) {
                        candidate[i] = small;
                        candidate.sort((a, b) => a - b);
                        const newSum = candidate.reduce((s, n) => s + n, 0);
                        if (newSum >= minSum && newSum <= maxSum) return candidate;
                        break;
                    }
                }
            }
        }

        if (sum < minSum) {
            const sorted = [...pool].sort((a, b) => b - a);
            const lowGame = [...pool].sort((a, b) => a - b).slice(0, drawSize);
            for (let i = 0; i < lowGame.length; i++) {
                const candidate = [...lowGame];
                for (const big of sorted) {
                    if (!candidate.includes(big)) {
                        candidate[i] = big;
                        candidate.sort((a, b) => a - b);
                        const newSum = candidate.reduce((s, n) => s + n, 0);
                        if (newSum >= minSum && newSum <= maxSum) return candidate;
                        break;
                    }
                }
            }
        }

        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
//  5. COVERAGE MAXIMIZER — Set Cover Greedy (garantia 1-1/e)
// ═══════════════════════════════════════════════════════════════
class CoverageMaximizer {
    static generate(pool, drawSize, target) {
        const candidates = [];
        const covered = new Set();

        for (let i = 0; i < target; i++) {
            const game = this._greedyMaxCoverage(pool, drawSize, covered);
            if (!game) break;
            candidates.push({ game, source: 'coverage', anchorScore: 1.0 });
            for (const n of game) covered.add(n);
        }

        return candidates;
    }

    static _greedyMaxCoverage(pool, drawSize, covered) {
        // Selecionar números que mais contribuem para cobertura nova
        const uncovered = pool.filter(n => !covered.has(n));
        const allOptions = uncovered.length >= drawSize ? uncovered : pool;

        // Ordenar por: não coberto > aleatório para diversidade
        const shuffled = [...allOptions].sort((a, b) => {
            const aNew = covered.has(a) ? 0 : 1;
            const bNew = covered.has(b) ? 0 : 1;
            if (aNew !== bNew) return bNew - aNew;
            return Math.random() - 0.5;
        });

        const game = shuffled.slice(0, drawSize).sort((a, b) => a - b);
        return game.length === drawSize ? game : null;
    }
}

// ═══════════════════════════════════════════════════════════════
//  CONVERGENCE ENGINE — O TERCEIRO
//
//  Recebe candidatos de todos os otimizadores.
//  Para cada candidato, calcula um vetor de scores [0,1] por critério.
//  Encontra a fronteira de Pareto.
//  Seleciona N jogos da fronteira com máxima diversidade.
// ═══════════════════════════════════════════════════════════════
class ConvergenceEngine {

    static select(candidateSets, structural, numGames, drawSize, pool) {
        // 1. Unir todos os candidatos (desduplicar por fingerprint)
        const seen = new Set();
        const allCandidates = [];

        for (const [source, candidates] of Object.entries(candidateSets)) {
            for (const c of candidates) {
                const fp = c.game.join(',');
                if (!seen.has(fp)) {
                    seen.add(fp);
                    allCandidates.push(c);
                }
            }
        }

        console.log('[CONVERGENCE] Total candidatos únicos: ' + allCandidates.length);

        if (allCandidates.length === 0) {
            return { games: [], avgConvergence: 0, stats: {} };
        }

        // 2. Pontuar cada candidato pelos 5 critérios
        const scored = allCandidates.map(c => {
            const sv = this.scoreVector(c.game, structural, []);
            return { ...c, scoreVector: sv, totalScore: sv.reduce((s, v) => s + v, 0) };
        });

        // 3. Encontrar fronteira de Pareto
        const paretoFront = this._findParetoFront(scored);
        console.log('[CONVERGENCE] Fronteira de Pareto: ' + paretoFront.length + ' jogos');

        // 4. Selecionar N jogos com diversidade máxima da fronteira de Pareto
        const selected = this._selectDiverse(paretoFront, scored, numGames, drawSize, structural);

        // 5. Calcular stats
        const avgConvergence = selected.length > 0
            ? selected.reduce((s, g) => s + g.totalScore, 0) / selected.length : 0;

        const stats = {
            totalCandidates: allCandidates.length,
            paretoFrontSize: paretoFront.length,
            avgCriteriaSatisfied: avgConvergence.toFixed(2),
            sourceDistribution: this._countSources(selected)
        };

        return {
            games: selected.map(s => s.game),
            avgConvergence: avgConvergence / 5, // normalizar para [0,1]
            stats
        };
    }

    // Vetor de 5 scores [0,1] para cada critério
    static scoreVector(game, structural, alreadySelected) {
        const scores = [];

        // Critério 1: Duplas fortes (PairOptimizer)
        scores.push(this._scorePairs(game, structural));

        // Critério 2: Trios fortes (TripleOptimizer)
        scores.push(this._scoreTriples(game, structural));

        // Critério 3: Cobertura de zonas (ZoneDistributor)
        scores.push(this._scoreZones(game, structural));

        // Critério 4: Soma dentro da faixa (SumBalancer)
        scores.push(this._scoreSum(game, structural));

        // Critério 5: Diversidade vs jogos já selecionados (CoverageMaximizer)
        scores.push(this._scoreDiversity(game, alreadySelected));

        return scores;
    }

    static _scorePairs(game, structural) {
        if (structural.topPairs.length === 0) return 0.5;
        const gameNums = new Set(game);
        let matched = 0;
        const checkCount = Math.min(20, structural.topPairs.length);
        for (let i = 0; i < checkCount; i++) {
            const p = structural.topPairs[i].nums;
            if (gameNums.has(p[0]) && gameNums.has(p[1])) matched++;
        }
        return Math.min(1, matched / Math.max(1, game.length / 2));
    }

    static _scoreTriples(game, structural) {
        if (structural.topTriples.length === 0 || structural.historyLength < 15) return 0.5;
        const gameNums = new Set(game);
        const checkCount = Math.min(10, structural.topTriples.length);
        for (let i = 0; i < checkCount; i++) {
            const t = structural.topTriples[i].nums;
            if (gameNums.has(t[0]) && gameNums.has(t[1]) && gameNums.has(t[2])) return 1.0;
        }
        // Verificar se tem algum trio parcialmente presente
        let best = 0;
        for (let i = 0; i < checkCount; i++) {
            const t = structural.topTriples[i].nums;
            const matches = t.filter(n => gameNums.has(n)).length;
            best = Math.max(best, matches / 3);
        }
        return best;
    }

    static _scoreZones(game, structural) {
        const { startNum, zoneSize, numZones, minZones } = structural;
        const zones = new Set(game.map(n => Math.floor((n - startNum) / zoneSize)));
        const coverage = zones.size / Math.max(1, numZones);
        const meetsMin = zones.size >= minZones ? 1.0 : zones.size / minZones;
        return Math.min(1, (coverage + meetsMin) / 2);
    }

    static _scoreSum(game, structural) {
        const { sumP10, sumP25, sumP75, sumP90, sumP50 } = structural;
        const sum = game.reduce((s, n) => s + n, 0);
        if (sum < sumP10 || sum > sumP90) return 0.0;
        if (sum >= sumP25 && sum <= sumP75) return 1.0;
        // Interpolar nas caudas
        if (sum < sumP25) return 0.5 + 0.5 * (sum - sumP10) / (sumP25 - sumP10 + 1);
        return 0.5 + 0.5 * (sumP90 - sum) / (sumP90 - sumP75 + 1);
    }

    static _scoreDiversity(game, alreadySelected) {
        if (alreadySelected.length === 0) return 1.0;
        const gameSet = new Set(game);
        let minOverlap = game.length;
        for (const sel of alreadySelected) {
            const overlap = (sel.game || sel).filter(n => gameSet.has(n)).length;
            minOverlap = Math.min(minOverlap, overlap);
        }
        // Overlap 0 = perfeito (1.0), overlap = drawSize = idêntico (0.0)
        return 1.0 - minOverlap / game.length;
    }

    // Domínio de Pareto: A domina B se A >= B em TODOS os critérios e > em pelo menos 1
    static _findParetoFront(scored) {
        const front = [];
        for (let i = 0; i < scored.length; i++) {
            let dominated = false;
            for (let j = 0; j < scored.length; j++) {
                if (i === j) continue;
                if (this._dominates(scored[j].scoreVector, scored[i].scoreVector)) {
                    dominated = true;
                    break;
                }
            }
            if (!dominated) front.push(scored[i]);
        }
        // Se fronteira for vazia ou muito pequena, usar top por totalScore
        if (front.length < Math.max(5, scored.length * 0.1)) {
            return scored.sort((a, b) => b.totalScore - a.totalScore).slice(0, Math.ceil(scored.length * 0.2));
        }
        return front;
    }

    static _dominates(svA, svB) {
        // A domina B: A >= B em todos e A > B em pelo menos 1
        let betterInAtLeastOne = false;
        for (let i = 0; i < svA.length; i++) {
            if (svA[i] < svB[i] - 0.001) return false; // A é pior em algum
            if (svA[i] > svB[i] + 0.001) betterInAtLeastOne = true;
        }
        return betterInAtLeastOne;
    }

    // Selecionar N jogos da fronteira de Pareto com máxima diversidade
    static _selectDiverse(paretoFront, allScored, numGames, drawSize, structural) {
        const selected = [];
        const available = [...paretoFront].sort((a, b) => b.totalScore - a.totalScore);

        // Se fronteira tem menos que numGames, complementar com o resto
        const supplementary = allScored
            .filter(c => !paretoFront.includes(c))
            .sort((a, b) => b.totalScore - a.totalScore);

        const pool = [...available, ...supplementary];

        while (selected.length < numGames && pool.length > 0) {
            // Escolher o candidato com maior diversidade em relação aos já selecionados
            let bestIdx = 0;
            let bestScore = -1;

            for (let i = 0; i < Math.min(pool.length, 50); i++) {
                const candidate = pool[i];
                // Recalcular diversity score com os já selecionados
                const divScore = this._scoreDiversity(candidate.game, selected);
                // Combinar qualidade (totalScore) com diversidade
                const combinedScore = candidate.totalScore * 0.6 + divScore * 5 * 0.4;
                if (combinedScore > bestScore) {
                    bestScore = combinedScore;
                    bestIdx = i;
                }
            }

            const chosen = pool.splice(bestIdx, 1)[0];
            // Recalcular score vector com os já selecionados (para diversidade atualizada)
            chosen.scoreVector = this.scoreVector(chosen.game, structural, selected);
            chosen.totalScore = chosen.scoreVector.reduce((s, v) => s + v, 0);
            selected.push(chosen);
        }

        return selected;
    }

    static _countSources(selected) {
        const counts = {};
        for (const s of selected) {
            counts[s.source] = (counts[s.source] || 0) + 1;
        }
        return counts;
    }
}

console.log('%c[GAMEBUILDER] ★ GameBuilderEngine v1.0 — Otimização Multi-Objetivo carregado', 'color: #F59E0B; font-weight: bold; font-size: 14px;');

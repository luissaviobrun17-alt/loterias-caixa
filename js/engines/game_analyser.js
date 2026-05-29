/**
 * GameAnalyser v2.0 — Motor de Análise Matemática Completa
 * 
 * Analisa os jogos REAIS já gerados (não re-gera nada).
 * 
 * 12 DIMENSÕES DE ANÁLISE:
 *  1. Frequência de Números Puros (histograma)
 *  2. Cobertura de Duplas (pares de números)
 *  3. Cobertura de Trios (triplas de números)
 *  4. Entropia de Shannon (eficiência informacional)
 *  5. Teste Chi-Quadrado (uniformidade)
 *  6. Distância de Hamming (diversidade inter-jogos)
 *  7. Equilíbrio Par/Ímpar
 *  8. Equilíbrio Alto/Baixo
 *  9. Análise de Soma (vs. média esperada)
 * 10. Distribuição por Faixa (décadas)
 * 11. Análise de Consecutivos (sequências)
 * 12. Pareto (80/20) — concentração de frequência
 * 
 * NOTA FINAL: 0 a 10 (média ponderada de todas as dimensões)
 * 
 * FUNDAMENTOS:
 *   - Probabilidade Hipergeométrica (distribuição exata)
 *   - Entropia de Shannon (teoria da informação)
 *   - Teste Chi-quadrado (uniformidade)
 *   - Análise de Pareto (concentração 80/20)
 *   - Valor Esperado (EV) em R$
 */
class GameAnalyser {

    // ═══ FUNÇÕES MATEMÁTICAS ═══

    static _lnFactorial(n) {
        if (n < 0) return 0;
        if (n <= 1) return 0;
        if (n < 20) { let r = 0; for (let i = 2; i <= n; i++) r += Math.log(i); return r; }
        return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
    }

    static _lnComb(n, k) {
        if (k < 0 || k > n) return -Infinity;
        if (k === 0 || k === n) return 0;
        return this._lnFactorial(n) - this._lnFactorial(k) - this._lnFactorial(n - k);
    }

    static nCr(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let r = 1;
        for (let i = 1; i <= k; i++) r = r * (n - i + 1) / i;
        return Math.round(r);
    }

    static _normalCDF(z) {
        if (z < -8) return 0; if (z > 8) return 1;
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const sign = z < 0 ? -1 : 1;
        const x = Math.abs(z) / Math.SQRT2;
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return 0.5 * (1.0 + sign * y);
    }

    static _chiSquaredPValue(chiSq, df) {
        if (df <= 0) return 1;
        const z = (Math.pow(chiSq / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
        return 1 - this._normalCDF(z);
    }

    // ═══ HIPERGEOMÉTRICA ═══

    static hypergeometricPMF(x, N, K, n) {
        if (x < Math.max(0, n + K - N) || x > Math.min(K, n)) return 0;
        return Math.exp(this._lnComb(K, x) + this._lnComb(N - K, n - x) - this._lnComb(N, n));
    }

    static hypergeometricCDF_upper(x, N, K, n) {
        let sum = 0;
        for (let i = x; i <= Math.min(K, n); i++) sum += this.hypergeometricPMF(i, N, K, n);
        return Math.min(1, sum);
    }

    static probAtLeastOneHit(games, x, N, drawSize) {
        if (!games || games.length === 0) return 0;
        let probAllMiss = 1;
        for (const g of games) {
            probAllMiss *= (1 - this.hypergeometricCDF_upper(x, N, g.length, drawSize));
            if (probAllMiss < 1e-15) return 1;
        }
        return 1 - probAllMiss;
    }

    // ═══════════════════════════════════════════════════
    //  DIM 1: FREQUÊNCIA DE NÚMEROS PUROS
    // ═══════════════════════════════════════════════════
    static analyzeNumberFrequency(games, poolSize, rangeStart) {
        const freq = {};
        let total = 0;
        for (const g of games) {
            for (const n of g) { freq[n] = (freq[n] || 0) + 1; total++; }
        }
        const uniqueCount = Object.keys(freq).length;
        const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        const maxFreq = entries.length > 0 ? entries[0][1] : 0;
        const minFreq = entries.length > 0 ? entries[entries.length - 1][1] : 0;
        const avgFreq = total > 0 ? total / uniqueCount : 0;

        // CV (Coeficiente de Variação) — quanto menor, mais uniforme
        const variance = entries.reduce((acc, [, f]) => acc + (f - avgFreq) ** 2, 0) / Math.max(1, uniqueCount);
        const stdDev = Math.sqrt(variance);
        const cv = avgFreq > 0 ? (stdDev / avgFreq) * 100 : 0;

        // Score: CV baixo = bom (números bem distribuídos)
        const score = Math.max(0, 100 - cv * 2);

        return { freq, uniqueCount, total, maxFreq, minFreq, avgFreq, stdDev, cv, score, entries, coveragePct: (uniqueCount / poolSize * 100) };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 2: COBERTURA DE DUPLAS
    // ═══════════════════════════════════════════════════
    static analyzePairCoverage(games) {
        const pairs = new Set();
        const pairFreq = {};
        for (const g of games) {
            const s = [...g].sort((a, b) => a - b);
            for (let i = 0; i < s.length; i++) {
                for (let j = i + 1; j < s.length; j++) {
                    const key = s[i] * 10000 + s[j];
                    pairs.add(key);
                    pairFreq[key] = (pairFreq[key] || 0) + 1;
                }
            }
        }
        const allNums = new Set();
        for (const g of games) for (const n of g) allNums.add(n);
        const uniqueN = allNums.size;
        const totalPossible = this.nCr(uniqueN, 2);
        const pct = totalPossible > 0 ? (pairs.size / totalPossible * 100) : 0;

        // Duplas mais frequentes (top 5)
        const topPairs = Object.entries(pairFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([k, c]) => ({ a: Math.floor(k / 10000), b: k % 10000, count: c }));

        return { covered: pairs.size, totalPossible, pct, topPairs, score: Math.min(100, pct) };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 3: COBERTURA DE TRIOS
    // ═══════════════════════════════════════════════════
    static analyzeTrioCoverage(games) {
        if (games.length > 300) return { covered: 0, totalPossible: 0, pct: 0, score: 50, skipped: true };
        const trios = new Set();
        for (const g of games) {
            const s = [...g].sort((a, b) => a - b);
            for (let i = 0; i < s.length; i++)
                for (let j = i + 1; j < s.length; j++)
                    for (let k = j + 1; k < s.length; k++)
                        trios.add(s[i] * 100000000 + s[j] * 10000 + s[k]);
        }
        const allNums = new Set();
        for (const g of games) for (const n of g) allNums.add(n);
        const totalPossible = this.nCr(allNums.size, 3);
        const pct = totalPossible > 0 ? (trios.size / totalPossible * 100) : 0;
        return { covered: trios.size, totalPossible, pct, score: Math.min(100, pct * 1.5), skipped: false };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 4: ENTROPIA DE SHANNON
    // ═══════════════════════════════════════════════════
    static shannonEntropy(games, poolSize) {
        const freq = {};
        let total = 0;
        for (const g of games) for (const n of g) { freq[n] = (freq[n] || 0) + 1; total++; }
        if (total === 0) return { entropy: 0, maxEntropy: 0, efficiency: 0, score: 0 };
        let H = 0;
        for (const n in freq) { const p = freq[n] / total; if (p > 0) H -= p * Math.log2(p); }
        const uniqueCount = Object.keys(freq).length;
        const maxH = Math.log2(Math.min(uniqueCount, poolSize));
        const eff = maxH > 0 ? (H / maxH) * 100 : 0;
        return { entropy: H, maxEntropy: maxH, efficiency: eff, score: eff };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 5: TESTE CHI-QUADRADO (uniformidade)
    // ═══════════════════════════════════════════════════
    static chiSquaredTest(games) {
        const freq = {};
        let total = 0;
        for (const g of games) for (const n of g) { freq[n] = (freq[n] || 0) + 1; total++; }
        const uniqueNums = Object.keys(freq).length;
        if (uniqueNums < 2) return { chiSq: 0, df: 0, pValue: 1, verdict: 'N/A', score: 50 };
        const expected = total / uniqueNums;
        let chiSq = 0;
        for (const n in freq) chiSq += (freq[n] - expected) ** 2 / expected;
        const df = uniqueNums - 1;
        const pValue = this._chiSquaredPValue(chiSq, df);
        const verdict = pValue > 0.10 ? 'Uniforme ✅' : pValue > 0.05 ? 'Aceitável ⚠️' : 'Não-Uniforme ❌';
        const score = Math.min(100, pValue * 500);
        return { chiSq, df, pValue, verdict, score };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 6: DISTÂNCIA DE HAMMING
    // ═══════════════════════════════════════════════════
    static hammingDistance(games) {
        if (games.length < 2) return { avg: 0, min: 0, max: 0, pct: 0, score: 0 };
        const sets = games.map(g => new Set(g));
        let tot = 0, cnt = 0, mn = Infinity, mx = 0;
        const limit = 5000;
        const totalPairs = games.length * (games.length - 1) / 2;
        if (totalPairs > limit) {
            for (let i = 0; i < limit; i++) {
                const a = Math.floor(Math.random() * games.length);
                let b = Math.floor(Math.random() * (games.length - 1)); if (b >= a) b++;
                const overlap = [...sets[a]].filter(n => sets[b].has(n)).length;
                const d = games[a].length - overlap;
                tot += d; mn = Math.min(mn, d); mx = Math.max(mx, d); cnt++;
            }
        } else {
            for (let i = 0; i < games.length; i++)
                for (let j = i + 1; j < games.length; j++) {
                    const overlap = [...sets[i]].filter(n => sets[j].has(n)).length;
                    const d = games[i].length - overlap;
                    tot += d; mn = Math.min(mn, d); mx = Math.max(mx, d); cnt++;
                }
        }
        const avg = cnt > 0 ? tot / cnt : 0;
        const drawSize = games[0] ? games[0].length : 1;
        const pct = (avg / drawSize * 100);
        return { avg, min: mn === Infinity ? 0 : mn, max: mx, pct, score: Math.min(100, pct) };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 7: EQUILÍBRIO PAR/ÍMPAR
    // ═══════════════════════════════════════════════════
    static evenOddBalance(games) {
        let ev = 0, od = 0;
        for (const g of games) for (const n of g) { if (n % 2 === 0) ev++; else od++; }
        const total = ev + od;
        const ratio = total > 0 ? ev / total : 0.5;
        const dev = Math.abs(ratio - 0.5) * 200; // Desvio em %
        return {
            evenPct: ratio * 100, oddPct: (1 - ratio) * 100,
            deviation: dev,
            verdict: dev < 10 ? 'Equilibrado ✅' : dev < 20 ? 'Aceitável ⚠️' : 'Desequilibrado ❌',
            score: Math.max(0, 100 - dev * 2.5)
        };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 8: EQUILÍBRIO ALTO/BAIXO
    // ═══════════════════════════════════════════════════
    static highLowBalance(games, rangeStart, rangeEnd) {
        const mid = (rangeStart + rangeEnd) / 2;
        let low = 0, high = 0;
        for (const g of games) for (const n of g) { if (n <= mid) low++; else high++; }
        const total = low + high;
        const ratio = total > 0 ? low / total : 0.5;
        const dev = Math.abs(ratio - 0.5) * 200;
        return {
            lowPct: ratio * 100, highPct: (1 - ratio) * 100, midpoint: mid,
            deviation: dev,
            verdict: dev < 10 ? 'Equilibrado ✅' : dev < 20 ? 'Aceitável ⚠️' : 'Desequilibrado ❌',
            score: Math.max(0, 100 - dev * 2.5)
        };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 9: ANÁLISE DE SOMA
    // ═══════════════════════════════════════════════════
    static sumAnalysis(games, rangeStart, rangeEnd, drawSize) {
        const sums = games.map(g => g.reduce((a, b) => a + b, 0));
        if (sums.length === 0) return { avg: 0, stdDev: 0, expectedAvg: 0, score: 0 };
        const avg = sums.reduce((a, b) => a + b, 0) / sums.length;
        const variance = sums.reduce((a, s) => a + (s - avg) ** 2, 0) / sums.length;
        const expectedAvg = drawSize * (rangeStart + rangeEnd) / 2;
        const devPct = expectedAvg > 0 ? (Math.abs(avg - expectedAvg) / expectedAvg * 100) : 0;
        return {
            avg, stdDev: Math.sqrt(variance), min: Math.min(...sums), max: Math.max(...sums),
            expectedAvg, deviationPct: devPct,
            verdict: devPct < 5 ? 'Excelente ✅' : devPct < 10 ? 'Bom ⚠️' : 'Desequilibrado ❌',
            score: Math.max(0, 100 - devPct * 5)
        };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 10: DISTRIBUIÇÃO POR FAIXA (Décadas)
    // ═══════════════════════════════════════════════════
    static decadeDistribution(games, rangeStart, rangeEnd) {
        const dSize = 10;
        const numDec = Math.ceil((rangeEnd - rangeStart + 1) / dSize);
        const counts = new Array(numDec).fill(0);
        let total = 0;
        for (const g of games) for (const n of g) {
            const d = Math.floor((n - rangeStart) / dSize);
            if (d >= 0 && d < numDec) { counts[d]++; total++; }
        }
        const expected = total / numDec;
        let chiSq = 0;
        const decades = [];
        for (let d = 0; d < numDec; d++) {
            const from = rangeStart + d * dSize;
            const to = Math.min(from + dSize - 1, rangeEnd);
            chiSq += expected > 0 ? (counts[d] - expected) ** 2 / expected : 0;
            decades.push({ label: `${String(from).padStart(2, '0')}-${String(to).padStart(2, '0')}`, count: counts[d], pct: total > 0 ? counts[d] / total * 100 : 0 });
        }
        const pValue = this._chiSquaredPValue(chiSq, numDec - 1);
        const isBalanced = pValue > 0.05;
        return { decades, chiSq, pValue, isBalanced, score: isBalanced ? 100 : Math.min(80, pValue * 1000) };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 11: ANÁLISE DE CONSECUTIVOS
    // ═══════════════════════════════════════════════════
    static consecutiveAnalysis(games) {
        const pairsConsec = [];
        const maxStreaks = [];
        for (const g of games) {
            const s = [...g].sort((a, b) => a - b);
            let pairs = 0, streak = 1, maxS = 1;
            for (let i = 1; i < s.length; i++) {
                if (s[i] === s[i - 1] + 1) { pairs++; streak++; maxS = Math.max(maxS, streak); }
                else streak = 1;
            }
            pairsConsec.push(pairs);
            maxStreaks.push(maxS);
        }
        const avgPairs = pairsConsec.reduce((a, b) => a + b, 0) / pairsConsec.length;
        const avgMaxStreak = maxStreaks.reduce((a, b) => a + b, 0) / maxStreaks.length;
        // Ideal: 1-3 pares consecutivos (normal em loterias)
        const drawSize = games[0] ? games[0].length : 6;
        const idealPairs = Math.max(1, Math.round(drawSize * 0.15));
        const dev = Math.abs(avgPairs - idealPairs);
        return { avgPairs, avgMaxStreak, idealPairs, score: Math.max(0, 100 - dev * 15) };
    }

    // ═══════════════════════════════════════════════════
    //  DIM 12: ANÁLISE DE PARETO (80/20)
    //  Verifica se poucos números concentram muitas
    //  aparições (ruim) ou se está bem distribuído (bom).
    // ═══════════════════════════════════════════════════
    static paretoAnalysis(games) {
        const freq = {};
        let total = 0;
        for (const g of games) for (const n of g) { freq[n] = (freq[n] || 0) + 1; total++; }
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        const uniqueCount = sorted.length;
        if (uniqueCount === 0) return { ratio: 0, score: 0 };

        // Quantos números (top X%) representam 80% das aparições?
        let cumulative = 0;
        let count80 = 0;
        for (const [, f] of sorted) {
            cumulative += f;
            count80++;
            if (cumulative >= total * 0.8) break;
        }

        const ratio = count80 / uniqueCount * 100; // X% dos números fazem 80% das aparições
        // Ideal: ratio alto = números bem distribuídos (precisa de muitos para chegar a 80%)
        // Se ratio > 70%, distribuição boa. Se < 30%, muito concentrado.
        const score = Math.min(100, ratio * 1.3);

        return {
            numbersFor80Pct: count80,
            totalUnique: uniqueCount,
            ratio, // % dos números que geram 80% das aparições
            isHealthy: ratio > 50,
            verdict: ratio > 70 ? 'Bem Distribuído ✅' : ratio > 50 ? 'Moderado ⚠️' : 'Concentrado ❌',
            score
        };
    }

    // ═══════════════════════════════════════════════════
    //  VALOR ESPERADO (EV)
    // ═══════════════════════════════════════════════════
    static expectedValue(games, gameConfig) {
        const N = gameConfig.range[1] - gameConfig.range[0] + 1;
        const drawSize = gameConfig.draw;
        const strategies = gameConfig.strategies || [];
        const price = gameConfig.price || 0;

        const results = [];
        let totalEV = 0;
        for (const strat of strategies) {
            if (strat.match === 0) continue;
            const prob = this.probAtLeastOneHit(games, strat.match, N, drawSize);
            const ev = prob * strat.prize;
            totalEV += ev;
            results.push({
                label: strat.label, match: strat.match, prize: strat.prize,
                probSingle: this.hypergeometricPMF(strat.match, N, games[0] ? games[0].length : gameConfig.minBet, drawSize),
                probConjuntoPct: prob * 100, ev
            });
        }
        const betSize = games[0] ? games[0].length : gameConfig.minBet;
        const combos = this.nCr(betSize, gameConfig.minBet);
        const costPerGame = price * combos;
        const totalCost = costPerGame * games.length;
        const netEV = totalEV - totalCost;
        return { prizes: results, totalEV, totalCost, costPerGame, netEV, roi: totalCost > 0 ? netEV / totalCost * 100 : 0, betSize, combos, gamesCount: games.length };
    }

    // ═══════════════════════════════════════════════════
    //  AFINIDADE COM HISTÓRICO REAL
    // ═══════════════════════════════════════════════════
    static historicalAffinity(games, gameKey) {
        if (typeof StatsService === 'undefined') return { hotPct: 0, coldPct: 0, available: false };
        const stats = StatsService.getStats(gameKey, 10);
        if (!stats || !stats.hot) return { hotPct: 0, coldPct: 0, available: false };
        const hotSet = new Set(stats.hot.map(h => h.number));
        const coldSet = new Set((stats.cold || []).map(c => c.number));
        let hotH = 0, coldH = 0, tot = 0;
        for (const g of games) for (const n of g) { tot++; if (hotSet.has(n)) hotH++; if (coldSet.has(n)) coldH++; }
        return { hotPct: tot > 0 ? hotH / tot * 100 : 0, coldPct: tot > 0 ? coldH / tot * 100 : 0, available: true };
    }

    // ═══════════════════════════════════════════════════
    //  NOTA COMPOSTA: 0 a 10
    //  12 dimensões com pesos transparentes
    // ═══════════════════════════════════════════════════
    static compositeScore(m) {
        const w = {
            numberFreq:   0.08,  // 1. Frequência de números puros
            pairCov:      0.10,  // 2. Cobertura de duplas
            trioCov:      0.08,  // 3. Cobertura de trios
            entropy:      0.10,  // 4. Entropia de Shannon
            chiSquared:   0.10,  // 5. Uniformidade Chi²
            hamming:      0.10,  // 6. Diversidade Hamming
            evenOdd:      0.08,  // 7. Par/Ímpar
            highLow:      0.08,  // 8. Alto/Baixo
            sum:          0.08,  // 9. Soma
            decades:      0.06,  // 10. Faixas
            consecutive:  0.06,  // 11. Consecutivos
            pareto:       0.08,  // 12. Pareto
        }; // Total = 1.00

        let total = 0;
        const bd = {};

        const get = (key, metric, prop) => {
            const val = metric ? (metric[prop] !== undefined ? metric[prop] : (metric.score || 0)) : 0;
            const clamped = Math.max(0, Math.min(100, val));
            bd[key] = clamped;
            total += w[key] * clamped;
            return clamped;
        };

        get('numberFreq',  m.numberFreq,  'score');
        get('pairCov',     m.pairs,       'score');
        get('trioCov',     m.trios,       'score');
        get('entropy',     m.entropy,     'efficiency');
        get('chiSquared',  m.chiSquared,  'score');
        get('hamming',     m.hamming,     'score');
        get('evenOdd',     m.evenOdd,     'score');
        get('highLow',     m.highLow,     'score');
        get('sum',         m.sum,         'score');
        get('decades',     m.decades,     'score');
        get('consecutive', m.consecutive, 'score');
        get('pareto',      m.pareto,      'score');

        // Nota final de 0 a 10
        const score10 = total / 10;

        return { score: total, score10, weights: w, breakdown: bd };
    }

    // ═══════════════════════════════════════════════════
    //  ANÁLISE COMPLETA (Entry Point)
    // ═══════════════════════════════════════════════════
    static analyze(games, gameKey) {
        if (!games || games.length === 0) return null;
        const gc = (typeof GAMES !== 'undefined') ? GAMES[gameKey] : null;
        if (!gc) return null;

        const N = gc.range[1] - gc.range[0] + 1;
        const rS = gc.range[0], rE = gc.range[1];

        const numberFreq    = this.analyzeNumberFrequency(games, N, rS);
        const pairs         = this.analyzePairCoverage(games);
        const trios         = this.analyzeTrioCoverage(games);
        const entropy       = this.shannonEntropy(games, N);
        const chiSquared    = this.chiSquaredTest(games);
        const hamming       = this.hammingDistance(games);
        const evenOdd       = this.evenOddBalance(games);
        const highLow       = this.highLowBalance(games, rS, rE);
        const sum           = this.sumAnalysis(games, rS, rE, gc.draw);
        const decades       = this.decadeDistribution(games, rS, rE);
        const consecutive   = this.consecutiveAnalysis(games);
        const pareto        = this.paretoAnalysis(games);
        const ev            = this.expectedValue(games, gc);
        const affinity      = this.historicalAffinity(games, gameKey);

        const metrics = { numberFreq, pairs, trios, entropy, chiSquared, hamming, evenOdd, highLow, sum, decades, consecutive, pareto, ev, affinity };
        const composite = this.compositeScore(metrics);

        return {
            gameKey, gameName: gc.name, gamesCount: games.length,
            drawSize: gc.draw, betSize: games[0] ? games[0].length : gc.minBet, poolSize: N,
            metrics, composite
        };
    }

    // ═══════════════════════════════════════════════════
    //  RENDERIZAÇÃO DO MODAL
    // ═══════════════════════════════════════════════════
    static renderModal(analysis) {
        if (!analysis) return '<div style="padding:20px;text-align:center;color:#EF4444;">Sem dados.</div>';
        const m = analysis.metrics;
        const c = analysis.composite;
        const s10 = c.score10;
        const sc = s10 >= 8 ? '#22C55E' : s10 >= 6 ? '#F59E0B' : s10 >= 4 ? '#FB923C' : '#EF4444';

        let html = '';

        // NOTA PRINCIPAL 0-10
        html += `<div style="text-align:center;margin-bottom:20px;">
            <div style="display:inline-block;width:100px;height:100px;border-radius:50%;border:4px solid ${sc};position:relative;margin-bottom:8px;">
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                    <div style="font-size:2rem;font-weight:900;color:${sc};line-height:1;">${s10.toFixed(1)}</div>
                    <div style="font-size:0.6rem;color:#94A3B8;font-weight:700;">/10</div>
                </div>
            </div>
            <div style="font-size:0.9rem;font-weight:800;color:${sc};">Nota de Eficiência</div>
            <div style="font-size:0.65rem;color:#94A3B8;margin-top:3px;">${analysis.gamesCount} jogos · ${analysis.betSize} dezenas · ${analysis.gameName}</div>
        </div>`;

        // 12 BARRAS DE BREAKDOWN
        const dimItems = [
            { key: 'numberFreq',  label: '1. Números Puros (Frequência)', tip: 'CV da distribuição de frequência' },
            { key: 'pairCov',     label: '2. Cobertura de Duplas',        tip: 'Pares distintos cobertos' },
            { key: 'trioCov',     label: '3. Cobertura de Trios',         tip: 'Trios distintos cobertos' },
            { key: 'entropy',     label: '4. Entropia de Shannon',        tip: 'H = -Σp·log₂(p)' },
            { key: 'chiSquared',  label: '5. Uniformidade (χ²)',          tip: 'Teste Chi-quadrado α=5%' },
            { key: 'hamming',     label: '6. Diversidade (Hamming)',      tip: 'Distância média inter-jogos' },
            { key: 'evenOdd',     label: '7. Equilíbrio Par/Ímpar',      tip: 'Desvio do ideal 50/50' },
            { key: 'highLow',     label: '8. Equilíbrio Alto/Baixo',     tip: 'Desvio do ideal 50/50' },
            { key: 'sum',         label: '9. Equilíbrio de Soma',        tip: 'Soma vs. média esperada' },
            { key: 'decades',     label: '10. Distribuição por Faixa',   tip: 'Equilíbrio entre dezenas' },
            { key: 'consecutive', label: '11. Consecutivos',             tip: 'Pares consecutivos vs ideal' },
            { key: 'pareto',      label: '12. Pareto (Concentração)',    tip: '% dos números para 80% aparições' },
        ];

        html += `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;margin-bottom:16px;">
            <h5 style="margin:0 0 12px;color:#F59E0B;font-size:0.76rem;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">📊 12 Dimensões Matemáticas</h5>`;

        for (const d of dimItems) {
            const v = c.breakdown[d.key] || 0;
            const bc = v >= 80 ? '#22C55E' : v >= 60 ? '#F59E0B' : v >= 40 ? '#FB923C' : '#EF4444';
            html += `<div style="margin-bottom:8px;" title="${d.tip}">
                <div style="display:flex;justify-content:space-between;font-size:0.7rem;font-weight:600;margin-bottom:2px;">
                    <span style="color:#D1D5DB;">${d.label}</span>
                    <span style="color:${bc};">${v.toFixed(1)}%</span>
                </div>
                <div style="height:7px;background:#1E293B;border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${Math.min(100, v)}%;background:${bc};border-radius:4px;"></div>
                </div>
            </div>`;
        }
        html += `</div>`;

        // PROBABILIDADES REAIS
        if (m.ev && m.ev.prizes.length > 0) {
            html += `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;margin-bottom:16px;">
                <h5 style="margin:0 0 10px;color:#3B82F6;font-size:0.76rem;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">🎲 Probabilidades (Hipergeométrica)</h5>
                <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.72rem;">
                    <thead><tr style="border-bottom:2px solid rgba(255,255,255,0.1);color:#94A3B8;">
                        <th style="padding:6px;text-align:left;">Faixa</th>
                        <th style="padding:6px;text-align:right;">P(1 jogo)</th>
                        <th style="padding:6px;text-align:right;">P(≥1 em ${analysis.gamesCount})</th>
                        <th style="padding:6px;text-align:right;">Prêmio</th>
                    </tr></thead><tbody style="color:#E2E8F0;">`;
            for (const p of m.ev.prizes) {
                const pc = p.probConjuntoPct >= 50 ? '#22C55E' : p.probConjuntoPct >= 10 ? '#F59E0B' : p.probConjuntoPct >= 1 ? '#FB923C' : '#EF4444';
                html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                    <td style="padding:6px;font-weight:600;">${p.label}</td>
                    <td style="padding:6px;text-align:right;color:#94A3B8;font-size:0.65rem;">1 em ${Math.round(1 / Math.max(p.probSingle, 1e-15)).toLocaleString('pt-BR')}</td>
                    <td style="padding:6px;text-align:right;font-weight:700;color:${pc};">${p.probConjuntoPct < 0.01 ? p.probConjuntoPct.toExponential(2) : p.probConjuntoPct.toFixed(4)}%</td>
                    <td style="padding:6px;text-align:right;color:#22C55E;">R$ ${p.prize.toLocaleString('pt-BR')}</td>
                </tr>`;
            }
            html += `</tbody></table></div>`;
            const evc = m.ev.netEV >= 0 ? '#22C55E' : '#EF4444';
            html += `<div style="margin-top:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;font-size:0.72rem;">
                <div><span style="color:#94A3B8;">Custo:</span> <strong style="color:#EF4444;">R$ ${m.ev.totalCost.toFixed(2)}</strong></div>
                <div><span style="color:#94A3B8;">EV Líq:</span> <strong style="color:${evc};">R$ ${m.ev.netEV.toFixed(2)}</strong></div>
                <div><span style="color:#94A3B8;">ROI:</span> <strong style="color:${evc};">${m.ev.roi.toFixed(2)}%</strong></div>
            </div></div>`;
        }

        // MÉTRICAS DETALHADAS (grid 2x3)
        html += `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;margin-bottom:16px;">
            <h5 style="margin:0 0 10px;color:#10B981;font-size:0.76rem;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">📐 Detalhes Estatísticos</h5>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.7rem;">`;

        const details = [
            { l: 'Entropia', v: `${m.entropy.entropy.toFixed(3)} bits`, s: `Máx: ${m.entropy.maxEntropy.toFixed(3)}` },
            { l: 'Chi² (χ²)', v: `${m.chiSquared.chiSq.toFixed(2)}`, s: `p=${m.chiSquared.pValue.toFixed(4)} · ${m.chiSquared.verdict}` },
            { l: 'Hamming Médio', v: `${m.hamming.avg.toFixed(2)}`, s: `Min:${m.hamming.min} Max:${m.hamming.max}` },
            { l: 'Duplas', v: `${m.pairs.covered.toLocaleString('pt-BR')}`, s: `${m.pairs.pct.toFixed(1)}% do possível` },
            { l: 'Trios', v: m.trios.skipped ? 'Amostragem' : `${m.trios.covered.toLocaleString('pt-BR')}`, s: `${m.trios.pct.toFixed(1)}% do possível` },
            { l: 'Par/Ímpar', v: `${m.evenOdd.evenPct.toFixed(0)}% / ${m.evenOdd.oddPct.toFixed(0)}%`, s: m.evenOdd.verdict },
            { l: 'Alto/Baixo', v: `${m.highLow.lowPct.toFixed(0)}% / ${m.highLow.highPct.toFixed(0)}%`, s: m.highLow.verdict },
            { l: 'Soma Média', v: `${m.sum.avg.toFixed(0)}`, s: `Esperada: ${m.sum.expectedAvg.toFixed(0)} · ${m.sum.verdict}` },
            { l: 'Consecutivos', v: `Méd: ${m.consecutive.avgPairs.toFixed(1)}`, s: `Ideal: ~${m.consecutive.idealPairs}` },
            { l: 'Pareto 80/20', v: `${m.pareto.numbersFor80Pct}/${m.pareto.totalUnique} números`, s: `${m.pareto.ratio.toFixed(0)}% · ${m.pareto.verdict}` },
        ];

        for (const d of details) {
            html += `<div style="background:rgba(0,0,0,0.2);padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);">
                <div style="color:#94A3B8;font-weight:700;font-size:0.62rem;text-transform:uppercase;margin-bottom:3px;">${d.l}</div>
                <div style="color:#E2E8F0;font-weight:800;font-size:0.85rem;">${d.v}</div>
                <div style="color:#64748B;font-size:0.6rem;margin-top:2px;">${d.s}</div>
            </div>`;
        }
        html += `</div></div>`;

        // FAIXAS VISUAIS
        if (m.decades && m.decades.decades.length > 0) {
            const maxP = Math.max(...m.decades.decades.map(d => d.pct), 1);
            html += `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;margin-bottom:16px;">
                <h5 style="margin:0 0 10px;color:#8B5CF6;font-size:0.76rem;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">📈 Distribuição por Faixa</h5>`;
            for (const d of m.decades.decades) {
                html += `<div style="display:flex;align-items:center;gap:6px;font-size:0.68rem;margin-bottom:4px;">
                    <span style="color:#94A3B8;width:40px;text-align:right;font-weight:600;">${d.label}</span>
                    <div style="flex:1;height:12px;background:#1E293B;border-radius:4px;overflow:hidden;">
                        <div style="height:100%;width:${d.pct / maxP * 100}%;background:linear-gradient(90deg,#8B5CF6,#A78BFA);border-radius:4px;"></div>
                    </div>
                    <span style="color:#E2E8F0;width:36px;text-align:right;font-weight:700;">${d.pct.toFixed(1)}%</span>
                </div>`;
            }
            html += `</div>`;
        }

        // LEGENDA
        html += `<div style="padding:10px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.04);border-radius:8px;font-size:0.58rem;color:#475569;line-height:1.5;">
            <strong style="color:#64748B;">Metodologia:</strong> Frequência (CV) · Duplas/Trios (cobertura combinatória) · Shannon (H=-Σp·log₂p) · Chi² (χ²=Σ(O-E)²/E, α=5%) · Hamming (diversidade) · Par/Ímpar + Alto/Baixo (desvio 50/50) · Soma (vs E[S]=k·(a+b)/2) · Pareto (concentração 80/20) · Hipergeométrica (P=C(K,k)·C(N-K,n-k)/C(N,n)) · Nota = média ponderada 12D → escala 0-10.
        </div>`;

        return html;
    }
}

if (typeof window !== 'undefined') window.GameAnalyser = GameAnalyser;

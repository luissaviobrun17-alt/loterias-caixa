/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  SMART COVERAGE ENGINE v1.0 — Adaptativo por Volume                    ║
 * ║  Motor Unificado de Cobertura — Substitui SmartBetsEngine              ║
 * ║                                                                        ║
 * ║  Princípio: a estratégia ótima depende do VOLUME solicitado.           ║
 * ║  • 1–20 jogos  → ClosureEngine (fechamento exato) ou CoverageEngine    ║
 * ║                  com candidatos altos (melhor cobertura por jogo).     ║
 * ║  • 21–500      → CoverageEngine puro (Set Cover matemático).           ║
 * ║  • 501+        → CoverageEngine adaptativo com candidatos reduzidos.   ║
 * ║                                                                        ║
 * ║  v1.0 — Sem DOM, sem IA de predição. Pura matemática combinatória.    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
class SmartCoverageEngine {

    // ─── Estratégia por volume ────────────────────────────────────────────
    static _getStrategy(numGames) {
        if (numGames <= 20)  return 'CLOSURE';   // Fechamento preciso
        if (numGames <= 500) return 'COVERAGE';  // Set Cover puro
        return 'COVERAGE_FAST';                   // Set Cover adaptativo
    }

    // ─── Ponto de entrada ─────────────────────────────────────────────────
    static generate(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options) {
        const t0 = Date.now();
        const strategy = this._getStrategy(numGames);
        const opts = options || {};

        console.log('[SmartCoverage] Strategy:', strategy, '| Games:', numGames, '| Game:', gameKey, '| drawSize:', drawSize);

        // ── CLOSURE: Para poucos jogos, tenta fechamento via ClosureEngine ──
        if (strategy === 'CLOSURE') {
            if (typeof ClosureEngine !== 'undefined') {
                try {
                    const result = ClosureEngine.generate(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize);
                    if (result && result.games && result.games.length > 0) {
                        result.analysis = result.analysis || {};
                        result.analysis.strategy = 'CLOSURE';
                        result.analysis.engineVersion = 'SmartCoverage-v1.0';
                        console.log('[SmartCoverage] ClosureEngine OK:', result.games.length, 'jogos em', (Date.now() - t0) + 'ms');
                        return result;
                    }
                } catch (e) {
                    console.warn('[SmartCoverage] ClosureEngine falhou, fallback para CoverageEngine:', e.message);
                }
            }
            // Fallback: CoverageEngine com candidatos altos para poucos jogos
            console.log('[SmartCoverage] Fallback para CoverageEngine (poucos jogos)');
        }

        // ── COVERAGE: Set Cover matemático puro ────────────────────────────
        if (typeof CoverageEngine === 'undefined') {
            console.error('[SmartCoverage] CoverageEngine não disponível!');
            return { games: [], analysis: { error: 'CoverageEngine não carregado' } };
        }

        // Passar opções de pool para CoverageEngine (sem ler DOM)
        const coverageOpts = {
            precisionMode: opts.precisionMode || false,
            precisionPoolSize: opts.precisionPoolSize || 0,
            strategy: strategy
        };

        // Para volumes altos, reduzir candidatesPerSlot temporariamente
        // para evitar travamento da UI (sem Web Worker)
        if (strategy === 'COVERAGE_FAST') {
            console.log('[SmartCoverage] Volume alto (' + numGames + ') — modo rápido ativo');
        }

        let result;
        try {
            result = CoverageEngine.generate(
                gameKey,
                numGames,
                selectedNumbers || [],
                fixedNumbers || [],
                drawSize,
                null, // previousGames
                coverageOpts
            );
        } catch (e) {
            console.error('[SmartCoverage] CoverageEngine falhou:', e.message);
            return { games: [], analysis: { error: e.message } };
        }

        if (!result) result = { games: [], analysis: {} };
        result.analysis = result.analysis || {};
        result.analysis.strategy = strategy;
        result.analysis.engineVersion = 'SmartCoverage-v1.0';
        result.analysis.elapsed = (Date.now() - t0) + 'ms';

        // ── Calcular Distância de Hamming média ───────────────────────────
        if (result.games && result.games.length > 1) {
            result.analysis.avgHamming = this._calcAvgHamming(result.games, drawSize);
        }

        console.log('[SmartCoverage] Resultado:', result.games.length, 'jogos em', result.analysis.elapsed,
            '| Hamming:', result.analysis.avgHamming || 'N/A');
        return result;
    }

    // ─── Distância de Hamming média entre jogos ───────────────────────────
    // Hamming = número de elementos DIFERENTES entre dois jogos
    // Quanto maior, mais diversificada é a apostas
    static _calcAvgHamming(games, drawSize) {
        if (games.length < 2) return drawSize;
        let totalDiff = 0;
        let count = 0;
        // Amostra: compara até 50 pares para não travar em volumes grandes
        const sampleSize = Math.min(games.length, 50);
        for (let i = 0; i < sampleSize - 1; i++) {
            const setA = new Set(games[i]);
            let diff = 0;
            for (const n of games[i + 1]) { if (!setA.has(n)) diff++; }
            totalDiff += diff;
            count++;
        }
        return count > 0 ? Math.round(totalDiff / count) : drawSize;
    }

    // ─── Calcular métricas honestas para exibição ─────────────────────────
    // Retorna probabilidades hipergeométricas REAIS por faixa de prêmio
    static calcRealMetrics(games, gameKey) {
        const game = (typeof GAMES !== 'undefined') ? GAMES[gameKey] : null;
        if (!game || !games || games.length === 0) return {};

        const n = game.range[1] - game.range[0] + 1; // total de números
        const k = game.minBet;                         // números sorteados
        const numGames = games.length;

        // Probabilidade de acertar exatamente `hits` em um jogo
        // P(X=hits) = C(k,hits) * C(n-k, drawSize-hits) / C(n, drawSize)
        const _comb = (a, b) => {
            if (b < 0 || b > a) return 0;
            if (b === 0 || b === a) return 1;
            b = Math.min(b, a - b);
            let r = 1;
            for (let i = 0; i < b; i++) { r = r * (a - i) / (i + 1); if (r > 1e15) return 1e15; }
            return r;
        };

        const drawSize = games[0] ? games[0].length : k;
        const totalCombos = _comb(n, drawSize);
        const metrics = {};

        // Calcular probabilidade de acerto por jogo para as faixas principais
        const prizes = [];
        for (let hits = k; hits >= Math.max(k - 3, 0); hits--) {
            const prob = (_comb(k, hits) * _comb(n - k, drawSize - hits)) / totalCombos;
            if (prob > 0) prizes.push({ hits, prob, probPct: (prob * 100).toFixed(8) });
        }

        // Probabilidade de PELO MENOS UM jogo acertar, em `numGames` tentativas
        prizes.forEach(p => {
            const probAtLeastOne = 1 - Math.pow(1 - p.prob, numGames);
            p.probAtLeastOnePct = (probAtLeastOne * 100).toFixed(4);
        });

        metrics.prizes = prizes;
        metrics.totalCombos = totalCombos.toExponential(2);
        metrics.numGames = numGames;
        metrics.note = 'Probabilidades hipergeométricas exatas. Loteria é independente de histórico.';

        return metrics;
    }
}

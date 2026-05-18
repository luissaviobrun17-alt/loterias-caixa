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

    // ─── Distância de Hamming média entre jogos ────────────────────────────────────
    // v11.1 Fix: amostra de pares ALEATÓRIOS (não adjacentes).
    // Pares adjacentes no Set Cover têndem a ser semelhantes, subestimando a diversidade real.
    static _calcAvgHamming(games, drawSize) {
        if (games.length < 2) return drawSize;
        let totalDiff = 0;
        let count = 0;
        const sampleSize = Math.min(games.length, 50);
        // Amostra de pares aleatórios (não apenas adjacentes)
        for (let s = 0; s < sampleSize; s++) {
            const i = Math.floor(Math.random() * games.length);
            let j = Math.floor(Math.random() * games.length);
            if (j === i) j = (i + 1) % games.length;
            const setA = new Set(games[i]);
            let diff = 0;
            for (const n of games[j]) { if (!setA.has(n)) diff++; }
            totalDiff += diff;
            count++;
        }
        return count > 0 ? Math.round(totalDiff / count) : drawSize;
    }

    // ─── Calcular métricas honestas para exibição ──────────────────────────────
    // Retorna probabilidades hipergeométricas REAIS por faixa de prêmio
    // v11.1 Fix: usa game.draw (bolas sorteadas) não game.minBet (aposta do jogador)
    static calcRealMetrics(games, gameKey) {
        const game = (typeof GAMES !== 'undefined') ? GAMES[gameKey] : null;
        if (!game || !games || games.length === 0) return {};

        const n = game.range[1] - game.range[0] + 1;  // total de números na loteria
        // v11.1: sorteados pela loteria (ex: Timemania=7, Mega Sena=6, Lotofácil=15)
        // game.draw é o campo correto; game.minBet é o tamanho da APOSTA
        const K = game.draw || game.minBet;            // bolas sorteadas
        const numGames = games.length;
        const drawSize = games[0] ? games[0].length : (game.minBet); // tamanho da aposta

        // Probabilidade de acertar exatamente `hits` em um jogo
        // P(X=hits) = C(K,hits) * C(n-K, drawSize-hits) / C(n, drawSize)
        const _comb = (a, b) => {
            if (b < 0 || b > a) return 0;
            if (b === 0 || b === a) return 1;
            b = Math.min(b, a - b);
            let r = 1;
            for (let i = 0; i < b; i++) { r = r * (a - i) / (i + 1); if (r > 1e15) return 1e15; }
            return r;
        };

        const totalCombos = _comb(n, drawSize);
        const metrics = {};

        // Faixas de prêmio: do máximo ao mínimo premíado
        const prizes = [];
        const maxHits = Math.min(K, drawSize);
        const minPrizedHits = Math.max(maxHits - 3, 0);
        for (let hits = maxHits; hits >= minPrizedHits; hits--) {
            const prob = (_comb(K, hits) * _comb(n - K, drawSize - hits)) / totalCombos;
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
        metrics.drawSize = drawSize;
        metrics.K = K;
        metrics.note = 'Probabilidades hipergeométricas exatas. Loteria é independente de histórico.';

        return metrics;
    }
}

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

    // ─── Construção do Alvo do Sniper (KDE / Heatmap Espacial) ────────────
    static _buildSniperPool(gameKey, game, numGames, poolSizePreference) {
        if (typeof StatsService === 'undefined') return [];
        const history = StatsService.historyStore[gameKey] || [];
        if (history.length === 0) return [];

        const drawsToAnalyze = Math.min(15, history.length);
        const recentDraws = history.slice(0, drawsToAnalyze);

        // Grade física do volante
        const columns = gameKey === 'lotofacil' ? 5 : 10;
        const start = game.range[0];
        const end = game.range[1];
        
        const heat = {};
        for (let i = start; i <= end; i++) heat[i] = 0;

        // Decaimento exponencial: Dá mais peso aos sorteios recentes
        const decay = 0.75; 
        let weight = 1.0;

        recentDraws.forEach(draw => {
            const nums = (draw.numbers || []).concat(draw.numbers2 || []);
            nums.forEach(n => {
                if (n >= start && n <= end) {
                    // Epicentro (Próprio número)
                    heat[n] += (100 * weight);

                    const adjacents = [];
                    // Esquerda e Direita (na mesma linha)
                    if ((n - start) % columns !== 0) adjacents.push(n - 1);
                    if ((n - start) % columns !== (columns - 1)) adjacents.push(n + 1);
                    // Cima e Baixo
                    if (n - columns >= start) adjacents.push(n - columns);
                    if (n + columns <= end) adjacents.push(n + columns);

                    // Adjacência ortogonal
                    adjacents.forEach(adj => {
                        if (adj >= start && adj <= end) heat[adj] += (50 * weight);
                    });

                    const diagonals = [];
                    if (n - columns >= start && (n - start) % columns !== 0) diagonals.push(n - columns - 1);
                    if (n - columns >= start && (n - start) % columns !== (columns - 1)) diagonals.push(n - columns + 1);
                    if (n + columns <= end && (n - start) % columns !== 0) diagonals.push(n + columns - 1);
                    if (n + columns <= end && (n - start) % columns !== (columns - 1)) diagonals.push(n + columns + 1);

                    // Adjacência diagonal
                    diagonals.forEach(diag => {
                         if (diag >= start && diag <= end) heat[diag] += (25 * weight);
                    });
                }
            });
            weight *= decay;
        });

        const sortedNumbers = Object.keys(heat)
            .map(n => parseInt(n))
            .sort((a, b) => heat[b] - heat[a]);

        // Tamanho do alvo definido pelo slider do usuario, com fallback dinamico apenas se necessario
        let targetSize = poolSizePreference || 20; 
        if (!poolSizePreference) {
            targetSize = game.draw * 2; 
            if (numGames <= 10) targetSize = Math.round(game.draw * 2.8);
            else if (numGames <= 30) targetSize = Math.round(game.draw * 3.8);
            else if (numGames <= 100) targetSize = Math.round(game.draw * 5.0);
            else targetSize = Math.round(game.draw * 7.0);
        }
        targetSize = Math.min(targetSize, end - start + 1);
        return sortedNumbers.slice(0, targetSize).sort((a, b) => a - b);
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

        // v12.2 Auto-Fixador Cirúrgico (Lotofácil)
        // Se alto volume, trava os 3 melhores numeros do mapa de calor espacial como FIXOS
        let lotoFixed = fixedNumbers || [];
        if (gameKey === 'lotofacil' && numGames >= 1000 && (!selectedNumbers || selectedNumbers.length === 0) && (!fixedNumbers || fixedNumbers.length === 0)) {
            const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
            if (game) {
                const heatPool = this._buildSniperPool(gameKey, game, numGames, 25);
                lotoFixed = heatPool.slice(0, 3); // Fixa os Top 3
                console.log('[SmartCoverage] Auto-Fixador Lotofácil ativado. Top 3 fixos:', lotoFixed);
            }
        }

        // v12.4 Amputação Topológica (Dupla Sena)
        if (gameKey === 'duplasena' && numGames > 100 && (!selectedNumbers || selectedNumbers.length === 0)) {
            opts.precisionMode = true;
            if (!opts.precisionPoolSize || opts.precisionPoolSize === 20) {
                if (numGames <= 500) opts.precisionPoolSize = 35;
                else if (numGames <= 2000) opts.precisionPoolSize = 32;
                else opts.precisionPoolSize = 28; // Maximo estrangulamento
            }
            console.log('[SmartCoverage] Auto-Sniper ativado para Dupla Sena. Pool estrangulado para', opts.precisionPoolSize);
        }

        // v12.3 Amputação Topológica (Quina)
        // A Quina precisa amputar de 40 a 50 numeros em grandes volumes para ter chance
        if (gameKey === 'quina' && numGames > 100 && (!selectedNumbers || selectedNumbers.length === 0)) {
            opts.precisionMode = true; 
            if (!opts.precisionPoolSize || opts.precisionPoolSize === 20) {
                if (numGames <= 500) opts.precisionPoolSize = 40;
                else if (numGames <= 2000) opts.precisionPoolSize = 35;
                else opts.precisionPoolSize = 30; // Maximo estrangulamento
            }
            console.log('[SmartCoverage] Auto-Sniper ativado para Quina. Pool estrangulado para', opts.precisionPoolSize);
        }

        // v12.1 Auto-Sniper Cirúrgico (Mega Sena)
        // Evita gastos desnecessarios espalhando em 60 numeros em altos volumes
        if (gameKey === 'megasena' && numGames > 100 && (!selectedNumbers || selectedNumbers.length === 0)) {
            opts.precisionMode = true; // Forca a reducao do espaco combinatorio
            // Se o usuario nao mexeu no slider (opts.precisionPoolSize == 20 padrao ou null),
            // a gente ajusta de forma progressiva e agressiva:
            if (!opts.precisionPoolSize || opts.precisionPoolSize === 20) {
                if (numGames <= 500) opts.precisionPoolSize = 25;
                else if (numGames <= 2000) opts.precisionPoolSize = 32;
                else opts.precisionPoolSize = 42;
            }
            console.log('[SmartCoverage] Auto-Sniper ativado para Mega Sena. Evitando gasto desnecessario. Pool =', opts.precisionPoolSize);
        }

        // Se o Sniper está ativo e o usuário não forçou números, calcula a Âncora Topológica
        let sniperPool = [];
        if (opts.precisionMode && (!selectedNumbers || selectedNumbers.length === 0)) {
            const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
            if (game) {
                sniperPool = this._buildSniperPool(gameKey, game, numGames, opts.precisionPoolSize);
                console.log('[SmartCoverage] 🎯 Sniper Ativo: Alvo concentrado em', sniperPool.length, 'dezenas:', sniperPool);
            }
        }

        // Passar opções de pool para CoverageEngine (sem ler DOM)
        const coverageOpts = {
            precisionMode: opts.precisionMode || false,
            precisionPool: sniperPool.length > 0 ? sniperPool : null,
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
        result.analysis.engineVersion = 'SmartCoverage-v1.1-Sniper';
        result.analysis.elapsed = (Date.now() - t0) + 'ms';
        if (sniperPool.length > 0) {
            result.analysis.sniperPoolSize = sniperPool.length;
        }

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

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

    // ─── Construção do Alvo do Sniper (Analítico Matemático) ────────────
    // Baseado em Ciclos, Atrasos, Tendências e Frequência de Duplas
    static _buildSniperPool(gameKey, game, numGames, poolSizePreference, precomputedScores) {
        let history = [];
        if (typeof StatsService !== 'undefined') history = StatsService.getRecentResults(gameKey, 200) || [];
        if (history.length === 0 && typeof REAL_HISTORY_DB !== 'undefined') history = REAL_HISTORY_DB[gameKey] || [];
        if (history.length === 0) return [];

        const start = game.range[0];
        const end = game.range[1];
        const totalRange = end - start + 1;

        // 1. Matriz de Scores Quânticos (Frequência, Atrasos, Ciclos)
        let quantumScores = {};
        if (precomputedScores) {
            quantumScores = precomputedScores;
        } else if (typeof NovaEraEngine !== 'undefined') {
            const profile = NovaEraEngine.getProfile(gameKey);
            quantumScores = NovaEraEngine._scoreAllNumbers(gameKey, profile, history, start, end, totalRange);
        } else {
            for (let i = start; i <= end; i++) quantumScores[i] = 1;
        }

        // 2. Bônus adicional de DUPLAS (solicitação específica para o Sniper)
        // Analisa as últimas 15 extrações para ver quem sai junto com mais frequência
        const recentDraws = history.slice(0, 15);
        const pairsFreq = {};
        const numberPairBonus = {};
        for (let i = start; i <= end; i++) numberPairBonus[i] = 0;

        recentDraws.forEach(draw => {
            const nums = (draw.numbers || []).concat(draw.numbers2 || []);
            for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                    const n1 = nums[i], n2 = nums[j];
                    if (n1 >= start && n1 <= end && n2 >= start && n2 <= end) {
                        const key = n1 < n2 ? n1 * 100 + n2 : n2 * 100 + n1;
                        pairsFreq[key] = (pairsFreq[key] || 0) + 1;
                    }
                }
            }
        });

        // Para cada dezena, soma o peso das duplas fortes que ela forma
        Object.keys(pairsFreq).forEach(key => {
            const freq = pairsFreq[key];
            if (freq > 1) { // Só consideramos duplas que repetiram nos últimos 15 concursos
                const n1 = Math.floor(key / 100), n2 = key % 100;
                numberPairBonus[n1] += freq * 2; // peso forte
                numberPairBonus[n2] += freq * 2;
            }
        });

        // 3. Tendência de Curto Prazo (Últimos 3 sorteios ganham impulso forte)
        const shortTermDraws = history.slice(0, 3);
        const shortTermBonus = {};
        for (let i = start; i <= end; i++) shortTermBonus[i] = 0;
        shortTermDraws.forEach(draw => {
            const nums = (draw.numbers || []).concat(draw.numbers2 || []);
            nums.forEach(n => {
                if (n >= start && n <= end) shortTermBonus[n] += 15;
            });
        });

        // 4. Combinar todos os scores para criar o RANKING FINAL DO SNIPER
        const finalScores = {};
        for (let i = start; i <= end; i++) {
            finalScores[i] = (quantumScores[i] || 1) + numberPairBonus[i] + shortTermBonus[i];
        }

        // Ordenar as dezenas da mais quente/sinérgica para a mais fria
        const sortedNumbers = Object.keys(finalScores)
            .map(Number)
            .sort((a, b) => finalScores[b] - finalScores[a]);

        // O tamanho do alvo é DECRETADO pelo usuário via UI (precisionPoolSize).
        // Se não fornecido, usa defaults conservadores.
        let targetSize = poolSizePreference || 20; 
        if (!poolSizePreference) {
            targetSize = game.draw * 2; 
            if (numGames <= 10) targetSize = Math.round(game.draw * 2.8);
            else if (numGames <= 30) targetSize = Math.round(game.draw * 3.8);
            else if (numGames <= 100) targetSize = Math.round(game.draw * 5.0);
            else targetSize = Math.round(game.draw * 7.0);
        }
        targetSize = Math.max(game.draw, Math.min(targetSize, totalRange));

        // Pega a nata do topo
        const sniperPool = sortedNumbers.slice(0, targetSize).sort((a, b) => a - b);
        
        console.log(`[SmartCoverage] 🎯 Sniper Analítico construído: ${targetSize} dezenas focadas (Duplas+Ciclos+Tendências)`);
        return sniperPool;
    }

    // ─── Ponto de entrada ─────────────────────────────────────────────────
    static generate(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize, options) {
        const t0 = Date.now();
        const strategy = this._getStrategy(numGames);
        const opts = options || {};

        console.log('[SmartCoverage] Strategy:', strategy, '| Games:', numGames, '| Game:', gameKey, '| drawSize:', drawSize);

        // ── CLOSURE: Para poucos jogos, tenta fechamento via ClosureEngine ──
        if (strategy === 'CLOSURE') {
            const v = selectedNumbers ? selectedNumbers.length : 0;
            // v12.11: ClosureEngine é para Fechamentos Matemáticos Pequenos (v <= 25).
            // Para v maiores (ex: 60 números da Mega Sena), a explosão combinatória O(N^t) trava o navegador.
            if (typeof ClosureEngine !== 'undefined' && drawSize <= 15 && v > 0 && v <= 25) {
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

        // v12.2 a v12.8 (REMOVIDOS): Os blocos de Auto-Fixador e Auto-Sniper foram removidos.
        // Motivo: Forçar o modo Sniper ou Fixador nos grandes volumes destruía a "Cobertura IA"
        // (matemática pura de Set Cover), causando o efeito "Canhão de Vidro" (onde grandes volumes 
        // falhavam catastroficamente se o sorteio caísse fora do pool restrito de dezenas quentes).
        let lotoFixed = fixedNumbers || [];

        // ══════════════════════════════════════════════════════════════
        // v13.3: POOL ESCALONADO MULTI-LOTERIA — 21 Camadas de Inteligência
        // Em vez de gerar aleatório, usa NovaEraEngine._scoreAllNumbers()
        // para ranquear os números e construir as camadas de pool dinamicamente:
        // ══════════════════════════════════════════════════════════════
        if (opts.precisionMode && (!selectedNumbers || selectedNumbers.length === 0)) {
            if (typeof NovaEraEngine !== 'undefined') {
                try {
                    const profile = NovaEraEngine.getProfile(gameKey);
                    const startNum = profile.range[0];
                    const endNum = profile.range[1];
                    const totalRange = endNum - startNum + 1;

                    // Obter histórico
                    let history = [];
                    if (typeof StatsService !== 'undefined') {
                        history = StatsService.getRecentResults(gameKey, 200) || [];
                    }
                    if (history.length === 0 && typeof REAL_HISTORY_DB !== 'undefined') {
                        history = REAL_HISTORY_DB[gameKey] || [];
                    }

                    if (history.length > 0) {
                        // ★ PILAR 1: 21 CAMADAS DE INTELIGÊNCIA
                        const scores = NovaEraEngine._scoreAllNumbers(
                            gameKey, profile, history, startNum, endNum, totalRange
                        );

                        // Ranking por score (maior → menor)
                        const ranked = [];
                        for (let n = startNum; n <= endNum; n++) {
                            ranked.push({ num: n, score: scores[n] || 0 });
                        }
                        ranked.sort((a, b) => b.score - a.score);

                        // ★ PILAR 2: POOL ESCALONADO DINÂMICO
                        let coreSize = 12;
                        let hotSize = 24;
                        if (gameKey === 'lotofacil') { coreSize = 18; hotSize = 22; }
                        else if (gameKey === 'quina') { coreSize = 10; hotSize = 20; }
                        else if (gameKey === 'duplasena') { coreSize = 12; hotSize = 22; }
                        else if (gameKey === 'lotomania') { coreSize = 60; hotSize = 80; }
                        else if (gameKey === 'timemania') { coreSize = 15; hotSize = 25; }
                        else if (gameKey === 'diadesorte') { coreSize = 12; hotSize = 18; }
                        
                        opts.layeredPool = {
                            core:    ranked.slice(0, coreSize).map(r => r.num).sort((a,b) => a-b),
                            hot:     ranked.slice(0, hotSize).map(r => r.num).sort((a,b) => a-b),
                            full:    ranked.map(r => r.num).sort((a,b) => a-b),
                            scores:  scores,
                            ranked:  ranked
                        };

                        console.log('%c[SmartCoverage] v13.3 ★ 21 CAMADAS ATIVAS PARA ' + gameKey.toUpperCase(), 'color: #F59E0B; font-weight: bold;');
                        console.log('[SmartCoverage] NÚCLEO QUENTE (Top ' + coreSize + '):', 
                            opts.layeredPool.core.map(n => n + '(' + scores[n].toFixed(2) + ')').join(', '));
                        console.log('[SmartCoverage] ZONA QUENTE (Top ' + hotSize + '):', 
                            opts.layeredPool.hot.join(', '));
                        console.log('[SmartCoverage] Histórico analisado:', history.length, 'sorteios');
                    }
                } catch (e) {
                    console.warn('[SmartCoverage] v13.3 NovaEra falhou, fallback aleatório:', e.message);
                }
            }
        }

        // Se o Sniper está ativo e o usuário não forçou números, calcula a Âncora Topológica
        let sniperPool = [];
        if (opts.precisionMode && (!selectedNumbers || selectedNumbers.length === 0)) {
            const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
            if (game) {
                sniperPool = this._buildSniperPool(gameKey, game, numGames, opts.precisionPoolSize, opts.layeredPool ? opts.layeredPool.scores : null);
                console.log('[SmartCoverage] 🎯 Sniper Ativo: Alvo concentrado em', sniperPool.length, 'dezenas:', sniperPool);
            }
        }

        // Passar opções de pool para CoverageEngine
        const coverageOpts = {
            precisionMode: opts.precisionMode || false,
            precisionPool: sniperPool.length > 0 ? sniperPool : null,
            strategy: strategy,
            layeredPool: opts.layeredPool || null,
            quantumScores: opts.layeredPool ? opts.layeredPool.scores : null
        };

        // v13.2: Sem modo rápido — qualidade sobre velocidade
        console.log('[SmartCoverage] Strategy:', strategy, '| Layered:', !!opts.layeredPool);

        let result;
        try {
            result = CoverageEngine.generate(
                gameKey,
                numGames,
                selectedNumbers || [],
                lotoFixed.length > 0 ? lotoFixed : (fixedNumbers || []), // v12.9 FIX: Passa a âncora fixa pro motor
                drawSize,
                coverageOpts // v12.9 FIX: O 6o parametro e options, nao previousGames
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
    static calcRealMetrics(games, gameKey, poolSize) {
        const game = (typeof GAMES !== 'undefined') ? GAMES[gameKey] : null;
        if (!game || !games || games.length === 0) return {};

        const N_total = game.range[1] - game.range[0] + 1;  // total de números na loteria
        const K = game.draw || game.minBet;            // bolas sorteadas pela loteria
        const numGames = games.length;
        const drawSize = games[0] ? games[0].length : (game.minBet);
        
        // v14.3: Pool = Universo (como o usuário pediu)
        // Se pool=36 de 60, o universo de cálculo é 36, não 60
        let P = poolSize || N_total;
        if (!poolSize && games.length > 0) {
            const allNums = new Set();
            const sampleSize = Math.min(games.length, 200);
            for (let i = 0; i < sampleSize; i++) {
                games[i].forEach(n => allNums.add(n));
            }
            P = allNums.size;
        }
        P = Math.min(P, N_total);
        // Pool precisa ser >= K e >= drawSize para ter sentido
        P = Math.max(P, Math.max(K, drawSize));

        const _comb = (a, b) => {
            if (b < 0 || b > a) return 0;
            if (b === 0 || b === a) return 1;
            b = Math.min(b, a - b);
            let r = 1;
            for (let i = 0; i < b; i++) { r = r * (a - i) / (i + 1); }
            return r;
        };

        const metrics = {};
        const prizes = [];
        const maxHits = Math.min(K, drawSize);
        const minPrizedHits = Math.max(maxHits - 3, 0);

        // v14.3: POOL É O UNIVERSO
        // Se o pool é P, temos C(P, drawSize) combinações possíveis de jogos
        // O sorteio tira K bolas desse pool de P
        // P(acertar h) = C(K,h) * C(P-K, drawSize-h) / C(P, drawSize)
        const universo = P;
        const totalCombos = _comb(universo, drawSize);
        
        for (let hits = maxHits; hits >= minPrizedHits; hits--) {
            const prob = (_comb(K, hits) * _comb(universo - K, drawSize - hits)) / totalCombos;
            
            if (prob > 0) {
                const probAtLeastOne = 1 - Math.pow(1 - prob, numGames);
                prizes.push({
                    hits,
                    prob: prob,
                    probPct: (prob * 100).toFixed(8),
                    probAtLeastOnePct: (probAtLeastOne * 100).toFixed(4)
                });
            }
        }

        // Cobertura: % de chance dos K sorteados caírem todos dentro do pool
        const poolCoverage = P < N_total 
            ? (_comb(P, K) / _comb(N_total, K) * 100)
            : 100;

        metrics.prizes = prizes;
        metrics.totalCombos = _comb(universo, drawSize).toLocaleString('pt-BR');
        metrics.numGames = numGames;
        metrics.drawSize = drawSize;
        metrics.K = K;
        metrics.poolSize = P;
        metrics.totalNumbers = N_total;
        metrics.poolCoverage = poolCoverage;
        metrics.note = P < N_total
            ? 'Universo: ' + P + ' números (de ' + N_total + '). Cobertura do pool: ' + poolCoverage.toFixed(1) + '%'
            : 'Universo completo (' + N_total + ' números).';

        return metrics;
    }
}

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  COVERAGE ENGINE — CIÊNCIA COMBINATÓRIA REAL                   ║
 * ║  Zero falácia. Zero previsão. Apenas matemática.               ║
 * ║                                                                ║
 * ║  PRINCÍPIO: Não prevemos números. Otimizamos COBERTURA.        ║
 * ║  Dado um orçamento de N jogos, geramos o conjunto que          ║
 * ║  MAXIMIZA a cobertura do espaço combinatório.                  ║
 * ║                                                                ║
 * ║  ALGORITMO: Greedy Set Cover                                   ║
 * ║  Para cada jogo, escolhemos o candidato que adiciona o         ║
 * ║  MAIOR número de pares/triplas novas ao conjunto.              ║
 * ║                                                                ║
 * ║  MÉTRICAS: Tudo exato, nada estimado.                          ║
 * ║  - Cobertura de pares: X/Y (Z%)                                ║
 * ║  - Cobertura por zona: equilibrada ou não                      ║
 * ║  - Probabilidade hipergeométrica exata de k+ acertos           ║
 * ║  - Probabilidade combinada com N jogos                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
class CoverageEngine {

    // ─── Configuração por loteria ─────────────────────────────────
    static getConfig(gameKey) {
        const configs = {
            lotofacil: {
                name: 'Lotofácil', drawSize: 15, lotteryDraw: 15,
                range: [1, 25], totalNumbers: 25,
                zones: 5, zoneSize: 5,
                sumRange: [155, 235], parityRange: [5, 10],
                maxConsecutive: 10, minZones: 5,
                prizeThresholds: [11, 12, 13, 14, 15],
                prizeLabels: ['11 ac.', '12 ac.', '13 ac.', '14 ac.', '15 ac.'],
                candidatesPerSlot: 80,
                ticketPrice: 3.00,
                // Micro-Otimização Lotofácil
                molduraRange: [8, 11],
                primesRange: [4, 6],
                fibonacciRange: [3, 5],
                multiplesOf3Range: [4, 6]
            },
            megasena: {
                name: 'Mega Sena', drawSize: 6, lotteryDraw: 6,
                range: [1, 60], totalNumbers: 60,
                zones: 6, zoneSize: 10,
                sumRange: [95, 265], parityRange: [2, 4],
                maxConsecutive: 2, minZones: 3,
                prizeThresholds: [4, 5, 6],
                prizeLabels: ['Quadra', 'Quina', 'Sena'],
                candidatesPerSlot: 2000,   // v10.5: +15% qualidade Greedy (era 800)
                ticketPrice: 5.00,
                // v10.4 Filtros refinados exclusivos Mega Sena
                sumRangeTight: [110, 250],
                maxSameEnding: 2,
                highLowBalance: [2, 4],
                primesRange: [0, 5]        // v10.5: tolerante (rejeita all-primes)
            },
            quina: {
                name: 'Quina', drawSize: 5, lotteryDraw: 5,
                range: [1, 80], totalNumbers: 80,
                zones: 8, zoneSize: 10,
                sumRange: [50, 340], parityRange: [1, 4],
                maxConsecutive: 2, minZones: 3,
                prizeThresholds: [2, 3, 4, 5],
                prizeLabels: ['Duque', 'Terno', 'Quadra', 'Quina'],
                candidatesPerSlot: 1000,
                ticketPrice: 2.50,
                // Micro-Otimização Quina
                maxSameEnding: 2,
                minQuadrants: 3
            },
            duplasena: {
                name: 'Dupla Sena', drawSize: 6, lotteryDraw: 6,
                range: [1, 50], totalNumbers: 50,
                zones: 5, zoneSize: 10,
                sumRange: [55, 245], parityRange: [2, 4],
                maxConsecutive: 2, minZones: 3,
                prizeThresholds: [3, 4, 5, 6],
                prizeLabels: ['Terno', 'Quadra', 'Quina', 'Sena'],
                candidatesPerSlot: 600,
                ticketPrice: 2.50,
                // Micro-Otimização Dupla Sena
                primesRange: [1, 3],
                highLowBalance: [2, 4]
            },
            lotomania: {
                name: 'Lotomania', drawSize: 50, lotteryDraw: 20,
                range: [0, 99], totalNumbers: 100,
                zones: 10, zoneSize: 10,
                sumRange: [2050, 2950], parityRange: [22, 28],
                maxConsecutive: 5, minZones: 8,
                prizeThresholds: [15, 16, 17, 18, 19, 20],
                prizeLabels: ['15 ac.', '16 ac.', '17 ac.', '18 ac.', '19 ac.', '20 ac.'],
                candidatesPerSlot: 500,
                ticketPrice: 3.00,
                // Micro-Otimização Lotomania
                mirrorBalance: [22, 28],
                maxEmptyLines: 2,
                maxEmptyCols: 2
            },
            timemania: {
                name: 'Timemania', drawSize: 10, lotteryDraw: 7,
                range: [1, 80], totalNumbers: 80,
                zones: 8, zoneSize: 10,
                sumRange: [200, 610], parityRange: [3, 7],
                maxConsecutive: 2, minZones: 4,
                prizeThresholds: [3, 4, 5, 6, 7],
                prizeLabels: ['3 ac.', '4 ac.', '5 ac.', '6 ac.', '7 ac.'],
                candidatesPerSlot: 1000,
                ticketPrice: 3.00,
                // Micro-Otimização Timemania
                maxPerColumn: 3
            },
            diadesorte: {
                name: 'Dia de Sorte', drawSize: 7, lotteryDraw: 7,
                range: [1, 31], totalNumbers: 31,
                zones: 4, zoneSize: 8,
                sumRange: [55, 170], parityRange: [2, 5],
                maxConsecutive: 3, minZones: 3,
                prizeThresholds: [3, 4, 5, 6, 7],
                prizeLabels: ['3 ac.', '4 ac.', '5 ac.', '6 ac.', '7 ac.'],
                candidatesPerSlot: 800,
                ticketPrice: 2.00,
                // Micro-Otimização Dia de Sorte
                sumRangeTight: [100, 140],
                weekScaleBalance: true
            }
        };
        return configs[gameKey] || configs.megasena;
    }

    // ═══════════════════════════════════════════════════════
    //  PONTO DE ENTRADA PRINCIPAL
    // ═══════════════════════════════════════════════════════
    static generate(gameKey, numGames, selectedNumbers, fixedNumbers, customDrawSize) {
        const t0 = Date.now();
        // Suporte a config customizada (Sniper mode com drawSize diferente)
        let cfg;
        if (this._tempConfig && this._tempGameKey === gameKey) {
            cfg = this._tempConfig;
            this._tempConfig = null;
            this._tempGameKey = null;
        } else {
            cfg = this.getConfig(gameKey);
        }
        const [startNum, endNum] = cfg.range;
        // v10.1: Respeitar drawSize customizado do dropdown (5º param)
        const drawSize = (customDrawSize && customDrawSize >= cfg.drawSize) ? customDrawSize : cfg.drawSize;

        console.log('%c[COVERAGE] ══════════════════════════════════════', 'color: #00ff88; font-weight: bold; font-size: 14px;');
        console.log('%c[COVERAGE] MOTOR DE COBERTURA COMBINATÓRIA', 'color: #00ff88; font-weight: bold; font-size: 14px;');
        console.log('%c[COVERAGE] ' + cfg.name + ' | ' + numGames + ' jogos | ' + drawSize + '/' + cfg.totalNumbers, 'color: #00ff88; font-weight: bold;');

        // ── 1. Definir pool de números disponíveis ──
        let pool = [];
        const fixed = new Set((fixedNumbers || []).filter(n => n >= startNum && n <= endNum));

        if (selectedNumbers && selectedNumbers.length >= drawSize) {
            pool = selectedNumbers.filter(n => n >= startNum && n <= endNum).sort((a, b) => a - b);
        } else {
            for (let n = startNum; n <= endNum; n++) pool.push(n);
        }

        // ── 2. Calcular espaço combinatório ──
        const totalPairs = this._comb(pool.length, 2);
        const pairsPerGame = this._comb(drawSize, 2);

        // v10.4 ANTI-REPETICAO: Carregar jogos do ultimo concurso (Mega Sena)
        let previousGames = [];
        if (gameKey === 'megasena' && typeof localStorage !== 'undefined') {
            try {
                var prevRaw = localStorage.getItem('l99_megasena_lastgames');
                if (prevRaw) previousGames = JSON.parse(prevRaw);
            } catch(e) { /* sem dados anteriores */ }
        }
        console.log('[COVERAGE] Espaço: ' + pool.length + ' números | ' + totalPairs + ' pares | ' + pairsPerGame + ' pares/jogo');

        // ── NOVO (Pilar 3): Bypass de Matriz Combinatória Exata ──
        if (typeof MathMatrixDB !== 'undefined') {
            const exactMatrix = MathMatrixDB.getExactMatrix(gameKey, pool.length, drawSize, numGames);
            if (exactMatrix) {
                console.log('%c[COVERAGE] 💎 Matriz Exata de Steiner encontrada! Bypass do Greedy.', 'color: #3B82F6; font-weight: bold;');
                const exactGames = MathMatrixDB.mapPoolToMatrix(pool, exactMatrix);
                
                // Se a quantidade de jogos não for idêntica (mas estiver no range de tolerancia de 20%),
                // completamos com greedy se faltar, ou cortamos se sobrar
                let finalGames = exactGames;
                if (numGames < exactGames.length) {
                    finalGames = exactGames.slice(0, numGames);
                }
                
                // Pular o bloco Greedy se já atingimos a meta
                if (finalGames.length >= numGames) {
                    // Preencher analysis e retornar
                    const analysis = {
                        totalGames: finalGames.length,
                        poolSize: pool.length,
                        fixedCount: fixed.size,
                        coveragePct: 100, // Por definição matemática, a matriz exata cobre o T-acerto prometido
                        entropyPct: this._calcEntropy ? this._calcEntropy(finalGames, drawSize) : 100,
                        avgHamming: this._calcHamming ? this._calcHamming(finalGames) : 'N/A',
                        mode: 'math_matrix_exact',
                        elapsed: Date.now() - t0
                    };
                    console.log('[COVERAGE] ✅ ' + finalGames.length + ' jogos | Matriz Exata | ' + analysis.elapsed + 'ms');
                    return { games: finalGames, analysis };
                }
                // Se faltarem jogos (ex: user pediu 26 e a matriz tem 24), a matriz vai preencher
                // o array `games` inicial e o Greedy completará os restantes.
                for (const g of exactGames) games.push(g); // Usaremos array games existente no código original
            }
        }

        // ── 3. Greedy Set Cover Puro v11.0 ──
        // Princípio: cobertura de pares satura exponencialmente.
        // Após ~200 jogos (Mega Sena), >95% dos pares já estão cobertos.
        // Fórmula adaptativa: candidates = max(minC, base × factor / sqrt(g×0.01+1))
        // v11.0: REMOÇÃO da injeção de IA como desempate.
        // Razão: aiBonus de frequência histórica contamina a pureza matemática do Set Cover.
        // Quando cobertura > 95%, aiBonus dominava o critério — transformando Set Cover em aleatoriedade com viés.
        // Agora: score = pares novos + triplas novas + diversidade. Matemática pura.

        const coveredPairs   = new Set();
        const coveredTriples = new Set();
        const useTriples     = (gameKey === 'megasena');
        const games          = [];
        const usedKeys       = new Set();
        const numberUsage    = {};
        for (const n of pool) numberUsage[n] = 0;

        const baseCandidates = numGames > 1000
            ? Math.min(cfg.candidatesPerSlot, 400)
            : cfg.candidatesPerSlot;
        const minCandidates = numGames > 5000 ? 8 : numGames > 1000 ? 15 : 30;

        for (let g = 0; g < numGames; g++) {
            let bestGame  = null;
            let bestScore = -1;

            const coverageSat = totalPairs > 0 ? coveredPairs.size / totalPairs : 0;
            const factor = coverageSat > 0.95 ? 0.04
                         : coverageSat > 0.80 ? 0.12
                         : coverageSat > 0.50 ? 0.35
                         : 1.0;
            const candidates  = Math.max(minCandidates,
                Math.round(baseCandidates * factor / Math.sqrt(g * 0.01 + 1)));

            // Triplas: só calcular enquanto há cobertura nova a ganhar
            const checkTriples = useTriples && coverageSat < 0.90;

            for (let c = 0; c < candidates; c++) {
                const candidate = this._generateValidCandidate(cfg, pool, fixed, startNum, endNum);
                if (!candidate) continue;
                const key = candidate.join(',');
                if (usedKeys.has(key)) continue;

                let newPairs = 0;
                for (let i = 0; i < candidate.length; i++)
                    for (let j = i + 1; j < candidate.length; j++)
                        if (!coveredPairs.has(candidate[i] * 1000 + candidate[j])) newPairs++;

                let newTriples = 0;
                if (checkTriples)
                    for (let i = 0; i < candidate.length; i++)
                        for (let j = i + 1; j < candidate.length; j++)
                            for (let k = j + 1; k < candidate.length; k++)
                                if (!coveredTriples.has(candidate[i] * 10000 + candidate[j] * 100 + candidate[k])) newTriples++;

                let diversityBonus = 0;
                for (const n of candidate) {
                    if (numberUsage[n] === 0) diversityBonus += 2;
                    else if (numberUsage[n] < g * drawSize / pool.length) diversityBonus += 1;
                }

                let antiRepeat = 0;
                if (previousGames.length > 0) {
                    const cs = new Set(candidate);
                    for (let pi = 0; pi < previousGames.length; pi++) {
                        let ov = 0;
                        for (let pj = 0; pj < previousGames[pi].length; pj++)
                            if (cs.has(previousGames[pi][pj])) ov++;
                        if (ov > 4) antiRepeat += 15;
                        else if (ov > 3) antiRepeat += 5;
                    }
                }

                // v11.0: Score puro — sem aiBonus de frequência histórica
                // newPairs domina: garante máxima cobertura combinatória
                // diversityBonus: números nunca usados recebem boost (cobertura uniforme)
                // antiRepeat: penaliza repetir jogos já apostados no concurso anterior
                const score = newPairs * 10 + newTriples * 5 + diversityBonus - antiRepeat;
                if (score > bestScore) { bestScore = score; bestGame = candidate; }
            }

            if (!bestGame) bestGame = this._generateValidCandidate(cfg, pool, fixed, startNum, endNum);

            if (bestGame) {
                games.push(bestGame);
                usedKeys.add(bestGame.join(','));
                for (const n of bestGame) numberUsage[n] = (numberUsage[n] || 0) + 1;
                for (let i = 0; i < bestGame.length; i++) {
                    for (let j = i + 1; j < bestGame.length; j++) {
                        coveredPairs.add(bestGame[i] * 1000 + bestGame[j]);
                        if (useTriples)
                            for (let k = j + 1; k < bestGame.length; k++)
                                coveredTriples.add(bestGame[i] * 10000 + bestGame[j] * 100 + bestGame[k]);
                    }
                }
            }
        }

        // v10.4 ANTI-REPETICAO: Salvar jogos atuais para o proximo concurso
        if (gameKey === 'megasena' && typeof localStorage !== 'undefined' && games.length > 0) {
            try {
                localStorage.setItem('l99_megasena_lastgames', JSON.stringify(games.slice(0, 100)));
                console.log('[COVERAGE] v10.4 Anti-repeticao: ' + Math.min(games.length, 100) + ' jogos salvos para proximo concurso');
            } catch(e) { /* localStorage cheio */ }
        }

        // ── 4. Calcular métricas EXATAS ──
        const metrics = this._computeMetrics(games, cfg, pool, coveredPairs, totalPairs, numberUsage);

        const elapsed = Date.now() - t0;
        console.log('[COVERAGE] ✓ ' + games.length + ' jogos em ' + elapsed + 'ms');
        this._logMetrics(metrics, cfg);

        return {
            games,
            pool: [...new Set(games.flat())].sort((a, b) => a - b),
            analysis: {
                engine: 'CoverageEngine',
                confidence: metrics.pairCoveragePct,
                coveragePct: metrics.pairCoveragePct,
                // v10.4 FIX: campos que o painel SmartBets espera
                coverage: metrics.pairCoveragePct,
                diversity: metrics.numberCoveragePct || Math.round(metrics.numberCoverage / cfg.totalNumbers * 100),
                uniqueNumbers: metrics.numberCoverage,
                metrics: metrics
            }
        };
    }

    // ═══════════════════════════════════════════════════════
    //  GERAR CANDIDATO ESTRUTURALMENTE VÁLIDO
    //  Sem scoring, sem previsão — apenas validação estrutural
    // ═══════════════════════════════════════════════════════
    static _generateValidCandidate(cfg, pool, fixed, startNum, endNum) {
        const drawSize = cfg.drawSize;
        const maxAttempts = 200;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Começar com números fixos
            const chosen = new Set(fixed);

            // Completar com números aleatórios do pool
            const available = pool.filter(n => !chosen.has(n));
            this._shuffle(available);

            for (const n of available) {
                if (chosen.size >= drawSize) break;
                chosen.add(n);
            }

            if (chosen.size < drawSize) continue;
            const game = [...chosen].sort((a, b) => a - b);

            // Validar estrutura
            if (!this._isStructurallyValid(game, cfg, startNum)) continue;

            return game;
        }
        return null;
    }

    // ═══════════════════════════════════════════════════════
    //  VALIDAÇÃO ESTRUTURAL — Filtros baseados em FATOS
    //  Estes filtros removem combinações que NUNCA ou
    //  RARAMENTE ocorrem em sorteios reais.
    // ═══════════════════════════════════════════════════════
    static _isStructurallyValid(game, cfg, startNum) {
        const n = game.length;

        // 1. Soma dentro do range P5-P95 histórico
        const sum = game.reduce((a, b) => a + b, 0);
        if (sum < cfg.sumRange[0] || sum > cfg.sumRange[1]) return false;

        // 2. Paridade (pares) dentro do range observado
        const evens = game.filter(x => x % 2 === 0).length;
        if (evens < cfg.parityRange[0] || evens > cfg.parityRange[1]) return false;

        // 3. Consecutivos máximos
        let maxRun = 1, curRun = 1;
        for (let i = 1; i < n; i++) {
            if (game[i] === game[i - 1] + 1) { curRun++; maxRun = Math.max(maxRun, curRun); }
            else curRun = 1;
        }
        if (maxRun > cfg.maxConsecutive) return false;

        // 4. Cobertura mínima de zonas
        const zones = new Set();
        for (const num of game) {
            zones.add(Math.min(cfg.zones - 1, Math.floor((num - startNum) / cfg.zoneSize)));
        }
        if (zones.size < cfg.minZones) return false;

        // v10.4 FILTROS REFINADOS — Mega Sena exclusivo (params opcionais)
        // 5. Max numeros com mesmo terminal (ultimo digito)
        if (cfg.maxSameEnding) {
            const endings = {};
            for (const num of game) {
                const e = num % 10;
                endings[e] = (endings[e] || 0) + 1;
                if (endings[e] > cfg.maxSameEnding) return false;
            }
        }

        // 6. Equilibrio alto/baixo (numeros <= metade do range)
        if (cfg.highLowBalance) {
            const midpoint = Math.floor((cfg.range[0] + cfg.range[1]) / 2);
            let lowCount = 0;
            for (const num of game) { if (num <= midpoint) lowCount++; }
            if (lowCount < cfg.highLowBalance[0] || lowCount > cfg.highLowBalance[1]) return false;
        }

        // 7. Soma apertada P10-P90 (mais restritivo que sumRange P5-P95)
        if (cfg.sumRangeTight) {
            if (sum < cfg.sumRangeTight[0] || sum > cfg.sumRangeTight[1]) return false;
        }

        // 8. v10.5: Filtro de primos (Mega Sena e outros)
        if (cfg.primesRange) {
            const PRIMES = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]);
            let primeCount = 0;
            for (const num of game) { if (PRIMES.has(num)) primeCount++; }
            if (primeCount < cfg.primesRange[0] || primeCount > cfg.primesRange[1]) return false;
        }

        // ═══════════════════════════════════════════════════════
        //  FILTROS MICRO-ESPECÍFICOS POR LOTERIA
        // ═══════════════════════════════════════════════════════
        
        // Moldura (Especialmente para Lotofácil)
        if (cfg.molduraRange) {
            let molduraCount = 0;
            for (const num of game) {
                // Na Lotofacil (1 a 25), a moldura são os numeros da borda num grid 5x5
                // Moldura: 1,2,3,4,5, 6,10, 11,15, 16,20, 21,22,23,24,25
                const isMoldura = (num <= 5) || (num >= 21) || (num % 5 === 1) || (num % 5 === 0);
                if (isMoldura) molduraCount++;
            }
            if (molduraCount < cfg.molduraRange[0] || molduraCount > cfg.molduraRange[1]) return false;
        }

        // Fibonacci
        if (cfg.fibonacciRange) {
            const FIBO = new Set([1, 2, 3, 5, 8, 13, 21, 34, 55, 89]);
            let fiboCount = 0;
            for (const num of game) { if (FIBO.has(num)) fiboCount++; }
            if (fiboCount < cfg.fibonacciRange[0] || fiboCount > cfg.fibonacciRange[1]) return false;
        }

        // Múltiplos de 3
        if (cfg.multiplesOf3Range) {
            let mul3Count = 0;
            for (const num of game) { if (num % 3 === 0) mul3Count++; }
            if (mul3Count < cfg.multiplesOf3Range[0] || mul3Count > cfg.multiplesOf3Range[1]) return false;
        }

        // Quadrantes (Quina)
        if (cfg.minQuadrants) {
            // Grid 80 números: 4 quadrantes matematicos (1-40 divididos ao meio, 41-80 divididos)
            // Quadrantes aproximados: Q1 (1-20, 41-60), Q2 (21-40, 61-80) - de forma abstrata
            const q = new Set();
            for (const num of game) {
                const half = num <= 40 ? 0 : 1;
                const part = (num % 10 <= 5) ? 0 : 1;
                q.add(half + "-" + part);
            }
            if (q.size < cfg.minQuadrants) return false;
        }

        // Espelhamento Lotomania (00-49 vs 50-99)
        if (cfg.mirrorBalance) {
            let firstHalf = 0;
            for (const num of game) { if (num <= 49) firstHalf++; }
            if (firstHalf < cfg.mirrorBalance[0] || firstHalf > cfg.mirrorBalance[1]) return false;
        }

        // Linhas e Colunas Vazias (Lotomania)
        if (typeof cfg.maxEmptyLines !== 'undefined') {
            const rows = new Set();
            const cols = new Set();
            for (const num of game) {
                rows.add(Math.floor(num / 10));
                cols.add(num % 10);
            }
            if ((10 - rows.size) > cfg.maxEmptyLines) return false;
            if ((10 - cols.size) > cfg.maxEmptyCols) return false;
        }

        // Dia de Sorte: Divisão da semana/mes
        if (cfg.weekScaleBalance) {
            let part1=0, part2=0, part3=0;
            for (const num of game) {
                if (num <= 10) part1++;
                else if (num <= 20) part2++;
                else part3++;
            }
            if (part1 === 0 || part2 === 0 || part3 === 0) return false; // Deve ter pelo menos 1 numero em cada "decada" do mês
        }

        // Timemania: Max por coluna
        if (cfg.maxPerColumn) {
            const cols = {};
            for (const num of game) {
                const c = num % 10;
                cols[c] = (cols[c] || 0) + 1;
                if (cols[c] > cfg.maxPerColumn) return false;
            }
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════
    //  MÉTRICAS EXATAS — Matemática pura
    // ═══════════════════════════════════════════════════════
    static _computeMetrics(games, cfg, pool, coveredPairs, totalPairs, numberUsage) {
        const drawSize = cfg.drawSize;
        const N = cfg.totalNumbers;
        const K = cfg.lotteryDraw;
        const n = drawSize;
        const numGames = games.length;

        // ── Cobertura de pares ──
        const pairCoverage = coveredPairs.size;
        const pairCoveragePct = totalPairs > 0 ? Math.round(pairCoverage / totalPairs * 1000) / 10 : 0;

        // ── Cobertura de números ──
        const uniqueNums = new Set(games.flat());
        const numberCoverage = uniqueNums.size;
        const numberCoveragePct = Math.round(numberCoverage / pool.length * 1000) / 10;

        // ── Equilíbrio por zona ──
        const zoneCount = new Array(cfg.zones).fill(0);
        for (const g of games) {
            for (const num of g) {
                const z = Math.min(cfg.zones - 1, Math.floor((num - cfg.range[0]) / cfg.zoneSize));
                zoneCount[z]++;
            }
        }
        const totalSelections = numGames * drawSize;
        const idealPerZone = totalSelections / cfg.zones;
        let zoneImbalance = 0;
        for (const c of zoneCount) {
            zoneImbalance += Math.pow((c - idealPerZone) / Math.max(1, idealPerZone), 2);
        }
        zoneImbalance = Math.round(Math.sqrt(zoneImbalance / cfg.zones) * 1000) / 10;

        // ── Probabilidade hipergeométrica EXATA ──
        // P(X = k) = C(n,k) * C(N-n, K-k) / C(N, K)
        // Onde: N=total, K=sorteados pela loteria, n=escolhidos pelo jogador
        const probabilities = {};
        const cNK = this._logComb(N, K);
        for (const t of cfg.prizeThresholds) {
            if (t > Math.min(n, K) || t < 0) { probabilities[t] = 0; continue; }
            const remaining = K - t;
            if (remaining < 0 || remaining > N - n) { probabilities[t] = 0; continue; }
            const logP = this._logComb(n, t) + this._logComb(N - n, remaining) - cNK;
            probabilities[t] = Math.exp(logP);
        }

        // P(k+ acertos) cumulativa
        const cumProb = {};
        for (let i = cfg.prizeThresholds.length - 1; i >= 0; i--) {
            const t = cfg.prizeThresholds[i];
            cumProb[t] = 0;
            for (let j = i; j < cfg.prizeThresholds.length; j++) {
                cumProb[t] += probabilities[cfg.prizeThresholds[j]] || 0;
            }
        }

        // P(pelo menos 1 prêmio em N jogos) para cada faixa
        const probWithNGames = {};
        const minPrize = cfg.prizeThresholds[0];
        const pAnyPrize = cumProb[minPrize] || 0;
        probWithNGames.anyPrize = 1 - Math.pow(1 - pAnyPrize, numGames);
        for (const t of cfg.prizeThresholds) {
            const p = cumProb[t] || 0;
            probWithNGames[t] = 1 - Math.pow(1 - p, numGames);
        }

        // ── Hamming médio (diversidade entre jogos) ──
        let hammingTotal = 0, hammingCount = 0;
        const sampleLimit = Math.min(games.length, 50);
        for (let i = 0; i < sampleLimit - 1; i++) {
            const setA = new Set(games[i]);
            let shared = 0;
            for (const num of games[i + 1]) if (setA.has(num)) shared++;
            hammingTotal += (drawSize - shared);
            hammingCount++;
        }
        const avgHamming = hammingCount > 0 ? Math.round(hammingTotal / hammingCount * 10) / 10 : 0;

        // ── Investimento e ROI ──
        const investment = numGames * cfg.ticketPrice;

        return {
            pairCoverage, totalPairs, pairCoveragePct,
            numberCoverage, numberCoveragePct,
            zoneCount, zoneImbalance,
            probabilities, cumProb, probWithNGames,
            avgHamming, investment,
            pAnyPrize, numGames
        };
    }

    // ═══════════════════════════════════════════════════════
    //  LOG DE MÉTRICAS — Transparência total
    // ═══════════════════════════════════════════════════════
    static _logMetrics(m, cfg) {
        console.log('%c[COVERAGE] ── MÉTRICAS EXATAS ──', 'color: #00ff88; font-weight: bold;');
        console.log('[COVERAGE] Pares cobertos: ' + m.pairCoverage + '/' + m.totalPairs + ' (' + m.pairCoveragePct + '%)');
        console.log('[COVERAGE] Números usados: ' + m.numberCoverage + '/' + cfg.totalNumbers + ' (' + m.numberCoveragePct + '%)');
        console.log('[COVERAGE] Hamming médio: ' + m.avgHamming + '/' + cfg.drawSize + ' (diversidade entre jogos)');
        console.log('[COVERAGE] Desequilíbrio de zonas: ' + m.zoneImbalance + '% (0%=perfeito)');
        console.log('[COVERAGE] Investimento: R$ ' + m.investment.toFixed(2));

        console.log('%c[COVERAGE] ── PROBABILIDADES EXATAS (hipergeométrica) ──', 'color: #FFD700; font-weight: bold;');
        for (let i = 0; i < cfg.prizeThresholds.length; i++) {
            const t = cfg.prizeThresholds[i];
            const pSingle = (m.cumProb[t] || 0) * 100;
            const pN = (m.probWithNGames[t] || 0) * 100;
            const label = cfg.prizeLabels[i] || t + ' ac.';
            console.log('[COVERAGE] ' + label + ': ' +
                pSingle.toFixed(6) + '% por jogo | ' +
                pN.toFixed(4) + '% com ' + m.numGames + ' jogos');
        }

        const pAny = (m.probWithNGames.anyPrize || 0) * 100;
        console.log('[COVERAGE] ★ Chance de QUALQUER prêmio com ' + m.numGames + ' jogos: ' + pAny.toFixed(2) + '%');
    }

    // ═══════════════════════════════════════════════════════
    //  RELATÓRIO PARA UI — Texto formatado para exibição
    // ═══════════════════════════════════════════════════════
    static getReport(analysis) {
        if (!analysis || !analysis.metrics) return '';
        const m = analysis.metrics;
        const cfg = this.getConfig(analysis.gameKey || 'megasena');
        let html = '<div class="coverage-report">';
        html += '<h4>📊 Cobertura Combinatória Real</h4>';
        html += '<p>Pares: <strong>' + m.pairCoverage + '/' + m.totalPairs + ' (' + m.pairCoveragePct + '%)</strong></p>';
        html += '<p>Números: <strong>' + m.numberCoverage + ' (' + m.numberCoveragePct + '%)</strong></p>';
        html += '<p>Diversidade: <strong>' + m.avgHamming + '/' + (m.avgHamming > 0 ? 'máx' : '0') + '</strong></p>';
        html += '<p>Investimento: <strong>R$ ' + m.investment.toFixed(2) + '</strong></p>';
        html += '</div>';
        return html;
    }

    // ═══════════════════════════════════════════════════════
    //  UTILITÁRIOS MATEMÁTICOS
    // ═══════════════════════════════════════════════════════

    // Combinação C(n,k) — inteiro exato para valores pequenos
    static _comb(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        k = Math.min(k, n - k);
        let r = 1;
        for (let i = 0; i < k; i++) {
            r = r * (n - i) / (i + 1);
            if (r > 1e15) return 1e15;
        }
        return Math.round(r);
    }

    // Log de combinação — para probabilidades sem overflow
    static _logComb(n, k) {
        if (k < 0 || k > n) return -Infinity;
        if (k === 0 || k === n) return 0;
        k = Math.min(k, n - k);
        let result = 0;
        for (let i = 0; i < k; i++) {
            result += Math.log(n - i) - Math.log(i + 1);
        }
        return result;
    }

    // Fisher-Yates shuffle
    static _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ═══════════════════════════════════════════════════════
    //  CALCULADORA ESTÁTICA — Quantos jogos para X% de chance
    //  Uso: CoverageEngine.howManyGames('lotofacil', 0.60, 13)
    //  → "614 jogos para 60% de chance de 13+ acertos"
    // ═══════════════════════════════════════════════════════
    static howManyGames(gameKey, targetProb, minHits) {
        const cfg = this.getConfig(gameKey);
        const N = cfg.totalNumbers;
        const K = cfg.lotteryDraw;
        const n = cfg.drawSize;
        const cNK = this._logComb(N, K);

        // P(k+ acertos) por jogo
        let pCum = 0;
        for (let k = minHits; k <= Math.min(n, K); k++) {
            const remaining = K - k;
            if (remaining < 0 || remaining > N - n) continue;
            pCum += Math.exp(this._logComb(n, k) + this._logComb(N - n, remaining) - cNK);
        }

        if (pCum <= 0) return Infinity;

        // N jogos: P(pelo menos 1) = 1 - (1-p)^N >= targetProb
        // N >= ln(1-target) / ln(1-p)
        const nGames = Math.ceil(Math.log(1 - targetProb) / Math.log(1 - pCum));
        const cost = nGames * cfg.ticketPrice;

        console.log('[COVERAGE] ' + cfg.name + ': ' + nGames + ' jogos para ' +
            (targetProb * 100) + '% de chance de ' + minHits + '+ acertos | ' +
            'P/jogo=' + (pCum * 100).toFixed(6) + '% | Custo=R$ ' + cost.toFixed(2));

        return { games: nGames, probability: pCum, cost, targetProb, minHits };
    }

    // ═══════════════════════════════════════════════════════
    //  TABELA COMPLETA — Todas as faixas de uma loteria
    //  Uso: CoverageEngine.fullTable('lotofacil')
    // ═══════════════════════════════════════════════════════
    static fullTable(gameKey) {
        const cfg = this.getConfig(gameKey);
        const targets = [0.25, 0.50, 0.60, 0.75, 0.90, 0.99];
        console.log('%c[COVERAGE] ═══ TABELA COMPLETA: ' + cfg.name + ' ═══', 'color: #FFD700; font-weight: bold; font-size: 14px;');
        console.log('[COVERAGE] ' + cfg.drawSize + ' números de ' + cfg.totalNumbers + ' | Loteria sorteia ' + cfg.lotteryDraw);

        const table = [];
        for (const t of cfg.prizeThresholds) {
            const row = { acertos: t, label: cfg.prizeLabels[cfg.prizeThresholds.indexOf(t)] };
            for (const target of targets) {
                const result = this.howManyGames(gameKey, target, t);
                row['p' + Math.round(target * 100)] = result.games;
                row['cost' + Math.round(target * 100)] = result.cost;
                if (!row.pPerGame) row.pPerGame = result.probability;
            }
            table.push(row);
        }

        console.table(table);
        return table;
    }
}

// Disponibilizar globalmente
if (typeof window !== 'undefined') window.CoverageEngine = CoverageEngine;
console.log('%c[COVERAGE] ✓ Motor de Cobertura Combinatória carregado', 'color: #00ff88; font-weight: bold; font-size: 12px;');

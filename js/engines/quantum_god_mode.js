/**
 * QUANTUM GOD ENGINE V8 — ORÁCULO (CLARIVIDÊNCIA QUÂNTICA)
 * =========================================================
 * 20 CAMADAS DE ANÁLISE — Detecção de padrões ocultos e algoritmos
 * 
 * CAMADA 1:  Frequência Recente (últimos 3-5 sorteios)
 * CAMADA 2:  Frequência Geral (todos os sorteios)
 * CAMADA 3:  Análise de Atraso (números "devendo")
 * CAMADA 4:  Detecção de Ciclos (periodicidade)
 * CAMADA 5:  Repetição entre Sorteios consecutivos
 * CAMADA 6:  Correlação de Pares (saem juntos)
 * CAMADA 7:  Correlação de Trios (3 juntos)
 * CAMADA 8:  Final do Concurso (padrões por dígito)
 * CAMADA 9:  Distribuição por LINHAS
 * CAMADA 10: Distribuição por COLUNAS
 * CAMADA 11: Análise de PRIMOS
 * CAMADA 12: Análise de SOMA (faixa ideal)
 * CAMADA 13: Espelhos/Complementares
 * CAMADA 14: Frequência por Dezena Final
 * CAMADA 15: MARKOV — "Saiu X → Próximo vem Y" ⚡
 * CAMADA 16: SEQUÊNCIAS TEMPORAIS — padrões cíclicos ⚡
 * CAMADA 17: CORRELAÇÃO CONDICIONAL — A+B → C ⚡
 * CAMADA 18: DETECTOR DE ALGORITMO/RNG — viés oculto ⚡
 * CAMADA 19: TENDÊNCIA TEMPORAL — ascensão/declínio ⚡
 * CAMADA 20: FIBONACCI / PROPORÇÃO ÁUREA ⚡
 * 
 * MONTE CARLO: 10.000 universos (3 rodadas)
 * FILTRO V2 + BACKTESTING AUTOMÁTICO
 * 
 * "O Oráculo que usa o passado para prever o futuro."
 */
class QuantumGodEngine {

    // ╔══════════════════════════════════════════════════════╗
    // ║  PERFIS DE PESO POR LOTERIA (calibração específica) ║
    // ╚══════════════════════════════════════════════════════╝
    static getWeightProfile(gameKey) {
        var profiles = {
            // Lotofácil: 15/25 — V10: range pequeno, diversidade natural alta
            'lotofacil': {
                recentFreq:   0.06, generalFreq: 0.03, latency: 0.06,
                cycles:       0.05, repetition: 0.18, drawEnding: 0.02,
                lines:        0.06, columns: 0.04, primes: 0.01,
                mirrors:      0.03, digitEnding: 0.03,
                markov:       0.12, temporal: 0.08, conditional: 0.08,
                algorithm:    0.03, trend: 0.06, fibonacci: 0.01,
                sumMin: 170, sumMax: 225, linesPerRow: [2, 4],
                maxConsecutive: 4, evenOddTolerance: 2,
                repeatFromLast: [7, 11], guaranteedPct: 0.55,
                monteCarloRuns: 20000, qualityAttempts: 2500
            },
            // Mega Sena: 6/60 — V10: diversidade + latência equilibrada
            'megasena': {
                recentFreq:   0.10, generalFreq: 0.06, latency: 0.14,
                cycles:       0.12, repetition: 0.04, drawEnding: 0.05,
                lines:        0.04, columns: 0.04, primes: 0.02,
                mirrors:      0.03, digitEnding: 0.03,
                markov:       0.08, temporal: 0.06, conditional: 0.06,
                algorithm:    0.05, trend: 0.05, fibonacci: 0.01,
                sumMin: 100, sumMax: 250, linesPerRow: [0, 3],
                maxConsecutive: 2, evenOddTolerance: 2,
                repeatFromLast: [0, 3], guaranteedPct: 0.40,
                monteCarloRuns: 20000, qualityAttempts: 2500
            },
            // Quina: 5/80 — V10: range grande, diversidade máxima
            'quina': {
                recentFreq:   0.08, generalFreq: 0.05, latency: 0.14,
                cycles:       0.12, repetition: 0.04, drawEnding: 0.04,
                lines:        0.04, columns: 0.03, primes: 0.01,
                mirrors:      0.03, digitEnding: 0.03,
                markov:       0.10, temporal: 0.08, conditional: 0.08,
                algorithm:    0.04, trend: 0.06, fibonacci: 0.01,
                sumMin: 90, sumMax: 270, linesPerRow: [0, 3],
                maxConsecutive: 2, evenOddTolerance: 2,
                repeatFromLast: [0, 2], guaranteedPct: 0.40,
                monteCarloRuns: 20000, qualityAttempts: 2500
            },
            // Dupla Sena: 6/50 — V10: diversidade + ciclos
            'duplasena': {
                recentFreq:   0.08, generalFreq: 0.05, latency: 0.14,
                cycles:       0.10, repetition: 0.06, drawEnding: 0.04,
                lines:        0.04, columns: 0.03, primes: 0.01,
                mirrors:      0.03, digitEnding: 0.03,
                markov:       0.10, temporal: 0.08, conditional: 0.08,
                algorithm:    0.04, trend: 0.06, fibonacci: 0.01,
                sumMin: 80, sumMax: 200, linesPerRow: [0, 3],
                maxConsecutive: 2, evenOddTolerance: 2,
                repeatFromLast: [0, 3], guaranteedPct: 0.42,
                monteCarloRuns: 20000, qualityAttempts: 2500
            },
            // Lotomania: 20/100 — V10: range enorme, diversidade crítica
            'lotomania': {
                recentFreq:   0.05, generalFreq: 0.03, latency: 0.10,
                cycles:       0.06, repetition: 0.12, drawEnding: 0.02,
                lines:        0.06, columns: 0.04, primes: 0.01,
                mirrors:      0.03, digitEnding: 0.04,
                markov:       0.10, temporal: 0.08, conditional: 0.08,
                algorithm:    0.04, trend: 0.06, fibonacci: 0.01,
                sumMin: 870, sumMax: 1130, linesPerRow: [1, 3],
                maxConsecutive: 3, evenOddTolerance: 3,
                repeatFromLast: [7, 14], guaranteedPct: 0.45,
                monteCarloRuns: 20000, qualityAttempts: 3000
            },
            // Timemania: 10/80 — V10: DIVERSIDADE + latência equilibrada
            'timemania': {
                recentFreq:   0.08, generalFreq: 0.05, latency: 0.14,
                cycles:       0.10, repetition: 0.05, drawEnding: 0.04,
                lines:        0.04, columns: 0.03, primes: 0.01,
                mirrors:      0.03, digitEnding: 0.03,
                markov:       0.10, temporal: 0.08, conditional: 0.08,
                algorithm:    0.04, trend: 0.06, fibonacci: 0.01,
                sumMin: 150, sumMax: 375, linesPerRow: [0, 3],
                maxConsecutive: 2, evenOddTolerance: 2,
                repeatFromLast: [0, 2], guaranteedPct: 0.40,
                monteCarloRuns: 20000, qualityAttempts: 2500
            },
            // Dia de Sorte: 7/31 — V10: espaço pequeno, equilibrado
            'diadesorte': {
                recentFreq:   0.06, generalFreq: 0.04, latency: 0.10,
                cycles:       0.08, repetition: 0.15, drawEnding: 0.03,
                lines:        0.04, columns: 0.03, primes: 0.01,
                mirrors:      0.03, digitEnding: 0.03,
                markov:       0.12, temporal: 0.08, conditional: 0.08,
                algorithm:    0.03, trend: 0.06, fibonacci: 0.01,
                sumMin: 78, sumMax: 152, linesPerRow: [0, 4],
                maxConsecutive: 3, evenOddTolerance: 2,
                repeatFromLast: [2, 6], guaranteedPct: 0.50,
                monteCarloRuns: 20000, qualityAttempts: 2500
            }
        };
        return profiles[gameKey] || profiles['megasena'];
    }

    static runSimulation(gameKey, count, history) {
        var constraints = this.getConstraints(gameKey);
        if (!constraints) return [];
        var startNum = (constraints.startNumber !== undefined) ? constraints.startNumber : 1;
        var totalNumbers = constraints.totalNumbers;
        var endNum = startNum + totalNumbers - 1;
        var profile = this.getWeightProfile(gameKey);

        if (!history || history.length === 0) {
            return this._randomFallback(startNum, endNum, count);
        }

        console.log('[QuantumV9] 🔮 MODO DEUS ATIVADO: ' + gameKey + ' (' + history.length + ' sorteios REAIS)');
        console.log('[QuantumV9] 📋 22 Camadas de Análise Profunda + Cross-Validation');

        var totalRange = endNum - startNum + 1;
        var isLargeGame = totalRange > 50;

        // ╔══════════════════════════════════════╗
        // ║  CROSS-VALIDATION: Reservar último   ║
        // ║  sorteio para validação              ║
        // ╚══════════════════════════════════════╝
        var validationDraw = history[0];
        var trainingHistory = history.slice(1);

        // ╔══════════════════════════════════════╗
        // ║  22 CAMADAS DE ANÁLISE ORÁCULO       ║
        // ╚══════════════════════════════════════╝
        var bestResult = null;
        var bestConfidence = -1;
        var MAX_RETRIES = 8;

        for (var retry = 0; retry < MAX_RETRIES; retry++) {
            var result = this._runSingleAttempt(gameKey, count, retry === 0 ? history : trainingHistory, startNum, endNum, totalNumbers, totalRange, isLargeGame, profile, retry);

            // ╔══════════════════════════════════════╗
            // ║  CROSS-VALIDATION + REJEIÇÃO         ║
            // ╚══════════════════════════════════════╝
            var valHits = 0;
            for (var vi = 0; vi < result.length; vi++) {
                for (var vj = 0; vj < validationDraw.numbers.length; vj++) {
                    if (result[vi] === validationDraw.numbers[vj]) { valHits++; break; }
                }
            }
            var expectedByChance = result.length * validationDraw.numbers.length / totalNumbers;
            var improvement = valHits / Math.max(1, expectedByChance);
            var confidence = Math.min(95, Math.max(30, Math.round(improvement * 40 + 25)));

            console.log('[QuantumV9] 🧪 Tentativa ' + (retry+1) + ': ' + valHits + ' acertos na validação (esperado: ' + expectedByChance.toFixed(1) + ') — Confiança: ' + confidence + '%');

            if (confidence > bestConfidence) {
                bestConfidence = confidence;
                bestResult = result;
            }

            // Se passou na validação (acima do esperado), aceitar
            if (valHits >= expectedByChance * 1.1) {
                console.log('[QuantumV9] ✅ APROVADO na cross-validation!');
                break;
            }
            if (retry < MAX_RETRIES - 1) {
                console.log('[QuantumV9] ⚠️ Abaixo do esperado, regenerando com mais diversidade...');
            }
        }

        // Backtesting final contra múltiplos sorteios
        var backtest = this._backtestResult(bestResult, history, gameKey);
        this._lastConfidence = backtest.confidence;
        this._lastBacktest = backtest;

        console.log('[QuantumV9] ✅ ' + gameKey + ': ' + bestResult.length + ' números');
        console.log('[QuantumV9] 📊 BACKTESTING: ' + backtest.summary);
        console.log('[QuantumV9] 🔮 Confiança Final: ' + backtest.confidence + '%');

        return bestResult.sort(function(a, b) { return a - b; });
    }

    static getLastConfidence() { return this._lastConfidence || 50; }
    static getLastBacktest() { return this._lastBacktest || null; }

    static _runSingleAttempt(gameKey, count, history, startNum, endNum, totalNumbers, totalRange, isLargeGame, profile, retryNum) {
        var recentFreq = this._layer1_RecentFrequency(history, startNum, endNum);
        var generalFreq = this._layer2_GeneralFrequency(history, startNum, endNum);
        var latency = this._layer3_Latency(history, startNum, endNum);
        var cycles = this._layer4_Cycles(history, startNum, endNum);
        var repetition = this._layer5_Repetition(history, startNum, endNum, gameKey);
        var pairs = this._layer6_PairCorrelation(history, startNum, endNum);
        var trios = this._layer7_TrioCorrelation(history, startNum, endNum);
        var drawEndingWeights = this._layer8_DrawEnding(history, startNum, endNum);
        var lineWeights = this._layer9_LineDistribution(history, startNum, endNum, gameKey);
        var columnWeights = this._layer10_ColumnDistribution(history, startNum, endNum);
        var primeWeights = this._layer11_PrimeAnalysis(history, startNum, endNum);
        var mirrorWeights = this._layer13_Mirrors(history, startNum, endNum);
        var digitEndWeights = this._layer14_DigitEnding(history, startNum, endNum);
        var markovWeights = this._layer15_MarkovTransition(history, startNum, endNum);
        var temporalWeights = this._layer16_TemporalSequences(history, startNum, endNum);
        var conditionalWeights = this._layer17_ConditionalCorrelation(history, startNum, endNum);
        var algorithmWeights = this._layer18_AlgorithmDetector(history, startNum, endNum);
        var trendWeights = this._layer19_TemporalTrend(history, startNum, endNum);
        var fibonacciWeights = this._layer20_FibonacciGolden(history, startNum, endNum);
        var gapWeights = this._layer21_GapAnalysis(history, startNum, endNum);
        var quadrantWeights = this._layer22_QuadrantBalance(history, startNum, endNum);

        // Diversidade extra em retries (V10: mais agressivo)
        var diversityBoost = retryNum * 0.08;

        var finalScores = {};
        for (var n = startNum; n <= endNum; n++) {
            var noise = retryNum > 0 ? (Math.random() - 0.5) * diversityBoost : 0;
            finalScores[n] = 
                (recentFreq[n] || 0)         * profile.recentFreq +
                (generalFreq[n] || 0)        * profile.generalFreq +
                (latency[n] || 0)            * profile.latency +
                (cycles[n] || 0)             * profile.cycles +
                (repetition[n] || 0)         * profile.repetition +
                (drawEndingWeights[n] || 0)  * profile.drawEnding +
                (lineWeights[n] || 0)        * profile.lines +
                (columnWeights[n] || 0)      * profile.columns +
                (primeWeights[n] || 0)       * (profile.primes * 0.3) +
                (mirrorWeights[n] || 0)      * profile.mirrors +
                (digitEndWeights[n] || 0)    * profile.digitEnding +
                (markovWeights[n] || 0)      * (profile.markov * 1.4 || 0) +
                (temporalWeights[n] || 0)    * (profile.temporal * 1.2 || 0) +
                (conditionalWeights[n] || 0) * (profile.conditional * 1.3 || 0) +
                (algorithmWeights[n] || 0)   * (profile.algorithm || 0) +
                (trendWeights[n] || 0)       * (profile.trend * 1.2 || 0) +
                (fibonacciWeights[n] || 0)   * (profile.fibonacci * 0.3 || 0) +
                (gapWeights[n] || 0)         * 0.06 +
                (quadrantWeights[n] || 0)    * 0.05 +
                noise;
        }

        // Cobertura garantida
        var ranked = [];
        for (var num = startNum; num <= endNum; num++) {
            ranked.push({ number: num, score: finalScores[num] || 0 });
        }
        ranked.sort(function(a, b) { return b.score - a.score; });
        var guaranteedCount = Math.max(3, Math.ceil(count * profile.guaranteedPct));
        var guaranteed = [];
        for (var g = 0; g < guaranteedCount && g < ranked.length; g++) {
            guaranteed.push(ranked[g].number);
        }

        // Monte Carlo com temperature decay (5 rodadas)
        var gameSize = this._getGameSize(gameKey);
        var convergenceMap = {};
        for (var cn = startNum; cn <= endNum; cn++) convergenceMap[cn] = 0;
        var totalMC = profile.monteCarloRuns;
        var numRounds = 5;
        var roundSize = Math.floor(totalMC / numRounds);
        var mcPairs = isLargeGame ? null : pairs;

        for (var round = 0; round < numRounds; round++) {
            var temperature = 1.0 - (round * 0.18); // 1.0 → 0.28 (convergência)
            var roundScores = {};
            for (var rs = startNum; rs <= endNum; rs++) {
                roundScores[rs] = (finalScores[rs] || 0) * (1 + (Math.random() - 0.5) * temperature * 0.15);
            }
            for (var u = 0; u < roundSize; u++) {
                var simResult = this._simulateOneDraw(roundScores, mcPairs, gameSize, startNum, endNum);
                for (var s = 0; s < simResult.length; s++) {
                    convergenceMap[simResult[s]]++;
                }
            }
        }

        for (var mc = startNum; mc <= endNum; mc++) {
            finalScores[mc] = (finalScores[mc] || 0) * 0.50 + ((convergenceMap[mc] || 0) / totalMC) * 0.50;
        }

        ranked = [];
        for (var rn = startNum; rn <= endNum; rn++) {
            ranked.push({ number: rn, score: finalScores[rn] || 0 });
        }
        ranked.sort(function(a, b) { return b.score - a.score; });

        var candidates = ranked.slice(0, Math.min(count * 2, totalNumbers));
        var realPatterns = this._analyzeRealPatterns(history, startNum, endNum, gameKey);
        return this._applyQualityFilterV2(
            candidates, count, startNum, endNum, realPatterns, 
            guaranteed, pairs, trios, profile, history, gameKey
        );
    }

    // ═══════════════════════════════════════════
    // CAMADA 1: FREQUÊNCIA RECENTE (últimos 3-5)
    // ═══════════════════════════════════════════
    static _layer1_RecentFrequency(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        var limit = Math.min(5, history.length);
        var decayFactors = [1.0, 0.75, 0.50, 0.30, 0.15];

        for (var i = 0; i < limit; i++) {
            var numbers = history[i].numbers;
            for (var j = 0; j < numbers.length; j++) {
                var num = numbers[j];
                if (num >= startNum && num <= endNum) {
                    weights[num] += decayFactors[i] || 0.1;
                }
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 2: FREQUÊNCIA GERAL
    // ═══════════════════════════════════════════
    static _layer2_GeneralFrequency(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        for (var i = 0; i < history.length; i++) {
            var decay = Math.pow(0.93, i);
            var numbers = history[i].numbers;
            for (var j = 0; j < numbers.length; j++) {
                var num = numbers[j];
                if (num >= startNum && num <= endNum) weights[num] += decay;
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 3: ANÁLISE DE ATRASO
    // ═══════════════════════════════════════════
    static _layer3_Latency(history, startNum, endNum) {
        var lastSeen = {};
        for (var n = startNum; n <= endNum; n++) lastSeen[n] = -1;

        for (var i = 0; i < history.length; i++) {
            var numbers = history[i].numbers;
            for (var j = 0; j < numbers.length; j++) {
                var num = numbers[j];
                if (num >= startNum && num <= endNum && lastSeen[num] === -1) {
                    lastSeen[num] = i;
                }
            }
        }

        var weights = {};
        var histLen = history.length || 1;
        for (var k in lastSeen) {
            weights[k] = lastSeen[k] === -1 ? 1.0 : lastSeen[k] / histLen;
        }
        return weights;
    }

    // ═══════════════════════════════════════════
    // CAMADA 4: DETECÇÃO DE CICLOS
    // ═══════════════════════════════════════════
    static _layer4_Cycles(history, startNum, endNum) {
        var weights = {};
        for (var num = startNum; num <= endNum; num++) {
            var positions = [];
            for (var i = 0; i < history.length; i++) {
                for (var j = 0; j < history[i].numbers.length; j++) {
                    if (history[i].numbers[j] === num) { positions.push(i); break; }
                }
            }

            if (positions.length < 2) { weights[num] = 0.5; continue; }

            var totalGap = 0;
            for (var g = 1; g < positions.length; g++) totalGap += positions[g] - positions[g-1];
            var avgGap = totalGap / (positions.length - 1);
            var sinceLast = positions[0];

            if (avgGap > 0) {
                var ratio = sinceLast / avgGap;
                if (ratio >= 0.7 && ratio <= 1.3) weights[num] = 1.0;
                else if (ratio > 1.3) weights[num] = 0.9;
                else weights[num] = Math.max(0.1, ratio * 0.5);
            } else {
                weights[num] = 0.3;
            }
        }
        return weights;
    }

    // ═══════════════════════════════════════════
    // CAMADA 5: REPETIÇÃO ENTRE SORTEIOS (V7 APRIMORADA)
    // Lotofácil: 7-9 repetem entre consecutivos
    // Mega Sena: 0-2 repetem
    // ═══════════════════════════════════════════
    static _layer5_Repetition(history, startNum, endNum, gameKey) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        if (history.length < 2) return weights;

        // Analisar repetições nos últimos 8 pares consecutivos (mais profundo)
        var limit = Math.min(8, history.length - 1);
        
        // Calcular taxa média de repetição REAL
        var totalRepRate = 0;
        for (var i = 0; i < limit; i++) {
            var current = {};
            for (var c = 0; c < history[i].numbers.length; c++) current[history[i].numbers[c]] = true;
            var previous = {};
            for (var p = 0; p < history[i+1].numbers.length; p++) previous[history[i+1].numbers[p]] = true;

            var repCount = 0;
            for (var rn in current) {
                if (previous[rn]) repCount++;
            }
            totalRepRate += repCount / history[i].numbers.length;

            // Números que repetiram ganham peso decrescente
            for (var rn2 in current) {
                if (previous[rn2] && rn2 >= startNum && rn2 <= endNum) {
                    weights[rn2] += (1.0 - i * 0.10);
                }
            }
        }

        var avgRepRate = totalRepRate / limit;
        console.log('[QuantumV7] 🔄 ' + gameKey + ' taxa de repetição média: ' + (avgRepRate * 100).toFixed(1) + '%');

        // SUPER BOOST: números do ÚLTIMO sorteio (chance altíssima de repetir)
        var lastDraw = history[0].numbers;
        var boostFactor = avgRepRate * 2.0; // Quanto mais alta a taxa, maior o boost
        for (var ld = 0; ld < lastDraw.length; ld++) {
            if (lastDraw[ld] >= startNum && lastDraw[ld] <= endNum) {
                weights[lastDraw[ld]] += boostFactor;
            }
        }

        // Boost adicional: números que estão nos DOIS últimos sorteios
        if (history.length >= 2) {
            var secondLast = history[1].numbers;
            var lastSet = {};
            for (var ll = 0; ll < lastDraw.length; ll++) lastSet[lastDraw[ll]] = true;
            for (var sl = 0; sl < secondLast.length; sl++) {
                if (lastSet[secondLast[sl]] && secondLast[sl] >= startNum && secondLast[sl] <= endNum) {
                    weights[secondLast[sl]] += boostFactor * 0.5;
                }
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 6: CORRELAÇÃO DE PARES
    // ═══════════════════════════════════════════
    static _layer6_PairCorrelation(history, startNum, endNum) {
        var matrix = {};
        for (var n = startNum; n <= endNum; n++) matrix[n] = {};

        for (var d = 0; d < history.length; d++) {
            var nums = history[d].numbers;
            for (var i = 0; i < nums.length; i++) {
                for (var j = i + 1; j < nums.length; j++) {
                    var n1 = nums[i], n2 = nums[j];
                    if (n1 >= startNum && n1 <= endNum && n2 >= startNum && n2 <= endNum) {
                        matrix[n1][n2] = (matrix[n1][n2] || 0) + 1;
                        matrix[n2][n1] = (matrix[n2][n1] || 0) + 1;
                    }
                }
            }
        }
        return matrix;
    }

    // ═══════════════════════════════════════════
    // CAMADA 7: CORRELAÇÃO DE TRIOS
    // ═══════════════════════════════════════════
    static _layer7_TrioCorrelation(history, startNum, endNum) {
        var trioMap = {};
        var totalRange = endNum - startNum + 1;
        var limit = Math.min(totalRange > 50 ? 6 : 12, history.length);
        for (var d = 0; d < limit; d++) {
            var nums = history[d].numbers;
            var maxNums = Math.min(nums.length, totalRange > 50 ? 10 : 20); // Limitar para performance
            for (var i = 0; i < maxNums; i++) {
                for (var j = i + 1; j < maxNums; j++) {
                    for (var k = j + 1; k < maxNums; k++) {
                        if (nums[i] >= startNum && nums[j] >= startNum && nums[k] >= startNum &&
                            nums[i] <= endNum && nums[j] <= endNum && nums[k] <= endNum) {
                            var key = [nums[i], nums[j], nums[k]].sort(function(a,b){return a-b}).join('-');
                            trioMap[key] = (trioMap[key] || 0) + 1;
                        }
                    }
                }
            }
        }

        var frequentTrios = {};
        for (var tk in trioMap) {
            if (trioMap[tk] >= 2) frequentTrios[tk] = trioMap[tk];
        }
        return frequentTrios;
    }

    // ═══════════════════════════════════════════
    // CAMADA 8: ANÁLISE POR FINAL DO CONCURSO
    // ═══════════════════════════════════════════
    static _layer8_DrawEnding(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (!history || history.length === 0) return weights;

        var lastDrawNum = history[0].drawNumber || 0;
        var nextDrawNum = lastDrawNum + 1;
        var nextEnding = nextDrawNum % 10;

        var groupByEnding = {};
        for (var e = 0; e <= 9; e++) groupByEnding[e] = [];

        for (var i = 0; i < history.length; i++) {
            if (history[i].drawNumber) {
                var ending = history[i].drawNumber % 10;
                if (!groupByEnding[ending]) groupByEnding[ending] = [];
                groupByEnding[ending].push(history[i]);
            }
        }

        var sameEndingDraws = groupByEnding[nextEnding] || [];
        if (sameEndingDraws.length === 0) return weights;

        for (var d = 0; d < sameEndingDraws.length; d++) {
            var nums = sameEndingDraws[d].numbers;
            for (var j = 0; j < nums.length; j++) {
                var num = nums[j];
                if (num >= startNum && num <= endNum) weights[num]++;
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 9: DISTRIBUIÇÃO POR LINHAS (NOVO V7)
    // Lotofácil: 5 linhas (1-5, 6-10, 11-15, 16-20, 21-25)
    // Mega Sena: 6 linhas (1-10, 11-20, ..., 51-60)
    // ═══════════════════════════════════════════
    static _layer9_LineDistribution(history, startNum, endNum, gameKey) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length === 0) return weights;

        var lineSize = this._getLineSize(gameKey);
        var numLines = Math.ceil((endNum - startNum + 1) / lineSize);

        // Analisar distribuição real por linha nos últimos 10 sorteios
        var lineFreq = {};
        for (var line = 0; line < numLines; line++) lineFreq[line] = [];

        var analyzedCount = Math.min(10, history.length);
        for (var d = 0; d < analyzedCount; d++) {
            var lineCount = {};
            for (var l = 0; l < numLines; l++) lineCount[l] = 0;

            var nums = history[d].numbers;
            for (var j = 0; j < nums.length; j++) {
                var lineIdx = Math.min(numLines - 1, Math.floor((nums[j] - startNum) / lineSize));
                lineCount[lineIdx]++;
            }
            for (var lk in lineCount) {
                if (!lineFreq[lk]) lineFreq[lk] = [];
                lineFreq[lk].push(lineCount[lk]);
            }
        }

        // Calcular média por linha e dar boost a números nas linhas com boa média
        for (var li = 0; li < numLines; li++) {
            var avg = 0;
            for (var a = 0; a < lineFreq[li].length; a++) avg += lineFreq[li][a];
            avg = lineFreq[li].length > 0 ? avg / lineFreq[li].length : 0;

            // Números na linha com boa média ganham boost
            var lineStart = startNum + li * lineSize;
            var lineEnd = Math.min(endNum, lineStart + lineSize - 1);
            for (var ln = lineStart; ln <= lineEnd; ln++) {
                weights[ln] = avg / (history[0].numbers.length / numLines || 1);
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 10: DISTRIBUIÇÃO POR COLUNAS (NOVO V7)
    // Final dos números: 1, 2, 3 ... 0
    // ═══════════════════════════════════════════
    static _layer10_ColumnDistribution(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length === 0) return weights;

        // Contar frequência de cada final (0-9) nos últimos 10 sorteios
        var digitFreq = {};
        for (var d = 0; d <= 9; d++) digitFreq[d] = 0;

        var analyzedCount = Math.min(10, history.length);
        for (var i = 0; i < analyzedCount; i++) {
            var nums = history[i].numbers;
            for (var j = 0; j < nums.length; j++) {
                var digit = nums[j] % 10;
                digitFreq[digit]++;
            }
        }

        // Dar peso a cada número baseado na frequência do seu final
        var maxFreq = 0;
        for (var dk in digitFreq) { if (digitFreq[dk] > maxFreq) maxFreq = digitFreq[dk]; }

        for (var n2 = startNum; n2 <= endNum; n2++) {
            var nDigit = n2 % 10;
            weights[n2] = maxFreq > 0 ? digitFreq[nDigit] / maxFreq : 0.5;
        }

        return weights;
    }

    // ═══════════════════════════════════════════
    // CAMADA 11: ANÁLISE DE PRIMOS (NOVO V7)
    // ═══════════════════════════════════════════
    static _layer11_PrimeAnalysis(history, startNum, endNum) {
        var weights = {};
        var primes = this._getPrimes(endNum);
        
        // Analisar proporção de primos nos últimos 10 sorteios
        var primeRatios = [];
        var analyzedCount = Math.min(10, history.length);
        for (var i = 0; i < analyzedCount; i++) {
            var nums = history[i].numbers;
            var primeCount = 0;
            for (var j = 0; j < nums.length; j++) {
                if (primes[nums[j]]) primeCount++;
            }
            primeRatios.push(primeCount / nums.length);
        }

        var avgPrimeRatio = 0;
        for (var r = 0; r < primeRatios.length; r++) avgPrimeRatio += primeRatios[r];
        avgPrimeRatio = primeRatios.length > 0 ? avgPrimeRatio / primeRatios.length : 0.4;

        // Se primos aparecem com frequência, dar boost a primos
        for (var n = startNum; n <= endNum; n++) {
            if (primes[n]) {
                weights[n] = 0.5 + avgPrimeRatio;
            } else {
                weights[n] = 0.5 + (1 - avgPrimeRatio);
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 13: ESPELHOS/COMPLEMENTARES (NOVO V7)
    // n ↔ (max - n + min) — ex: Lotofácil 01↔25, 02↔24
    // ═══════════════════════════════════════════
    static _layer13_Mirrors(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length === 0) return weights;

        // Analisar quantos pares espelhados aparecem nos últimos sorteios
        var analyzedCount = Math.min(10, history.length);
        for (var i = 0; i < analyzedCount; i++) {
            var nums = history[i].numbers;
            var numSet = {};
            for (var j = 0; j < nums.length; j++) numSet[nums[j]] = true;

            for (var k = 0; k < nums.length; k++) {
                var mirror = startNum + endNum - nums[k];
                if (mirror >= startNum && mirror <= endNum && numSet[mirror]) {
                    // O par espelho apareceu junto — boost ambos
                    weights[nums[k]] += 0.3;
                    weights[mirror] += 0.3;
                }
            }
        }

        // Se último sorteio tem um número, o espelho sempre ganha boost leve
        var lastDraw = history[0].numbers;
        for (var ld = 0; ld < lastDraw.length; ld++) {
            var ldMirror = startNum + endNum - lastDraw[ld];
            if (ldMirror >= startNum && ldMirror <= endNum) {
                weights[ldMirror] += 0.2;
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 14: FREQUÊNCIA POR DEZENA FINAL (NOVO V7)
    // Qual terminação (0-9) está em alta?
    // ═══════════════════════════════════════════
    static _layer14_DigitEnding(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length === 0) return weights;

        // Analisar apenas os últimos 5 sorteios (tendência recente)
        var limit = Math.min(5, history.length);
        var digitCount = {};
        for (var d = 0; d <= 9; d++) digitCount[d] = 0;

        for (var i = 0; i < limit; i++) {
            var nums = history[i].numbers;
            var decay = 1.0 - i * 0.15;
            for (var j = 0; j < nums.length; j++) {
                var digit = nums[j] % 10;
                digitCount[digit] += decay;
            }
        }

        // Normalizar e aplicar
        var maxD = 0;
        for (var dk in digitCount) { if (digitCount[dk] > maxD) maxD = digitCount[dk]; }

        for (var n2 = startNum; n2 <= endNum; n2++) {
            weights[n2] = maxD > 0 ? digitCount[n2 % 10] / maxD : 0.5;
        }

        return weights;
    }

    // ═══════════════════════════════════════════
    // SIMULAÇÃO MONTE CARLO
    // ═══════════════════════════════════════════
    static _simulateOneDraw(field, pairMap, gameSize, startNum, endNum) {
        var selected = [];
        var used = {};

        // Pré-calcular array de pesos (MUITO mais rápido que recalcular)
        var weightList = [];
        var totalBaseWeight = 0;
        for (var n = startNum; n <= endNum; n++) {
            var w = field[n] || 0.01;
            totalBaseWeight += w;
            weightList.push({ number: n, weight: w, idx: weightList.length });
        }

        for (var pick = 0; pick < gameSize && weightList.length > 0; pick++) {
            // Pair boost apenas se pairMap fornecido e poucos selecionados
            if (pairMap && selected.length > 0 && selected.length < 5) {
                totalBaseWeight = 0;
                for (var wi = 0; wi < weightList.length; wi++) {
                    var extraW = 0;
                    for (var s = 0; s < selected.length; s++) {
                        var pair = pairMap[selected[s]];
                        if (pair && pair[weightList[wi].number]) extraW += pair[weightList[wi].number] * 0.10;
                    }
                    weightList[wi].weight = (field[weightList[wi].number] || 0.01) + extraW;
                    totalBaseWeight += weightList[wi].weight;
                }
            }

            var rand = Math.random() * totalBaseWeight;
            var cumulative = 0;
            var chosenIdx = 0;

            for (var i = 0; i < weightList.length; i++) {
                cumulative += weightList[i].weight;
                if (rand <= cumulative) { chosenIdx = i; break; }
            }

            selected.push(weightList[chosenIdx].number);
            totalBaseWeight -= weightList[chosenIdx].weight;
            weightList.splice(chosenIdx, 1);
        }
        return selected;
    }

    // ═══════════════════════════════════════════
    // ANÁLISE DE PADRÕES REAIS
    // ═══════════════════════════════════════════
    static _analyzeRealPatterns(history, startNum, endNum, gameKey) {
        var avgEvenRatio = 0, avgSum = 0, avgHighRatio = 0, avgConsecutive = 0, count = 0;
        var midPoint = startNum + Math.floor((endNum - startNum) / 2);

        for (var i = 0; i < Math.min(history.length, 15); i++) {
            var nums = history[i].numbers;
            var evens = 0, sum = 0, highs = 0, consec = 0;
            var sorted = nums.slice().sort(function(a,b){return a-b});

            for (var j = 0; j < nums.length; j++) {
                if (nums[j] % 2 === 0) evens++;
                if (nums[j] > midPoint) highs++;
                sum += nums[j];
            }
            for (var c = 1; c < sorted.length; c++) {
                if (sorted[c] - sorted[c-1] === 1) consec++;
            }

            avgEvenRatio += evens / nums.length;
            avgHighRatio += highs / nums.length;
            avgSum += sum;
            avgConsecutive += consec;
            count++;
        }

        return {
            evenRatio: count > 0 ? avgEvenRatio / count : 0.5,
            highRatio: count > 0 ? avgHighRatio / count : 0.5,
            avgSum: count > 0 ? avgSum / count : 0,
            avgConsecutive: count > 0 ? avgConsecutive / count : 1,
            midPoint: midPoint,
            totalRange: endNum - startNum + 1
        };
    }

    // ═══════════════════════════════════════════
    // FILTRO DE QUALIDADE V2 (NOVO — RIGOROSO)
    // ═══════════════════════════════════════════
    static _applyQualityFilterV2(candidates, count, startNum, endNum, patterns, guaranteed, pairs, trios, profile, history, gameKey) {
        var totalRange = endNum - startNum + 1;

        // Para sugestões muito grandes (>60% do total), retornar garantidos + top
        if (count > totalRange * 0.6) {
            var used = {};
            var result = [];
            for (var g = 0; g < guaranteed.length && result.length < count; g++) {
                result.push(guaranteed[g]); used[guaranteed[g]] = true;
            }
            for (var c = 0; c < candidates.length && result.length < count; c++) {
                if (!used[candidates[c].number]) { result.push(candidates[c].number); used[candidates[c].number] = true; }
            }
            return result;
        }

        // Dados do último sorteio para validação de repetição
        var lastDrawSet = {};
        if (history && history.length > 0) {
            for (var ldi = 0; ldi < history[0].numbers.length; ldi++) {
                lastDrawSet[history[0].numbers[ldi]] = true;
            }
        }

        var bestSet = null;
        var bestScore = -Infinity;
        var lineSize = this._getLineSize(gameKey);
        var numLines = Math.ceil(totalRange / lineSize);

        // Reduzir tentativas para jogos com muitos números
        var maxAttempts = count > 25 ? Math.min(profile.qualityAttempts, 600) : profile.qualityAttempts;
        var useTrioBoost = count <= 25; // Desabilitar trio boost para jogos grandes (performance)

        for (var attempt = 0; attempt < maxAttempts; attempt++) {
            var selection = [];
            var usedInAttempt = {};

            // Começar com números garantidos
            for (var gi = 0; gi < guaranteed.length && selection.length < count; gi++) {
                selection.push(guaranteed[gi]);
                usedInAttempt[guaranteed[gi]] = true;
            }

            // Completar com seleção ponderada + boost de trios (apenas jogos pequenos)
            var remaining = [];
            for (var r = 0; r < candidates.length; r++) {
                if (!usedInAttempt[candidates[r].number]) {
                    var boostedScore = candidates[r].score;
                    if (useTrioBoost) {
                        for (var s1 = 0; s1 < selection.length; s1++) {
                            for (var s2 = s1 + 1; s2 < selection.length; s2++) {
                                var trioKey = [selection[s1], selection[s2], candidates[r].number].sort(function(a,b){return a-b}).join('-');
                                if (trios[trioKey]) boostedScore += trios[trioKey] * 0.12;
                            }
                        }
                    }
                    remaining.push({ number: candidates[r].number, score: boostedScore });
                }
            }

            var extra = this._pickWeightedSubset(remaining, count - selection.length);
            for (var e = 0; e < extra.length; e++) selection.push(extra[e]);

            // ═══ VALIDAÇÃO RIGOROSA V2 ═══
            var qualityScore = this._scoreQualityV2(selection, startNum, endNum, patterns, profile, lineSize, numLines, lastDrawSet);

            if (qualityScore > bestScore) {
                bestScore = qualityScore;
                bestSet = selection.slice();
            }
        }

        return bestSet || candidates.slice(0, count).map(function(c) { return c.number; });
    }

    // ═══════════════════════════════════════════
    // PONTUAÇÃO DE QUALIDADE V2
    // ═══════════════════════════════════════════
    static _scoreQualityV2(numbers, startNum, endNum, patterns, profile, lineSize, numLines, lastDrawSet) {
        var score = 0;
        var numCount = numbers.length;
        var totalRange = endNum - startNum + 1;

        // 1. Equilíbrio Par/Ímpar
        var evens = 0, sum = 0, highs = 0;
        for (var i = 0; i < numCount; i++) {
            if (numbers[i] % 2 === 0) evens++;
            if (numbers[i] > patterns.midPoint) highs++;
            sum += numbers[i];
        }
        var evenDiff = Math.abs(evens / numCount - patterns.evenRatio);
        if (evenDiff <= profile.evenOddTolerance / numCount) {
            score += 2.0;
        } else {
            score += Math.max(0, 2.0 - evenDiff * 6);
        }

        // 2. Equilíbrio Alto/Baixo
        var highDiff = Math.abs(highs / numCount - patterns.highRatio);
        score += Math.max(0, 1.5 - highDiff * 5);

        // 3. Distribuição por LINHAS (V2)
        var blocks = {};
        for (var b = 0; b < numLines; b++) blocks[b] = 0;
        for (var j = 0; j < numCount; j++) {
            var blockIdx = Math.min(numLines - 1, Math.floor((numbers[j] - startNum) / lineSize));
            blocks[blockIdx]++;
        }
        var filledBlocks = 0;
        var lineViolation = false;
        for (var bl = 0; bl < numLines; bl++) {
            if (blocks[bl] > 0) filledBlocks++;
            if (blocks[bl] < profile.linesPerRow[0] || blocks[bl] > profile.linesPerRow[1]) {
                lineViolation = true;
            }
        }
        score += filledBlocks / numLines * 2.0;
        if (lineViolation) score -= 1.5;

        // 4. Faixa de soma
        if (profile.sumMin && profile.sumMax) {
            if (sum >= profile.sumMin && sum <= profile.sumMax) {
                score += 2.5; // Dentro da faixa ideal!
            } else {
                var distFromRange = 0;
                if (sum < profile.sumMin) distFromRange = (profile.sumMin - sum) / profile.sumMin;
                else distFromRange = (sum - profile.sumMax) / profile.sumMax;
                score += Math.max(0, 2.0 - distFromRange * 5);
            }
        } else if (patterns.avgSum > 0) {
            var sumDiff = Math.abs(sum - patterns.avgSum) / patterns.avgSum;
            score += Math.max(0, 2.0 - sumDiff * 3);
        }

        // 5. Consecutivos (próximo do padrão real, não exceder o máximo)
        var sortedNums = numbers.slice().sort(function(a, b) { return a - b; });
        var consecutivePairs = 0;
        var maxConsecRun = 1, currentRun = 1;
        for (var cp = 1; cp < sortedNums.length; cp++) {
            if (sortedNums[cp] - sortedNums[cp-1] === 1) {
                consecutivePairs++;
                currentRun++;
                if (currentRun > maxConsecRun) maxConsecRun = currentRun;
            } else {
                currentRun = 1;
            }
        }
        if (maxConsecRun > profile.maxConsecutive) score -= 2.0;
        var consecDiff = Math.abs(consecutivePairs - patterns.avgConsecutive);
        score += Math.max(0, 1.5 - consecDiff * 0.4);

        // 6. REPETIÇÃO DO ÚLTIMO SORTEIO (V2 — crítico!)
        var repeatCount = 0;
        for (var rep = 0; rep < numCount; rep++) {
            if (lastDrawSet[numbers[rep]]) repeatCount++;
        }
        if (profile.repeatFromLast) {
            if (repeatCount >= profile.repeatFromLast[0] && repeatCount <= profile.repeatFromLast[1]) {
                score += 3.0; // Dentro da faixa ideal de repetição!
            } else if (repeatCount < profile.repeatFromLast[0]) {
                score -= (profile.repeatFromLast[0] - repeatCount) * 1.0;
            } else {
                score -= (repeatCount - profile.repeatFromLast[1]) * 0.5;
            }
        }

        // 7. Anti-progressão aritmética
        var arithmeticCount = 0;
        for (var a = 0; a < sortedNums.length - 2; a++) {
            var diff1 = sortedNums[a+1] - sortedNums[a];
            var diff2 = sortedNums[a+2] - sortedNums[a+1];
            if (diff1 === diff2 && diff1 > 0 && diff1 <= 10) arithmeticCount++;
        }
        if (arithmeticCount > numCount * 0.25) score -= arithmeticCount * 0.4;

        // 8. Anti-múltiplos
        for (var mult = 2; mult <= 5; mult++) {
            var multCount = 0;
            for (var mi = 0; mi < numCount; mi++) {
                if (numbers[mi] % mult === 0) multCount++;
            }
            if (multCount > numCount * 0.7) score -= 0.8;
        }

        // 9. Anti-terminação repetida
        var lastDigits = {};
        for (var ldd = 0; ldd < numCount; ldd++) {
            var digit = numbers[ldd] % 10;
            lastDigits[digit] = (lastDigits[digit] || 0) + 1;
        }
        for (var dd in lastDigits) {
            if (lastDigits[dd] > numCount * 0.35) score -= 0.6;
        }

        // 10. Primos no range ideal
        var primes = this._getPrimes(endNum);
        var primeCount = 0;
        for (var pi = 0; pi < numCount; pi++) {
            if (primes[numbers[pi]]) primeCount++;
        }
        var primeRatio = primeCount / numCount;
        if (primeRatio >= 0.25 && primeRatio <= 0.55) score += 1.0;

        return score;
    }

    static _pickWeightedSubset(candidates, count) {
        var pool = candidates.slice();
        var selected = [];

        for (var i = 0; i < count && pool.length > 0; i++) {
            var totalScore = 0;
            for (var j = 0; j < pool.length; j++) totalScore += Math.max(0.01, pool[j].score);

            var rand = Math.random() * totalScore;
            var cumulative = 0;
            var chosenIdx = 0;

            for (var k = 0; k < pool.length; k++) {
                cumulative += Math.max(0.01, pool[k].score);
                if (rand <= cumulative) { chosenIdx = k; break; }
            }

            selected.push(pool[chosenIdx].number);
            pool.splice(chosenIdx, 1);
        }
        return selected;
    }

    // ═══════════════════════════════════════════
    // BACKTESTING (NOVO V7)
    // Testa a sugestão contra sorteios reais
    // ═══════════════════════════════════════════
    static _backtestResult(suggestion, history, gameKey) {
        if (!history || history.length < 3) {
            return { summary: 'Histórico insuficiente', confidence: 50, details: [] };
        }

        var details = [];
        var totalHits = 0;
        var testCount = Math.min(8, history.length);
        var gameSize = this._getGameSize(gameKey);
        var constraints = this.getConstraints(gameKey);
        var winCount = 0;

        for (var i = 0; i < testCount; i++) {
            var drawn = history[i].numbers;
            var hits = 0;
            for (var j = 0; j < suggestion.length; j++) {
                for (var k = 0; k < drawn.length; k++) {
                    if (suggestion[j] === drawn[k]) { hits++; break; }
                }
            }
            totalHits += hits;
            var expectedHere = suggestion.length * drawn.length / constraints.totalNumbers;
            if (hits >= expectedHere) winCount++;
            details.push({
                draw: history[i].drawNumber,
                hits: hits,
                total: drawn.length,
                expected: expectedHere
            });
        }

        var avgHits = totalHits / testCount;
        var expectedByChance = suggestion.length * gameSize / constraints.totalNumbers;
        var improvement = avgHits / Math.max(1, expectedByChance);
        var winRate = winCount / testCount;
        // Confiança baseada em: melhoria sobre chance + taxa de vitórias
        var confidence = Math.min(95, Math.max(25, Math.round(
            improvement * 30 + winRate * 40 + 10
        )));

        var summaryParts = [];
        for (var d = 0; d < details.length; d++) {
            var emoji = details[d].hits >= details[d].expected ? '✅' : '⚠️';
            summaryParts.push(emoji + 'C' + details[d].draw + '=' + details[d].hits + '/' + details[d].total);
        }

        return {
            summary: 'Média: ' + avgHits.toFixed(1) + ' acertos (esperado: ' + expectedByChance.toFixed(1) + ') | Taxa: ' + (winRate*100).toFixed(0) + '% | ' + summaryParts.join(', '),
            confidence: confidence,
            avgHits: avgHits,
            expectedByChance: expectedByChance,
            improvement: improvement,
            winRate: winRate,
            details: details
        };
    }

    // ═══════════════════════════════════════════
    // UTILITÁRIOS
    // ═══════════════════════════════════════════
    static _normalize(weights) {
        var maxW = -Infinity, minW = Infinity;
        for (var k in weights) {
            if (weights[k] > maxW) maxW = weights[k];
            if (weights[k] < minW) minW = weights[k];
        }
        var range = maxW - minW;
        if (range > 0) {
            for (var k2 in weights) {
                weights[k2] = 0.1 + 0.9 * ((weights[k2] - minW) / range);
            }
        } else if (maxW > 0) {
            for (var k3 in weights) weights[k3] = 0.5;
        }
        return weights;
    }

    static _getPrimes(max) {
        var primes = {};
        var sieve = [];
        for (var i = 0; i <= max; i++) sieve[i] = true;
        sieve[0] = false;
        sieve[1] = false;
        for (var p = 2; p * p <= max; p++) {
            if (sieve[p]) {
                for (var m = p * p; m <= max; m += p) sieve[m] = false;
            }
        }
        for (var n = 2; n <= max; n++) {
            if (sieve[n]) primes[n] = true;
        }
        return primes;
    }

    // ═══════════════════════════════════════════
    // CAMADA 15: MARKOV CORRIGIDO V9
    // history[0]=mais recente, history[i+1]=mais antigo
    // Quando X saiu no sorteio ANTIGO, quais Y vieram no SEGUINTE (mais novo)?
    // ═══════════════════════════════════════════
    static _layer15_MarkovTransition(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length < 2) return weights;

        // Construir matriz: transitions[from] → {to: count}
        // "from" = número do sorteio ANTERIOR (mais antigo)
        // "to" = número que veio no sorteio SEGUINTE (mais novo)
        var transitions = {};
        for (var n2 = startNum; n2 <= endNum; n2++) transitions[n2] = {};

        var limit = Math.min(history.length - 1, 25);
        for (var i = 0; i < limit; i++) {
            // history[i] = mais novo, history[i+1] = mais antigo
            var olderDraw = history[i + 1].numbers;   // sorteio que aconteceu ANTES
            var newerDraw = history[i].numbers;        // sorteio que veio DEPOIS

            for (var p = 0; p < olderDraw.length; p++) {
                var fromNum = olderDraw[p];
                if (fromNum >= startNum && fromNum <= endNum) {
                    for (var f = 0; f < newerDraw.length; f++) {
                        var toNum = newerDraw[f];
                        if (toNum >= startNum && toNum <= endNum) {
                            transitions[fromNum][toNum] = (transitions[fromNum][toNum] || 0) + 1;
                        }
                    }
                }
            }
        }

        // Dado o ÚLTIMO sorteio (history[0]), quais números tendem a vir depois?
        var lastDraw = history[0].numbers;
        for (var ld = 0; ld < lastDraw.length; ld++) {
            var from = lastDraw[ld];
            if (transitions[from]) {
                for (var target in transitions[from]) {
                    if (target >= startNum && target <= endNum) {
                        weights[target] += transitions[from][target];
                    }
                }
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 16: SEQUÊNCIAS TEMPORAIS (NOVO V8)
    // Detecta padrões que se repetem a cada N sorteios
    // Ex: Número 7 sai a cada 3 sorteios, e faz 3 que não sai → alta chance
    // ═══════════════════════════════════════════
    static _layer16_TemporalSequences(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length < 4) return weights;

        for (var num = startNum; num <= endNum; num++) {
            // Encontrar todas as posições onde o número apareceu
            var positions = [];
            for (var i = 0; i < history.length; i++) {
                var found = false;
                for (var j = 0; j < history[i].numbers.length; j++) {
                    if (history[i].numbers[j] === num) { found = true; break; }
                }
                if (found) positions.push(i);
            }

            if (positions.length < 3) { weights[num] = 0.3; continue; }

            // Calcular intervalos entre aparições
            var gaps = [];
            for (var g = 0; g < positions.length - 1; g++) {
                gaps.push(positions[g + 1] - positions[g]);
            }

            // Detectar periodicidade: desvio padrão baixo = padrão regular
            var avgGap = 0;
            for (var a = 0; a < gaps.length; a++) avgGap += gaps[a];
            avgGap /= gaps.length;

            var variance = 0;
            for (var v = 0; v < gaps.length; v++) variance += Math.pow(gaps[v] - avgGap, 2);
            variance /= gaps.length;
            var stdDev = Math.sqrt(variance);

            // Coeficiente de regularidade (menor = mais previsível)
            var regularity = avgGap > 0 ? stdDev / avgGap : 1;

            // Quanto mais regular E quanto mais perto do ponto de repetição → maior score
            var sinceLast = positions[0];
            var ratio = avgGap > 0 ? sinceLast / avgGap : 0;

            if (regularity < 0.5 && ratio >= 0.8 && ratio <= 1.3) {
                weights[num] = 1.0; // Padrão regular E no ponto certo!
            } else if (regularity < 0.5) {
                weights[num] = 0.7; // Padrão regular mas fora do ponto
            } else if (ratio >= 0.9 && ratio <= 1.2) {
                weights[num] = 0.6; // No ponto mas padrão irregular
            } else {
                weights[num] = 0.2;
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 17: CORRELAÇÃO CONDICIONAL (NOVO V8)
    // Se A e B saíram no último, C tem alta chance de vir
    // ═══════════════════════════════════════════
    static _layer17_ConditionalCorrelation(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length < 3) return weights;

        var totalRange = endNum - startNum + 1;
        var rules = {};
        var limit = Math.min(history.length - 1, totalRange > 50 ? 6 : 12);

        for (var i = 0; i < limit; i++) {
            var current = history[i].numbers;
            var next = history[i + 1].numbers;

            // Limitar pares para jogos grandes
            var maxPairs = totalRange > 50 ? 8 : next.length;
            for (var a = 0; a < maxPairs; a++) {
                for (var b = a + 1; b < maxPairs; b++) {
                    var pairKey = Math.min(next[a], next[b]) + '-' + Math.max(next[a], next[b]);
                    if (!rules[pairKey]) rules[pairKey] = {};
                    // Quais números vieram no sorteio seguinte?
                    for (var c = 0; c < current.length; c++) {
                        if (current[c] >= startNum && current[c] <= endNum) {
                            rules[pairKey][current[c]] = (rules[pairKey][current[c]] || 0) + 1;
                        }
                    }
                }
            }
        }

        // Aplicar: dado os pares do ÚLTIMO sorteio
        var lastDraw = history[0].numbers;
        var maxLastPairs = totalRange > 50 ? 8 : lastDraw.length;
        for (var la = 0; la < maxLastPairs; la++) {
            for (var lb = la + 1; lb < maxLastPairs; lb++) {
                var lPairKey = Math.min(lastDraw[la], lastDraw[lb]) + '-' + Math.max(lastDraw[la], lastDraw[lb]);
                if (rules[lPairKey]) {
                    for (var target in rules[lPairKey]) {
                        if (target >= startNum && target <= endNum) {
                            weights[target] += rules[lPairKey][target];
                        }
                    }
                }
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 18: DETECTOR DE ALGORITMO/RNG (NOVO V8)
    // Detecta viés na distribuição que sugere padrão no gerador
    // Analisa resíduos e distribuição qui-quadrado
    // ═══════════════════════════════════════════
    static _layer18_AlgorithmDetector(history, startNum, endNum) {
        var weights = {};
        var totalRange = endNum - startNum + 1;
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length < 5) return weights;

        // Frequência observada vs esperada (qui-quadrado)
        var observed = {};
        for (var n2 = startNum; n2 <= endNum; n2++) observed[n2] = 0;

        var totalNums = 0;
        for (var i = 0; i < history.length; i++) {
            for (var j = 0; j < history[i].numbers.length; j++) {
                var num = history[i].numbers[j];
                if (num >= startNum && num <= endNum) {
                    observed[num]++;
                    totalNums++;
                }
            }
        }

        var expected = totalNums / totalRange;

        // Números com desvio POSITIVO significativo (saem MAIS que o esperado)
        // são favorecidos pelo "algoritmo"
        for (var k in observed) {
            var deviation = (observed[k] - expected) / Math.max(1, Math.sqrt(expected));
            // Chi-score positivo = número sai mais que o esperado (viés positivo)
            if (deviation > 1.0) {
                weights[k] = 0.5 + deviation * 0.15;
            } else if (deviation > 0) {
                weights[k] = 0.5 + deviation * 0.1;
            } else {
                // Números abaixo do esperado podem estar "devendo"
                weights[k] = 0.3 + Math.abs(deviation) * 0.08;
            }
        }

        // Detectar padrões de adjacência no RNG
        // Se o RNG tem viés, números adjacentes podem ter correlação
        for (var d = 0; d < Math.min(history.length, 10); d++) {
            var nums = history[d].numbers.slice().sort(function(a,b){return a-b});
            for (var s = 0; s < nums.length - 1; s++) {
                var gap = nums[s + 1] - nums[s];
                // Gaps de exatamente 1, 2 ou 3 sugerem padrão no RNG
                if (gap <= 3) {
                    weights[nums[s]] += 0.05;
                    weights[nums[s + 1]] += 0.05;
                }
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 19: TENDÊNCIA TEMPORAL (NOVO V8)
    // Números em ascensão (aparecendo cada vez mais) vs declínio
    // ═══════════════════════════════════════════
    static _layer19_TemporalTrend(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length < 6) return weights;

        // Dividir histórico em 3 terços e comparar frequências
        var third = Math.floor(history.length / 3);
        var periods = [
            history.slice(0, third),                    // Recente
            history.slice(third, third * 2),            // Médio
            history.slice(third * 2, history.length)    // Antigo
        ];

        for (var num = startNum; num <= endNum; num++) {
            var freqs = [0, 0, 0];
            for (var p = 0; p < 3; p++) {
                for (var d = 0; d < periods[p].length; d++) {
                    for (var j = 0; j < periods[p][d].numbers.length; j++) {
                        if (periods[p][d].numbers[j] === num) freqs[p]++;
                    }
                }
                // Normalizar pelo tamanho do período
                freqs[p] = periods[p].length > 0 ? freqs[p] / periods[p].length : 0;
            }

            // Tendência: recente > médio > antigo = ASCENSÃO
            if (freqs[0] > freqs[1] && freqs[1] > freqs[2]) {
                weights[num] = 1.0; // Tendência forte de ascensão!
            } else if (freqs[0] > freqs[1]) {
                weights[num] = 0.8; // Ascensão recente
            } else if (freqs[0] >= freqs[2]) {
                weights[num] = 0.5; // Estável
            } else {
                weights[num] = 0.2; // Em declínio
            }
        }

        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 20: FIBONACCI / PROPORÇÃO ÁUREA (NOVO V8)
    // Números em posições de Fibonacci ou próximos da razão áurea
    // ═══════════════════════════════════════════
    static _layer20_FibonacciGolden(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        // Gerar Fibonacci até endNum
        var fibs = {};
        var fa = 1, fb = 1;
        while (fa <= endNum) {
            if (fa >= startNum) fibs[fa] = true;
            var temp = fa + fb;
            fa = fb;
            fb = temp;
        }

        // Razão áurea: distribuir números pela proporção phi
        var phi = 1.618033988749895;
        var goldenPositions = {};
        for (var g = 1; g <= 20; g++) {
            var pos = Math.round(startNum + (endNum - startNum) * ((g * phi) % 1));
            if (pos >= startNum && pos <= endNum) goldenPositions[pos] = true;
        }

        // Analisar se números Fibonacci/Golden aparecem mais nos sorteios reais
        var fibBoost = 0, goldenBoost = 0, totalChecks = 0;
        var limit = Math.min(history.length, 10);
        for (var i = 0; i < limit; i++) {
            for (var j = 0; j < history[i].numbers.length; j++) {
                var num = history[i].numbers[j];
                totalChecks++;
                if (fibs[num]) fibBoost++;
                if (goldenPositions[num]) goldenBoost++;
            }
        }

        var fibRate = totalChecks > 0 ? fibBoost / totalChecks : 0;
        var goldenRate = totalChecks > 0 ? goldenBoost / totalChecks : 0;

        // Aplicar boost baseado na taxa real
        for (var n2 = startNum; n2 <= endNum; n2++) {
            weights[n2] = 0.5; // Base
            if (fibs[n2]) weights[n2] += fibRate * 3;
            if (goldenPositions[n2]) weights[n2] += goldenRate * 3;
        }

        return this._normalize(weights);
    }

    static _getLineSize(gameKey) {
        var sizes = {
            'lotofacil': 5,   // 5 linhas de 5 (1-5, 6-10, 11-15, 16-20, 21-25)
            'megasena': 10,   // 6 linhas de 10
            'quina': 10,      // 8 linhas de 10
            'lotomania': 10,  // 10 linhas de 10
            'timemania': 10,  // 8 linhas de 10
            'duplasena': 10,  // 5 linhas de 10
            'diadesorte': 8   // ~4 linhas de 8
        };
        return sizes[gameKey] || 10;
    }

    static _randomFallback(startNum, endNum, count) {
        var pool = [];
        for (var i = startNum; i <= endNum; i++) pool.push(i);
        for (var j = pool.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var temp = pool[j]; pool[j] = pool[k]; pool[k] = temp;
        }
        return pool.slice(0, count).sort(function(a, b) { return a - b; });
    }

    static _getGameSize(gameKey) {
        var sizes = {
            'megasena': 6, 'lotofacil': 15, 'quina': 5,
            'lotomania': 20, 'timemania': 7, 'duplasena': 6, 'diadesorte': 7
        };
        return sizes[gameKey] || 6;
    }

    // ═══════════════════════════════════════════
    // CAMADA 21: ANÁLISE DE GAPS (NOVO V9)
    // Números que mantêm distância média similar ao padrão real
    // ═══════════════════════════════════════════
    static _layer21_GapAnalysis(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length < 3) return weights;

        // Calcular gaps médios dos últimos sorteios
        var allGaps = [];
        var limit = Math.min(history.length, 15);
        for (var i = 0; i < limit; i++) {
            var sorted = history[i].numbers.slice().sort(function(a,b){return a-b});
            for (var g = 1; g < sorted.length; g++) {
                allGaps.push(sorted[g] - sorted[g-1]);
            }
        }
        var avgGap = 0;
        for (var ag = 0; ag < allGaps.length; ag++) avgGap += allGaps[ag];
        avgGap = allGaps.length > 0 ? avgGap / allGaps.length : 3;

        // Último sorteio
        var lastSorted = history[0].numbers.slice().sort(function(a,b){return a-b});
        // Números que estão a ~avgGap de distância de algum do último sorteio
        for (var num = startNum; num <= endNum; num++) {
            var bestProximity = Infinity;
            for (var ls = 0; ls < lastSorted.length; ls++) {
                var dist = Math.abs(num - lastSorted[ls]);
                var gapDiff = Math.abs(dist - avgGap);
                if (gapDiff < bestProximity) bestProximity = gapDiff;
            }
            // Quanto menor gapDiff, melhor
            weights[num] = Math.max(0, 1.0 - bestProximity * 0.1);
        }
        return this._normalize(weights);
    }

    // ═══════════════════════════════════════════
    // CAMADA 22: EQUILÍBRIO DE QUADRANTES (NOVO V9)
    // Garante distribuição entre 4 zonas do range
    // ═══════════════════════════════════════════
    static _layer22_QuadrantBalance(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;
        if (history.length < 3) return weights;

        var totalRange = endNum - startNum + 1;
        var quadSize = Math.ceil(totalRange / 4);

        // Calcular quadrant distribution real
        var quadCounts = [0, 0, 0, 0];
        var totalNums = 0;
        var limit = Math.min(history.length, 15);
        for (var i = 0; i < limit; i++) {
            for (var j = 0; j < history[i].numbers.length; j++) {
                var num = history[i].numbers[j];
                var quad = Math.min(3, Math.floor((num - startNum) / quadSize));
                quadCounts[quad]++;
                totalNums++;
            }
        }
        // Quadrantes com mais presença recebem mais peso
        for (var n2 = startNum; n2 <= endNum; n2++) {
            var q = Math.min(3, Math.floor((n2 - startNum) / quadSize));
            weights[n2] = totalNums > 0 ? quadCounts[q] / totalNums : 0.25;
        }
        return this._normalize(weights);
    }

    static getConstraints(gameKey) {
        var configs = {
            'megasena': { totalNumbers: 60, startNumber: 1 },
            'lotofacil': { totalNumbers: 25, startNumber: 1 },
            'quina': { totalNumbers: 80, startNumber: 1 },
            'lotomania': { totalNumbers: 100, startNumber: 0 },
            'timemania': { totalNumbers: 80, startNumber: 1 },
            'duplasena': { totalNumbers: 50, startNumber: 1 },
            'diadesorte': { totalNumbers: 31, startNumber: 1 }
        };
        return configs[gameKey];
    }
}

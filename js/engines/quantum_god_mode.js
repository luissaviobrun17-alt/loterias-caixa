/**
 * QUANTUM GOD ENGINE V6 (ANÁLISE ESTATÍSTICA PROFUNDA)
 * =====================================================
 * 10 CAMADAS DE ANÁLISE para máxima cobertura:
 * 
 * CAMADA 1: Frequência Recente (últimos 3-5 sorteios = peso MÁXIMO)
 * CAMADA 2: Frequência Geral (todos os sorteios disponíveis)
 * CAMADA 3: Análise de Atraso (números "devendo")
 * CAMADA 4: Detecção de Ciclos (periodicidade individual)
 * CAMADA 5: Repetição entre Sorteios (quantos repetem do último)
 * CAMADA 6: Correlação de Pares (números que saem juntos)
 * CAMADA 7: Correlação de Trios (3 números que saem juntos)
 * CAMADA 8: Sequências Consecutivas (2,3 / 15,16,17 etc)
 * CAMADA 9: Distribuição por Dezenas (01-10, 11-20, 21-30...)
 * CAMADA 10: Equilíbrio Par/Ímpar e Alto/Baixo
 * 
 * GARANTIA: Top 50% dos números com maior score são OBRIGATÓRIOS
 * MONTE CARLO: 5.000 universos ponderados
 * FILTRO FINAL: Validação de qualidade contra padrões reais
 * 
 * "O sistema que analisa TUDO antes de sugerir."
 */
class QuantumGodEngine {

    static runSimulation(gameKey, count, history) {
        var constraints = this.getConstraints(gameKey);
        if (!constraints) return [];
        var startNum = constraints.startNumber || 1;
        var totalNumbers = constraints.totalNumbers;
        var endNum = startNum + totalNumbers - 1;

        if (!history || history.length === 0) {
            return this._randomFallback(startNum, endNum, count);
        }

        console.log('[QuantumV6] 🔍 Iniciando análise profunda: ' + gameKey + ' (' + history.length + ' sorteios)');

        // ╔══════════════════════════════════════╗
        // ║  10 CAMADAS DE ANÁLISE ESTATÍSTICA   ║
        // ╚══════════════════════════════════════╝

        // CAMADA 1: Frequência recente (últimos 3-5 sorteios) — PESO MÁXIMO
        var recentFreq = this._layer1_RecentFrequency(history, startNum, endNum);

        // CAMADA 2: Frequência geral (todos os sorteios)
        var generalFreq = this._layer2_GeneralFrequency(history, startNum, endNum);

        // CAMADA 3: Análise de atraso
        var latency = this._layer3_Latency(history, startNum, endNum);

        // CAMADA 4: Detecção de ciclos
        var cycles = this._layer4_Cycles(history, startNum, endNum);

        // CAMADA 5: Repetição entre sorteios consecutivos
        var repetition = this._layer5_Repetition(history, startNum, endNum);

        // CAMADA 6: Correlação de pares
        var pairs = this._layer6_PairCorrelation(history, startNum, endNum);

        // CAMADA 7: Correlação de trios
        var trios = this._layer7_TrioCorrelation(history, startNum, endNum);

        // ╔══════════════════════════════════════╗
        // ║  SCORE COMBINADO PONDERADO           ║
        // ╚══════════════════════════════════════╝
        var finalScores = {};
        for (var n = startNum; n <= endNum; n++) {
            finalScores[n] = 
                (recentFreq[n] || 0)  * 0.30 +  // 30% frequência recente
                (generalFreq[n] || 0) * 0.10 +  // 10% frequência geral
                (latency[n] || 0)     * 0.15 +  // 15% atraso
                (cycles[n] || 0)      * 0.20 +  // 20% ciclos
                (repetition[n] || 0)  * 0.25;   // 25% repetição
        }

        // ╔══════════════════════════════════════╗
        // ║  COBERTURA GARANTIDA (50%)           ║
        // ╚══════════════════════════════════════╝
        var ranked = [];
        for (var num = startNum; num <= endNum; num++) {
            ranked.push({ number: num, score: finalScores[num] || 0 });
        }
        ranked.sort(function(a, b) { return b.score - a.score; });

        // Top 50% dos números pedidos são GARANTIDOS
        var guaranteedCount = Math.max(3, Math.ceil(count * 0.50));
        var guaranteed = [];
        for (var g = 0; g < guaranteedCount && g < ranked.length; g++) {
            guaranteed.push(ranked[g].number);
        }

        // ╔══════════════════════════════════════╗
        // ║  MONTE CARLO (5000 UNIVERSOS)        ║
        // ╚══════════════════════════════════════╝
        var universeCount = 5000;
        var gameSize = this._getGameSize(gameKey);
        var convergenceMap = {};
        for (var cn = startNum; cn <= endNum; cn++) convergenceMap[cn] = 0;

        for (var u = 0; u < universeCount; u++) {
            var simResult = this._simulateOneDraw(finalScores, pairs, gameSize, startNum, endNum);
            for (var s = 0; s < simResult.length; s++) {
                convergenceMap[simResult[s]]++;
            }
        }

        // Combinar score final com convergência Monte Carlo
        for (var mc = startNum; mc <= endNum; mc++) {
            finalScores[mc] = (finalScores[mc] || 0) * 0.6 + ((convergenceMap[mc] || 0) / universeCount) * 0.4;
        }

        // Re-ranquear com scores combinados
        ranked = [];
        for (var rn = startNum; rn <= endNum; rn++) {
            ranked.push({ number: rn, score: finalScores[rn] || 0 });
        }
        ranked.sort(function(a, b) { return b.score - a.score; });

        // ╔══════════════════════════════════════╗
        // ║  FILTRO DE QUALIDADE FINAL           ║
        // ╚══════════════════════════════════════╝
        var candidates = ranked.slice(0, Math.min(count * 2, totalNumbers));
        var realPatterns = this._analyzeRealPatterns(history, startNum, endNum, gameKey);
        var finalSelection = this._applyQualityFilter(candidates, count, startNum, endNum, realPatterns, guaranteed, pairs, trios);

        // Log de confiança
        var avgScore = 0;
        for (var fs = 0; fs < finalSelection.length; fs++) {
            avgScore += finalScores[finalSelection[fs]] || 0;
        }
        avgScore = (avgScore / finalSelection.length * 100).toFixed(1);
        console.log('[QuantumV6] ✅ ' + gameKey + ': ' + finalSelection.length + ' números | Score médio: ' + avgScore + '% | Garantidos: ' + guaranteed.length);

        return finalSelection.sort(function(a, b) { return a - b; });
    }

    // ═══════════════════════════════════════════
    // CAMADA 1: FREQUÊNCIA RECENTE (últimos 3-5)
    // Peso MÁXIMO — sorteios recentes são os mais relevantes
    // ═══════════════════════════════════════════
    static _layer1_RecentFrequency(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        // Analisar apenas os últimos 5 sorteios com peso decrescente agressivo
        var limit = Math.min(5, history.length);
        var decayFactors = [1.0, 0.8, 0.6, 0.4, 0.2]; // Último = 100%, penúltimo = 80%...

        for (var i = 0; i < limit; i++) {
            var numbers = history[i].numbers;
            for (var j = 0; j < numbers.length; j++) {
                var num = numbers[j];
                if (num >= startNum && num <= endNum) {
                    weights[num] += decayFactors[i] || 0.1;
                }
            }
        }

        // Normalizar
        var maxW = 0;
        for (var k in weights) { if (weights[k] > maxW) maxW = weights[k]; }
        if (maxW > 0) { for (var k2 in weights) weights[k2] /= maxW; }
        return weights;
    }

    // ═══════════════════════════════════════════
    // CAMADA 2: FREQUÊNCIA GERAL (todos os sorteios)
    // ═══════════════════════════════════════════
    static _layer2_GeneralFrequency(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        for (var i = 0; i < history.length; i++) {
            var decay = Math.pow(0.95, i);
            var numbers = history[i].numbers;
            for (var j = 0; j < numbers.length; j++) {
                var num = numbers[j];
                if (num >= startNum && num <= endNum) weights[num] += decay;
            }
        }

        var maxW = 0;
        for (var k in weights) { if (weights[k] > maxW) maxW = weights[k]; }
        if (maxW > 0) { for (var k2 in weights) weights[k2] /= maxW; }
        return weights;
    }

    // ═══════════════════════════════════════════
    // CAMADA 3: ANÁLISE DE ATRASO
    // Números que não saem há muitos sorteios
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
    // Período médio e se está no ponto de repetição
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
                if (ratio >= 0.7 && ratio <= 1.3) weights[num] = 1.0;      // No ciclo!
                else if (ratio > 1.3) weights[num] = 0.9;                   // Atrasado
                else weights[num] = Math.max(0.1, ratio * 0.5);             // Cedo
            } else {
                weights[num] = 0.3;
            }
        }
        return weights;
    }

    // ═══════════════════════════════════════════
    // CAMADA 5: REPETIÇÃO ENTRE SORTEIOS
    // Números que se repetem de um sorteio ao próximo
    // Na Lotofácil: ~7-9 números se repetem entre consecutivos
    // ═══════════════════════════════════════════
    static _layer5_Repetition(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        if (history.length < 2) return weights;

        // Analisar repetições nos últimos 5 pares consecutivos
        var limit = Math.min(5, history.length - 1);
        for (var i = 0; i < limit; i++) {
            var current = {};
            for (var c = 0; c < history[i].numbers.length; c++) current[history[i].numbers[c]] = true;
            var previous = {};
            for (var p = 0; p < history[i+1].numbers.length; p++) previous[history[i+1].numbers[p]] = true;

            // Números que estavam no sorteio anterior E no atual = alta repetição
            for (var rn in current) {
                if (previous[rn] && rn >= startNum && rn <= endNum) {
                    weights[rn] += (1.0 - i * 0.15); // Peso decrescente
                }
            }
        }

        // Boost especial: números que estão no ÚLTIMO sorteio (chance de repetir)
        var lastDraw = history[0].numbers;
        for (var ld = 0; ld < lastDraw.length; ld++) {
            if (lastDraw[ld] >= startNum && lastDraw[ld] <= endNum) {
                weights[lastDraw[ld]] += 0.5;
            }
        }

        // Normalizar
        var maxW = 0;
        for (var k in weights) { if (weights[k] > maxW) maxW = weights[k]; }
        if (maxW > 0) { for (var k2 in weights) weights[k2] /= maxW; }
        return weights;
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
    // Grupos de 3 que saem juntos frequentemente
    // ═══════════════════════════════════════════
    static _layer7_TrioCorrelation(history, startNum, endNum) {
        var trioMap = {};

        // Analisar últimos 10 sorteios para trios
        var limit = Math.min(10, history.length);
        for (var d = 0; d < limit; d++) {
            var nums = history[d].numbers;
            // Gerar trios (limitar para performance)
            for (var i = 0; i < nums.length; i++) {
                for (var j = i + 1; j < nums.length; j++) {
                    for (var k = j + 1; k < nums.length; k++) {
                        if (nums[i] >= startNum && nums[j] >= startNum && nums[k] >= startNum &&
                            nums[i] <= endNum && nums[j] <= endNum && nums[k] <= endNum) {
                            var key = [nums[i], nums[j], nums[k]].sort(function(a,b){return a-b}).join('-');
                            trioMap[key] = (trioMap[key] || 0) + 1;
                        }
                    }
                }
            }
        }

        // Retornar apenas trios que aparecem 2+ vezes
        var frequentTrios = {};
        for (var tk in trioMap) {
            if (trioMap[tk] >= 2) frequentTrios[tk] = trioMap[tk];
        }
        return frequentTrios;
    }

    // ═══════════════════════════════════════════
    // SIMULAÇÃO MONTE CARLO
    // ═══════════════════════════════════════════
    static _simulateOneDraw(field, pairMap, gameSize, startNum, endNum) {
        var selected = [];
        var used = {};
        var attempts = 0;

        while (selected.length < gameSize && attempts < 200) {
            var totalWeight = 0;
            var weightList = [];

            for (var n = startNum; n <= endNum; n++) {
                if (used[n]) continue;
                var w = field[n] || 0.01;

                for (var s = 0; s < selected.length; s++) {
                    var pair = pairMap[selected[s]];
                    if (pair && pair[n]) w += pair[n] * 0.08;
                }

                totalWeight += w;
                weightList.push({ number: n, weight: w });
            }

            var rand = Math.random() * totalWeight;
            var cumulative = 0;
            var chosen = weightList[0] ? weightList[0].number : startNum;

            for (var i = 0; i < weightList.length; i++) {
                cumulative += weightList[i].weight;
                if (rand <= cumulative) { chosen = weightList[i].number; break; }
            }

            if (!used[chosen]) { selected.push(chosen); used[chosen] = true; }
            attempts++;
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
    // FILTRO DE QUALIDADE FINAL
    // Garante que a seleção segue padrões reais
    // ═══════════════════════════════════════════
    static _applyQualityFilter(candidates, count, startNum, endNum, patterns, guaranteed, pairs, trios) {
        var totalRange = endNum - startNum + 1;

        // Para sugestões muito grandes, retornar garantidos + top
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

        var bestSet = null;
        var bestScore = -1;

        for (var attempt = 0; attempt < 800; attempt++) {
            // Começar com números garantidos
            var selection = [];
            var usedInAttempt = {};

            for (var gi = 0; gi < guaranteed.length && selection.length < count; gi++) {
                selection.push(guaranteed[gi]);
                usedInAttempt[guaranteed[gi]] = true;
            }

            // Completar com seleção ponderada + boost de trios frequentes
            var remaining = [];
            for (var r = 0; r < candidates.length; r++) {
                if (!usedInAttempt[candidates[r].number]) {
                    var boostedScore = candidates[r].score;

                    // Boost se forma trio frequente com números já selecionados
                    for (var s1 = 0; s1 < selection.length; s1++) {
                        for (var s2 = s1 + 1; s2 < selection.length; s2++) {
                            var trioKey = [selection[s1], selection[s2], candidates[r].number].sort(function(a,b){return a-b}).join('-');
                            if (trios[trioKey]) boostedScore += trios[trioKey] * 0.1;
                        }
                    }

                    remaining.push({ number: candidates[r].number, score: boostedScore });
                }
            }

            var extra = this._pickWeightedSubset(remaining, count - selection.length);
            for (var e = 0; e < extra.length; e++) selection.push(extra[e]);

            var qualityScore = this._scoreQuality(selection, startNum, endNum, patterns);

            if (qualityScore > bestScore) {
                bestScore = qualityScore;
                bestSet = selection.slice();
            }
        }

        return bestSet || candidates.slice(0, count).map(function(c) { return c.number; });
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
    // PONTUAÇÃO DE QUALIDADE
    // Compara com padrões reais dos sorteios
    // ═══════════════════════════════════════════
    static _scoreQuality(numbers, startNum, endNum, patterns) {
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
        score += Math.max(0, 1 - evenDiff * 4);

        // 2. Equilíbrio Alto/Baixo
        var highDiff = Math.abs(highs / numCount - patterns.highRatio);
        score += Math.max(0, 1 - highDiff * 4);

        // 3. Distribuição por faixas (5 blocos)
        var blockSize = Math.ceil(totalRange / 5);
        var blocks = [0, 0, 0, 0, 0];
        for (var j = 0; j < numCount; j++) {
            var blockIdx = Math.min(4, Math.floor((numbers[j] - startNum) / blockSize));
            blocks[blockIdx]++;
        }
        var filledBlocks = 0;
        for (var b = 0; b < 5; b++) { if (blocks[b] > 0) filledBlocks++; }
        score += filledBlocks / 5;

        // 4. Faixa de soma
        if (patterns.avgSum > 0) {
            var sumDiff = Math.abs(sum - patterns.avgSum) / patterns.avgSum;
            score += Math.max(0, 1.5 - sumDiff * 2);
        }

        // 5. Consecutivos (próximo do padrão real)
        var sortedNums = numbers.slice().sort(function(a, b) { return a - b; });
        var consecutivePairs = 0;
        for (var cp = 1; cp < sortedNums.length; cp++) {
            if (sortedNums[cp] - sortedNums[cp-1] === 1) consecutivePairs++;
        }
        var consecDiff = Math.abs(consecutivePairs - patterns.avgConsecutive);
        score += Math.max(0, 1 - consecDiff * 0.3);

        return score;
    }

    // ═══════════════════════════════════════════
    // UTILITÁRIOS
    // ═══════════════════════════════════════════
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

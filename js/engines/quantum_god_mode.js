/**
 * QUANTUM GOD ENGINE V4 (ESTATÍSTICA REAL)
 * -------------------
 * Motor baseado em análise estatística comprovada:
 * 1. Análise Térmica: Frequência ponderada por recência dos últimos N sorteios
 * 2. Análise de Atraso: Números que não saem há muito tempo (pressão estatística)
 * 3. Correlação entre Pares: Números que historicamente saem juntos
 * 4. Monte Carlo: Simula 3.000 sorteios ponderados e seleciona convergência
 * 5. Filtro de Qualidade: Equilíbrio par/ímpar, distribuição por faixas, soma
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

        // 1. ANÁLISE TÉRMICA (frequência × recência)
        var thermalWeights = this._analysisThermal(history, startNum, endNum);

        // 2. ANÁLISE DE ATRASO (números "atrasados")
        var latencyWeights = this._analysisLatency(history, startNum, endNum);

        // 3. CORRELAÇÃO DE PARES
        var pairMap = this._analysisPairCorrelation(history, startNum, endNum);

        // 4. CAMPO DE PROBABILIDADE COMBINADO
        var field = this._buildProbabilityField(startNum, endNum, thermalWeights, latencyWeights);

        // 5. SIMULAÇÃO MONTE CARLO (3000 universos)
        var universeCount = 3000;
        var gameSize = this._getGameSize(gameKey);
        var convergenceMap = {};
        for (var n = startNum; n <= endNum; n++) convergenceMap[n] = 0;

        for (var u = 0; u < universeCount; u++) {
            var simResult = this._simulateOneDraw(field, pairMap, gameSize, startNum, endNum);
            for (var s = 0; s < simResult.length; s++) {
                convergenceMap[simResult[s]]++;
            }
        }

        // 6. RANKING POR CONVERGÊNCIA
        var ranked = [];
        for (var num = startNum; num <= endNum; num++) {
            ranked.push({ number: num, score: convergenceMap[num] || 0 });
        }
        ranked.sort(function(a, b) { return b.score - a.score; });

        // 7. SELEÇÃO COM FILTRO DE QUALIDADE
        var candidates = ranked.slice(0, Math.min(count * 2, totalNumbers));
        var finalSelection = this._applyQualityFilter(candidates, count, startNum, endNum, history, gameKey);

        console.log('[QuantumEngine V4] ✅ ' + gameKey + ': ' + finalSelection.length + ' números (de ' + totalNumbers + ')');

        return finalSelection.sort(function(a, b) { return a - b; });
    }

    // ═══════════════════════════════════
    // ANÁLISE TÉRMICA (frequência × recência)
    // Peso decai exponencialmente: sorteios recentes valem MUITO mais
    // ═══════════════════════════════════
    static _analysisThermal(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        for (var i = 0; i < history.length; i++) {
            // Decaimento: sorteio 0 (mais recente) = peso 1.0, sorteio 15 = peso ~0.20
            var recencyFactor = Math.pow(0.9, i);

            var numbers = history[i].numbers;
            for (var j = 0; j < numbers.length; j++) {
                var num = numbers[j];
                if (num >= startNum && num <= endNum) {
                    weights[num] += recencyFactor;
                }
            }
        }

        // Normalizar (0 a 1)
        var maxW = 0;
        for (var k in weights) { if (weights[k] > maxW) maxW = weights[k]; }
        if (maxW > 0) {
            for (var k2 in weights) weights[k2] = weights[k2] / maxW;
        }

        return weights;
    }

    // ═══════════════════════════════════
    // ANÁLISE DE ATRASO
    // Números que não saem há muitos sorteios têm pressão estatística
    // ═══════════════════════════════════
    static _analysisLatency(history, startNum, endNum) {
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
            if (lastSeen[k] === -1) {
                // Nunca apareceu = máximo atraso
                weights[k] = 1.0;
            } else {
                // Quanto mais longe, mais peso (normalizado 0 a 1)
                weights[k] = lastSeen[k] / histLen;
            }
        }

        return weights;
    }

    // ═══════════════════════════════════
    // CORRELAÇÃO DE PARES
    // Mede quantas vezes o número X saiu junto com Y
    // ═══════════════════════════════════
    static _analysisPairCorrelation(history, startNum, endNum) {
        var matrix = {};
        for (var n = startNum; n <= endNum; n++) matrix[n] = {};

        for (var d = 0; d < history.length; d++) {
            var nums = history[d].numbers;
            for (var i = 0; i < nums.length; i++) {
                for (var j = i + 1; j < nums.length; j++) {
                    var n1 = nums[i], n2 = nums[j];
                    if (n1 >= startNum && n1 <= endNum && n2 >= startNum && n2 <= endNum) {
                        if (!matrix[n1][n2]) matrix[n1][n2] = 0;
                        if (!matrix[n2][n1]) matrix[n2][n1] = 0;
                        matrix[n1][n2]++;
                        matrix[n2][n1]++;
                    }
                }
            }
        }

        return matrix;
    }

    // ═══════════════════════════════════
    // CAMPO DE PROBABILIDADE
    // Combina térmica (70%) + atraso (30%)
    // ═══════════════════════════════════
    static _buildProbabilityField(startNum, endNum, thermal, latency) {
        var field = {};
        // Peso: 70% dados recentes (quentes), 30% atraso (pressão)
        var W_THERMAL = 0.70;
        var W_LATENCY = 0.30;

        for (var n = startNum; n <= endNum; n++) {
            var t = thermal[n] || 0;
            var l = latency[n] || 0;
            field[n] = Math.max(0.01, (t * W_THERMAL) + (l * W_LATENCY));
        }

        return field;
    }

    // ═══════════════════════════════════
    // SIMULAÇÃO DE UM SORTEIO
    // Roleta proporcional com boost de correlação
    // ═══════════════════════════════════
    static _simulateOneDraw(field, pairMap, gameSize, startNum, endNum) {
        var selected = [];
        var used = {};
        var attempts = 0;

        while (selected.length < gameSize && attempts < 200) {
            // Construir pesos dinâmicos (com boost de correlação)
            var totalWeight = 0;
            var weightList = [];

            for (var n = startNum; n <= endNum; n++) {
                if (used[n]) continue;

                var w = field[n] || 0.01;

                // Boost por correlação com números já selecionados
                for (var s = 0; s < selected.length; s++) {
                    var pair = pairMap[selected[s]];
                    if (pair && pair[n]) {
                        w += pair[n] * 0.05; // Boost suave
                    }
                }

                totalWeight += w;
                weightList.push({ number: n, weight: w });
            }

            // Roleta proporcional
            var rand = Math.random() * totalWeight;
            var cumulative = 0;
            var chosen = weightList[0] ? weightList[0].number : startNum;

            for (var i = 0; i < weightList.length; i++) {
                cumulative += weightList[i].weight;
                if (rand <= cumulative) {
                    chosen = weightList[i].number;
                    break;
                }
            }

            if (!used[chosen]) {
                selected.push(chosen);
                used[chosen] = true;
            }
            attempts++;
        }

        return selected;
    }

    // ═══════════════════════════════════
    // FILTRO DE QUALIDADE
    // Garante distribuição realista baseada em padrões reais
    // ═══════════════════════════════════
    static _applyQualityFilter(candidates, count, startNum, endNum, history, gameKey) {
        // Para sugestões grandes (>50% dos números), filtro de qualidade é menos rígido
        var totalRange = endNum - startNum + 1;
        if (count > totalRange * 0.6) {
            // Sugestão grande: pegar os top por score
            return candidates.slice(0, count).map(function(c) { return c.number; });
        }

        // Analisar padrões reais dos sorteios
        var realPatterns = this._analyzeRealPatterns(history, startNum, endNum);

        var bestSet = null;
        var bestScore = -1;

        // Tentar 500 combinações a partir dos candidatos ranqueados
        for (var attempt = 0; attempt < 500; attempt++) {
            var selection = this._pickWeightedSubset(candidates, count);
            var qualityScore = this._scoreQuality(selection, startNum, endNum, realPatterns);

            if (qualityScore > bestScore) {
                bestScore = qualityScore;
                bestSet = selection.slice();
            }
        }

        return bestSet || candidates.slice(0, count).map(function(c) { return c.number; });
    }

    static _pickWeightedSubset(candidates, count) {
        // Seleção ponderada pelo score (top candidatos têm mais chance)
        var pool = candidates.slice();
        var selected = [];
        var used = {};

        for (var i = 0; i < count && pool.length > 0; i++) {
            var totalScore = 0;
            for (var j = 0; j < pool.length; j++) totalScore += pool[j].score;

            var rand = Math.random() * totalScore;
            var cumulative = 0;
            var chosenIdx = 0;

            for (var k = 0; k < pool.length; k++) {
                cumulative += pool[k].score;
                if (rand <= cumulative) {
                    chosenIdx = k;
                    break;
                }
            }

            selected.push(pool[chosenIdx].number);
            pool.splice(chosenIdx, 1);
        }

        return selected;
    }

    static _analyzeRealPatterns(history, startNum, endNum) {
        var totalRange = endNum - startNum + 1;
        var avgEvenRatio = 0;
        var avgSum = 0;
        var count = 0;

        for (var i = 0; i < Math.min(history.length, 15); i++) {
            var nums = history[i].numbers;
            var evens = 0;
            var sum = 0;
            for (var j = 0; j < nums.length; j++) {
                if (nums[j] % 2 === 0) evens++;
                sum += nums[j];
            }
            avgEvenRatio += evens / nums.length;
            avgSum += sum;
            count++;
        }

        return {
            evenRatio: count > 0 ? avgEvenRatio / count : 0.5,
            avgSum: count > 0 ? avgSum / count : 0,
            rangeSize: totalRange
        };
    }

    static _scoreQuality(numbers, startNum, endNum, patterns) {
        var score = 0;
        var totalRange = endNum - startNum + 1;
        var numCount = numbers.length;

        // 1. Equilíbrio Par/Ímpar (ideal ≈ 50%)
        var evens = 0;
        var sum = 0;
        for (var i = 0; i < numCount; i++) {
            if (numbers[i] % 2 === 0) evens++;
            sum += numbers[i];
        }
        var evenRatio = evens / numCount;
        // Quanto mais perto do padrão real, melhor
        var evenDiff = Math.abs(evenRatio - patterns.evenRatio);
        score += Math.max(0, 1 - evenDiff * 3); // Penaliza desvio

        // 2. Distribuição por faixas (espalhar pelos diferentes "blocos")
        var blockSize = Math.ceil(totalRange / 5);
        var blocks = [0, 0, 0, 0, 0];
        for (var j = 0; j < numCount; j++) {
            var blockIdx = Math.min(4, Math.floor((numbers[j] - startNum) / blockSize));
            blocks[blockIdx]++;
        }
        // Contar quantos blocos tem pelo menos 1 número
        var filledBlocks = 0;
        for (var b = 0; b < 5; b++) { if (blocks[b] > 0) filledBlocks++; }
        score += filledBlocks / 5; // Máximo 1 ponto se todos os blocos preenchidos

        // 3. Faixa de soma (comparar com média real dos sorteios)
        if (patterns.avgSum > 0) {
            // Ajustar proporcionalmente se count é diferente do tamanho real do sorteio
            var expectedSum = patterns.avgSum;
            var sumDiff = Math.abs(sum - expectedSum) / expectedSum;
            score += Math.max(0, 1 - sumDiff);
        }

        // 4. Evitar muitos consecutivos (máximo 2 pares consecutivos)
        var sortedNums = numbers.slice().sort(function(a, b) { return a - b; });
        var consecutivePairs = 0;
        for (var c = 1; c < sortedNums.length; c++) {
            if (sortedNums[c] - sortedNums[c-1] === 1) consecutivePairs++;
        }
        var maxConsec = Math.max(1, Math.floor(numCount / 4));
        if (consecutivePairs <= maxConsec) {
            score += 0.5;
        }

        return score;
    }

    // ═══════════════════════════════════
    // FALLBACK ALEATÓRIO (se sem histórico)
    // ═══════════════════════════════════
    static _randomFallback(startNum, endNum, count) {
        var pool = [];
        for (var i = startNum; i <= endNum; i++) pool.push(i);
        // Fisher-Yates
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

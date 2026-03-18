/**
 * QUANTUM GOD ENGINE V5 (COBERTURA GARANTIDA)
 * -------------------
 * Motor baseado em análise estatística comprovada:
 * 1. Análise Térmica: Frequência ponderada por recência
 * 2. Análise de Atraso: Números que não saem há muito tempo
 * 3. Análise de Ciclos: Detecta periodicidade de cada número
 * 4. Correlação entre Pares: Números que historicamente saem juntos
 * 5. COBERTURA GARANTIDA: Top 30% dos mais quentes são obrigatórios
 * 6. Monte Carlo 5.000 universos + Filtro de Qualidade
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

        // 3. ANÁLISE DE CICLOS (periodicidade de cada número)
        var cycleWeights = this._analysisCycles(history, startNum, endNum);

        // 4. CORRELAÇÃO DE PARES
        var pairMap = this._analysisPairCorrelation(history, startNum, endNum);

        // 5. CAMPO DE PROBABILIDADE COMBINADO (50% térmica + 25% atraso + 25% ciclos)
        var field = this._buildProbabilityField(startNum, endNum, thermalWeights, latencyWeights, cycleWeights);

        // 6. COBERTURA GARANTIDA: top 30% dos mais quentes são obrigatórios
        var guaranteed = this._getGuaranteedNumbers(thermalWeights, cycleWeights, count, startNum, endNum);

        // 7. SIMULAÇÃO MONTE CARLO (5000 universos)
        var universeCount = 5000;
        var gameSize = this._getGameSize(gameKey);
        var convergenceMap = {};
        for (var n = startNum; n <= endNum; n++) convergenceMap[n] = 0;

        for (var u = 0; u < universeCount; u++) {
            var simResult = this._simulateOneDraw(field, pairMap, gameSize, startNum, endNum);
            for (var s = 0; s < simResult.length; s++) {
                convergenceMap[simResult[s]]++;
            }
        }

        // 8. RANKING POR CONVERGÊNCIA
        var ranked = [];
        for (var num = startNum; num <= endNum; num++) {
            ranked.push({ number: num, score: convergenceMap[num] || 0 });
        }
        ranked.sort(function(a, b) { return b.score - a.score; });

        // 9. SELEÇÃO FINAL: garantidos + top convergentes + filtro de qualidade
        var candidates = ranked.slice(0, Math.min(count * 2, totalNumbers));
        var finalSelection = this._applyQualityFilter(candidates, count, startNum, endNum, history, gameKey, guaranteed);

        console.log('[QuantumEngine V5] ✅ ' + gameKey + ': ' + finalSelection.length + ' números | Garantidos: ' + guaranteed.length + ' | Universos: ' + universeCount);

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
    // ANÁLISE DE CICLOS
    // Detecta o período médio de repetição de cada número
    // Se número X sai a cada ~5 sorteios e já está há 4 sem sair, alto peso
    // ═══════════════════════════════════
    static _analysisCycles(history, startNum, endNum) {
        var weights = {};
        for (var n = startNum; n <= endNum; n++) weights[n] = 0;

        for (var num = startNum; num <= endNum; num++) {
            // Encontrar todas as posições onde este número apareceu
            var positions = [];
            for (var i = 0; i < history.length; i++) {
                for (var j = 0; j < history[i].numbers.length; j++) {
                    if (history[i].numbers[j] === num) {
                        positions.push(i);
                        break;
                    }
                }
            }

            if (positions.length < 2) {
                weights[num] = 0.5; // Sem dados suficientes
                continue;
            }

            // Calcular gap médio entre aparições
            var totalGap = 0;
            for (var g = 1; g < positions.length; g++) {
                totalGap += positions[g] - positions[g-1];
            }
            var avgGap = totalGap / (positions.length - 1);

            // Quantos sorteios desde a última aparição?
            var sinceLast = positions[0]; // posição 0 = mais recente

            // Se está perto ou passou do ciclo médio, alto peso
            if (avgGap > 0) {
                var cycleRatio = sinceLast / avgGap;
                if (cycleRatio >= 0.8 && cycleRatio <= 1.5) {
                    weights[num] = 1.0; // No ciclo! Alta probabilidade
                } else if (cycleRatio > 1.5) {
                    weights[num] = 0.8; // Atrasado além do ciclo
                } else {
                    weights[num] = cycleRatio * 0.5; // Ainda cedo
                }
            }
        }

        return weights;
    }

    // ═══════════════════════════════════
    // COBERTURA GARANTIDA
    // Top 30% dos números com maior score combinado são obrigatórios
    // ═══════════════════════════════════
    static _getGuaranteedNumbers(thermal, cycles, count, startNum, endNum) {
        // Score combinado: térmica + ciclos
        var combined = [];
        for (var n = startNum; n <= endNum; n++) {
            combined.push({
                number: n,
                score: (thermal[n] || 0) * 0.6 + (cycles[n] || 0) * 0.4
            });
        }
        combined.sort(function(a, b) { return b.score - a.score; });

        // Top 30% do total pedido são garantidos
        var guaranteedCount = Math.max(2, Math.ceil(count * 0.30));
        var guaranteed = [];
        for (var i = 0; i < guaranteedCount && i < combined.length; i++) {
            guaranteed.push(combined[i].number);
        }

        return guaranteed;
    }

    // ═══════════════════════════════════
    // CAMPO DE PROBABILIDADE
    // Combina térmica (50%) + atraso (25%) + ciclos (25%)
    // ═══════════════════════════════════
    static _buildProbabilityField(startNum, endNum, thermal, latency, cycles) {
        var field = {};
        var W_THERMAL = 0.50;
        var W_LATENCY = 0.25;
        var W_CYCLES  = 0.25;

        for (var n = startNum; n <= endNum; n++) {
            var t = thermal[n] || 0;
            var l = latency[n] || 0;
            var c = cycles[n] || 0;
            field[n] = Math.max(0.01, (t * W_THERMAL) + (l * W_LATENCY) + (c * W_CYCLES));
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
    static _applyQualityFilter(candidates, count, startNum, endNum, history, gameKey, guaranteed) {
        var totalRange = endNum - startNum + 1;
        if (count > totalRange * 0.6) {
            // Sugestão grande: garantidos + top por score
            var used = {};
            var result = [];
            // Inserir garantidos primeiro
            if (guaranteed) {
                for (var g = 0; g < guaranteed.length && result.length < count; g++) {
                    result.push(guaranteed[g]);
                    used[guaranteed[g]] = true;
                }
            }
            // Completar com top candidatos
            for (var c = 0; c < candidates.length && result.length < count; c++) {
                if (!used[candidates[c].number]) {
                    result.push(candidates[c].number);
                    used[candidates[c].number] = true;
                }
            }
            return result;
        }

        var realPatterns = this._analyzeRealPatterns(history, startNum, endNum);

        var bestSet = null;
        var bestScore = -1;

        // Tentar 500 combinações: cada uma COMEÇA com os garantidos
        for (var attempt = 0; attempt < 500; attempt++) {
            // Começar com garantidos
            var selection = [];
            var usedInAttempt = {};
            if (guaranteed) {
                for (var gi = 0; gi < guaranteed.length && selection.length < count; gi++) {
                    selection.push(guaranteed[gi]);
                    usedInAttempt[guaranteed[gi]] = true;
                }
            }

            // Completar com seleção ponderada dos candidatos restantes
            var remaining = [];
            for (var r = 0; r < candidates.length; r++) {
                if (!usedInAttempt[candidates[r].number]) remaining.push(candidates[r]);
            }
            var extra = this._pickWeightedSubset(remaining, count - selection.length);
            for (var e = 0; e < extra.length; e++) selection.push(extra[e]);

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

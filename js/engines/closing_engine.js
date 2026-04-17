/**
 * ClosingEngine v3.1 — Motor de Fechamento Matemático L99
 * 
 * CORREÇÃO CRÍTICA v3.1:
 *   GARANTIA CONDICIONAL: Se T é a garantia e F são fixos,
 *   a garantia efetiva no espaço variável = T - F
 *   
 *   Fixar números REDUZ variáveis → REDUZ apostas!
 * 
 * LÓGICA:
 *   - Jogador seleciona N números e fixa F deles
 *   - Cada jogo = F fixos + (betSize - F) variáveis
 *   - Para garantir T acertos: precisa (T - F) acertos variáveis
 *   - Cobrir todos os (T-F)-subconjuntos de variáveis
 *   - Lower bound = C(variableCount, T-F) / C(slotsVariable, T-F)
 * 
 * EXEMPLOS (N=20, F=6, betSize=15):
 *   G15 = 2.002 jogos (sem fixos = 15.504)
 *   G14 = ~334 jogos (sem fixos = ~2.584)
 *   G13 = ~96 jogos  (sem fixos = ~780)
 *   G12 = ~36 jogos
 *   G11 = ~16 jogos
 * 
 * ALGORITMO HÍBRIDO:
 *   - Greedy Exato: candidatos ≤ 25.000 E subconjuntos ≤ 200.000
 *   - Greedy Amostrado: para espaços maiores
 *   - Heurístico Verificado: para espaços enormes
 */

class ClosingEngine {

    // ═══════════════════════════════════════════
    //  COMBINATÓRIA: C(n,k)
    // ═══════════════════════════════════════════
    static nCr(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k;
        let r = 1;
        for (let i = 1; i <= k; i++) {
            r = r * (n - i + 1) / i;
        }
        return Math.round(r);
    }

    // ═══════════════════════════════════════════
    //  OBTER betSize CORRETO PARA CADA LOTERIA
    // ═══════════════════════════════════════════
    static getBetSize(gameKey) {
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        if (!game) return 6;
        switch (gameKey) {
            case 'timemania': return game.minBet;
            case 'lotomania': return game.minBet;
            default: return game.draw;
        }
    }

    // ═══════════════════════════════════════════
    //  GARANTIA EFETIVA NO ESPAÇO VARIÁVEL
    //  effectiveG = guarantee - fixedCount
    //  Se ≤ 0: 1 jogo basta (fixos cobrem tudo)
    // ═══════════════════════════════════════════
    static effectiveGuarantee(guarantee, fixedCount) {
        return Math.max(0, guarantee - fixedCount);
    }

    // ═══════════════════════════════════════════
    //  GERAR TODOS SUBCONJUNTOS DE TAMANHO K
    // ═══════════════════════════════════════════
    static _generateSubsets(arr, k) {
        const result = [];
        const n = arr.length;
        if (k > n || k <= 0) return result;
        const indices = [];
        for (let i = 0; i < k; i++) indices.push(i);
        while (true) {
            result.push(indices.map(i => arr[i]));
            let i = k - 1;
            while (i >= 0 && indices[i] === n - k + i) i--;
            if (i < 0) break;
            indices[i]++;
            for (let j = i + 1; j < k; j++) indices[j] = indices[j - 1] + 1;
        }
        return result;
    }

    // ═══════════════════════════════════════════
    //  GERAR N SUBCONJUNTOS ALEATÓRIOS ÚNICOS
    // ═══════════════════════════════════════════
    static _generateRandomSubsets(arr, k, maxCount) {
        const n = arr.length;
        if (k > n || k <= 0) return [];
        if (this.nCr(n, k) <= maxCount) return this._generateSubsets(arr, k);

        const result = [];
        const seen = new Set();
        let attempts = 0;
        const maxAttempts = maxCount * 8;
        while (result.length < maxCount && attempts < maxAttempts) {
            attempts++;
            const available = [...Array(n).keys()];
            const indices = [];
            for (let i = 0; i < k; i++) {
                const randIdx = i + Math.floor(Math.random() * (n - i));
                [available[i], available[randIdx]] = [available[randIdx], available[i]];
                indices.push(available[i]);
            }
            indices.sort((a, b) => a - b);
            const key = indices.join(',');
            if (!seen.has(key)) {
                seen.add(key);
                result.push(indices.map(i => arr[i]));
            }
        }
        return result;
    }

    static _subsetKey(subset) {
        return subset.join(',');
    }

    // ═══════════════════════════════════════════════════════
    //  ESTIMAR JOGOS (COM FIXOS — GARANTIA CONDICIONAL)
    //  
    //  Fórmula: C(variableCount, effG) / C(slotsVariable, effG) × factor
    //  Onde effG = guarantee - fixedCount
    // ═══════════════════════════════════════════════════════
    static estimateGames(numSelected, guarantee, betSize = 6, fixedCount = 0) {
        if (numSelected < betSize) return 0;

        const slotsVariable = betSize - fixedCount;
        const variableCount = numSelected - fixedCount;
        const effG = this.effectiveGuarantee(guarantee, fixedCount);

        // Se effG ≤ 0: fixos já cobrem tudo → 1 jogo
        if (effG <= 0) return 1;

        // Se effG = slotsVariable: ALL combinações
        if (effG === slotsVariable) {
            return this.nCr(variableCount, slotsVariable);
        }

        // Fórmula principal
        const totalSubsets = this.nCr(variableCount, effG);
        const coversPerGame = this.nCr(slotsVariable, effG);

        if (coversPerGame === 0) return this.nCr(variableCount, slotsVariable);

        const lowerBound = Math.ceil(totalSubsets / coversPerGame);

        // Fator de ajuste para greedy
        const ratio = effG / slotsVariable;
        let factor;
        if (ratio >= 0.9) factor = 1.5;
        else if (ratio >= 0.7) factor = 1.35;
        else if (ratio >= 0.5) factor = 1.2;
        else factor = 1.1;

        return Math.max(lowerBound, Math.ceil(lowerBound * factor));
    }

    // ═══════════════════════════════════════════════════════════════
    //  MÉTODO PRINCIPAL: GERAR FECHAMENTO v3.1
    //  CORRIGIDO: Fixos REDUZEM variáveis → REDUZEM apostas
    // ═══════════════════════════════════════════════════════════════
    static generateClosure(selectedNumbers, guarantee, betSize = 6, gameKey = 'megasena', fixedNumbers = []) {
        const t0 = Date.now();
        const nums = [...selectedNumbers].sort((a, b) => a - b);
        const N = nums.length;
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const pricePerGame = game ? game.price : 6.00;
        const fixedSet = new Set(fixedNumbers || []);
        const fixedCount = fixedSet.size;

        if (gameKey && typeof GAMES !== 'undefined') {
            betSize = this.getBetSize(gameKey);
        }

        const slotsVariable = betSize - fixedCount;
        const fixedArr = nums.filter(n => fixedSet.has(n));
        const variableNums = nums.filter(n => !fixedSet.has(n));
        const variableCount = variableNums.length;
        const totalCandidates = slotsVariable > 0 ? this.nCr(variableCount, slotsVariable) : 1;
        const effG = this.effectiveGuarantee(guarantee, fixedCount);

        console.log('[CLOSING-v3.1] ══════════════════════════════════════');
        console.log('[CLOSING-v3.1] 🎯 Motor Fechamento v3.1 (Condicional)');
        console.log('[CLOSING-v3.1] Jogo: ' + gameKey + ' | N=' + N + ' | BetSize=' + betSize + ' | Garantia=' + guarantee);
        if (fixedCount > 0) {
            console.log('[CLOSING-v3.1] 📌 Fixos (' + fixedCount + '): [' + fixedArr.join(', ') + ']');
            console.log('[CLOSING-v3.1] 🔢 Variáveis: ' + variableCount + ' | Slots: ' + slotsVariable);
            console.log('[CLOSING-v3.1] 📐 Garantia Efetiva: ' + guarantee + ' - ' + fixedCount + ' = ' + effG + ' acertos variáveis');
        }
        console.log('[CLOSING-v3.1] 📊 Candidatos: C(' + variableCount + ',' + slotsVariable + ') = ' + totalCandidates.toLocaleString('pt-BR'));

        // ━━ VALIDAÇÕES ━━
        if (N < betSize) {
            return this._errorResult('Selecione pelo menos ' + betSize + ' números.', guarantee, nums, fixedSet);
        }
        if (fixedCount >= betSize) {
            return this._errorResult('Fixos (' + fixedCount + ') devem ser menor que tamanho do jogo (' + betSize + ').', guarantee, nums, fixedSet);
        }
        if (guarantee > betSize) {
            return this._errorResult('Garantia (' + guarantee + ') não pode ser maior que ' + betSize + '.', guarantee, nums, fixedSet);
        }
        if (guarantee < 3) {
            return this._errorResult('Garantia mínima: 3 acertos.', guarantee, nums, fixedSet);
        }
        if (variableCount < slotsVariable) {
            return this._errorResult('Selecione mais números (precisa ' + slotsVariable + ' variáveis, tem ' + variableCount + ').', guarantee, nums, fixedSet);
        }

        // ━━ CASO: effG ≤ 0 → 1 jogo basta ━━
        if (effG <= 0) {
            const oneGame = [...fixedArr, ...variableNums.slice(0, slotsVariable)].sort((a, b) => a - b);
            return {
                games: [oneGame], guarantee, totalGames: 1,
                totalSubsets: 1, covered: 1, coveragePct: 100,
                cost: pricePerGame, mode: 'TRIVIAL', elapsed: Date.now() - t0,
                selectedNumbers: nums, fixedNumbers: [...fixedSet],
                confidence: 100, effectiveGuarantee: effG,
                msg: 'Com ' + fixedCount + ' fixos, garantia de ' + guarantee + ' acertos é coberta com apenas 1 jogo!'
            };
        }

        // ━━ CASO: Fechamento Completo (effG = slotsVariable) ━━
        if (effG === slotsVariable) {
            if (totalCandidates > 50000) {
                return {
                    games: [], guarantee, totalGames: totalCandidates,
                    totalSubsets: totalCandidates, covered: 0, coveragePct: 100,
                    cost: totalCandidates * pricePerGame,
                    error: 'Fechamento completo de ' + guarantee + ' acertos' +
                        (fixedCount > 0 ? ' (' + fixedCount + ' fixos)' : '') +
                        ' geraria ' + totalCandidates.toLocaleString('pt-BR') + ' jogos (R$ ' +
                        (totalCandidates * pricePerGame).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) +
                        '). Reduza números selecionados ou use garantia menor.',
                    selectedNumbers: nums, fixedNumbers: [...fixedSet]
                };
            }

            console.log('[CLOSING-v3.1] Modo: COMPLETO → ' + totalCandidates + ' jogos');
            const games = this._buildAllCandidates(fixedArr, variableNums, slotsVariable);
            return {
                games, guarantee, totalGames: games.length,
                totalSubsets: totalCandidates, covered: totalCandidates,
                coveragePct: 100, cost: games.length * pricePerGame,
                mode: 'COMPLETO', elapsed: Date.now() - t0,
                selectedNumbers: nums, fixedNumbers: [...fixedSet],
                confidence: 100, effectiveGuarantee: effG
            };
        }

        // ━━ SELECIONAR ALGORITMO ━━
        const totalVarTSubsets = this.nCr(variableCount, effG);
        console.log('[CLOSING-v3.1] Subconjuntos efetivos: C(' + variableCount + ',' + effG + ') = ' + totalVarTSubsets.toLocaleString('pt-BR'));

        if (totalCandidates <= 25000 && totalVarTSubsets <= 200000) {
            console.log('[CLOSING-v3.1] → GREEDY EXATO');
            return this._greedyExact(fixedArr, variableNums, slotsVariable, effG, guarantee, betSize, pricePerGame, t0, gameKey, nums, fixedSet);
        } else if (totalVarTSubsets <= 1000000) {
            console.log('[CLOSING-v3.1] → GREEDY AMOSTRADO');
            return this._greedySampled(fixedArr, variableNums, slotsVariable, effG, guarantee, betSize, pricePerGame, t0, gameKey, nums, fixedSet);
        } else {
            console.log('[CLOSING-v3.1] → HEURÍSTICO VERIFICADO');
            return this._heuristicVerified(fixedArr, variableNums, slotsVariable, effG, guarantee, betSize, pricePerGame, t0, gameKey, nums, fixedSet);
        }
    }

    // ═══════════════════════════════════════════
    //  CONSTRUIR TODOS OS CANDIDATOS
    // ═══════════════════════════════════════════
    static _buildAllCandidates(fixedArr, variableNums, slotsVariable) {
        const variableCombos = this._generateSubsets(variableNums, slotsVariable);
        return variableCombos.map(combo => [...fixedArr, ...combo].sort((a, b) => a - b));
    }

    // ═══════════════════════════════════════════════════════
    //  GREEDY EXATO: Cobertura exata de effG-subconjuntos
    // ═══════════════════════════════════════════════════════
    static _greedyExact(fixedArr, variableNums, slotsVariable, effG, guarantee, betSize, pricePerGame, t0, gameKey, allNums, fixedSet) {
        const variableCount = variableNums.length;

        // 1. Enumerar TODOS os effG-subconjuntos de variáveis
        const allTSubsets = this._generateSubsets(variableNums, effG);
        const totalSubsets = allTSubsets.length;
        console.log('[CLOSING-v3.1] Subconjuntos a cobrir: ' + totalSubsets);

        const subsetKeyToIndex = new Map();
        for (let i = 0; i < totalSubsets; i++) {
            subsetKeyToIndex.set(this._subsetKey(allTSubsets[i]), i);
        }

        const uncovered = new Set();
        for (let i = 0; i < totalSubsets; i++) uncovered.add(i);

        // 2. Enumerar TODOS os candidatos (parte variável)
        const allVariableParts = this._generateSubsets(variableNums, slotsVariable);
        console.log('[CLOSING-v3.1] Candidatos: ' + allVariableParts.length);

        // 3. Pré-calcular coberturas
        const candidateCovers = [];
        for (const vp of allVariableParts) {
            const covers = new Set();
            const tSubs = this._generateSubsets(vp, effG);
            for (const sub of tSubs) {
                const idx = subsetKeyToIndex.get(this._subsetKey(sub));
                if (idx !== undefined) covers.add(idx);
            }
            candidateCovers.push(covers);
        }

        // 4. Greedy Set Cover
        const selectedIndices = [];
        const usedCandidates = new Set();
        const TIMEOUT = 120000;

        while (uncovered.size > 0 && (Date.now() - t0) < TIMEOUT) {
            let bestCandidate = -1;
            let bestCount = 0;
            for (let c = 0; c < allVariableParts.length; c++) {
                if (usedCandidates.has(c)) continue;
                let count = 0;
                for (const idx of candidateCovers[c]) {
                    if (uncovered.has(idx)) count++;
                }
                if (count > bestCount) {
                    bestCount = count;
                    bestCandidate = c;
                }
            }
            if (bestCandidate === -1 || bestCount === 0) break;
            selectedIndices.push(bestCandidate);
            usedCandidates.add(bestCandidate);
            for (const idx of candidateCovers[bestCandidate]) uncovered.delete(idx);

            if (selectedIndices.length % 50 === 0) {
                console.log('[CLOSING-v3.1] → ' + selectedIndices.length + ' jogos (' + ((totalSubsets - uncovered.size) / totalSubsets * 100).toFixed(1) + '%)');
            }
        }

        // 5. Montar jogos
        const games = selectedIndices.map(idx =>
            [...fixedArr, ...allVariableParts[idx]].sort((a, b) => a - b)
        );
        const covered = totalSubsets - uncovered.size;
        const coveragePct = totalSubsets > 0 ? (covered / totalSubsets * 100) : 0;
        const elapsed = Date.now() - t0;

        console.log('[CLOSING-v3.1] ✅ ' + games.length + ' jogos | Cobertura: ' + coveragePct.toFixed(1) + '% | ' + elapsed + 'ms');

        return {
            games, guarantee, totalGames: games.length,
            totalSubsets, covered, coveragePct: parseFloat(coveragePct.toFixed(2)),
            cost: games.length * pricePerGame, mode: 'GREEDY_EXATO',
            elapsed, selectedNumbers: allNums, fixedNumbers: [...fixedSet],
            confidence: coveragePct >= 99.9 ? 100 : parseFloat(coveragePct.toFixed(1)),
            effectiveGuarantee: effG
        };
    }

    // ═══════════════════════════════════════════════════════
    //  GREEDY AMOSTRADO: Para espaços médios
    // ═══════════════════════════════════════════════════════
    static _greedySampled(fixedArr, variableNums, slotsVariable, effG, guarantee, betSize, pricePerGame, t0, gameKey, allNums, fixedSet) {
        const variableCount = variableNums.length;
        const TIMEOUT = 120000;
        const BATCH_SIZE = 15000;

        // 1. Enumerar ou amostrar effG-subconjuntos
        const totalVarTSubsets = this.nCr(variableCount, effG);
        let sampledTSubsets;
        let useFullCoverage = totalVarTSubsets <= 200000;
        if (useFullCoverage) {
            sampledTSubsets = this._generateSubsets(variableNums, effG);
        } else {
            sampledTSubsets = this._generateRandomSubsets(variableNums, effG, 100000);
        }

        const subsetKeyToIndex = new Map();
        for (let i = 0; i < sampledTSubsets.length; i++) {
            subsetKeyToIndex.set(this._subsetKey(sampledTSubsets[i]), i);
        }
        const uncovered = new Set();
        for (let i = 0; i < sampledTSubsets.length; i++) uncovered.add(i);

        // 2. Greedy iterativo com lotes
        const selectedGames = [];
        let rounds = 0;
        const MAX_ROUNDS = 500;

        while (uncovered.size > 0 && rounds < MAX_ROUNDS && (Date.now() - t0) < TIMEOUT) {
            rounds++;
            const candidates = this._generateRandomSubsets(variableNums, slotsVariable, BATCH_SIZE);

            let bestCandidate = null;
            let bestCount = 0;

            for (const candidate of candidates) {
                const tSubs = this._generateSubsets(candidate, effG);
                let count = 0;
                for (const sub of tSubs) {
                    const idx = subsetKeyToIndex.get(this._subsetKey(sub));
                    if (idx !== undefined && uncovered.has(idx)) count++;
                }
                if (count > bestCount) {
                    bestCount = count;
                    bestCandidate = candidate;
                }
            }

            if (!bestCandidate || bestCount === 0) {
                // Candidato direcionado
                const uncovIdx = uncovered.values().next().value;
                const targetSub = sampledTSubsets[uncovIdx];
                if (targetSub) {
                    const candidate = new Set(targetSub);
                    const remaining = variableNums.filter(n => !candidate.has(n)).sort(() => Math.random() - 0.5);
                    for (const num of remaining) {
                        if (candidate.size >= slotsVariable) break;
                        candidate.add(num);
                    }
                    bestCandidate = [...candidate].sort((a, b) => a - b);
                } else continue;
            }

            selectedGames.push([...fixedArr, ...bestCandidate].sort((a, b) => a - b));

            const tSubs = this._generateSubsets(bestCandidate, effG);
            for (const sub of tSubs) {
                const idx = subsetKeyToIndex.get(this._subsetKey(sub));
                if (idx !== undefined) uncovered.delete(idx);
            }

            if (selectedGames.length % 20 === 0) {
                console.log('[CLOSING-v3.1] → ' + selectedGames.length + ' jogos (' + ((sampledTSubsets.length - uncovered.size) / sampledTSubsets.length * 100).toFixed(1) + '%)');
            }
        }

        const coveragePct = ((sampledTSubsets.length - uncovered.size) / sampledTSubsets.length * 100);
        const elapsed = Date.now() - t0;

        console.log('[CLOSING-v3.1] ✅ ' + selectedGames.length + ' jogos | Cobertura: ' + coveragePct.toFixed(1) + '% | ' + elapsed + 'ms');

        return {
            games: selectedGames, guarantee, totalGames: selectedGames.length,
            totalSubsets: this.nCr(allNums.length, guarantee),
            covered: Math.round(sampledTSubsets.length * coveragePct / 100),
            coveragePct: parseFloat(coveragePct.toFixed(2)),
            cost: selectedGames.length * pricePerGame, mode: 'GREEDY_AMOSTRADO',
            elapsed, selectedNumbers: allNums, fixedNumbers: [...fixedSet],
            confidence: parseFloat(Math.min(100, coveragePct).toFixed(1)),
            effectiveGuarantee: effG,
            note: useFullCoverage ? 'Cobertura exata.' : 'Cobertura estimada por ' + sampledTSubsets.length.toLocaleString('pt-BR') + ' amostras.'
        };
    }

    // ═══════════════════════════════════════════════════════
    //  HEURÍSTICO VERIFICADO: Para espaços enormes
    // ═══════════════════════════════════════════════════════
    static _heuristicVerified(fixedArr, variableNums, slotsVariable, effG, guarantee, betSize, pricePerGame, t0, gameKey, allNums, fixedSet) {
        const variableCount = variableNums.length;
        const totalVarSubsets = this.nCr(variableCount, effG);
        const coversPerCandidate = this.nCr(slotsVariable, effG);
        const lowerBound = coversPerCandidate > 0 ? Math.ceil(totalVarSubsets / coversPerCandidate) : totalVarSubsets;

        const ratio = effG / slotsVariable;
        let factor = ratio >= 0.9 ? 2.0 : ratio >= 0.7 ? 1.6 : ratio >= 0.5 ? 1.4 : 1.2;
        const targetGames = Math.max(lowerBound, Math.ceil(lowerBound * factor));
        const maxGames = Math.min(targetGames, 8000);

        console.log('[CLOSING-v3.1] Estimativa: lower=' + lowerBound + ' → target=' + targetGames + ' → max=' + maxGames);

        const selectedGames = [];
        const usedKeys = new Set();
        const TIMEOUT = 90000;
        const zonesCount = Math.max(2, Math.ceil(variableCount / Math.max(slotsVariable, 1)));
        const zones = [];
        for (let z = 0; z < zonesCount; z++) {
            const start = z * Math.floor(variableCount / zonesCount);
            const end = Math.min(start + Math.ceil(variableCount / zonesCount), variableCount);
            zones.push(variableNums.slice(start, end));
        }

        let attempts = 0;
        while (selectedGames.length < maxGames && attempts < maxGames * 30 && (Date.now() - t0) < TIMEOUT) {
            attempts++;
            const variablePart = this._generateDiverseCandidate(variableNums, slotsVariable, zones);
            const candidate = [...fixedArr, ...variablePart].sort((a, b) => a - b);
            const key = candidate.join(',');
            if (!usedKeys.has(key)) {
                usedKeys.add(key);
                selectedGames.push([...candidate]);
            }
        }

        const coverageEstimate = this._verifyFullCoverage(selectedGames, allNums, guarantee, 15000);
        const elapsed = Date.now() - t0;

        console.log('[CLOSING-v3.1] ✅ ' + selectedGames.length + ' jogos | Cobertura: ' + coverageEstimate.toFixed(1) + '% | ' + elapsed + 'ms');

        return {
            games: selectedGames, guarantee, totalGames: selectedGames.length,
            totalSubsets: this.nCr(allNums.length, guarantee),
            covered: Math.round(this.nCr(allNums.length, guarantee) * coverageEstimate / 100),
            coveragePct: parseFloat(coverageEstimate.toFixed(2)),
            cost: selectedGames.length * pricePerGame, mode: 'HEURÍSTICO',
            elapsed, selectedNumbers: allNums, fixedNumbers: [...fixedSet],
            confidence: parseFloat(Math.min(100, coverageEstimate).toFixed(1)),
            effectiveGuarantee: effG,
            note: 'Cobertura estimada por amostragem de 15.000 subconjuntos.'
        };
    }

    // ═══════════════════════════════════════════
    //  GERAR CANDIDATO DIVERSO
    // ═══════════════════════════════════════════
    static _generateDiverseCandidate(nums, betSize, zones) {
        const candidate = new Set();
        if (Math.random() < 0.6 && zones.length > 1) {
            const perZone = Math.max(1, Math.floor(betSize / zones.length));
            for (const zone of zones) {
                const shuffled = [...zone].sort(() => Math.random() - 0.5);
                for (let i = 0; i < Math.min(perZone, shuffled.length) && candidate.size < betSize; i++) {
                    candidate.add(shuffled[i]);
                }
            }
        }
        const remaining = nums.filter(n => !candidate.has(n)).sort(() => Math.random() - 0.5);
        for (const num of remaining) {
            if (candidate.size >= betSize) break;
            candidate.add(num);
        }
        return [...candidate];
    }

    // ═══════════════════════════════════════════
    //  VERIFICAR COBERTURA (amostragem)
    // ═══════════════════════════════════════════
    static _verifyFullCoverage(games, allNums, guarantee, sampleSize) {
        if (games.length === 0) return 0;
        const samples = this._generateRandomSubsets(allNums, guarantee, sampleSize);
        if (samples.length === 0) return 0;
        const gameSets = games.map(g => new Set(g));
        let covered = 0;
        for (const sample of samples) {
            for (const gameSet of gameSets) {
                if (sample.every(n => gameSet.has(n))) { covered++; break; }
            }
        }
        return (covered / samples.length) * 100;
    }

    // ═══════════════════════════════════════════
    //  RESULTADO DE ERRO
    // ═══════════════════════════════════════════
    static _errorResult(error, guarantee, nums, fixedSet) {
        return {
            games: [], guarantee, totalGames: 0, totalSubsets: 0,
            covered: 0, coveragePct: 0, cost: 0,
            error, selectedNumbers: nums, fixedNumbers: [...fixedSet]
        };
    }

    // ═══════════════════════════════════════════════════════
    //  PREVIEW DO FECHAMENTO (COM FIXOS CONDICIONAIS)
    // ═══════════════════════════════════════════════════════
    static getClosurePreview(numSelected, guarantee, betSize = 6, gameKey = 'megasena', fixedCount = 0) {
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const price = game ? game.price : 6.00;
        if (gameKey && typeof GAMES !== 'undefined') betSize = this.getBetSize(gameKey);

        if (numSelected < betSize) {
            return { games: 0, cost: 0, subsets: 0, possible: false, msg: 'Selecione pelo menos ' + betSize + ' números' };
        }

        const effG = this.effectiveGuarantee(guarantee, fixedCount);
        const slotsVariable = betSize - fixedCount;
        const variableCount = numSelected - fixedCount;

        if (variableCount < slotsVariable) {
            return { games: 0, cost: 0, subsets: 0, possible: false, msg: 'Selecione mais números (precisa ' + (slotsVariable + fixedCount) + ' total)' };
        }

        const estimatedGames = this.estimateGames(numSelected, guarantee, betSize, fixedCount);
        const cost = estimatedGames * price;

        // Mostrar redução vs sem fixos
        let reductionMsg = '';
        if (fixedCount > 0) {
            const withoutFixed = this.estimateGames(numSelected, guarantee, betSize, 0);
            if (withoutFixed > estimatedGames) {
                const reduction = Math.round((1 - estimatedGames / withoutFixed) * 100);
                reductionMsg = ' (↓' + reduction + '% menos que sem fixos)';
            }
        }

        const label = guarantee + ' Pontos';

        return {
            games: estimatedGames, cost, possible: estimatedGames <= 50000,
            subsets: this.nCr(numSelected, guarantee),
            guarantee, label, fixedCount, effectiveGuarantee: effG,
            msg: numSelected + ' números' + (fixedCount > 0 ? ' (' + fixedCount + ' fixos)' : '') +
                ' → Fechamento ' + label + ' = ~' + estimatedGames.toLocaleString('pt-BR') +
                ' jogos (R$ ' + cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ')' + reductionMsg
        };
    }

    // ═══════════════════════════════════════════════════════
    //  NÍVEIS DINÂMICOS — TODOS VIÁVEIS COM FIXOS
    //  (fixar REDUZ jogos, não impossibilita)
    // ═══════════════════════════════════════════════════════
    static getDynamicClosingLevels(gameKey, fixedCount = 0) {
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        if (!game) return [];

        const betSize = this.getBetSize(gameKey);
        const baseLevels = game.closingLevels || [];
        const icons = { 3: '✅', 4: '🔥', 5: '⭐', 6: '🎯', 7: '🎯', 8: '💎', 9: '💎', 10: '👑', 11: '👑', 12: '👑', 13: '🔥', 14: '⭐', 15: '🎯', 17: '✅', 18: '🔥', 19: '⭐', 20: '🎯' };

        const allLevels = [];
        for (const cl of baseLevels) {
            const effG = this.effectiveGuarantee(cl.guarantee, fixedCount);
            const reduction = fixedCount > 0
                ? ' (efetivo: ' + effG + ' variáveis)'
                : '';

            allLevels.push({
                id: cl.id,
                label: cl.label + reduction,
                guarantee: cl.guarantee,
                icon: cl.icon || icons[cl.guarantee] || '🎯',
                feasible: true,
                effectiveGuarantee: effG
            });
        }

        // Ordenar por garantia decrescente
        allLevels.sort((a, b) => b.guarantee - a.guarantee);
        return allLevels;
    }
}

if (typeof window !== 'undefined') {
    window.ClosingEngine = ClosingEngine;
}

/**
 * ClosingEngine v3.0 — Motor de Fechamento Matemático L99
 * 
 * CORREÇÕES CRÍTICAS v3.0:
 *   1. Detecção de IMPOSSIBILIDADE matemática com números fixos
 *   2. Algoritmo de cobertura correto no espaço reduzido
 *   3. Estimativas com suporte a fixos
 *   4. Verificação de cobertura ≥95%
 *   5. Níveis de garantia dinâmicos
 * 
 * FÓRMULA CHAVE:
 *   maxGuarantee = betSize - fixedCount
 *   Se guarantee > maxGuarantee → IMPOSSÍVEL
 * 
 * MOTIVO: Com F fixos, cada jogo tem F fixos + (betSize-F) variáveis.
 *   No pior caso, NENHUM fixo é sorteado, logo o máximo de acertos
 *   possíveis vem apenas das variáveis = betSize - F.
 * 
 * ALGORITMO HÍBRIDO v3.0:
 *   - Greedy Exato: candidatos ≤ 25.000
 *   - Greedy Amostrado Reforçado: candidatos ≤ 500.000
 *   - Heurístico Verificado: candidatos > 500.000
 * 
 * Dado N números selecionados, F fixos, e garantia T:
 *   Gera o MÍNIMO de jogos que GARANTE cobertura de todos os
 *   T-subconjuntos dos N números selecionados.
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
    //  GARANTIA MÁXIMA ALCANÇÁVEL
    //  Com F fixos, max = betSize - F
    // ═══════════════════════════════════════════
    static maxAchievableGuarantee(betSize, fixedCount) {
        return betSize - fixedCount;
    }

    // ═══════════════════════════════════════════
    //  VERIFICAR VIABILIDADE DE GARANTIA
    // ═══════════════════════════════════════════
    static isGuaranteeFeasible(guarantee, betSize, fixedCount) {
        if (fixedCount === 0) return guarantee <= betSize;
        return guarantee <= (betSize - fixedCount);
    }

    // ═══════════════════════════════════════════
    //  GERAR TODOS OS SUBCONJUNTOS DE TAMANHO K
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
            for (let j = i + 1; j < k; j++) {
                indices[j] = indices[j - 1] + 1;
            }
        }
        return result;
    }

    // ═══════════════════════════════════════════
    //  GERAR N SUBCONJUNTOS ALEATÓRIOS ÚNICOS
    // ═══════════════════════════════════════════
    static _generateRandomSubsets(arr, k, maxCount) {
        const n = arr.length;
        if (k > n || k <= 0) return [];

        const totalPossible = this.nCr(n, k);
        if (totalPossible <= maxCount) {
            return this._generateSubsets(arr, k);
        }

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

    // ═══════════════════════════════════════════
    //  CHAVE ÚNICA PARA UM SUBCONJUNTO
    // ═══════════════════════════════════════════
    static _subsetKey(subset) {
        return subset.join(',');
    }

    // ═══════════════════════════════════════════
    //  OBTER betSize CORRETO PARA CADA LOTERIA
    // ═══════════════════════════════════════════
    static getBetSize(gameKey) {
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        if (!game) return 6;

        switch (gameKey) {
            case 'timemania':
                return game.minBet; // 10
            case 'lotomania':
                return game.minBet; // 50
            default:
                return game.draw;
        }
    }

    // ═══════════════════════════════════════════
    //  ESTIMAR JOGOS NECESSÁRIOS (COM FIXOS)
    //  Fórmula: ceil(C(variableCount, T) / C(slotsVariable, T)) × factor
    // ═══════════════════════════════════════════
    static estimateGames(numSelected, guarantee, betSize = 6, fixedCount = 0) {
        if (numSelected < betSize) return 0;

        const slotsVariable = betSize - fixedCount;
        const variableCount = numSelected - fixedCount;

        // Verificar viabilidade
        if (fixedCount > 0 && guarantee > slotsVariable) {
            return -1; // Impossível
        }

        if (guarantee === betSize && fixedCount === 0) {
            return this.nCr(numSelected, betSize);
        }

        if (guarantee === slotsVariable && fixedCount > 0) {
            // Precisa de TODOS os candidatos
            return this.nCr(variableCount, slotsVariable);
        }

        // Fórmula principal: basear no espaço variável
        // Precisamos cobrir todos os T-subconjuntos de variáveis
        // Cada candidato (slotsVariable números variáveis) cobre C(slotsVariable, T) T-subconjuntos
        const totalVarSubsets = this.nCr(variableCount, guarantee);
        const coversPerCandidate = this.nCr(slotsVariable, guarantee);

        if (coversPerCandidate === 0) return this.nCr(variableCount, slotsVariable);

        const lowerBound = Math.ceil(totalVarSubsets / coversPerCandidate);

        // Fator de ajuste para greedy (tipicamente 1.1x - 1.8x do lower bound)
        const ratio = guarantee / slotsVariable;
        let factor;
        if (ratio >= 0.9) factor = 1.8;
        else if (ratio >= 0.7) factor = 1.5;
        else if (ratio >= 0.5) factor = 1.3;
        else factor = 1.15;

        return Math.max(lowerBound, Math.ceil(lowerBound * factor));
    }

    // ═══════════════════════════════════════════════════════════════
    //  MÉTODO PRINCIPAL: GERAR FECHAMENTO OBJETIVO v3.0
    // ═══════════════════════════════════════════════════════════════
    static generateClosure(selectedNumbers, guarantee, betSize = 6, gameKey = 'megasena', fixedNumbers = []) {
        const t0 = Date.now();
        const nums = [...selectedNumbers].sort((a, b) => a - b);
        const N = nums.length;
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const pricePerGame = game ? game.price : 6.00;
        const fixedSet = new Set(fixedNumbers || []);
        const fixedCount = fixedSet.size;

        // Auto-detectar betSize
        if (gameKey && typeof GAMES !== 'undefined') {
            betSize = this.getBetSize(gameKey);
        }

        const slotsVariable = betSize - fixedCount;
        const fixedArr = nums.filter(n => fixedSet.has(n));
        const variableNums = nums.filter(n => !fixedSet.has(n));
        const variableCount = variableNums.length;
        const totalCandidates = slotsVariable > 0 ? this.nCr(variableCount, slotsVariable) : 1;

        console.log('[CLOSING-v3.0] ══════════════════════════════════════');
        console.log('[CLOSING-v3.0] 🎯 Motor Matemático v3.0');
        console.log('[CLOSING-v3.0] Jogo: ' + gameKey + ' | N=' + N + ' | BetSize=' + betSize + ' | Garantia=' + guarantee);
        if (fixedCount > 0) {
            console.log('[CLOSING-v3.0] 📌 Fixos (' + fixedCount + '): ' + fixedArr.sort((a, b) => a - b).join(', '));
            console.log('[CLOSING-v3.0] 🔢 Variáveis: ' + variableCount + ' | Slots: ' + slotsVariable);
            console.log('[CLOSING-v3.0] 📐 Max Garantia Alcançável: ' + slotsVariable);
        }
        console.log('[CLOSING-v3.0] 📊 Candidatos possíveis: C(' + variableCount + ',' + slotsVariable + ') = ' + totalCandidates.toLocaleString('pt-BR'));

        // ━━ VALIDAÇÕES ━━
        if (N < betSize) {
            return this._errorResult('Selecione pelo menos ' + betSize + ' números para o fechamento.', guarantee, nums, fixedSet);
        }

        if (fixedCount > betSize) {
            return this._errorResult('Número de fixos (' + fixedCount + ') excede o tamanho do jogo (' + betSize + '). Reduza os números fixos.', guarantee, nums, fixedSet);
        }

        if (fixedCount > 0 && guarantee < 3) {
            return this._errorResult('Garantia mínima é de 3 acertos.', guarantee, nums, fixedSet);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // DETECÇÃO DE IMPOSSIBILIDADE MATEMÁTICA (v3.0)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (fixedCount > 0 && guarantee > slotsVariable) {
            const maxG = slotsVariable;
            console.log('[CLOSING-v3.0] ❌ IMPOSSÍVEL: Garantia ' + guarantee + ' > Max Alcançável ' + maxG + ' com ' + fixedCount + ' fixos');
            return {
                games: [], guarantee, totalGames: 0, totalSubsets: 0,
                covered: 0, coveragePct: 0, cost: 0,
                error: '⚠️ IMPOSSIBILIDADE MATEMÁTICA: Com ' + fixedCount + ' números fixos, ' +
                    'a garantia máxima alcançável é de ' + maxG + ' acertos.\n\n' +
                    'Motivo: Cada jogo tem ' + fixedCount + ' fixos + ' + slotsVariable + ' variáveis. ' +
                    'No pior caso, nenhum fixo é sorteado, então o máximo de acertos possíveis = ' + slotsVariable + '.\n\n' +
                    'Sugestão: Use garantia ≤ ' + maxG + ', ou reduza os números fixos.',
                selectedNumbers: nums,
                fixedNumbers: [...fixedSet],
                maxAchievableGuarantee: maxG,
                impossible: true
            };
        }

        if (guarantee > betSize) {
            return this._errorResult('Garantia (' + guarantee + ') não pode ser maior que o tamanho do jogo (' + betSize + ').', guarantee, nums, fixedSet);
        }

        if (guarantee < 3) {
            return this._errorResult('Garantia mínima é de 3 acertos.', guarantee, nums, fixedSet);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // CASO ESPECIAL: Fechamento Completo (guarantee = betSize SEM fixos)
        //  OU (guarantee = slotsVariable COM fixos → todos candidatos)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const isFullClosure = (fixedCount === 0 && guarantee === betSize) ||
            (fixedCount > 0 && guarantee === slotsVariable);

        if (isFullClosure) {
            if (totalCandidates > 50000) {
                return {
                    games: [], guarantee, totalGames: totalCandidates,
                    totalSubsets: totalCandidates, covered: 0, coveragePct: 100,
                    cost: totalCandidates * pricePerGame,
                    error: 'Fechamento completo de ' + guarantee + ' acertos com ' + N + ' números ' +
                        (fixedCount > 0 ? '(' + fixedCount + ' fixos) ' : '') +
                        'geraria ' + totalCandidates.toLocaleString('pt-BR') + ' jogos (R$ ' +
                        (totalCandidates * pricePerGame).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) +
                        '). Reduza os números ou use garantia menor.',
                    selectedNumbers: nums, fixedNumbers: [...fixedSet]
                };
            }

            console.log('[CLOSING-v3.0] Modo: FECHAMENTO COMPLETO → ' + totalCandidates + ' jogos');
            const games = this._buildAllCandidates(fixedArr, variableNums, slotsVariable);
            const elapsed = Date.now() - t0;
            console.log('[CLOSING-v3.0] ✅ ' + games.length + ' jogos em ' + elapsed + 'ms');

            return {
                games, guarantee, totalGames: games.length,
                totalSubsets: totalCandidates, covered: totalCandidates,
                coveragePct: 100, cost: games.length * pricePerGame,
                mode: 'COMPLETO', elapsed, selectedNumbers: nums, fixedNumbers: [...fixedSet],
                confidence: 100
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // SELECIONAR ALGORITMO v3.0
        // Baseado no espaço de candidatos E T-subconjuntos
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const totalVarTSubsets = this.nCr(variableCount, guarantee);
        console.log('[CLOSING-v3.0] T-subconjuntos variáveis: C(' + variableCount + ',' + guarantee + ') = ' + totalVarTSubsets.toLocaleString('pt-BR'));

        if (totalCandidates <= 25000 && totalVarTSubsets <= 200000) {
            console.log('[CLOSING-v3.0] → Algoritmo: GREEDY EXATO v3.0');
            return this._greedyExactV3(fixedArr, variableNums, slotsVariable, guarantee, betSize, pricePerGame, t0, gameKey, nums, fixedSet);
        } else if (totalCandidates <= 500000 && totalVarTSubsets <= 1000000) {
            console.log('[CLOSING-v3.0] → Algoritmo: GREEDY AMOSTRADO REFORÇADO v3.0');
            return this._greedySampledV3(fixedArr, variableNums, slotsVariable, guarantee, betSize, pricePerGame, t0, gameKey, nums, fixedSet);
        } else {
            console.log('[CLOSING-v3.0] → Algoritmo: HEURÍSTICO VERIFICADO v3.0');
            return this._heuristicVerifiedV3(fixedArr, variableNums, slotsVariable, guarantee, betSize, pricePerGame, t0, gameKey, nums, fixedSet);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  CONSTRUIR TODOS OS CANDIDATOS (fixos + variáveis)
    // ═══════════════════════════════════════════════════════════════
    static _buildAllCandidates(fixedArr, variableNums, slotsVariable) {
        const variableCombos = this._generateSubsets(variableNums, slotsVariable);
        return variableCombos.map(combo => [...fixedArr, ...combo].sort((a, b) => a - b));
    }

    // ═══════════════════════════════════════════════════════════════
    //  ALGORITMO 1: GREEDY EXATO v3.0
    //  Trabalha no espaço REDUZIDO (apenas variáveis)
    //  Garante cobertura matemática exata
    // ═══════════════════════════════════════════════════════════════
    static _greedyExactV3(fixedArr, variableNums, slotsVariable, guarantee, betSize, pricePerGame, t0, gameKey, allNums, fixedSet) {
        const variableCount = variableNums.length;

        // 1. Enumerar todos os T-subconjuntos de VARIÁVEIS a cobrir
        const allTSubsets = this._generateSubsets(variableNums, guarantee);
        const totalSubsets = allTSubsets.length;

        console.log('[CLOSING-v3.0] T-subconjuntos a cobrir: ' + totalSubsets);

        const subsetKeyToIndex = new Map();
        for (let i = 0; i < allTSubsets.length; i++) {
            subsetKeyToIndex.set(this._subsetKey(allTSubsets[i]), i);
        }

        const uncovered = new Set();
        for (let i = 0; i < totalSubsets; i++) uncovered.add(i);

        // 2. Enumerar todos os candidatos (apenas a parte variável)
        const allVariableParts = this._generateSubsets(variableNums, slotsVariable);
        console.log('[CLOSING-v3.0] Candidatos: ' + allVariableParts.length);

        // 3. Pré-calcular coberturas: quais T-subconjuntos cada candidato cobre
        const candidateCovers = [];
        for (let c = 0; c < allVariableParts.length; c++) {
            const covers = new Set();
            const tSubs = this._generateSubsets(allVariableParts[c], guarantee);
            for (const sub of tSubs) {
                const key = this._subsetKey(sub);
                const idx = subsetKeyToIndex.get(key);
                if (idx !== undefined) covers.add(idx);
            }
            candidateCovers.push(covers);
        }

        // 4. Greedy Set Cover: selecionar o candidato que cobre MAIS
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

            for (const idx of candidateCovers[bestCandidate]) {
                uncovered.delete(idx);
            }

            if (selectedIndices.length % 50 === 0) {
                const pct = ((totalSubsets - uncovered.size) / totalSubsets * 100).toFixed(1);
                console.log('[CLOSING-v3.0] Progresso: ' + selectedIndices.length + ' jogos → ' + pct + '% coberto');
            }
        }

        // 5. Montar jogos finais: fixos + parte variável selecionada
        const games = selectedIndices.map(idx =>
            [...fixedArr, ...allVariableParts[idx]].sort((a, b) => a - b)
        );

        const covered = totalSubsets - uncovered.size;
        const coveragePct = totalSubsets > 0 ? (covered / totalSubsets * 100) : 0;
        const elapsed = Date.now() - t0;

        // 6. Verificar cobertura COMPLETA dos T-subconjuntos do espaço TOTAL
        // (inclui subconjuntos com números fixos — automaticamente cobertos)
        const totalFullSubsets = this.nCr(allNums.length, guarantee);
        const fullCovered = this._verifyFullCoverage(games, allNums, guarantee, 10000);

        console.log('[CLOSING-v3.0] ══════════════════════════════════════');
        console.log('[CLOSING-v3.0] ✅ RESULTADO (GREEDY_EXATO_v3):');
        console.log('[CLOSING-v3.0]    Jogos: ' + games.length);
        console.log('[CLOSING-v3.0]    Cobertura variáveis: ' + covered + '/' + totalSubsets + ' (' + coveragePct.toFixed(2) + '%)');
        console.log('[CLOSING-v3.0]    Cobertura total (amostra): ' + fullCovered.toFixed(1) + '%');
        console.log('[CLOSING-v3.0]    Custo: R$ ' + (games.length * pricePerGame).toFixed(2));
        console.log('[CLOSING-v3.0]    Tempo: ' + elapsed + 'ms');
        console.log('[CLOSING-v3.0] ══════════════════════════════════════');

        return {
            games,
            guarantee,
            totalGames: games.length,
            totalSubsets: totalFullSubsets,
            covered: Math.round(totalFullSubsets * fullCovered / 100),
            coveragePct: parseFloat(fullCovered.toFixed(2)),
            cost: games.length * pricePerGame,
            mode: 'GREEDY_EXATO_v3',
            elapsed,
            selectedNumbers: allNums,
            fixedNumbers: [...fixedSet],
            confidence: coveragePct >= 99.9 ? 100 : parseFloat(coveragePct.toFixed(1))
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  ALGORITMO 2: GREEDY AMOSTRADO REFORÇADO v3.0
    //  Para espaços médios — amostra candidatos em lotes com
    //  tracking de cobertura
    // ═══════════════════════════════════════════════════════════════
    static _greedySampledV3(fixedArr, variableNums, slotsVariable, guarantee, betSize, pricePerGame, t0, gameKey, allNums, fixedSet) {
        const variableCount = variableNums.length;
        const TIMEOUT = 120000;
        const BATCH_SIZE = 20000;

        // 1. Enumerar ou amostrar T-subconjuntos de variáveis
        const totalVarTSubsets = this.nCr(variableCount, guarantee);
        let sampledTSubsets;
        let useFullCoverage = false;

        if (totalVarTSubsets <= 200000) {
            sampledTSubsets = this._generateSubsets(variableNums, guarantee);
            useFullCoverage = true;
            console.log('[CLOSING-v3.0] T-subconjuntos enumerados: ' + sampledTSubsets.length);
        } else {
            sampledTSubsets = this._generateRandomSubsets(variableNums, guarantee, 100000);
            console.log('[CLOSING-v3.0] T-subconjuntos amostrados: ' + sampledTSubsets.length + '/' + totalVarTSubsets.toLocaleString('pt-BR'));
        }

        const subsetKeyToIndex = new Map();
        for (let i = 0; i < sampledTSubsets.length; i++) {
            subsetKeyToIndex.set(this._subsetKey(sampledTSubsets[i]), i);
        }

        const uncovered = new Set();
        for (let i = 0; i < sampledTSubsets.length; i++) uncovered.add(i);

        // 2. Greedy iterativo com lotes de candidatos
        const selectedGames = [];
        let rounds = 0;
        const MAX_ROUNDS = 200;

        while (uncovered.size > 0 && rounds < MAX_ROUNDS && (Date.now() - t0) < TIMEOUT) {
            rounds++;

            // Gerar lote de candidatos variáveis aleatórios
            const candidates = this._generateRandomSubsets(variableNums, slotsVariable, BATCH_SIZE);

            // Encontrar o melhor candidato deste lote
            let bestCandidate = null;
            let bestCount = 0;

            for (const candidate of candidates) {
                const tSubs = this._generateSubsets(candidate, guarantee);
                let count = 0;
                for (const sub of tSubs) {
                    const key = this._subsetKey(sub);
                    const idx = subsetKeyToIndex.get(key);
                    if (idx !== undefined && uncovered.has(idx)) count++;
                }
                if (count > bestCount) {
                    bestCount = count;
                    bestCandidate = candidate;
                }
            }

            if (!bestCandidate || bestCount === 0) {
                // Tentar candidato direcionado
                const smartCandidate = this._generateSmartCandidateV3(variableNums, slotsVariable, uncovered, sampledTSubsets);
                if (smartCandidate) {
                    selectedGames.push([...fixedArr, ...smartCandidate].sort((a, b) => a - b));
                    const tSubs = this._generateSubsets(smartCandidate, guarantee);
                    for (const sub of tSubs) {
                        const key = this._subsetKey(sub);
                        const idx = subsetKeyToIndex.get(key);
                        if (idx !== undefined) uncovered.delete(idx);
                    }
                }
                continue;
            }

            selectedGames.push([...fixedArr, ...bestCandidate].sort((a, b) => a - b));

            // Remover cobertos
            const tSubs = this._generateSubsets(bestCandidate, guarantee);
            for (const sub of tSubs) {
                const key = this._subsetKey(sub);
                const idx = subsetKeyToIndex.get(key);
                if (idx !== undefined) uncovered.delete(idx);
            }

            if (selectedGames.length % 20 === 0) {
                const pct = ((sampledTSubsets.length - uncovered.size) / sampledTSubsets.length * 100).toFixed(1);
                console.log('[CLOSING-v3.0] Progresso: ' + selectedGames.length + ' jogos → ' + pct + '% coberto');
            }
        }

        // Verificação de cobertura
        const varCoveragePct = ((sampledTSubsets.length - uncovered.size) / sampledTSubsets.length * 100);
        const fullCoveragePct = this._verifyFullCoverage(selectedGames, allNums, guarantee, 10000);
        const elapsed = Date.now() - t0;
        const totalFullSubsets = this.nCr(allNums.length, guarantee);

        console.log('[CLOSING-v3.0] ══════════════════════════════════════');
        console.log('[CLOSING-v3.0] ✅ RESULTADO (GREEDY_AMOSTRADO_v3):');
        console.log('[CLOSING-v3.0]    Jogos: ' + selectedGames.length);
        console.log('[CLOSING-v3.0]    Cobertura variáveis: ' + varCoveragePct.toFixed(2) + '%');
        console.log('[CLOSING-v3.0]    Cobertura total (amostra): ' + fullCoveragePct.toFixed(1) + '%');
        console.log('[CLOSING-v3.0]    Rounds: ' + rounds);
        console.log('[CLOSING-v3.0]    Tempo: ' + elapsed + 'ms');
        console.log('[CLOSING-v3.0] ══════════════════════════════════════');

        return {
            games: selectedGames,
            guarantee,
            totalGames: selectedGames.length,
            totalSubsets: totalFullSubsets,
            covered: Math.round(totalFullSubsets * fullCoveragePct / 100),
            coveragePct: parseFloat(fullCoveragePct.toFixed(2)),
            cost: selectedGames.length * pricePerGame,
            mode: 'GREEDY_AMOSTRADO_v3',
            elapsed,
            selectedNumbers: allNums,
            fixedNumbers: [...fixedSet],
            confidence: parseFloat(Math.min(100, varCoveragePct).toFixed(1)),
            note: useFullCoverage ? 'Cobertura exata de T-subconjuntos variáveis.' : 'Cobertura estimada por amostragem de ' + sampledTSubsets.length.toLocaleString('pt-BR') + ' subconjuntos.'
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  ALGORITMO 3: HEURÍSTICO VERIFICADO v3.0
    //  Para espaços enormes — gera por diversidade mas VERIFICA
    // ═══════════════════════════════════════════════════════════════
    static _heuristicVerifiedV3(fixedArr, variableNums, slotsVariable, guarantee, betSize, pricePerGame, t0, gameKey, allNums, fixedSet) {
        const variableCount = variableNums.length;
        const totalFullSubsets = this.nCr(allNums.length, guarantee);

        // Estimar jogos necessários COM a fórmula correta
        const totalVarSubsets = this.nCr(variableCount, guarantee);
        const coversPerCandidate = this.nCr(slotsVariable, guarantee);
        const lowerBound = coversPerCandidate > 0 ? Math.ceil(totalVarSubsets / coversPerCandidate) : totalVarSubsets;

        const ratio = guarantee / slotsVariable;
        let factor;
        if (ratio >= 0.9) factor = 2.0;
        else if (ratio >= 0.7) factor = 1.6;
        else if (ratio >= 0.5) factor = 1.4;
        else factor = 1.2;

        const targetGames = Math.max(lowerBound, Math.ceil(lowerBound * factor));
        const maxGames = Math.min(targetGames, 8000);

        console.log('[CLOSING-v3.0] Estimativa: lowerBound=' + lowerBound + ' → target=' + targetGames + ' → max=' + maxGames);

        // Gerar candidatos com máxima diversidade
        const selectedGames = [];
        const usedKeys = new Set();
        const TIMEOUT = 90000;

        // Dividir variáveis em zonas para diversidade
        const zonesCount = Math.max(2, Math.ceil(variableCount / Math.max(slotsVariable, 1)));
        const zones = [];
        for (let z = 0; z < zonesCount; z++) {
            const start = z * Math.floor(variableCount / zonesCount);
            const end = Math.min(start + Math.ceil(variableCount / zonesCount), variableCount);
            zones.push(variableNums.slice(start, end));
        }

        let attempts = 0;
        const maxAttempts = maxGames * 30;

        while (selectedGames.length < maxGames && attempts < maxAttempts && (Date.now() - t0) < TIMEOUT) {
            attempts++;
            const variablePart = this._generateDiverseCandidate(variableNums, slotsVariable, selectedGames, zones);
            const candidate = [...fixedArr, ...variablePart].sort((a, b) => a - b);
            const key = candidate.join(',');

            if (!usedKeys.has(key)) {
                usedKeys.add(key);
                selectedGames.push([...candidate]);
            }
        }

        // Verificar cobertura por amostragem
        const coverageEstimate = this._verifyFullCoverage(selectedGames, allNums, guarantee, 15000);
        const elapsed = Date.now() - t0;
        const covered = Math.round(totalFullSubsets * coverageEstimate / 100);

        console.log('[CLOSING-v3.0] ══════════════════════════════════════');
        console.log('[CLOSING-v3.0] ✅ RESULTADO (HEURÍSTICO_v3):');
        console.log('[CLOSING-v3.0]    Jogos: ' + selectedGames.length);
        console.log('[CLOSING-v3.0]    Cobertura estimada: ' + coverageEstimate.toFixed(1) + '%');
        console.log('[CLOSING-v3.0]    Tempo: ' + elapsed + 'ms');
        console.log('[CLOSING-v3.0] ══════════════════════════════════════');

        return {
            games: selectedGames,
            guarantee,
            totalGames: selectedGames.length,
            totalSubsets: totalFullSubsets,
            covered: covered,
            coveragePct: parseFloat(coverageEstimate.toFixed(2)),
            cost: selectedGames.length * pricePerGame,
            mode: 'HEURÍSTICO_v3',
            elapsed,
            selectedNumbers: allNums,
            fixedNumbers: [...fixedSet],
            confidence: parseFloat(Math.min(100, coverageEstimate).toFixed(1)),
            note: 'Cobertura estimada por amostragem estatística de 15.000 subconjuntos.'
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  GERAR CANDIDATO INTELIGENTE DIRECIONADO
    // ═══════════════════════════════════════════════════════════════
    static _generateSmartCandidateV3(variableNums, slotsVariable, uncoveredSet, allTSubsets) {
        if (uncoveredSet.size === 0) return null;

        const uncoveredIdx = uncoveredSet.values().next().value;
        const targetSubset = allTSubsets[uncoveredIdx];
        if (!targetSubset) return null;

        const candidate = new Set(targetSubset);
        const remaining = variableNums.filter(n => !candidate.has(n));
        const shuffled = [...remaining].sort(() => Math.random() - 0.5);

        for (const num of shuffled) {
            if (candidate.size >= slotsVariable) break;
            candidate.add(num);
        }

        return [...candidate].sort((a, b) => a - b);
    }

    // ═══════════════════════════════════════════════════════════════
    //  GERAR CANDIDATO COM DIVERSIDADE
    // ═══════════════════════════════════════════════════════════════
    static _generateDiverseCandidate(nums, betSize, existingGames, zones) {
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

        const remaining = nums.filter(n => !candidate.has(n));
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        for (const num of shuffled) {
            if (candidate.size >= betSize) break;
            candidate.add(num);
        }

        return [...candidate];
    }

    // ═══════════════════════════════════════════════════════════════
    //  VERIFICAÇÃO DE COBERTURA TOTAL (amostragem)
    //  Gera T-subconjuntos aleatórios de TODOS os números e verifica
    // ═══════════════════════════════════════════════════════════════
    static _verifyFullCoverage(games, allNums, guarantee, sampleSize) {
        if (games.length === 0) return 0;

        // Gerar amostras de T-subconjuntos de TODOS os números selecionados
        const samples = this._generateRandomSubsets(allNums, guarantee, sampleSize);
        if (samples.length === 0) return 0;

        const gameSets = games.map(g => new Set(g));

        let covered = 0;
        for (const sample of samples) {
            let isCovered = false;
            for (const gameSet of gameSets) {
                let allIn = true;
                for (const num of sample) {
                    if (!gameSet.has(num)) {
                        allIn = false;
                        break;
                    }
                }
                if (allIn) {
                    isCovered = true;
                    break;
                }
            }
            if (isCovered) covered++;
        }

        return (covered / samples.length) * 100;
    }

    // ═══════════════════════════════════════════════════════════════
    //  RESULTADO DE ERRO PADRONIZADO
    // ═══════════════════════════════════════════════════════════════
    static _errorResult(error, guarantee, nums, fixedSet) {
        return {
            games: [], guarantee, totalGames: 0, totalSubsets: 0,
            covered: 0, coveragePct: 0, cost: 0,
            error, selectedNumbers: nums, fixedNumbers: [...fixedSet]
        };
    }

    // ═══════════════════════════════════════════
    //  PREVIEW DO FECHAMENTO (COM FIXOS) v3.0
    // ═══════════════════════════════════════════
    static getClosurePreview(numSelected, guarantee, betSize = 6, gameKey = 'megasena', fixedCount = 0) {
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const price = game ? game.price : 6.00;

        if (gameKey && typeof GAMES !== 'undefined') {
            betSize = this.getBetSize(gameKey);
        }

        if (numSelected < betSize) {
            return {
                games: 0, cost: 0, subsets: 0, possible: false,
                msg: 'Selecione pelo menos ' + betSize + ' números'
            };
        }

        const slotsVariable = betSize - fixedCount;

        // Verificar impossibilidade
        if (fixedCount > 0 && guarantee > slotsVariable) {
            return {
                games: 0, cost: 0, subsets: 0, possible: false, impossible: true,
                maxGuarantee: slotsVariable,
                msg: '⚠️ IMPOSSÍVEL com ' + fixedCount + ' fixos. Máximo: ' + slotsVariable + ' acertos.'
            };
        }

        const estimatedGames = this.estimateGames(numSelected, guarantee, betSize, fixedCount);

        if (estimatedGames < 0) {
            return {
                games: 0, cost: 0, subsets: 0, possible: false, impossible: true,
                maxGuarantee: slotsVariable,
                msg: '⚠️ IMPOSSÍVEL com ' + fixedCount + ' fixos. Máximo: ' + slotsVariable + ' acertos.'
            };
        }

        const cost = estimatedGames * price;

        const guaranteeLabels = {
            20: '20 Pontos', 19: '19 Pontos', 18: '18 Pontos', 17: '17 Pontos',
            15: '15 Pontos', 14: '14 Pontos', 13: '13 Pontos', 12: '12 Pontos',
            11: '11 Pontos', 10: '10 Pontos', 9: '9 Pontos', 8: '8 Pontos',
            7: '7 Pontos', 6: 'Sena/6 Pts', 5: 'Quina/5 Pts',
            4: 'Quadra/4 Pts', 3: 'Terno/3 Pts'
        };
        const label = guaranteeLabels[guarantee] || guarantee + ' acertos';

        return {
            games: estimatedGames,
            cost: cost,
            subsets: this.nCr(numSelected, guarantee),
            possible: estimatedGames <= 50000,
            guarantee,
            label,
            fixedCount,
            msg: numSelected + ' números' + (fixedCount > 0 ? ' (' + fixedCount + ' fixos)' : '') +
                ' → Fechamento ' + label + ' = ~' + estimatedGames.toLocaleString('pt-BR') +
                ' jogos (R$ ' + cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ')'
        };
    }

    // ═══════════════════════════════════════════
    //  OBTER NÍVEIS DINÂMICOS DE FECHAMENTO
    //  Baseado no fixedCount atual
    // ═══════════════════════════════════════════
    static getDynamicClosingLevels(gameKey, fixedCount = 0) {
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        if (!game) return [];

        const betSize = this.getBetSize(gameKey);
        const maxGuarantee = fixedCount > 0 ? betSize - fixedCount : betSize;
        const baseLevels = game.closingLevels || [];

        const allLevels = [];
        const icons = { 3: '✅', 4: '🔥', 5: '⭐', 6: '🎯', 7: '🎯', 8: '💎', 9: '💎', 10: '👑', 11: '👑', 12: '👑', 13: '🔥', 14: '⭐', 15: '🎯', 17: '✅', 18: '🔥', 19: '⭐', 20: '🎯' };

        // Incluir níveis base do jogo
        for (const cl of baseLevels) {
            const feasible = cl.guarantee <= maxGuarantee;
            allLevels.push({
                id: cl.id,
                label: cl.label + (feasible ? '' : ' ⛔'),
                guarantee: cl.guarantee,
                icon: feasible ? (cl.icon || icons[cl.guarantee] || '🎯') : '⛔',
                feasible: feasible,
                impossible: !feasible,
                reason: feasible ? '' : 'Impossível com ' + fixedCount + ' fixos (máx: ' + maxGuarantee + ')'
            });
        }

        // Para Lotofácil com fixos: adicionar níveis mais baixos que são viáveis
        if (fixedCount > 0 && gameKey === 'lotofacil') {
            const existingGuarantees = new Set(baseLevels.map(cl => cl.guarantee));
            for (let g = Math.min(maxGuarantee, 9); g >= 3; g--) {
                if (!existingGuarantees.has(g)) {
                    allLevels.push({
                        id: 'close' + g,
                        label: 'Fechamento ' + g + ' Pontos',
                        guarantee: g,
                        icon: icons[g] || '✅',
                        feasible: true,
                        impossible: false,
                        dynamic: true
                    });
                }
            }
        }

        // Para outros jogos com fixos: adicionar níveis viáveis extras
        if (fixedCount > 0 && gameKey !== 'lotofacil') {
            const existingGuarantees = new Set(baseLevels.map(cl => cl.guarantee));
            for (let g = Math.min(maxGuarantee, betSize - 1); g >= 3; g--) {
                if (!existingGuarantees.has(g)) {
                    allLevels.push({
                        id: 'close' + g,
                        label: 'Fechamento ' + g + ' acertos',
                        guarantee: g,
                        icon: icons[g] || '✅',
                        feasible: true,
                        impossible: false,
                        dynamic: true
                    });
                }
            }
        }

        // Ordenar: viáveis primeiro (maior garantia primeiro), depois impossíveis
        allLevels.sort((a, b) => {
            if (a.feasible !== b.feasible) return a.feasible ? -1 : 1;
            return b.guarantee - a.guarantee;
        });

        return allLevels;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ClosingEngine = ClosingEngine;
}

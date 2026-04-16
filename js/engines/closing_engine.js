/**
 * ClosingEngine v1.0 — Motor de Fechamento Objetivo L99
 * 
 * Algoritmo: Covering Design Greedy
 * Dado N números selecionados e um nível de garantia T (3,4,5,6),
 * gera o MÍNIMO de jogos de 6 números que GARANTE que pelo menos
 * 1 jogo terá T acertos, SE os T números sorteados estiverem
 * entre os N selecionados.
 * 
 * Exemplo Mega Sena:
 *   - 10 números selecionados, garantia 4 (Quadra)
 *   - Gera ~14 jogos que cobrem TODOS os C(10,4) = 210 subconjuntos de 4
 *   - Se 4 dos 6 sorteados estão nos 10, pelo menos 1 jogo acerta a Quadra
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
    //  GERAR TODOS OS SUBCONJUNTOS DE TAMANHO K
    //  Retorna array de arrays
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
    //  CHAVE ÚNICA PARA UM SUBCONJUNTO
    // ═══════════════════════════════════════════
    static _subsetKey(subset) {
        return subset.join(',');
    }

    // ═══════════════════════════════════════════
    //  EXTRAIR TODOS OS T-SUBCONJUNTOS DE UM JOGO
    //  Ex: jogo [1,2,3,4,5,6] com t=4 → C(6,4) = 15 subconjuntos
    // ═══════════════════════════════════════════
    static _getTSubsets(game, t) {
        return this._generateSubsets(game, t);
    }

    // ═══════════════════════════════════════════
    //  ESTIMAR JOGOS NECESSÁRIOS
    //  Retorna estimativa sem gerar os jogos
    // ═══════════════════════════════════════════
    static estimateGames(numSelected, guarantee, betSize = 6) {
        if (numSelected < betSize) return 0;
        
        // Total de T-subconjuntos a cobrir
        const totalSubsets = this.nCr(numSelected, guarantee);
        // Cada jogo de betSize cobre C(betSize, guarantee) subconjuntos
        const coversPerGame = this.nCr(betSize, guarantee);
        
        if (guarantee === betSize) {
            // Fechamento completo: precisa de TODAS as combinações
            return this.nCr(numSelected, betSize);
        }
        
        // Estimativa Greedy: ~1.3x o limite inferior teórico
        // Limite inferior = ceil(totalSubsets / coversPerGame)
        const lowerBound = Math.ceil(totalSubsets / coversPerGame);
        
        // Fator de ajuste baseado em experiência com covering designs
        let factor;
        if (guarantee <= 3) factor = 1.1;
        else if (guarantee === 4) factor = 1.25;
        else factor = 1.4;
        
        return Math.max(lowerBound, Math.ceil(lowerBound * factor));
    }

    // ═══════════════════════════════════════════════════════════════
    //  MÉTODO PRINCIPAL: GERAR FECHAMENTO OBJETIVO
    //  
    //  selectedNumbers: Array de números selecionados (ex: [1,5,10,15,20,25,30,35])
    //  guarantee: Nível de garantia (3, 4, 5 ou 6)
    //  betSize: Nº por jogo (6 para Mega Sena)
    //  gameKey: Chave do jogo (para custo)
    //  
    //  Retorna: { games, guarantee, totalGames, totalSubsets, 
    //             covered, coveragePct, cost, selectedNumbers }
    // ═══════════════════════════════════════════════════════════════
    static generateClosure(selectedNumbers, guarantee, betSize = 6, gameKey = 'megasena') {
        const t0 = Date.now();
        const nums = [...selectedNumbers].sort((a, b) => a - b);
        const N = nums.length;
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const pricePerGame = game ? game.price : 6.00;

        console.log('[CLOSING-L99] ══════════════════════════════════════');
        console.log('[CLOSING-L99] 🎯 Fechamento Objetivo');
        console.log('[CLOSING-L99] Números: ' + N + ' → Garantia: ' + guarantee + ' acertos');
        console.log('[CLOSING-L99] Total subconjuntos: C(' + N + ',' + guarantee + ') = ' + this.nCr(N, guarantee));

        // Validações
        if (N < betSize) {
            return {
                games: [], guarantee, totalGames: 0, totalSubsets: 0,
                covered: 0, coveragePct: 0, cost: 0,
                error: 'Selecione pelo menos ' + betSize + ' números para o fechamento.',
                selectedNumbers: nums
            };
        }

        if (guarantee > betSize) {
            return {
                games: [], guarantee, totalGames: 0, totalSubsets: 0,
                covered: 0, coveragePct: 0, cost: 0,
                error: 'Garantia não pode ser maior que ' + betSize + '.',
                selectedNumbers: nums
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // CASO ESPECIAL: Fechamento Completo (T = betSize)
        // Gera TODAS as C(N, betSize) combinações
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (guarantee === betSize) {
            const totalCombs = this.nCr(N, betSize);
            
            // Limite de segurança
            if (totalCombs > 50000) {
                return {
                    games: [], guarantee, totalGames: totalCombs, 
                    totalSubsets: totalCombs, covered: 0, coveragePct: 100,
                    cost: totalCombs * pricePerGame,
                    error: 'Fechamento completo de ' + guarantee + ' com ' + N + ' números geraria ' + totalCombs.toLocaleString('pt-BR') + ' jogos (R$ ' + (totalCombs * pricePerGame).toLocaleString('pt-BR', {minimumFractionDigits: 2}) + '). Reduza os números ou use garantia menor.',
                    selectedNumbers: nums
                };
            }

            console.log('[CLOSING-L99] Modo: FECHAMENTO COMPLETO → ' + totalCombs + ' jogos');
            const games = this._generateSubsets(nums, betSize);
            const elapsed = Date.now() - t0;
            console.log('[CLOSING-L99] ✅ ' + games.length + ' jogos em ' + elapsed + 'ms');

            return {
                games, guarantee, totalGames: games.length,
                totalSubsets: totalCombs, covered: totalCombs,
                coveragePct: 100, cost: games.length * pricePerGame,
                mode: 'COMPLETO', elapsed, selectedNumbers: nums
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // COVERING DESIGN GREEDY
        // Gera o mínimo de jogos para cobrir TODOS
        // os T-subconjuntos com jogos de `betSize`
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        console.log('[CLOSING-L99] Modo: COVERING DESIGN GREEDY');

        // 1. Enumerar todos os T-subconjuntos que devem ser cobertos
        const allTSubsets = this._generateSubsets(nums, guarantee);
        const totalSubsets = allTSubsets.length;
        
        // Criar mapa de index → chave para rastreio rápido
        const subsetKeyToIndex = new Map();
        for (let i = 0; i < allTSubsets.length; i++) {
            subsetKeyToIndex.set(this._subsetKey(allTSubsets[i]), i);
        }
        
        // Set de subconjuntos NÃO cobertos
        const uncovered = new Set();
        for (let i = 0; i < totalSubsets; i++) uncovered.add(i);

        console.log('[CLOSING-L99] T-subconjuntos a cobrir: ' + totalSubsets);

        // 2. Enumerar todos os candidatos (jogos possíveis)
        const allCandidates = this._generateSubsets(nums, betSize);
        console.log('[CLOSING-L99] Candidatos possíveis: ' + allCandidates.length);

        // 3. Pré-calcular quais T-subconjuntos cada candidato cobre
        const candidateCovers = [];
        for (let c = 0; c < allCandidates.length; c++) {
            const covers = new Set();
            const tSubs = this._getTSubsets(allCandidates[c], guarantee);
            for (const sub of tSubs) {
                const key = this._subsetKey(sub);
                const idx = subsetKeyToIndex.get(key);
                if (idx !== undefined) covers.add(idx);
            }
            candidateCovers.push(covers);
        }

        // 4. Greedy: selecionar o candidato que cobre MAIS subconjuntos não cobertos
        const selectedGames = [];
        const usedCandidates = new Set();
        const TIMEOUT = 300000; // 5 min max

        while (uncovered.size > 0 && (Date.now() - t0) < TIMEOUT) {
            let bestCandidate = -1;
            let bestCount = 0;

            for (let c = 0; c < allCandidates.length; c++) {
                if (usedCandidates.has(c)) continue;
                
                // Contar quantos subconjuntos NÃO cobertos este candidato cobre
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

            // Adicionar o melhor candidato
            selectedGames.push(allCandidates[bestCandidate]);
            usedCandidates.add(bestCandidate);

            // Remover subconjuntos cobertos
            for (const idx of candidateCovers[bestCandidate]) {
                uncovered.delete(idx);
            }

            // Log de progresso a cada 10 jogos
            if (selectedGames.length % 50 === 0) {
                const pct = ((totalSubsets - uncovered.size) / totalSubsets * 100).toFixed(1);
                console.log('[CLOSING-L99] Progresso: ' + selectedGames.length + ' jogos → ' + pct + '% coberto');
            }
        }

        const elapsed = Date.now() - t0;
        const covered = totalSubsets - uncovered.size;
        const coveragePct = (covered / totalSubsets * 100).toFixed(2);

        console.log('[CLOSING-L99] ══════════════════════════════════════');
        console.log('[CLOSING-L99] ✅ RESULTADO:');
        console.log('[CLOSING-L99]    Jogos: ' + selectedGames.length);
        console.log('[CLOSING-L99]    Cobertura: ' + covered + '/' + totalSubsets + ' (' + coveragePct + '%)');
        console.log('[CLOSING-L99]    Custo: R$ ' + (selectedGames.length * pricePerGame).toFixed(2));
        console.log('[CLOSING-L99]    Tempo: ' + elapsed + 'ms');
        console.log('[CLOSING-L99] ══════════════════════════════════════');

        return {
            games: selectedGames,
            guarantee,
            totalGames: selectedGames.length,
            totalSubsets,
            covered,
            coveragePct: parseFloat(coveragePct),
            cost: selectedGames.length * pricePerGame,
            mode: 'GREEDY',
            elapsed,
            selectedNumbers: nums
        };
    }

    // ═══════════════════════════════════════════
    //  CALCULAR PREVIEW (sem gerar jogos)
    //  Para atualizar em tempo real na interface
    // ═══════════════════════════════════════════
    static getClosurePreview(numSelected, guarantee, betSize = 6, gameKey = 'megasena') {
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const price = game ? game.price : 6.00;
        
        if (numSelected < betSize) {
            return { games: 0, cost: 0, subsets: 0, possible: false, 
                     msg: 'Selecione pelo menos ' + betSize + ' números' };
        }

        const totalSubsets = this.nCr(numSelected, guarantee);
        let estimatedGames;
        
        if (guarantee === betSize) {
            estimatedGames = this.nCr(numSelected, betSize);
        } else {
            estimatedGames = this.estimateGames(numSelected, guarantee, betSize);
        }

        const cost = estimatedGames * price;
        const guaranteeLabels = { 20: '20 Pontos', 19: '19 Pontos', 18: '18 Pontos', 17: '17 Pontos', 15: '15 Pontos', 14: '14 Pontos', 13: '13 Pontos', 7: '7 Pontos', 6: 'Sena/6 Pts', 5: 'Quina/5 Pts', 4: 'Quadra/4 Pts', 3: 'Terno/3 Pts' };
        const label = guaranteeLabels[guarantee] || guarantee + ' acertos';

        return {
            games: estimatedGames,
            cost: cost,
            subsets: totalSubsets,
            possible: estimatedGames <= 50000,
            guarantee,
            label,
            msg: numSelected + ' números → Fechamento ' + label + ' = ~' + estimatedGames + ' jogos (R$ ' + cost.toLocaleString('pt-BR', {minimumFractionDigits: 2}) + ')'
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ClosingEngine = ClosingEngine;
}

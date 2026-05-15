/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MOTOR DE FECHAMENTO MANUAL v2.0 — CORRIGIDO                   ║
 * ║  Motor Universal para 7 Loterias                                ║
 * ║                                                                 ║
 * ║  CORREÇÕES v2.0:                                                ║
 * ║  • Base Perfeita: anti-loop infinito com maxAttempts             ║
 * ║  • Cruzamento Genético: teto 5000 gerações + fallback agressivo ║
 * ║  • Preço: calculado corretamente por drawSize real               ║
 * ║  • Pool: validação de duplicatas no pool de entrada              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
class MotorFechamentoManual {

    static getConfig(gameKey) {
        if (typeof GAMES === 'undefined' || !GAMES[gameKey]) {
            throw new Error('Loteria não encontrada: ' + gameKey);
        }
        const g = GAMES[gameKey];
        return {
            name: g.name,
            range: g.range,
            drawSize: g.minBet,
            maxBet: g.maxBet || g.range[1],
            price: g.price || 5.00,
            totalNumbers: g.range[1] - g.range[0] + 1
        };
    }

    // ═══════════════════════════════════════════════════════
    //  Calcular preço REAL baseado no drawSize
    //  Mega Sena: 6=R$5, 7=R$35, 8=R$140, 9=R$420...
    //  Fórmula: precoBase * C(drawSize, minBet) / C(minBet, minBet)
    // ═══════════════════════════════════════════════════════
    static _calcRealPrice(cfg, drawSize) {
        if (drawSize <= cfg.drawSize) return cfg.price;
        const ratio = this._comb(drawSize, cfg.drawSize);
        return cfg.price * ratio;
    }

    // ═══════════════════════════════════════════════════════
    //  PONTO DE ENTRADA PRINCIPAL
    // ═══════════════════════════════════════════════════════
    static generate(gameKey, pool, fixedNumbers, numGames, drawSize) {
        const t0 = Date.now();
        const cfg = this.getConfig(gameKey);
        const k = drawSize || cfg.drawSize;

        const validPool = pool.filter(n => n >= cfg.range[0] && n <= cfg.range[1]);
        const fixedSet = new Set((fixedNumbers || []).filter(n => validPool.includes(n)));
        const fixedArr = Array.from(fixedSet).sort((a, b) => a - b);
        const poolArr = Array.from(new Set(validPool)).sort((a, b) => a - b);

        console.log('%c[MOTOR-MANUAL] ══════════════════════════════════', 'color: #FFD700; font-weight: bold; font-size: 14px;');
        console.log('%c[MOTOR-MANUAL] ' + cfg.name + ' | Pool: ' + poolArr.length + ' | Fixos: ' + fixedArr.length + ' | Jogos: ' + numGames + ' | k=' + k, 'color: #FFD700; font-weight: bold;');

        if (poolArr.length < k) {
            return { games: [], error: 'Pool insuficiente. Selecione pelo menos ' + k + ' números.', analysis: {} };
        }
        if (fixedArr.length > k) {
            return { games: [], error: 'Muitos fixos (' + fixedArr.length + '). Máximo: ' + k, analysis: {} };
        }
        if (fixedArr.length === k) {
            return this._buildResult([fixedArr.slice()], cfg, poolArr, fixedArr, k, t0);
        }

        // ── FASE 1: BASE PERFEITA ──
        const basePerfect = this._buildBasePerfect(poolArr, fixedArr, k);
        console.log('[MOTOR-MANUAL] Base Perfeita: ' + basePerfect.length + ' jogos');

        // ── FASE 2: EXPANSÃO ──
        let allGames;
        const maxPossible = this._comb(poolArr.length - fixedArr.length, k - fixedArr.length);

        if (numGames <= basePerfect.length) {
            allGames = basePerfect.slice(0, numGames);
        } else if (numGames >= maxPossible) {
            allGames = this._generateAll(poolArr, fixedArr, k);
            console.log('[MOTOR-MANUAL] Fechamento TOTAL: ' + allGames.length + ' combinações');
        } else {
            allGames = this._expandByGeneticCrossover(basePerfect, poolArr, fixedArr, k, numGames, maxPossible);
            console.log('[MOTOR-MANUAL] Expansão Genética: ' + allGames.length + ' jogos');
        }

        return this._buildResult(allGames, cfg, poolArr, fixedArr, k, t0);
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 1: BASE PERFEITA (v2.0 — anti-loop)
    // ═══════════════════════════════════════════════════════
    static _buildBasePerfect(pool, fixed, k) {
        const uncovered = new Set(pool.filter(n => !fixed.includes(n)));
        const slotsPerGame = k - fixed.length;
        const games = [];
        const usedKeys = new Set();
        let safetyCounter = 0;
        const maxSafety = pool.length * 10; // v2.0: proteção anti-loop

        while (uncovered.size > 0 && safetyCounter < maxSafety) {
            safetyCounter++;
            const remaining = Array.from(uncovered);

            if (remaining.length <= slotsPerGame) {
                const ticket = fixed.slice();
                for (const n of remaining) ticket.push(n);
                const fillers = pool.filter(n => !ticket.includes(n));
                this._shuffle(fillers);
                while (ticket.length < k && fillers.length > 0) ticket.push(fillers.pop());
                ticket.sort((a, b) => a - b);
                const key = ticket.join(',');
                if (!usedKeys.has(key)) { usedKeys.add(key); games.push(ticket); }
                break;
            }

            this._shuffle(remaining);
            const chosen = remaining.slice(0, slotsPerGame);
            const ticket = [...fixed, ...chosen];
            ticket.sort((a, b) => a - b);
            const key = ticket.join(',');
            if (!usedKeys.has(key)) {
                usedKeys.add(key);
                games.push(ticket);
                for (const n of chosen) uncovered.delete(n);
            } else {
                // v2.0: se ticket duplicado, forçar remoção de pelo menos 1 número
                uncovered.delete(chosen[0]);
            }
        }

        return games;
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 2: CRUZAMENTO GENÉTICO (v3.0 — True Fitness GA)
    // ═══════════════════════════════════════════════════════
    static _expandByGeneticCrossover(base, pool, fixed, k, targetCount, maxPossible) {
        const allGames = base.slice();
        const usedKeys = new Set(base.map(g => g.join(',')));
        const nonFixed = pool.filter(n => !fixed.includes(n));
        const slotsPerGame = k - fixed.length;
        
        // v3.0: Inicializar matriz de frequência de pares
        const pairMatrix = {};
        for (const n1 of pool) {
            pairMatrix[n1] = {};
            for (const n2 of pool) pairMatrix[n1][n2] = 0;
        }

        // Popular matriz com a base perfeita
        for (const game of allGames) {
            for (let i = 0; i < game.length; i++) {
                for (let j = i + 1; j < game.length; j++) {
                    pairMatrix[game[i]][game[j]]++;
                    pairMatrix[game[j]][game[i]]++;
                }
            }
        }

        let generation = 0;
        const maxGenerations = Math.min(targetCount * 20, 10000);
        const cappedTarget = Math.min(targetCount, maxPossible);
        const litterSize = 10; // Ninhada: gera 10 mutantes por geração e escolhe o melhor

        while (allGames.length < cappedTarget && generation < maxGenerations) {
            generation++;
            let bestChild = null;
            let bestFitness = -1;

            // Gerar "Ninhada" (Litter) de candidatos
            for (let c = 0; c < litterSize; c++) {
                const parent1 = allGames[Math.floor(Math.random() * allGames.length)];
                const parent2 = allGames[Math.floor(Math.random() * allGames.length)];

                const genes1 = parent1.filter(n => !fixed.includes(n));
                const genes2 = parent2.filter(n => !fixed.includes(n));

                const cut = Math.floor(Math.random() * (slotsPerGame - 1)) + 1;
                const childGenes = new Set();

                // Crossover
                for (let i = 0; i < cut && childGenes.size < slotsPerGame; i++) {
                    if (genes1[i] !== undefined) childGenes.add(genes1[i]);
                }
                for (let i = cut; i < genes2.length && childGenes.size < slotsPerGame; i++) {
                    if (genes2[i] !== undefined && !childGenes.has(genes2[i])) childGenes.add(genes2[i]);
                }

                // Mutação / Preenchimento
                if (childGenes.size < slotsPerGame) {
                    const mutants = nonFixed.filter(n => !childGenes.has(n));
                    this._shuffle(mutants);
                    while (childGenes.size < slotsPerGame && mutants.length > 0) {
                        childGenes.add(mutants.pop());
                    }
                }

                if (childGenes.size === slotsPerGame) {
                    const ticket = [...fixed, ...childGenes].sort((a, b) => a - b);
                    const key = ticket.join(',');
                    
                    if (!usedKeys.has(key)) {
                        // v3.0: FITNESS FUNCTION (Aptidão)
                        // Calcula a qualidade do filho: ele é melhor se contiver pares que apareceram POUCO
                        let fitness = 0;
                        for (let i = 0; i < ticket.length; i++) {
                            for (let j = i + 1; j < ticket.length; j++) {
                                // 1 / (1 + aparições). Quanto menos aparições, maior a pontuação.
                                fitness += 1 / (1 + pairMatrix[ticket[i]][ticket[j]]);
                            }
                        }

                        if (fitness > bestFitness) {
                            bestFitness = fitness;
                            bestChild = { ticket, key };
                        }
                    }
                }
            }

            // Seleção Natural: Sobrevive o mais apto da ninhada
            if (bestChild) {
                usedKeys.add(bestChild.key);
                allGames.push(bestChild.ticket);
                
                // Atualizar matriz de pares
                const t = bestChild.ticket;
                for (let i = 0; i < t.length; i++) {
                    for (let j = i + 1; j < t.length; j++) {
                        pairMatrix[t[i]][t[j]]++;
                        pairMatrix[t[j]][t[i]]++;
                    }
                }
            } else if (generation % 20 === 0) {
                // Fallback de estagnação: Forçar mutação aleatória severa se a ninhada falhar
                for (let f = 0; f < 50 && allGames.length < cappedTarget; f++) {
                    const shuffled = nonFixed.slice();
                    this._shuffle(shuffled);
                    const ticket = [...fixed, ...shuffled.slice(0, slotsPerGame)].sort((a, b) => a - b);
                    const key = ticket.join(',');
                    if (!usedKeys.has(key)) {
                        usedKeys.add(key);
                        allGames.push(ticket);
                        for (let i = 0; i < ticket.length; i++) {
                            for (let j = i + 1; j < ticket.length; j++) {
                                pairMatrix[ticket[i]][ticket[j]]++;
                                pairMatrix[ticket[j]][ticket[i]]++;
                            }
                        }
                    }
                }
            }
        }

        return allGames;
    }

    // ═══════════════════════════════════════════════════════
    //  GERAÇÃO COMPLETA C(n,k)
    // ═══════════════════════════════════════════════════════
    static _generateAll(pool, fixed, k) {
        const nonFixed = pool.filter(n => !fixed.includes(n));
        const slotsNeeded = k - fixed.length;
        const results = [];

        const indices = [];
        for (let i = 0; i < slotsNeeded; i++) indices.push(i);

        while (true) {
            const ticket = fixed.slice();
            for (const idx of indices) ticket.push(nonFixed[idx]);
            ticket.sort((a, b) => a - b);
            results.push(ticket);

            if (results.length >= 50000) break;

            let pos = slotsNeeded - 1;
            while (pos >= 0 && indices[pos] === nonFixed.length - slotsNeeded + pos) pos--;
            if (pos < 0) break;
            indices[pos]++;
            for (let i = pos + 1; i < slotsNeeded; i++) indices[i] = indices[i - 1] + 1;
        }

        return results;
    }

    // ═══════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════
    static _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    static _comb(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;
        if (r > n - r) r = n - r;
        let result = 1;
        for (let i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return Math.round(result);
    }

    // v2.0: preço real baseado no drawSize
    static _buildResult(games, cfg, pool, fixed, drawSize, t0) {
        const elapsed = Date.now() - t0;
        const slotsNeeded = games[0] ? games[0].length - fixed.length : 0;
        const totalPossible = this._comb(pool.length - fixed.length, slotsNeeded);
        const realPrice = this._calcRealPrice(cfg, drawSize);

        const analysis = {
            totalGames: games.length,
            totalPossible: totalPossible,
            poolSize: pool.length,
            fixedCount: fixed.length,
            fixedNumbers: fixed,
            drawSize: drawSize,
            pricePerGame: realPrice,
            investimento: games.length * realPrice,
            isComplete: games.length >= totalPossible,
            elapsed: elapsed
        };

        console.log('[MOTOR-MANUAL] ✅ ' + games.length + '/' + totalPossible + ' jogos | R$ ' + analysis.investimento.toFixed(2) + ' (R$ ' + realPrice.toFixed(2) + '/jogo) | ' + elapsed + 'ms');
        console.log('%c[MOTOR-MANUAL] ══════════════════════════════════', 'color: #FFD700; font-weight: bold;');

        return { games, analysis };
    }
}

if (typeof window !== 'undefined') window.MotorFechamentoManual = MotorFechamentoManual;

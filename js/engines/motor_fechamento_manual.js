/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MOTOR DE FECHAMENTO MANUAL v1.0                                ║
 * ║  Motor Universal para 7 Loterias                                ║
 * ║                                                                 ║
 * ║  ARQUITETURA:                                                   ║
 * ║  1. Factory Pattern — lê config de GAMES automaticamente        ║
 * ║  2. Base Perfeita — cobertura mínima do pool                    ║
 * ║  3. Cruzamento Genético — expansão por crossover                ║
 * ║  4. Anti-Fragilidade — zero duplicatas, validação rígida        ║
 * ║                                                                 ║
 * ║  REGRAS:                                                        ║
 * ║  • Pool = números escolhidos pelo apostador                     ║
 * ║  • Fixos (opcional) = aparecem em TODOS os bilhetes             ║
 * ║  • Jogos usam SOMENTE números do pool                           ║
 * ║  • Cada jogo é único (anti-duplicata)                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
class MotorFechamentoManual {

    // ═══════════════════════════════════════════════════════
    //  FACTORY: Ler config da loteria ativa
    // ═══════════════════════════════════════════════════════
    static getConfig(gameKey) {
        if (typeof GAMES === 'undefined' || !GAMES[gameKey]) {
            throw new Error('Loteria não encontrada: ' + gameKey);
        }
        const g = GAMES[gameKey];
        return {
            name: g.name,
            range: g.range,              // [min, max]
            drawSize: g.minBet,          // números por bilhete
            maxBet: g.maxBet || g.range[1],
            price: g.price || 5.00,
            totalNumbers: g.range[1] - g.range[0] + 1
        };
    }

    // ═══════════════════════════════════════════════════════
    //  PONTO DE ENTRADA PRINCIPAL
    //  pool: números escolhidos pelo apostador (array)
    //  fixedNumbers: números fixos (array, opcional)
    //  numGames: quantidade desejada de jogos
    //  drawSize: tamanho do bilhete (override opcional)
    // ═══════════════════════════════════════════════════════
    static generate(gameKey, pool, fixedNumbers, numGames, drawSize) {
        const t0 = Date.now();
        const cfg = this.getConfig(gameKey);
        const k = drawSize || cfg.drawSize;

        // Validar pool
        const validPool = pool.filter(n => n >= cfg.range[0] && n <= cfg.range[1]);
        const fixedSet = new Set((fixedNumbers || []).filter(n => validPool.includes(n)));
        const fixedArr = Array.from(fixedSet).sort((a, b) => a - b);
        const poolArr = Array.from(new Set(validPool)).sort((a, b) => a - b);

        console.log('%c[MOTOR-MANUAL] ══════════════════════════════════', 'color: #FFD700; font-weight: bold; font-size: 14px;');
        console.log('%c[MOTOR-MANUAL] ' + cfg.name + ' | Pool: ' + poolArr.length + ' | Fixos: ' + fixedArr.length + ' | Jogos: ' + numGames + ' | k=' + k, 'color: #FFD700; font-weight: bold;');

        // Validações rígidas
        if (poolArr.length < k) {
            return { games: [], error: 'Pool insuficiente. Selecione pelo menos ' + k + ' números.', analysis: {} };
        }
        if (fixedArr.length > k) {
            return { games: [], error: 'Muitos fixos (' + fixedArr.length + '). Máximo: ' + k, analysis: {} };
        }
        if (fixedArr.length === k) {
            // Pool de fixos = drawSize → 1 jogo apenas
            return this._buildResult([fixedArr.slice()], cfg, poolArr, fixedArr, t0);
        }

        // ── FASE 1: BASE PERFEITA ──
        // O menor conjunto de jogos que cobre todos os números do pool
        const basePerfect = this._buildBasePerfect(poolArr, fixedArr, k);
        console.log('[MOTOR-MANUAL] Base Perfeita: ' + basePerfect.length + ' jogos');

        // ── FASE 2: EXPANSÃO ──
        let allGames;
        const maxPossible = this._comb(poolArr.length - fixedArr.length, k - fixedArr.length);

        if (numGames <= basePerfect.length) {
            // Pediu menos que a base → retornar subset da base
            allGames = basePerfect.slice(0, numGames);
        } else if (numGames >= maxPossible) {
            // Pediu tudo → gerar todas as combinações
            allGames = this._generateAll(poolArr, fixedArr, k);
            console.log('[MOTOR-MANUAL] Fechamento TOTAL: ' + allGames.length + ' combinações');
        } else {
            // Pediu mais que a base → Cruzamento Genético
            allGames = this._expandByGeneticCrossover(basePerfect, poolArr, fixedArr, k, numGames);
            console.log('[MOTOR-MANUAL] Expansão Genética: ' + allGames.length + ' jogos');
        }

        return this._buildResult(allGames, cfg, poolArr, fixedArr, t0);
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 1: BASE PERFEITA
    //  Gera o menor número de jogos para cobrir TODOS os
    //  números do pool pelo menos uma vez.
    // ═══════════════════════════════════════════════════════
    static _buildBasePerfect(pool, fixed, k) {
        const uncovered = new Set(pool.filter(n => !fixed.includes(n)));
        const slotsPerGame = k - fixed.length;
        const games = [];
        const usedKeys = new Set();

        // Greedy: cada jogo cobre o máximo de números ainda não cobertos
        while (uncovered.size > 0) {
            const remaining = Array.from(uncovered);

            if (remaining.length <= slotsPerGame) {
                // Últimos números cabem em 1 jogo
                const ticket = fixed.slice();
                for (const n of remaining) ticket.push(n);
                // Completar com números do pool já cobertos
                const fillers = pool.filter(n => !ticket.includes(n));
                this._shuffle(fillers);
                while (ticket.length < k && fillers.length > 0) ticket.push(fillers.pop());
                ticket.sort((a, b) => a - b);
                const key = ticket.join(',');
                if (!usedKeys.has(key)) { usedKeys.add(key); games.push(ticket); }
                break;
            }

            // Pegar slotsPerGame números não cobertos
            this._shuffle(remaining);
            const chosen = remaining.slice(0, slotsPerGame);
            const ticket = [...fixed, ...chosen];
            ticket.sort((a, b) => a - b);
            const key = ticket.join(',');
            if (!usedKeys.has(key)) {
                usedKeys.add(key);
                games.push(ticket);
                for (const n of chosen) uncovered.delete(n);
            }
        }

        return games;
    }

    // ═══════════════════════════════════════════════════════
    //  FASE 2: CRUZAMENTO GENÉTICO
    //  Expande a base usando crossover entre jogos existentes
    //  + mutação controlada para gerar diversidade.
    // ═══════════════════════════════════════════════════════
    static _expandByGeneticCrossover(base, pool, fixed, k, targetCount) {
        const allGames = base.slice();
        const usedKeys = new Set(base.map(g => g.join(',')));
        const nonFixed = pool.filter(n => !fixed.includes(n));
        const slotsPerGame = k - fixed.length;
        let generation = 0;
        const maxGenerations = 500;

        while (allGames.length < targetCount && generation < maxGenerations) {
            generation++;

            // ── Crossover: combinar genes de 2 pais ──
            const parent1 = allGames[Math.floor(Math.random() * allGames.length)];
            const parent2 = allGames[Math.floor(Math.random() * allGames.length)];

            // Genes = números não-fixos de cada pai
            const genes1 = parent1.filter(n => !fixed.includes(n));
            const genes2 = parent2.filter(n => !fixed.includes(n));

            // Ponto de corte aleatório
            const cut = Math.floor(Math.random() * (slotsPerGame - 1)) + 1;
            const childGenes = new Set();

            // Primeira metade do pai 1
            for (let i = 0; i < cut && childGenes.size < slotsPerGame; i++) {
                if (genes1[i] !== undefined) childGenes.add(genes1[i]);
            }
            // Segunda metade do pai 2
            for (let i = cut; i < genes2.length && childGenes.size < slotsPerGame; i++) {
                if (genes2[i] !== undefined && !childGenes.has(genes2[i])) childGenes.add(genes2[i]);
            }

            // ── Mutação: completar com genes novos do pool ──
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
                    usedKeys.add(key);
                    allGames.push(ticket);
                }
            }

            // ── Fallback: Fisher-Yates direto quando crossover estagna ──
            if (generation % 50 === 0 && allGames.length < targetCount) {
                for (let f = 0; f < 20 && allGames.length < targetCount; f++) {
                    const shuffled = nonFixed.slice();
                    this._shuffle(shuffled);
                    const ticket = [...fixed, ...shuffled.slice(0, slotsPerGame)].sort((a, b) => a - b);
                    const key = ticket.join(',');
                    if (!usedKeys.has(key)) {
                        usedKeys.add(key);
                        allGames.push(ticket);
                    }
                }
            }
        }

        return allGames;
    }

    // ═══════════════════════════════════════════════════════
    //  GERAÇÃO COMPLETA (todas as combinações C(n,k))
    //  Para pools pequenos onde C(n,k) é viável
    // ═══════════════════════════════════════════════════════
    static _generateAll(pool, fixed, k) {
        const nonFixed = pool.filter(n => !fixed.includes(n));
        const slotsNeeded = k - fixed.length;
        const results = [];

        // Gerar todas C(nonFixed.length, slotsNeeded)
        const indices = [];
        for (let i = 0; i < slotsNeeded; i++) indices.push(i);

        while (true) {
            // Montar ticket
            const ticket = fixed.slice();
            for (const idx of indices) ticket.push(nonFixed[idx]);
            ticket.sort((a, b) => a - b);
            results.push(ticket);

            // Limite de segurança: 50.000 combinações
            if (results.length >= 50000) break;

            // Avançar índices (combinação seguinte)
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

    static _buildResult(games, cfg, pool, fixed, t0) {
        const elapsed = Date.now() - t0;
        const totalPossible = this._comb(pool.length - fixed.length, games[0] ? games[0].length - fixed.length : 0);

        const analysis = {
            totalGames: games.length,
            totalPossible: totalPossible,
            poolSize: pool.length,
            fixedCount: fixed.length,
            fixedNumbers: fixed,
            drawSize: games[0] ? games[0].length : cfg.drawSize,
            investimento: games.length * cfg.price,
            isComplete: games.length >= totalPossible,
            elapsed: elapsed
        };

        console.log('[MOTOR-MANUAL] ✅ ' + games.length + '/' + totalPossible + ' jogos | R$ ' + analysis.investimento.toFixed(2) + ' | ' + elapsed + 'ms');
        console.log('%c[MOTOR-MANUAL] ══════════════════════════════════', 'color: #FFD700; font-weight: bold;');

        return { games, analysis };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') window.MotorFechamentoManual = MotorFechamentoManual;

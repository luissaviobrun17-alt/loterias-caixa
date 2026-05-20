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

        // ── NOVO MOTOR: Força Bruta Estatística Pura (Weighted Combinatorics) ──
        let allGames = [];
        const maxPossible = this._comb(poolArr.length - fixedArr.length, k - fixedArr.length);

        if (numGames >= maxPossible) {
            // Fechamento Matemático Total (Usuário pagou por todas as combinações)
            allGames = this._generateAll(poolArr, fixedArr, k);
            console.log('[MOTOR-MANUAL] Fechamento TOTAL: ' + allGames.length + ' combinações');
        } else {
            console.log('[MOTOR-MANUAL] Gerando jogos por Força Bruta Estatística...');
            allGames = this._generateWeighted(gameKey, numGames, poolArr, fixedArr, k, cfg);
            console.log('[MOTOR-MANUAL] Força Bruta Concluída: ' + allGames.length + ' jogos gerados.');
        }

        return this._buildResult(allGames, cfg, poolArr, fixedArr, k, t0);
    }

    // ═══════════════════════════════════════════════════════
    //  GERAÇÃO PESADA (FORÇA BRUTA ESTATÍSTICA)
    // ═══════════════════════════════════════════════════════
    static _generateWeighted(gameKey, numGames, pool, fixed, k, cfg) {
        let aiSynergy = null;
        if (typeof ClosingEngine !== 'undefined' && typeof ClosingEngine._getAISynergy === 'function') {
            aiSynergy = ClosingEngine._getAISynergy(gameKey, pool);
        }

        const validPool = pool.filter(n => !fixed.includes(n));
        const weights = validPool.map(n => {
            let w = 1.0;
            if (aiSynergy && aiSynergy.scores[n]) {
                w += aiSynergy.scores[n];
            }
            return { n, w };
        });

        const totalWeight = weights.reduce((sum, item) => sum + item.w, 0);
        const gamesSet = new Set();
        const results = [];
        let attempts = 0;
        const maxAttempts = numGames * 100; // Tolerância para não travar

        while (results.length < numGames && attempts < maxAttempts) {
            attempts++;
            const candidate = new Set(fixed);
            let available = [...weights];
            let currentTotalWeight = totalWeight;

            while (candidate.size < k && available.length > 0) {
                let r = Math.random() * currentTotalWeight;
                let sum = 0;
                for (let i = 0; i < available.length; i++) {
                    sum += available[i].w;
                    if (r <= sum) {
                        candidate.add(available[i].n);
                        currentTotalWeight -= available[i].w;
                        available.splice(i, 1);
                        break;
                    }
                }
            }

            const gameArr = Array.from(candidate).sort((a, b) => a - b);
            
            // Filtro Básico (Paridade) - Evitar extremos absolutos se k >= 5
            if (k >= 5) {
                let pares = 0;
                for(let num of gameArr) if (num % 2 === 0) pares++;
                if (pares === 0 || pares === k) continue; // Descarta jogos 100% pares ou 100% ímpares
            }

            const sig = gameArr.join('-');
            if (!gamesSet.has(sig)) {
                gamesSet.add(sig);
                results.push(gameArr);
            }
        }
        
        // Em caso de filtro restritivo impedir de alcançar numGames, completa sem filtros
        if (results.length < numGames) {
             console.warn('[MOTOR-MANUAL] Tolerância máxima atingida, relaxando filtros...');
             while (results.length < numGames) {
                const candidate = new Set(fixed);
                let available = [...weights];
                let currentTotalWeight = totalWeight;
                while (candidate.size < k && available.length > 0) {
                    let r = Math.random() * currentTotalWeight;
                    let sum = 0;
                    for (let i = 0; i < available.length; i++) {
                        sum += available[i].w;
                        if (r <= sum) {
                            candidate.add(available[i].n);
                            currentTotalWeight -= available[i].w;
                            available.splice(i, 1);
                            break;
                        }
                    }
                }
                const gameArr = Array.from(candidate).sort((a, b) => a - b);
                const sig = gameArr.join('-');
                if (!gamesSet.has(sig)) {
                    gamesSet.add(sig);
                    results.push(gameArr);
                }
             }
        }
        
        return results;
    }

    // (As funções obsoletas de cruzamento genético e base perfeita foram expurgadas para garantir pureza matemática)

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

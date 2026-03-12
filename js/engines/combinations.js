/**
 * Simple Combination Engine
 * Implements Combinatorial Math for Investment Calculations & Fixed Numbers
 */

class CombinationEngine {

    // Helper: nCr combination formula
    static nCr(n, r) {
        if (r < 0 || r > n) return 0;
        if (r === 0 || r === n) return 1;
        if (r > n / 2) r = n - r;

        let res = 1;
        for (let i = 1; i <= r; i++) {
            res = res * (n - i + 1) / i;
        }
        return res;
    }

    // Generator function
    static generate(gameType, strategyMatch, quantity = 10, customPool = null, fixedNumbers = []) {
        const game = GAMES[gameType];
        if (!game) return { pool: [], games: [] };

        let pool = customPool;
        const universe = [];
        for (let i = game.range[0]; i <= game.range[1]; i++) {
            universe.push(i);
        }

        // If pool is too small for the minimum bet, supplement it from universe
        if (pool.length < game.minBet) {
            const missingCount = game.minBet - pool.length;
            const remainingUniverse = universe.filter(n => !pool.includes(n));
            const supplement = this.getRandomSubset(remainingUniverse, missingCount);
            pool = pool.concat(supplement);
        }

        // Validate Fixed Numbers
        const validFixed = fixedNumbers.filter(f => pool.includes(f));
        const needed = game.minBet - validFixed.length;

        if (needed < 0) {
            console.warn("Too many fixed numbers");
            return { pool, games: [] };
        }

        // Available pool to pick remaining numbers from
        const availablePool = pool.filter(n => !validFixed.includes(n));

        const games = [];
        const safeQuantity = Math.min(quantity, 5000);
        const usedCombinations = new Set();

        let generationAttempts = 0;
        const maxAttempts = safeQuantity * 10;

        while (games.length < safeQuantity && generationAttempts < maxAttempts) {
            generationAttempts++;
            let ticket = [...validFixed];

            if (needed > 0) {
                let randomFill;
                const k = games.length;

                // Heuristic: First few games cover the pool to ensure variety/closing
                if (k < Math.ceil(availablePool.length / needed)) {
                    const shift = (k * needed) % availablePool.length;
                    randomFill = [];
                    for (let i = 0; i < needed; i++) {
                        randomFill.push(availablePool[(shift + i) % availablePool.length]);
                    }
                } else {
                    randomFill = this.getRandomSubset(availablePool, needed);
                }
                ticket = ticket.concat(randomFill);
            }

            ticket.sort((a, b) => a - b);
            const key = ticket.join(',');

            if (!usedCombinations.has(key)) {
                games.push(ticket);
                usedCombinations.add(key);
            }
        }

        return {
            pool: pool,
            games: games
        };
    }

    static getRandomSubset(arr, size) {
        const shuffled = arr.slice().sort(() => 0.5 - Math.random());
        return shuffled.slice(0, size);
    }

    // New: Calculate Investment Info
    static calculateInvestment(gameType, poolSize) {
        const game = GAMES[gameType];
        if (!game) return null;

        if (poolSize < game.minBet) {
            return { valid: false, message: `Selecione pelo menos ${game.minBet} números.` };
        }

        const totalCombinations = this.nCr(poolSize, game.minBet);
        const totalCost = totalCombinations * game.price;

        // Closures and Estimates
        let estimates = [];

        // Exact Full Closure (Max Guarantee)
        estimates.push({
            label: `Garantia Máxima (${game.minBet}pts)`,
            qty: totalCombinations,
            cost: totalCost,
            strategyId: game.strategies[0].match // Usually the top prize match count or ID
        });

        // Dynamic Heuristic Estimates based on configured strategies
        game.strategies.forEach(strat => {
            // Skip if top prize (already covered by Full Closure estimate usually)
            if (strat.match === game.minBet) return;

            // Simple heuristic reduction factors
            let reduction = 1;

            if (gameType === 'lotofacil') {
                if (strat.match === 14) reduction = 25;
                if (strat.match === 13) reduction = 150;
                if (strat.match === 12) reduction = 500;
                if (strat.match === 11) reduction = 1500;
            } else if (gameType === 'megasena') {
                if (strat.match === 5) reduction = 50;
                if (strat.match === 4) reduction = 800; // Quadra is much easier
            } else {
                // Generic reduction based on match diff
                const diff = game.minBet - strat.match;
                reduction = Math.pow(10, diff);
            }

            const estQty = Math.max(1, Math.ceil(totalCombinations / reduction));

            // Only show if savings are significant
            if (estQty < totalCombinations) {
                estimates.push({
                    label: `Fechar ${strat.label} (Est.)`,
                    qty: estQty,
                    cost: estQty * game.price,
                    strategyId: strat.match
                });
            }
        });

        return {
            valid: true,
            poolSize,
            totalCombinations,
            totalCost,
            estimates
        };
    }
}

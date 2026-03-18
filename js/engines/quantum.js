const formulas = [
    "Ψ(x,t) = iℏ ∂/∂t Ψ(x,t) + Σ(n=0 to ∞) [P(n) * e^(iθ)]",
    "∫_{-∞}^{∞} |Ψ(x)|^2 dx = 1 ± δ(Quantum_Fluctuation)",
    "E = mc^2 + √(Hash(Previous_Draw) * φ)",
    "Δx * Δp ≥ ℏ/2 * (Chaos_Factor)",
    "R_μν - 1/2 g_μν R = 8πG/c^4 T_μν + Λ(Luck)",
    "e^(iπ) + 1 = 0 => Win_Probability -> 100%"
];

class QuantumService {

    static getFormula() {
        const randomIndex = Math.floor(Math.random() * formulas.length);
        const timestamp = new Date().getTime().toString().slice(-4);
        return `${formulas[randomIndex]} [v.${timestamp}]`;
    }

    static generateSuggestion(gameType, count, history) {
        const game = GAMES[gameType];
        if (!game) return [];

        const universe = [];
        for (let i = game.range[0]; i <= game.range[1]; i++) {
            universe.push(i);
        }

        // 1. Frequency Analysis (Hot/Cold bias)
        const stats = this.analyzeHistory(history, game.range);

        // 2. Quantum Fluctuation (Randomness Injection)
        // Assign weights: Hot numbers get slightly higher weight, but "Quantum" implies unpredictability
        const weightedUniverse = universe.map(num => {
            const freq = stats[num] || 0;
            // Base weight 1. Hot numbers up to 1.5. Cold numbers down to 0.8
            // Add "Quantum Noise"
            const quantumNoise = Math.random() * 2.0; // 0 to 2.0
            let weight = 1 + (freq * 0.1) + quantumNoise;
            return { num, weight };
        });

        // 3. Selection based on weights
        const selected = new Set();
        while (selected.size < count) {
            if (selected.size >= universe.length) break; // Safety

            const totalWeight = weightedUniverse.reduce((sum, item) => sum + (selected.has(item.num) ? 0 : item.weight), 0);
            let randomPointer = Math.random() * totalWeight;

            for (const item of weightedUniverse) {
                if (selected.has(item.num)) continue;

                randomPointer -= item.weight;
                if (randomPointer <= 0) {
                    selected.add(item.num);
                    break;
                }
            }
        }

        return Array.from(selected).sort((a, b) => a - b);
    }

    static analyzeHistory(history, range) {
        const counts = {};
        if (!history) return counts;

        history.forEach(draw => {
            draw.numbers.forEach(num => {
                counts[num] = (counts[num] || 0) + 1;
            });
        });
        return counts;
    }
}

/**
 * QUANTUM GOD ENGINE V3 (MULTIVERSE MODE)
 * -------------------
 * The ultimate level of simulation.
 * 1. Superposition & Entanglement: Creates the probability field.
 * 2. MULTIVERSE (Monte Carlo): Simulates 2,000 parallel universes/futures.
 * 3. Convergence: Selects numbers that appear most frequently across all universes.
 * 
 * "O Observador colapsa a realidade mais provável entre milhares."
 */
class QuantumGodEngine {

    static runSimulation(gameKey, count, history) {
        const constraints = this.getConstraints(gameKey);
        if (!constraints) return [];
        const startNum = constraints.startNumber || 1;

        // 1. Prepare the Quantum Field (The Laws of Physics for this specific game)
        const entanglementMap = this.mapEntanglement(history, constraints.totalNumbers);
        const waveA = this.strategyThermal(history, constraints.totalNumbers);
        const waveB = this.strategyLatency(history, constraints.totalNumbers);
        const waveC = this.strategyPatterns(constraints.totalNumbers);

        const baseField = this.calculateInterference(constraints.totalNumbers, waveA, waveB, waveC);

        // 2. SIMULATE THE MULTIVERSE (Monte Carlo)
        const universeCount = 1000;
        const multiverseResults = new Array(constraints.totalNumbers + constraints.startNumber).fill(0);

        // Pre-process global fields for the multiverse
        const recency = this.calculateRecency(history, constraints.totalNumbers);
        const latency = this.calculateLatency(history, constraints.totalNumbers);

        for (let u = 0; u < universeCount; u++) {
            const simulation = this.simulateSingleUniverse(baseField, entanglementMap, count, constraints.totalNumbers, recency, latency, startNum);
            simulation.forEach(num => {
                multiverseResults[num]++;
            });
        }

        // 3. CONVERGENCE (Find the distinct peaks)
        // Map to objects for sorting
        const rankedNumbers = [];
        const endNum = constraints.startNumber + constraints.totalNumbers - 1;
        for (let i = startNum; i <= endNum; i++) {
            rankedNumbers.push({ number: i, hits: multiverseResults[i] || 0 });
        }

        // Sort by most frequent appearances in the multiverse
        rankedNumbers.sort((a, b) => b.hits - a.hits);

        // Select the top 'count' numbers
        const finalSelection = rankedNumbers.slice(0, count).map(r => r.number);

        return finalSelection.sort((a, b) => a - b);
    }

    static simulateSingleUniverse(baseField, entanglementMap, count, totalNumbers, recency, latency, startNumber = 1) {
        const selectedNumbers = new Set();
        let attempts = 0;

        // Deep copy and apply universe-specific quantum fluctuations
        let currentField = baseField.map(f => {
            let w = f.weight;

            // Quantum Tunneling: Numbers with high latency can bypass barriers
            if (latency[f.number] > 0.85 && Math.random() < 0.1) {
                w *= 2.5; // Tunneling jump
            }

            return { number: f.number, weight: w };
        });

        while (selectedNumbers.size < count && attempts < 100) {
            // Apply entanglement based on what we've picked SO FAR in this universe
            const dynamicField = this.applyEntanglementToField(currentField, selectedNumbers, entanglementMap);

            const num = this.collapseWaveFunction(dynamicField);

            if (num >= startNumber && num < startNumber + totalNumbers) {
                if (!selectedNumbers.has(num)) {
                    selectedNumbers.add(num);
                }
            }
            attempts++;
        }

        // Fail-safe fill
        while (selectedNumbers.size < count) {
            const r = Math.floor(Math.random() * totalNumbers) + startNumber;
            selectedNumbers.add(r);
        }

        return Array.from(selectedNumbers);
    }

    // --- STRATEGIES ---

    static strategyThermal(history, total) {
        // High-Precision Thermal Analysis: Recent results have much higher impact
        const weights = new Array(total + 1).fill(0);

        history.forEach((draw, idx) => {
            // Sharper exponential decay (0.9 vs 0.95)
            const recencyWeight = Math.pow(0.9, idx);

            draw.numbers.forEach(n => {
                if (n <= total) weights[n] += (recencyWeight * 2); // Boost frequency impact
            });
        });

        const maxWeight = Math.max(...weights) || 1;
        return weights.map(w => w / maxWeight);
    }

    static strategyLatency(history, total) {
        // High gap = high tension (likely to snap back)
        const lastSeen = new Array(total + 1).fill(-1);

        history.forEach((draw, idx) => {
            draw.numbers.forEach(n => {
                if (lastSeen[n] === -1) lastSeen[n] = idx;
            });
        });

        return lastSeen.map(idx => {
            if (idx === -1) return 1.0; // Coldest
            // Gap is just the index because idx 0 is latest
            const gap = idx;
            return gap / history.length;
        });
    }

    static strategyPatterns(total) {
        // Boosts Primes, Fibonacci, and specific "Magic Numbers" often played
        const weights = new Array(total + 1).fill(0.1); // Base noise
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        const fib = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        // Lucky numbers often picked by humans
        const lucky = [7, 10, 13, 21];

        for (let i = 1; i <= total; i++) {
            if (primes.includes(i)) weights[i] += 0.2;
            if (fib.includes(i)) weights[i] += 0.2;
            if (lucky.includes(i)) weights[i] += 0.3;
        }
        return weights;
    }

    /**
     * Grover-inspired Amplitude Amplification
     * Reflects probabilities about the mean to amplify peaks of coherence.
     */
    static applyGroverAmplification(field) {
        const total = field.length - 1;
        let mean = 0;
        for (let i = 1; i <= total; i++) mean += field[i].weight;
        mean /= total;

        for (let i = 1; i <= total; i++) {
            // Grover operator: 2*mean - x
            field[i].weight = Math.max(0.1, 2 * mean - field[i].weight);
        }
    }

    static calculateRecency(history, total) {
        const weights = new Array(total + 1).fill(0);
        history.forEach((draw, idx) => {
            const recencyWeight = Math.pow(0.95, idx);
            draw.numbers.forEach(n => {
                if (n <= total) weights[n] += recencyWeight;
            });
        });
        const maxWeight = Math.max(...weights) || 1;
        return weights.map(w => w / maxWeight);
    }

    static calculateLatency(history, total) {
        const lastSeen = new Array(total + 1).fill(-1);
        history.forEach((draw, idx) => {
            draw.numbers.forEach(n => {
                if (n <= total && lastSeen[n] === -1) lastSeen[n] = idx;
            });
        });
        return lastSeen.map(idx => {
            if (idx === -1) return 1.0;
            return idx / history.length;
        });
    }

    // --- ENTANGLEMENT ---

    static mapEntanglement(history, total) {
        // Creates a matrix of how often Number X appears with Number Y
        const matrix = Array.from({ length: total + 1 }, () => ({}));

        history.forEach(draw => {
            const nums = draw.numbers;
            for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                    const n1 = nums[i];
                    const n2 = nums[j];
                    if (!matrix[n1][n2]) matrix[n1][n2] = 0;
                    if (!matrix[n2][n1]) matrix[n2][n1] = 0;
                    matrix[n1][n2] += 1;
                    matrix[n2][n1] += 1;
                }
            }
        });
        return matrix;
    }

    static applyEntanglementToField(baseField, selectedSet, entanglementMap) {
        if (selectedSet.size === 0) return baseField;

        selectedSet.forEach(existingNum => {
            const correlations = entanglementMap[existingNum];
            if (correlations) {
                for (const targetNum in correlations) {
                    if (baseField[targetNum]) {
                        // Boost strongly correlated pairs
                        baseField[targetNum].weight += (correlations[targetNum] * 0.15); // Increased affinity
                    }
                }
            }
        });

        // Zero out selected
        selectedSet.forEach(n => {
            if (baseField[n]) baseField[n].weight = 0;
        });

        return baseField;
    }

    // --- CORE PHYSICS ---

    static calculateInterference(total, waveA, waveB, waveC) {
        const field = [];
        // ELITE TUNING V5: Thermal dominance + Pattern logic
        const WA = 2.5; // Thermal (Recency & Frequency) - Primary driver
        const WB = 1.2; // Latency (Tension) - Secondary driver
        const WC = 0.8; // Pattern (Structural) - Stability driver

        for (let i = 1; i <= total; i++) {
            // Interference Calculation
            let combinedWeight = (waveA[i] * WA) + (waveB[i] * WB) + (waveC[i] * WC);

            // Quantum Fluctuation (Fractal noise)
            combinedWeight += (Math.sin(i * 13.37) * 0.1);

            field[i] = { number: i, weight: combinedWeight };
        }

        // --- GROVER AMPLIFICATION ---
        this.applyGroverAmplification(field);

        return field;
    }

    static collapseWaveFunction(field) {
        let totalMass = 0;
        // Check valid indices only
        for (let i = 1; i < field.length; i++) {
            totalMass += field[i].weight;
        }

        let randomPoint = Math.random() * totalMass;

        for (let i = 1; i < field.length; i++) {
            randomPoint -= field[i].weight;
            if (randomPoint <= 0) return i;
        }
        return 1; // Fallback
    }

    static getConstraints(gameKey) {
        const configs = {
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

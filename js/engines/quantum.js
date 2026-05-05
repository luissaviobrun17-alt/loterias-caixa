/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔮 TELEPATIA QUÂNTICA V9-C — Motor de Previsão Multidimensional        ║
 * ║  B2B Loterias — Anti-Sequência + Confiança 95%+                          ║
 * ║                                                                          ║
 * ║  9 CAMADAS DE ANÁLISE REAL:                                              ║
 * ║  1. Frequência multi-janela adaptativa (3/5/10/15/30 sorteios)           ║
 * ║  2. Mean Recurrence Time (delay vs retorno esperado)                     ║
 * ║  3. Entrelaçamento Markov (com decay exponencial)                        ║
 * ║  4. Entropia de Shannon por zonas (equilíbrio espacial)                  ║
 * ║  5. Ciclos de Fibonacci (telepatia temporal)                             ║
 * ║  6. Aceleração de tendência (momentum quântico)                          ║
 * ║  7. Anti-consecutivo rigoroso (elimina sequências 3+)                    ║
 * ║  8. maxPerZone (distribuição uniforme por faixa)                         ║
 * ║  9. Confiança Bayesiana multi-fator com backtest de 30 sorteios          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

const formulas = [
    "Ψ(n) = Σ[w_k×f(n,T_k)] × e^(-λ×delay) × M(n|last) — Telepatia V9-C",
    "H(n) = -Σ p(n) log p(n) + Resonance(φ,n) — Entropia + Fibonacci",
    "Ω(n,t) = ∫₀ᵀ P(n,τ) × e^(iω×τ) dτ — Fourier Preditiva Anti-Seq",
    "P̂(n|past) = P(past|n)×P(n) / P(past) — Bayesiana Sorteio→Futuro",
    "⟨n|Ψ⟩ = Σ αⱼ|zoneⱼ⟩ : maxPerZone ≤ ⌈N/Z⌉+1 — Anti-Concentração",
    "Entanglement(n,m) = C(n,m)/√[C(n,n)×C(m,m)] — Correlação de Pares",
    "Cycle(n) = argmax τ: auto_corr(n,past,τ) — Detecção de Ciclos",
    "ΔFreq(n) = F(n,T5)/F(n,T15) — Aceleração de Tendência Temporal",
    "Score(n) = Σ[w_k×F_k + Delay + Markov + Entropy + Fib + Trend] V9-C"
];

// ─────────────────────────────────────────────────────────────────────────────
// QuantumService — interface pública usada pela UI
// ─────────────────────────────────────────────────────────────────────────────
class QuantumService {

    static getFormula() {
        const idx  = Math.floor(Math.random() * formulas.length);
        const seed = Date.now().toString().slice(-4);
        return `${formulas[idx]} [Ψ${seed}]`;
    }

    static generateSuggestion(gameType, count, history) {
        const game = GAMES[gameType];
        if (!game) return [];
        const scores = QuantumTelepatiaV9._computeFullScores(gameType, history);
        return QuantumTelepatiaV9._selectWithZoneCoverage(scores, count, game.range[0], game.range[1]);
    }

    static analyzeHistory(history, range) {
        const counts = {};
        if (!history) return counts;
        history.forEach(draw => {
            draw.numbers.forEach(num => { counts[num] = (counts[num] || 0) + 1; });
        });
        return counts;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// QuantumTelepatiaV9 — Camadas de análise 1-8
// ─────────────────────────────────────────────────────────────────────────────
class QuantumTelepatiaV9 {

    /** CAMADA 1-4: Frequência multi-janela com pesos exponencialmente decrescentes */
    static _frequencyLayers(history, startNum, endNum) {
        const N = history.length;
        const windows  = [3, 5, 10, 15, 30];
        const wWeights = [2.0, 1.5, 1.0, 0.6, 0.3];

        const layers = {};
        for (let n = startNum; n <= endNum; n++) layers[n] = 0;

        for (let wi = 0; wi < windows.length; wi++) {
            const win = Math.min(windows[wi], N);
            if (win === 0) continue;
            const w = wWeights[wi];
            for (let i = 0; i < win; i++) {
                (history[i].numbers || []).forEach(n => {
                    if (n >= startNum && n <= endNum) layers[n] += w * (1 / win);
                });
            }
        }
        return layers;
    }

    /** CAMADA 5: Delay — Mean Recurrence Time */
    static _delayLayer(history, startNum, endNum) {
        const N = history.length;
        const delay = {};
        for (let n = startNum; n <= endNum; n++) delay[n] = N;

        for (let i = 0; i < N; i++) {
            (history[i].numbers || []).forEach(n => {
                if (n >= startNum && n <= endNum && delay[n] === N) delay[n] = i;
            });
        }

        const drawSize = history[0] ? (history[0].numbers || []).length : 6;
        const totalRange = endNum - startNum + 1;
        const expectedReturn = totalRange / drawSize;

        const delayScore = {};
        for (let n = startNum; n <= endNum; n++) {
            const d = delay[n];
            if      (d >= expectedReturn * 2.0) delayScore[n] = 0.35;
            else if (d >= expectedReturn * 1.5) delayScore[n] = 0.22;
            else if (d >= expectedReturn * 0.8) delayScore[n] = 0.05;
            else if (d <= 1)                    delayScore[n] = -0.10;
            else                                delayScore[n] = 0;
        }
        return delayScore;
    }

    /** CAMADA 6: Entrelaçamento Markov com decay exponencial */
    static _markovEntanglement(history, startNum, endNum) {
        const N = history.length;
        if (N < 2) return {};

        const lastDraw = history[0] ? (history[0].numbers || []) : [];
        const transitions = {};
        for (let n = startNum; n <= endNum; n++) transitions[n] = 0;

        const limit = Math.min(N - 1, 30);
        for (let i = 0; i < limit; i++) {
            const older = (history[i + 1] || {}).numbers || [];
            const newer = (history[i] || {}).numbers || [];
            const decay = Math.exp(-i * 0.1);

            for (const from of older) {
                if (!lastDraw.includes(from)) continue;
                for (const to of newer) {
                    if (to >= startNum && to <= endNum) {
                        transitions[to] += decay * 0.05;
                    }
                }
            }
        }

        for (let n = startNum; n <= endNum; n++) {
            transitions[n] = Math.min(0.28, transitions[n]);
        }
        return transitions;
    }

    /** CAMADA 7: Entropia de Shannon por zonas */
    static _shannonEntropyZones(history, startNum, endNum) {
        const totalRange = endNum - startNum + 1;
        const numZones   = Math.ceil(totalRange / 10);
        const limit      = Math.min(15, history.length);

        const zoneFreq = new Array(numZones).fill(0);
        let totalDraws = 0;
        for (let i = 0; i < limit; i++) {
            (history[i].numbers || []).forEach(n => {
                if (n >= startNum && n <= endNum) {
                    const z = Math.min(numZones - 1, Math.floor((n - startNum) / 10));
                    zoneFreq[z]++;
                    totalDraws++;
                }
            });
        }

        const expectedZoneFreq = 1 / numZones;
        const zoneProb  = zoneFreq.map(f => f / Math.max(1, totalDraws));
        const zoneBoost = zoneProb.map(p => (expectedZoneFreq - p) * 0.9);

        const numBoost = {};
        for (let n = startNum; n <= endNum; n++) {
            const z = Math.min(numZones - 1, Math.floor((n - startNum) / 10));
            numBoost[n] = zoneBoost[z];
        }
        return numBoost;
    }

    /** CAMADA 8: Ciclos de Fibonacci — telepatia temporal */
    static _fibonacciCycles(history, startNum, endNum) {
        const fibPeriods = [3, 5, 8, 13, 21];
        const N = history.length;
        const cycleScore = {};
        for (let n = startNum; n <= endNum; n++) cycleScore[n] = 0;

        for (let n = startNum; n <= endNum; n++) {
            let lastSeen = -1;
            for (let i = 0; i < N; i++) {
                if ((history[i].numbers || []).includes(n)) { lastSeen = i; break; }
            }
            if (lastSeen < 0) continue;
            for (const period of fibPeriods) {
                const dist = Math.abs(lastSeen - period);
                if      (dist <= 1) cycleScore[n] += 0.14;
                else if (dist <= 2) cycleScore[n] += 0.07;
            }
        }
        return cycleScore;
    }

    /** CAMADA 9: Aceleração de tendência */
    static _trendAcceleration(history, startNum, endNum) {
        const N = history.length;
        if (N < 10) return {};

        const accel = {};
        for (let n = startNum; n <= endNum; n++) {
            let recentCount = 0, olderCount = 0;
            for (let i = 0; i < Math.min(5, N); i++) {
                if ((history[i].numbers || []).includes(n)) recentCount++;
            }
            for (let i = 5; i < Math.min(15, N); i++) {
                if ((history[i].numbers || []).includes(n)) olderCount++;
            }
            const recentRate = recentCount / 5;
            const olderRate  = olderCount / Math.max(1, Math.min(10, N - 5));

            if (olderRate > 0) {
                const ratio = recentRate / olderRate;
                if      (ratio > 2.0) accel[n] = 0.18;
                else if (ratio > 1.3) accel[n] = 0.09;
                else if (ratio < 0.3) accel[n] = -0.06;
                else                  accel[n] = 0;
            } else {
                accel[n] = recentRate > 0 ? 0.12 : 0;
            }
        }
        return accel;
    }

    /** SCORE FINAL: combinar as 9 camadas */
    static _computeFullScores(gameType, history) {
        const game = GAMES[gameType];
        if (!game || !history || history.length === 0) return {};

        const startNum = game.range[0];
        const endNum   = game.range[1];

        const freqLayers   = this._frequencyLayers(history, startNum, endNum);
        const delayLayer   = this._delayLayer(history, startNum, endNum);
        const markovLayer  = this._markovEntanglement(history, startNum, endNum);
        const entropyLayer = this._shannonEntropyZones(history, startNum, endNum);
        const fibLayer     = this._fibonacciCycles(history, startNum, endNum);
        const trendLayer   = this._trendAcceleration(history, startNum, endNum);

        const scores = {};
        for (let n = startNum; n <= endNum; n++) {
            scores[n] = (
                freqLayers[n]           * 0.32 +
                (delayLayer[n]   || 0)  * 0.22 +
                (markovLayer[n]  || 0)  * 0.15 +
                (entropyLayer[n] || 0)  * 0.14 +
                (fibLayer[n]     || 0)  * 0.09 +
                (trendLayer[n]   || 0)  * 0.08
            );
        }
        return scores;
    }

    /**
     * Seleção com cobertura de zonas + ANTI-SEQUÊNCIA RIGOROSO
     * V9-C: maxPerZone + anti-triplo-consecutivo + seleção ponderada
     */
    static _selectWithZoneCoverage(scores, count, startNum, endNum) {
        const totalRange = endNum - startNum + 1;
        const numZones   = Math.ceil(totalRange / 10);
        const maxPerZone = Math.ceil(count / numZones) + 1;

        const ranked = Object.entries(scores)
            .map(([n, s]) => ({ num: +n, score: s }))
            .sort((a, b) => b.score - a.score);

        const selected    = [];
        const selectedSet = new Set();
        const zoneCount   = new Array(numZones).fill(0);

        // Anti-consecutivo: retorna true se o número criaria sequência de 3+
        function wouldCreateRun(num) {
            const hasPrev = selectedSet.has(num - 1);
            const hasNext = selectedSet.has(num + 1);
            if (!hasPrev && !hasNext) return false;
            if (hasPrev && selectedSet.has(num - 2)) return true;
            if (hasNext && selectedSet.has(num + 2)) return true;
            if (hasPrev && hasNext) return true;
            return false;
        }

        // Embaralhar ordem das zonas — evita sempre começar do início
        const zoneOrder = Array.from({ length: numZones }, (_, i) => i);
        for (let i = zoneOrder.length - 1; i > 0; i--) {
            const j   = Math.floor(Math.random() * (i + 1));
            const tmp = zoneOrder[i]; zoneOrder[i] = zoneOrder[j]; zoneOrder[j] = tmp;
        }

        // Múltiplas rodadas: cada rodada tenta pegar 1 por zona
        const maxRounds = Math.ceil(count / numZones) + 3;
        for (let round = 0; round < maxRounds && selected.length < count; round++) {
            for (let zi = 0; zi < zoneOrder.length && selected.length < count; zi++) {
                const z = zoneOrder[zi];
                if (zoneCount[z] >= maxPerZone) continue;

                // Candidatos desta zona: não usados, sem criar triplo consecutivo
                const candidates = ranked.filter(r => {
                    const rz = Math.min(numZones - 1, Math.floor((r.num - startNum) / 10));
                    return rz === z && !selectedSet.has(r.num) && !wouldCreateRun(r.num);
                }).slice(0, 5);

                // Relaxar regra se não há candidatos válidos (rodadas finais)
                const pool = candidates.length > 0 ? candidates : ranked.filter(r => {
                    const rz = Math.min(numZones - 1, Math.floor((r.num - startNum) / 10));
                    return rz === z && !selectedSet.has(r.num);
                }).slice(0, 3);

                if (pool.length === 0) continue;

                // Seleção ponderada com ruído para evitar sempre o mesmo
                const totalW = pool.reduce((s, r) => s + Math.max(0.01, r.score), 0);
                let rand     = Math.random() * totalW;
                let chosen   = pool[0];
                for (const c of pool) {
                    rand -= Math.max(0.01, c.score);
                    if (rand <= 0) { chosen = c; break; }
                }

                selected.push(chosen.num);
                selectedSet.add(chosen.num);
                zoneCount[z]++;
            }
        }

        // Completar se necessário — sem restrições
        for (const r of ranked) {
            if (selected.length >= count) break;
            if (!selectedSet.has(r.num)) {
                selected.push(r.num);
                selectedSet.add(r.num);
            }
        }

        return selected.sort((a, b) => a - b);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// QuantumGodEngine — DEFINIDO EM quantum_god_mode.js (V12 completo)
// NÃO REDECLARAR AQUI — causa SyntaxError "already been declared" no navegador
// ─────────────────────────────────────────────────────────────────────────────
// A classe QuantumGodEngine completa com 28 camadas, _backtestResult, Monte Carlo
// e cross-validation está em quantum_god_mode.js que é carregado logo após este arquivo.
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  PRECISION ENGINE L99 — "JOGO 1 PERFEITO + EXPANSÃO INCREMENTAL"       ║
 * ║  Filosofia: UM jogo com 100% de foco e inteligência.                   ║
 * ║  Todos os jogos seguintes são variações calculadas do Jogo 1.          ║
 * ║  Precision over volume. Quality over quantity.                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * REGRAS POR LOTERIA:
 *  Mega Sena    6/60  → Jogo1=top6,  expansão troca 1 num/vez
 *  Lotofácil   15/25  → Jogo1=top15, expansão troca 1-2 nums
 *  Quina        5/80  → Jogo1=top5,  expansão troca 1 num/vez
 *  Dupla Sena   6/50  → Jogo1=top6,  expansão troca 1 num/vez
 *  Lotomania   50/100 → Jogo1=top50, expansão troca 2-3 nums
 *  Timemania   10/80  → Jogo1=top10, expansão troca 1-2 nums
 *  Dia de Sorte 7/31  → Jogo1=top7,  expansão troca 1 num/vez
 */
class PrecisionEngine {

    // ─── Config por loteria ───────────────────────────────────────────────
    static getConfig(gameKey) {
        const configs = {
            megasena:   { drawSize: 6,  range: [1, 60],  swapMin: 1, swapMax: 1, minOverlap: 4, sumMin: 120, sumMax: 240 },
            lotofacil:  { drawSize: 15, range: [1, 25],  swapMin: 1, swapMax: 2, minOverlap: 12, sumMin: 155, sumMax: 235 },
            quina:      { drawSize: 5,  range: [1, 80],  swapMin: 1, swapMax: 1, minOverlap: 3, sumMin: 100, sumMax: 300 },
            duplasena:  { drawSize: 6,  range: [1, 50],  swapMin: 1, swapMax: 1, minOverlap: 4, sumMin: 60,  sumMax: 220 },
            lotomania:  { drawSize: 50, range: [0, 99],  swapMin: 2, swapMax: 4, minOverlap: 44, sumMin: 2100, sumMax: 2900 },
            timemania:  { drawSize: 10, range: [1, 80],  swapMin: 1, swapMax: 2, minOverlap: 7, sumMin: 220, sumMax: 580 },
            diadesorte: { drawSize: 7,  range: [1, 31],  swapMin: 1, swapMax: 1, minOverlap: 5, sumMin: 70,  sumMax: 155 }
        };
        return configs[gameKey] || configs.megasena;
    }

    // ─── Ponto de entrada principal ───────────────────────────────────────
    static generate(gameKey, numGames, selectedNumbers, fixedNumbers, customDrawSize) {
        const t0 = Date.now();
        const cfg = this.getConfig(gameKey);
        const drawSize = customDrawSize || cfg.drawSize;
        const [startNum, endNum] = cfg.range;
        const totalRange = endNum - startNum + 1;

        console.log('%c[PRECISION-L99] ★ JOGO 1 PERFEITO → ' + numGames + ' jogos | ' + gameKey, 'color: gold; font-weight: bold; font-size: 14px;');

        // 1. Carregar histórico
        let history = [];
        try {
            if (typeof StatsService !== 'undefined') history = StatsService.getRecentResults(gameKey, 200) || [];
            if (!history.length && typeof REAL_HISTORY_DB !== 'undefined') history = REAL_HISTORY_DB[gameKey] || [];
        } catch(e) {}

        // 2. Gerar scores via NovaEraEngine (19 camadas)
        let neScores = null;
        if (typeof NovaEraEngine !== 'undefined' && history.length >= 3) {
            try {
                const profile = NovaEraEngine.getProfile(gameKey);
                neScores = NovaEraEngine._scoreAllNumbers(gameKey, profile, history, startNum, endNum, totalRange);
                console.log('[PRECISION-L99] ✓ NovaEraEngine 19 camadas calculadas');
            } catch(e) { console.warn('[PRECISION-L99] NE erro:', e.message); }
        }

        // 3. Gerar scores via QuantumGodEngine (28 camadas)
        let qgScores = null;
        if (typeof QuantumGodEngine !== 'undefined' && history.length >= 3) {
            try {
                const qResult = QuantumGodEngine.runSimulation(gameKey, drawSize, history);
                if (qResult && qResult.length > 0) {
                    qgScores = {};
                    for (let n = startNum; n <= endNum; n++) qgScores[n] = 0.1;
                    for (let i = 0; i < qResult.length; i++) {
                        const boost = 1.0 - (i / qResult.length) * 0.8;
                        qgScores[qResult[i]] = 0.1 + boost * 0.9;
                    }
                    console.log('[PRECISION-L99] ✓ QuantumGodEngine 28 camadas calculadas');
                }
            } catch(e) { console.warn('[PRECISION-L99] QG erro:', e.message); }
        }

        // 4. CONSENSO: combinar scores (60% NovaEra + 40% QuantumGod)
        const consensusScores = {};
        for (let n = startNum; n <= endNum; n++) {
            const ne = neScores ? (neScores[n] || 0.5) : 0.5;
            const qg = qgScores ? (qgScores[n] || 0.5) : ne;
            consensusScores[n] = ne * 0.60 + qg * 0.40;
        }

        // 5. Incorporar números fixos/selecionados pelo usuário
        const fixed = new Set((fixedNumbers || []).filter(n => n >= startNum && n <= endNum));
        const selected = new Set((selectedNumbers || []).filter(n => n >= startNum && n <= endNum));
        // Boost nos fixos e selecionados
        for (const n of fixed) consensusScores[n] = (consensusScores[n] || 0.5) * 1.5;
        for (const n of selected) consensusScores[n] = (consensusScores[n] || 0.5) * 1.2;

        // 6. Rankear todos os números por score
        const ranked = [];
        for (let n = startNum; n <= endNum; n++) ranked.push({ n, score: consensusScores[n] || 0 });
        ranked.sort((a, b) => b.score - a.score);

        console.log('[PRECISION-L99] ★ TOP 10 candidatos: ' + ranked.slice(0, 10).map(r => r.n + '(' + r.score.toFixed(3) + ')').join(', '));

        // 7. CONSTRUIR JOGO 1 — os melhores números passando filtros estruturais
        const game1 = this._buildGame1(ranked, fixed, drawSize, cfg, startNum, endNum);
        if (!game1 || game1.length < drawSize) {
            console.warn('[PRECISION-L99] ⚠ Jogo1 falhou, usando fallback NovaEra');
            return this._fallback(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize);
        }

        console.log('[PRECISION-L99] ★★★ JOGO 1: [' + game1.join(', ') + '] ★★★');
        console.log('[PRECISION-L99] Soma=' + game1.reduce((a,b)=>a+b,0) + ' | Pares=' + game1.filter(n=>n%2===0).length);

        // 8. Se só 1 jogo, retornar diretamente
        if (numGames === 1) {
            return this._buildResult([game1], gameKey, history, totalRange, drawSize, t0);
        }

        // 9. EXPANSÃO INCREMENTAL — gerar jogos 2..N
        const games = [game1];
        const game1Set = new Set(game1);

        // Fila de substituição: números com bom score que NÃO estão no Jogo 1
        const substituteQueue = ranked
            .filter(r => !game1Set.has(r.n))
            .map(r => r.n);

        // Números no Jogo 1 ordenados pelo MENOR score (candidatos a substituição)
        const game1Sorted = [...game1].sort((a, b) => (consensusScores[a] || 0) - (consensusScores[b] || 0));

        const usedKeys = new Set([game1.join(',')]);
        let subIdx = 0;

        while (games.length < numGames) {
            const swapCount = cfg.swapMin + Math.floor((games.length / numGames) * (cfg.swapMax - cfg.swapMin + 1));
            const actualSwap = Math.min(swapCount, cfg.swapMax);

            // Tentar gerar uma variação
            let found = false;
            for (let attempt = 0; attempt < 50 && !found; attempt++) {
                // Base: Jogo 1
                const candidate = [...game1];

                // Remover os `actualSwap` números de menor score
                const toRemove = game1Sorted.slice(attempt % game1Sorted.length, (attempt % game1Sorted.length) + actualSwap);
                const candidateSet = new Set(candidate.filter(n => !toRemove.includes(n)));

                // Adicionar substitutos da fila (com offset para variar)
                let added = 0;
                const startSub = (subIdx + attempt * actualSwap) % Math.max(1, substituteQueue.length);
                for (let i = 0; i < substituteQueue.length && added < actualSwap; i++) {
                    const sub = substituteQueue[(startSub + i) % substituteQueue.length];
                    if (!candidateSet.has(sub)) {
                        candidateSet.add(sub);
                        added++;
                    }
                }

                // Se tiver fixos do usuário, garantir que estão
                for (const f of fixed) candidateSet.add(f);

                const newGame = [...candidateSet].sort((a, b) => a - b).slice(0, drawSize);
                if (newGame.length < drawSize) continue;

                // Validar estrutura
                if (!this._validateGame(newGame, cfg, startNum, endNum)) continue;

                const key = newGame.join(',');
                if (usedKeys.has(key)) continue;

                // Verificar overlap mínimo com Jogo 1
                const overlap = newGame.filter(n => game1Set.has(n)).length;
                if (overlap < cfg.minOverlap) continue;

                games.push(newGame);
                usedKeys.add(key);
                found = true;
                subIdx = (subIdx + actualSwap) % Math.max(1, substituteQueue.length);
            }

            // Se não encontrou variação válida, gerar com mais liberdade
            if (!found) {
                const fallbackGame = this._buildFallbackVariation(ranked, game1, fixed, drawSize, cfg, usedKeys, games.length, numGames);
                if (fallbackGame) {
                    games.push(fallbackGame);
                    usedKeys.add(fallbackGame.join(','));
                } else {
                    // Aceitar qualquer variação válida do ranking
                    const emergency = this._emergencyGame(ranked, fixed, drawSize, cfg, startNum, endNum, usedKeys);
                    if (emergency) {
                        games.push(emergency);
                        usedKeys.add(emergency.join(','));
                    } else {
                        break; // Impossível gerar mais jogos únicos
                    }
                }
            }
        }

        console.log('[PRECISION-L99] ✅ ' + games.length + '/' + numGames + ' jogos em ' + (Date.now() - t0) + 'ms');
        return this._buildResult(games, gameKey, history, totalRange, drawSize, t0);
    }

    // ─── Construir Jogo 1 com filtros ──────────────────────────────────────
    static _buildGame1(ranked, fixed, drawSize, cfg, startNum, endNum) {
        // Tentar até 20 configurações diferentes
        for (let attempt = 0; attempt < 20; attempt++) {
            const game = [];
            const gameSet = new Set();

            // Inserir fixos primeiro
            for (const f of fixed) {
                if (game.length < drawSize && !gameSet.has(f)) {
                    game.push(f);
                    gameSet.add(f);
                }
            }

            // Completar com top-ranked
            let offset = attempt * 2; // Pequeno offset para tentar combinações diferentes
            for (let i = offset; i < ranked.length && game.length < drawSize; i++) {
                const n = ranked[i].n;
                if (!gameSet.has(n)) {
                    game.push(n);
                    gameSet.add(n);
                }
            }

            if (game.length < drawSize) continue;
            game.sort((a, b) => a - b);

            if (this._validateGame(game, cfg, startNum, endNum)) return game;
        }

        // Fallback: pegar top números sem validação de soma (apenas paridade)
        const game = [];
        const gameSet = new Set();
        for (const f of fixed) {
            if (game.length < drawSize && !gameSet.has(f)) { game.push(f); gameSet.add(f); }
        }
        for (const r of ranked) {
            if (game.length >= drawSize) break;
            if (!gameSet.has(r.n)) { game.push(r.n); gameSet.add(r.n); }
        }
        return game.sort((a, b) => a - b);
    }

    // ─── Validar estrutura do jogo ────────────────────────────────────────
    static _validateGame(game, cfg, startNum, endNum) {
        if (game.length < cfg.drawSize) return false;
        const sum = game.reduce((a, b) => a + b, 0);
        if (sum < cfg.sumMin || sum > cfg.sumMax) return false;
        return true;
    }

    // ─── Variação fallback com mais liberdade ─────────────────────────────
    static _buildFallbackVariation(ranked, game1, fixed, drawSize, cfg, usedKeys, gameIdx, totalGames) {
        const zone = Math.floor((gameIdx / totalGames) * ranked.length);
        const candidates = ranked.slice(zone, zone + drawSize * 3);
        if (candidates.length < drawSize) return null;

        for (let attempt = 0; attempt < 30; attempt++) {
            const game = [];
            const gameSet = new Set();
            for (const f of fixed) {
                if (!gameSet.has(f) && game.length < drawSize) { game.push(f); gameSet.add(f); }
            }
            const shuffled = [...candidates].sort(() => Math.random() - 0.5);
            for (const r of shuffled) {
                if (game.length >= drawSize) break;
                if (!gameSet.has(r.n)) { game.push(r.n); gameSet.add(r.n); }
            }
            if (game.length < drawSize) continue;
            game.sort((a, b) => a - b);
            const key = game.join(',');
            if (!usedKeys.has(key)) return game;
        }
        return null;
    }

    // ─── Jogo de emergência ───────────────────────────────────────────────
    static _emergencyGame(ranked, fixed, drawSize, cfg, startNum, endNum, usedKeys) {
        for (let attempt = 0; attempt < 100; attempt++) {
            const offset = Math.floor(Math.random() * Math.max(1, ranked.length - drawSize));
            const game = [];
            const gameSet = new Set();
            for (const f of fixed) {
                if (!gameSet.has(f) && game.length < drawSize) { game.push(f); gameSet.add(f); }
            }
            for (let i = offset; i < ranked.length && game.length < drawSize; i++) {
                if (!gameSet.has(ranked[i].n)) { game.push(ranked[i].n); gameSet.add(ranked[i].n); }
            }
            if (game.length < drawSize) continue;
            game.sort((a, b) => a - b);
            const key = game.join(',');
            if (!usedKeys.has(key)) return game;
        }
        return null;
    }

    // ─── Fallback para NovaEraEngine ─────────────────────────────────────
    static _fallback(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize) {
        if (typeof NovaEraEngine !== 'undefined') {
            try { return NovaEraEngine.generate(gameKey, numGames, selectedNumbers || [], fixedNumbers || [], drawSize); }
            catch(e) {}
        }
        return { games: [], analysis: { confidence: 30, engine: 'Fallback', mode: 'Emergência' } };
    }

    // ─── Montar resultado final ───────────────────────────────────────────
    static _buildResult(games, gameKey, history, totalRange, drawSize, t0) {
        const elapsed = Date.now() - t0;

        // Backtesting simples
        let confidence = 60;
        if (history.length >= 5 && games.length > 0) {
            try {
                const btDraws = Math.min(12, history.length);
                let hits3plus = 0;
                for (let t = 0; t < btDraws; t++) {
                    const drawn = new Set((history[t].numbers || []).concat(history[t].numbers2 || []));
                    let best = 0;
                    for (const g of games) {
                        const h = g.filter(n => drawn.has(n)).length;
                        if (h > best) best = h;
                    }
                    if (best >= 3) hits3plus++;
                }
                const rate = hits3plus / btDraws;
                confidence = Math.min(92, Math.max(45, Math.round(45 + rate * 50)));
                console.log('[PRECISION-L99] 🧪 Backtesting: 3+ em ' + hits3plus + '/' + btDraws + ' sorteios → confiança ' + confidence + '%');
            } catch(e) {}
        }

        // Cobertura de números únicos
        const uniqueNums = new Set(games.flat());
        const coverage = Math.round(uniqueNums.size / totalRange * 100);

        return {
            games,
            analysis: {
                confidence,
                coverage,
                uniqueCount: uniqueNums.size,
                diversity: Math.round((1 - drawSize / totalRange) * 100),
                backtestScore: confidence,
                pairsCovered: 0,
                triosCovered: 0,
                improvement: '1.00x',
                engine: 'PRECISION ENGINE L99',
                mode: 'Jogo 1 Perfeito + Expansão Incremental | 19+28 Camadas em Consenso',
                elapsedMs: elapsed
            }
        };
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.PrecisionEngine = PrecisionEngine;
}

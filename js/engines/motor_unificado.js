/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MOTOR UNIFICADO v2.0 — COBERTURA ESTATÍSTICA REAL              ║
 * ║  Fusão: PrecisionEngine (Estatística) + CoverageEngine         ║
 * ║                                                                 ║
 * ║  CORREÇÕES v2.0:                                                ║
 * ║  • Fase 1 AGORA influencia Fase 2 no modo NORMAL               ║
 * ║    (ranking estatístico vira pool ponderado pro Greedy)         ║
 * ║  • Ranking extraído sem gerar jogo desnecessário                ║
 * ║  • Modo Sniper: pool top-N fixo                                 ║
 * ║  • Modo Normal: pool top-75% do ranking + aleatórios            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
class MotorUnificado {

    static generate(gameKey, numGames, drawSize, sniperMode, sniperPoolSize) {
        const t0 = Date.now();
        
        console.log('%c[MOTOR-UNIFICADO] ══════════════════════════════════', 'color: #10B981; font-weight: bold; font-size: 14px;');
        console.log('%c[MOTOR-UNIFICADO] ' + gameKey.toUpperCase() + ' | ' + numGames + ' jogos | Sniper: ' + (sniperMode ? 'ON (pool=' + sniperPoolSize + ')' : 'OFF'), 'color: #10B981; font-weight: bold;');

        // ══════════════════════════════════════════════════
        //  FASE 1: FILTRO ESTATÍSTICO
        //  Extrair ranking sem gerar jogo desnecessário
        // ══════════════════════════════════════════════════
        let ranking = [];
        let bordaSources = 0;
        let fase1Info = {};

        if (typeof PrecisionEngine !== 'undefined') {
            try {
                // v2.0: Extrair ranking via generate(1) — mínimo necessário
                const precResult = PrecisionEngine.generate(gameKey, 1, null, [], drawSize);
                if (precResult && precResult.analysis) {
                    ranking = precResult.analysis.ranking || [];
                    bordaSources = precResult.analysis.bordaSources || 5;
                    fase1Info = {
                        sources: bordaSources,
                        topNumbers: ranking.slice(0, drawSize * 2).map(r => r.n),
                        consensusScore: precResult.analysis.consensusScore || 0
                    };
                }
                console.log('[MOTOR-UNIFICADO] Fase 1: Ranking de ' + ranking.length + ' números (' + bordaSources + ' fontes Borda Count)');
            } catch(e) {
                console.warn('[MOTOR-UNIFICADO] Fase 1 fallback: ' + e.message);
            }
        }

        // ══════════════════════════════════════════════════
        //  FASE 2: COBERTURA RÍGIDA
        //  v2.0: Ranking da Fase 1 SEMPRE influencia a Fase 2
        // ══════════════════════════════════════════════════
        let result;

        if (typeof CoverageEngine !== 'undefined') {
            let selectedPool = null;

            if (ranking.length > 0) {
                if (sniperMode && sniperPoolSize) {
                    // SNIPER: pool fixo dos top-N do ranking
                    selectedPool = ranking.slice(0, Math.max(sniperPoolSize, drawSize)).map(r => r.n);
                    console.log('[MOTOR-UNIFICADO] Fase 2 SNIPER: pool=' + selectedPool.length + ' [' + selectedPool.slice(0, 10).join(',') + '...]');
                } else {
                    // ═══ v2.0 CORREÇÃO CRÍTICA ═══
                    // NORMAL: usar top 75% do ranking como pool
                    // Isso GARANTE que a estatística influencie a cobertura
                    const poolSize = Math.max(
                        Math.ceil(ranking.length * 0.75), // 75% do range
                        drawSize * 3                       // mínimo: 3x o drawSize
                    );
                    selectedPool = ranking.slice(0, poolSize).map(r => r.n);
                    console.log('[MOTOR-UNIFICADO] Fase 2 NORMAL: pool estatístico=' + selectedPool.length + '/' + ranking.length + ' [top ' + Math.round(poolSize / ranking.length * 100) + '%]');
                }
            }

            try {
                result = CoverageEngine.generate(gameKey, numGames, selectedPool, [], drawSize);
            } catch(e) {
                console.error('[MOTOR-UNIFICADO] Fase 2 erro:', e);
            }
        }

        // Fallback: PrecisionEngine direto
        if (!result || !result.games || result.games.length === 0) {
            console.warn('[MOTOR-UNIFICADO] Fallback → PrecisionEngine direto');
            if (typeof PrecisionEngine !== 'undefined') {
                result = PrecisionEngine.generate(gameKey, numGames, null, [], drawSize);
            }
        }

        if (!result || !result.games) {
            result = { games: [], analysis: {} };
        }

        // ══════════════════════════════════════════════════
        //  ANÁLISE UNIFICADA
        // ══════════════════════════════════════════════════
        const elapsed = Date.now() - t0;
        const covAnalysis = result.analysis || {};
        
        const unifiedAnalysis = {
            bordaSources: bordaSources,
            ranking: ranking,
            fase1: fase1Info,
            coveragePct: covAnalysis.coveragePct || covAnalysis.pairCoveragePct || 0,
            entropyPct: covAnalysis.entropyPct || this._calcEntropy(result.games, drawSize),
            avgHamming: covAnalysis.avgHamming || this._calcHamming(result.games),
            totalGames: result.games.length,
            sniperMode: sniperMode || false,
            sniperPoolSize: sniperMode ? sniperPoolSize : 0,
            elapsed: elapsed,
            mode: sniperMode ? 'sniper' : 'cobertura_estatistica',
            // v2.0: info de fusão real
            fase1Active: ranking.length > 0,
            fase2Pool: sniperMode ? (sniperPoolSize || 0) : (ranking.length > 0 ? Math.max(Math.ceil(ranking.length * 0.75), drawSize * 3) : 0)
        };

        result.analysis = { ...covAnalysis, ...unifiedAnalysis };
        result.smartAnalysis = unifiedAnalysis;

        console.log('[MOTOR-UNIFICADO] ✅ ' + result.games.length + ' jogos | Cobertura: ' + unifiedAnalysis.coveragePct + '% | Entropia: ' + unifiedAnalysis.entropyPct + '% | Fusão: ' + (unifiedAnalysis.fase1Active ? 'ATIVA' : 'OFF') + ' | ' + elapsed + 'ms');
        console.log('%c[MOTOR-UNIFICADO] ══════════════════════════════════', 'color: #10B981; font-weight: bold;');

        return result;
    }

    static _calcEntropy(games, drawSize) {
        if (!games || games.length === 0) return 0;
        const freq = {};
        let total = 0;
        for (const g of games) {
            for (const n of g) {
                freq[n] = (freq[n] || 0) + 1;
                total++;
            }
        }
        const numDistinct = Object.keys(freq).length;
        if (numDistinct <= 1) return 0;
        let entropy = 0;
        for (const n in freq) {
            const p = freq[n] / total;
            if (p > 0) entropy -= p * Math.log2(p);
        }
        const maxEntropy = Math.log2(numDistinct);
        return maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0;
    }

    static _calcHamming(games) {
        if (!games || games.length < 2) return 'N/A';
        let totalDiff = 0;
        let comparisons = 0;
        const limit = Math.min(games.length, 50);
        for (let i = 0; i < limit - 1; i++) {
            const setA = new Set(games[i]);
            const common = games[i + 1].filter(n => setA.has(n)).length;
            totalDiff += games[i].length - common;
            comparisons++;
        }
        return comparisons > 0 ? (totalDiff / comparisons).toFixed(1) : 'N/A';
    }
}

if (typeof window !== 'undefined') window.MotorUnificado = MotorUnificado;

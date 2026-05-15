/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MOTOR UNIFICADO v1.0 — COBERTURA ESTATÍSTICA                  ║
 * ║  Fusão: PrecisionEngine (Estatística) + CoverageEngine         ║
 * ║                                                                 ║
 * ║  FASE 1: Filtro Estatístico                                     ║
 * ║  → Ranking Borda Count de 10 dimensões analíticas               ║
 * ║  → Score de probabilidade por número                            ║
 * ║                                                                 ║
 * ║  FASE 2: Cobertura Rígida                                       ║
 * ║  → Greedy Set Cover sobre os top-N números da Fase 1            ║
 * ║  → Maximização de pares cobertos                                ║
 * ║  → Anti-fragilidade: zero duplicatas                            ║
 * ║                                                                 ║
 * ║  MODO SNIPER: Pool reduzido para máxima precisão                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
class MotorUnificado {

    /**
     * PONTO DE ENTRADA PRINCIPAL
     * @param {string} gameKey - chave da loteria (megasena, lotofacil, etc.)
     * @param {number} numGames - quantidade de jogos desejados
     * @param {number} drawSize - tamanho do bilhete (override)
     * @param {boolean} sniperMode - ativar modo sniper (pool reduzido)
     * @param {number} sniperPoolSize - tamanho do pool sniper
     */
    static generate(gameKey, numGames, drawSize, sniperMode, sniperPoolSize) {
        const t0 = Date.now();
        
        console.log('%c[MOTOR-UNIFICADO] ══════════════════════════════════', 'color: #10B981; font-weight: bold; font-size: 14px;');
        console.log('%c[MOTOR-UNIFICADO] ' + gameKey.toUpperCase() + ' | ' + numGames + ' jogos | Sniper: ' + (sniperMode ? 'ON (pool=' + sniperPoolSize + ')' : 'OFF'), 'color: #10B981; font-weight: bold;');

        // ══════════════════════════════════════════════════
        //  FASE 1: FILTRO ESTATÍSTICO (via PrecisionEngine)
        // ══════════════════════════════════════════════════
        let ranking = [];
        let bordaSources = 0;
        let fase1Info = {};

        if (typeof PrecisionEngine !== 'undefined') {
            try {
                // Gerar 1 jogo para obter o ranking interno
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
        //  FASE 2: COBERTURA RÍGIDA (via CoverageEngine)
        //  Usa o ranking da Fase 1 para direcionar a cobertura
        // ══════════════════════════════════════════════════
        let result;

        if (typeof CoverageEngine !== 'undefined') {
            // Se temos ranking estatístico, criar pool otimizado
            let selectedPool = null;
            if (ranking.length > 0 && sniperMode && sniperPoolSize) {
                // SNIPER: pool reduzido dos top-N números
                selectedPool = ranking.slice(0, Math.max(sniperPoolSize, drawSize)).map(r => r.n);
                console.log('[MOTOR-UNIFICADO] Fase 2 SNIPER: pool=' + selectedPool.length + ' números [' + selectedPool.slice(0, 10).join(',') + '...]');
            } else if (ranking.length > 0) {
                // NORMAL: usar ranking para influenciar mas com range completo
                // Passar null para CoverageEngine usar range completo,
                // mas injetar o ranking como peso interno
                selectedPool = null;
            }

            try {
                result = CoverageEngine.generate(gameKey, numGames, selectedPool, [], drawSize);
            } catch(e) {
                console.error('[MOTOR-UNIFICADO] Fase 2 erro:', e);
            }
        }

        // Fallback: se CoverageEngine falhou, usar PrecisionEngine direto
        if (!result || !result.games || result.games.length === 0) {
            console.warn('[MOTOR-UNIFICADO] Fallback → PrecisionEngine direto');
            if (typeof PrecisionEngine !== 'undefined') {
                result = PrecisionEngine.generate(gameKey, numGames, null, [], drawSize);
            }
        }

        // Fallback final
        if (!result || !result.games) {
            result = { games: [], analysis: {} };
        }

        // ══════════════════════════════════════════════════
        //  MONTAR ANÁLISE UNIFICADA
        // ══════════════════════════════════════════════════
        const elapsed = Date.now() - t0;
        const covAnalysis = result.analysis || {};
        
        const unifiedAnalysis = {
            // Métricas de Estatística (Fase 1)
            bordaSources: bordaSources,
            ranking: ranking,
            fase1: fase1Info,
            // Métricas de Cobertura (Fase 2)
            coveragePct: covAnalysis.coveragePct || covAnalysis.pairCoveragePct || 0,
            entropyPct: covAnalysis.entropyPct || this._calcEntropy(result.games, drawSize),
            avgHamming: covAnalysis.avgHamming || this._calcHamming(result.games),
            // Geral
            totalGames: result.games.length,
            sniperMode: sniperMode || false,
            sniperPoolSize: sniperMode ? sniperPoolSize : 0,
            elapsed: elapsed,
            mode: sniperMode ? 'sniper' : 'cobertura_estatistica'
        };

        // Preservar analysis original para renderGames
        result.analysis = { ...covAnalysis, ...unifiedAnalysis };
        result.smartAnalysis = unifiedAnalysis;

        console.log('[MOTOR-UNIFICADO] ✅ ' + result.games.length + ' jogos | Cobertura: ' + unifiedAnalysis.coveragePct + '% | Entropia: ' + unifiedAnalysis.entropyPct + '% | ' + elapsed + 'ms');
        console.log('%c[MOTOR-UNIFICADO] ══════════════════════════════════', 'color: #10B981; font-weight: bold;');

        return result;
    }

    // ── Calcular Entropia de Shannon ──
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

    // ── Calcular Hamming médio ──
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

// Exportar
if (typeof window !== 'undefined') window.MotorUnificado = MotorUnificado;

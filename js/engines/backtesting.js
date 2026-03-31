/**
 * BACKTESTING ENGINE V1 — Validação de Performance
 * ================================================
 * Testa os motores SmartBets e QuantumGod contra dados REAIS
 * antes de apresentar jogos ao usuário.
 * 
 * Metodologia:
 * 1. Para cada concurso T nos últimos N, simula geração usando histórico T-1
 * 2. Compara jogos gerados com resultado REAL do concurso T
 * 3. Calcula métricas: média de acertos, % ≥ 11, % ≥ 12, % ≥ 13
 * 4. Compara com baseline aleatório
 * 
 * "Confiança baseada em DADOS, não em esperança."
 */
class BacktestingEngine {

    /**
     * Roda backtesting para um motor específico
     * @param {string} gameKey - 'lotofacil', 'timemania', etc
     * @param {string} engine - 'smart' ou 'quantum'
     * @param {number} numGames - Quantidade de jogos por simulação
     * @param {number} numConcursos - Quantos concursos testar (default: 8)
     * @returns {Object} Resultado do backtesting
     */
    static run(gameKey, engine = 'smart', numGames = 10, numConcursos = 8) {
        const game = GAMES[gameKey];
        if (!game) return null;

        let fullHistory = [];
        try {
            fullHistory = StatsService.getRecentResults(gameKey, 200) || [];
        } catch(e) {
            console.warn('[Backtest] Sem histórico');
            return null;
        }

        if (fullHistory.length < numConcursos + 10) {
            console.warn('[Backtest] Histórico insuficiente:', fullHistory.length);
            return null;
        }

        console.log(`[Backtest] 🧪 Iniciando backtesting ${gameKey} (${engine}) — ${numConcursos} concursos, ${numGames} jogos cada`);

        const results = [];
        const drawSize = game.minBet || game.draw;

        for (let t = 0; t < numConcursos; t++) {
            // Concurso a testar (resultado real)
            const targetDraw = fullHistory[t];
            // Histórico disponível ANTES desse concurso
            const trainingHistory = fullHistory.slice(t + 1);

            if (!targetDraw || !targetDraw.numbers || trainingHistory.length < 5) continue;

            // Simular geração de jogos
            let games = [];
            
            if (engine === 'smart') {
                // Temporariamente sobrescrever o histórico do StatsService
                const savedHistory = StatsService.historyStore[gameKey];
                StatsService.historyStore[gameKey] = trainingHistory;
                
                try {
                    const result = SmartBetsEngine.generate(gameKey, numGames, [], [], drawSize);
                    games = result.games || [];
                } catch(e) {
                    console.warn('[Backtest] Erro na geração:', e.message);
                }
                
                // Restaurar
                StatsService.historyStore[gameKey] = savedHistory;
            } else if (engine === 'quantum') {
                try {
                    const suggested = QuantumGodEngine.runSimulation(gameKey, drawSize, trainingHistory);
                    // O quantum gera sugestões, não jogos completos — usar como pool
                    if (suggested && suggested.length > 0) {
                        // Gerar variações usando o pool quantum
                        games = this._generateFromPool(suggested, drawSize, numGames, game);
                    }
                } catch(e) {
                    console.warn('[Backtest] Erro quantum:', e.message);
                }
            }

            if (games.length === 0) continue;

            // Conferir cada jogo contra o resultado real
            const targetSet = new Set(targetDraw.numbers);
            const drawResults = {
                drawNumber: targetDraw.drawNumber,
                targetNumbers: targetDraw.numbers,
                hits: [],
                bestHit: 0,
                avgHit: 0
            };

            for (const game of games) {
                let hits = 0;
                for (const num of game) {
                    if (targetSet.has(num)) hits++;
                }
                drawResults.hits.push(hits);
                if (hits > drawResults.bestHit) drawResults.bestHit = hits;
            }

            drawResults.avgHit = drawResults.hits.reduce((a, b) => a + b, 0) / drawResults.hits.length;
            results.push(drawResults);
        }

        if (results.length === 0) return null;

        // Calcular métricas agregadas
        const metrics = this._calculateMetrics(results, gameKey, drawSize);

        console.log(`[Backtest] ✅ Concluído: ${results.length} concursos testados`);
        console.log(`[Backtest] 📊 Média geral: ${metrics.avgHits.toFixed(1)} | Melhor: ${metrics.bestOverall}`);
        console.log(`[Backtest] 📊 ≥11: ${metrics.pct11plus}% | ≥12: ${metrics.pct12plus}% | ≥13: ${metrics.pct13plus}%`);
        console.log(`[Backtest] 📊 vs Acaso: ${metrics.improvement > 0 ? '+' : ''}${metrics.improvement.toFixed(1)}%`);

        return metrics;
    }

    /**
     * Gerar jogos a partir de um pool de números sugeridos
     */
    static _generateFromPool(pool, drawSize, numGames, gameConfig) {
        const games = [];
        const minBet = drawSize;
        
        for (let g = 0; g < numGames; g++) {
            const ticket = [];
            const available = pool.slice();
            
            // Se pool tem tamanho exato = usar direto
            if (available.length <= minBet) {
                games.push(available.sort((a, b) => a - b));
                continue;
            }
            
            // Selecionar aleatoriamente do pool
            while (ticket.length < minBet && available.length > 0) {
                const idx = Math.floor(Math.random() * available.length);
                ticket.push(available[idx]);
                available.splice(idx, 1);
            }
            
            games.push(ticket.sort((a, b) => a - b));
        }
        
        return games;
    }

    /**
     * Calcular métricas detalhadas
     */
    static _calculateMetrics(results, gameKey, drawSize) {
        let totalHits = 0;
        let totalGames = 0;
        let bestOverall = 0;
        let hits11plus = 0, hits12plus = 0, hits13plus = 0, hits14plus = 0;
        let hitsByDraw = [];

        for (const draw of results) {
            for (const hit of draw.hits) {
                totalHits += hit;
                totalGames++;
                if (hit > bestOverall) bestOverall = hit;
                if (hit >= 11) hits11plus++;
                if (hit >= 12) hits12plus++;
                if (hit >= 13) hits13plus++;
                if (hit >= 14) hits14plus++;
            }
            hitsByDraw.push({
                draw: draw.drawNumber,
                avg: draw.avgHit.toFixed(1),
                best: draw.bestHit,
                target: draw.targetNumbers.join(', ')
            });
        }

        const avgHits = totalGames > 0 ? totalHits / totalGames : 0;

        // Calcular baseline aleatório
        const game = GAMES[gameKey];
        const totalRange = game ? (game.range[1] - game.range[0] + 1) : 25;
        const drawnPerGame = game ? game.draw : 15;
        const expectedRandom = drawSize * drawnPerGame / totalRange;
        const improvement = expectedRandom > 0 ? ((avgHits - expectedRandom) / expectedRandom) * 100 : 0;

        // Determinar nível de confiança
        let confidenceLevel = 'baixa';
        let confidenceColor = '#EF4444'; // vermelho
        if (improvement >= 10) { confidenceLevel = 'alta'; confidenceColor = '#10B981'; }
        else if (improvement >= 3) { confidenceLevel = 'média'; confidenceColor = '#F59E0B'; }
        else if (improvement >= 0) { confidenceLevel = 'marginal'; confidenceColor = '#F97316'; }

        return {
            gameKey,
            engine: 'smart',
            concursosTested: results.length,
            totalGames,
            avgHits,
            bestOverall,
            expectedRandom: expectedRandom.toFixed(1),
            improvement: improvement,
            pct11plus: totalGames > 0 ? Math.round(hits11plus / totalGames * 100) : 0,
            pct12plus: totalGames > 0 ? Math.round(hits12plus / totalGames * 100) : 0,
            pct13plus: totalGames > 0 ? Math.round(hits13plus / totalGames * 100) : 0,
            pct14plus: totalGames > 0 ? Math.round(hits14plus / totalGames * 100) : 0,
            confidenceLevel,
            confidenceColor,
            hitsByDraw,
            summary: `Média: ${avgHits.toFixed(1)} hits (acaso: ${expectedRandom}) | Melhor: ${bestOverall} | Melhoria: ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`
        };
    }

    /**
     * Formatar resultado para exibição na UI
     */
    static formatForUI(metrics) {
        if (!metrics) return '<span style="color: #94A3B8;">Sem dados para backtesting</span>';

        const icon = metrics.improvement >= 5 ? '✅' : (metrics.improvement >= 0 ? '⚠️' : '❌');
        const gameNames = {
            lotofacil: 'Lotofácil', timemania: 'Timemania', megasena: 'Mega Sena',
            quina: 'Quina', duplasena: 'Dupla Sena', lotomania: 'Lotomania', diadesorte: 'Dia de Sorte'
        };

        return `
            <div style="padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid ${metrics.confidenceColor}40; margin-top: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-weight: 700; color: ${metrics.confidenceColor}; font-size: 0.85rem;">
                        ${icon} Backtesting ${gameNames[metrics.gameKey] || metrics.gameKey}
                    </span>
                    <span style="font-size: 0.75rem; color: #94A3B8;">${metrics.concursosTested} concursos</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.78rem;">
                    <span style="color: #CBD5E1;">Média acertos:</span>
                    <span style="color: ${metrics.confidenceColor}; font-weight: 600; text-align: right;">${metrics.avgHits.toFixed(1)} (acaso: ${metrics.expectedRandom})</span>
                    <span style="color: #CBD5E1;">Melhor resultado:</span>
                    <span style="color: #F1F5F9; font-weight: 600; text-align: right;">${metrics.bestOverall} pontos</span>
                    <span style="color: #CBD5E1;">Melhoria vs acaso:</span>
                    <span style="color: ${metrics.confidenceColor}; font-weight: 600; text-align: right;">${metrics.improvement >= 0 ? '+' : ''}${metrics.improvement.toFixed(1)}%</span>
                    <span style="color: #CBD5E1;">≥11 pts:</span>
                    <span style="color: #F1F5F9; text-align: right;">${metrics.pct11plus}%</span>
                    <span style="color: #CBD5E1;">≥12 pts:</span>
                    <span style="color: #F1F5F9; text-align: right;">${metrics.pct12plus}%</span>
                    <span style="color: #CBD5E1;">≥13 pts:</span>
                    <span style="color: ${metrics.pct13plus > 0 ? '#10B981' : '#F1F5F9'}; font-weight: ${metrics.pct13plus > 0 ? '700' : '400'}; text-align: right;">${metrics.pct13plus}%</span>
                </div>
                <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <span style="font-size: 0.7rem; color: ${metrics.confidenceColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                        Confiança: ${metrics.confidenceLevel}
                    </span>
                </div>
            </div>
        `;
    }
}

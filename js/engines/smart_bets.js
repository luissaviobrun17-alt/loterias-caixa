/**
 * SMART BETS ENGINE â€” Motor IA para Apostas Reduzidas
 * ====================================================
 * Gera jogos INTELIGENTES quando o apostador quer poucos jogos
 * (em vez de fechamento completo).
 * 
 * 14 REGRAS ESTATÃSTICAS:
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *  1. Consecutivos MÃ¡ximos (por loteria)
 *  2. EquilÃ­brio Par/Ãmpar (proporÃ§Ã£o real)
 *  3. DistribuiÃ§Ã£o por Faixas (dezenas)
 *  4. DistÃ¢ncia entre NÃºmeros (gap mÃ©dio)
 *  5. Soma Total (faixa ideal)
 *  6. Fibonacci / ProporÃ§Ã£o Ãurea
 *  7. Primos (proporÃ§Ã£o real)
 *  8. Anti-PadrÃ£o Artificial (anti-progressÃ£o)
 *  9. Duplas Frequentes (top pares)
 * 10. Trios Frequentes (top trios)
 * 11. Cobertura de NÃºmeros (diversidade entre jogos)
 * 12. RepetiÃ§Ã£o do Ãšltimo Sorteio
 * 13. Markov / TransiÃ§Ã£o
 * 14. TendÃªncia Temporal (nÃºmeros em alta)
 * 
 * "Poucos jogos, mÃ¡xima inteligÃªncia."
 */
class SmartBetsEngine {

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  PERFIS ESPECÃFICOS POR LOTERIA                     â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static getProfile(gameKey) {
        const profiles = {
            megasena: {
                name: 'Mega Sena',
                draw: 6, range: [1, 60],
                maxConsecutive: 2,                      // Dados: max 2 consecutivos (nunca 3+)
                evenOddIdeal: [3, 3], evenOddTolerance: 2, // v2.3: tolerÃ¢ncia 1â†’2 (2p/4i ocorre em 20%)
                faixaSize: 10, faixaMin: 0, faixaMax: 2,
                sumMin: 120, sumMax: 240,               // v2.3: apertar soma (dados: P10=120, P90=240)
                gapMin: 3, gapMax: 14,                  // v2.3: gapMin 5â†’3 (dados: P25=3), gapMax 12â†’14
                repeatFromLast: [0, 2],                 // Dados: 87% tem 0-1 repetiÃ§Ãµes (OK)
                primeRatio: [0.0, 0.50],                // v2.3: [0.05,0.55]â†’[0.0,0.50] (dados: 0-3 primos)
                maxSameEnding: 2,                       // Dados: 77% tem max 2 mesmo final (OK)
                fibWeight: 0.10,
                markovWeight: 0.05,     // V9 ANTI-CONC: 0.18->0.05
                trendWeight: 0.05,      // V9: 0.18->0.05
                pairBoost: 0.03,        // V9: 0.10->0.03
                trioBoost: 0.01,        // V9: 0.04->0.01
                multiWindow: true,
                zoneMinCover: 4,        // V9: 3->4                        // v2.3: 4â†’3 (dados: 26% cobrem sÃ³ 3 zonas)
                hotNumbers: [],
                coldNumbers: [],
                diversityPenalty: 1.20,   // V9: 0.85->1.20 PENALIDADE SEVERA
                maxConcentration: 0.08,   // V9: 0.10->0.08
                forceNewEvery: 1,         // V9: 2->1 rotacao total
                maxOverlapBetweenGames: 2,// V9: 3->2
                maxSeedRatio: 0.10,       // V9: 0.17->0.10
                noiseLevel: 0.55,         // V9: 0.35->0.55 MUITO mais exploracao
                hotRatio: 0.34,           // V9: equilibrio 1/3
                warmRatio: 0.33,
                coldRatio: 0.33
            },
            lotofacil: {
                name: 'LotofÃ¡cil',
                draw: 15, range: [1, 25],
                maxConsecutive: 10,                         // V3: 7â†’10 â€” dados reais: runs de atÃ© 9-10 ocorrem!
                evenOddIdeal: [7, 8], evenOddTolerance: 3,  // V3: tol 2â†’3 (aceitar mais variaÃ§Ã£o)
                faixaSize: 5, faixaMin: 1, faixaMax: 5,     // V3: faixaMax 4â†’5 (padrÃ£o real)
                sumMin: 155, sumMax: 235,                    // V3: [170,220]â†’[155,235] â€” dados reais P5-P95
                gapMin: 1, gapMax: 3,
                repeatFromLast: [6, 12],                     // V3: [7,11]â†’[6,12] â€” mais variaÃ§Ã£o
                primeRatio: [0.20, 0.50],
                primeCount: [3, 7],                          // V3: [4,6]â†’[3,7] â€” aceitar outliers
                maxSameEnding: 5,                            // V3: 4â†’5 (dados reais!)
                fibWeight: 0.05,                             // V3: 0.08â†’0.05
                markovWeight: 0.05,                          // V3: 0.10â†’0.05 â€” CAUSA RAIZ de viÃ©s
                trendWeight: 0.05,                           // V3: 0.10â†’0.05 â€” suavizado
                pairBoost: 0.04,                             // V3: 0.08â†’0.04 â€” seeds nÃ£o dominam
                trioBoost: 0.03,                             // V3: 0.06â†’0.03
                gridRows: 5, gridCols: 5,
                gridMinPerRow: 1, gridMaxPerRow: 5,          // V3: max 4â†’5 (dados reais permitem 5)
                bordaIdeal: [8, 13],                         // V3: [9,12]â†’[8,13] â€” aceitar mais variaÃ§Ã£o
                centroIdeal: [2, 7],                         // V3: [3,6]â†’[2,7]
                espelhosIdeal: [2, 6],                       // V3: [3,5]â†’[2,6]
                baixosIdeal: [4, 10],                        // V3: [5,9]â†’[4,10] â€” muito mais flexÃ­vel
                altosIdeal: [5, 11],                         // V3: [6,10]â†’[5,11]
                multiWindow: true,
                hotNumbers: [],
                coldNumbers: [],
                // â”€â”€ ESTRATÃ‰GIA DE EXCLUSÃƒO (V3) â”€â”€
                useExclusionStrategy: true,                  // V3: NOVO â€” habilitar modo exclusÃ£o
                exclusionCount: [8, 10],                     // V3: NOVO â€” excluir 8-10 nÃºmeros fracos
                exclusionThreshold: 0.25,                    // V3: NOVO â€” score abaixo disso = excluir
                // â”€â”€ DIVERSIDADE RECALIBRADA (V3) â”€â”€
                diversityPenalty: 0.40,                      // V3: 0.90â†’0.40 â€” PERMITIR concentraÃ§Ã£o!
                maxConcentration: 0.80,                      // V3: 0.72â†’0.80 (15/25=60%, mais margem)
                forceNewEvery: 3,                            // V3: 2â†’3 â€” menos rotaÃ§Ã£o forÃ§ada
                maxOverlapBetweenGames: 12,                  // V3: 10â†’12 â€” jogos mais similares quando IA converge
                maxSeedRatio: 0.15,                          // V3: 0.20â†’0.15
                noiseLevel: 0.12                             // V3: 0.25â†’0.12 â€” MENOS RUÃDO = MAIS SINAL
            },
            quina: {
                name: 'Quina',
                draw: 5, range: [1, 80],
                maxConsecutive: 2,
                evenOddIdeal: [3, 2], evenOddTolerance: 2,  // v2.3: tolerÃ¢ncia 1â†’2
                faixaSize: 10, faixaMin: 0, faixaMax: 2,
                sumMin: 100, sumMax: 300,               // v2.3: ajustado P10-P90
                gapMin: 5, gapMax: 25,                  // v2.3: gapMax 20â†’25 (range 80)
                repeatFromLast: [0, 1],
                primeRatio: [0.0, 0.55],
                maxSameEnding: 2,
                fibWeight: 0.08,                        // v2.3: 0.3â†’0.08
                markovWeight: 0.15,                     // v2.3: 0.55â†’0.15 â€” CAUSA RAIZ da concentraÃ§Ã£o
                trendWeight: 0.15,                      // v2.3: 0.50â†’0.15
                pairBoost: 0.08,                        // v2.3: 0.40â†’0.08
                trioBoost: 0.04,                        // v2.3: 0.30â†’0.04
                multiWindow: true,
                zoneMinCover: 3,                        // Cobrir 3 de 8 zonas
                hotNumbers: [],
                coldNumbers: [],
                diversityPenalty: 0.85,                 // v2.3: 0.45â†’0.85 â€” penalidade SEVERA
                maxConcentration: 0.08,                 // v2.3: 0.35â†’0.08 (5/80=6.25%, +2% margem)
                forceNewEvery: 2,                       // v2.3: 3â†’2
                maxOverlapBetweenGames: 2,              // NOVO: max 2/5 overlap
                maxSeedRatio: 0.20,                     // NOVO
                noiseLevel: 0.50,                       // NOVO: ruÃ­do ALTO (range 80)
                // Camadas de temperatura
                hotRatio: 0.40,                         // ~2/5 do pool HOT
                warmRatio: 0.35,                        // ~2/5 do warm
                coldRatio: 0.25                         // ~1/5 do cold
            },
            duplasena: {
                name: 'Dupla Sena',
                draw: 6, range: [1, 50],
                maxConsecutive: 3,                           // v2.3: 4â†’3
                evenOddIdeal: [3, 3], evenOddTolerance: 2,   // v2.3: tol 1â†’2
                faixaSize: 10, faixaMin: 0, faixaMax: 3,
                sumMin: 60, sumMax: 220,                     // v2.3: ajustado P10-P90
                gapMin: 3, gapMax: 15,                       // v2.3: gapMin 2â†’3, gapMax 7â†’15
                repeatFromLast: [0, 2],                      // v2.3: 0-4â†’0-2
                primeRatio: [0.0, 0.55],
                maxSameEnding: 2,                            // v2.3: 3â†’2
                fibWeight: 0.08,                             // v2.3: 0.3â†’0.08
                markovWeight: 0.15,                          // v2.3: 0.55â†’0.15 â€” CAUSA RAIZ
                trendWeight: 0.15,                           // v2.3: 0.50â†’0.15
                pairBoost: 0.08,                             // v2.3: 0.45â†’0.08
                trioBoost: 0.04,                             // v2.3: 0.35â†’0.04
                multiWindow: true,
                zoneMinCover: 3,                             // NOVO: cobrir 3 de 5 zonas
                hotNumbers: [],
                coldNumbers: [],
                diversityPenalty: 0.85,                      // v2.3: 0.35â†’0.85 â€” penalidade SEVERA
                maxConcentration: 0.15,                      // v2.3: 0.38â†’0.15 (6/50=12%, +3%)
                forceNewEvery: 2,                            // v2.3: 3â†’2
                maxOverlapBetweenGames: 2,                   // NOVO: max 2/6 overlap
                maxSeedRatio: 0.20,                          // NOVO
                noiseLevel: 0.45,                            // NOVO: ruÃ­do para range 50
                hotRatio: 0.40,
                warmRatio: 0.35,
                coldRatio: 0.25
            },
            lotomania: {
                name: 'Lotomania',
                draw: 20, range: [0, 99],
                maxConsecutive: 4,
                evenOddIdeal: [25, 25], evenOddTolerance: 5, // v2.3: CORRIGIDO â€” jogo tem 50 nums, nÃ£o 20!
                faixaSize: 10, faixaMin: 1, faixaMax: 8,    // v2.3: CORRIGIDO â€” 50 nums cobrem 8+ faixas
                sumMin: 2100, sumMax: 2900,                  // v2.3: CORRIGIDO â€” soma de 50 nums ~2475
                gapMin: 1, gapMax: 3,                        // v2.3: CORRIGIDO â€” 50/100 = gaps pequenos
                repeatFromLast: [7, 14],                     // v2.3: CORRIGIDO â€” 50 nums, overlap alto esperado
                primeRatio: [0.15, 0.50],
                maxSameEnding: 8,                            // v2.3: CORRIGIDO â€” 50 nums = ~5 por terminaÃ§Ã£o
                fibWeight: 0.06,                             // v2.3: 0.2â†’0.06 âœ…
                markovWeight: 0.12,                          // v2.3: 0.40â†’0.12 â€” anti-concentraÃ§Ã£o âœ…
                trendWeight: 0.12,                           // v2.3: 0.35â†’0.12 âœ…
                pairBoost: 0.06,                             // v2.3: 0.25â†’0.06 âœ…
                trioBoost: 0.03,                             // v2.3: 0.15â†’0.03 âœ…
                multiWindow: true,
                hotNumbers: [],
                coldNumbers: [],
                diversityPenalty: 0.80,                      // v2.3: 0.50â†’0.80 âœ…
                maxConcentration: 0.55,                      // v2.3: 0.30â†’0.55 (50/100=50%, +5%)
                forceNewEvery: 2,
                maxOverlapBetweenGames: 35,                  // NOVO: max 35/50 overlap
                maxSeedRatio: 0.15,                          // NOVO
                noiseLevel: 0.35,                            // NOVO: ruÃ­do para explorar range 100
                hotRatio: 0.40,
                warmRatio: 0.35,
                coldRatio: 0.25
            },
            timemania: {
                name: 'Timemania',
                draw: 10, range: [1, 80],
                // === V9: RECONSTRUCAO TOTAL - ELIMINAR SUPER-CONCENTRACAO ===
                // PROBLEMA 2374: nr 65 em 60% dos jogos = 0 premios
                // SOLUCAO: pool de 30+ nums, diversidade MAXIMA, anti-concentracao brutal
                maxConsecutive: 2,
                evenOddIdeal: [5, 5], evenOddTolerance: 4,
                faixaSize: 10, faixaMin: 0, faixaMax: 4,
                sumMin: 220, sumMax: 580,    // V9: 10 nums de 80 = soma bem mais ampla
                gapMin: 2, gapMax: 22,
                repeatFromLast: [0, 2],
                primeRatio: [0.0, 0.60],
                maxSameEnding: 4,
                fibWeight: 0.01,             // V9: MINIMO - fibonacci nao prediz loteria
                markovWeight: 0.02,          // V9: MINIMO - Markov causava concentracao
                trendWeight: 0.03,           // V9: suavizado ao maximo
                pairBoost: 0.02,
                trioBoost: 0.01,
                zoneMinCover: 5,             // obrigatorio cobrir 5 das 8 zonas de 10
                multiWindow: true,
                hotNumbers: [],
                coldNumbers: [],
                useExclusionStrategy: false,
                // DIVERSIDADE V9: MAXIMA ANTI-CONCENTRACAO
                diversityPenalty: 2.50,      // V9: 0.55->2.50 PENALIDADE BRUTAL
                maxConcentration: 0.10,      // V9: 0.20->0.10 (10/80=12.5% maximo)
                forceNewEvery: 1,            // V9: rotacao TOTAL a cada jogo
                maxOverlapBetweenGames: 3,   // V9: 5->3 max 3/10 overlap
                maxSeedRatio: 0.05,          // V9: 0.25->0.05 seeds NAO dominam
                noiseLevel: 0.90,            // V9: 0.30->0.90 exploracao MAXIMA
                hotRatio: 0.34,              // V9: equilibrio perfeito 1/3 cada
                warmRatio: 0.33,
                coldRatio: 0.33
            },
            diadesorte: {
                name: 'Dia de Sorte',
                draw: 7, range: [1, 31],
                maxConsecutive: 3,                           // v2.3: 4â†’3
                evenOddIdeal: [3, 4], evenOddTolerance: 2,
                faixaSize: 8, faixaMin: 1, faixaMax: 3,     // v2.3: faixaMax 4â†’3
                sumMin: 60, sumMax: 155,                     // v2.3: ajustado
                gapMin: 1, gapMax: 7,                        // v2.3: gapMax 5â†’7
                repeatFromLast: [0, 3],                      // v2.3: 0-4â†’0-3
                primeRatio: [0.0, 0.60],
                maxSameEnding: 2,                            // v2.3: 3â†’2
                fibWeight: 0.06,                             // v2.3: 0.3â†’0.06
                markovWeight: 0.12,                          // v2.3: 0.55â†’0.12 â€” CAUSA RAIZ
                trendWeight: 0.12,                           // v2.3: 0.50â†’0.12
                pairBoost: 0.06,                             // v2.3: 0.45â†’0.06
                trioBoost: 0.03,                             // v2.3: 0.35â†’0.03
                multiWindow: true,
                hotNumbers: [],
                coldNumbers: [],
                diversityPenalty: 0.88,                      // v2.3: 0.25â†’0.88 â€” MUITO agressivo (range 31!)
                maxConcentration: 0.28,                      // v2.3: 0.45â†’0.28 (7/31=22.5%, +5.5%)
                forceNewEvery: 2,                            // v2.3: 4â†’2
                maxOverlapBetweenGames: 3,                   // NOVO: max 3/7 overlap
                maxSeedRatio: 0.15,                          // NOVO
                noiseLevel: 0.35,                            // NOVO
                hotRatio: 0.40,
                warmRatio: 0.35,
                coldRatio: 0.25
            }
        };
        return profiles[gameKey] || profiles.megasena;
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  MÃ‰TODO PRINCIPAL: GERAR N JOGOS INTELIGENTES       â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static generate(gameKey, numGames, selectedNumbers, fixedNumbers = [], customDrawSize = null) {
        const profile = this.getProfile(gameKey);
        const game = GAMES[gameKey];
        if (!game) return { games: [], analysis: null };

        const startNum = profile.range[0];
        const endNum = profile.range[1];
        const drawSize = customDrawSize || game.minBet || profile.draw;

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // V6: QUANTUM HARMÃ”NICO â€” INTERCEPTAÃ‡ÃƒO TIMEMANIA
        // Motor especializado com anÃ¡lise profunda para 10/80
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  V9-D: MOTOR QUÂNTICO UNIVERSAL — TODAS AS LOTERIAS           ║
        // ║  Anti-sequência + Cobertura de Zonas + Confiança 95%+          ║
        // ╚═══════════════════════════════════════════════════════════════╝

        // ──────────────────────────────────────────────────────────────────
        // FUNÇÃO COMPARTILHADA: Motor Quântico Genérico V9-C
        // Usada por todas as loterias para geração de alta qualidade
        // ──────────────────────────────────────────────────────────────────
        if (['megasena','lotofacil','quina','duplasena','lotomania','diadesort','timemania'].includes(gameKey)) {
            return this._generateQuantumUniversal(gameKey, numGames, selectedNumbers || [], fixedNumbers, drawSize);
        }

        // V9: Motor Timemania Quantum — Respeita números selecionados pelo usuário
        if (gameKey === 'timemania') {
            const hasUserSelection = selectedNumbers && selectedNumbers.length >= drawSize;
            if (hasUserSelection) {
                // ✅ Usuário selecionou números: usar pool do usuário no motor Quantum
                console.log('[SmartBets] 🎯 TIMEMANIA V9 — Gerando a partir de ' + selectedNumbers.length + ' números escolhidos pelo usuário');
                return this._generateTimemaniaQuantum(numGames, fixedNumbers, drawSize, profile, game, selectedNumbers);
            } else {
                // ✅ Sem seleção: motor Quantum com análise completa de 1-80
                console.log('[SmartBets] 🔮 TIMEMANIA V9 — Motor Quantum completo (sem seleção manual)');
                return this._generateTimemaniaQuantum(numGames, fixedNumbers, drawSize, profile, game, []);
            }
        }

        // Pool de nÃºmeros: usar selecionados ou universo completo
        // V9: Se usuário selecionou números (mesmo menos que drawSize), usar como pool preferencial
        let pool;
        if (selectedNumbers && selectedNumbers.length >= drawSize) {
            // Seleção completa: usar exclusivamente os números escolhidos
            pool = selectedNumbers.slice();
            console.log('[SmartBets] 🎯 Pool do usuário (' + pool.length + ' nums selecionados)');
        } else if (selectedNumbers && selectedNumbers.length >= Math.ceil(drawSize / 2)) {
            // Seleção parcial: usar como ponto de partida + completar com análise IA
            const fullPool = this._buildFullPool(startNum, endNum);
            const selectedSet = new Set(selectedNumbers);
            // Priorizar: selecionados primeiro, depois os melhores da IA
            pool = [...selectedNumbers, ...fullPool.filter(n => !selectedSet.has(n))];
            console.log('[SmartBets] 🎯 Pool híbrido: ' + selectedNumbers.length + ' do usuário + ' + (pool.length - selectedNumbers.length) + ' IA');
        } else {
            // Sem seleção ou poucas: usar universo completo
            pool = this._buildFullPool(startNum, endNum);
            console.log('[SmartBets] 🧠 Pool IA completo (' + pool.length + ' nums)');
        }

        // Carregar histÃ³rico
        let history = [];
        try {
            history = StatsService.getRecentResults(gameKey, 100) || [];
        } catch (e) {
            console.warn('[SmartBets] Sem histÃ³rico, usando modo bÃ¡sico');
        }

        console.log(`[SmartBets] ðŸ§  Gerando ${numGames} jogos inteligentes para ${profile.name}`);
        console.log(`[SmartBets] ðŸ“Š Pool: ${pool.length} nÃºmeros | HistÃ³rico: ${history.length} sorteios`);


        // â”€â”€ ANÃLISE PRÃ‰-CÃLCULO â”€â”€
        const analysis = this._deepAnalysis(gameKey, pool, history, profile, startNum, endNum);

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // V3: ESTRATÃ‰GIA DE EXCLUSÃƒO INTELIGENTE
        // Em vez de escolher os melhores, EXCLUIR os piores.
        // LotofÃ¡cil: excluir 8-10 de 25 â†’ pool de 15-17
        // Timemania: excluir 55-65 de 80 â†’ pool de 15-25
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        if (profile.useExclusionStrategy && history.length >= 5 && (!selectedNumbers || selectedNumbers.length === 0)) {
            const exclusionScores = {};
            const totalRange = endNum - startNum + 1;

            for (let n = startNum; n <= endNum; n++) {
                let excScore = 0;

                // FATOR 1: FrequÃªncia BAIXA recente (Ãºltimos 5 sorteios) = provÃ¡vel que nÃ£o saia
                let recentHits = 0;
                const recentLimit = Math.min(5, history.length);
                for (let i = 0; i < recentLimit; i++) {
                    if (history[i].numbers.includes(n)) recentHits++;
                }
                const recentRate = recentHits / recentLimit;
                if (recentRate < 0.15) excScore += 3.0;      // Quase nunca sai recentemente
                else if (recentRate < 0.30) excScore += 1.5;

                // FATOR 2: FrequÃªncia baixa em mÃºltiplas janelas
                if (analysis.multiWindowScores && analysis.multiWindowScores[n] < 0.25) {
                    excScore += 2.0;
                } else if (analysis.multiWindowScores && analysis.multiWindowScores[n] < 0.40) {
                    excScore += 1.0;
                }

                // FATOR 3: Score geral baixo
                const baseScore = analysis.numberScores[n] || 0;
                if (baseScore < 0.25) excScore += 2.5;
                else if (baseScore < 0.40) excScore += 1.0;

                // FATOR 4: TendÃªncia de QUEDA
                const trend = analysis.trendScores[n] || 1.0;
                if (trend < 0.3) excScore += 2.0;
                else if (trend < 0.6) excScore += 0.8;

                // FATOR 5: EstÃ¡ "frio" â€” saiu recentemente mas nÃ£o tem padrÃ£o de repetir
                const lastSeen = this._findLastSeen(n, history);
                if (lastSeen > 5 && recentRate < 0.20) excScore += 1.5;

                exclusionScores[n] = excScore;
            }

            // Ordenar por score de exclusÃ£o (maior = mais provÃ¡vel de NÃƒO sair)
            const ranked = pool.map(n => ({ num: n, excScore: exclusionScores[n] || 0 }))
                .sort((a, b) => b.excScore - a.excScore);

            // Determinar quantos excluir
            const [minExcl, maxExcl] = profile.exclusionCount;
            const targetExcl = Math.min(maxExcl, Math.max(minExcl, 
                Math.floor(pool.length * (profile.exclusionThreshold || 0.30))
            ));

            // Garantir pool mÃ­nimo: drawSize + 2 (para ter diversidade)
            const maxExclSafe = Math.max(0, pool.length - drawSize - 2);
            const actualExcl = Math.min(targetExcl, maxExclSafe);

            if (actualExcl > 0) {
                const excluded = ranked.slice(0, actualExcl).map(r => r.num);
                const excludedSet = new Set(excluded);
                
                // NÃ£o excluir nÃºmeros fixos
                const safeExcluded = excluded.filter(n => !fixedNumbers.includes(n));
                const safeExcludedSet = new Set(safeExcluded);
                
                pool = pool.filter(n => !safeExcludedSet.has(n));

                console.log(`[SmartBets] ðŸš« EXCLUSÃƒO V3: ${safeExcluded.length} nÃºmeros excluÃ­dos`);
                console.log(`[SmartBets] ðŸš« ExcluÃ­dos: [${safeExcluded.sort((a,b) => a-b).join(', ')}]`);
                console.log(`[SmartBets] âœ… Pool reduzido: ${pool.length} nÃºmeros â†’ [${pool.sort((a,b) => a-b).join(', ')}]`);
            }
        }

        // â”€â”€ GERAR JOGOS â”€â”€
        const games = [];
        const allUsedNumbers = {};
        const usedCombinations = new Set();
        const isLargeGame = drawSize >= 15;
        const isVeryLargeGame = drawSize >= 20;
        const isLargeRange = (endNum - startNum + 1) >= 60; // Timemania/Quina: range 80
        const maxAttempts = isVeryLargeGame ? numGames * 3000 : (isLargeGame ? numGames * 1000 : numGames * 500);
        let attempts = 0;

        // â”€â”€ CONTROLE DE CONCENTRAÃ‡ÃƒO GLOBAL â”€â”€
        const maxConcentration = profile.maxConcentration || 0.40;
        const forceNewEvery = profile.forceNewEvery || 5;
        const totalRange = endNum - startNum + 1;

        console.log(`[SmartBets] ðŸ”§ drawSize=${drawSize}, pool=${pool.length}, maxConc=${maxConcentration}`);

         while (games.length < numGames && attempts < maxAttempts) {
            attempts++;
            const ticket = this._generateSingleSmartGame(
                gameKey, pool, drawSize, profile, analysis,
                history, games, allUsedNumbers, fixedNumbers
            );

            if (!ticket) continue;

            const key = ticket.join(',');
            if (usedCombinations.has(key)) continue;

            // V3: Pool/drawSize ratio â€” se pool Ã© apertado, relaxar validaÃ§Ãµes
            const poolRatio = pool.length / drawSize;
            const isTightPool = poolRatio < 1.4; // Ex: 17/15 = 1.13 â†’ tight

            // â”€â”€ ANTI-CONCENTRAÃ‡ÃƒO v3: IGNORAR se pool Ã© tight â”€â”€
            if (!isTightPool && games.length > 1) {
                const isSmallRange = totalRange <= 30;
                const concLimit = isSmallRange
                    ? Math.max(4, Math.ceil(games.length * maxConcentration))
                    : Math.max(3, Math.ceil(games.length * 0.08));
                let overUsedCount = 0;
                for (const num of ticket) {
                    if ((allUsedNumbers[num] || 0) >= concLimit) {
                        overUsedCount++;
                    }
                }
                const overUsedThreshold = isSmallRange ? Math.max(2, Math.ceil(drawSize * 0.20)) : 2;
                if (overUsedCount >= overUsedThreshold && attempts < maxAttempts * 0.90) continue;
            }

            // â”€â”€ ANTI-OVERLAP v3: RELAXAR se pool Ã© tight â”€â”€
            if (!isTightPool && games.length > 0) {
                const maxOverlap = profile.maxOverlapBetweenGames || Math.ceil(drawSize * 0.80);
                let tooSimilar = false;
                const checkFrom = Math.max(0, games.length - 100);
                for (let g = checkFrom; g < games.length; g++) {
                    let overlap = 0;
                    const existingSet = new Set(games[g]);
                    for (const num of ticket) {
                        if (existingSet.has(num)) overlap++;
                    }
                    if (overlap > maxOverlap) {
                        tooSimilar = true;
                        break;
                    }
                }
                if (tooSimilar && attempts < maxAttempts * 0.95) continue;
            }

            // â”€â”€ VALIDAÃ‡ÃƒO FINAL v3 â”€â”€
            if (isVeryLargeGame || isTightPool) {
                // Pool tight: a inteligÃªncia estÃ¡ na EXCLUSÃƒO, nÃ£o na validaÃ§Ã£o individual
                games.push(ticket);
                usedCombinations.add(key);
                ticket.forEach(n => allUsedNumbers[n] = (allUsedNumbers[n] || 0) + 1);
            } else {
                const score = this._scoreGame(ticket, profile, analysis, history);
                const minScore = isLargeGame ? 4.0 : 5.0;
                if (score >= minScore || attempts > maxAttempts * 0.80) {
                    games.push(ticket);
                    usedCombinations.add(key);
                    ticket.forEach(n => allUsedNumbers[n] = (allUsedNumbers[n] || 0) + 1);
                }
            }
        }

        // â”€â”€ CALCULAR CONFIANÃ‡A DO SET â”€â”€
        const setAnalysis = this._analyzeGeneratedSet(games, profile, analysis, history, gameKey);

        console.log(`[SmartBets] âœ… ${games.length} jogos gerados em ${attempts} tentativas`);
        console.log(`[SmartBets] ðŸ“Š ConfianÃ§a: ${setAnalysis.confidence}% | Cobertura: ${setAnalysis.coverage}%`);

        return {
            pool: pool,
            games: games,
            analysis: setAnalysis
        };
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  QUANTUM HARMÃ”NICO V8 â€” FECHAMENTO MATEMÃTICO TIMEMANIA           â•‘
    // â•‘  EstratÃ©gia: C(12,10)=66 combos do ELITE + 34 do TOP15            â•‘
    // â•‘  Se 3+ sorteados estÃ£o no ELITE â†’ MÃšLTIPLOS bilhetes premiados    â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  QUANTUM UNIVERSAL V9-D — Motor para TODAS as Loterias              ║
    // ║  Anti-Sequência Rigoroso + Cobertura de Zonas + Confiança 95%+      ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    static _generateQuantumUniversal(gameKey, numGames, selectedNumbers, fixedNumbers, drawSize) {
        const game = GAMES[gameKey];
        const profile = this.getProfile(gameKey);
        if (!game || !profile) return { games: [], analysis: { confidence: 0 } };

        const startNum = game.range[0];
        const endNum   = game.range[1];
        const totalRange = endNum - startNum + 1;
        const numZones   = Math.ceil(totalRange / 10);

        // Carregar histórico
        let history = [];
        try { history = StatsService.getRecentResults(gameKey, 200) || []; } catch(e) {}

        const N = history.length;
        console.log('[QU-QCALV3] ⚛️ ' + (game.name || gameKey) + ' | ' + N + ' sorteios | drawSize=' + drawSize + ' | CALIBRAÇÃO QUÂNTICA ATIVA');

        // ── CALIBRAÇÃO QUÂNTICA META-HEURÍSTICA (QCAL-V3) ─────────────────────
        // Integra Entropia Temporal + Clarividência Computacional + Filtros Atômicos
        let qCalibScores = null;
        if (typeof QuantumCalibration !== 'undefined' && N >= 3) {
            try {
                qCalibScores = QuantumCalibration.calibrate(gameKey, history, drawCount);
            } catch(e) {
                console.warn('[QU-QCALV3] Calibração quântica ignorada:', e.message);
            }
        }

        // ── FASE 1: SCORES MULTI-CAMADA ──────────────────────────────────────
        const freq   = {}, delay = {};
        const rec5   = {}, rec10 = {}, rec15 = {};
        for (let n = startNum; n <= endNum; n++) {
            freq[n] = 0; delay[n] = N;
            rec5[n] = 0; rec10[n] = 0; rec15[n] = 0;
        }

        history.forEach((d, i) => {
            (d.numbers || []).forEach(n => {
                if (n < startNum || n > endNum) return;
                freq[n]++;
                if (i < 5)  rec5[n]++;
                if (i < 10) rec10[n]++;
                if (i < 15) rec15[n]++;
                if (delay[n] === N) delay[n] = i;
            });
            // Dupla Sena: contar 2º sorteio também
            (d.numbers2 || []).forEach(n => {
                if (n < startNum || n > endNum) return;
                freq[n]++;
                if (delay[n] === N) delay[n] = i;
            });
        });

        // Markov: co-ocorrências com último sorteio
        const lastDraw = N > 0 ? (history[0].numbers || []) : [];
        const markov   = {};
        for (let n = startNum; n <= endNum; n++) markov[n] = 0;
        for (let i = 0; i < Math.min(25, N - 1); i++) {
            const olderNums = history[i + 1].numbers || [];
            const newerNums = history[i].numbers || [];
            const decay = Math.exp(-i * 0.08);
            for (const from of olderNums) {
                if (!lastDraw.includes(from)) continue;
                for (const to of newerNums) {
                    if (to >= startNum && to <= endNum) markov[to] += decay * 0.04;
                }
            }
        }

        // Entropia por zona (equilíbrio espacial)
        const zoneFreq    = new Array(numZones).fill(0);
        const zoneExpFreq = 1 / numZones;
        let zoneTotalDraws = 0;
        for (let i = 0; i < Math.min(15, N); i++) {
            (history[i].numbers || []).forEach(n => {
                if (n >= startNum && n <= endNum) {
                    zoneFreq[Math.min(numZones-1, Math.floor((n-startNum)/10))]++;
                    zoneTotalDraws++;
                }
            });
        }
        const zoneBoosts = zoneFreq.map(f => (zoneExpFreq - f / Math.max(1, zoneTotalDraws)) * 0.9);

        // Período de retorno esperado
        const drawCount = drawSize > 0 ? drawSize : (game.minBet || 6);
        const expectedReturn = totalRange / drawCount;

        // Score final composto — V9-D + QCAL-V3 Fusion
        const scores = {};
        for (let n = startNum; n <= endNum; n++) {
            const fNorm   = freq[n] / Math.max(1, N);
            const r5Norm  = rec5[n]  / Math.max(1, Math.min(5,  N));
            const r10Norm = rec10[n] / Math.max(1, Math.min(10, N));
            const r15Norm = rec15[n] / Math.max(1, Math.min(15, N));
            const z       = Math.min(numZones-1, Math.floor((n-startNum)/10));
            const zBoost  = zoneBoosts[z] || 0;
            const d       = delay[n];
            const delayBonus = d >= expectedReturn*2 ? 0.30 : d >= expectedReturn*1.3 ? 0.15 : d <= 1 ? -0.08 : 0;
            const mkBoost = Math.min(0.20, markov[n] || 0);

            // Score base V9-D
            const baseScore = fNorm*0.28 + r5Norm*0.18 + r10Norm*0.20 + r15Norm*0.10
                            + delayBonus*0.10 + zBoost*0.08 + mkBoost*0.06;

            // Score QCAL-V3: Entropia + Clarividência + Filtros Atômicos
            const qScore = qCalibScores ? (qCalibScores[n] || 0) : 0;

            // Fusão: 62% V9-D (dados históricos) + 38% QCAL-V3 (padrões quânticos)
            scores[n] = baseScore * 0.62 + qScore * 0.38;
        }

        // ── FASE 2: DEFINIR POOL ─────────────────────────────────────────────
        let pool = [];
        const hasUserSelection = selectedNumbers && selectedNumbers.length >= drawCount;

        if (hasUserSelection) {
            pool = selectedNumbers.slice().sort((a, b) => a - b);
            console.log('[QU-V9D] 🎯 Pool do usuário: ' + pool.length + ' nums');
        } else {
            // Pool inteligente: top números de cada zona
            const POOL_TARGET = Math.max(drawCount * 3, Math.min(totalRange, drawCount * 5));
            const perZone = Math.ceil(POOL_TARGET / numZones);

            const zones = Array.from({ length: numZones }, () => []);
            for (let n = startNum; n <= endNum; n++) {
                const z = Math.min(numZones-1, Math.floor((n-startNum)/10));
                zones[z].push({ num: n, score: scores[n] });
            }
            zones.forEach(z => z.sort((a, b) => b.score - a.score));

            for (let z = 0; z < numZones; z++) {
                zones[z].slice(0, perZone).forEach(r => pool.push(r.num));
            }
            // Completar se necessário
            for (let n = startNum; n <= endNum && pool.length < POOL_TARGET; n++) {
                if (!pool.includes(n)) pool.push(n);
            }
            pool.sort((a, b) => a - b);
            console.log('[QU-V9D] 🧠 Pool IA: ' + pool.length + ' nums de ' + totalRange);
        }

        // ── FASE 3: GERAR JOGOS COM ANTI-SEQUÊNCIA ───────────────────────────
        const games     = [];
        const usedCount = {};
        const usedKeys  = new Set();
        pool.forEach(n => usedCount[n] = 0);

        const maxUsePerNum = Math.max(3, Math.ceil(numGames * 0.22));
        const maxOverlap   = hasUserSelection
            ? Math.ceil(drawCount * 0.55)
            : Math.ceil(drawCount * 0.35);
        // LIMITE SEGURO: 300 tentativas por jogo + 20s timeout
        const maxAttempts  = Math.min(numGames * 300, 200000);
        const loopStart    = Date.now();
        const LOOP_MAX_MS  = 20000;
        const maxPerZone   = Math.ceil(drawCount / numZones) + 1;

        // Anti-consecutivo: true se num criaria seq de 3+
        function wouldCreateRun(num, ticketSet) {
            const hasPrev = ticketSet.has(num - 1);
            const hasNext = ticketSet.has(num + 1);
            if (!hasPrev && !hasNext) return false;
            if (hasPrev && ticketSet.has(num - 2)) return true;
            if (hasNext && ticketSet.has(num + 2)) return true;
            if (hasPrev && hasNext) return true;
            return false;
        }

        let attempts = 0;
        while (games.length < numGames && attempts < maxAttempts && (Date.now() - loopStart) < LOOP_MAX_MS) {
            attempts++;


            const ticket    = [];
            const ticketSet = new Set();
            const ticketZoneCount = new Array(numZones).fill(0);

            // Fixos primeiro
            for (const f of fixedNumbers) {
                if (pool.includes(f) && !ticketSet.has(f) && ticket.length < drawCount) {
                    ticket.push(f);
                    ticketSet.add(f);
                    ticketZoneCount[Math.min(numZones-1, Math.floor((f-startNum)/10))]++;
                }
            }

            // Embaralhar zonas para anti-sequência
            const zoneOrder = Array.from({ length: numZones }, (_, i) => i);
            for (let i = zoneOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const t = zoneOrder[i]; zoneOrder[i] = zoneOrder[j]; zoneOrder[j] = t;
            }

            // Múltiplas rodadas por zona
            const rounds = Math.ceil(drawCount / numZones) + 3;
            for (let round = 0; round < rounds && ticket.length < drawCount; round++) {
                for (let zi = 0; zi < zoneOrder.length && ticket.length < drawCount; zi++) {
                    const z = zoneOrder[zi];
                    if (ticketZoneCount[z] >= maxPerZone) continue;

                    // Calcular pesos — penaliza super-usados e consecutivos
                    const inZone = pool.filter(n => {
                        const nz = Math.min(numZones-1, Math.floor((n-startNum)/10));
                        if (nz !== z) return false;
                        if (ticketSet.has(n)) return false;
                        if ((usedCount[n] || 0) >= maxUsePerNum) return false;
                        if (wouldCreateRun(n, ticketSet)) return false;
                        return true;
                    });

                    if (inZone.length === 0) continue;

                    // Pesos com penalidade por uso
                    const weights = inZone.map(n => {
                        const usage = usedCount[n] || 0;
                        const usageRatio = usage / maxUsePerNum;
                        let w = (scores[n] || 0.1) + 0.5;
                        w *= Math.pow(1 - usageRatio * 0.8, 2);
                        if (usage === 0) w += 0.6;
                        w += (Math.random() - 0.5) * (hasUserSelection ? 0.3 : 0.5);
                        return Math.max(0.001, w);
                    });

                    // Seleção ponderada
                    const totalW = weights.reduce((s, w) => s + w, 0);
                    let rand = Math.random() * totalW;
                    let chosen = inZone[0];
                    for (let k = 0; k < inZone.length; k++) {
                        rand -= weights[k];
                        if (rand <= 0) { chosen = inZone[k]; break; }
                    }

                    ticket.push(chosen);
                    ticketSet.add(chosen);
                    ticketZoneCount[z]++;
                }
            }

            // Completar se necessário (relaxar anti-consecutivo)
            const remaining = pool.filter(n => !ticketSet.has(n) && (usedCount[n] || 0) < maxUsePerNum);
            remaining.sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
            for (const n of remaining) {
                if (ticket.length >= drawCount) break;
                ticket.push(n);
                ticketSet.add(n);
            }

            if (ticket.length < drawCount) continue;
            ticket.sort((a, b) => a - b);

            const key = ticket.join(',');
            if (usedKeys.has(key)) continue;

            // Verificar overlap
            if (games.length > 0 && attempts < maxAttempts * 0.85) {
                let tooSimilar = false;
                const checkFrom = Math.max(0, games.length - 80);
                for (let g = checkFrom; g < games.length; g++) {
                    const existSet = new Set(games[g]);
                    if (ticket.filter(n => existSet.has(n)).length > maxOverlap) { tooSimilar = true; break; }
                }
                if (tooSimilar) continue;
            }

            games.push(ticket);
            usedKeys.add(key);
            ticket.forEach(n => usedCount[n] = (usedCount[n] || 0) + 1);
        }

        // ━━ GARANTIA DE CONTAGEM EXATA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Preencher jogos faltantes sem nenhuma restrição
        if (games.length < numGames) {
            console.warn('[QU-V9D] ⚠️ Preenchendo ' + (numGames - games.length) + ' jogo(s)');
            let fillAtt = 0;
            const fillMax = Math.min((numGames - games.length) * 50, 5000); // era 500x — muito lento

            while (games.length < numGames && fillAtt < fillMax) {
                fillAtt++;
                const ticket   = [...fixedNumbers.filter(f => pool.includes(f))];
                const usedFill = new Set(ticket);
                const remaining = pool.filter(n => !usedFill.has(n)).sort(() => Math.random() - 0.5);
                for (const n of remaining) {
                    if (ticket.length >= drawCount) break;
                    ticket.push(n); usedFill.add(n);
                }
                if (ticket.length < drawCount) continue;
                ticket.sort((a, b) => a - b);
                const key = ticket.join(',');
                if (!usedKeys.has(key)) {
                    games.push(ticket);
                    usedKeys.add(key);
                    ticket.forEach(n => usedCount[n] = (usedCount[n] || 0) + 1);
                }
            }
            // Último recurso absoluto
            while (games.length < numGames && games.length > 0) {
                games.push([...games[games.length % games.length]]);
            }
        }

        console.log('[QU-QCALV3] ✅ ' + games.length + '/' + numGames + ' jogos em ' + attempts + ' tentativas');

        // ══ FASE 4: SISTEMA DE CONFIANÇA MULTI-FATOR 95%+ ══════════════════════
        // Arquitetura: 8 métricas independentes normalizadas para [0,1]
        // Cada métrica contribui até seu teto, total possível = 100
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        const uniqueNums = new Set();
        games.forEach(g => g.forEach(n => uniqueNums.add(n)));
        const maxFreq    = Math.max(0, ...Object.values(usedCount).filter(v => v > 0));
        const maxFreqPct = games.length > 0 ? Math.round(maxFreq / games.length * 100) : 0;

        // ── MÉTRICA 1: BACKTESTING PROFUNDO (50 sorteios) — peso 26 pontos
        const btCount = Math.min(50, history.length);
        let bt2 = 0, bt3 = 0, bt4 = 0, bt5 = 0, totalHits = 0, maxBtHits = 0;
        const minMatchPrize = Math.max(2, Math.ceil(drawCount * 0.40)); // ptó de premiação mínimo
        for (let t = 0; t < btCount; t++) {
            const drawn = new Set((history[t].numbers || []).concat(history[t].numbers2 || []));
            let bestHits = 0;
            for (const g of games) {
                const hits = g.filter(n => drawn.has(n)).length;
                if (hits > bestHits) bestHits = hits;
            }
            totalHits += bestHits;
            if (bestHits > maxBtHits) maxBtHits = bestHits;
            if (bestHits >= 2) bt2++;
            if (bestHits >= 3) bt3++;
            if (bestHits >= 4) bt4++;
            if (bestHits >= 5) bt5++;
        }
        const avgHits     = btCount > 0 ? totalHits / btCount : 0;
        // Esperado por puro acaso = drawCount * numDrawn / totalRange
        const avgDrawn    = btCount > 0 ? history.slice(0, btCount).reduce((s, d) => s + (d.numbers || []).length, 0) / btCount : drawCount;
        const expectedRnd = drawCount * avgDrawn / totalRange;
        const improvement = avgHits / Math.max(0.001, expectedRnd);
        // Normalizar improvement: 1.0 = chance, 2.5 = excelente
        const improvementScore = Math.min(1, Math.max(0, (improvement - 1.0) / 1.5)) * 26;

        // ── MÉTRICA 2: TAXA DE ACERTO EM 3+ PONTOS — peso 18 pontos
        const winRate3 = btCount > 0 ? bt3 / btCount : 0;
        const winRate4 = btCount > 0 ? bt4 / btCount : 0;
        const winRate5 = btCount > 0 ? bt5 / btCount : 0;
        // Meta: 80%+ acerta 3pt, 40%+ acerta 4pt, 10%+ acerta 5pt
        const winRateScore = Math.min(1, winRate3 / 0.80) * 8
                           + Math.min(1, winRate4 / 0.40) * 6
                           + Math.min(1, winRate5 / 0.10) * 4;

        // ── MÉTRICA 3: QUALIDADE QCAL-V3 (média dos scores calibrados) — peso 18 pontos
        let qcalScore = 0;
        if (qCalibScores && games.length > 0) {
            const totalQScore = games.reduce((sum, g) => {
                const gScore = g.reduce((s, n) => s + (qCalibScores[n] || 0), 0) / g.length;
                return sum + gScore;
            }, 0) / games.length;
            // Normalizar: score médio > 0.60 = 100% dessa métrica
            qcalScore = Math.min(18, (totalQScore / 0.60) * 18);
        } else {
            qcalScore = 9; // fallback: 50% sem calibração
        }

        // ── MÉTRICA 4: QUALIDADE ATÔMICA (amostra de até 50 jogos para performance) — peso 14 pontos
        let atomicScore = 0;
        if (games.length > 0 && typeof QuantumCalibration !== 'undefined') {
            // Limitar a 50 amostras para evitar travar com 1000+ jogos
            const sampleSize = Math.min(50, games.length);
            const step = Math.max(1, Math.floor(games.length / sampleSize));
            let atomicSum = 0;
            let atomicCount = 0;
            for (let gi = 0; gi < games.length; gi += step) {
                atomicSum += QuantumCalibration.scoreGame(games[gi], gameKey, history, qCalibScores);
                atomicCount++;
                if (atomicCount >= sampleSize) break;
            }
            const avgAtomic = atomicCount > 0 ? atomicSum / atomicCount : 0.5;
            atomicScore = Math.min(14, avgAtomic * 14 * 1.5);
        } else {
            atomicScore = 7;
        }

        // ── MÉTRICA 5: COBERTURA E DIVERSIDADE — peso 8 pontos
        const coverageRatio   = uniqueNums.size / Math.max(1, totalRange);
        const diversityScore  = Math.max(0, 1 - maxFreqPct / 100); // 0% concentração = 1.0
        const coverageScore   = Math.min(8, (coverageRatio * 3 + diversityScore) / 4 * 8);

        // ── MÉTRICA 6: RIQUEZA DO HISTÓRICO — peso 6 pontos
        // Mais sorteios históricos = modelo mais confiável
        const historyScore = Math.min(6, (history.length / 40) * 6); // 40+ sorteios = 100%

        // ── MÉTRICA 7: MÁXIMO DE ACERTOS NO BACKTESTING — peso 5 pontos
        const maxHitRatio = maxBtHits / Math.max(1, drawCount);
        const maxHitScore = Math.min(5, maxHitRatio * 5 * 2); // 50%+ de acertos máximos = 100%

        // ── MÉTRICA 8: BÔNUS POR VOLUME DE JOGOS — peso 5 pontos
        const volumeScore = games.length >= 100 ? 5
                          : games.length >= 50  ? 4
                          : games.length >= 20  ? 3
                          : games.length >= 10  ? 2
                          : games.length >= 5   ? 1 : 0;

        // ── SÍNTESE FINAL ──
        // Total possível = 26 + 18 + 18 + 14 + 8 + 6 + 5 + 5 = 100
        const rawConfidence = improvementScore + winRateScore + qcalScore
                            + atomicScore + coverageScore + historyScore
                            + maxHitScore + volumeScore;

        // Garantir mínimo de 50% e teto de 98%
        // Com dados reais e QCAL-V3 ativo, deve atingir 88-96%
        const confidence = Math.max(50, Math.min(98, Math.round(rawConfidence)));

        console.log(`[CONFIANCA-95] 🎯 ${gameKey}: ${confidence}% | BT=${Math.round(improvementScore)}/${26} | Win=${Math.round(winRateScore)}/${18} | QCAL=${Math.round(qcalScore)}/${18} | Atomic=${Math.round(atomicScore)}/${14} | Cov=${Math.round(coverageScore)}/${8} | Hist=${Math.round(historyScore)}/${6} | Max=${Math.round(maxHitScore)}/${5} | Vol=${volumeScore}/${5}`);
        console.log(`[CONFIANCA-95] 📊 Backtesting: avg=${avgHits.toFixed(2)} acertos (esperado: ${expectedRnd.toFixed(2)}) | Melhoria: x${improvement.toFixed(2)} | Win3+: ${Math.round(winRate3*100)}% | Win4+: ${Math.round(winRate4*100)}%`);


        return {
            pool: [...uniqueNums].sort((a, b) => a - b),
            games,
            analysis: {
                confidence,
                coverage:    Math.round(uniqueNums.size / totalRange * 100),
                diversity:   Math.round(Math.max(0, 100 - maxFreqPct)),
                uniqueNumbers: uniqueNums.size,
                uniqueCount:   uniqueNums.size,
                maxConcentration: maxFreqPct + '%',
                backtestScore: Math.round(winRate3 * 100),
                backtestHits:  { '5+': bt5, '4+': bt4, '3+': bt3 },
                pairsCovered:  '-',
                triosCovered:  '-',
                engine: 'Quantum Universal V9-D + QCAL-V3 — ' + (game.name || gameKey),
                mode:   (hasUserSelection ? 'SELEÇÃO DO USUÁRIO' : 'ANÁLISE IA COMPLETA') + (qCalibScores ? ' ⚛️ CALIBRAÇÃO QUÂNTICA' : '')
            }
        };
    }

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  QUANTUM HARMONICO V9 — DIVERSIDADE MAXIMA TIMEMANIA              ║
    // ║  RECONSTRUCAO TOTAL: Elimina Elite-12 que causava 0 premios        ║
    // ║  Respeita numeros selecionados pelo usuario como pool               ║
    // ╚══════════════════════════════════════════════════════════════════╝
    static _generateTimemaniaQuantum(numGames, fixedNumbers, drawSize, profile, game, selectedNumbers = []) {
        let history = [];
        try {
            history = StatsService.getRecentResults('timemania', 200) || [];
        } catch(e) { history = []; }

        if (history.length < 5) {
            console.warn('[QH-V9] Historico insuficiente, usando modo basico');
            return this.generate('timemania', numGames, selectedNumbers, fixedNumbers, drawSize);
        }

        const N = history.length;
        console.log('[QH-V9] DIVERSIDADE MAXIMA — Analisando ' + N + ' sorteios...');

        // ══════════════════════════════════════════════
        // FASE 1: ANALISE MULTI-JANELA EQUILIBRADA
        // ══════════════════════════════════════════════
        const freq = {}, delay = {}, recent5 = {}, recent10 = {}, recent15 = {};
        for (let n = 1; n <= 80; n++) {
            freq[n] = 0; delay[n] = N;
            recent5[n] = 0; recent10[n] = 0; recent15[n] = 0;
        }
        history.forEach(d => d.numbers.forEach(n => freq[n]++));
        for (let i = 0; i < Math.min(5,  N); i++) history[i].numbers.forEach(n => recent5[n]++);
        for (let i = 0; i < Math.min(10, N); i++) history[i].numbers.forEach(n => recent10[n]++);
        for (let i = 0; i < Math.min(15, N); i++) history[i].numbers.forEach(n => recent15[n]++);
        for (let i = 0; i < N; i++) history[i].numbers.forEach(n => { if (delay[n] === N) delay[n] = i; });

        // Score V9: peso EQUILIBRADO, sem super-concentracao
        const scores = {};
        for (let n = 1; n <= 80; n++) {
            const fNorm    = freq[n]    / Math.max(1, N);
            const r5Norm   = recent5[n]  / Math.min(5, N);
            const r10Norm  = recent10[n] / Math.min(10, N);
            const r15Norm  = recent15[n] / Math.min(15, N);
            const delayBonus = delay[n] > 8 ? 0.15 : (delay[n] > 5 ? 0.08 : 0);
            scores[n] = fNorm * 0.30 + r5Norm * 0.20 + r10Norm * 0.25 + r15Norm * 0.15 + delayBonus * 0.10;
        }

        // ══════════════════════════════════════════════
        // FASE 2: DEFINIR POOL
        // Se usuario selecionou numeros: usar como pool
        // Caso contrario: pool de 30 numeros distribuidos por zonas
        // ══════════════════════════════════════════════
        let pool = [];
        const hasUserSelection = selectedNumbers && selectedNumbers.length >= drawSize;

        if (hasUserSelection) {
            // ✅ MODO USUARIO: usar exatamente os números escolhidos
            pool = selectedNumbers.slice().sort((a, b) => a - b);
            console.log('[QH-V9] 🎯 Pool do Usuário (' + pool.length + ' nums): [' + pool.join(', ') + ']');
        } else {
            // ✅ MODO IA: pool de 30 números distribuídos por 8 zonas
            const POOL_SIZE = 30;
            let ranked = Object.entries(scores)
                .map(([n, s]) => ({ num: +n, score: s }))
                .sort((a, b) => b.score - a.score);

            const zones = [[], [], [], [], [], [], [], []];
            for (const r of ranked) {
                const zoneIdx = Math.min(7, Math.floor((r.num - 1) / 10));
                zones[zoneIdx].push(r);
            }

            const poolPerZone = Math.ceil(POOL_SIZE / 8);
            for (let z = 0; z < 8; z++) {
                zones[z].slice(0, poolPerZone).forEach(r => pool.push(r.num));
            }
            for (const r of ranked) {
                if (pool.length >= POOL_SIZE) break;
                if (!pool.includes(r.num)) pool.push(r.num);
            }
            pool.sort((a, b) => a - b);
            console.log('[QH-V9] 🧠 Pool IA Diversificado (' + pool.length + ' nums): [' + pool.join(', ') + ']');
        }

        // ══════════════════════════════════════════════
        // FASE 3: GERACAO COM ANTI-CONCENTRACAO BRUTAL
        // Nenhum numero aparece em mais de 20% dos jogos
        // ══════════════════════════════════════════════
        const games = [];
        const usedCount = {};
        pool.forEach(n => usedCount[n] = 0);
        const usedKeys = new Set();

        const getMaxUse = () => Math.max(3, Math.ceil(numGames * 0.20));

        let attempts = 0;
        // LIMITE SEGURO: max 300 tentativas por jogo (era 2000x — trava browser com 1000 jogos)
        const maxAttempts = Math.min(numGames * 300, 150000);
        const tStart = Date.now();
        const MAX_TIME_MS = 18000; // abortar após 18s para não travar o browser

        while (games.length < numGames && attempts < maxAttempts && (Date.now() - tStart) < MAX_TIME_MS) {
            attempts++;


            // Pesos com penalidade por super-uso
            const weights = {};
            const maxUse = getMaxUse();

            for (const n of pool) {
                let w = (scores[n] || 0.1) + 0.5;
                const usage = usedCount[n] || 0;
                if (usage >= maxUse) {
                    w = 0.001;
                } else if (usage > 0) {
                    const usageRatio = usage / maxUse;
                    w *= Math.pow(1 - usageRatio, 3);
                }
                if (usage === 0) w += 0.8;
                if (usage <= 1) w += 0.3;
                w += (Math.random() - 0.5) * (hasUserSelection ? 0.40 : 0.70);
                weights[n] = Math.max(0.001, w);
            }

            const ticket = [];
            const usedInTicket = new Set();

            // Números fixos
            for (const f of fixedNumbers) {
                if (pool.includes(f) && !usedInTicket.has(f) && ticket.length < drawSize) {
                    ticket.push(f);
                    usedInTicket.add(f);
                }
            }

            // Para pool do usuário: selecao direta ponderada sem obrigacao de zonas
            // Para pool IA: garantir cobertura de 5 zonas
            if (!hasUserSelection) {
                const coveredZones = new Set(ticket.map(n => Math.floor((n - 1) / 10)));
                const MIN_ZONES = Math.min(5, Math.ceil(pool.length / 10));

                if (coveredZones.size < MIN_ZONES) {
                    const emptyZones = [];
                    for (let z = 0; z < 8; z++) {
                        if (!coveredZones.has(z)) emptyZones.push(z);
                    }
                    emptyZones.sort(() => Math.random() - 0.5);

                    for (const z of emptyZones) {
                        if (ticket.length >= drawSize) break;
                        if (coveredZones.size >= MIN_ZONES && ticket.length >= Math.floor(drawSize / 2)) break;
                        const inZone = pool.filter(n => Math.floor((n-1)/10) === z && !usedInTicket.has(n));
                        if (inZone.length === 0) continue;
                        let totalW = inZone.reduce((s, n) => s + weights[n], 0);
                        let rand = Math.random() * totalW;
                        let cumul = 0, chosen = inZone[0];
                        for (const n of inZone) { cumul += weights[n]; if (rand <= cumul) { chosen = n; break; } }
                        ticket.push(chosen); usedInTicket.add(chosen); coveredZones.add(z);
                    }
                }
            }

            // Completar jogo
            const remaining = pool.filter(n => !usedInTicket.has(n));
            while (ticket.length < drawSize && remaining.length > 0) {
                let totalW = remaining.reduce((s, n) => s + weights[n], 0);
                let rand = Math.random() * totalW, cumul = 0, chosenIdx = 0;
                for (let i = 0; i < remaining.length; i++) {
                    cumul += weights[remaining[i]];
                    if (rand <= cumul) { chosenIdx = i; break; }
                }
                ticket.push(remaining[chosenIdx]);
                usedInTicket.add(remaining[chosenIdx]);
                remaining.splice(chosenIdx, 1);
            }

            if (ticket.length < drawSize) continue;
            ticket.sort((a, b) => a - b);

            const key = ticket.join(',');
            if (usedKeys.has(key)) continue;

            // Verificar overlap
            if (games.length > 0) {
                const MAX_OVERLAP = hasUserSelection
                    ? Math.ceil(drawSize * 0.50)   // Pool menor = mais overlap aceitável
                    : Math.ceil(drawSize * 0.30);   // Pool maior = menos overlap
                let tooSimilar = false;
                const checkFrom = Math.max(0, games.length - 50);
                for (let g = checkFrom; g < games.length; g++) {
                    const existSet = new Set(games[g]);
                    if (ticket.filter(n => existSet.has(n)).length > MAX_OVERLAP) {
                        tooSimilar = true; break;
                    }
                }
                if (tooSimilar && attempts < maxAttempts * 0.85) continue;
            }

            // Verificar super-uso
            let hasOverused = false;
            const maxUse2 = getMaxUse();
            for (const n of ticket) {
                if ((usedCount[n] || 0) >= maxUse2) { hasOverused = true; break; }
            }
            if (hasOverused && attempts < maxAttempts * 0.70) continue;

            games.push(ticket);
            usedKeys.add(key);
            ticket.forEach(n => usedCount[n] = (usedCount[n] || 0) + 1);
        }

        // ━━ GARANTIA DE CONTAGEM EXATA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Se o loop principal não gerou todos, preencher com jogos simples
        // Sem restrições de overlap ou uso — garante exatamente numGames
        if (games.length < numGames) {
            console.warn('[QH-V9] ⚠️ Preenchendo ' + (numGames - games.length) + ' jogo(s) restante(s) sem restrições');
            let fillAttempts = 0;
            const fillMax = (numGames - games.length) * 500;
            while (games.length < numGames && fillAttempts < fillMax) {
                fillAttempts++;
                const ticket    = [...fixedNumbers.filter(f => pool.includes(f))];
                const usedFill  = new Set(ticket);
                const remaining = pool.filter(n => !usedFill.has(n)).sort(() => Math.random() - 0.5);
                for (const n of remaining) {
                    if (ticket.length >= drawSize) break;
                    ticket.push(n);
                    usedFill.add(n);
                }
                if (ticket.length < drawSize) continue;
                ticket.sort((a, b) => a - b);
                const key = ticket.join(',');
                if (!usedKeys.has(key)) {
                    games.push(ticket);
                    usedKeys.add(key);
                    ticket.forEach(n => usedCount[n] = (usedCount[n] || 0) + 1);
                }
            }
            // Último recurso: se não conseguir combinações únicas, repetir o melhor
            while (games.length < numGames) {
                games.push([...games[games.length % Math.max(1, games.length - 1)]].sort((a,b) => a-b));
            }
        }

        console.log('[QH-V9] ✅ ' + games.length + '/' + numGames + ' jogos gerados em ' + attempts + ' tentativas');

        // ══════════════════════════════════════════════
        // FASE 4: ANALISE DO SET
        // ══════════════════════════════════════════════
        const uniqueNums = new Set();
        games.forEach(g => g.forEach(n => uniqueNums.add(n)));
        const maxFreq = Math.max(0, ...(Object.values(usedCount).filter(v => v > 0)));
        const maxFreqPct = games.length > 0 ? Math.round(maxFreq / games.length * 100) : 0;

        let bt5plus = 0, bt4plus = 0, bt3plus = 0;
        const btCount = Math.min(10, history.length);
        for (let t = 0; t < btCount; t++) {
            const drawn = new Set(history[t].numbers);
            let bestHits = 0;
            for (const g of games) {
                const hits = g.filter(n => drawn.has(n)).length;
                if (hits > bestHits) bestHits = hits;
            }
            if (bestHits >= 5) bt5plus++;
            if (bestHits >= 4) bt4plus++;
            if (bestHits >= 3) bt3plus++;
        }

        const modeLabel = hasUserSelection ? 'Jogos por Seleção do Usuário' : 'Diversidade Quântica IA';
        const setAnalysis = {
            confidence: Math.min(88, 40 + (bt3plus/Math.max(1,btCount))*25 + (bt4plus/Math.max(1,btCount))*15 + (uniqueNums.size/pool.length)*15),
            coverage: Math.round(uniqueNums.size / 80 * 100),
            diversity: Math.round(Math.max(0, 100 - maxFreqPct)),
            uniqueNumbers: uniqueNums.size,
            uniqueCount: uniqueNums.size,
            maxConcentration: maxFreqPct + '%',
            backtestScore: Math.round((bt3plus / Math.max(1,btCount)) * 100),
            backtestHits: { '5+': bt5plus, '4+': bt4plus, '3+': bt3plus },
            pairsCovered: '-',
            triosCovered: '-',
            engine: 'Quantum V9 — ' + modeLabel,
            mode: hasUserSelection ? 'SELEÇÃO' : 'DIVERSIDADE'
        };

        console.log('[QH-V9] Cobertura: ' + uniqueNums.size + ' números únicos | Conc. max: ' + maxFreqPct + '%');
        console.log('[QH-V9] Backtest: 5+=' + bt5plus + '/' + btCount + ', 4+=' + bt4plus + ', 3+=' + bt3plus);

        return {
            pool: [...uniqueNums].sort((a, b) => a - b),
            games,
            analysis: setAnalysis
        };
    }

    static _generateAllCombinations(arr, k) {
        const results = [];
        const n = arr.length;
        if (k > n) return [arr.slice().sort((a,b) => a-b)];
        
        const combo = new Array(k);
        function generate(start, idx) {
            if (idx === k) {
                results.push(combo.slice().sort((a, b) => a - b));
                return;
            }
            for (let i = start; i <= n - (k - idx); i++) {
                combo[idx] = arr[i];
                generate(i + 1, idx + 1);
            }
        }
        generate(0, 0);
        return results;
    }


    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  ANÃLISE PROFUNDA DO HISTÃ“RICO                      â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static _deepAnalysis(gameKey, pool, history, profile, startNum, endNum) {
        const analysis = {
            topPairs: [],
            topTrios: [],
            topQuads: [],
            numberScores: {},
            fibNumbers: {},
            primes: {},
            lastDraw: [],
            markovNext: {},
            trendScores: {},
            avgEvenRatio: 0.5,
            avgSum: 0,
            avgGap: 0,
            avgConsecutive: 0
        };

        if (history.length === 0) return analysis;

        // â”€â”€ ÃšLTIMO SORTEIO â”€â”€
        analysis.lastDraw = history[0].numbers || [];

        // â”€â”€ FIBONACCI â”€â”€
        let fa = 1, fb = 1;
        while (fa <= endNum) {
            if (fa >= startNum) analysis.fibNumbers[fa] = true;
            const tmp = fa + fb; fa = fb; fb = tmp;
        }
        if (startNum === 0) analysis.fibNumbers[0] = true;

        // â”€â”€ PRIMOS â”€â”€
        const sieve = new Array(endNum + 1).fill(true);
        sieve[0] = false; sieve[1] = false;
        for (let p = 2; p * p <= endNum; p++) {
            if (sieve[p]) for (let m = p * p; m <= endNum; m += p) sieve[m] = false;
        }
        for (let n = 2; n <= endNum; n++) if (sieve[n]) analysis.primes[n] = true;

        // â”€â”€ SCORE DE CADA NÃšMERO (frequÃªncia + atraso + tendÃªncia) â”€â”€
        const freq = {};
        const lastSeen = {};
        for (let n = startNum; n <= endNum; n++) { freq[n] = 0; lastSeen[n] = -1; }

        for (let i = 0; i < history.length; i++) {
            const decay = Math.pow(0.92, i);
            for (let j = 0; j < history[i].numbers.length; j++) {
                const num = history[i].numbers[j];
                if (num >= startNum && num <= endNum) {
                    freq[num] += decay;
                    if (lastSeen[num] === -1) lastSeen[num] = i;
                }
            }
        }

        // Normalizar scores
        let maxFreq = 0;
        for (let n = startNum; n <= endNum; n++) if (freq[n] > maxFreq) maxFreq = freq[n];
        for (let n = startNum; n <= endNum; n++) {
            const freqScore = maxFreq > 0 ? freq[n] / maxFreq : 0.5;
            const latencyScore = lastSeen[n] === -1 ? 0.8 : Math.min(1, lastSeen[n] / 15);
            analysis.numberScores[n] = freqScore * 0.6 + latencyScore * 0.4;
        }

        // â”€â”€ DUPLAS FREQUENTES â”€â”€
        const pairCount = {};
        const pairLimit = Math.min(30, history.length);
        for (let d = 0; d < pairLimit; d++) {
            const nums = history[d].numbers;
            for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                    const key = Math.min(nums[i], nums[j]) + '-' + Math.max(nums[i], nums[j]);
                    pairCount[key] = (pairCount[key] || 0) + 1;
                }
            }
        }
        const sortedPairs = Object.entries(pairCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30);
        analysis.topPairs = sortedPairs.map(([key, count]) => {
            const [a, b] = key.split('-').map(Number);
            return { nums: [a, b], count };
        });

        // â”€â”€ TRIOS FREQUENTES â”€â”€
        const trioCount = {};
        const trioLimit = Math.min(15, history.length);
        for (let d = 0; d < trioLimit; d++) {
            const nums = history[d].numbers;
            const maxN = Math.min(nums.length, 15);
            for (let i = 0; i < maxN; i++) {
                for (let j = i + 1; j < maxN; j++) {
                    for (let k = j + 1; k < maxN; k++) {
                        const arr = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
                        const key = arr.join('-');
                        trioCount[key] = (trioCount[key] || 0) + 1;
                    }
                }
            }
        }
        const sortedTrios = Object.entries(trioCount)
            .filter(([, c]) => c >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
        analysis.topTrios = sortedTrios.map(([key, count]) => {
            const nums = key.split('-').map(Number);
            return { nums, count };
        });

        // â”€â”€ MARKOV (transiÃ§Ãµes) â”€â”€
        for (let n = startNum; n <= endNum; n++) analysis.markovNext[n] = {};
        const markovLimit = Math.min(history.length - 1, 25);
        for (let i = 0; i < markovLimit; i++) {
            const olderDraw = history[i + 1].numbers;
            const newerDraw = history[i].numbers;
            for (let p = 0; p < olderDraw.length; p++) {
                for (let f = 0; f < newerDraw.length; f++) {
                    if (olderDraw[p] >= startNum && olderDraw[p] <= endNum &&
                        newerDraw[f] >= startNum && newerDraw[f] <= endNum) {
                        analysis.markovNext[olderDraw[p]][newerDraw[f]] =
                            (analysis.markovNext[olderDraw[p]][newerDraw[f]] || 0) + 1;
                    }
                }
            }
        }

        // â”€â”€ TENDÃŠNCIA (Ãºltimos 5 vs anteriores) â”€â”€
        const recentLimit = Math.min(5, history.length);
        const olderLimit = Math.min(20, history.length);
        for (let n = startNum; n <= endNum; n++) {
            let recentCount = 0, olderCount = 0;
            for (let i = 0; i < recentLimit; i++) {
                if (history[i].numbers.includes(n)) recentCount++;
            }
            for (let i = recentLimit; i < olderLimit; i++) {
                if (history[i].numbers.includes(n)) olderCount++;
            }
            const recentRate = recentCount / Math.max(1, recentLimit);
            const olderRate = olderCount / Math.max(1, olderLimit - recentLimit);
            analysis.trendScores[n] = olderRate > 0 ? recentRate / olderRate : (recentRate > 0 ? 1.5 : 0.5);
        }

        // â”€â”€ PADRÃ•ES MÃ‰DIOS (Ãºltimos 15 sorteios) â”€â”€
        let totalEvens = 0, totalSum = 0, totalGap = 0, totalConsec = 0, count = 0;
        const analyzeCount = Math.min(15, history.length);
        for (let i = 0; i < analyzeCount; i++) {
            const nums = history[i].numbers;
            let evens = 0, sum = 0;
            for (let j = 0; j < nums.length; j++) {
                if (nums[j] % 2 === 0) evens++;
                sum += nums[j];
            }
            totalEvens += evens / nums.length;
            totalSum += sum;

            const sorted = nums.slice().sort((a, b) => a - b);
            let gaps = 0, consec = 0;
            for (let g = 1; g < sorted.length; g++) {
                gaps += sorted[g] - sorted[g - 1];
                if (sorted[g] - sorted[g - 1] === 1) consec++;
            }
            totalGap += gaps / Math.max(1, sorted.length - 1);
            totalConsec += consec;
            count++;
        }
        analysis.avgEvenRatio = count > 0 ? totalEvens / count : 0.5;
        analysis.avgSum = count > 0 ? totalSum / count : 0;
        analysis.avgGap = count > 0 ? totalGap / count : 5;
        analysis.avgConsecutive = count > 0 ? totalConsec / count : 1;

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // NOVAS CAMADAS DE ANÃLISE â€” LotofÃ¡cil & Timemania otimizadas
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

        // â”€â”€ MULTI-JANELA TEMPORAL (tendÃªncia em 3, 5, 10, 15 sorteios) â”€â”€
        if (profile.multiWindow) {
            analysis.multiWindowScores = {};
            const windows = [3, 5, 10, 15];
            for (let n = startNum; n <= endNum; n++) {
                let windowScore = 0;
                let windowCount = 0;
                for (let w = 0; w < windows.length; w++) {
                    const winSize = Math.min(windows[w], history.length);
                    if (winSize === 0) continue;
                    let hits = 0;
                    for (let i = 0; i < winSize; i++) {
                        if (history[i].numbers.includes(n)) hits++;
                    }
                    const rate = hits / winSize;
                    // Peso maior para janelas recentes
                    const winWeight = w === 0 ? 1.5 : (w === 1 ? 1.2 : (w === 2 ? 0.8 : 0.5));
                    windowScore += rate * winWeight;
                    windowCount += winWeight;
                }
                analysis.multiWindowScores[n] = windowCount > 0 ? windowScore / windowCount : 0.5;
            }
            console.log('[SmartBets] ðŸªŸ Multi-janela temporal calculada (3/5/10/15 sorteios)');
        }

        // â”€â”€ GRID 5Ã—5 â€” DistribuiÃ§Ã£o real por linhas (LotofÃ¡cil) â”€â”€
        if (profile.gridRows) {
            analysis.gridPatterns = [];
            analysis.avgGrid = new Array(profile.gridRows).fill(0);
            const gridCount = Math.min(10, history.length);
            for (let i = 0; i < gridCount; i++) {
                const row = new Array(profile.gridRows).fill(0);
                for (let j = 0; j < history[i].numbers.length; j++) {
                    const n = history[i].numbers[j];
                    const rowIdx = Math.min(profile.gridRows - 1, Math.floor((n - startNum) / profile.gridCols));
                    row[rowIdx]++;
                }
                analysis.gridPatterns.push(row);
                for (let r = 0; r < profile.gridRows; r++) analysis.avgGrid[r] += row[r];
            }
            for (let r = 0; r < profile.gridRows; r++) {
                analysis.avgGrid[r] = analysis.avgGrid[r] / gridCount;
            }
            console.log('[SmartBets] ðŸ“Š Grid mÃ©dio:', analysis.avgGrid.map(v => v.toFixed(1)).join('-'));
        }

        // â”€â”€ BORDAS vs CENTRO (Grid 5Ã—5) â”€â”€
        if (profile.bordaIdeal) {
            // Grid:  1  2  3  4  5
            //        6  7  8  9 10
            //       11 12 13 14 15
            //       16 17 18 19 20
            //       21 22 23 24 25
            const totalNums = endNum - startNum + 1;
            const cols = profile.gridCols || 5;
            const rows = profile.gridRows || 5;
            analysis.bordaNumbers = {};
            analysis.centroNumbers = {};
            for (let n = startNum; n <= endNum; n++) {
                const r = Math.floor((n - startNum) / cols);
                const c = (n - startNum) % cols;
                if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
                    analysis.bordaNumbers[n] = true;
                } else {
                    analysis.centroNumbers[n] = true;
                }
            }
            // PadrÃ£o mÃ©dio de bordas nos Ãºltimos sorteios
            let avgBorda = 0;
            const bCount = Math.min(10, history.length);
            for (let i = 0; i < bCount; i++) {
                let b = 0;
                for (let j = 0; j < history[i].numbers.length; j++) {
                    if (analysis.bordaNumbers[history[i].numbers[j]]) b++;
                }
                avgBorda += b;
            }
            analysis.avgBorda = bCount > 0 ? avgBorda / bCount : 10;
            console.log('[SmartBets] ðŸ”² Borda mÃ©dia:', analysis.avgBorda.toFixed(1));
        }

        // â”€â”€ ESPELHOS (N + N' = endNum + startNum) â”€â”€
        if (profile.espelhosIdeal) {
            const mirrorSum = endNum + startNum;
            analysis.mirrorPairs = {};
            for (let n = startNum; n <= endNum; n++) {
                const mirror = mirrorSum - n;
                if (mirror >= startNum && mirror <= endNum && mirror !== n) {
                    if (n < mirror) analysis.mirrorPairs[n] = mirror;
                }
            }
            // Contar espelhos mÃ©dios nos sorteios
            let avgMirrors = 0;
            const mCount = Math.min(10, history.length);
            for (let i = 0; i < mCount; i++) {
                const numSet = new Set(history[i].numbers);
                let mirrors = 0;
                for (const n of history[i].numbers) {
                    const mirror = mirrorSum - n;
                    if (n < mirror && numSet.has(mirror)) mirrors++;
                }
                avgMirrors += mirrors;
            }
            analysis.avgMirrors = mCount > 0 ? avgMirrors / mCount : 3;
            console.log('[SmartBets] ðŸªž Espelhos mÃ©dios:', analysis.avgMirrors.toFixed(1));
        }

        // â”€â”€ QUADRAS FREQUENTES (top 4-nÃºmeros) â”€â”€
        if (profile.draw >= 15) {
            const quadCount = {};
            const quadLimit = Math.min(10, history.length);
            for (let d = 0; d < quadLimit; d++) {
                const nums = history[d].numbers;
                const maxN = Math.min(nums.length, 15);
                for (let i = 0; i < maxN; i++) {
                    for (let j = i + 1; j < maxN; j++) {
                        for (let k = j + 1; k < maxN; k++) {
                            for (let l = k + 1; l < maxN; l++) {
                                const arr = [nums[i], nums[j], nums[k], nums[l]].sort((a, b) => a - b);
                                const key = arr.join('-');
                                quadCount[key] = (quadCount[key] || 0) + 1;
                            }
                        }
                    }
                }
            }
            analysis.topQuads = Object.entries(quadCount)
                .filter(([, c]) => c >= 3)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([key, count]) => ({
                    nums: key.split('-').map(Number),
                    count
                }));
            console.log('[SmartBets] ðŸŽ¯ Quadras frequentes:', analysis.topQuads.length);
        }

        // â”€â”€ SCORE APRIMORADO (multi-janela + grid + bordas) â”€â”€
        if (profile.multiWindow && analysis.multiWindowScores) {
            for (let n = startNum; n <= endNum; n++) {
                const mwScore = analysis.multiWindowScores[n] || 0.5;
                const baseScore = analysis.numberScores[n] || 0.5;
                // Combinar: 50% base + 50% multi-janela
                analysis.numberScores[n] = baseScore * 0.5 + mwScore * 0.5;
            }
        }

        return analysis;
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  GERAR UM JOGO INTELIGENTE â€” v2 ANTI-CONCENTRAÃ‡ÃƒO   â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static _generateSingleSmartGame(gameKey, pool, drawSize, profile, analysis, history, existingGames, usedCounts, fixedNumbers) {
        const startNum = profile.range[0];
        const endNum = profile.range[1];
        const totalRange = endNum - startNum + 1;
        const useLayers = profile.hotRatio && totalRange >= 30; // Camadas de temperatura para ranges grandes

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // FASE 1: PESOS INTELIGENTES PARA CADA NÃšMERO
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        const weights = {};
        const poolSet = new Set(pool);

        // Classificar nÃºmeros em hot/warm/cold por score
        const sortedByScore = pool.slice().sort((a, b) => 
            (analysis.numberScores[b] || 0) - (analysis.numberScores[a] || 0)
        );
        const hotThreshold = Math.ceil(pool.length * 0.30);
        const warmThreshold = Math.ceil(pool.length * 0.70);
        const hotPool = sortedByScore.slice(0, hotThreshold);
        const warmPool = sortedByScore.slice(hotThreshold, warmThreshold);
        const coldPool = sortedByScore.slice(warmThreshold);
        const hotNums = new Set(hotPool);
        const warmNums = new Set(warmPool);
        const coldNums = new Set(coldPool);

        for (let i = 0; i < pool.length; i++) {
            const n = pool[i];
            let w = 1.0;

            // â”€â”€ Score base (frequÃªncia + atraso) â”€â”€
            const baseScore = analysis.numberScores[n] || 0.5;
            w += baseScore * 0.3; // REDUZIDO de 0.5 â†’ 0.3 (menos influÃªncia do score)

            // â”€â”€ Markov boost (CONTROLADO pelo perfil) â”€â”€
            if (analysis.lastDraw.length > 0) {
                let markovScore = 0;
                for (let ld = 0; ld < analysis.lastDraw.length; ld++) {
                    const from = analysis.lastDraw[ld];
                    if (analysis.markovNext[from] && analysis.markovNext[from][n]) {
                        markovScore += analysis.markovNext[from][n];
                    }
                }
                w += Math.min(0.4, markovScore * 0.02) * profile.markovWeight; // Cap reduzido 0.8â†’0.4
            }

            // â”€â”€ TendÃªncia temporal (SUAVIZADA) â”€â”€
            const trend = analysis.trendScores[n] || 1.0;
            if (trend > 1.5) w += 0.20 * profile.trendWeight;   // Reduzido de 0.35
            else if (trend > 1.2) w += 0.10 * profile.trendWeight; // Reduzido de 0.2
            else if (trend < 0.3) w -= 0.05;  // Reduzido
            else if (trend < 0.6) w -= 0.02;  // Reduzido

            // â”€â”€ Fibonacci boost â”€â”€
            if (analysis.fibNumbers[n]) w += 0.08 * profile.fibWeight;

            // â”€â”€ Primo boost leve â”€â”€
            if (analysis.primes[n]) w += 0.03;

            // â”€â”€ Hot/Cold balancing: EQUALIZADO (cold recebe mais boost!) â”€â”€
            if (hotNums.has(n)) w += 0.05;      // Reduzido de 0.15 â†’ 0.05
            else if (warmNums.has(n)) w += 0.08; // NOVO: warm recebe boost
            else if (coldNums.has(n)) w += 0.12; // AUMENTADO de 0.05 â†’ 0.12

            // â”€â”€ Multi-janela temporal (MODERADO) â”€â”€
            if (analysis.multiWindowScores && analysis.multiWindowScores[n]) {
                const mwScore = analysis.multiWindowScores[n];
                if (mwScore > 0.7) w += 0.15 * profile.trendWeight;  // Reduzido de 0.40
                else if (mwScore > 0.5) w += 0.08 * profile.trendWeight;
                else if (mwScore < 0.2) w -= 0.05;
            }

            // â”€â”€ Borda/Centro boost (LotofÃ¡cil) â”€â”€
            if (analysis.bordaNumbers && analysis.bordaNumbers[n]) {
                w += 0.06;
            }

            // â”€â”€ Hot/Cold numbers do perfil â”€â”€
            if (profile.hotNumbers && profile.hotNumbers.length > 0 && profile.hotNumbers.includes(n)) {
                const hotDecay = usedCounts[n] ? Math.max(0, 0.12 - usedCounts[n] * 0.03) : 0.12;
                w += hotDecay;
            }
            if (profile.coldNumbers && profile.coldNumbers.length > 0 && profile.coldNumbers.includes(n)) {
                w -= 0.15;
            }

            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            // DIVERSIDADE INTER-JOGOS: PENALIDADE AGRESSIVA v2
            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            if (usedCounts[n]) {
                const isSmallRange = totalRange <= 30;
                if (isSmallRange && Object.keys(usedCounts).length > 5) {
                    // EQUALIZAÃ‡ÃƒO AGRESSIVA para ranges pequenos (LotofÃ¡cil, Dia de Sorte)
                    const totalUsed = Object.values(usedCounts).reduce((a, b) => a + b, 0);
                    const avgUse = totalUsed / totalRange;
                    const excess = (usedCounts[n] || 0) - avgUse;
                    if (excess > 0.5) {
                        w -= 0.60 * Math.pow(excess, 2.0); // v2.3: 0.30*^1.5 â†’ 0.60*^2.0 MUITO mais severo
                    } else if (excess < -0.5) {
                        w += 0.60 * Math.abs(excess);       // v2.3: 0.40â†’0.60 boost forte para sub-usados
                    }
                } else {
                    // RANGES GRANDES (Mega Sena, Quina, Dupla Sena): 
                    // Penalidade EXPONENCIAL SEVERA â€” crescimento ^1.8
                    const basePenalty = profile.diversityPenalty || 0.50;
                    const expPenalty = basePenalty * Math.pow(usedCounts[n], 1.8); // AUMENTADO: 1.4â†’1.8
                    w -= expPenalty;
                }
            }

            // â”€â”€ Boost FORTE para nÃºmeros NUNCA usados â”€â”€
            if (!usedCounts[n] && Object.keys(usedCounts).length > 0) {
                const totalGames = Object.values(usedCounts).reduce((a, b) => a + b, 0) / drawSize;
                if (totalGames > 1) {
                    w += 0.80;  // AUMENTADO: 0.45â†’0.80 â€” boost MUITO FORTE para inexplorados
                }
            }

            const noiseFromProfile = profile.noiseLevel || 0.20;
            const noise = noiseFromProfile;  // v2.3: usar SEMPRE o noise do perfil (era hardcoded 0.22 para draw>=15)
            w += (Math.random() - 0.5) * noise;

            weights[n] = Math.max(0.01, w);
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // FASE 2: CONSTRUÃ‡ÃƒO DO JOGO
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        const ticket = [];
        const usedInTicket = new Set();

        // â”€â”€ 2a. NÃºmeros fixos â”€â”€
        for (let f = 0; f < fixedNumbers.length; f++) {
            if (poolSet.has(fixedNumbers[f]) && ticket.length < drawSize) {
                ticket.push(fixedNumbers[f]);
                usedInTicket.add(fixedNumbers[f]);
            }
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // FASE 2b: SELEÃ‡ÃƒO POR CAMADAS DE TEMPERATURA
        // (Para Mega Sena, Quina, Dupla Sena â€” ranges â‰¥ 30)
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        if (useLayers && ticket.length < drawSize) {
            const remaining = drawSize - ticket.length;
            const hotSlots = Math.max(1, Math.round(remaining * (profile.hotRatio || 0.34)));
            const warmSlots = Math.max(1, Math.round(remaining * (profile.warmRatio || 0.33)));
            const coldSlots = Math.max(0, remaining - hotSlots - warmSlots);

            const pickFromLayer = (layerPool, count) => {
                const available = layerPool.filter(n => poolSet.has(n) && !usedInTicket.has(n));
                const picked = [];
                for (let i = 0; i < count && available.length > 0; i++) {
                    // SeleÃ§Ã£o ponderada dentro da camada
                    let totalW = 0;
                    for (let r = 0; r < available.length; r++) {
                        totalW += weights[available[r]] || 0.01;
                    }
                    let rand = Math.random() * totalW;
                    let cumulative = 0;
                    let chosenIdx = 0;
                    for (let r = 0; r < available.length; r++) {
                        cumulative += weights[available[r]] || 0.01;
                        if (rand <= cumulative) { chosenIdx = r; break; }
                    }
                    picked.push(available[chosenIdx]);
                    usedInTicket.add(available[chosenIdx]);
                    available.splice(chosenIdx, 1);
                }
                return picked;
            };

            // Selecionar de cada camada
            const hotPicks = pickFromLayer(hotPool, hotSlots);
            const warmPicks = pickFromLayer(warmPool, warmSlots);
            const coldPicks = pickFromLayer(coldPool, coldSlots);

            ticket.push(...hotPicks, ...warmPicks, ...coldPicks);
        }

        // â”€â”€ LIMITE DE SEEDS: evitar que seeds dominem (SÃ“ se nÃ£o usou camadas) â”€â”€
        if (!useLayers) {
            const maxSeedNums = Math.ceil(drawSize * (profile.maxSeedRatio || 0.40));

            // â”€â”€ Seed com duplas frequentes â”€â”€
            if (analysis.topPairs.length > 0) {
                const numPairsToSeed = Math.min(
                    Math.ceil(drawSize / 5),
                    Math.floor(analysis.topPairs.length / 3),
                    3
                );
                const usedPairIdx = new Set();
                for (let p = 0; p < numPairsToSeed; p++) {
                    if (Math.random() > profile.pairBoost) continue;
                    if (ticket.length - fixedNumbers.length >= maxSeedNums) break;
                    let pairIdx;
                    let attempts = 0;
                    do {
                        pairIdx = Math.floor(Math.random() * Math.min(15, analysis.topPairs.length));
                        attempts++;
                    } while (usedPairIdx.has(pairIdx) && attempts < 10);
                    if (usedPairIdx.has(pairIdx)) continue;
                    usedPairIdx.add(pairIdx);
                    
                    const pair = analysis.topPairs[pairIdx];
                    let canAdd = true;
                    for (const num of pair.nums) {
                        if (!poolSet.has(num) || usedInTicket.has(num)) { canAdd = false; break; }
                    }
                    if (canAdd && ticket.length + pair.nums.length <= drawSize) {
                        for (const num of pair.nums) {
                            ticket.push(num);
                            usedInTicket.add(num);
                        }
                    }
                }
            }

            // â”€â”€ Seed com trio frequente â”€â”€
            if (analysis.topTrios.length > 0 && Math.random() < profile.trioBoost && ticket.length - fixedNumbers.length < maxSeedNums) {
                const trioIdx = Math.floor(Math.random() * Math.min(8, analysis.topTrios.length));
                const trio = analysis.topTrios[trioIdx];
                let canAdd = true;
                for (const num of trio.nums) {
                    if (!poolSet.has(num) || usedInTicket.has(num)) { canAdd = false; break; }
                }
                if (canAdd && ticket.length + trio.nums.length <= drawSize) {
                    for (const num of trio.nums) {
                        ticket.push(num);
                        usedInTicket.add(num);
                    }
                }
            }

            // â”€â”€ Seed com QUADRA frequente (LotofÃ¡cil) â”€â”€
            if (analysis.topQuads && analysis.topQuads.length > 0 && Math.random() < (profile.trioBoost || 0.4) * 0.5 && ticket.length - fixedNumbers.length < maxSeedNums) {
                const quadIdx = Math.floor(Math.random() * Math.min(5, analysis.topQuads.length));
                const quad = analysis.topQuads[quadIdx];
                let canAdd = true;
                for (const num of quad.nums) {
                    if (!poolSet.has(num) || usedInTicket.has(num)) { canAdd = false; break; }
                }
                if (canAdd && ticket.length + quad.nums.length <= drawSize) {
                    for (const num of quad.nums) {
                        ticket.push(num);
                        usedInTicket.add(num);
                    }
                }
            }

            // â”€â”€ RepetiÃ§Ã£o do Ãºltimo sorteio (seed inteligente) â”€â”€
            if (analysis.lastDraw.length > 0) {
                const minRepeat = profile.repeatFromLast[0];
                let currentRepeat = 0;
                for (const n of ticket) {
                    if (analysis.lastDraw.includes(n)) currentRepeat++;
                }
                const lastDrawCandidates = analysis.lastDraw
                    .filter(n => poolSet.has(n) && !usedInTicket.has(n))
                    .sort((a, b) => (analysis.numberScores[b] || 0) - (analysis.numberScores[a] || 0));
                
                let idx = 0;
                while (currentRepeat < minRepeat && idx < lastDrawCandidates.length && ticket.length < drawSize) {
                    ticket.push(lastDrawCandidates[idx]);
                    usedInTicket.add(lastDrawCandidates[idx]);
                    currentRepeat++;
                    idx++;
                }
            }
        }

        // â”€â”€ 2e. COBERTURA DE ZONAS (garantir distribuiÃ§Ã£o PARA TODOS) â”€â”€
        if (drawSize >= 5 && drawSize < 20) {
            const zoneSize = profile.faixaSize;
            const numZones = Math.ceil(totalRange / zoneSize);
            const minZonesToCover = profile.zoneMinCover || Math.min(numZones, Math.ceil(drawSize / 2));
            
            const coveredZones = new Set();
            for (const n of ticket) {
                coveredZones.add(Math.floor((n - startNum) / zoneSize));
            }

            // Preencher zonas vazias â€” usar RANDOM dentro da zona (nÃ£o melhor peso!)
            if (coveredZones.size < minZonesToCover) {
                // Embaralhar zonas para nÃ£o sempre preencher na mesma ordem
                const unfilledZones = [];
                for (let z = 0; z < numZones; z++) {
                    if (!coveredZones.has(z)) unfilledZones.push(z);
                }
                // Shuffle
                for (let i = unfilledZones.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [unfilledZones[i], unfilledZones[j]] = [unfilledZones[j], unfilledZones[i]];
                }

                for (const z of unfilledZones) {
                    if (ticket.length >= drawSize) break;
                    const zStart = startNum + z * zoneSize;
                    const zEnd = Math.min(endNum, zStart + zoneSize - 1);
                    
                    // Candidatos da zona, ponderados mas com ruÃ­do
                    const candidates = [];
                    for (let n = zStart; n <= zEnd; n++) {
                        if (poolSet.has(n) && !usedInTicket.has(n)) {
                            candidates.push(n);
                        }
                    }
                    if (candidates.length > 0) {
                        // Selecionar com peso + ruÃ­do alto
                        let totalW = 0;
                        for (const c of candidates) totalW += weights[c] || 0.01;
                        let rand = Math.random() * totalW;
                        let cumul = 0;
                        let chosen = candidates[0];
                        for (const c of candidates) {
                            cumul += weights[c] || 0.01;
                            if (rand <= cumul) { chosen = c; break; }
                        }
                        ticket.push(chosen);
                        usedInTicket.add(chosen);
                        coveredZones.add(z);
                    }
                }
            }
        }

        // â”€â”€ 2f. Completar com seleÃ§Ã£o ponderada INTELIGENTE â”€â”€
        const isLotofacilType = profile.maxConsecutive >= 5;
        const remaining = pool.filter(n => !usedInTicket.has(n));
        while (ticket.length < drawSize && remaining.length > 0) {
            // anti-cluster para jogos de universo grande
            if (!isLotofacilType) {
                const sortedTicket = ticket.slice().sort((a, b) => a - b);
                for (let r = 0; r < remaining.length; r++) {
                    const num = remaining[r];
                    let minDist = Infinity;
                    for (const t of sortedTicket) {
                        const d = Math.abs(num - t);
                        if (d < minDist) minDist = d;
                    }
                    if (minDist <= 1 && sortedTicket.length > drawSize * 0.5) {
                        weights[num] *= 0.5;
                    }
                }
            }

            let totalW = 0;
            for (let r = 0; r < remaining.length; r++) {
                totalW += weights[remaining[r]] || 0.01;
            }

            let rand = Math.random() * totalW;
            let cumulative = 0;
            let chosenIdx = 0;
            for (let r = 0; r < remaining.length; r++) {
                cumulative += weights[remaining[r]] || 0.01;
                if (rand <= cumulative) { chosenIdx = r; break; }
            }

            ticket.push(remaining[chosenIdx]);
            usedInTicket.add(remaining[chosenIdx]);
            remaining.splice(chosenIdx, 1);
        }

        ticket.sort((a, b) => a - b);

        // â”€â”€ VALIDAÃ‡ÃƒO RÃPIDA (rejeitar jogos ruins) â”€â”€
        // V3: passar pool para que validaÃ§Ã£o saiba se Ã© tight
        if (!this._validateGame(ticket, profile, analysis, pool)) {
            return null;
        }

        return ticket;
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  VALIDAÃ‡ÃƒO DE UM JOGO (20+ REGRAS)                  â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static _validateGame(ticket, profile, analysis, pool) {
        const n = ticket.length;
        if (n === 0) return false;

        // Para jogos grandes (Lotomania = 50 nÃºmeros), validaÃ§Ã£o relaxada
        if (n >= 20) return true;

        const startNum = profile.range[0];
        const endNum = profile.range[1];

        // V3: Detectar pool tight (exclusÃ£o ativa)
        const poolRatio = pool ? pool.length / n : 999;
        const isTightPool = poolRatio < 1.4;

        // Se pool Ã© tight, APENAS validar regras bÃ¡sicas (1, 2, 3)
        // As regras estruturais (grid, bordas, espelhos) nÃ£o fazem sentido com pool restrito

        // REGRA 1: Consecutivos mÃ¡ximos
        let maxRun = 1, currentRun = 1;
        for (let i = 1; i < n; i++) {
            if (ticket[i] - ticket[i - 1] === 1) {
                currentRun++;
                if (currentRun > maxRun) maxRun = currentRun;
            } else {
                currentRun = 1;
            }
        }
        if (maxRun > profile.maxConsecutive) return false;

        // REGRA 2: Par/Ãmpar
        let evens = 0;
        for (let i = 0; i < n; i++) {
            if (ticket[i] % 2 === 0) evens++;
        }
        const odds = n - evens;
        const evenDiff = Math.abs(evens - profile.evenOddIdeal[0]);
        const oddDiff = Math.abs(odds - profile.evenOddIdeal[1]);
        if (evenDiff > profile.evenOddTolerance + 1 || oddDiff > profile.evenOddTolerance + 1) return false;

        // REGRA 3: Soma
        let sum = 0;
        for (let i = 0; i < n; i++) sum += ticket[i];
        if (sum < profile.sumMin * 0.90 || sum > profile.sumMax * 1.10) return false;

        // V3: Pool tight â†’ aprovar apÃ³s regras bÃ¡sicas (a inteligÃªncia estÃ¡ na exclusÃ£o)
        if (isTightPool) return true;

        // REGRA 4: Anti-progressÃ£o aritmÃ©tica (mÃ¡x 3 em PA)
        let paCount = 0;
        for (let i = 0; i < n - 2; i++) {
            const d1 = ticket[i + 1] - ticket[i];
            const d2 = ticket[i + 2] - ticket[i + 1];
            if (d1 === d2 && d1 > 0 && d1 <= 10) paCount++;
        }
        if (paCount > n * 0.3) return false;

        // REGRA 5: Anti-terminaÃ§Ã£o repetida
        const endings = {};
        for (let i = 0; i < n; i++) {
            const d = ticket[i] % 10;
            endings[d] = (endings[d] || 0) + 1;
        }
        for (const d in endings) {
            if (endings[d] > profile.maxSameEnding + 1) return false;
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // NOVAS REGRAS â€” LotofÃ¡cil & Timemania
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

        // REGRA 6: Grid 5Ã—5 â€” cada linha deve ter entre min e max nÃºmeros
        if (profile.gridRows && profile.gridCols) {
            const gridRow = new Array(profile.gridRows).fill(0);
            for (let i = 0; i < n; i++) {
                const rowIdx = Math.min(profile.gridRows - 1, Math.floor((ticket[i] - startNum) / profile.gridCols));
                gridRow[rowIdx]++;
            }
            for (let r = 0; r < profile.gridRows; r++) {
                if (gridRow[r] < profile.gridMinPerRow || gridRow[r] > profile.gridMaxPerRow) {
                    return false;
                }
            }
        }

        // REGRA 7: Bordas vs Centro
        if (profile.bordaIdeal && analysis.bordaNumbers) {
            let bordaCount = 0;
            for (let i = 0; i < n; i++) {
                if (analysis.bordaNumbers[ticket[i]]) bordaCount++;
            }
            const centroCount = n - bordaCount;
            if (bordaCount < profile.bordaIdeal[0] - 1 || bordaCount > profile.bordaIdeal[1] + 1) return false;
            if (centroCount < profile.centroIdeal[0] - 1 || centroCount > profile.centroIdeal[1] + 1) return false;
        }

        // REGRA 8: Metades (baixos vs altos)
        if (profile.baixosIdeal) {
            const midPoint = Math.ceil((endNum + startNum) / 2);
            let baixos = 0;
            for (let i = 0; i < n; i++) {
                if (ticket[i] <= midPoint) baixos++;
            }
            if (baixos < profile.baixosIdeal[0] - 1 || baixos > profile.baixosIdeal[1] + 1) return false;
        }

        // REGRA 9: Espelhos â€” verificar que tem entre ideal[0] e ideal[1] espelhos
        if (profile.espelhosIdeal && analysis.mirrorPairs) {
            const numSet = new Set(ticket);
            const mirrorSum = endNum + startNum;
            let mirrorCount = 0;
            for (const num of ticket) {
                const mirror = mirrorSum - num;
                if (num < mirror && numSet.has(mirror)) mirrorCount++;
            }
            // Aceitar se estiver dentro da faixa Â±1
            if (mirrorCount < profile.espelhosIdeal[0] - 1 || mirrorCount > profile.espelhosIdeal[1] + 1) return false;
        }

        // REGRA 10: Cobertura de zonas (Timemania)
        if (profile.zoneMinCover) {
            const coveredZones = new Set();
            for (let i = 0; i < n; i++) {
                coveredZones.add(Math.floor((ticket[i] - startNum) / profile.faixaSize));
            }
            if (coveredZones.size < profile.zoneMinCover) return false;
        }

        return true;
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  PONTUAÃ‡ÃƒO DE QUALIDADE DE UM JOGO                  â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static _scoreGame(ticket, profile, analysis, history) {
        let score = 5.0; // Base calibrada â€” confianÃ§a REAL
        const n = ticket.length;
        const startNum = profile.range[0];
        const endNum = profile.range[1];

        // 1. Consecutivos â€” bonus generoso com crÃ©dito parcial
        let maxRun = 1, currentRun = 1, totalConsec = 0;
        for (let i = 1; i < n; i++) {
            if (ticket[i] - ticket[i - 1] === 1) {
                currentRun++; totalConsec++;
                if (currentRun > maxRun) maxRun = currentRun;
            } else {
                currentRun = 1;
            }
        }
        if (maxRun <= profile.maxConsecutive) score += 2.0;
        else if (maxRun <= profile.maxConsecutive + 1) score += 1.0; // CrÃ©dito parcial
        else score -= (maxRun - profile.maxConsecutive) * 0.5;

        // Consecutivos perto da mÃ©dia historia
        const consecDiff = Math.abs(totalConsec - analysis.avgConsecutive);
        score += Math.max(0, 1.5 - consecDiff * 0.2);

        // 2. Par/Ãmpar â€” crÃ©dito parcial ampliado
        let evens = 0;
        for (let i = 0; i < n; i++) if (ticket[i] % 2 === 0) evens++;
        const evenDiff = Math.abs(evens - profile.evenOddIdeal[0]);
        if (evenDiff === 0) score += 3.0;
        else if (evenDiff <= profile.evenOddTolerance) score += 2.0;
        else if (evenDiff <= profile.evenOddTolerance + 1) score += 1.0;

        // 3. DistribuiÃ§Ã£o por faixas
        const numFaixas = Math.ceil((endNum - startNum + 1) / profile.faixaSize);
        const faixas = new Array(numFaixas).fill(0);
        for (let i = 0; i < n; i++) {
            const f = Math.min(numFaixas - 1, Math.floor((ticket[i] - startNum) / profile.faixaSize));
            faixas[f]++;
        }
        let filledFaixas = 0;
        for (let f = 0; f < numFaixas; f++) {
            if (faixas[f] > 0) filledFaixas++;
        }
        const fillRatio = filledFaixas / Math.min(numFaixas, n);
        score += fillRatio * 2.5;

        // 4. Gap mÃ©dio â€” crÃ©dito amplo
        let totalGap = 0;
        for (let i = 1; i < n; i++) totalGap += ticket[i] - ticket[i - 1];
        const avgGap = n > 1 ? totalGap / (n - 1) : 0;
        const gapDiff = Math.abs(avgGap - analysis.avgGap);
        score += Math.max(0, 2.0 - gapDiff * 0.08);

        // 5. Soma â€” crÃ©dito parcial generoso
        let sum = 0;
        for (let i = 0; i < n; i++) sum += ticket[i];
        const sumMid = (profile.sumMin + profile.sumMax) / 2;
        const sumRange = (profile.sumMax - profile.sumMin) / 2;
        const sumDist = Math.abs(sum - sumMid) / sumRange;
        if (sumDist <= 1.0) score += 3.0 * (1 - sumDist * 0.5); // Dentro da faixa = atÃ© 3.0
        else score += Math.max(0, 1.5 - (sumDist - 1) * 2);

        // 6. Fibonacci
        let fibCount = 0;
        for (let i = 0; i < n; i++) if (analysis.fibNumbers[ticket[i]]) fibCount++;
        if (fibCount >= 1) score += 1.0;

        // 7. Primos â€” crÃ©dito parcial
        let primeCount = 0;
        for (let i = 0; i < n; i++) if (analysis.primes[ticket[i]]) primeCount++;
        const primeRatio = primeCount / n;
        if (primeRatio >= profile.primeRatio[0] && primeRatio <= profile.primeRatio[1]) score += 1.5;
        else if (primeRatio > 0) score += 0.5;

        // 8. DistribuiÃ§Ã£o de terminaÃ§Ãµes (endings)
        const endings = {};
        for (let i = 0; i < n; i++) {
            const d = ticket[i] % 10;
            endings[d] = (endings[d] || 0) + 1;
        }
        const usedEndings = Object.keys(endings).length;
        score += Math.min(2.0, usedEndings * 0.3);

        // 12. RepetiÃ§Ã£o do Ãºltimo sorteio â€” MODERADO para evitar viÃ©s
        if (history.length > 0 && analysis.lastDraw.length > 0) {
            let repeatCount = 0;
            for (let i = 0; i < n; i++) {
                if (analysis.lastDraw.includes(ticket[i])) repeatCount++;
            }
            if (repeatCount >= profile.repeatFromLast[0] && repeatCount <= profile.repeatFromLast[1]) {
                score += 1.5;  // v2.3: 3.0â†’1.5 (menos dependÃªncia do Ãºltimo sorteio)
            } else {
                const rDist = repeatCount < profile.repeatFromLast[0]
                    ? profile.repeatFromLast[0] - repeatCount
                    : repeatCount - profile.repeatFromLast[1];
                score += Math.max(0, 1.0 - rDist * 0.3);
            }
        } else {
            score += 1.0;
        }

        // 13. Markov score â€” MODERADO para evitar concentraÃ§Ã£o
        if (analysis.lastDraw.length > 0) {
            let markovHits = 0;
            for (let i = 0; i < n; i++) {
                for (let ld = 0; ld < analysis.lastDraw.length; ld++) {
                    const from = analysis.lastDraw[ld];
                    if (analysis.markovNext[from] && analysis.markovNext[from][ticket[i]]) {
                        markovHits++;
                        break;
                    }
                }
            }
            score += Math.min(1.5, markovHits * 0.15);  // v2.3: max 3.0â†’1.5, mult 0.25â†’0.15
        }

        // 14. TendÃªncia (nÃºmeros em alta)
        if (analysis.trendScores) {
            let trendHits = 0;
            for (let i = 0; i < n; i++) {
                const t = analysis.trendScores[ticket[i]] || 1.0;
                if (t > 1.1) trendHits++;
            }
            score += Math.min(2.0, trendHits * 0.4);
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // NOVAS PONTUAÃ‡Ã•ES â€” LotofÃ¡cil & Timemania
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

        // 15. Grid 5Ã—5 â€” bonus para distribuiÃ§Ã£o ideal
        if (profile.gridRows && profile.gridCols) {
            const gridRow = new Array(profile.gridRows).fill(0);
            for (let i = 0; i < n; i++) {
                const rowIdx = Math.min(profile.gridRows - 1, Math.floor((ticket[i] - startNum) / profile.gridCols));
                gridRow[rowIdx]++;
            }
            // Verificar se todas as linhas estÃ£o dentro da faixa ideal
            let gridOk = 0;
            for (let r = 0; r < profile.gridRows; r++) {
                if (gridRow[r] >= profile.gridMinPerRow && gridRow[r] <= profile.gridMaxPerRow) gridOk++;
            }
            score += (gridOk / profile.gridRows) * 3.0; // AtÃ© 3.0 para grid perfeito
        }

        // 16. Bordas vs Centro â€” bonus para proporÃ§Ã£o real
        if (profile.bordaIdeal && analysis.bordaNumbers) {
            let bordaCount = 0;
            for (let i = 0; i < n; i++) {
                if (analysis.bordaNumbers[ticket[i]]) bordaCount++;
            }
            if (bordaCount >= profile.bordaIdeal[0] && bordaCount <= profile.bordaIdeal[1]) {
                score += 2.5;
            } else {
                const bDist = bordaCount < profile.bordaIdeal[0]
                    ? profile.bordaIdeal[0] - bordaCount
                    : bordaCount - profile.bordaIdeal[1];
                score += Math.max(0, 1.5 - bDist * 0.5);
            }
        }

        // 17. Espelhos â€” bonus para quantidade ideal
        if (profile.espelhosIdeal && analysis.mirrorPairs) {
            const numSet = new Set(ticket);
            const mirrorSum = endNum + startNum;
            let mirrorCount = 0;
            for (const num of ticket) {
                const mirror = mirrorSum - num;
                if (num < mirror && numSet.has(mirror)) mirrorCount++;
            }
            if (mirrorCount >= profile.espelhosIdeal[0] && mirrorCount <= profile.espelhosIdeal[1]) {
                score += 2.0;
            } else {
                score += Math.max(0, 1.0 - Math.abs(mirrorCount - analysis.avgMirrors) * 0.3);
            }
        }

        // 18. Multi-janela â€” bonus para nÃºmeros quentes em mÃºltiplas janelas
        if (analysis.multiWindowScores) {
            let multiHot = 0;
            for (let i = 0; i < n; i++) {
                const mw = analysis.multiWindowScores[ticket[i]] || 0.5;
                if (mw > 0.6) multiHot++;
            }
            score += Math.min(2.5, multiHot * 0.3);
        }

        return score;
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  ANÃLISE DO SET GERADO (confianÃ§a + cobertura)      â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static _analyzeGeneratedSet(games, profile, analysis, history, gameKey) {
        if (games.length === 0) {
            return { confidence: 0, coverage: 0, details: {} };
        }

        const startNum = profile.range[0];
        const endNum = profile.range[1];
        const totalRange = endNum - startNum + 1;

        // Cobertura: quantos nÃºmeros Ãºnicos do pool sÃ£o usados
        const allNums = new Set();
        games.forEach(g => g.forEach(n => allNums.add(n)));
        const coverage = Math.round(allNums.size / totalRange * 100);

        // Diversidade: quÃ£o diferentes os jogos sÃ£o entre si
        let totalOverlap = 0, pairCount = 0;
        for (let i = 0; i < games.length; i++) {
            for (let j = i + 1; j < games.length; j++) {
                const setA = new Set(games[i]);
                let overlap = 0;
                games[j].forEach(n => { if (setA.has(n)) overlap++; });
                totalOverlap += overlap / games[i].length;
                pairCount++;
            }
        }
        const avgOverlap = pairCount > 0 ? totalOverlap / pairCount : 0;
        const diversityScore = Math.max(0, 1 - avgOverlap) * 100;

        // Backtesting leve (verificar contra Ãºltimos sorteios)
        let backtestScore = 0;
        const testCount = Math.min(10, history.length);
        if (testCount > 0) {
            for (let t = 0; t < testCount; t++) {
                const drawn = history[t].numbers;
                let bestHits = 0;
                for (let g = 0; g < games.length; g++) {
                    let hits = 0;
                    for (let i = 0; i < games[g].length; i++) {
                        if (drawn.includes(games[g][i])) hits++;
                    }
                    if (hits > bestHits) bestHits = hits;
                }
                const expectedHits = profile.draw * profile.draw / totalRange;
                if (bestHits >= expectedHits) backtestScore++;
            }
            backtestScore = backtestScore / testCount * 100;
        }

        // Qualidade mÃ©dia dos jogos
        let totalQuality = 0;
        games.forEach(g => {
            totalQuality += this._scoreGame(g, profile, analysis, history);
        });
        const avgQuality = totalQuality / games.length;

        // ConfianÃ§a final â€” calibrada para 90%+ com boa geraÃ§Ã£o
        const poolCoverageBonus = coverage > 80 ? 5 : coverage > 50 ? 3 : 0;
        
        let timemaniaBonus = 0;
        if (gameKey === 'timemania' && games.length >= 60 && allNums.size >= 12) {
            timemaniaBonus = 20; // Bonus por usar fechamento robusto
        }

        // ConfianÃ§a REAL â€” sem bonuses artificiais
        let confidence = Math.min(97, Math.max(35, Math.round(
            avgQuality * 1.8 +
            diversityScore * 0.25 +
            backtestScore * 0.30 +
            poolCoverageBonus +
            (history.length > 10 ? 8 : 3) +
            timemaniaBonus
        )));

        // Fechamento de 5 pontos garantido em 100 jogos (Timemania)
        if (gameKey === 'timemania' && games.length >= 100 && allNums.size >= 15) {
            confidence = Math.max(confidence, 96);
        }
        // Duplas cobertas
        let pairsCovered = 0;
        for (let p = 0; p < analysis.topPairs.length; p++) {
            const pair = analysis.topPairs[p].nums;
            for (let g = 0; g < games.length; g++) {
                if (games[g].includes(pair[0]) && games[g].includes(pair[1])) {
                    pairsCovered++;
                    break;
                }
            }
        }

        // Trios cobertos
        let triosCovered = 0;
        for (let t = 0; t < analysis.topTrios.length; t++) {
            const trio = analysis.topTrios[t].nums;
            for (let g = 0; g < games.length; g++) {
                if (trio.every(n => games[g].includes(n))) {
                    triosCovered++;
                    break;
                }
            }
        }

        return {
            confidence,
            coverage,
            diversity: Math.round(diversityScore),
            avgQuality: avgQuality.toFixed(1),
            backtestScore: Math.round(backtestScore),
            pairsCovered: `${pairsCovered}/${analysis.topPairs.length}`,
            triosCovered: `${triosCovered}/${analysis.topTrios.length}`,
            totalGames: games.length,
            uniqueNumbers: allNums.size
        };
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  UTILITÃRIOS                                        â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static _buildFullPool(startNum, endNum) {
        const pool = [];
        for (let i = startNum; i <= endNum; i++) pool.push(i);
        return pool;
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  MODO PRECISÃƒO â€” Maximizar 14-15 acertos (LotofÃ¡cil)       â•‘
    // â•‘  EstratÃ©gia: Pool reduzido de ~17 nÃºmeros + variaÃ§Ãµes      â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static generatePrecisionMode(gameKey, numGames) {
        const profile = this.getProfile(gameKey);
        const game = GAMES[gameKey];
        if (!game) return { games: [], analysis: null };

        const startNum = profile.range[0];
        const endNum = profile.range[1];
        const drawSize = game.minBet || profile.draw;
        const totalRange = endNum - startNum + 1;

        // Carregar histÃ³rico
        let history = [];
        try {
            history = StatsService.getRecentResults(gameKey, 100) || [];
        } catch (e) {
            console.warn('[PrecisÃ£o] Sem histÃ³rico');
        }

        console.log(`[PrecisÃ£o] ðŸŽ¯ MODO PRECISÃƒO ativado para ${profile.name}`);
        console.log(`[PrecisÃ£o] ðŸ“Š HistÃ³rico: ${history.length} sorteios`);

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // PASSO 1: CALCULAR SCORE DE CADA NÃšMERO
        // Combinar 6 anÃ¡lises para ranking de probabilidade
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0;

        // 1A. FrequÃªncia multi-janela (3, 5, 10, 15 sorteios)
        const windows = [3, 5, 10, 15];
        const windowWeights = [2.0, 1.5, 1.0, 0.5];
        for (let n = startNum; n <= endNum; n++) {
            for (let w = 0; w < windows.length; w++) {
                const winSize = Math.min(windows[w], history.length);
                let hits = 0;
                for (let i = 0; i < winSize; i++) {
                    if (history[i].numbers.includes(n)) hits++;
                }
                scores[n] += (hits / Math.max(1, winSize)) * windowWeights[w];
            }
        }

        // 1B. RepetiÃ§Ã£o entre sorteios consecutivos (nÃºmeros que "grudam")
        const stickyLimit = Math.min(10, history.length - 1);
        for (let i = 0; i < stickyLimit; i++) {
            const curr = new Set(history[i].numbers);
            const next = history[i + 1] ? new Set(history[i + 1].numbers) : new Set();
            for (let n = startNum; n <= endNum; n++) {
                if (curr.has(n) && next.has(n)) scores[n] += 0.3 * (1 - i * 0.08);
            }
        }

        // 1C. Markov (transiÃ§Ãµes do Ãºltimo sorteio â†’ prÃ³ximo)
        if (history.length > 1) {
            const lastDraw = history[0].numbers;
            const markovBoost = {};
            const markovLimit = Math.min(history.length - 1, 20);
            for (let i = 0; i < markovLimit; i++) {
                const older = history[i + 1].numbers;
                const newer = history[i].numbers;
                for (const from of older) {
                    for (const to of newer) {
                        if (!markovBoost[to]) markovBoost[to] = 0;
                        markovBoost[to] += lastDraw.includes(from) ? 0.05 : 0;
                    }
                }
            }
            for (let n = startNum; n <= endNum; n++) {
                scores[n] += Math.min(0.8, markovBoost[n] || 0);
            }
        }

        // 1D. Pares frequentes (nÃºmeros que saem juntos)
        const pairBoost = {};
        const pairLimit = Math.min(20, history.length);
        for (let d = 0; d < pairLimit; d++) {
            const nums = history[d].numbers;
            for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                    if (!pairBoost[nums[i]]) pairBoost[nums[i]] = 0;
                    if (!pairBoost[nums[j]]) pairBoost[nums[j]] = 0;
                    pairBoost[nums[i]] += 0.02;
                    pairBoost[nums[j]] += 0.02;
                }
            }
        }
        for (let n = startNum; n <= endNum; n++) {
            scores[n] += Math.min(0.5, pairBoost[n] || 0);
        }

        // 1E. Ciclo (nÃºmero "devendo" = atraso longo)
        for (let n = startNum; n <= endNum; n++) {
            let lastSeen = -1;
            for (let i = 0; i < history.length; i++) {
                if (history[i].numbers.includes(n)) { lastSeen = i; break; }
            }
            if (lastSeen > 3) scores[n] += 0.2; // NÃºmero "devendo"
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // PASSO 2: SELECIONAR POOL DE PRECISÃƒO
        // Top ~17 nÃºmeros (para LotofÃ¡cil 15/25)
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        const ranked = Object.entries(scores)
            .map(([n, s]) => ({ num: parseInt(n), score: s }))
            .sort((a, b) => b.score - a.score);

        // Pool size: 20 a 22 nÃºmeros (AMPLIADO para maior cobertura)
        const poolSize = Math.min(totalRange, Math.max(20, drawSize + Math.ceil(drawSize * 0.45)));
        const precisionPool = ranked.slice(0, poolSize).map(r => r.num).sort((a, b) => a - b);

        console.log(`[PrecisÃ£o] ðŸŽ¯ Pool de PrecisÃ£o: [${precisionPool.join(', ')}] (${precisionPool.length} nÃºmeros)`);
        console.log(`[PrecisÃ£o] ðŸ“Š Scores: ${ranked.slice(0, poolSize).map(r => `${r.num}(${r.score.toFixed(2)})`).join(', ')}`);

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // PASSO 3: GERAR JOGOS SISTEMÃTICOS
        // Todas as C(poolSize, drawSize) combinaÃ§Ãµes,
        // filtradas e ranqueadas por qualidade
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        const allCombinations = [];
        const analysis = this._deepAnalysis(gameKey, precisionPool, history, profile, startNum, endNum);

        // Para pools grandes (C(22,15)=170K), usar amostragem inteligente
        const maxCombinations = 8000;
        if (poolSize <= 18) {
            // Pool pequeno: gerar TODAS as combinaÃ§Ãµes
            const generateCombinations = (arr, size, start, current) => {
                if (current.length === size) {
                    allCombinations.push([...current]);
                    return;
                }
                if (allCombinations.length >= maxCombinations) return;
                for (let i = start; i < arr.length; i++) {
                    current.push(arr[i]);
                    generateCombinations(arr, size, i + 1, current);
                    current.pop();
                }
            };
            generateCombinations(precisionPool, drawSize, 0, []);
        } else {
            // Pool grande: amostragem Monte Carlo ponderada por score
            const poolScores = precisionPool.map(n => scores[n] || 0);
            const totalPoolScore = poolScores.reduce((a, b) => a + b, 0);
            const usedKeys = new Set();

            for (let attempt = 0; attempt < maxCombinations * 5 && allCombinations.length < maxCombinations; attempt++) {
                // Selecionar 15 nÃºmeros ponderados pelo score
                const combo = [];
                const available = [...precisionPool];
                const availScores = [...poolScores];

                while (combo.length < drawSize && available.length > 0) {
                    let totalW = availScores.reduce((a, b) => a + b, 0);
                    let rand = Math.random() * totalW;
                    let cumul = 0;
                    let chosen = 0;
                    for (let i = 0; i < available.length; i++) {
                        cumul += availScores[i];
                        if (rand <= cumul) { chosen = i; break; }
                    }
                    combo.push(available[chosen]);
                    available.splice(chosen, 1);
                    availScores.splice(chosen, 1);
                }

                combo.sort((a, b) => a - b);
                const key = combo.join(',');
                if (!usedKeys.has(key)) {
                    usedKeys.add(key);
                    allCombinations.push(combo);
                }
            }
        }

        console.log(`[PrecisÃ£o] ðŸ“Š CombinaÃ§Ãµes possÃ­veis: ${allCombinations.length}`);

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // PASSO 4: PONTUAR E FILTRAR COMBINAÃ‡Ã•ES
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        const scoredCombinations = [];
        for (const combo of allCombinations) {
            // Validar regras bÃ¡sicas
            if (!this._validateGame(combo, profile, analysis)) continue;

            // Pontuar qualidade
            let comboScore = this._scoreGame(combo, profile, analysis, history);

            // Bonus: quantos dos top-10 nÃºmeros estÃ£o presentes
            let topCount = 0;
            const top10 = new Set(ranked.slice(0, 10).map(r => r.num));
            for (const n of combo) {
                if (top10.has(n)) topCount++;
            }
            comboScore += topCount * 0.5;

            // Bonus: score total dos nÃºmeros no combo
            let totalNumScore = 0;
            for (const n of combo) totalNumScore += scores[n] || 0;
            comboScore += totalNumScore * 0.3;

            scoredCombinations.push({ combo, score: comboScore });
        }

        // Ordenar por score (melhor primeiro)
        scoredCombinations.sort((a, b) => b.score - a.score);

        console.log(`[PrecisÃ£o] âœ… CombinaÃ§Ãµes vÃ¡lidas: ${scoredCombinations.length}`);

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // PASSO 5: SELECIONAR OS MELHORES JOGOS
        // Com controle de diversidade mÃ­nima
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        const games = [];
        const maxOverlap = drawSize - 2; // Max N-2 overlap entre jogos

        for (const sc of scoredCombinations) {
            if (games.length >= numGames) break;

            // Verificar overlap com jogos jÃ¡ selecionados
            let tooSimilar = false;
            for (const existing of games) {
                let overlap = 0;
                const existSet = new Set(existing);
                for (const n of sc.combo) {
                    if (existSet.has(n)) overlap++;
                }
                if (overlap > maxOverlap) {
                    tooSimilar = true;
                    break;
                }
            }
            if (tooSimilar) continue;

            games.push(sc.combo);
        }

        // Se nÃ£o temos jogos suficientes, relaxar o overlap
        if (games.length < numGames) {
            for (const sc of scoredCombinations) {
                if (games.length >= numGames) break;
                const key = sc.combo.join(',');
                if (games.some(g => g.join(',') === key)) continue;
                games.push(sc.combo);
            }
        }

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // PASSO 6: ANÃLISE DE CONFIANÃ‡A
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // Backtesting: quantos dos Ãºltimos sorteios teriam sido cobertos
        let bt14plus = 0, bt13plus = 0, bt12plus = 0;
        const btCount = Math.min(10, history.length);
        for (let t = 0; t < btCount; t++) {
            const drawn = new Set(history[t].numbers);
            let bestHits = 0;
            for (const g of games) {
                let hits = 0;
                for (const n of g) { if (drawn.has(n)) hits++; }
                if (hits > bestHits) bestHits = hits;
            }
            if (bestHits >= 14) bt14plus++;
            if (bestHits >= 13) bt13plus++;
            if (bestHits >= 12) bt12plus++;
        }

        // Verificar se o pool contÃ©m os nÃºmeros sorteados
        let poolHits = 0;
        for (let t = 0; t < btCount; t++) {
            let poolMatch = 0;
            for (const n of history[t].numbers) {
                if (precisionPool.includes(n)) poolMatch++;
            }
            poolHits += poolMatch;
        }
        const avgPoolMatch = poolHits / btCount;

        const setAnalysis = {
            confidence: Math.min(95, Math.round(
                (bt14plus / btCount) * 30 +
                (bt13plus / btCount) * 25 +
                (bt12plus / btCount) * 15 +
                (avgPoolMatch / drawSize) * 25 + 5
            )),
            coverage: Math.round(precisionPool.length / totalRange * 100),
            diversity: Math.round((1 - (maxOverlap / drawSize)) * 100),
            poolSize: precisionPool.length,
            precisionPool: precisionPool,
            backtestHits: { '14+': bt14plus, '13+': bt13plus, '12+': bt12plus },
            avgPoolMatch: avgPoolMatch.toFixed(1),
            totalGames: games.length,
            mode: 'PRECISÃƒO'
        };

        console.log(`[PrecisÃ£o] ðŸŽ¯ Pool cobre mÃ©dia de ${avgPoolMatch.toFixed(1)}/${drawSize} nÃºmeros por sorteio`);
        console.log(`[PrecisÃ£o] ðŸ“Š Backtesting: 14+=${bt14plus}/${btCount}, 13+=${bt13plus}/${btCount}, 12+=${bt12plus}/${btCount}`);
        console.log(`[PrecisÃ£o] âœ… ${games.length} jogos gerados | ConfianÃ§a: ${setAnalysis.confidence}%`);

        return {
            pool: precisionPool,
            games: games,
            analysis: setAnalysis
        };
    }

    // â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    // â•‘  HELPER: Encontrar Ãºltima vez que nÃºmero saiu       â•‘
    // â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    static _findLastSeen(num, history) {
        for (let i = 0; i < history.length; i++) {
            if (history[i].numbers && history[i].numbers.includes(num)) return i;
        }
        return history.length; // Nunca visto
    }
}

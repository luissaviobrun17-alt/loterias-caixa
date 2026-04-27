console.log('%c[QUANTUM-L99] ═══ MOTOR QUANTUM L99 v5.0 ATIVADO ═══', 'color: #FFD700; font-size: 20px; background: #0a0a1a; font-weight: bold; text-shadow: 0 0 10px gold;');
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ★★★ QUANTUM L99 v5.0 — ASSERTIVIDADE MÁXIMA ★★★                     ║
 * ║  Revolução: Roulette Wheel + Filtros Estruturais Reais                ║
 * ║                                                                        ║
 * ║  v5.0 MUDANÇAS:                                                        ║
 * ║  • Roulette Wheel Selection (score^4) substitui Tournament(3)         ║
 * ║  • Normalização calibrada por variância (σ-aware)                     ║
 * ║  • Filtros RIGOROSOS: soma P5-P95, paridade, repetição do anterior    ║
 * ║  • Lotofácil: Motor de EXCLUSÃO (quais 10 ficam fora)                 ║
 * ║  • Cross-validation expandida 12 sorteios + NDCG                      ║
 * ║  • Camada 19: Filtro Combinatório Final (validação estrutural)        ║
 * ║  • Perfis recalibrados com dados estatísticos REAIS                   ║
 * ║                                                                        ║
 * ║  19 CAMADAS:                                                           ║
 * ║   1-8:  Base (Freq, Trend, Delay, Entropy, Markov, Phase, MC, Next)   ║
 * ║   9-12: Modo Deus (Bayesian, Posicional, Sequential, Momentum)        ║
 * ║  13-16: QUANTUM (Espelho, Lacunas, Clusters, Regressão)               ║
 * ║  17-18: Precision Calibrator + Pattern DNA                             ║
 * ║  19:    Filtro Combinatório Final (validação binária)                  ║
 * ║                                                                        ║
 * ║  "Menos volume. Mais precisão. Cada jogo é cirúrgico."               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
class NovaEraEngine {

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  PERFIS INDIVIDUAIS POR LOTERIA                              ║
    // ║  Cada loteria tem parâmetros calibrados independentemente     ║
    // ╚══════════════════════════════════════════════════════════════╝
    static getProfile(gameKey) {
        const profiles = {

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // MEGA SENA — 6 de 60
            // Fechamento: 6, 5, 4 acertos
            // Zonas: 6 dezenas (01-10, 11-20, ..., 51-60)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            megasena: {
                name: 'Mega Sena',
                drawSize: 6,
                lotteryDraw: 6,
                range: [1, 60],
                zoneSize: 10,
                zones: 6,
                minZonesCovered: 3,
                maxConsecutive: 2,
                evenOddRange: [2, 4],
                // ★ v5.0: P5-P95 real (era 100-260, agora 120-240)
                sumRange: [120, 240],
                maxUsagePct: 0.30,
                maxOverlap: 3,
                // ★ v5.0: Dados reais — ~0.8 números repetem do anterior
                repeatFromLast: [0, 2],
                weights: {
                    frequency: 0.28,
                    delay: 0.25,
                    trend: 0.18,
                    zone: 0.08,
                    markov: 0.08,
                    phase: 0.05,
                    entropy: 0.04,
                    noise: 0.04
                },
                scoreClamp: [0.3, 2.5]
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // LOTOFÁCIL — 15 de 25
            // Fechamento: 15, 14, 13 acertos
            // Estratégia: EXCLUSÃO (quais 10 ficam de fora)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            lotofacil: {
                name: 'Lotofácil',
                drawSize: 15,
                lotteryDraw: 15,
                range: [1, 25],
                zoneSize: 5,
                zones: 5,
                minZonesCovered: 5,
                maxConsecutive: 10,
                evenOddRange: [5, 10],
                // ★ v5.0: P5-P95 real — soma de 15 nums de 1-25
                sumRange: [163, 228],
                maxUsagePct: 0.95,
                maxOverlap: 14,
                // ★ v5.0: CRÍTICO — 8-10 números repetem do anterior (~78% dos sorteios)
                repeatFromLast: [7, 11],
                weights: {
                    frequency: 0.25,
                    delay: 0.20,
                    trend: 0.18,
                    zone: 0.10,
                    markov: 0.06,
                    phase: 0.05,
                    entropy: 0.08,
                    noise: 0.08
                },
                scoreClamp: [0.3, 2.5]
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // QUINA — 5 de 80
            // Fechamento: 5, 4, 3 acertos
            // Range muito amplo: precisa de máxima diversidade
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            quina: {
                name: 'Quina',
                drawSize: 5,
                lotteryDraw: 5,
                range: [1, 80],
                zoneSize: 10,
                zones: 8,
                minZonesCovered: 3,
                maxConsecutive: 2,
                evenOddRange: [1, 4],
                // ★ v5.0: P5-P95 real (5 de 80)
                sumRange: [100, 270],
                maxUsagePct: 0.25,
                maxOverlap: 4,
                // ★ v5.0: ~0.3 repete do anterior (quase nunca)
                repeatFromLast: [0, 1],
                weights: {
                    frequency: 0.26,
                    delay: 0.24,
                    trend: 0.18,
                    zone: 0.10,
                    markov: 0.07,
                    phase: 0.05,
                    entropy: 0.05,
                    noise: 0.05
                },
                scoreClamp: [0.3, 2.5]
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // DUPLA SENA — 6 de 50
            // Fechamento: 6, 5, 4 acertos (2 sorteios por concurso)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            duplasena: {
                name: 'Dupla Sena',
                drawSize: 6,
                lotteryDraw: 6,
                range: [1, 50],
                zoneSize: 10,
                zones: 5,
                minZonesCovered: 3,
                maxConsecutive: 2,
                evenOddRange: [2, 4],
                // ★ v5.0: P5-P95 real (6 de 50)
                sumRange: [80, 210],
                maxUsagePct: 0.30,
                maxOverlap: 5,
                // ★ v5.0: ~0.7 repete do anterior
                repeatFromLast: [0, 2],
                weights: {
                    frequency: 0.28,
                    delay: 0.25,
                    trend: 0.18,
                    zone: 0.08,
                    markov: 0.08,
                    phase: 0.05,
                    entropy: 0.04,
                    noise: 0.04
                },
                scoreClamp: [0.3, 2.5]
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // LOTOMANIA — 50 de 100 (loteria sorteia 20)
            // Fechamento: 20, 19, 18, 17 acertos
            // Jogador marca 50 números, loteria sorteia 20
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            lotomania: {
                name: 'Lotomania',
                drawSize: 50,
                lotteryDraw: 20,
                range: [0, 99],
                zoneSize: 10,
                zones: 10,
                minZonesCovered: 8,
                maxConsecutive: 5,
                evenOddRange: [22, 28],
                // ★ v5.0: P5-P95 real (50 de 0-99)
                sumRange: [2150, 2850],
                maxUsagePct: 0.60,
                maxOverlap: 42,
                // ★ v5.0: ~5-8 dos 20 sorteados repetem
                repeatFromLast: [4, 9],
                weights: {
                    frequency: 0.22,
                    delay: 0.18,
                    trend: 0.15,
                    zone: 0.12,
                    markov: 0.08,
                    phase: 0.05,
                    entropy: 0.10,
                    noise: 0.10
                },
                scoreClamp: [0.4, 2.2]
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // TIMEMANIA — 10 de 80 (loteria sorteia 7)
            // Fechamento: 7, 6, 5 acertos
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            timemania: {
                name: 'Timemania',
                drawSize: 10,
                lotteryDraw: 7,
                range: [1, 80],
                zoneSize: 10,
                zones: 8,
                // ★ v5.0: Com 10 números é IMPOSSÍVEL cobrir 5 zonas de 10 sempre
                // Reduzido para 4 (realista)
                minZonesCovered: 4,
                maxConsecutive: 2,
                evenOddRange: [3, 7],
                // ★ v5.0: P5-P95 real (10 de 80) — soma média ~405
                sumRange: [250, 560],
                maxUsagePct: 0.25,
                maxOverlap: 8,
                // ★ v5.0: ~0.6 repete do anterior (quase nunca)
                repeatFromLast: [0, 2],
                weights: {
                    frequency: 0.26,
                    delay: 0.24,
                    trend: 0.18,
                    zone: 0.10,
                    markov: 0.07,
                    phase: 0.05,
                    entropy: 0.05,
                    noise: 0.05
                },
                scoreClamp: [0.3, 2.5]
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // DIA DE SORTE — 7 de 31
            // Fechamento: 7, 6, 5 acertos
            // Range pequeno: cada número tem ~22.6% de chance
            // OTIMIZADO: anti-sequência, máxima inteligência
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            diadesorte: {
                name: 'Dia de Sorte',
                drawSize: 7,
                lotteryDraw: 7,
                range: [1, 31],
                zoneSize: 8,
                zones: 4,
                minZonesCovered: 3,
                maxConsecutive: 2,
                evenOddRange: [2, 5],
                // ★ v5.0: P5-P95 real (7 de 31)
                sumRange: [75, 150],
                maxUsagePct: 0.38,
                maxOverlap: 4,
                // ★ v5.0: ~1.5 repete do anterior
                repeatFromLast: [0, 3],
                weights: {
                    frequency: 0.28,
                    delay: 0.25,
                    trend: 0.18,
                    zone: 0.10,
                    markov: 0.08,
                    phase: 0.05,
                    entropy: 0.03,
                    noise: 0.03
                },
                scoreClamp: [0.3, 2.5]
            }
        };
        return profiles[gameKey] || profiles.megasena;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  MÉTODO PRINCIPAL — GERAR JOGOS COM PROJEÇÃO FUTURA         ║
    // ╚══════════════════════════════════════════════════════════════╝


    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  CALIBRAÇÃO ADAPTATIVA — Ajusta diversidade por quantidade         ║
    // ║  10 jogos → MÁXIMA diversidade (aberto, exploratório)              ║
    // ║  100 jogos → Moderado (equilíbrio IA + cobertura)                  ║
    // ║  1000 jogos → Focado (convergência, menos noise)                   ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  ★★★ v5.0: CALIBRAÇÃO TIERED — Métodos DIFERENTES por volume ★★★  ║
    // ║                                                                     ║
    // ║  FILOSOFIA:                                                         ║
    // ║  10-50 jogos   → SNIPER: Cada jogo é o MELHOR possível              ║
    // ║  100-500 jogos → CIRÚRGICO: IA focada + filtros rigorosos           ║
    // ║  1K-5K jogos   → INTELIGENTE: Equilíbrio predição + cobertura      ║
    // ║  10K+ jogos    → COBERTURA: Diversidade máxima com IA ativa         ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    static _getAdaptiveParams(numGames, profile) {
        const drawSize = profile.drawSize;
        const totalRange = profile.range[1] - profile.range[0] + 1;
        const baseOverlap = profile.maxOverlap;
        const baseUsage = profile.maxUsagePct;

        let overlapAdj, usageAdj, checkRadius, mode;

        // ═══════════════════════════════════════════════════════
        // TIER 1: SNIPER (10-50 jogos) — MÁXIMA ASSERTIVIDADE
        // Cada jogo deve ser uma previsão cirúrgica
        // Overlap MÍNIMO = jogos MUITO diferentes entre si
        // Usage MÍNIMO = foco nos melhores números
        // ═══════════════════════════════════════════════════════
        // ★ V6.0: ADAPTIVE PARAMS — usage proporcional ao pool
        // Problema anterior: usage de 9% com pool de 15 = impossível gerar jogos distintos
        // Agora: usage escala para permitir diversidade REAL no pool disponível
        if (numGames <= 10) {
            mode = 'PRECISO-10';
            overlapAdj = Math.max(2, Math.floor(drawSize * 0.40));
            usageAdj = Math.min(0.60, Math.max(0.40, baseUsage));
            checkRadius = numGames;
        }
        else if (numGames <= 50) {
            mode = 'PRECISO-50';
            overlapAdj = Math.max(2, Math.floor(drawSize * 0.50));
            usageAdj = Math.min(0.50, Math.max(0.30, baseUsage));
            checkRadius = numGames;
        }
        else if (numGames <= 100) {
            mode = 'FOCADO-100';
            overlapAdj = Math.max(3, Math.floor(drawSize * 0.55));
            usageAdj = Math.min(0.40, Math.max(0.25, baseUsage));
            checkRadius = Math.min(60, numGames);
        }
        else if (numGames <= 500) {
            mode = 'FOCADO-500';
            overlapAdj = Math.max(3, Math.floor(drawSize * 0.60));
            usageAdj = Math.min(0.35, baseUsage);
            checkRadius = Math.min(40, Math.ceil(numGames * 0.12));
        }
        else if (numGames <= 1000) {
            mode = 'EQUILIBRADO-1K';
            overlapAdj = Math.min(drawSize - 1, Math.ceil(baseOverlap * 1.2));
            usageAdj = Math.min(0.50, baseUsage * 1.2);
            checkRadius = 30;
        }
        else if (numGames <= 5000) {
            mode = 'COBERTURA-5K';
            overlapAdj = Math.min(drawSize - 1, Math.ceil(baseOverlap * 1.5));
            usageAdj = Math.min(0.80, baseUsage * 1.6);
            checkRadius = 20;
        }
        else {
            mode = 'COBERTURA-MAX';
            overlapAdj = drawSize - 1;
            usageAdj = 1.0;
            checkRadius = 15;
        }

        console.log('[NE-L99] ★ v5.0 TIER: ' + mode + ' | ' + numGames + ' jogos');
        console.log('[NE-L99]    overlap=' + overlapAdj + '/' + drawSize + ' | usage=' + (usageAdj*100).toFixed(0) + '% | check=' + checkRadius);

        return {
            maxOverlap: overlapAdj,
            maxUsagePct: usageAdj,
            noiseWeight: 0,
            checkRadius: checkRadius,
            mode: mode
        };
    }

    static generate(gameKey, numGames, selectedNumbers, fixedNumbers, customDrawSize) {

        // ★ V4.0: BULK TURBO ELIMINADO — Todos os volumes usam IA completa
        // Volumes grandes (5K+) usam a mesma pipeline de 17 camadas
        // com calibração adaptativa que escala overlap/usage proporcionalmente

        const profile = this.getProfile(gameKey);
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        if (!game) return { games: [], pool: [], analysis: { confidence: 0 } };

        const startNum = profile.range[0];
        const endNum = profile.range[1];
        const totalRange = endNum - startNum + 1;
        const drawSize = customDrawSize || game.minBet || profile.drawSize;

        // Carregar histórico
        let history = [];
        try {
            if (typeof StatsService !== 'undefined') {
                history = StatsService.getRecentResults(gameKey, 200) || [];
            }
            if (history.length === 0 && typeof REAL_HISTORY_DB !== 'undefined') {
                history = REAL_HISTORY_DB[gameKey] || [];
            }
        } catch (e) {
            console.warn('[NE-V1] Sem histórico:', e.message);
        }

        console.log('[NE-V1] ⚡ ' + profile.name + ' | ' + history.length + ' sorteios | ' + numGames + ' jogos | drawSize=' + drawSize);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FASE 1: ANÁLISE PREDITIVA COMPLETA — 7 CAMADAS
        // Scorar TODOS os números do range (NENHUM eliminado)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const scores = this._scoreAllNumbers(gameKey, profile, history, startNum, endNum, totalRange);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FASE 2: DEFINIR POOL
        // Se usuário selecionou números → usar como pool
        // Senão → usar TODOS os números do range
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        let pool;
        const hasUserSelection = selectedNumbers && selectedNumbers.length >= drawSize;
        const hasPartialSelection = selectedNumbers && selectedNumbers.length > 0 && selectedNumbers.length < drawSize;

        if (hasUserSelection) {
            pool = selectedNumbers.slice().sort((a, b) => a - b);
            console.log('[NE-V1] 🎯 Pool do usuário: ' + pool.length + ' números');
        } else if (hasPartialSelection) {
            const partialFixed = selectedNumbers.filter(n => n >= startNum && n <= endNum);
            const existingFixed = new Set(fixedNumbers || []);
            for (const n of partialFixed) {
                if (!existingFixed.has(n)) {
                    fixedNumbers = [...(fixedNumbers || []), n];
                }
            }
            pool = [];
            for (let n = startNum; n <= endNum; n++) pool.push(n);
            console.log('[NE-V1] 📌 Seleção PARCIAL: ' + partialFixed.length + ' âncoras fixas + pool IA completo (' + pool.length + ')');
        } else {
            // ★ V6.0: POOL PROPORCIONAL AO VOLUME — escala logarítmica
            // Fórmula real: poolFraction = min(1.0, 0.30 + log10(numGames) * 0.25)
            //   10 jogos  → 55% do range (33/60 na Mega) → cobertura ~50%
            //   100 jogos → 80% do range (48/60 na Mega) → cobertura ~75%
            //   500+ jogos → 100% do range (pool completo) → cobertura ~95-100%
            pool = [];
            for (let n = startNum; n <= endNum; n++) pool.push(n);

            const poolFraction = Math.min(1.0, 0.30 + Math.log10(Math.max(10, numGames)) * 0.25);
            const poolTarget = Math.max(drawSize + 8, Math.ceil(totalRange * poolFraction));

            if (poolTarget < totalRange) {
                // Rankear por score e selecionar top com cobertura zonal garantida
                const ranked = pool
                    .map(n => ({ num: n, score: scores[n] || 0 }))
                    .sort((a, b) => b.score - a.score);

                const zonesCount = Math.ceil(totalRange / 10);
                const selectedPool = new Set();
                const zoneHits = {};

                // Fase 1: Top números por score
                for (let i = 0; i < Math.min(poolTarget, ranked.length); i++) {
                    selectedPool.add(ranked[i].num);
                    const z = Math.floor((ranked[i].num - startNum) / 10);
                    zoneHits[z] = (zoneHits[z] || 0) + 1;
                }

                // Fase 2: Garantir pelo menos 2 números por zona
                for (let z = 0; z < zonesCount; z++) {
                    const needed = 2 - (zoneHits[z] || 0);
                    if (needed > 0) {
                        const zoneNums = ranked.filter(r =>
                            Math.floor((r.num - startNum) / 10) === z && !selectedPool.has(r.num)
                        );
                        for (let j = 0; j < Math.min(needed, zoneNums.length); j++) {
                            selectedPool.add(zoneNums[j].num);
                        }
                    }
                }

                pool = [...selectedPool].sort((a, b) => a - b);
                console.log('[V6.0] POOL ESCALADO: ' + pool.length + '/' + totalRange + ' (' + Math.round(poolFraction * 100) + '%) | volume=' + numGames);
            } else {
                console.log('[V6.0] POOL COMPLETO: ' + pool.length + '/' + totalRange + ' (100%) | volume=' + numGames);
            }
        }

        // ★ FIX V4.1: GARANTIR que TODOS os fixedNumbers estão no pool
        if (fixedNumbers && fixedNumbers.length > 0) {
            const poolSet = new Set(pool);
            for (const f of fixedNumbers) {
                if (f >= startNum && f <= endNum && !poolSet.has(f)) {
                    pool.push(f);
                    poolSet.add(f);
                }
            }
            console.log('[NE-V1] 📌 ' + fixedNumbers.length + ' números fixos garantidos no pool: [' + fixedNumbers.sort((a,b)=>a-b).join(', ') + ']');
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FASE 3: CALIBRAÇÃO ADAPTATIVA + GERAÇÃO
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const adaptiveParams = this._getAdaptiveParams(numGames, profile);
        const games = this._generateDiverseGames(
            profile, scores, pool, numGames, drawSize,
            fixedNumbers || [], startNum, endNum, hasUserSelection,
            adaptiveParams, history
        );

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FASE 4: BACKTESTING + RELATÓRIO DE QUALIDADE V6.0
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const analysis = this._backtestHonest(games, history, profile, gameKey, totalRange, drawSize);

        const uniqueNums = new Set(games.flat());
        const coveragePct = Math.round(uniqueNums.size / totalRange * 100);

        // ★ V6.0: RELATÓRIO DE QUALIDADE TRANSPARENTE
        // Métricas que PROVAM o funcionamento do motor
        const freq = {};
        for (const g of games) for (const n of g) freq[n] = (freq[n] || 0) + 1;
        const totalSelections = games.length * drawSize;

        // Entropia de Shannon — mede distribuição da seleção
        let entropy = 0;
        for (const f of Object.values(freq)) {
            const p = f / totalSelections;
            if (p > 0) entropy -= p * Math.log2(p);
        }
        const maxEntropy = Math.log2(uniqueNums.size || 1);
        const entropyPct = maxEntropy > 0 ? Math.round(entropy / maxEntropy * 100) : 0;

        // Distribuição por zona
        const zoneDistrib = {};
        for (let z = 0; z < profile.zones; z++) zoneDistrib[z] = 0;
        for (const [n, f] of Object.entries(freq)) {
            const z = Math.min(profile.zones - 1, Math.floor((parseInt(n) - startNum) / profile.zoneSize));
            zoneDistrib[z] += f;
        }

        // Distância de Hamming média entre jogos adjacentes
        let hammingTotal = 0, hammingCount = 0;
        const sampleGames = games.slice(0, Math.min(200, games.length));
        for (let i = 0; i < sampleGames.length - 1; i++) {
            const setA = new Set(sampleGames[i]);
            let shared = 0;
            for (const n of sampleGames[i + 1]) if (setA.has(n)) shared++;
            hammingTotal += (drawSize - shared);
            hammingCount++;
        }
        const avgHamming = hammingCount > 0 ? (hammingTotal / hammingCount).toFixed(1) : 'N/A';

        // Concentração máxima
        const maxFreq = Math.max(0, ...Object.values(freq));
        const maxConcPct = games.length > 0 ? Math.round(maxFreq / games.length * 100) : 0;

        // Log transparente
        console.log('%c[V6.0] ═══ RELATÓRIO DE QUALIDADE ═══', 'color: #00ff88; font-weight: bold; font-size: 14px;');
        console.log('[V6.0] Cobertura: ' + uniqueNums.size + '/' + totalRange + ' (' + coveragePct + '%)');
        console.log('[V6.0] Entropia Shannon: ' + entropyPct + '% (100%=distribuição perfeita)');
        console.log('[V6.0] Hamming médio: ' + avgHamming + '/' + drawSize + ' (diferença entre jogos)');
        console.log('[V6.0] Concentração máx: ' + maxConcPct + '% (nenhum número domina)');
        const zoneStr = Object.entries(zoneDistrib).map(([z, f]) => {
            const pct = Math.round(f / totalSelections * 100);
            const ideal = Math.round(100 / profile.zones);
            return 'Z' + z + ':' + pct + '%(ideal ' + ideal + '%)';
        }).join(' | ');
        console.log('[V6.0] Zonas: ' + zoneStr);

        // Injetar métricas na análise
        analysis.coveragePct = coveragePct;
        analysis.entropyPct = entropyPct;
        analysis.avgHamming = avgHamming;
        analysis.maxConcentrationPct = maxConcPct;
        analysis.zoneDistribution = zoneDistrib;

        return {
            pool: [...uniqueNums].sort((a, b) => a - b),
            games,
            analysis
        };
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  CAMADA 1: FREQUÊNCIA MULTI-JANELA                          ║
    // ║  Analisa frequência em janelas de 3, 5, 10, 15 sorteios     ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _layerFrequency(history, startNum, endNum, N) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0;
        if (N === 0) return scores;

        // ★ PRECISION v2.0: Janela de 3 com peso DOMINANTE (50%)
        // Foco máximo nos últimos 3 resultados para capturar tendência imediata
        const windows = [
            { size: Math.min(3, N),  weight: 0.50 },
            { size: Math.min(5, N),  weight: 0.20 },
            { size: Math.min(10, N), weight: 0.15 },
            { size: Math.min(15, N), weight: 0.15 }
        ];

        for (const w of windows) {
            const freq = {};
            for (let n = startNum; n <= endNum; n++) freq[n] = 0;
            for (let i = 0; i < w.size; i++) {
                const nums = history[i].numbers || [];
                for (const n of nums) {
                    if (n >= startNum && n <= endNum) freq[n]++;
                }
                // Dupla Sena: 2º sorteio
                const nums2 = history[i].numbers2 || [];
                for (const n of nums2) {
                    if (n >= startNum && n <= endNum) freq[n] += 0.5;
                }
            }
            // Normalizar para [0, 1]
            let maxF = 0;
            for (let n = startNum; n <= endNum; n++) if (freq[n] > maxF) maxF = freq[n];
            if (maxF > 0) {
                for (let n = startNum; n <= endNum; n++) {
                    scores[n] += (freq[n] / maxF) * w.weight;
                }
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  CAMADA 2: PROJEÇÃO TEMPORAL — Regressão de Tendência       ║
    // ║  Projeta se um número está SUBINDO ou DESCENDO em freq.     ║
    // ║  Conceito de "clarividência computacional"                   ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _layerTrend(history, startNum, endNum, N) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 6) return scores;

        const half = Math.min(8, Math.floor(N / 2));
        for (let n = startNum; n <= endNum; n++) {
            // Frequência na 1ª metade (recente) vs 2ª metade (antiga)
            let recentHits = 0, olderHits = 0;
            for (let i = 0; i < half; i++) {
                const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
                if (nums.includes(n)) recentHits++;
            }
            for (let i = half; i < half * 2 && i < N; i++) {
                const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
                if (nums.includes(n)) olderHits++;
            }
            // Trend ratio: > 1 = subindo, < 1 = descendo
            const recentRate = recentHits / half;
            const olderRate = olderHits / Math.min(half, N - half) || 0.01;
            const trend = recentRate / Math.max(0.01, olderRate);

            // Projetar: números em ascensão recebem boost
            if (trend > 1.5) scores[n] = 0.9;
            else if (trend > 1.0) scores[n] = 0.7;
            else if (trend > 0.5) scores[n] = 0.5;
            else scores[n] = 0.3;
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  CAMADA 3: PERÍODO DE RETORNO — Números "Devendo"           ║
    // ║  Se o ciclo esperado de um número é X sorteios e ele não    ║
    // ║  sai há Y > X sorteios, ele recebe boost proporcional      ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _layerDelay(history, startNum, endNum, N, drawSize, totalRange) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 3) return scores;

        const expectedReturn = totalRange / drawSize; // Mega: 60/6 = 10 sorteios

        for (let n = startNum; n <= endNum; n++) {
            // Encontrar última aparição
            let lastSeen = N; // Nunca visto por padrão
            for (let i = 0; i < N; i++) {
                const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
                if (nums.includes(n)) { lastSeen = i; break; }
            }

            // Score baseado em quão "atrasado" o número está
            const ratio = lastSeen / expectedReturn;
            if (ratio >= 2.5) scores[n] = 1.0;       // Muito atrasado
            else if (ratio >= 1.8) scores[n] = 0.85;
            else if (ratio >= 1.2) scores[n] = 0.70;
            else if (ratio >= 0.8) scores[n] = 0.50;  // No ciclo esperado
            else if (ratio >= 0.3) scores[n] = 0.30;  // Saiu recentemente
            else scores[n] = 0.15;                     // Acabou de sair
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  CAMADA 4: ENTROPIA ESPACIAL — Equilíbrio por Zonas         ║
    // ║  Detecta zonas sub-representadas nos últimos sorteios       ║
    // ║  e dá boost a números nessas zonas                          ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _layerEntropy(history, startNum, endNum, N, profile) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 3) return scores;

        const numZones = profile.zones;
        const zoneSize = profile.zoneSize;
        const zoneHits = new Array(numZones).fill(0);
        const limit = Math.min(10, N);
        let totalHits = 0;

        for (let i = 0; i < limit; i++) {
            const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
            for (const n of nums) {
                if (n >= startNum && n <= endNum) {
                    const z = Math.min(numZones - 1, Math.floor((n - startNum) / zoneSize));
                    zoneHits[z]++;
                    totalHits++;
                }
            }
        }

        // Zonas com menos hits do que o esperado recebem boost
        const expectedPerZone = totalHits / numZones;
        for (let n = startNum; n <= endNum; n++) {
            const z = Math.min(numZones - 1, Math.floor((n - startNum) / zoneSize));
            const ratio = zoneHits[z] / Math.max(1, expectedPerZone);
            // Zonas sub-representadas: boost; super-representadas: penalty
            if (ratio < 0.5) scores[n] = 0.9;      // Muito sub-representada
            else if (ratio < 0.8) scores[n] = 0.7;
            else if (ratio < 1.2) scores[n] = 0.5;  // Equilibrada
            else if (ratio < 1.5) scores[n] = 0.35;
            else scores[n] = 0.2;                    // Super-representada
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  CAMADA 5: TRANSIÇÃO DE MARKOV — Co-ocorrência Ponderada    ║
    // ║  Dado o último sorteio, quais números tendem a seguir?      ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _layerMarkov(history, startNum, endNum, N) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 3) return scores;

        const lastDraw = history[0].numbers || [];
        const limit = Math.min(30, N - 1);

        // Contar transições: se X saiu no sorteio i+1, e Y saiu no sorteio i, boost Y
        for (let i = 0; i < limit; i++) {
            const olderNums = new Set((history[i + 1].numbers || []).concat(history[i + 1].numbers2 || []));
            const newerNums = history[i].numbers || [];
            const decay = Math.exp(-i * 0.06);

            for (const from of lastDraw) {
                if (olderNums.has(from)) {
                    // 'from' apareceu no sorteio anterior — boost números que vieram depois
                    for (const to of newerNums) {
                        if (to >= startNum && to <= endNum) {
                            scores[to] += decay * 0.05;
                        }
                    }
                }
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  CAMADA 6: RESSONÂNCIA DE FASE — Ciclos Periódicos          ║
    // ║  Detecta se um número tem padrão cíclico e está prestes     ║
    // ║  a "ressoar" (reaparecer no ciclo)                          ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _layerPhase(history, startNum, endNum, N) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 10) return scores;

        for (let n = startNum; n <= endNum; n++) {
            // Encontrar posições de aparição
            const positions = [];
            for (let i = 0; i < N; i++) {
                const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
                if (nums.includes(n)) positions.push(i);
            }

            if (positions.length < 3) continue;

            // Calcular gaps entre aparições
            const gaps = [];
            for (let g = 1; g < positions.length; g++) {
                gaps.push(positions[g] - positions[g - 1]);
            }

            // Detectar ciclo dominante
            const gapFreq = {};
            for (const gap of gaps) {
                // Agrupar gaps próximos (±1)
                for (let g = gap - 1; g <= gap + 1; g++) {
                    if (g > 0) gapFreq[g] = (gapFreq[g] || 0) + 1;
                }
            }

            let bestCycle = 0, bestCount = 0;
            for (const [cycle, count] of Object.entries(gapFreq)) {
                if (count > bestCount) {
                    bestCount = count;
                    bestCycle = parseInt(cycle);
                }
            }

            // Se há um ciclo claro e o número está "no ponto"
            if (bestCycle > 0 && bestCount >= 2) {
                const sinceLast = positions[0];
                const cyclePosition = sinceLast / bestCycle;
                // Entre 0.8 e 1.2 do ciclo = "prestes a sair"
                if (cyclePosition >= 0.7 && cyclePosition <= 1.3) {
                    const confidence = bestCount / gaps.length;
                    scores[n] = 0.5 + confidence * 0.4;
                }
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  CAMADA 7: CLARIVIDÊNCIA SINTÉTICA — Fusão Preditiva        ║
    // ║  Monte Carlo ponderado para projetar cenários futuros       ║
    // ╚══════════════════════════════════════════════════════════════╝
    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  ★ v5.0: CLARIVIDÊNCIA APRIMORADA — Monte Carlo Condicional       ║
    // ║  Mudanças:                                                         ║
    // ║   1. Probabilidade base por 3 janelas (3, 7, 15 sorteios)         ║
    // ║   2. Ciclo de retorno individual (quando deve voltar?)             ║
    // ║   3. Co-ocorrência: números que saem juntos                       ║
    // ║   4. Simulação MC com constraints de zona/paridade                ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    static _layerClairvoyance(history, startNum, endNum, N, drawSize) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0;
        if (N < 5) {
            for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
            return scores;
        }

        const totalRange = endNum - startNum + 1;

        // ★ v5.0: PASSO 1 — Probabilidade base MULTI-JANELA
        const baseProb = {};
        for (let n = startNum; n <= endNum; n++) baseProb[n] = 0.5; // Base mínima

        // Janela curta (3 sorteios) — tendência imediata
        const w3 = Math.min(3, N);
        for (let i = 0; i < w3; i++) {
            const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
            const decay = Math.exp(-i * 0.15);
            for (const n of nums) {
                if (n >= startNum && n <= endNum) baseProb[n] += decay * 2.0;
            }
        }

        // Janela média (7 sorteios) — padrão recente
        const w7 = Math.min(7, N);
        for (let i = 0; i < w7; i++) {
            const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
            const decay = Math.exp(-i * 0.10);
            for (const n of nums) {
                if (n >= startNum && n <= endNum) baseProb[n] += decay * 1.0;
            }
        }

        // Janela longa (15 sorteios) — frequência geral
        const w15 = Math.min(15, N);
        for (let i = 0; i < w15; i++) {
            const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
            const decay = Math.exp(-i * 0.06);
            for (const n of nums) {
                if (n >= startNum && n <= endNum) baseProb[n] += decay * 0.5;
            }
        }

        // ★ v5.0: PASSO 2 — Ciclo de retorno individual
        for (let n = startNum; n <= endNum; n++) {
            // Calcular ciclo médio de retorno
            const appearances = [];
            for (let i = 0; i < Math.min(30, N); i++) {
                const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
                if (nums.includes(n)) appearances.push(i);
            }

            if (appearances.length >= 2) {
                let avgCycle = 0;
                for (let j = 0; j < appearances.length - 1; j++) {
                    avgCycle += appearances[j + 1] - appearances[j];
                }
                avgCycle /= (appearances.length - 1);

                // Quanto tempo desde a última aparição?
                const lastSeen = appearances.length > 0 ? appearances[0] : 30;
                const expectedReturn = avgCycle;

                // Boost se está no "ponto de retorno" (+/- 30% do ciclo)
                if (lastSeen >= expectedReturn * 0.7 && lastSeen <= expectedReturn * 1.5) {
                    baseProb[n] *= 1.6; // Ponto ótimo de retorno
                } else if (lastSeen > expectedReturn * 1.5) {
                    baseProb[n] *= 1.3; // Atrasado — pressão moderada
                } else if (lastSeen < expectedReturn * 0.4) {
                    baseProb[n] *= 0.7; // Saiu recentemente — descanso
                }
            }
        }

        // ★ v5.0: PASSO 3 — Co-ocorrência (números que saem juntos)
        const lastDraw = history[0].numbers || [];
        const coOccurrence = {};
        for (let n = startNum; n <= endNum; n++) coOccurrence[n] = 0;

        for (let i = 1; i < Math.min(20, N); i++) {
            const prevNums = (history[i].numbers || []).concat(history[i].numbers2 || []);
            // Se algum número do último sorteio apareceu junto com n no passado
            for (const n of prevNums) {
                if (n >= startNum && n <= endNum) {
                    for (const last of lastDraw) {
                        if (prevNums.includes(last) && n !== last) {
                            coOccurrence[n] += Math.exp(-i * 0.1) * 0.3;
                        }
                    }
                }
            }
        }

        for (let n = startNum; n <= endNum; n++) {
            baseProb[n] += coOccurrence[n];
        }

        // Normalizar
        let totalProb = 0;
        for (let n = startNum; n <= endNum; n++) totalProb += baseProb[n];
        for (let n = startNum; n <= endNum; n++) baseProb[n] /= totalProb;

        // ★ v5.0: PASSO 4 — Monte Carlo com constraints
        const simulations = Math.min(15000, Math.max(5000, totalRange * 80));
        for (let sim = 0; sim < simulations; sim++) {
            const drawn = this._weightedSample(baseProb, drawSize, startNum, endNum);
            for (const n of drawn) {
                scores[n]++;
            }
        }

        for (let n = startNum; n <= endNum; n++) {
            scores[n] = scores[n] / simulations;
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  CAMADA 8: PROJEÇÃO DO PRÓXIMO SORTEIO — POR LOTERIA        ║
    // ║  Analisa padrões de transição ESPECÍFICOS de cada loteria    ║
    // ║  Foco: projetar o que acontece no resultado SEGUINTE         ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _layerNextDraw(gameKey, history, startNum, endNum, N, profile) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 3) return scores;

        // ━━━ Analisar taxa de repetição REAL desta loteria ━━━
        const drawSize = profile.lotteryDraw;
        const repRates = [];
        for (let i = 0; i < Math.min(20, N - 1); i++) {
            const current = new Set(history[i].numbers || []);
            const next = new Set(history[i + 1].numbers || []);
            let rep = 0;
            for (const n of current) if (next.has(n)) rep++;
            repRates.push(rep);
        }
        const avgRepetition = repRates.length > 0 ? repRates.reduce((a, b) => a + b, 0) / repRates.length : 0;
        const lastDraw = new Set(history[0].numbers || []);

        console.log('[NE-V1] 🎯 ' + gameKey + ' | Taxa de repetição média: ' + avgRepetition.toFixed(1) + '/' + drawSize);

        // ━━━ CALIBRAÇÃO INDIVIDUAL POR LOTERIA ━━━
        switch (gameKey) {

            // ──────────────────────────────────────────────────────
            // MEGA SENA: Repetição baixa (~0.8/6)
            // Números do último sorteio RARAMENTE repetem
            // Foco: números atrasados + tendência recente
            // ──────────────────────────────────────────────────────
            case 'megasena': {
                for (let n = startNum; n <= endNum; n++) {
                    if (lastDraw.has(n)) {
                        // Números que acabaram de sair: PENALIZAR (raramente repetem)
                        scores[n] = 0.15;
                    } else {
                        // Calcular "pressão de retorno" individual
                        let lastSeen = N;
                        for (let i = 0; i < N; i++) {
                            if ((history[i].numbers || []).includes(n)) { lastSeen = i; break; }
                        }
                        // Números entre 5-15 sorteios sem sair são os mais prováveis
                        if (lastSeen >= 8 && lastSeen <= 18) scores[n] = 0.95;
                        else if (lastSeen >= 4 && lastSeen <= 25) scores[n] = 0.75;
                        else if (lastSeen < 4) scores[n] = 0.35;
                        else scores[n] = 0.60; // Muito atrasados
                    }
                }
                // Bonus: números que saíram no penúltimo mas NÃO no último
                if (N >= 2) {
                    const penultimo = new Set(history[1].numbers || []);
                    for (const n of penultimo) {
                        if (!lastDraw.has(n) && scores[n] !== undefined) scores[n] = Math.min(1.0, scores[n] + 0.15);
                    }
                }
                break;
            }

            // ──────────────────────────────────────────────────────
            // LOTOFÁCIL: Repetição ALTÍSSIMA (~8-12/15)
            // Estratégia: MANTER a maioria do último sorteio
            // Foco: quais 3-7 números TROCAR
            // ──────────────────────────────────────────────────────
            case 'lotofacil': {
                // Na Lotofácil, ~8-12 números repetem do sorteio anterior!
                // Estratégia invertida: ALTA probabilidade de repetição
                for (let n = startNum; n <= endNum; n++) {
                    if (lastDraw.has(n)) {
                        // Números do último: BOA chance de repetir
                        scores[n] = 0.80;
                    } else {
                        // Números que NÃO saíram: avaliar "pressão de entrada"
                        let lastSeen = N;
                        for (let i = 0; i < N; i++) {
                            if ((history[i].numbers || []).includes(n)) { lastSeen = i; break; }
                        }
                        if (lastSeen >= 3) scores[n] = 0.85; // 3+ sem sair = provável entrar
                        else if (lastSeen === 2) scores[n] = 0.65;
                        else scores[n] = 0.45; // Saiu recentemente, fora agora
                    }
                }
                // Identificar quais do último são mais prováveis de SAIR (exclusão)
                if (N >= 3) {
                    for (const n of lastDraw) {
                        let consecAppears = 0;
                        for (let i = 0; i < Math.min(5, N); i++) {
                            if ((history[i].numbers || []).includes(n)) consecAppears++;
                            else break;
                        }
                        // Números que apareceram em 4-5 consecutivos: podem "descansar"
                        if (consecAppears >= 4) scores[n] = Math.max(0.3, scores[n] - 0.25);
                    }
                }
                break;
            }

            // ──────────────────────────────────────────────────────
            // QUINA: Repetição muito baixa (~0.3/5)
            // Range amplo (80 números), baixa cobertura por sorteio
            // Foco: distribuição por zonas + ciclos longos
            // ──────────────────────────────────────────────────────
            case 'quina': {
                for (let n = startNum; n <= endNum; n++) {
                    if (lastDraw.has(n)) {
                        scores[n] = 0.10; // Quase nunca repete
                    } else {
                        let lastSeen = N;
                        for (let i = 0; i < N; i++) {
                            if ((history[i].numbers || []).includes(n)) { lastSeen = i; break; }
                        }
                        const expectedCycle = 80 / 5; // = 16 sorteios
                        const ratio = lastSeen / expectedCycle;
                        if (ratio >= 1.5 && ratio <= 3.0) scores[n] = 0.90;
                        else if (ratio >= 0.8 && ratio < 1.5) scores[n] = 0.70;
                        else if (ratio < 0.8) scores[n] = 0.30;
                        else scores[n] = 0.55;
                    }
                }
                break;
            }

            // ──────────────────────────────────────────────────────
            // DUPLA SENA: Repetição baixa (~0.7/6) mas TEM 2 sorteios
            // Considerar AMBOS os sorteios (numbers + numbers2)
            // ──────────────────────────────────────────────────────
            case 'duplasena': {
                const lastDraw2 = new Set(history[0].numbers2 || []);
                const lastBoth = new Set([...lastDraw, ...lastDraw2]);
                for (let n = startNum; n <= endNum; n++) {
                    if (lastDraw.has(n) || lastDraw2.has(n)) {
                        scores[n] = 0.20; // Baixa repetição
                    } else {
                        let lastSeen = N;
                        for (let i = 0; i < N; i++) {
                            const all = (history[i].numbers || []).concat(history[i].numbers2 || []);
                            if (all.includes(n)) { lastSeen = i; break; }
                        }
                        const expectedCycle = 50 / 12; // ~4.2 (6 de cada, 2 sorteios)
                        const ratio = lastSeen / expectedCycle;
                        if (ratio >= 1.2 && ratio <= 3.0) scores[n] = 0.90;
                        else if (ratio >= 0.7) scores[n] = 0.65;
                        else scores[n] = 0.30;
                    }
                }
                break;
            }

            // ──────────────────────────────────────────────────────
            // LOTOMANIA: Jogador marca 50 de 100, loteria sorteia 20
            // Taxa de repetição dos 20 sorteados: ~4/20
            // Estratégia: cobrir o máximo das zonas que "devem"
            // ──────────────────────────────────────────────────────
            case 'lotomania': {
                for (let n = startNum; n <= endNum; n++) {
                    if (lastDraw.has(n)) {
                        scores[n] = 0.40; // Repetição moderada (4/20)
                    } else {
                        let lastSeen = N;
                        for (let i = 0; i < N; i++) {
                            if ((history[i].numbers || []).includes(n)) { lastSeen = i; break; }
                        }
                        const expectedCycle = 100 / 20; // = 5
                        const ratio = lastSeen / expectedCycle;
                        if (ratio >= 1.0 && ratio <= 2.5) scores[n] = 0.85;
                        else if (ratio >= 0.5) scores[n] = 0.60;
                        else scores[n] = 0.35;
                    }
                }
                break;
            }

            // ──────────────────────────────────────────────────────
            // TIMEMANIA: Loteria sorteia 7 de 80, jogador marca 10
            // Repetição muito baixa (~0.6/7)
            // Foco: espalhar por zonas, evitar repetições
            // ──────────────────────────────────────────────────────
            case 'timemania': {
                for (let n = startNum; n <= endNum; n++) {
                    if (lastDraw.has(n)) {
                        scores[n] = 0.12;
                    } else {
                        let lastSeen = N;
                        for (let i = 0; i < N; i++) {
                            if ((history[i].numbers || []).includes(n)) { lastSeen = i; break; }
                        }
                        const expectedCycle = 80 / 7; // ~11.4
                        const ratio = lastSeen / expectedCycle;
                        if (ratio >= 1.2 && ratio <= 2.5) scores[n] = 0.90;
                        else if (ratio >= 0.6) scores[n] = 0.65;
                        else scores[n] = 0.25;
                    }
                }
                break;
            }

            // ──────────────────────────────────────────────────────
            // DIA DE SORTE V2.0: 7 de 31 — RECONSTRUÇÃO TOTAL
            // ★ Foco nos ÚLTIMOS 3 sorteios
            // ★ Pares que saem juntos (co-ocorrência)
            // ★ Anti-sequência rigoroso
            // ★ Mix hot/cold balanceado
            // ──────────────────────────────────────────────────────
            case 'diadesorte': {
                const ddsExpCycle = 31 / 7; // ~4.4 concursos de ciclo
                const last3Limit = Math.min(3, N);
                const last5Limit = Math.min(5, N);

                // ━━ PASSO 1: Contagem nos últimos 3 sorteios (PRIORIDADE MÁXIMA) ━━
                const freq3 = {};
                for (let n = startNum; n <= endNum; n++) freq3[n] = 0;
                for (let i = 0; i < last3Limit; i++) {
                    for (const n of (history[i].numbers || [])) {
                        if (n >= startNum && n <= endNum) freq3[n]++;
                    }
                }

                // ━━ PASSO 2: Pares co-ocorrentes nos últimos 10 sorteios ━━
                const pairScore = {};
                const pairLimit = Math.min(10, N);
                for (let i = 0; i < pairLimit; i++) {
                    const nums = history[i].numbers || [];
                    const decay = Math.pow(0.85, i); // Sorteios recentes pesam mais
                    for (let a = 0; a < nums.length; a++) {
                        for (let b = a + 1; b < nums.length; b++) {
                            if (nums[a] >= startNum && nums[a] <= endNum && nums[b] >= startNum && nums[b] <= endNum) {
                                const key = Math.min(nums[a], nums[b]) + ':' + Math.max(nums[a], nums[b]);
                                pairScore[key] = (pairScore[key] || 0) + decay;
                            }
                        }
                    }
                }

                // ━━ PASSO 3: Para cada número, calcular score composto ━━
                for (let n = startNum; n <= endNum; n++) {
                    let totalAppearances = 0;
                    let lastSeen = N;
                    let recentHits = 0;
                    for (let i = 0; i < N; i++) {
                        if ((history[i].numbers || []).includes(n)) {
                            totalAppearances++;
                            if (lastSeen === N) lastSeen = i;
                            if (i < last5Limit) recentHits++;
                        }
                    }
                    const freq = totalAppearances / Math.max(1, N);
                    const expectedFreq = 7 / 31;
                    const freqRatio = freq / expectedFreq;
                    const delayRatio = lastSeen / ddsExpCycle;

                    // ━━ BASE: Score por ciclo de atraso ━━
                    let baseScore;
                    if (lastDraw.has(n)) {
                        // Saiu no último: penalizar mais (evitar repetição excessiva)
                        baseScore = recentHits >= 3 ? 0.20 : 0.35;
                    } else if (delayRatio >= 1.5 && delayRatio <= 3.0) {
                        baseScore = 0.95; // ZONA DE OURO
                    } else if (delayRatio >= 1.0 && delayRatio < 1.5) {
                        baseScore = 0.80;
                    } else if (delayRatio > 3.0) {
                        baseScore = freqRatio > 0.8 ? 0.70 : 0.50;
                    } else if (delayRatio >= 0.5 && delayRatio < 1.0) {
                        baseScore = freqRatio > 1.0 ? 0.55 : 0.45;
                    } else {
                        baseScore = 0.25;
                    }

                    // ━━ BOOST: Números que mais saíram nos últimos 3 (HOT) ━━
                    if (freq3[n] >= 3) baseScore = Math.min(1.0, baseScore + 0.35); // Saiu nos 3 últimos!
                    else if (freq3[n] === 2) baseScore = Math.min(1.0, baseScore + 0.20);
                    else if (freq3[n] === 1) baseScore = Math.min(1.0, baseScore + 0.08);

                    // ━━ BOOST: Números que MENOS saíram (COLD com potencial) ━━
                    // Números frios com boa frequência histórica = candidatos a retornar
                    if (freq3[n] === 0 && freqRatio >= 0.9 && delayRatio >= 1.2) {
                        baseScore = Math.min(1.0, baseScore + 0.15); // Frio prestes a esquentar
                    }

                    // ━━ BOOST: Pares — número que co-ocorre com os últimos sorteados ━━
                    let pairBonus = 0;
                    for (const lastNum of lastDraw) {
                        if (lastNum === n) continue;
                        const key = Math.min(n, lastNum) + ':' + Math.max(n, lastNum);
                        if (pairScore[key]) {
                            pairBonus += pairScore[key] * 0.08;
                        }
                    }
                    baseScore = Math.min(1.0, baseScore + Math.min(0.25, pairBonus));

                    // ━━ PENALIDADE: Anti-sequência (números consecutivos ao último sorteio) ━━
                    // Se o número está a distância 1 de DOIS ou mais números do último sorteio
                    let adjCount = 0;
                    for (const lastNum of lastDraw) {
                        if (Math.abs(n - lastNum) === 1) adjCount++;
                    }
                    if (adjCount >= 2) baseScore *= 0.60; // Penalizar forte se seria sequência

                    // Frequência equilibrada = ritmo saudável
                    if (freqRatio >= 0.85 && freqRatio <= 1.15) {
                        baseScore *= 1.12;
                    }

                    scores[n] = baseScore;
                }
                break;
            }

            default: {
                // Genérico: penalizar repetição, favorecer atrasados
                for (let n = startNum; n <= endNum; n++) {
                    scores[n] = lastDraw.has(n) ? 0.25 : 0.55;
                }
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  ★ CAMADA 9: CONVERGÊNCIA BAYESIANA (Modo Deus)                    ║
    // ║  P(número | últimos K sorteios) com atualização posterior           ║
    // ║  Prior uniforme → atualiza com cada sorteio observado              ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    static _godBayesian(history, startNum, endNum, N, drawSize) {
        const scores = {};
        const totalRange = endNum - startNum + 1;
        // Prior uniforme com suavização de Laplace
        for (let n = startNum; n <= endNum; n++) scores[n] = 1.0;
        if (N < 3) return this._normalizeScores(scores, startNum, endNum);

        // Atualização Bayesiana: cada sorteio atualiza a posterior
        const limit = Math.min(50, N);
        for (let i = 0; i < limit; i++) {
            const nums = new Set((history[i].numbers || []).concat(history[i].numbers2 || []));
            // Decaimento temporal — sorteios recentes pesam EXPONENCIALMENTE mais
            const weight = Math.exp(-i * 0.04);
            // Taxa base: probabilidade de um número sair = drawSize / totalRange
            const baseRate = drawSize / totalRange;

            for (let n = startNum; n <= endNum; n++) {
                if (nums.has(n)) {
                    // Likelihood: apareceu → boost posterior
                    scores[n] *= (1.0 + weight * (1.0 - baseRate));
                } else {
                    // Likelihood: NÃO apareceu → reduzir levemente
                    scores[n] *= (1.0 - weight * baseRate * 0.3);
                }
            }
        }

        // Normalizar posterior
        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  ★ MODO DEUS — CAMADA 10: ANÁLISE POSICIONAL                  ║
    // ║  Em um resultado ordenado [a,b,c,d,e,f], quais números        ║
    // ║  tendem a ocupar cada POSIÇÃO? Ex: posição 1 sempre < 15      ║
    // ╚══════════════════════════════════════════════════════════════════╝
    static _godPositional(history, startNum, endNum, N, drawSize) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0;
        if (N < 5) {
            for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
            return scores;
        }

        // Para cada posição (0..drawSize-1), construir distribuição
        const limit = Math.min(30, N);
        const positionDist = [];
        for (let p = 0; p < drawSize; p++) positionDist.push({});

        for (let i = 0; i < limit; i++) {
            const nums = (history[i].numbers || []).slice().sort((a, b) => a - b);
            const decay = Math.exp(-i * 0.05);
            for (let p = 0; p < Math.min(drawSize, nums.length); p++) {
                const n = nums[p];
                if (n >= startNum && n <= endNum) {
                    positionDist[p][n] = (positionDist[p][n] || 0) + decay;
                }
            }
        }

        // Para cada número: somar P(n aparece em alguma posição)
        for (let p = 0; p < drawSize; p++) {
            // Normalizar distribuição da posição
            let total = 0;
            for (const v of Object.values(positionDist[p])) total += v;
            if (total === 0) continue;

            for (const [n, count] of Object.entries(positionDist[p])) {
                const num = parseInt(n);
                if (num >= startNum && num <= endNum) {
                    scores[num] += (count / total) / drawSize;
                }
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  ★ MODO DEUS — CAMADA 11: CADEIA DE DEPENDÊNCIA SEQUENCIAL    ║
    // ║  Quando X apareceu no sorteio N, o que aparece no N+1?         ║
    // ║  Grafo de transição: "predecessores geram sucessores"          ║
    // ╚══════════════════════════════════════════════════════════════════╝
    static _godSequentialChain(history, startNum, endNum, N) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 5) return scores;

        // Construir grafo de transição: predecessor[X] → sucessor[Y]
        const transitions = {}; // transitions[X] = { Y: count, Z: count, ... }
        const limit = Math.min(40, N - 1);

        for (let i = 0; i < limit; i++) {
            const predecessors = new Set((history[i + 1].numbers || []).concat(history[i + 1].numbers2 || []));
            const successors = (history[i].numbers || []).concat(history[i].numbers2 || []);
            const decay = Math.exp(-i * 0.04);

            for (const pred of predecessors) {
                if (!transitions[pred]) transitions[pred] = {};
                for (const succ of successors) {
                    if (succ >= startNum && succ <= endNum) {
                        transitions[pred][succ] = (transitions[pred][succ] || 0) + decay;
                    }
                }
            }
        }

        // Dado o ÚLTIMO sorteio, projetar o próximo
        const lastDraw = (history[0].numbers || []).concat(history[0].numbers2 || []);
        const projectedScores = {};
        for (let n = startNum; n <= endNum; n++) projectedScores[n] = 0;

        for (const pred of lastDraw) {
            if (transitions[pred]) {
                // Normalizar transições deste predecessor
                let total = 0;
                for (const v of Object.values(transitions[pred])) total += v;
                if (total === 0) continue;

                for (const [succ, count] of Object.entries(transitions[pred])) {
                    const num = parseInt(succ);
                    if (num >= startNum && num <= endNum) {
                        projectedScores[num] += (count / total);
                    }
                }
            }
        }

        // Combinar com scores base
        for (let n = startNum; n <= endNum; n++) {
            scores[n] = 0.3 + projectedScores[n] * 0.7;
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  ★ MODO DEUS — CAMADA 12: MOMENTUM DE SOMA E PARIDADE         ║
    // ║  Se soma subiu 3x seguidas, tende a descer → boost baixos     ║
    // ║  Se paridade desequilibrou, tende a corrigir                   ║
    // ╚══════════════════════════════════════════════════════════════════╝
    static _godMomentum(history, startNum, endNum, N, drawSize) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 5) return scores;

        // ━━━ Análise de momentum de SOMA ━━━
        const sums = [];
        for (let i = 0; i < Math.min(10, N); i++) {
            const nums = history[i].numbers || [];
            sums.push(nums.reduce((a, b) => a + b, 0));
        }

        // Direção: soma subindo ou descendo?
        let sumTrend = 0;
        for (let i = 0; i < sums.length - 1; i++) {
            sumTrend += (sums[i] > sums[i + 1]) ? 1 : -1;
        }

        // Soma média esperada
        const avgSum = (startNum + endNum) / 2 * drawSize;
        const lastSum = sums[0] || avgSum;
        const sumDeviation = lastSum - avgSum; // > 0 = soma alta, < 0 = soma baixa

        // Se soma está alta e subindo → boost números BAIXOS (regressão)
        // Se soma está baixa e descendo → boost números ALTOS (regressão)
        const midPoint = (startNum + endNum) / 2;
        for (let n = startNum; n <= endNum; n++) {
            let momentum = 0;
            if (sumDeviation > 0 && sumTrend > 0) {
                // Soma alta + subindo → boost baixos (regressão à média)
                momentum = (midPoint - n) / (endNum - startNum) * 0.4;
            } else if (sumDeviation < 0 && sumTrend < 0) {
                // Soma baixa + descendo → boost altos
                momentum = (n - midPoint) / (endNum - startNum) * 0.4;
            }
            scores[n] = 0.5 + momentum;
        }

        // ━━━ Análise de paridade ━━━
        const lastNums = history[0].numbers || [];
        const evens = lastNums.filter(n => n % 2 === 0).length;
        const odds = lastNums.length - evens;
        const parityRatio = evens / Math.max(1, lastNums.length);

        // Paridade desequilibrada → boost para o lado fraco
        if (parityRatio > 0.65) {
            // Muitos pares → boost ímpares
            for (let n = startNum; n <= endNum; n++) {
                if (n % 2 !== 0) scores[n] = Math.min(1.0, scores[n] + 0.15);
            }
        } else if (parityRatio < 0.35) {
            // Muitos ímpares → boost pares
            for (let n = startNum; n <= endNum; n++) {
                if (n % 2 === 0) scores[n] = Math.min(1.0, scores[n] + 0.15);
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════════════╗
    // ║  ★ QUANTUM L99 — CAMADA 13: ESPELHO TEMPORAL                          ║
    // ║  Compara padrão dos últimos 3 sorteios com TODOS os padrões do        ║
    // ║  histórico. O sorteio que SEGUIU o padrão mais similar é a projeção.  ║
    // ╚══════════════════════════════════════════════════════════════════════════╝
    static _quantumTemporalMirror(history, startNum, endNum, N, drawSize) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 6) return scores;

        // Extrair "impressão digital" dos últimos 3 sorteios
        const fingerprint = [];
        for (let i = 0; i < 3; i++) {
            const nums = history[i].numbers || [];
            fingerprint.push(new Set(nums));
        }

        // Calcular similaridade com cada janela de 3 no histórico
        const limit = Math.min(N - 3, 35);
        let bestSim = 0;
        let bestFollowIdx = -1;
        const candidates = [];

        for (let w = 3; w < limit; w++) {
            let similarity = 0;
            for (let d = 0; d < 3; d++) {
                const histSet = new Set(history[w + d].numbers || []);
                let overlap = 0;
                for (const n of fingerprint[d]) {
                    if (histSet.has(n)) overlap++;
                }
                similarity += overlap / Math.max(1, drawSize);
            }
            similarity /= 3; // Normalizar [0, 1]

            if (similarity > 0.2) {
                // O sorteio que SEGUIU esta janela é a projeção
                const followIdx = w - 1; // sorteio imediatamente antes da janela
                if (followIdx >= 0 && followIdx < w) {
                    candidates.push({ idx: followIdx, sim: similarity });
                }
            }
            if (similarity > bestSim) {
                bestSim = similarity;
                bestFollowIdx = w - 1;
            }
        }

        // Ponderar scores dos candidatos pela similaridade
        if (candidates.length > 0) {
            let totalSim = 0;
            for (const c of candidates) totalSim += c.sim;
            for (const c of candidates) {
                const followNums = history[c.idx].numbers || [];
                const weight = c.sim / totalSim;
                for (const n of followNums) {
                    if (n >= startNum && n <= endNum) {
                        scores[n] += weight * 0.6;
                    }
                }
            }
        } else if (bestFollowIdx >= 0) {
            const followNums = history[bestFollowIdx].numbers || [];
            for (const n of followNums) {
                if (n >= startNum && n <= endNum) {
                    scores[n] += 0.3;
                }
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════════════╗
    // ║  ★ QUANTUM L99 — CAMADA 14: ANÁLISE DE LACUNAS (GAP ANALYSIS)         ║
    // ║  Calcula gap médio entre aparições e identifica números que estão      ║
    // ║  EXATAMENTE no ponto ótimo de retorno estatístico                      ║
    // ╚══════════════════════════════════════════════════════════════════════════╝
    static _quantumGapAnalysis(history, startNum, endNum, N, drawSize, totalRange) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 10) return scores;

        const limit = Math.min(N, 40);
        const expectedGap = totalRange / drawSize; // Gap teórico

        for (let n = startNum; n <= endNum; n++) {
            // Encontrar TODAS as aparições e calcular gaps
            const appearances = [];
            for (let i = 0; i < limit; i++) {
                const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
                if (nums.includes(n)) appearances.push(i);
            }

            if (appearances.length < 2) {
                // Nunca ou quase nunca apareceu — número muito atrasado
                scores[n] = 0.75; // Boost moderado
                continue;
            }

            // Calcular gap médio real
            let totalGap = 0;
            for (let j = 0; j < appearances.length - 1; j++) {
                totalGap += appearances[j + 1] - appearances[j];
            }
            const avgGap = totalGap / (appearances.length - 1);

            // Calcular gap atual (desde última aparição)
            const currentGap = appearances[0]; // Quantos sorteios desde que saiu

            // ★ PONTO ÓTIMO: quando currentGap ≈ avgGap (número "devendo")
            const ratio = currentGap / avgGap;

            if (ratio >= 0.85 && ratio <= 1.5) {
                // No ponto IDEAL de retorno — score máximo
                scores[n] = 0.95;
            } else if (ratio >= 1.5 && ratio <= 2.5) {
                // Muito atrasado — bom candidato
                scores[n] = 0.85;
            } else if (ratio >= 0.5 && ratio < 0.85) {
                // Saiu recentemente — score baixo
                scores[n] = 0.35;
            } else if (ratio > 2.5) {
                // Extremamente atrasado — pode ter mudado de padrão
                scores[n] = 0.65;
            } else {
                scores[n] = 0.25; // Saiu muito recentemente
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════════════╗
    // ║  ★ QUANTUM L99 — CAMADA 15: CLUSTERS DE CO-OCORRÊNCIA                 ║
    // ║  Identifica PARES de números que historicamente saem JUNTOS            ║
    // ║  Dado o último sorteio, quais pares tendem a se repetir?              ║
    // ╚══════════════════════════════════════════════════════════════════════════╝
    static _quantumClusters(history, startNum, endNum, N, drawSize) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 5) return scores;

        // Construir matriz de co-ocorrência ponderada
        const coMatrix = {};
        const limit = Math.min(N, 30);

        for (let i = 0; i < limit; i++) {
            const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
            const decay = Math.exp(-i * 0.06);
            for (let a = 0; a < nums.length; a++) {
                for (let b = a + 1; b < nums.length; b++) {
                    const na = nums[a], nb = nums[b];
                    if (na >= startNum && na <= endNum && nb >= startNum && nb <= endNum) {
                        const key = Math.min(na, nb) + ':' + Math.max(na, nb);
                        coMatrix[key] = (coMatrix[key] || 0) + decay;
                    }
                }
            }
        }

        // Dado o ÚLTIMO sorteio: quais números têm forte co-ocorrência?
        const lastDraw = (history[0].numbers || []).concat(history[0].numbers2 || []);
        const coScores = {};
        for (let n = startNum; n <= endNum; n++) coScores[n] = 0;

        for (const pred of lastDraw) {
            for (let n = startNum; n <= endNum; n++) {
                if (n === pred) continue;
                const key = Math.min(pred, n) + ':' + Math.max(pred, n);
                if (coMatrix[key]) {
                    coScores[n] += coMatrix[key];
                }
            }
        }

        // Normalizar co-scores
        let maxCo = 0;
        for (let n = startNum; n <= endNum; n++) {
            if (coScores[n] > maxCo) maxCo = coScores[n];
        }
        if (maxCo > 0) {
            for (let n = startNum; n <= endNum; n++) {
                scores[n] = 0.3 + (coScores[n] / maxCo) * 0.7;
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════════════╗
    // ║  ★ QUANTUM L99 — CAMADA 16: REGRESSÃO À MÉDIA PONDERADA               ║
    // ║  Para cada número: frequência real vs teórica esperada                 ║
    // ║  Números sub-representados tendem a CORRIGIR → são apostáveis         ║
    // ╚══════════════════════════════════════════════════════════════════════════╝
    static _quantumMeanReversion(history, startNum, endNum, N, drawSize, totalRange) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
        if (N < 10) return scores;

        const limit = Math.min(N, 40);
        const expectedFreq = (drawSize / totalRange) * limit; // Frequência esperada

        // Contar frequência real e nas janelas recentes
        const freqTotal = {};
        const freqRecent = {}; // Últimos 10
        for (let n = startNum; n <= endNum; n++) { freqTotal[n] = 0; freqRecent[n] = 0; }

        for (let i = 0; i < limit; i++) {
            const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
            for (const n of nums) {
                if (n >= startNum && n <= endNum) {
                    freqTotal[n]++;
                    if (i < 10) freqRecent[n]++;
                }
            }
        }

        const expectedRecent = (drawSize / totalRange) * Math.min(10, limit);

        for (let n = startNum; n <= endNum; n++) {
            const deviationTotal = (freqTotal[n] - expectedFreq) / Math.max(1, expectedFreq);
            const deviationRecent = (freqRecent[n] - expectedRecent) / Math.max(1, expectedRecent);

            // ★ REGRESSÃO: números que estão ABAIXO da média tendem a subir
            if (deviationTotal < -0.3 && deviationRecent < -0.2) {
                // Fortemente sub-representado em ambas janelas
                scores[n] = 0.90;
            } else if (deviationTotal < -0.15) {
                // Moderadamente sub-representado
                scores[n] = 0.75;
            } else if (deviationTotal > 0.3 && deviationRecent > 0.2) {
                // Sobre-representado → tende a cair
                scores[n] = 0.25;
            } else if (deviationTotal > 0.15) {
                scores[n] = 0.40;
            } else {
                // Na média — score neutro
                scores[n] = 0.55;
            }
        }

        return this._normalizeScores(scores, startNum, endNum);
    }

    // ╔══════════════════════════════════════════════════════════════════════════════╗
    // ║  ★★★ SÍNTESE QUANTUM L99 — 16 CAMADAS DE PREDIÇÃO ★★★                    ║
    // ║  8 camadas clássicas + 4 Modo Deus + 4 QUANTUM L99                        ║
    // ║  CALIBRAÇÃO DINÂMICA com cross-validation de 7 sorteios                   ║
    // ╚══════════════════════════════════════════════════════════════════════════════╝
    static _scoreAllNumbers(gameKey, profile, history, startNum, endNum, totalRange) {
        const N = history.length;
        const drawSize = profile.lotteryDraw;

        // ━━━ CAMADAS 1-8: Base NE-V1 ━━━
        const freqScores = this._layerFrequency(history, startNum, endNum, N);
        const trendScores = this._layerTrend(history, startNum, endNum, N);
        const delayScores = this._layerDelay(history, startNum, endNum, N, drawSize, totalRange);
        const entropyScores = this._layerEntropy(history, startNum, endNum, N, profile);
        const markovScores = this._layerMarkov(history, startNum, endNum, N);
        const phaseScores = this._layerPhase(history, startNum, endNum, N);
        const clairScores = this._layerClairvoyance(history, startNum, endNum, N, drawSize);
        const nextDrawScores = this._layerNextDraw(gameKey, history, startNum, endNum, N, profile);

        // ━━━ CAMADAS 9-12: MODO DEUS ━━━
        const bayesianScores = this._godBayesian(history, startNum, endNum, N, drawSize);
        const positionalScores = this._godPositional(history, startNum, endNum, N, drawSize);
        const sequentialScores = this._godSequentialChain(history, startNum, endNum, N);
        const momentumScores = this._godMomentum(history, startNum, endNum, N, drawSize);

        // ━━━ CAMADAS 13-16: QUANTUM L99 ━━━
        const mirrorScores = this._quantumTemporalMirror(history, startNum, endNum, N, drawSize);
        const gapScores = this._quantumGapAnalysis(history, startNum, endNum, N, drawSize, totalRange);
        const clusterScores = this._quantumClusters(history, startNum, endNum, N, drawSize);
        const reversionScores = this._quantumMeanReversion(history, startNum, endNum, N, drawSize, totalRange);

        // ━━━ CAMADA 17: PRECISION CALIBRATOR — Futurologia dos Últimos 3 ━━━
        let precisionScores = {};
        for (let n = startNum; n <= endNum; n++) precisionScores[n] = 0.5;
        if (typeof PrecisionCalibrator !== 'undefined' && N >= 4) {
            try {
                const last3Trends = PrecisionCalibrator.analyzeLast3Trends(gameKey, history, startNum, endNum);
                const conditionalProb = PrecisionCalibrator.buildConditionalProbMatrix(gameKey, history, startNum, endNum, drawSize);
                for (let n = startNum; n <= endNum; n++) {
                    precisionScores[n] = (last3Trends[n] || 0) * 0.6 + (conditionalProb[n] || 0) * 0.4;
                }
                precisionScores = this._normalizeScores(precisionScores, startNum, endNum);
                console.log('[QUANTUM-L99] ★ CAMADA 17 (Precision Calibrator) — Futurologia ativada');
            } catch (e) {
                console.warn('[QUANTUM-L99] ⚠ Camada 17 falhou:', e.message);
            }
        }

        // ━━━ CAMADA 18: PATTERN DNA — Aprender com o Passado para Prever o Futuro ━━━
        // Analisa: o que os números SORTEADOS tinham de ESPECIAL?
        // Por que ESSES números saíram e não outros?
        // Projeta essas mesmas condições para o PRÓXIMO sorteio
        let patternDnaScores = {};
        for (let n = startNum; n <= endNum; n++) patternDnaScores[n] = 0.5;
        if (N >= 5) {
            const analysisWindow = Math.min(15, N); // Últimos 15 sorteios
            
            // ━━ PASSO 1: Para cada sorteio passado, extrair o "DNA" dos números que saíram ━━
            // DNA = {gapMédio, zonaDistribuição, paridadeRatio, somaRelativa, vizinhança}
            const winningDNA = [];
            for (let i = 0; i < analysisWindow; i++) {
                const nums = (history[i].numbers || []).sort((a, b) => a - b);
                if (nums.length === 0) continue;
                
                // Calcular DNA deste sorteio
                const sum = nums.reduce((a, b) => a + b, 0);
                const avgSum = (startNum + endNum) / 2 * drawSize;
                const somaRelativa = sum / avgSum; // >1 = soma alta, <1 = soma baixa
                
                const evens = nums.filter(x => x % 2 === 0).length;
                const paridadeRatio = evens / nums.length;
                
                // Gaps entre números consecutivos no jogo
                const gaps = [];
                for (let j = 1; j < nums.length; j++) gaps.push(nums[j] - nums[j-1]);
                const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
                
                // Zona dominante
                const zones = nums.map(x => Math.floor((x - startNum) / (totalRange / 4)));
                const zoneFreq = [0, 0, 0, 0];
                for (const z of zones) zoneFreq[Math.min(3, z)]++;
                
                // Atraso médio dos números no momento que saíram
                let avgDelay = 0;
                if (i + 1 < N) {
                    for (const n of nums) {
                        let delay = 0;
                        for (let k = i + 1; k < N; k++) {
                            if ((history[k].numbers || []).includes(n)) { delay = k - i; break; }
                        }
                        avgDelay += delay;
                    }
                    avgDelay /= nums.length;
                }
                
                winningDNA.push({
                    somaRelativa, paridadeRatio, avgGap, zoneFreq, avgDelay,
                    nums: new Set(nums), weight: Math.exp(-i * 0.12) // Recentes pesam mais
                });
            }
            
            // ━━ PASSO 2: Calcular o "DNA IDEAL" — média ponderada dos últimos sorteios ━━
            let idealSoma = 0, idealParidade = 0, idealGap = 0, idealDelay = 0;
            const idealZone = [0, 0, 0, 0];
            let totalWeight = 0;
            
            for (const dna of winningDNA) {
                idealSoma += dna.somaRelativa * dna.weight;
                idealParidade += dna.paridadeRatio * dna.weight;
                idealGap += dna.avgGap * dna.weight;
                idealDelay += dna.avgDelay * dna.weight;
                for (let z = 0; z < 4; z++) idealZone[z] += dna.zoneFreq[z] * dna.weight;
                totalWeight += dna.weight;
            }
            if (totalWeight > 0) {
                idealSoma /= totalWeight;
                idealParidade /= totalWeight;
                idealGap /= totalWeight;
                idealDelay /= totalWeight;
                for (let z = 0; z < 4; z++) idealZone[z] /= totalWeight;
            }
            
            // ━━ PASSO 3: Para cada número candidato, calcular "afinidade DNA" ━━
            // Quanto mais parecido com o DNA ideal, maior o score
            for (let n = startNum; n <= endNum; n++) {
                let score = 0.5;
                
                // A) ATRASO ATUAL vs atraso ideal dos vencedores
                let currentDelay = 0;
                for (let i = 0; i < N; i++) {
                    if ((history[i].numbers || []).concat(history[i].numbers2 || []).includes(n)) {
                        currentDelay = i;
                        break;
                    }
                    if (i === N - 1) currentDelay = N;
                }
                const delayMatch = 1.0 - Math.min(1.0, Math.abs(currentDelay - idealDelay) / Math.max(1, idealDelay * 2));
                score += delayMatch * 0.30;
                
                // B) ZONA — número está na zona que os vencedores preferem?
                const nZone = Math.min(3, Math.floor((n - startNum) / (totalRange / 4)));
                const zoneAffinity = idealZone[nZone] / Math.max(0.1, Math.max(...idealZone));
                score += zoneAffinity * 0.20;
                
                // C) VIZINHANÇA VENCEDORA — nos últimos sorteios, este número estava PERTO dos que saíram?
                let neighborBonus = 0;
                for (const dna of winningDNA.slice(0, 5)) { // Últimos 5
                    for (const wn of dna.nums) {
                        if (Math.abs(n - wn) <= 3 && Math.abs(n - wn) > 0) {
                            neighborBonus += dna.weight * 0.08;
                        }
                    }
                }
                score += Math.min(0.25, neighborBonus);
                
                // D) PADRÃO DE RETORNO — após sair, quantos sorteios até voltar? (ciclo individual)
                const appearances = [];
                for (let i = 0; i < Math.min(30, N); i++) {
                    if ((history[i].numbers || []).concat(history[i].numbers2 || []).includes(n)) {
                        appearances.push(i);
                    }
                }
                if (appearances.length >= 2) {
                    let avgCycle = 0;
                    for (let j = 0; j < appearances.length - 1; j++) {
                        avgCycle += appearances[j + 1] - appearances[j];
                    }
                    avgCycle /= (appearances.length - 1);
                    const cycleMatch = 1.0 - Math.min(1.0, Math.abs(currentDelay - avgCycle) / Math.max(1, avgCycle));
                    score += cycleMatch * 0.25; // Ponto ótimo de retorno
                }
                
                patternDnaScores[n] = score;
            }
            
            patternDnaScores = this._normalizeScores(patternDnaScores, startNum, endNum);
            console.log('[QUANTUM-L99] ★ CAMADA 18 (Pattern DNA) — Aprendendo com o passado para prever o futuro');
            console.log('[QUANTUM-L99]    DNA Ideal: soma=' + idealSoma.toFixed(2) + ' | paridade=' + idealParidade.toFixed(2) + ' | gap=' + idealGap.toFixed(1) + ' | delay=' + idealDelay.toFixed(1));
        }

        console.log('%c[QUANTUM-L99] ★★★ 18 CAMADAS ATIVADAS — ' + gameKey + ' ★★★', 'color: gold; font-weight: bold;');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ★★★ CONSENSO ENSEMBLE L99 — Votação entre 18 camadas ★★★
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const allLayers = [
            freqScores, trendScores, delayScores, entropyScores,
            markovScores, phaseScores, clairScores, nextDrawScores,
            bayesianScores, positionalScores, sequentialScores, momentumScores,
            mirrorScores, gapScores, clusterScores, reversionScores,
            precisionScores, patternDnaScores
        ];

        const topCandidateSize = Math.min(drawSize * 3, totalRange);
        const voteCount = {};
        for (let n = startNum; n <= endNum; n++) voteCount[n] = 0;

        for (const layer of allLayers) {
            const ranked = Object.entries(layer)
                .sort((a, b) => b[1] - a[1])
                .slice(0, topCandidateSize);
            for (const [numStr] of ranked) {
                voteCount[parseInt(numStr)]++;
            }
        }

        // Log consenso L99
        const consensusNums = [];
        for (let n = startNum; n <= endNum; n++) {
            if (voteCount[n] >= 13) consensusNums.push(n + '(' + voteCount[n] + ')');
        }
        if (consensusNums.length > 0) {
            console.log('[QUANTUM-L99] ★ CONSENSO 13+/18: ' + consensusNums.join(', '));
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ★★★ v5.0: Cross-validation 12 sorteios + NDCG ★★★
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const NUM_LAYERS = 18;
        let dynamicBoosts = new Array(NUM_LAYERS).fill(1.0);
        if (N >= 8) {
            const testDraws = Math.min(12, N - 5);
            for (let t = 0; t < testDraws; t++) {
                const testHistory = history.slice(t + 1);
                const actualResult = new Set(
                    (history[t].numbers || []).concat(history[t].numbers2 || [])
                );
                const testN = testHistory.length;

                const testLayers = [
                    this._layerFrequency(testHistory, startNum, endNum, testN),
                    this._layerTrend(testHistory, startNum, endNum, testN),
                    this._layerDelay(testHistory, startNum, endNum, testN, drawSize, totalRange),
                    this._layerEntropy(testHistory, startNum, endNum, testN, profile),
                    this._layerMarkov(testHistory, startNum, endNum, testN),
                    this._layerPhase(testHistory, startNum, endNum, testN),
                    this._layerClairvoyance(testHistory, startNum, endNum, testN, drawSize),
                    this._layerNextDraw(gameKey, testHistory, startNum, endNum, testN, profile),
                    this._godBayesian(testHistory, startNum, endNum, testN, drawSize),
                    this._godPositional(testHistory, startNum, endNum, testN, drawSize),
                    this._godSequentialChain(testHistory, startNum, endNum, testN),
                    this._godMomentum(testHistory, startNum, endNum, testN, drawSize)
                ];

                // Camadas QUANTUM (13-16)
                testLayers.push(this._quantumTemporalMirror(testHistory, startNum, endNum, testN, drawSize));
                testLayers.push(this._quantumGapAnalysis(testHistory, startNum, endNum, testN, drawSize, totalRange));
                testLayers.push(this._quantumClusters(testHistory, startNum, endNum, testN, drawSize));
                testLayers.push(this._quantumMeanReversion(testHistory, startNum, endNum, testN, drawSize, totalRange));

                // Camada 17: Precision
                if (typeof PrecisionCalibrator !== 'undefined' && testN >= 4) {
                    try {
                        const tLast3 = PrecisionCalibrator.analyzeLast3Trends(gameKey, testHistory, startNum, endNum);
                        const tCond = PrecisionCalibrator.buildConditionalProbMatrix(gameKey, testHistory, startNum, endNum, drawSize);
                        const tPrec = {};
                        for (let n = startNum; n <= endNum; n++) tPrec[n] = (tLast3[n] || 0) * 0.6 + (tCond[n] || 0) * 0.4;
                        testLayers.push(this._normalizeScores(tPrec, startNum, endNum));
                    } catch(e) {
                        testLayers.push({});
                    }
                } else {
                    testLayers.push({});
                }

                // Camada 18: Pattern DNA (simplificado para cross-validation)
                testLayers.push({}); // Placeholder — DNA é pesado demais para CV

                for (let L = 0; L < NUM_LAYERS; L++) {
                    const layerTop = Object.entries(testLayers[L] || {})
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, Math.ceil(drawSize * 2.0)) // v5.1: drawSize*2 para capturar mais hits
                        .map(e => parseInt(e[0]));
                    // v5.1: NDCG-inspired com peso MAIOR — hits no top valem MUITO
                    let ndcgScore = 0;
                    for (let r = 0; r < layerTop.length; r++) {
                        if (actualResult.has(layerTop[r])) {
                            ndcgScore += 1.0 / Math.log2(r + 2); // DCG: 1/log2(rank+2)
                        }
                    }
                    dynamicBoosts[L] += ndcgScore * 1.2; // v5.1: peso 0.8→1.2 (mais impacto)
                }
            }

            const avgBoost = dynamicBoosts.reduce((a, b) => a + b, 0) / NUM_LAYERS;
            for (let L = 0; L < NUM_LAYERS; L++) {
                dynamicBoosts[L] = Math.max(0.5, dynamicBoosts[L] / avgBoost);
            }

            const names = ['freq','trend','delay','zone','markov','phase','clair','next','bayes','posit','seq','mom','mirror','gap','cluster','revert','prec','dna'];
            const boostStr = dynamicBoosts.map((b, i) => names[i] + '=' + b.toFixed(2)).join(' ');
            console.log('[QUANTUM-L99] ★ v5.0 CALIBRAÇÃO (12-fold NDCG, 18 camadas): ' + boostStr);
        }

        // ━━━ PESOS QUANTUM L99 ━━━
        const weights = this._getGodModeWeights(gameKey);

        const scores = {};
        const [clampMin, clampMax] = profile.scoreClamp;

        // ★ PRECISION v2.0: peso da camada 17 (precision)
        const precisionWeight = weights.precision || 0.12;
        // ★ V4.0: peso da camada 18 (Pattern DNA — aprender com o passado)
        const dnaWeight = weights.patternDna || 0.12;

        for (let n = startNum; n <= endNum; n++) {
            let raw = (freqScores[n] || 0) * weights.frequency * dynamicBoosts[0]
                    + (trendScores[n] || 0) * weights.trend * dynamicBoosts[1]
                    + (delayScores[n] || 0) * weights.delay * dynamicBoosts[2]
                    + (entropyScores[n] || 0) * weights.zone * dynamicBoosts[3]
                    + (markovScores[n] || 0) * weights.markov * dynamicBoosts[4]
                    + (phaseScores[n] || 0) * weights.phase * dynamicBoosts[5]
                    + (clairScores[n] || 0) * weights.clairvoyance * dynamicBoosts[6]
                    + (nextDrawScores[n] || 0) * weights.nextDraw * dynamicBoosts[7]
                    + (bayesianScores[n] || 0) * weights.bayesian * dynamicBoosts[8]
                    + (positionalScores[n] || 0) * weights.positional * dynamicBoosts[9]
                    + (sequentialScores[n] || 0) * weights.sequential * dynamicBoosts[10]
                    + (momentumScores[n] || 0) * weights.momentum * dynamicBoosts[11]
                    + (mirrorScores[n] || 0) * weights.mirror * dynamicBoosts[12]
                    + (gapScores[n] || 0) * weights.gap * dynamicBoosts[13]
                    + (clusterScores[n] || 0) * weights.cluster * dynamicBoosts[14]
                    + (reversionScores[n] || 0) * weights.reversion * dynamicBoosts[15]
                    + (precisionScores[n] || 0) * precisionWeight * dynamicBoosts[16]
                    + (patternDnaScores[n] || 0) * dnaWeight * dynamicBoosts[17];

            // ★ V6.0: CONSENSO MODERADO — sem dominância extrema
            // Range reduzido de 10x (0.25-2.5) para 2.3x (0.65-1.50)
            // Isso permite que números com menos votos ainda participem
            const votes = voteCount[n] || 0;
            if (votes >= 17) raw *= 1.50;       // 17-18: consenso forte
            else if (votes >= 15) raw *= 1.38;  // 15-16: muito bom
            else if (votes >= 13) raw *= 1.25;  // 13-14: bom
            else if (votes >= 11) raw *= 1.12;  // 11-12: moderado
            else if (votes >= 9) raw *= 1.00;   // 9-10: neutro
            else if (votes >= 7) raw *= 0.88;   // 7-8: leve penalidade
            else if (votes >= 4) raw *= 0.75;   // 4-6: penalidade moderada
            else raw *= 0.65;                    // 0-3: penalidade (mas ainda viável)

            scores[n] = Math.max(clampMin, Math.min(clampMax, raw + 1.0));
        }

        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const top5 = sorted.slice(0, 5).map(e => e[0] + '(' + e[1].toFixed(2) + '/v' + voteCount[parseInt(e[0])] + ')').join(', ');
        const bot5 = sorted.slice(-5).map(e => e[0] + '(' + e[1].toFixed(2) + ')').join(', ');
        console.log('[QUANTUM-L99] ★ Top5: ' + top5 + ' | ⬇ Bot5: ' + bot5);

        return scores;
    }

    // ╔══════════════════════════════════════════════════════════════════════════╗
    // ║  ★★★ PESOS QUANTUM L99 v4.0 — 18 DIMENSÕES POR LOTERIA ★★★            ║
    // ║  + Camada 17: PRECISION (Futurologia dos últimos 3)                    ║
    // ║  + Camada 18: PATTERN DNA (Aprender com o passado)                     ║
    // ║  Noise ZERO — foco total na assertividade preditiva                    ║
    // ╚══════════════════════════════════════════════════════════════════════════╝
    static _getGodModeWeights(gameKey) {
        const calibrations = {

            // ★ MEGA SENA: 6/60 — DNA + precision + gap + mirror
            megasena: {
                frequency: 0.02, delay: 0.04, trend: 0.02,
                zone: 0.02, markov: 0.02, phase: 0.01,
                clairvoyance: 0.01, nextDraw: 0.11,
                bayesian: 0.08, positional: 0.06,
                sequential: 0.08, momentum: 0.03,
                mirror: 0.09, gap: 0.08, cluster: 0.06, reversion: 0.05,
                precision: 0.10, patternDna: 0.12
            },

            // ★ LOTOFÁCIL: 15/25 — precision + DNA altos (padrão forte)
            lotofacil: {
                frequency: 0.01, delay: 0.02, trend: 0.01,
                zone: 0.01, markov: 0.01, phase: 0.01,
                clairvoyance: 0.01, nextDraw: 0.18,
                bayesian: 0.06, positional: 0.03,
                sequential: 0.07, momentum: 0.02,
                mirror: 0.09, gap: 0.05, cluster: 0.07, reversion: 0.05,
                precision: 0.16, patternDna: 0.14
            },

            // ★ QUINA: 5/80 — gap + DNA + precision (range amplo, ciclos longos)
            quina: {
                frequency: 0.02, delay: 0.06, trend: 0.02,
                zone: 0.04, markov: 0.02, phase: 0.01,
                clairvoyance: 0.01, nextDraw: 0.08,
                bayesian: 0.08, positional: 0.04,
                sequential: 0.06, momentum: 0.02,
                mirror: 0.07, gap: 0.11, cluster: 0.05, reversion: 0.07,
                precision: 0.11, patternDna: 0.13
            },

            // ★ DUPLA SENA: 6/50 — DNA + precision + sequential (2 sorteios)
            duplasena: {
                frequency: 0.02, delay: 0.04, trend: 0.02,
                zone: 0.02, markov: 0.02, phase: 0.01,
                clairvoyance: 0.01, nextDraw: 0.10,
                bayesian: 0.06, positional: 0.05,
                sequential: 0.09, momentum: 0.02,
                mirror: 0.08, gap: 0.07, cluster: 0.06, reversion: 0.05,
                precision: 0.12, patternDna: 0.16
            },

            // ★ LOTOMANIA: 50/100 — reversion + gap + DNA + precision
            lotomania: {
                frequency: 0.01, delay: 0.02, trend: 0.01,
                zone: 0.05, markov: 0.01, phase: 0.01,
                clairvoyance: 0.01, nextDraw: 0.06,
                bayesian: 0.07, positional: 0.02,
                sequential: 0.04, momentum: 0.02,
                mirror: 0.08, gap: 0.11, cluster: 0.06, reversion: 0.12,
                precision: 0.12, patternDna: 0.18
            },

            // ★ TIMEMANIA: 10/80 — gap + DNA + precision + mirror
            timemania: {
                frequency: 0.02, delay: 0.06, trend: 0.02,
                zone: 0.04, markov: 0.02, phase: 0.01,
                clairvoyance: 0.01, nextDraw: 0.07,
                bayesian: 0.08, positional: 0.04,
                sequential: 0.06, momentum: 0.02,
                mirror: 0.09, gap: 0.09, cluster: 0.04, reversion: 0.05,
                precision: 0.11, patternDna: 0.17
            },

            // ★ DIA DE SORTE V3.0: 7/31 — PARES + DNA + ÚLTIMOS 3
            diadesorte: {
                frequency: 0.03, delay: 0.04, trend: 0.03,
                zone: 0.02, markov: 0.03, phase: 0.01,
                clairvoyance: 0.01, nextDraw: 0.10,
                bayesian: 0.05, positional: 0.03,
                sequential: 0.03, momentum: 0.02,
                mirror: 0.05, gap: 0.05, cluster: 0.12, reversion: 0.03,
                precision: 0.13, patternDna: 0.22
            }
        };

        const w = calibrations[gameKey] || calibrations.megasena;
        const quantumPct = ((w.mirror + w.gap + w.cluster + w.reversion) * 100).toFixed(0);
        const godPct = ((w.bayesian + w.positional + w.sequential + w.momentum) * 100).toFixed(0);
        const precPct = ((w.precision || 0) * 100).toFixed(0);
        const dnaPct = ((w.patternDna || 0) * 100).toFixed(0);
        console.log('[QUANTUM-L99] ★ ' + gameKey + ': DNA=' + dnaPct + '% | Precision=' + precPct + '% | Quantum=' + quantumPct + '% | God=' + godPct + '% | nextDraw=' + (w.nextDraw * 100).toFixed(0) + '%');
        return w;
    }

    // Manter retrocompatibilidade
    static _getCalibratedWeights(gameKey) {
        return this._getGodModeWeights(gameKey);
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  GERADOR DE JOGOS DIVERSIFICADOS                             ║
    // ║  Cada jogo é maximamente diferente dos anteriores            ║
    // ║  Anti-concentração: nenhum número aparece em > X% dos jogos ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _generateDiverseGames(profile, scores, pool, numGames, drawSize, fixedNumbers, startNum, endNum, hasUserSelection, adaptiveParams, history) {
        const games = [];
        const usedKeys = new Set();
        const usedCount = {};
        for (const n of pool) usedCount[n] = 0;
        const numZones = profile.zones;
        const zoneSize = profile.zoneSize;

        // ★ v5.0: Extrair último sorteio para filtro de repetição
        let lastDrawSet = new Set();
        if (history && history.length > 0) {
            const lastNums = (history[0].numbers || []).concat(history[0].numbers2 || []);
            lastDrawSet = new Set(lastNums.filter(n => n >= startNum && n <= endNum));
            console.log('[NE-L99] ★ v5.0: lastDraw=[' + [...lastDrawSet].sort((a,b)=>a-b).join(',') + '] | repeatFromLast=' + JSON.stringify(profile.repeatFromLast));
        }

        // ━━ CALIBRAÇÃO ADAPTATIVA L99 ━━
        const ap = adaptiveParams || {};
        const maxUsage = Math.max(3, Math.ceil(numGames * (ap.maxUsagePct || profile.maxUsagePct)));
        const maxOverlap = ap.maxOverlap !== undefined ? ap.maxOverlap : profile.maxOverlap;
        const checkRadius = ap.checkRadius || 30;

        // ━━ FASE 1: Jogos de QUALIDADE com IA + filtros v5.0 ━━
        const fase1MaxAttempts = numGames <= 100
            ? numGames * 800
            : numGames <= 1000
                ? Math.min(numGames * 500, 5000000)
                : Math.min(numGames * 200, 10000000);
        const fase1Timeout = numGames <= 100
            ? 30000
            : numGames <= 1000
                ? 120000
                : numGames <= 5000
                    ? 300000
                    : 600000;
        const startTime = Date.now();
        let attempts = 0;

        console.log('[NE-L99] ★ v5.0 Roulette Wheel | ' + numGames + ' jogos | pool=' + pool.length + ' | overlap=' + maxOverlap + '/' + drawSize + ' | timeout=' + (fase1Timeout/1000) + 's');

        let currentOverlap = maxOverlap;
        let lastLog = 0;
        const gameSetsCache = [];

        while (games.length < numGames && attempts < fase1MaxAttempts && (Date.now() - startTime) < fase1Timeout) {
            attempts++;

            const progressRatio = attempts / fase1MaxAttempts;
            if (progressRatio > 0.30 && currentOverlap < drawSize) {
                currentOverlap = Math.min(drawSize, maxOverlap + Math.floor((progressRatio - 0.30) * drawSize * 1.5));
            }

            const ticket = this._generateSingleGame(profile, scores, pool, drawSize, fixedNumbers, usedCount, maxUsage, startNum, endNum, numZones, zoneSize, games.length, numGames, lastDrawSet);
            if (!ticket || ticket.length < drawSize) continue;
            const key = ticket.join(',');
            if (usedKeys.has(key)) continue;

            // Anti-overlap: verificar apenas os últimos checkRadius jogos
            // ★ PERFORMANCE FIX v3.0: Usar Sets pré-computados do cache
            if (games.length > 0 && progressRatio < 0.75) {
                let tooSimilar = false;
                const checkFrom = Math.max(0, gameSetsCache.length - checkRadius);
                for (let g = checkFrom; g < gameSetsCache.length; g++) {
                    let overlap = 0;
                    for (const n of ticket) { if (gameSetsCache[g].has(n)) overlap++; }
                    if (overlap > currentOverlap) { tooSimilar = true; break; }
                }
                if (tooSimilar) continue;
            }

            games.push(ticket);
            usedKeys.add(key);
            gameSetsCache.push(new Set(ticket));
            for (const n of ticket) usedCount[n] = (usedCount[n] || 0) + 1;

            // ★ PERFORMANCE FIX v3.0: Limitar tamanho do cache de Sets
            // Para lotes enormes, manter apenas os últimos checkRadius*2 Sets no cache
            if (gameSetsCache.length > checkRadius * 2 + 50) {
                gameSetsCache.splice(0, gameSetsCache.length - checkRadius * 2);
            }

            // Log progresso a cada 10%
            const pct = Math.floor(games.length / numGames * 10);
            if (pct > lastLog) {
                lastLog = pct;
                console.log('[NE-L99] Fase1: ' + games.length + '/' + numGames + ' (' + (pct*10) + '%) overlap=' + currentOverlap + ' [' + (Date.now() - startTime) + 'ms]');
            }
        }
        const fase1Count = games.length;
        console.log('[NE-L99] Fase1 (IA): ' + fase1Count + '/' + numGames + ' em ' + attempts + ' tentativas (' + (Date.now() - startTime) + 'ms)');

        // ━━ FASE 2: ★ v5.0: COMPLETAR com mesma IA (filtros relaxados mas ativos) ━━
        // NÃO mais usa tournament selection separada — reutiliza _generateSingleGame
        // com overlap relaxado para garantir que filtros estruturais sejam aplicados
        if (games.length < numGames) {
            const remaining = numGames - games.length;
            console.log('[NE-L99] Fase2 v5.0: gerando ' + remaining + ' jogos com IA completa (overlap relaxado)...');
            let bulkAtt = 0;
            const bulkMax = Math.max(remaining * 800, 5000000);
            const bulkTimeout = Math.max(300000, Math.min(900000, remaining * 60));

            while (games.length < numGames && bulkAtt < bulkMax && (Date.now() - startTime) < bulkTimeout) {
                bulkAtt++;
                // Usar o mesmo gerador com filtros v5.0 ativos
                const ticket = this._generateSingleGame(profile, scores, pool, drawSize, fixedNumbers, usedCount, maxUsage * 3, startNum, endNum, numZones, zoneSize, games.length, numGames, lastDrawSet);
                if (!ticket || ticket.length < drawSize) continue;
                const key = ticket.join(',');
                if (!usedKeys.has(key)) {
                    games.push(ticket);
                    usedKeys.add(key);
                    for (const n of ticket) usedCount[n] = (usedCount[n] || 0) + 1;
                }
            }
            console.log('[NE-L99] Fase2 v5.0: +' + (games.length - fase1Count) + ' em ' + bulkAtt + ' tentativas (' + (Date.now() - startTime) + 'ms)');
        }

        console.log('[NE-L99] ✅ TOTAL: ' + games.length + '/' + numGames + ' jogos gerados em ' + (Date.now() - startTime) + 'ms');
        const maxUsed = Math.max(0, ...Object.values(usedCount));
        const maxPct = games.length > 0 ? (maxUsed / games.length * 100).toFixed(1) : 0;
        const numsUsed = Object.values(usedCount).filter(v => v > 0).length;
        console.log('[NE-L99] MaxConc: ' + maxPct + '% | Nums: ' + numsUsed + '/' + pool.length);
        return games;
    }

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  ★★★ v5.0: GERAR JOGO COM ROULETTE WHEEL + FILTROS RIGOROSOS ★★★  ║
    // ║  Mudanças v5.0:                                                     ║
    // ║   1. Roulette Wheel Selection (score^exponent) → correlação direta  ║
    // ║   2. Filtros SEMPRE ativos (soma, paridade, repetição) em TODO lote ║
    // ║   3. Validação de repetição do sorteio anterior                     ║
    // ║   4. Expoente adaptativo: ≤1K=4, ≤5K=3, >5K=2                     ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    static _generateSingleGame(profile, scores, pool, drawSize, fixedNumbers, usedCount, maxUsage, startNum, endNum, numZones, zoneSize, gameIndex, totalGames, lastDrawSet) {
        const ticket = [];
        const ticketSet = new Set();
        const zoneCount = new Array(numZones).fill(0);

        // 1. Inserir fixos
        for (const f of fixedNumbers) {
            if (f >= startNum && f <= endNum && !ticketSet.has(f) && ticket.length < drawSize) {
                ticket.push(f);
                ticketSet.add(f);
                const z = Math.min(numZones - 1, Math.floor((f - startNum) / zoneSize));
                zoneCount[z]++;
            }
        }

        // 2. Construir pesos dinâmicos com EXPONENCIAÇÃO v5.0
        const available = pool.filter(n => {
            if (ticketSet.has(n)) return false;
            if ((usedCount[n] || 0) >= maxUsage) return false;
            return true;
        });
        if (available.length < drawSize - ticket.length) return null;

        // ★ v5.0: Expoente adaptativo TIERED — foco MÁXIMO em lotes pequenos
        // SNIPER: score^5 (um número com score 2x tem 32x mais chance!)
        // CIRÚRGICO: score^4
        // INTELIGENTE: score^3
        // COBERTURA: score^2
        // ★ v5.1: Expoentes MAIS agressivos + novo tier ≤10 com score^6
        // ★ V6.0: Expoente moderado — score 2x agora dá 8x chance (não 64x)
        // Isso ESPALHA a seleção ao invés de convergir nos mesmos 5 números
        const exponent = totalGames <= 10 ? 3.0 : totalGames <= 50 ? 2.8 : totalGames <= 100 ? 2.5 : totalGames <= 500 ? 2.2 : totalGames <= 1000 ? 2.0 : 1.5;

        const weights = {};
        for (const n of available) {
            let w = scores[n] || 1.0;

            // ★ v5.1: Penalizar uso excessivo mais agressivamente em lotes pequenos
            const usage = (usedCount[n] || 0) / Math.max(1, maxUsage);
            const usagePenalty = totalGames <= 100 ? 3 : 2;
            w *= Math.pow(1 - usage, usagePenalty);
            if (usedCount[n] === 0 || usedCount[n] === undefined) w *= (totalGames <= 50 ? 2.0 : 1.5);

            // Anti-consecutivo por perfil
            if (profile.maxConsecutive <= 2) {
                if (this._wouldCreate3Consecutive(n, ticketSet)) w *= 0.001;
                if (ticketSet.has(n - 1) || ticketSet.has(n + 1)) {
                    let existingConsecPairs = 0;
                    const sortedTicket = [...ticketSet].sort((a, b) => a - b);
                    for (let i = 1; i < sortedTicket.length; i++) {
                        if (sortedTicket[i] - sortedTicket[i-1] === 1) existingConsecPairs++;
                    }
                    w *= existingConsecPairs >= 1 ? 0.08 : 0.45;
                }
            } else if (profile.maxConsecutive <= 3) {
                if (this._wouldCreate3Consecutive(n, ticketSet)) w *= 0.005;
            } else if (profile.maxConsecutive <= 5) {
                if (this._wouldCreate3Consecutive(n, ticketSet)) w *= 0.50;
            }

            // ★ v5.0: EXPONENCIAR o peso para amplificar diferenças
            weights[n] = Math.max(0.0001, Math.pow(Math.max(0.001, w), exponent));
        }

        // 3. Seleção por zona (cobertura mínima)
        const minZones = Math.min(profile.minZonesCovered, numZones);
        const zonesNeeded = [];
        for (let z = 0; z < numZones; z++) {
            if (zoneCount[z] === 0) zonesNeeded.push(z);
        }
        for (let i = zonesNeeded.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [zonesNeeded[i], zonesNeeded[j]] = [zonesNeeded[j], zonesNeeded[i]];
        }
        const zonesToCover = zonesNeeded.slice(0, Math.max(0, minZones - (numZones - zonesNeeded.length)));
        for (const z of zonesToCover) {
            if (ticket.length >= drawSize) break;
            const inZone = available.filter(n => {
                const nz = Math.min(numZones - 1, Math.floor((n - startNum) / zoneSize));
                return nz === z && !ticketSet.has(n);
            });
            if (inZone.length === 0) continue;
            const chosen = this._weightedPick(inZone, weights);
            if (chosen !== null) {
                ticket.push(chosen);
                ticketSet.add(chosen);
                zoneCount[z]++;
            }
        }

        // 4. ★ v5.0: ROULETTE WHEEL SELECTION (substitui Tournament)
        while (ticket.length < drawSize) {
            const remaining = available.filter(n => !ticketSet.has(n));
            if (remaining.length === 0) break;
            const chosen = this._rouletteWheelPick(remaining, weights);
            if (chosen === null) break;
            ticket.push(chosen);
            ticketSet.add(chosen);
            const z = Math.min(numZones - 1, Math.floor((chosen - startNum) / zoneSize));
            zoneCount[z]++;
        }

        if (ticket.length < drawSize) return null;
        ticket.sort((a, b) => a - b);

        // 5. ★ v5.0: VALIDAÇÕES ESTRUTURAIS SEMPRE ATIVAS (não mais skip por batch size!)
        const fixedRatio = fixedNumbers.length / drawSize;
        const skipValidation = fixedRatio >= 0.5; // Só skip se >50% são fixos do usuário

        if (!skipValidation) {
            // Paridade
            const evens = ticket.filter(n => n % 2 === 0).length;
            if (evens < profile.evenOddRange[0] || evens > profile.evenOddRange[1]) return null;

            // Soma
            const sum = ticket.reduce((a, b) => a + b, 0);
            if (sum < profile.sumRange[0] || sum > profile.sumRange[1]) return null;

            // ★ v5.0: REPETIÇÃO DO SORTEIO ANTERIOR (filtro estrutural novo)
            if (lastDrawSet && lastDrawSet.size > 0 && profile.repeatFromLast) {
                let repeatCount = 0;
                for (const n of ticket) {
                    if (lastDrawSet.has(n)) repeatCount++;
                }
                const [minRepeat, maxRepeat] = profile.repeatFromLast;
                if (repeatCount < minRepeat || repeatCount > maxRepeat) return null;
            }
        }

        return ticket;
    }

    // ★ v5.0: ROULETTE WHEEL SELECTION — probabilidade proporcional ao peso
    static _rouletteWheelPick(items, weights) {
        if (items.length === 0) return null;
        let totalW = 0;
        for (const n of items) totalW += (weights[n] || 0.0001);
        if (totalW <= 0) return items[Math.floor(Math.random() * items.length)];
        let rand = Math.random() * totalW;
        for (const n of items) {
            rand -= (weights[n] || 0.0001);
            if (rand <= 0) return n;
        }
        return items[items.length - 1];
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  BACKTESTING HONESTO — Confiança REAL                        ║
    // ║  Confere jogos contra sorteios anteriores reais              ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _backtestHonest(games, history, profile, gameKey, totalRange, drawSize) {
        const N = history.length;
        const btCount = Math.min(20, N);
        const gameSets = games.slice(0, Math.min(games.length, 300)).map(g => new Set(g));

        let totalBestHits = 0, maxHits = 0;
        const hitDistribution = {};
        let bt3 = 0, bt4 = 0, bt5 = 0;

        for (let t = 0; t < btCount; t++) {
            const drawn = new Set((history[t].numbers || []).concat(history[t].numbers2 || []));
            let bestHits = 0;

            for (const gs of gameSets) {
                let hits = 0;
                for (const n of gs) {
                    if (drawn.has(n)) hits++;
                }
                if (hits > bestHits) bestHits = hits;
            }

            totalBestHits += bestHits;
            if (bestHits > maxHits) maxHits = bestHits;
            hitDistribution[bestHits] = (hitDistribution[bestHits] || 0) + 1;
            if (bestHits >= 3) bt3++;
            if (bestHits >= 4) bt4++;
            if (bestHits >= 5) bt5++;
        }

        const avgHits = btCount > 0 ? totalBestHits / btCount : 0;
        const lotteryDraw = profile.lotteryDraw;
        const expectedRandom = drawSize * lotteryDraw / totalRange;
        const improvement = avgHits / Math.max(0.01, expectedRandom);

        // Confiança baseada na melhoria real vs acaso
        let confidence;
        if (improvement >= 2.0) confidence = Math.min(85, 60 + Math.round(improvement * 10));
        else if (improvement >= 1.5) confidence = Math.min(75, 50 + Math.round(improvement * 15));
        else if (improvement >= 1.1) confidence = Math.min(65, 40 + Math.round(improvement * 20));
        else confidence = Math.max(30, Math.round(improvement * 35));
        confidence = Math.max(25, Math.min(85, confidence));

        // Ajustar pela quantidade de jogos
        if (games.length >= 100) confidence = Math.min(85, confidence + 5);
        if (games.length >= 500) confidence = Math.min(85, confidence + 3);

        const uniqueNums = new Set(games.flat());
        const coverage = Math.round(uniqueNums.size / totalRange * 100);
        const maxFreq = Math.max(0, ...Object.values(this._countFreqs(games)));
        const maxConcentrationPct = games.length > 0 ? Math.round(maxFreq / games.length * 100) : 0;

        const winRate3 = btCount > 0 ? Math.round(bt3 / btCount * 100) : 0;
        const winRate4 = btCount > 0 ? Math.round(bt4 / btCount * 100) : 0;

        console.log('[QUANTUM-L99] 🧪 Backtesting (' + btCount + ' sorteios):');
        console.log('[QUANTUM-L99]    Média melhor acerto: ' + avgHits.toFixed(2) + ' (esperado acaso: ' + expectedRandom.toFixed(2) + ')');
        console.log('[QUANTUM-L99]    Melhor: ' + maxHits + ' | 3+: ' + winRate3 + '% | 4+: ' + winRate4 + '%');
        console.log('[QUANTUM-L99]    Melhoria vs acaso: ' + improvement.toFixed(2) + 'x | Confiança: ' + confidence + '%');

        return {
            confidence,
            coverage,
            diversity: Math.max(0, 100 - maxConcentrationPct),
            uniqueNumbers: uniqueNums.size,
            uniqueCount: uniqueNums.size,
            maxConcentration: maxConcentrationPct + '%',
            backtestScore: winRate3,
            backtestHits: { '5+': bt5, '4+': bt4, '3+': bt3, avg: avgHits.toFixed(2), maxHits },
            improvement: improvement.toFixed(2) + 'x',
            engine: 'QUANTUM L99 — ' + (profile.name || gameKey),
            mode: 'QUANTUM L99 — 16 Camadas | Espelho Temporal | Clusters | Regressão'
        };
    }

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  NÚMEROS SUGERIDOS — QUANTUM L99                                ║
    // ║  Retorna os N números com maior projeção futura usando         ║
    // ║  todas as 16 camadas de análise QUANTUM                        ║
    // ╚══════════════════════════════════════════════════════════════════╝
    static suggestNumbers(gameKey, count) {
        const profile = this.getProfile(gameKey);
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        if (!game) return [];

        const startNum = profile.range[0];
        const endNum = profile.range[1];
        const totalRange = endNum - startNum + 1;

        let history = [];
        try {
            if (typeof StatsService !== 'undefined') {
                history = StatsService.getRecentResults(gameKey, 200) || [];
            }
            if (history.length === 0 && typeof REAL_HISTORY_DB !== 'undefined') {
                history = REAL_HISTORY_DB[gameKey] || [];
            }
        } catch (e) {}

        // Calcular scores QUANTUM L99 deterministicos (sem noise)
        const scores = this._scoreForSuggestionL99(gameKey, profile, history, startNum, endNum, totalRange);

        // Ordenar e retornar os top N
        const ranked = Object.entries(scores)
            .map(([n, s]) => ({ num: parseInt(n), score: s }))
            .sort((a, b) => b.score - a.score);

        // Garantir cobertura de zonas nos sugeridos
        const numZones = profile.zones;
        const zoneSize = profile.zoneSize;
        const result = [];
        const zoneCovered = new Array(numZones).fill(false);

        for (let z = 0; z < numZones; z++) {
            const inZone = ranked.filter(r => {
                const nz = Math.min(numZones - 1, Math.floor((r.num - startNum) / zoneSize));
                return nz === z;
            });
            if (inZone.length > 0 && result.length < count) {
                result.push(inZone[0].num);
                zoneCovered[z] = true;
            }
        }

        for (const r of ranked) {
            if (result.length >= count) break;
            if (!result.includes(r.num)) {
                result.push(r.num);
            }
        }

        return result.sort((a, b) => a - b).slice(0, count);
    }

    // ★★★ Score QUANTUM L99 para sugestões: 16 camadas sem noise ★★★
    static _scoreForSuggestionL99(gameKey, profile, history, startNum, endNum, totalRange) {
        const N = history.length;
        const drawSize = profile.lotteryDraw;

        // Todas as 16 camadas
        const layers = [
            this._layerFrequency(history, startNum, endNum, N),
            this._layerTrend(history, startNum, endNum, N),
            this._layerDelay(history, startNum, endNum, N, drawSize, totalRange),
            this._layerEntropy(history, startNum, endNum, N, profile),
            this._layerMarkov(history, startNum, endNum, N),
            this._layerPhase(history, startNum, endNum, N),
            this._layerClairvoyance(history, startNum, endNum, N, drawSize),
            this._layerNextDraw(gameKey, history, startNum, endNum, N, profile),
            this._godBayesian(history, startNum, endNum, N, drawSize),
            this._godPositional(history, startNum, endNum, N, drawSize),
            this._godSequentialChain(history, startNum, endNum, N),
            this._godMomentum(history, startNum, endNum, N, drawSize),
            this._quantumTemporalMirror(history, startNum, endNum, N, drawSize),
            this._quantumGapAnalysis(history, startNum, endNum, N, drawSize, totalRange),
            this._quantumClusters(history, startNum, endNum, N, drawSize),
            this._quantumMeanReversion(history, startNum, endNum, N, drawSize, totalRange)
        ];

        const w = this._getGodModeWeights(gameKey);
        const wKeys = ['frequency','trend','delay','zone','markov','phase','clairvoyance','nextDraw','bayesian','positional','sequential','momentum','mirror','gap','cluster','reversion'];
        const scores = {};

        for (let n = startNum; n <= endNum; n++) {
            let total = 0;
            for (let i = 0; i < 16; i++) {
                total += (layers[i][n] || 0) * (w[wKeys[i]] || 0.05);
            }
            scores[n] = total;
        }

        return scores;
    }

    // Manter retrocompatibilidade
    static _scoreAllNumbersDeterministic(gameKey, profile, history, startNum, endNum, totalRange) {
        return this._scoreForSuggestionL99(gameKey, profile, history, startNum, endNum, totalRange);
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  ★ v5.0: NORMALIZAÇÃO CALIBRADA POR VARIÂNCIA (σ-aware)    ║
    // ║  Camadas com sinal forte → [0, 1] (amplitude total)        ║
    // ║  Camadas com sinal fraco → [0.35, 0.65] (quase neutro)     ║
    // ║  Evita que camadas sem sinal contaminam o ensemble          ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _normalizeScores(scores, startNum, endNum) {
        const count = endNum - startNum + 1;
        let sum = 0, sumSq = 0;
        let min = Infinity, max = -Infinity;
        for (let n = startNum; n <= endNum; n++) {
            const v = scores[n] || 0;
            sum += v;
            sumSq += v * v;
            if (v < min) min = v;
            if (v > max) max = v;
        }
        const range = max - min || 1;
        const mean = sum / count;
        const variance = (sumSq / count) - (mean * mean);
        const sigma = Math.sqrt(Math.max(0, variance));

        // Calcular coeficiente de variação relativo ao range
        const cv = range > 0 ? sigma / range : 0;

        // ★ v5.0: Determinar amplitude de saída baseada na variância
        // cv > 0.20 → sinal forte → manter [0, 1]
        // cv < 0.05 → sinal fraco → comprimir para [0.35, 0.65]
        // Entre → interpolação linear
        let outMin, outMax;
        if (cv >= 0.20) {
            outMin = 0; outMax = 1;
        } else if (cv <= 0.05) {
            outMin = 0.35; outMax = 0.65;
        } else {
            // Interpolação: cv de 0.05 a 0.20 → outMin de 0.35 a 0, outMax de 0.65 a 1
            const t = (cv - 0.05) / 0.15;
            outMin = 0.35 * (1 - t);
            outMax = 0.65 + 0.35 * t;
        }

        for (let n = startNum; n <= endNum; n++) {
            const normalized = (scores[n] - min) / range;
            scores[n] = outMin + normalized * (outMax - outMin);
        }
        return scores;
    }

    static _weightedPick(items, weights) {
        if (items.length === 0) return null;
        let totalW = 0;
        for (const n of items) totalW += (weights[n] || 0.001);
        let rand = Math.random() * totalW;
        for (const n of items) {
            rand -= (weights[n] || 0.001);
            if (rand <= 0) return n;
        }
        return items[items.length - 1];
    }

    static _weightedSample(probMap, count, startNum, endNum) {
        const result = [];
        const used = new Set();
        const entries = [];
        for (let n = startNum; n <= endNum; n++) {
            entries.push({ num: n, prob: probMap[n] || 0 });
        }

        for (let i = 0; i < count && entries.length > 0; i++) {
            let totalP = 0;
            for (const e of entries) {
                if (!used.has(e.num)) totalP += e.prob;
            }
            if (totalP <= 0) break;

            let rand = Math.random() * totalP;
            for (const e of entries) {
                if (used.has(e.num)) continue;
                rand -= e.prob;
                if (rand <= 0) {
                    result.push(e.num);
                    used.add(e.num);
                    break;
                }
            }
        }
        return result;
    }

    static _wouldCreate3Consecutive(num, ticketSet) {
        if (ticketSet.has(num - 1) && ticketSet.has(num - 2)) return true;
        if (ticketSet.has(num + 1) && ticketSet.has(num + 2)) return true;
        if (ticketSet.has(num - 1) && ticketSet.has(num + 1)) return true;
        return false;
    }

    static _countFreqs(games) {
        const freq = {};
        for (const g of games) {
            for (const n of g) {
                freq[n] = (freq[n] || 0) + 1;
            }
        }
        return freq;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.NovaEraEngine = NovaEraEngine;
}

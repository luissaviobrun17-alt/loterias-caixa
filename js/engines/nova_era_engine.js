/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  NOVA ERA ENGINE V1 (NE-V1) — Motor de Projeção Futura             ║
 * ║  Reconstrução total do sistema de geração de jogos inteligentes     ║
 * ║                                                                      ║
 * ║  FILOSOFIA: COBERTURA > CONCENTRAÇÃO                                ║
 * ║  Nenhum número é eliminado — todos recebem pesos suaves             ║
 * ║  Diversidade obrigatória entre jogos                                 ║
 * ║  Backtesting honesto com confiança real                              ║
 * ║                                                                      ║
 * ║  7 CAMADAS DE ANÁLISE PREDITIVA:                                    ║
 * ║   1. Frequência Multi-Janela (3/5/10/15 sorteios)                   ║
 * ║   2. Projeção Temporal — regressão de tendência futura               ║
 * ║   3. Período de Retorno — números "devendo" vs ciclo esperado       ║
 * ║   4. Entropia Espacial — equilíbrio de zonas                        ║
 * ║   5. Transição de Markov — co-ocorrência ponderada                  ║
 * ║   6. Ressonância de Fase — ciclos periódicos detectados              ║
 * ║   7. Clarividência Sintética — fusão preditiva final                 ║
 * ║                                                                      ║
 * ║  "Todos os números. Máxima diversidade. Projeção futura."           ║
 * ╚══════════════════════════════════════════════════════════════════════╝
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
                minZonesCovered: 4,
                maxConsecutive: 2,
                evenOddRange: [2, 4],
                sumRange: [100, 260],
                maxUsagePct: 0.12,
                maxOverlap: 3,
                weights: {
                    frequency: 0.18,
                    delay: 0.20,
                    trend: 0.12,
                    zone: 0.08,
                    markov: 0.07,
                    phase: 0.05,
                    entropy: 0.05,
                    noise: 0.25
                },
                scoreClamp: [0.5, 2.0]
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
                evenOddRange: [5, 9],
                sumRange: [155, 235],
                maxUsagePct: 0.75,
                maxOverlap: 13,
                weights: {
                    frequency: 0.15,
                    delay: 0.15,
                    trend: 0.15,
                    zone: 0.10,
                    markov: 0.05,
                    phase: 0.05,
                    entropy: 0.05,
                    noise: 0.30
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
                minZonesCovered: 4,
                maxConsecutive: 2,
                evenOddRange: [1, 4],
                sumRange: [90, 280],
                maxUsagePct: 0.10,
                maxOverlap: 2,
                weights: {
                    frequency: 0.15,
                    delay: 0.22,
                    trend: 0.12,
                    zone: 0.10,
                    markov: 0.06,
                    phase: 0.05,
                    entropy: 0.05,
                    noise: 0.25
                },
                scoreClamp: [0.5, 2.0]
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
                sumRange: [70, 220],
                maxUsagePct: 0.14,
                maxOverlap: 3,
                weights: {
                    frequency: 0.18,
                    delay: 0.20,
                    trend: 0.12,
                    zone: 0.08,
                    markov: 0.07,
                    phase: 0.05,
                    entropy: 0.05,
                    noise: 0.25
                },
                scoreClamp: [0.5, 2.0]
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
                sumRange: [2100, 2900],
                maxUsagePct: 0.60,
                maxOverlap: 42,
                weights: {
                    frequency: 0.12,
                    delay: 0.15,
                    trend: 0.12,
                    zone: 0.12,
                    markov: 0.06,
                    phase: 0.05,
                    entropy: 0.08,
                    noise: 0.30
                },
                scoreClamp: [0.6, 1.8]
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
                minZonesCovered: 5,
                maxConsecutive: 2,
                evenOddRange: [3, 7],
                sumRange: [200, 560],
                maxUsagePct: 0.10,
                maxOverlap: 3,
                weights: {
                    frequency: 0.15,
                    delay: 0.20,
                    trend: 0.12,
                    zone: 0.10,
                    markov: 0.06,
                    phase: 0.05,
                    entropy: 0.07,
                    noise: 0.25
                },
                scoreClamp: [0.5, 2.0]
            },

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // DIA DE SORTE — 7 de 31
            // Fechamento: 7, 6, 5 acertos
            // Range pequeno: cada número tem ~22.6% de chance
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            diadesorte: {
                name: 'Dia de Sorte',
                drawSize: 7,
                lotteryDraw: 7,
                range: [1, 31],
                zoneSize: 8,
                zones: 4,
                minZonesCovered: 3,
                maxConsecutive: 3,
                evenOddRange: [2, 5],
                sumRange: [60, 155],
                maxUsagePct: 0.28,
                maxOverlap: 4,
                weights: {
                    frequency: 0.15,
                    delay: 0.18,
                    trend: 0.12,
                    zone: 0.10,
                    markov: 0.08,
                    phase: 0.05,
                    entropy: 0.07,
                    noise: 0.25
                },
                scoreClamp: [0.5, 2.0]
            }
        };
        return profiles[gameKey] || profiles.megasena;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  MÉTODO PRINCIPAL — GERAR JOGOS COM PROJEÇÃO FUTURA         ║
    // ╚══════════════════════════════════════════════════════════════╝
    static generate(gameKey, numGames, selectedNumbers, fixedNumbers, customDrawSize) {
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
        if (hasUserSelection) {
            pool = selectedNumbers.slice().sort((a, b) => a - b);
            console.log('[NE-V1] 🎯 Pool do usuário: ' + pool.length + ' números');
        } else {
            // DIFERENÇA FUNDAMENTAL: usar TODOS os números, não apenas os "melhores"
            pool = [];
            for (let n = startNum; n <= endNum; n++) pool.push(n);
            console.log('[NE-V1] 🌐 Pool COMPLETO: ' + pool.length + ' números (ZERO eliminações)');
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FASE 3: GERAÇÃO COM DIVERSIDADE OBRIGATÓRIA
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const games = this._generateDiverseGames(
            profile, scores, pool, numGames, drawSize,
            fixedNumbers || [], startNum, endNum, hasUserSelection
        );

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FASE 4: BACKTESTING HONESTO
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const analysis = this._backtestHonest(games, history, profile, gameKey, totalRange, drawSize);

        const uniqueNums = new Set(games.flat());
        console.log('[NE-V1] ✅ ' + games.length + '/' + numGames + ' jogos | Cobertura: ' + uniqueNums.size + '/' + totalRange + ' (' + Math.round(uniqueNums.size / totalRange * 100) + '%)');

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

        const windows = [
            { size: Math.min(3, N),  weight: 0.35 },
            { size: Math.min(5, N),  weight: 0.25 },
            { size: Math.min(10, N), weight: 0.20 },
            { size: Math.min(15, N), weight: 0.20 }
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
    static _layerClairvoyance(history, startNum, endNum, N, drawSize) {
        const scores = {};
        for (let n = startNum; n <= endNum; n++) scores[n] = 0;
        if (N < 5) {
            for (let n = startNum; n <= endNum; n++) scores[n] = 0.5;
            return scores;
        }

        const totalRange = endNum - startNum + 1;
        const simulations = Math.min(10000, Math.max(3000, totalRange * 50));

        // Criar distribuição base a partir do histórico recente
        const baseProb = {};
        for (let n = startNum; n <= endNum; n++) baseProb[n] = 1.0;

        // Ponderar pelo histórico recente (com decaimento)
        const limit = Math.min(20, N);
        for (let i = 0; i < limit; i++) {
            const decay = Math.exp(-i * 0.08);
            const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
            for (const n of nums) {
                if (n >= startNum && n <= endNum) {
                    baseProb[n] += decay;
                }
            }
        }

        // Normalizar
        let totalProb = 0;
        for (let n = startNum; n <= endNum; n++) totalProb += baseProb[n];
        for (let n = startNum; n <= endNum; n++) baseProb[n] /= totalProb;

        // Monte Carlo: simular sorteios futuros
        for (let sim = 0; sim < simulations; sim++) {
            // Sortear drawSize números usando probabilidades ponderadas
            const drawn = this._weightedSample(baseProb, drawSize, startNum, endNum);
            for (const n of drawn) {
                scores[n]++;
            }
        }

        // Normalizar convergências
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
            // DIA DE SORTE: 7 de 31 — range pequeno
            // Repetição moderada (~1.5/7)
            // Foco: equilíbrio entre repetição e renovação
            // ──────────────────────────────────────────────────────
            case 'diadesorte': {
                for (let n = startNum; n <= endNum; n++) {
                    if (lastDraw.has(n)) {
                        // Range pequeno = repetição moderada
                        scores[n] = 0.45;
                    } else {
                        let lastSeen = N;
                        for (let i = 0; i < N; i++) {
                            if ((history[i].numbers || []).includes(n)) { lastSeen = i; break; }
                        }
                        const expectedCycle = 31 / 7; // ~4.4
                        const ratio = lastSeen / expectedCycle;
                        if (ratio >= 1.0 && ratio <= 2.5) scores[n] = 0.90;
                        else if (ratio >= 0.5) scores[n] = 0.60;
                        else scores[n] = 0.30;
                    }
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

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  ★ MODO DEUS — CAMADA 9: CONVERGÊNCIA BAYESIANA               ║
    // ║  P(número | últimos K sorteios) com atualização posterior       ║
    // ║  Proir uniforme → atualiza com cada sorteio observado          ║
    // ╚══════════════════════════════════════════════════════════════════╝
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

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  ★★★ SÍNTESE MODO DEUS — 12 CAMADAS DE PREDIÇÃO ★★★              ║
    // ║  Combina 8 camadas clássicas + 4 camadas avançadas Modo Deus      ║
    // ║  CALIBRAÇÃO INDIVIDUAL por loteria com foco MÁXIMO no próximo     ║
    // ╚══════════════════════════════════════════════════════════════════════╝
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

        console.log('[NE-V1] ★ MODO DEUS ATIVADO — 12 camadas de predição para ' + gameKey);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ★★★ CONSENSO ENSEMBLE — Votação entre 12 camadas ★★★
        // Números que MÚLTIPLAS camadas concordam como TOP
        // recebem boost EXPONENCIAL — este é o diferencial
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const allLayers = [
            freqScores, trendScores, delayScores, entropyScores,
            markovScores, phaseScores, clairScores, nextDrawScores,
            bayesianScores, positionalScores, sequentialScores, momentumScores
        ];

        // Para cada camada: identificar top drawSize*2 candidatos
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

        // Encontrar o consenso máximo
        let maxVotes = 0;
        for (let n = startNum; n <= endNum; n++) {
            if (voteCount[n] > maxVotes) maxVotes = voteCount[n];
        }

        // Log consenso
        const consensusNums = [];
        for (let n = startNum; n <= endNum; n++) {
            if (voteCount[n] >= 9) consensusNums.push(n + '(' + voteCount[n] + ')');
        }
        if (consensusNums.length > 0) {
            console.log('[NE-V1] ★ CONSENSO 9+/12: ' + consensusNums.join(', '));
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ★★★ CALIBRAÇÃO DINÂMICA — Qual camada acertou? ★★★
        // Testa cada camada contra os últimos 3 sorteios REAIS
        // e ajusta pesos em tempo real
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        let dynamicBoosts = new Array(12).fill(1.0);
        if (N >= 4) {
            // Simular: usando histórico [1..N], prever o sorteio [0]
            // e comparar com o resultado REAL de [0]
            const testDraws = Math.min(3, N - 3);
            for (let t = 0; t < testDraws; t++) {
                const testHistory = history.slice(t + 1);
                const actualResult = new Set(history[t].numbers || []);
                const testN = testHistory.length;

                // Recalcular cada camada com histórico deslocado
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

                // Para cada camada: quantos dos seus top drawSize acertaram?
                for (let L = 0; L < 12; L++) {
                    const layerTop = Object.entries(testLayers[L])
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, drawSize * 2)
                        .map(e => parseInt(e[0]));
                    let hits = 0;
                    for (const n of layerTop) {
                        if (actualResult.has(n)) hits++;
                    }
                    // Boost proporcional aos acertos
                    const hitRate = hits / drawSize;
                    dynamicBoosts[L] += hitRate * 0.5;
                }
            }

            // Normalizar boosts
            const avgBoost = dynamicBoosts.reduce((a, b) => a + b, 0) / 12;
            for (let L = 0; L < 12; L++) {
                dynamicBoosts[L] /= avgBoost;
            }

            const boostStr = dynamicBoosts.map((b, i) => ['freq','trend','delay','zone','markov','phase','clair','next','bayes','posit','seq','mom'][i] + '=' + b.toFixed(2)).join(' ');
            console.log('[NE-V1] ★ CALIBRAÇÃO DINÂMICA: ' + boostStr);
        }

        // ━━━ PESOS CALIBRADOS — MODO DEUS + DINÂMICO ━━━
        const weights = this._getGodModeWeights(gameKey);

        // Fusão com calibração dinâmica + consenso ensemble
        const scores = {};
        const [clampMin, clampMax] = profile.scoreClamp;

        for (let n = startNum; n <= endNum; n++) {
            let raw = (freqScores[n] || 0) * weights.frequency * dynamicBoosts[0]
                    + (delayScores[n] || 0) * weights.delay * dynamicBoosts[2]
                    + (trendScores[n] || 0) * weights.trend * dynamicBoosts[1]
                    + (entropyScores[n] || 0) * weights.zone * dynamicBoosts[3]
                    + (markovScores[n] || 0) * weights.markov * dynamicBoosts[4]
                    + (phaseScores[n] || 0) * weights.phase * dynamicBoosts[5]
                    + (clairScores[n] || 0) * weights.clairvoyance * dynamicBoosts[6]
                    + (nextDrawScores[n] || 0) * weights.nextDraw * dynamicBoosts[7]
                    + (bayesianScores[n] || 0) * weights.bayesian * dynamicBoosts[8]
                    + (positionalScores[n] || 0) * weights.positional * dynamicBoosts[9]
                    + (sequentialScores[n] || 0) * weights.sequential * dynamicBoosts[10]
                    + (momentumScores[n] || 0) * weights.momentum * dynamicBoosts[11];

            // ★ CONSENSO ENSEMBLE: boost exponencial para números com alta concordância
            const votes = voteCount[n] || 0;
            if (votes >= 10) raw *= 1.35;       // 10-12 camadas concordam: FORTE
            else if (votes >= 8) raw *= 1.20;   // 8-9 camadas: boost médio
            else if (votes >= 6) raw *= 1.05;   // 6-7: boost leve
            else if (votes <= 2) raw *= 0.80;   // 0-2: penalizar (pouca concordância)

            // Noise MÍNIMO — máxima objetividade
            raw += (Math.random() - 0.5) * 0.03;

            scores[n] = Math.max(clampMin, Math.min(clampMax, raw + 1.0));
        }

        // Log top/bottom para diagnóstico
        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const top5 = sorted.slice(0, 5).map(e => e[0] + '(' + e[1].toFixed(2) + '/v' + voteCount[parseInt(e[0])] + ')').join(', ');
        const bot5 = sorted.slice(-5).map(e => e[0] + '(' + e[1].toFixed(2) + ')').join(', ');
        console.log('[NE-V1] ★ DEUS+ Top: ' + top5 + ' | 🔻 Bottom: ' + bot5);

        return scores;
    }

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  ★★★ PESOS MODO DEUS — CALIBRAÇÃO INDIVIDUAL POR LOTERIA ★★★     ║
    // ║  12 dimensões de peso otimizadas para PREVER o próximo sorteio    ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    static _getGodModeWeights(gameKey) {
        const calibrations = {

            // ★ MEGA SENA: 6/60 — nextDraw + sequential dominam
            megasena: {
                frequency: 0.04, delay: 0.08, trend: 0.05,
                zone: 0.04, markov: 0.03, phase: 0.02,
                clairvoyance: 0.04, nextDraw: 0.22,
                bayesian: 0.12, positional: 0.10,
                sequential: 0.14, momentum: 0.06,
                noise: 0.06
            },

            // ★ LOTOFÁCIL: 15/25 — nextDraw absoluto (repetição 8-12/15)
            lotofacil: {
                frequency: 0.02, delay: 0.04, trend: 0.03,
                zone: 0.03, markov: 0.02, phase: 0.01,
                clairvoyance: 0.02, nextDraw: 0.38,
                bayesian: 0.10, positional: 0.06,
                sequential: 0.15, momentum: 0.04,
                noise: 0.10
            },

            // ★ QUINA: 5/80 — bayesian + delay dominam (range amplo)
            quina: {
                frequency: 0.04, delay: 0.12, trend: 0.05,
                zone: 0.08, markov: 0.03, phase: 0.03,
                clairvoyance: 0.05, nextDraw: 0.15,
                bayesian: 0.14, positional: 0.08,
                sequential: 0.12, momentum: 0.05,
                noise: 0.06
            },

            // ★ DUPLA SENA: 6/50 — sequential forte (2 sorteios de dados)
            duplasena: {
                frequency: 0.05, delay: 0.07, trend: 0.05,
                zone: 0.05, markov: 0.04, phase: 0.03,
                clairvoyance: 0.04, nextDraw: 0.18,
                bayesian: 0.12, positional: 0.10,
                sequential: 0.16, momentum: 0.05,
                noise: 0.06
            },

            // ★ LOTOMANIA: 50/100 — zona + bayesian (cobertura ampla)
            lotomania: {
                frequency: 0.03, delay: 0.06, trend: 0.04,
                zone: 0.12, markov: 0.02, phase: 0.02,
                clairvoyance: 0.05, nextDraw: 0.14,
                bayesian: 0.15, positional: 0.05,
                sequential: 0.10, momentum: 0.06,
                noise: 0.16
            },

            // ★ TIMEMANIA: 10/80 — delay + bayesian (range amplo, sorteia 7)
            timemania: {
                frequency: 0.04, delay: 0.14, trend: 0.05,
                zone: 0.08, markov: 0.03, phase: 0.03,
                clairvoyance: 0.04, nextDraw: 0.14,
                bayesian: 0.14, positional: 0.08,
                sequential: 0.12, momentum: 0.05,
                noise: 0.06
            },

            // ★ DIA DE SORTE: 7/31 — positional + sequential (range pequeno)
            diadesorte: {
                frequency: 0.05, delay: 0.07, trend: 0.06,
                zone: 0.05, markov: 0.06, phase: 0.04,
                clairvoyance: 0.04, nextDraw: 0.15,
                bayesian: 0.12, positional: 0.12,
                sequential: 0.13, momentum: 0.05,
                noise: 0.06
            }
        };

        const w = calibrations[gameKey] || calibrations.megasena;
        const godPct = ((w.bayesian + w.positional + w.sequential + w.momentum) * 100).toFixed(0);
        console.log('[NE-V1] ★ MODO DEUS ' + gameKey + ': God=' + godPct + '% | nextDraw=' + (w.nextDraw * 100).toFixed(0) + '% | noise=' + (w.noise * 100).toFixed(0) + '%');
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
    static _generateDiverseGames(profile, scores, pool, numGames, drawSize, fixedNumbers, startNum, endNum, hasUserSelection) {
        const games = [];
        const usedKeys = new Set();
        const usedCount = {};
        for (const n of pool) usedCount[n] = 0;

        const numZones = profile.zones;
        const zoneSize = profile.zoneSize;
        const maxUsage = Math.max(3, Math.ceil(numGames * profile.maxUsagePct));
        const maxOverlap = profile.maxOverlap;

        const maxAttempts = Math.min(numGames * 500, 5000000);
        const TIMEOUT_MS = 180000; // 3 minutos
        const startTime = Date.now();
        let attempts = 0;

        while (games.length < numGames && attempts < maxAttempts && (Date.now() - startTime) < TIMEOUT_MS) {
            attempts++;

            const ticket = this._generateSingleGame(
                profile, scores, pool, drawSize, fixedNumbers,
                usedCount, maxUsage, startNum, endNum, numZones, zoneSize,
                games.length, numGames
            );

            if (!ticket || ticket.length < drawSize) continue;

            const key = ticket.join(',');
            if (usedKeys.has(key)) continue;

            // Anti-overlap: verificar contra jogos recentes
            if (games.length > 0 && attempts < maxAttempts * 0.85) {
                let tooSimilar = false;
                const checkFrom = Math.max(0, games.length - 50);
                for (let g = checkFrom; g < games.length; g++) {
                    const existSet = new Set(games[g]);
                    let overlap = 0;
                    for (const n of ticket) {
                        if (existSet.has(n)) overlap++;
                    }
                    if (overlap > maxOverlap) {
                        tooSimilar = true;
                        break;
                    }
                }
                if (tooSimilar) continue;
            }

            // Aceitar jogo
            games.push(ticket);
            usedKeys.add(key);
            for (const n of ticket) {
                usedCount[n] = (usedCount[n] || 0) + 1;
            }
        }

        // Fallback: completar com jogos aleatórios se necessário
        let fillAtt = 0;
        while (games.length < numGames && fillAtt < 5000) {
            fillAtt++;
            const ticket = [...fixedNumbers.filter(f => pool.includes(f))];
            const remaining = pool.filter(n => !ticket.includes(n)).sort(() => Math.random() - 0.5);
            for (const n of remaining) {
                if (ticket.length >= drawSize) break;
                ticket.push(n);
            }
            if (ticket.length < drawSize) continue;
            ticket.sort((a, b) => a - b);
            const key = ticket.join(',');
            if (!usedKeys.has(key)) {
                games.push(ticket);
                usedKeys.add(key);
                for (const n of ticket) usedCount[n] = (usedCount[n] || 0) + 1;
            }
        }

        console.log('[NE-V1] 🎲 ' + games.length + ' jogos em ' + attempts + ' tentativas');

        // Diagnóstico de concentração
        const maxUsed = Math.max(0, ...Object.values(usedCount));
        const maxPct = games.length > 0 ? (maxUsed / games.length * 100).toFixed(1) : 0;
        const numsUsed = Object.values(usedCount).filter(v => v > 0).length;
        console.log('[NE-V1] 📊 Max concentração: ' + maxPct + '% | Números usados: ' + numsUsed + '/' + pool.length);

        return games;
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  GERAR UM ÚNICO JOGO                                         ║
    // ║  Seleção ponderada com garantias estruturais                  ║
    // ╚══════════════════════════════════════════════════════════════╝
    static _generateSingleGame(profile, scores, pool, drawSize, fixedNumbers, usedCount, maxUsage, startNum, endNum, numZones, zoneSize, gameIndex, totalGames) {
        const ticket = [];
        const ticketSet = new Set();
        const zoneCount = new Array(numZones).fill(0);

        // 1. Inserir fixos
        for (const f of fixedNumbers) {
            if (pool.includes(f) && !ticketSet.has(f) && ticket.length < drawSize) {
                ticket.push(f);
                ticketSet.add(f);
                const z = Math.min(numZones - 1, Math.floor((f - startNum) / zoneSize));
                zoneCount[z]++;
            }
        }

        // 2. Construir pesos dinâmicos
        const available = pool.filter(n => {
            if (ticketSet.has(n)) return false;
            if ((usedCount[n] || 0) >= maxUsage) return false;
            return true;
        });

        if (available.length < drawSize - ticket.length) return null;

        const weights = {};
        for (const n of available) {
            let w = scores[n] || 1.0;

            // Penalizar números muito usados (decaimento exponencial)
            const usage = (usedCount[n] || 0) / Math.max(1, maxUsage);
            w *= Math.pow(1 - usage, 2);

            // Boost para números nunca usados
            if (usedCount[n] === 0 || usedCount[n] === undefined) {
                w *= 1.5;
            }

            // Verificar se criaria sequência de 3+ consecutivos
            if (this._wouldCreate3Consecutive(n, ticketSet)) {
                w *= 0.1;
            }

            weights[n] = Math.max(0.001, w);
        }

        // 3. Seleção por zona (garantir cobertura mínima)
        const minZones = Math.min(profile.minZonesCovered, numZones);
        const zonesNeeded = [];
        for (let z = 0; z < numZones; z++) {
            if (zoneCount[z] === 0) zonesNeeded.push(z);
        }
        // Embaralhar zonas para variedade
        for (let i = zonesNeeded.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [zonesNeeded[i], zonesNeeded[j]] = [zonesNeeded[j], zonesNeeded[i]];
        }

        // Garantir pelo menos minZones zonas cobertas
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

        // 4. Completar com seleção ponderada global
        while (ticket.length < drawSize) {
            const remaining = available.filter(n => !ticketSet.has(n));
            if (remaining.length === 0) break;

            const chosen = this._weightedPick(remaining, weights);
            if (chosen === null) break;

            ticket.push(chosen);
            ticketSet.add(chosen);
            const z = Math.min(numZones - 1, Math.floor((chosen - startNum) / zoneSize));
            zoneCount[z]++;
        }

        if (ticket.length < drawSize) return null;

        // 5. Validações estruturais
        ticket.sort((a, b) => a - b);

        // Par/ímpar
        const evens = ticket.filter(n => n % 2 === 0).length;
        if (evens < profile.evenOddRange[0] || evens > profile.evenOddRange[1]) return null;

        // Soma
        const sum = ticket.reduce((a, b) => a + b, 0);
        if (sum < profile.sumRange[0] || sum > profile.sumRange[1]) return null;

        return ticket;
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

        console.log('[NE-V1] 🧪 Backtesting (' + btCount + ' sorteios):');
        console.log('[NE-V1]    Média melhor acerto: ' + avgHits.toFixed(2) + ' (esperado acaso: ' + expectedRandom.toFixed(2) + ')');
        console.log('[NE-V1]    Melhor: ' + maxHits + ' | 3+: ' + winRate3 + '% | 4+: ' + winRate4 + '%');
        console.log('[NE-V1]    Melhoria vs acaso: ' + improvement.toFixed(2) + 'x | Confiança: ' + confidence + '%');

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
            engine: 'Nova Era V1 — ' + (profile.name || gameKey),
            mode: 'PROJEÇÃO FUTURA — Cobertura Total + Diversidade Máxima'
        };
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║  NÚMEROS SUGERIDOS — Versão Sintética e Objetiva             ║
    // ║  Retorna apenas os N números com maior projeção futura      ║
    // ╚══════════════════════════════════════════════════════════════╝
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

        // Calcular scores SEM ruído (deterministico)
        const scores = this._scoreAllNumbersDeterministic(gameKey, profile, history, startNum, endNum, totalRange);

        // Ordenar e retornar os top N
        const ranked = Object.entries(scores)
            .map(([n, s]) => ({ num: parseInt(n), score: s }))
            .sort((a, b) => b.score - a.score);

        // Garantir cobertura de zonas nos sugeridos
        const numZones = profile.zones;
        const zoneSize = profile.zoneSize;
        const result = [];
        const zoneCovered = new Array(numZones).fill(false);

        // Primeiro: pelo menos 1 de cada zona (dos melhores da zona)
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

        // Completar com os melhores globais
        for (const r of ranked) {
            if (result.length >= count) break;
            if (!result.includes(r.num)) {
                result.push(r.num);
            }
        }

        return result.sort((a, b) => a - b).slice(0, count);
    }

    // Score determinístico MODO DEUS (sem noise) para sugestões
    static _scoreAllNumbersDeterministic(gameKey, profile, history, startNum, endNum, totalRange) {
        return this._scoreForSuggestion(gameKey, profile, history, startNum, endNum, totalRange);
    }

    // ★★★ Score para sugestões: MODO DEUS sem noise ★★★
    static _scoreForSuggestion(gameKey, profile, history, startNum, endNum, totalRange) {
        const N = history.length;
        const drawSize = profile.lotteryDraw;

        // Todas as 12 camadas
        const freqScores = this._layerFrequency(history, startNum, endNum, N);
        const trendScores = this._layerTrend(history, startNum, endNum, N);
        const delayScores = this._layerDelay(history, startNum, endNum, N, drawSize, totalRange);
        const entropyScores = this._layerEntropy(history, startNum, endNum, N, profile);
        const markovScores = this._layerMarkov(history, startNum, endNum, N);
        const phaseScores = this._layerPhase(history, startNum, endNum, N);
        const clairScores = this._layerClairvoyance(history, startNum, endNum, N, drawSize);
        const nextDrawScores = this._layerNextDraw(gameKey, history, startNum, endNum, N, profile);
        const bayesianScores = this._godBayesian(history, startNum, endNum, N, drawSize);
        const positionalScores = this._godPositional(history, startNum, endNum, N, drawSize);
        const sequentialScores = this._godSequentialChain(history, startNum, endNum, N);
        const momentumScores = this._godMomentum(history, startNum, endNum, N, drawSize);

        // Pesos Modo Deus — SEM noise, redistribuído para predição
        const w = this._getGodModeWeights(gameKey);
        const scores = {};
        const boostFactor = w.noise * 0.5; // Redistribuir noise para predição

        for (let n = startNum; n <= endNum; n++) {
            scores[n] = (freqScores[n] || 0) * w.frequency
                      + (delayScores[n] || 0) * w.delay
                      + (trendScores[n] || 0) * w.trend
                      + (entropyScores[n] || 0) * w.zone
                      + (markovScores[n] || 0) * w.markov
                      + (phaseScores[n] || 0) * w.phase
                      + (clairScores[n] || 0) * w.clairvoyance
                      + (nextDrawScores[n] || 0) * (w.nextDraw + boostFactor * 0.3)
                      + (bayesianScores[n] || 0) * (w.bayesian + boostFactor * 0.2)
                      + (positionalScores[n] || 0) * w.positional
                      + (sequentialScores[n] || 0) * (w.sequential + boostFactor * 0.3)
                      + (momentumScores[n] || 0) * (w.momentum + boostFactor * 0.2);
        }

        return scores;
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    static _normalizeScores(scores, startNum, endNum) {
        let min = Infinity, max = -Infinity;
        for (let n = startNum; n <= endNum; n++) {
            if (scores[n] < min) min = scores[n];
            if (scores[n] > max) max = scores[n];
        }
        const range = max - min || 1;
        for (let n = startNum; n <= endNum; n++) {
            scores[n] = (scores[n] - min) / range; // [0, 1]
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
        // Checa se adicionar 'num' cria sequência de 3+ consecutivos
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
    // ╔══════════════════════════════════════════════════════════════╗
    // ║  NÚMEROS SUGERIDOS — Versão Sintética e Objetiva             ║
    // ║  Foco: PRÓXIMO SORTEIO com calibração individual             ║
    // ║  Retorna apenas os N números com maior projeção futura      ║
    // ╚══════════════════════════════════════════════════════════════╝
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

        // Calcular scores deterministicos com calibração individual
        const scores = this._scoreForSuggestion(gameKey, profile, history, startNum, endNum, totalRange);

        // Ordenar e retornar os top N
        const ranked = Object.entries(scores)
            .map(([n, s]) => ({ num: parseInt(n), score: s }))
            .sort((a, b) => b.score - a.score);

        // Garantir cobertura de zonas nos sugeridos
        const numZones = profile.zones;
        const zoneSize = profile.zoneSize;
        const result = [];
        const zoneCovered = new Array(numZones).fill(false);

        // Primeiro: pelo menos 1 de cada zona (dos melhores da zona)
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

        // Completar com os melhores globais
        for (const r of ranked) {
            if (result.length >= count) break;
            if (!result.includes(r.num)) {
                result.push(r.num);
            }
        }

        return result.sort((a, b) => a - b).slice(0, count);
    }

    // Score para sugestões: SEM noise e com foco no próximo sorteio
    static _scoreForSuggestion(gameKey, profile, history, startNum, endNum, totalRange) {
        const N = history.length;
        const drawSize = profile.lotteryDraw;

        const freqScores = this._layerFrequency(history, startNum, endNum, N);
        const trendScores = this._layerTrend(history, startNum, endNum, N);
        const delayScores = this._layerDelay(history, startNum, endNum, N, drawSize, totalRange);
        const entropyScores = this._layerEntropy(history, startNum, endNum, N, profile);
        const markovScores = this._layerMarkov(history, startNum, endNum, N);
        const phaseScores = this._layerPhase(history, startNum, endNum, N);
        const clairScores = this._layerClairvoyance(history, startNum, endNum, N, drawSize);
        const nextDrawScores = this._layerNextDraw(gameKey, history, startNum, endNum, N, profile);

        // Pesos calibrados da loteria — SEM noise (determinístico)
        const w = this._getCalibratedWeights(gameKey);
        const scores = {};

        for (let n = startNum; n <= endNum; n++) {
            // Para sugestões: PESO EXTRA no nextDraw (objetivo: próximo sorteio!)
            scores[n] = (freqScores[n] || 0) * w.frequency
                      + (delayScores[n] || 0) * w.delay
                      + (trendScores[n] || 0) * w.trend
                      + (entropyScores[n] || 0) * w.zone
                      + (markovScores[n] || 0) * w.markov
                      + (phaseScores[n] || 0) * w.phase
                      + (clairScores[n] || 0) * w.clairvoyance
                      + (nextDrawScores[n] || 0) * (w.nextDraw + w.noise * 0.5);
        }

        return scores;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.NovaEraEngine = NovaEraEngine;
}

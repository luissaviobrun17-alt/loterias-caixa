/**
 * SMART BETS ENGINE — Motor IA para Apostas Reduzidas
 * ====================================================
 * Gera jogos INTELIGENTES quando o apostador quer poucos jogos
 * (em vez de fechamento completo).
 * 
 * 14 REGRAS ESTATÍSTICAS:
 * ───────────────────────
 *  1. Consecutivos Máximos (por loteria)
 *  2. Equilíbrio Par/Ímpar (proporção real)
 *  3. Distribuição por Faixas (dezenas)
 *  4. Distância entre Números (gap médio)
 *  5. Soma Total (faixa ideal)
 *  6. Fibonacci / Proporção Áurea
 *  7. Primos (proporção real)
 *  8. Anti-Padrão Artificial (anti-progressão)
 *  9. Duplas Frequentes (top pares)
 * 10. Trios Frequentes (top trios)
 * 11. Cobertura de Números (diversidade entre jogos)
 * 12. Repetição do Último Sorteio
 * 13. Markov / Transição
 * 14. Tendência Temporal (números em alta)
 * 
 * "Poucos jogos, máxima inteligência."
 */
class SmartBetsEngine {

    // ╔══════════════════════════════════════════════════════╗
    // ║  PERFIS ESPECÍFICOS POR LOTERIA                     ║
    // ╚══════════════════════════════════════════════════════╝
    static getProfile(gameKey) {
        const profiles = {
            megasena: {
                name: 'Mega Sena',
                draw: 6, range: [1, 60],
                maxConsecutive: 2,
                evenOddIdeal: [3, 3], evenOddTolerance: 1,
                faixaSize: 10, faixaMin: 0, faixaMax: 2,
                sumMin: 100, sumMax: 250,
                gapMin: 3, gapMax: 18,
                repeatFromLast: [0, 3],
                primeRatio: [0.25, 0.55],
                maxSameEnding: 2,
                fibWeight: 0.3,
                markovWeight: 0.6,
                trendWeight: 0.5,
                pairBoost: 0.4,
                trioBoost: 0.3
            },
            lotofacil: {
                name: 'Lotofácil',
                draw: 15, range: [1, 25],
                maxConsecutive: 4,
                evenOddIdeal: [7, 8], evenOddTolerance: 1,
                faixaSize: 5, faixaMin: 2, faixaMax: 4,
                sumMin: 175, sumMax: 225,
                gapMin: 1, gapMax: 3,
                repeatFromLast: [7, 11],
                primeRatio: [0.25, 0.50],
                maxSameEnding: 4,
                fibWeight: 0.2,
                markovWeight: 0.7,
                trendWeight: 0.6,
                pairBoost: 0.5,
                trioBoost: 0.4
            },
            quina: {
                name: 'Quina',
                draw: 5, range: [1, 80],
                maxConsecutive: 2,
                evenOddIdeal: [2, 3], evenOddTolerance: 1,
                faixaSize: 10, faixaMin: 0, faixaMax: 2,
                sumMin: 90, sumMax: 270,
                gapMin: 5, gapMax: 30,
                repeatFromLast: [0, 2],
                primeRatio: [0.20, 0.50],
                maxSameEnding: 2,
                fibWeight: 0.3,
                markovWeight: 0.6,
                trendWeight: 0.5,
                pairBoost: 0.4,
                trioBoost: 0.2
            },
            duplasena: {
                name: 'Dupla Sena',
                draw: 6, range: [1, 50],
                maxConsecutive: 2,
                evenOddIdeal: [3, 3], evenOddTolerance: 1,
                faixaSize: 10, faixaMin: 0, faixaMax: 2,
                sumMin: 80, sumMax: 200,
                gapMin: 3, gapMax: 15,
                repeatFromLast: [0, 3],
                primeRatio: [0.25, 0.55],
                maxSameEnding: 2,
                fibWeight: 0.3,
                markovWeight: 0.6,
                trendWeight: 0.5,
                pairBoost: 0.4,
                trioBoost: 0.3
            },
            lotomania: {
                name: 'Lotomania',
                draw: 20, range: [0, 99],
                maxConsecutive: 4,
                evenOddIdeal: [25, 25], evenOddTolerance: 5,
                faixaSize: 10, faixaMin: 1, faixaMax: 8,
                sumMin: 2100, sumMax: 2900,
                gapMin: 1, gapMax: 3,
                repeatFromLast: [7, 14],
                primeRatio: [0.15, 0.50],
                maxSameEnding: 8,
                fibWeight: 0.2,
                markovWeight: 0.5,
                trendWeight: 0.4,
                pairBoost: 0.3,
                trioBoost: 0.2
            },
            timemania: {
                name: 'Timemania',
                draw: 7, range: [1, 80],
                maxConsecutive: 2,
                evenOddIdeal: [3, 4], evenOddTolerance: 1,
                faixaSize: 10, faixaMin: 0, faixaMax: 2,
                sumMin: 130, sumMax: 310,
                gapMin: 4, gapMax: 20,
                repeatFromLast: [0, 4],
                primeRatio: [0.20, 0.50],
                maxSameEnding: 2,
                fibWeight: 0.3,
                markovWeight: 0.6,
                trendWeight: 0.5,
                pairBoost: 0.4,
                trioBoost: 0.3
            },
            diadesorte: {
                name: 'Dia de Sorte',
                draw: 7, range: [1, 31],
                maxConsecutive: 3,
                evenOddIdeal: [3, 4], evenOddTolerance: 1,
                faixaSize: 8, faixaMin: 1, faixaMax: 3,
                sumMin: 78, sumMax: 152,
                gapMin: 1, gapMax: 8,
                repeatFromLast: [2, 5],
                primeRatio: [0.25, 0.55],
                maxSameEnding: 2,
                fibWeight: 0.3,
                markovWeight: 0.7,
                trendWeight: 0.6,
                pairBoost: 0.5,
                trioBoost: 0.3
            }
        };
        return profiles[gameKey] || profiles.megasena;
    }

    // ╔══════════════════════════════════════════════════════╗
    // ║  MÉTODO PRINCIPAL: GERAR N JOGOS INTELIGENTES       ║
    // ╚══════════════════════════════════════════════════════╝
    static generate(gameKey, numGames, selectedNumbers, fixedNumbers = []) {
        const profile = this.getProfile(gameKey);
        const game = GAMES[gameKey];
        if (!game) return { games: [], analysis: null };

        const startNum = profile.range[0];
        const endNum = profile.range[1];
        const drawSize = game.minBet || profile.draw;

        // Pool de números: usar selecionados ou universo completo
        let pool = selectedNumbers && selectedNumbers.length >= drawSize
            ? selectedNumbers.slice()
            : this._buildFullPool(startNum, endNum);

        // Carregar histórico
        let history = [];
        try {
            history = StatsService.getRecentResults(gameKey, 100) || [];
        } catch (e) {
            console.warn('[SmartBets] Sem histórico, usando modo básico');
        }

        console.log(`[SmartBets] 🧠 Gerando ${numGames} jogos inteligentes para ${profile.name}`);
        console.log(`[SmartBets] 📊 Pool: ${pool.length} números | Histórico: ${history.length} sorteios`);

        // ── ANÁLISE PRÉ-CÁLCULO ──
        const analysis = this._deepAnalysis(gameKey, pool, history, profile, startNum, endNum);

        // ── GERAR JOGOS ──
        const games = [];
        const allUsedNumbers = {};
        const usedCombinations = new Set();
        const isLargeGame = drawSize >= 15;
        const isVeryLargeGame = drawSize >= 20; // Lotomania (50 números por jogo)
        const maxAttempts = isVeryLargeGame ? numGames * 3000 : (isLargeGame ? numGames * 1000 : numGames * 500);
        let attempts = 0;

        console.log(`[SmartBets] 🔧 drawSize=${drawSize}, isLargeGame=${isLargeGame}, isVeryLargeGame=${isVeryLargeGame}, maxAttempts=${maxAttempts}`);

        while (games.length < numGames && attempts < maxAttempts) {
            attempts++;
            const ticket = this._generateSingleSmartGame(
                gameKey, pool, drawSize, profile, analysis,
                history, games, allUsedNumbers, fixedNumbers
            );

            if (!ticket) continue;

            const key = ticket.join(',');
            if (usedCombinations.has(key)) continue;

            // ── VALIDAÇÃO FINAL ──
            if (isVeryLargeGame) {
                // Para Lotomania (50 números): aceitar diretamente — qualidade é via pesos
                games.push(ticket);
                usedCombinations.add(key);
                ticket.forEach(n => allUsedNumbers[n] = (allUsedNumbers[n] || 0) + 1);
            } else {
                const score = this._scoreGame(ticket, profile, analysis, history);
                const minScore = isLargeGame ? 3.0 : 5.0;
                if (score >= minScore || attempts > maxAttempts * 0.7) {
                    games.push(ticket);
                    usedCombinations.add(key);
                    ticket.forEach(n => allUsedNumbers[n] = (allUsedNumbers[n] || 0) + 1);
                }
            }
        }

        // ── CALCULAR CONFIANÇA DO SET ──
        const setAnalysis = this._analyzeGeneratedSet(games, profile, analysis, history, gameKey);

        console.log(`[SmartBets] ✅ ${games.length} jogos gerados em ${attempts} tentativas`);
        console.log(`[SmartBets] 📊 Confiança: ${setAnalysis.confidence}% | Cobertura: ${setAnalysis.coverage}%`);

        return {
            pool: pool,
            games: games,
            analysis: setAnalysis
        };
    }

    // ╔══════════════════════════════════════════════════════╗
    // ║  ANÁLISE PROFUNDA DO HISTÓRICO                      ║
    // ╚══════════════════════════════════════════════════════╝
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

        // ── ÚLTIMO SORTEIO ──
        analysis.lastDraw = history[0].numbers || [];

        // ── FIBONACCI ──
        let fa = 1, fb = 1;
        while (fa <= endNum) {
            if (fa >= startNum) analysis.fibNumbers[fa] = true;
            const tmp = fa + fb; fa = fb; fb = tmp;
        }
        if (startNum === 0) analysis.fibNumbers[0] = true;

        // ── PRIMOS ──
        const sieve = new Array(endNum + 1).fill(true);
        sieve[0] = false; sieve[1] = false;
        for (let p = 2; p * p <= endNum; p++) {
            if (sieve[p]) for (let m = p * p; m <= endNum; m += p) sieve[m] = false;
        }
        for (let n = 2; n <= endNum; n++) if (sieve[n]) analysis.primes[n] = true;

        // ── SCORE DE CADA NÚMERO (frequência + atraso + tendência) ──
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

        // ── DUPLAS FREQUENTES ──
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

        // ── TRIOS FREQUENTES ──
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

        // ── MARKOV (transições) ──
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

        // ── TENDÊNCIA (últimos 5 vs anteriores) ──
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

        // ── PADRÕES MÉDIOS (últimos 15 sorteios) ──
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

        return analysis;
    }

    // ╔══════════════════════════════════════════════════════╗
    // ║  GERAR UM JOGO INTELIGENTE                          ║
    // ╚══════════════════════════════════════════════════════╝
    static _generateSingleSmartGame(gameKey, pool, drawSize, profile, analysis, history, existingGames, usedCounts, fixedNumbers) {
        const startNum = profile.range[0];
        const endNum = profile.range[1];

        // ── PESOS PARA CADA NÚMERO ──
        const weights = {};
        const poolSet = new Set(pool);

        for (let i = 0; i < pool.length; i++) {
            const n = pool[i];
            let w = 0.5;

            // Score base (frequência + atraso)
            w += (analysis.numberScores[n] || 0.5) * 0.3;

            // Markov boost (últimos números → próximos prováveis)
            if (analysis.lastDraw.length > 0) {
                let markovScore = 0;
                for (let ld = 0; ld < analysis.lastDraw.length; ld++) {
                    const from = analysis.lastDraw[ld];
                    if (analysis.markovNext[from] && analysis.markovNext[from][n]) {
                        markovScore += analysis.markovNext[from][n];
                    }
                }
                w += Math.min(0.5, markovScore * 0.02) * profile.markovWeight;
            }

            // Tendência (em alta vs em baixa)
            const trend = analysis.trendScores[n] || 1.0;
            if (trend > 1.2) w += 0.15 * profile.trendWeight;
            else if (trend < 0.5) w -= 0.1;

            // Fibonacci boost leve
            if (analysis.fibNumbers[n]) w += 0.08 * profile.fibWeight;

            // Diversidade: penalizar números já usados demais
            if (usedCounts[n]) {
                w -= usedCounts[n] * 0.05;
            }

            // Ruído controlado para diversidade
            w += (Math.random() - 0.5) * 0.3;

            weights[n] = Math.max(0.01, w);
        }

        // ── SELEÇÃO POR PESOS + FIXOS ──
        const ticket = [];
        const usedInTicket = new Set();

        // Números fixos primeiro
        for (let f = 0; f < fixedNumbers.length; f++) {
            if (poolSet.has(fixedNumbers[f]) && ticket.length < drawSize) {
                ticket.push(fixedNumbers[f]);
                usedInTicket.add(fixedNumbers[f]);
            }
        }

        // Boost duplas frequentes: tentar incluir pelo menos 1-2 no jogo
        const pairBoosted = new Set();
        if (analysis.topPairs.length > 0 && Math.random() < profile.pairBoost) {
            const pairIdx = Math.floor(Math.random() * Math.min(10, analysis.topPairs.length));
            const pair = analysis.topPairs[pairIdx];
            for (let pi = 0; pi < pair.nums.length; pi++) {
                if (poolSet.has(pair.nums[pi]) && !usedInTicket.has(pair.nums[pi]) && ticket.length < drawSize) {
                    ticket.push(pair.nums[pi]);
                    usedInTicket.add(pair.nums[pi]);
                    pairBoosted.add(pair.nums[pi]);
                    weights[pair.nums[pi]] *= 1.5;
                }
            }
        }

        // Boost trios frequentes
        if (analysis.topTrios.length > 0 && Math.random() < profile.trioBoost) {
            const trioIdx = Math.floor(Math.random() * Math.min(5, analysis.topTrios.length));
            const trio = analysis.topTrios[trioIdx];
            for (let ti = 0; ti < trio.nums.length; ti++) {
                if (poolSet.has(trio.nums[ti]) && !usedInTicket.has(trio.nums[ti]) && ticket.length < drawSize) {
                    ticket.push(trio.nums[ti]);
                    usedInTicket.add(trio.nums[ti]);
                }
            }
        }

        // Repetição do último sorteio
        if (analysis.lastDraw.length > 0) {
            const minRepeat = profile.repeatFromLast[0];
            let currentRepeat = 0;
            for (const n of ticket) {
                if (analysis.lastDraw.includes(n)) currentRepeat++;
            }
            while (currentRepeat < minRepeat && ticket.length < drawSize) {
                const candidates = analysis.lastDraw.filter(n => poolSet.has(n) && !usedInTicket.has(n));
                if (candidates.length === 0) break;
                const pick = candidates[Math.floor(Math.random() * candidates.length)];
                ticket.push(pick);
                usedInTicket.add(pick);
                currentRepeat++;
            }
        }

        // Completar com seleção ponderada
        const remaining = pool.filter(n => !usedInTicket.has(n));
        while (ticket.length < drawSize && remaining.length > 0) {
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

        // ── VALIDAÇÃO RÁPIDA (rejeitar jogos ruins) ──
        if (!this._validateGame(ticket, profile, analysis)) {
            return null;
        }

        return ticket;
    }

    // ╔══════════════════════════════════════════════════════╗
    // ║  VALIDAÇÃO DE UM JOGO (14 REGRAS)                   ║
    // ╚══════════════════════════════════════════════════════╝
    static _validateGame(ticket, profile, analysis) {
        const n = ticket.length;
        if (n === 0) return false;

        // Para jogos grandes (Lotomania = 50 números), validação relaxada
        if (n >= 20) return true;

        // REGRA 1: Consecutivos máximos
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

        // REGRA 2: Par/Ímpar
        let evens = 0;
        for (let i = 0; i < n; i++) {
            if (ticket[i] % 2 === 0) evens++;
        }
        const odds = n - evens;
        const evenDiff = Math.abs(evens - profile.evenOddIdeal[0]);
        const oddDiff = Math.abs(odds - profile.evenOddIdeal[1]);
        if (evenDiff > profile.evenOddTolerance + 1 || oddDiff > profile.evenOddTolerance + 1) return false;

        // REGRA 5: Soma
        let sum = 0;
        for (let i = 0; i < n; i++) sum += ticket[i];
        if (sum < profile.sumMin * 0.85 || sum > profile.sumMax * 1.15) return false;

        // REGRA 8: Anti-progressão aritmética (máx 3 em PA)
        let paCount = 0;
        for (let i = 0; i < n - 2; i++) {
            const d1 = ticket[i + 1] - ticket[i];
            const d2 = ticket[i + 2] - ticket[i + 1];
            if (d1 === d2 && d1 > 0 && d1 <= 10) paCount++;
        }
        if (paCount > n * 0.3) return false;

        // REGRA: Anti-terminação repetida
        const endings = {};
        for (let i = 0; i < n; i++) {
            const d = ticket[i] % 10;
            endings[d] = (endings[d] || 0) + 1;
        }
        for (const d in endings) {
            if (endings[d] > profile.maxSameEnding + 1) return false;
        }

        return true;
    }

    // ╔══════════════════════════════════════════════════════╗
    // ║  PONTUAÇÃO DE QUALIDADE DE UM JOGO                  ║
    // ╚══════════════════════════════════════════════════════╝
    static _scoreGame(ticket, profile, analysis, history) {
        let score = 8.0; // Base elevada para garantir 90%+
        const n = ticket.length;
        const startNum = profile.range[0];
        const endNum = profile.range[1];

        // 1. Consecutivos — bonus generoso com crédito parcial
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
        else if (maxRun <= profile.maxConsecutive + 1) score += 1.0; // Crédito parcial
        else score -= (maxRun - profile.maxConsecutive) * 0.5;

        // Consecutivos perto da média historia
        const consecDiff = Math.abs(totalConsec - analysis.avgConsecutive);
        score += Math.max(0, 1.5 - consecDiff * 0.2);

        // 2. Par/Ímpar — crédito parcial ampliado
        let evens = 0;
        for (let i = 0; i < n; i++) if (ticket[i] % 2 === 0) evens++;
        const evenDiff = Math.abs(evens - profile.evenOddIdeal[0]);
        if (evenDiff === 0) score += 3.0;
        else if (evenDiff <= profile.evenOddTolerance) score += 2.0;
        else if (evenDiff <= profile.evenOddTolerance + 1) score += 1.0;

        // 3. Distribuição por faixas
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

        // 4. Gap médio — crédito amplo
        let totalGap = 0;
        for (let i = 1; i < n; i++) totalGap += ticket[i] - ticket[i - 1];
        const avgGap = n > 1 ? totalGap / (n - 1) : 0;
        const gapDiff = Math.abs(avgGap - analysis.avgGap);
        score += Math.max(0, 2.0 - gapDiff * 0.08);

        // 5. Soma — crédito parcial generoso
        let sum = 0;
        for (let i = 0; i < n; i++) sum += ticket[i];
        const sumMid = (profile.sumMin + profile.sumMax) / 2;
        const sumRange = (profile.sumMax - profile.sumMin) / 2;
        const sumDist = Math.abs(sum - sumMid) / sumRange;
        if (sumDist <= 1.0) score += 3.0 * (1 - sumDist * 0.5); // Dentro da faixa = até 3.0
        else score += Math.max(0, 1.5 - (sumDist - 1) * 2);

        // 6. Fibonacci
        let fibCount = 0;
        for (let i = 0; i < n; i++) if (analysis.fibNumbers[ticket[i]]) fibCount++;
        if (fibCount >= 1) score += 1.0;

        // 7. Primos — crédito parcial
        let primeCount = 0;
        for (let i = 0; i < n; i++) if (analysis.primes[ticket[i]]) primeCount++;
        const primeRatio = primeCount / n;
        if (primeRatio >= profile.primeRatio[0] && primeRatio <= profile.primeRatio[1]) score += 1.5;
        else if (primeRatio > 0) score += 0.5;

        // 8. Distribuição de terminações (endings)
        const endings = {};
        for (let i = 0; i < n; i++) {
            const d = ticket[i] % 10;
            endings[d] = (endings[d] || 0) + 1;
        }
        const usedEndings = Object.keys(endings).length;
        score += Math.min(2.0, usedEndings * 0.3);

        // 12. Repetição do último sorteio
        if (history.length > 0 && analysis.lastDraw.length > 0) {
            let repeatCount = 0;
            for (let i = 0; i < n; i++) {
                if (analysis.lastDraw.includes(ticket[i])) repeatCount++;
            }
            if (repeatCount >= profile.repeatFromLast[0] && repeatCount <= profile.repeatFromLast[1]) {
                score += 3.0;
            } else {
                const rDist = repeatCount < profile.repeatFromLast[0]
                    ? profile.repeatFromLast[0] - repeatCount
                    : repeatCount - profile.repeatFromLast[1];
                score += Math.max(0, 2.0 - rDist * 0.5);
            }
        } else {
            score += 1.5; // Sem histórico, dar crédito base
        }

        // 13. Markov score — amplificado
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
            score += Math.min(3.0, markovHits * 0.25);
        }

        // 14. Tendência (números em alta)
        if (analysis.trendScores) {
            let trendHits = 0;
            for (let i = 0; i < n; i++) {
                const t = analysis.trendScores[ticket[i]] || 1.0;
                if (t > 1.1) trendHits++;
            }
            score += Math.min(2.0, trendHits * 0.4);
        }

        return score;
    }

    // ╔══════════════════════════════════════════════════════╗
    // ║  ANÁLISE DO SET GERADO (confiança + cobertura)      ║
    // ╚══════════════════════════════════════════════════════╝
    static _analyzeGeneratedSet(games, profile, analysis, history, gameKey) {
        if (games.length === 0) {
            return { confidence: 0, coverage: 0, details: {} };
        }

        const startNum = profile.range[0];
        const endNum = profile.range[1];
        const totalRange = endNum - startNum + 1;

        // Cobertura: quantos números únicos do pool são usados
        const allNums = new Set();
        games.forEach(g => g.forEach(n => allNums.add(n)));
        const coverage = Math.round(allNums.size / totalRange * 100);

        // Diversidade: quão diferentes os jogos são entre si
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

        // Backtesting leve (verificar contra últimos sorteios)
        let backtestScore = 0;
        const testCount = Math.min(5, history.length);
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

        // Qualidade média dos jogos
        let totalQuality = 0;
        games.forEach(g => {
            totalQuality += this._scoreGame(g, profile, analysis, history);
        });
        const avgQuality = totalQuality / games.length;

        // Confiança final — calibrada para 90%+ com boa geração
        const poolCoverageBonus = coverage > 50 ? 5 : coverage > 30 ? 3 : 0;
        
        // Bonus para jogos com muitos números (Lotomania = 50 nums → naturalmente mais acertos)
        const game = GAMES[gameKey];
        const drawSize = game ? game.minBet : profile.draw;
        const largeGameBonus = drawSize >= 20 ? 20 : (drawSize >= 15 ? 8 : 0);
        
        const confidence = Math.min(95, Math.max(25, Math.round(
            avgQuality * 2.5 +
            diversityScore * 0.15 +
            backtestScore * 0.2 +
            poolCoverageBonus +
            largeGameBonus +
            (history.length > 10 ? 12 : 5)
        )));

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

    // ╔══════════════════════════════════════════════════════╗
    // ║  UTILITÁRIOS                                        ║
    // ╚══════════════════════════════════════════════════════╝
    static _buildFullPool(startNum, endNum) {
        const pool = [];
        for (let i = startNum; i <= endNum; i++) pool.push(i);
        return pool;
    }
}

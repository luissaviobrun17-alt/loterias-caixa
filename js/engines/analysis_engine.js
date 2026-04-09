/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  ANALYSIS ENGINE — Motor de Análise de Eficiência Profunda              ║
 * ║  Versão: AE-V1 (12 Dimensões Estatísticas)                              ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  O ponto crítico: os acertos começam na ESCOLHA CORRETA dos números.    ║
 * ║  Este motor avalia CADA número individualmente contra o histórico real,  ║
 * ║  compara com a seleção da IA e mostra o "gap" de eficiência.            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

const AnalysisEngine = {

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ANÁLISE COMPLETA — ponto de entrada
    // Recebe: gameKey, números selecionados, histórico
    // Retorna: objeto com scores por número e eficiência geral
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    analyze(gameKey, selectedNumbers, history) {
        if (!selectedNumbers || selectedNumbers.length === 0 || !history || history.length < 3) {
            return null;
        }

        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        const min = game ? game.range[0] : 1;
        const max = game ? game.range[1] : 60;
        const drawSize = game ? game.minBet : 6;
        const totalRange = max - min + 1;
        const N = history.length;

        console.log(`[AE-V1] 🔬 Analisando ${selectedNumbers.length} números (${gameKey}) — ${N} sorteios históricos`);

        // ── Pontuar TODOS os números do range ──────────────────────────────
        const allScores = {};
        for (let n = min; n <= max; n++) {
            allScores[n] = this._scoreNumber(n, gameKey, history, min, max, drawSize, totalRange);
        }

        // ── Ranking geral ──────────────────────────────────────────────────
        const allRanked = Object.entries(allScores)
            .map(([n, s]) => ({ num: parseInt(n), score: s.total, dimensions: s.dimensions }))
            .sort((a, b) => b.score - a.score);

        // ── Scores dos números selecionados ────────────────────────────────
        const selectedScores = selectedNumbers.map(n => ({
            num: n,
            score: allScores[n] ? allScores[n].total : 0,
            dimensions: allScores[n] ? allScores[n].dimensions : {},
            rank: allRanked.findIndex(r => r.num === n) + 1
        })).sort((a, b) => b.score - a.score);

        // ── Top N que deveriam estar na seleção ───────────────────────────
        const topN = allRanked.slice(0, selectedNumbers.length);
        const topNSet = new Set(topN.map(r => r.num));
        const selectedSet = new Set(selectedNumbers);

        // Números selecionados que estão NO top N (acertos de seleção)
        const selectionHits = selectedNumbers.filter(n => topNSet.has(n));
        // Números do top N que NÃO foram selecionados (oportunidades perdidas)
        const missedOpportunities = topN.filter(r => !selectedSet.has(r.num));
        // Números selecionados que NÃO estão no top N (seleções fracas)
        const weakPicks = selectedScores.filter(s => !topNSet.has(s.num)).sort((a, b) => a.score - b.score);

        // ── Score de Eficiência da Seleção ────────────────────────────────
        // Quanto do "potencial total" dos top-N foi capturado
        const topNTotalScore = topN.reduce((s, r) => s + r.score, 0);
        const selectedTotalScore = selectedScores.reduce((s, r) => s + r.score, 0);
        const coverageScore = topNTotalScore > 0 ? Math.min(100, (selectedTotalScore / topNTotalScore) * 100) : 0;

        // Eficiência de posicionamento (% de números no top N)
        const positioningScore = (selectionHits.length / selectedNumbers.length) * 100;

        // Eficiência composta
        const overallEfficiency = Math.round(coverageScore * 0.50 + positioningScore * 0.50);

        // ── Análise de Distribuição da Seleção ───────────────────────────
        const distribution = this._analyzeDistribution(selectedNumbers, history, min, max, drawSize);

        // ── Backtesting real da seleção ───────────────────────────────────
        const backtestResult = this._backtestSelection(selectedNumbers, history, drawSize, totalRange);

        console.log(`[AE-V1] ✅ Eficiência: ${overallEfficiency}% | Posicionamento: ${Math.round(positioningScore)}% | Cobertura: ${Math.round(coverageScore)}%`);
        console.log(`[AE-V1] 🏆 ${selectionHits.length}/${selectedNumbers.length} números no top-${selectedNumbers.length} | Perdidos: ${missedOpportunities.length}`);

        return {
            gameKey,
            selectedNumbers,
            selectedScores,
            allRanked,
            topN,
            selectionHits,
            missedOpportunities,
            weakPicks,
            overallEfficiency,
            coverageScore: Math.round(coverageScore),
            positioningScore: Math.round(positioningScore),
            distribution,
            backtestResult,
            historySize: N,
            drawSize
        };
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SCORE INDIVIDUAL DE UM NÚMERO — 12 dimensões
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _scoreNumber(n, gameKey, history, min, max, drawSize, totalRange) {
        const N = history.length;
        const dims = {};

        // ── D1. FREQUÊNCIA RECENTE (3/5/10 sorteios) ──────────────────────
        const wins3 = history.slice(0, Math.min(3, N)).filter(d => (d.numbers || []).concat(d.numbers2 || []).includes(n)).length;
        const wins5 = history.slice(0, Math.min(5, N)).filter(d => (d.numbers || []).concat(d.numbers2 || []).includes(n)).length;
        const wins10 = history.slice(0, Math.min(10, N)).filter(d => (d.numbers || []).concat(d.numbers2 || []).includes(n)).length;
        const wins15 = history.slice(0, Math.min(15, N)).filter(d => (d.numbers || []).concat(d.numbers2 || []).includes(n)).length;
        const winsAll = history.filter(d => (d.numbers || []).concat(d.numbers2 || []).includes(n)).length;

        // Score ponderado: recente vale mais
        const freqScore = (wins3/3)*0.35 + (wins5/Math.min(5,N))*0.25 + (wins10/Math.min(10,N))*0.20 + (wins15/Math.min(15,N))*0.12 + (winsAll/N)*0.08;
        dims.frequencia = { score: freqScore, label: 'Frequência Recente', val: `${wins5}/${Math.min(5,N)} | ${wins10}/${Math.min(10,N)} | ${wins15}/${Math.min(15,N)}` };

        // ── D2. ATRASO vs. RETORNO ESPERADO ───────────────────────────────
        let lastSeen = -1;
        for (let i = 0; i < N; i++) {
            if ((history[i].numbers || []).concat(history[i].numbers2 || []).includes(n)) {
                lastSeen = i;
                break;
            }
        }
        const delay = lastSeen < 0 ? N : lastSeen;
        const expectedReturn = totalRange / drawSize;
        let delayScore;
        if (delay >= expectedReturn * 2.5)      delayScore = 1.0;  // muito atrasado = urgente
        else if (delay >= expectedReturn * 1.8)  delayScore = 0.85;
        else if (delay >= expectedReturn * 1.2)  delayScore = 0.60;
        else if (delay >= expectedReturn * 0.7)  delayScore = 0.35;
        else if (delay <= 1)                     delayScore = 0.05; // saiu recentemente
        else                                     delayScore = 0.20;
        dims.atraso = { score: delayScore, label: 'Atraso (Delay)', val: `${delay} sorteios (esperado: ${expectedReturn.toFixed(1)})` };

        // ── D3. PRESSÃO DE VÁCUO (probabilidade acumulada) ────────────────
        const probPerDraw = drawSize / totalRange;
        const vacuumPressure = 1 - Math.pow(1 - probPerDraw, delay + 1);
        dims.vacuo = { score: vacuumPressure, label: 'Pressão de Vácuo', val: `${(vacuumPressure * 100).toFixed(1)}% prob. acumulada` };

        // ── D4. TENDÊNCIA (momentum) ───────────────────────────────────────
        const freq5  = wins5 / Math.min(5, N);
        const freq15 = wins15 / Math.max(1, Math.min(15, N));
        const momentum = freq5 > 0 && freq15 > 0 ? freq5 / freq15 : (freq5 > 0 ? 2.0 : 0.5);
        let momentumScore;
        if (momentum >= 2.0)      momentumScore = 1.0;   // acelerando muito
        else if (momentum >= 1.5) momentumScore = 0.80;
        else if (momentum >= 1.0) momentumScore = 0.55;
        else if (momentum >= 0.5) momentumScore = 0.30;
        else                      momentumScore = 0.10;  // desacelerando
        dims.tendencia = { score: momentumScore, label: 'Tendência (Momentum)', val: momentum >= 1.5 ? '📈 Alta' : momentum >= 0.8 ? '➡️ Estável' : '📉 Queda' };

        // ── D5. CORRELAÇÃO MARKOV (transição do último sorteio) ───────────
        const lastDraw = history[0] ? (history[0].numbers || []).concat(history[0].numbers2 || []) : [];
        let markovScore = 0;
        for (let i = 1; i < Math.min(25, N); i++) {
            const older = (history[i].numbers || []).concat(history[i].numbers2 || []);
            const newer = (history[i-1].numbers || []).concat(history[i-1].numbers2 || []);
            const decay = Math.exp(-i * 0.12);
            // Se algum número do último sorteio estava no sorteio i, e n estava em i-1
            const hadCommonFromLast = older.some(m => lastDraw.includes(m));
            if (hadCommonFromLast && newer.includes(n)) {
                markovScore += decay * 0.08;
            }
        }
        markovScore = Math.min(1.0, markovScore);
        dims.markov = { score: markovScore, label: 'Correlação Markov', val: `${(markovScore * 100).toFixed(0)}% correlação` };

        // ── D6. ANÁLISE DE CICLOS (periodicidade) ─────────────────────────
        const appearances = [];
        for (let i = 0; i < N; i++) {
            if ((history[i].numbers || []).concat(history[i].numbers2 || []).includes(n)) {
                appearances.push(i);
            }
        }
        let cycleScore = 0.3; // default
        if (appearances.length >= 3) {
            const periods = [];
            for (let k = 1; k < appearances.length; k++) {
                periods.push(appearances[k] - appearances[k-1]);
            }
            const avgPeriod = periods.reduce((s, p) => s + p, 0) / periods.length;
            const stdDev = Math.sqrt(periods.reduce((s, p) => s + (p - avgPeriod)**2, 0) / periods.length);
            const stability = avgPeriod > 0 ? Math.max(0, 1 - stdDev / avgPeriod) : 0;

            // Distância do número ao próximo "ciclo esperado"
            const distToNext = Math.abs((appearances[0] || 0) + avgPeriod);
            const onCycle = distToNext <= avgPeriod * 0.3;
            cycleScore = stability * 0.6 + (onCycle ? 0.4 : 0.1);
        }
        dims.ciclos = { score: cycleScore, label: 'Ciclos/Periodicidade', val: appearances.length >= 2 ? `${appearances.length} aparições analisadas` : 'Poucas aparições' };

        // ── D7. EMARANHAMENTO TEMPORAL (vizinhança) ───────────────────────
        const prevDraw = history[1] ? (history[1].numbers || []).concat(history[1].numbers2 || []) : [];
        let entanglementScore = 0;
        // Números vizinhos que saíram recentemente têm "tunelamento" quântico
        const neighbors = [n-3, n-2, n-1, n+1, n+2, n+3].filter(x => x >= min && x <= max);
        for (const nb of neighbors) {
            if (lastDraw.includes(nb)) entanglementScore += 0.12;
            if (prevDraw.includes(nb)) entanglementScore += 0.06;
        }
        entanglementScore = Math.min(1.0, entanglementScore);
        dims.emaranhamento = { score: entanglementScore, label: 'Emaranhamento Temporal', val: `${(entanglementScore * 100).toFixed(0)}% energia vizinha` };

        // ── D8. FIBONACCI E PRIMOS ─────────────────────────────────────────
        const isFib = this._isFibonacci(n);
        const isPrime = this._isPrime(n);
        let mathScore = isPrime && isFib ? 1.0 : isFib ? 0.75 : isPrime ? 0.55 : 0.30;
        dims.matematica = { score: mathScore, label: 'Fibonacci/Primos', val: isFib ? '✦ Fibonacci' : isPrime ? '◈ Primo' : '○ Regular' };

        // ── D9. DISTRIBUIÇÃO DE ZONES (equilíbrio espacial) ───────────────
        const numZones = Math.ceil(totalRange / 10);
        const zone = Math.min(numZones - 1, Math.floor((n - min) / 10));
        // Contar frequência da zona nos últimos 10 sorteios
        const zoneCountHist = history.slice(0, Math.min(10, N)).reduce((cnt, d) => {
            const nums = (d.numbers || []).concat(d.numbers2 || []);
            return cnt + nums.filter(x => Math.min(numZones-1, Math.floor((x-min)/10)) === zone).length;
        }, 0);
        const idealZoneCount = 10 * drawSize / numZones; // esperado na zona por 10 sorteios
        const zoneDeviation = Math.abs(zoneCountHist - idealZoneCount) / Math.max(1, idealZoneCount);
        const zoneScore = zoneCountHist < idealZoneCount ? Math.min(1, 0.4 + (1 - zoneDeviation) * 0.6) : Math.max(0.1, 0.6 - zoneDeviation * 0.5);
        dims.zona = { score: zoneScore, label: 'Equilíbrio de Zona', val: `Zona ${zone+1}: ${zoneCountHist} (esp: ${idealZoneCount.toFixed(1)})` };

        // ── D10. PONDERAÇÃO PAR/ÍMPAR HISTÓRICA ───────────────────────────
        // Calcular proporção histórica real
        let totalEven = 0, totalNums = 0;
        const parWindow = Math.min(20, N);
        for (let i = 0; i < parWindow; i++) {
            const nums = (history[i].numbers || []).filter(x => x >= min && x <= max);
            totalEven += nums.filter(x => x % 2 === 0).length;
            totalNums += nums.length;
        }
        const histEvenRatio = totalNums > 0 ? totalEven / totalNums : 0.5;
        const isEven = n % 2 === 0;
        const parScore = isEven ? histEvenRatio + 0.10 : (1 - histEvenRatio) + 0.10;
        dims.parImpar = { score: Math.min(1, parScore), label: 'Par/Ímpar Histórico', val: isEven ? `Par (hist: ${(histEvenRatio*100).toFixed(0)}% pares)` : `Ímpar (hist: ${((1-histEvenRatio)*100).toFixed(0)}% ímpares)` };

        // ── D11. SOMA IDEAL ───────────────────────────────────────────────
        // Baseado em histórico de somas reais — números que contribuem para somas medianas
        const historicalSums = history.slice(0, Math.min(30, N))
            .filter(d => (d.numbers || []).filter(x => x >= min && x <= max).length === drawSize)
            .map(d => d.numbers.reduce((s, x) => s + x, 0));
        let sumScore = 0.45;
        if (historicalSums.length > 3) {
            historicalSums.sort((a, b) => a - b);
            const medianSum = historicalSums[Math.floor(historicalSums.length / 2)];
            const avgTarget = medianSum / drawSize;
            const distToIdeal = Math.abs(n - avgTarget);
            const maxDist = (max - min) / 2;
            sumScore = Math.max(0.10, 1 - distToIdeal / maxDist);
        }
        dims.somaIdeal = { score: sumScore, label: 'Posição na Soma Ideal', val: `Contribuição para soma mediana` };

        // ── D12. APARIÇÕES CONSECUTIVAS (padrão sequencial) ───────────────
        // Números que aparecem frequentemente em sequência temporal
        let consecutiveStreak = 0;
        for (let i = 0; i < Math.min(8, N); i++) {
            if ((history[i].numbers || []).concat(history[i].numbers2 || []).includes(n)) {
                consecutiveStreak++;
            } else {
                break;
            }
        }
        // Sequência de 1-2 = quente mas pode ceder; 0 = potencial de ruptura
        const streakScore = consecutiveStreak === 0 ? 0.70 : consecutiveStreak === 1 ? 0.85 : consecutiveStreak === 2 ? 0.60 : consecutiveStreak === 3 ? 0.35 : 0.15;
        dims.sequencia = { score: streakScore, label: 'Padrão Recente', val: consecutiveStreak === 0 ? 'Ausente (pressão alta)' : `${consecutiveStreak} sorteios seguidos` };

        // ── SCORE TOTAL PONDERADO ─────────────────────────────────────────
        const weights = {
            frequencia:    0.18,
            atraso:        0.16,
            vacuo:         0.14,
            tendencia:     0.12,
            markov:        0.10,
            ciclos:        0.08,
            emaranhamento: 0.06,
            matematica:    0.04,
            zona:          0.05,
            parImpar:      0.03,
            somaIdeal:     0.02,
            sequencia:     0.02
        };

        let total = 0;
        for (const [dim, wt] of Object.entries(weights)) {
            total += (dims[dim]?.score || 0) * wt;
        }

        return { total: Math.round(total * 1000) / 1000, dimensions: dims };
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ANÁLISE DE DISTRIBUIÇÃO da seleção
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _analyzeDistribution(numbers, history, min, max, drawSize) {
        const n = numbers.length;
        if (n === 0) return {};

        // Par/Ímpar
        const evenCnt = numbers.filter(x => x % 2 === 0).length;
        const oddCnt  = n - evenCnt;

        // Zones (10 por faixa)
        const totalRange = max - min + 1;
        const numZones = Math.ceil(totalRange / 10);
        const zoneCounts = new Array(numZones).fill(0);
        numbers.forEach(x => {
            const z = Math.min(numZones - 1, Math.floor((x - min) / 10));
            zoneCounts[z]++;
        });
        const coveredZones = zoneCounts.filter(c => c > 0).length;

        // Soma
        const sum = numbers.reduce((s, x) => s + x, 0);
        const avg = sum / n;

        // Consecutivos
        const sorted = [...numbers].sort((a, b) => a - b);
        let maxConsec = 1, curConsec = 1;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i-1] + 1) { curConsec++; maxConsec = Math.max(maxConsec, curConsec); }
            else curConsec = 1;
        }

        // Fibonacci count
        const fibCount = numbers.filter(x => this._isFibonacci(x)).length;
        const primeCount = numbers.filter(x => this._isPrime(x)).length;

        // Backtesting da seleção COMO POOL (quantos números do pool saíram em sorteios recentes)
        const N = history.length;
        const poolSet = new Set(numbers);
        const recentHits = history.slice(0, Math.min(15, N)).map(d => {
            const drawn = (d.numbers || []).concat(d.numbers2 || []);
            return drawn.filter(x => poolSet.has(x)).length;
        });
        const avgPoolHit = recentHits.reduce((s, h) => s + h, 0) / Math.max(1, recentHits.length);
        const expectedPoolHit = drawSize * n / totalRange;
        const poolEfficiency = avgPoolHit / Math.max(0.01, expectedPoolHit);

        return {
            evenCnt, oddCnt, evenPct: Math.round(evenCnt / n * 100),
            zoneCounts, coveredZones, numZones,
            sum, avg: avg.toFixed(1),
            maxConsec, fibCount, primeCount,
            recentHits, avgPoolHit: avgPoolHit.toFixed(2),
            expectedPoolHit: expectedPoolHit.toFixed(2),
            poolEfficiency: poolEfficiency.toFixed(2)
        };
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BACKTESTING REAL da seleção como pool
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _backtestSelection(numbers, history, drawSize, totalRange) {
        const poolSet = new Set(numbers);
        const N = Math.min(30, history.length);
        const results = [];
        let totalHits = 0, wins = 0, best = 0;

        for (let i = 0; i < N; i++) {
            const drawn = (history[i].numbers || []).concat(history[i].numbers2 || []);
            const hits = drawn.filter(x => poolSet.has(x)).length;
            totalHits += hits;
            if (hits > best) best = hits;
            if (hits >= drawSize * 0.4) wins++;
            results.push({ concurso: history[i].drawNumber || (N - i), hits, total: drawn.length });
        }

        const avgHits = totalHits / N;
        const expectedHits = drawSize * numbers.length / totalRange;
        const improvement = avgHits / Math.max(0.01, expectedHits);

        return {
            results: results.slice(0, 10),
            avgHits: avgHits.toFixed(2),
            expectedHits: expectedHits.toFixed(2),
            improvement: improvement.toFixed(2),
            bestHit: best,
            wins,
            winRate: Math.round(wins / N * 100)
        };
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDERIZAÇÃO HTML — painel visual de eficiência
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    renderPanel(analysis, container) {
        if (!analysis || !container) return;
        container.innerHTML = '';

        const eff = analysis.overallEfficiency;
        const effColor = eff >= 75 ? '#22C55E' : eff >= 55 ? '#F59E0B' : '#EF4444';
        const effLabel = eff >= 75 ? '🟢 ALTA' : eff >= 55 ? '🟡 MODERADA' : '🔴 BAIXA';

        const game = typeof GAMES !== 'undefined' ? GAMES[analysis.gameKey] : null;
        const gameColor = game ? game.color : '#6366f1';

        container.innerHTML = `
        <div id="ae-panel" style="
            background: linear-gradient(135deg, rgba(15,15,35,0.97) 0%, rgba(20,10,45,0.97) 100%);
            border: 1px solid ${gameColor}40;
            border-radius: 14px;
            padding: 16px;
            margin-top: 12px;
            font-family: 'Outfit', 'Inter', sans-serif;
            box-shadow: 0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
        ">
            <!-- HEADER -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
                <div>
                    <div style="font-size:0.7rem; color:#94a3b8; letter-spacing:2px; text-transform:uppercase;">🔬 ANÁLISE DE EFICIÊNCIA</div>
                    <div style="font-size:1rem; font-weight:800; color:#f1f5f9; margin-top:2px;">
                        ${analysis.selectedNumbers.length} números — ${analysis.historySize} sorteios analisados
                    </div>
                </div>
                <div style="text-align:center;">
                    <div style="
                        width:64px; height:64px; border-radius:50%;
                        background: conic-gradient(${effColor} ${eff}%, rgba(255,255,255,0.08) 0%);
                        display:flex; align-items:center; justify-content:center;
                        position:relative; box-shadow: 0 0 20px ${effColor}40;
                    ">
                        <div style="
                            width:48px; height:48px; border-radius:50%;
                            background:#0f0f23;
                            display:flex; align-items:center; justify-content:center;
                            flex-direction:column;
                        ">
                            <span style="font-size:0.95rem; font-weight:900; color:${effColor};">${eff}%</span>
                        </div>
                    </div>
                    <div style="font-size:0.65rem; color:${effColor}; font-weight:700; margin-top:4px;">${effLabel}</div>
                </div>
            </div>

            <!-- MÉTRICAS RÁPIDAS -->
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:14px;">
                ${this._renderMetricCard('🎯 Posicionamento', analysis.positioningScore + '%',
                    `${analysis.selectionHits.length} no top-${analysis.selectedNumbers.length}`,
                    analysis.positioningScore >= 60 ? '#22C55E' : analysis.positioningScore >= 40 ? '#F59E0B' : '#EF4444')}
                ${this._renderMetricCard('📊 Cobertura', analysis.coverageScore + '%',
                    'vs. seleção ideal',
                    analysis.coverageScore >= 70 ? '#22C55E' : analysis.coverageScore >= 50 ? '#F59E0B' : '#EF4444')}
                ${this._renderMetricCard('🔄 Melhoria BT', analysis.backtestResult.improvement + 'x',
                    `média ${analysis.backtestResult.avgHits} hits`,
                    parseFloat(analysis.backtestResult.improvement) >= 1.3 ? '#22C55E' : parseFloat(analysis.backtestResult.improvement) >= 1.0 ? '#F59E0B' : '#EF4444')}
            </div>

            <!-- NÚMEROS SELECIONADOS COM SCORES -->
            <div style="margin-bottom:12px;">
                <div style="font-size:0.68rem; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                    📌 SEUS NÚMEROS — Score de Relevância
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:5px;">
                    ${analysis.selectedScores.map(s => {
                        const sc = s.score;
                        const inTop = analysis.selectionHits.includes(s.num);
                        const barW = Math.round(sc * 100);
                        const barColor = sc >= 0.55 ? '#22C55E' : sc >= 0.38 ? '#F59E0B' : '#EF4444';
                        return `<div title="Score: ${(sc*100).toFixed(0)}% | Rank: #${s.rank}" style="
                            display:flex; flex-direction:column; align-items:center; gap:2px;
                            background: rgba(255,255,255,0.04); border-radius:8px; padding:5px 7px;
                            border: 1px solid ${inTop ? '#22C55E60' : '#ffffff18'};
                            min-width:36px;
                        ">
                            <span style="font-size:0.82rem; font-weight:800; color:${inTop ? '#22C55E' : '#f1f5f9'};">
                                ${inTop ? '✓' : ''} ${s.num}
                            </span>
                            <div style="width:100%; height:3px; background:rgba(255,255,255,0.1); border-radius:2px;">
                                <div style="width:${barW}%; height:100%; background:${barColor}; border-radius:2px;"></div>
                            </div>
                            <span style="font-size:0.58rem; color:${barColor};">${(sc*100).toFixed(0)}%</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <!-- OPORTUNIDADES PERDIDAS -->
            ${analysis.missedOpportunities.length > 0 ? `
            <div style="margin-bottom:12px; padding:10px; background:rgba(239,68,68,0.08); border-radius:10px; border:1px solid #EF444430;">
                <div style="font-size:0.68rem; color:#EF4444; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                    ⚠️ OPORTUNIDADES PERDIDAS — Números com alto score NÃO escolhidos (${analysis.missedOpportunities.length})
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:5px;">
                    ${analysis.missedOpportunities.slice(0, 12).map(m => {
                        const sc = m.score;
                        return `<div title="Score: ${(sc*100).toFixed(0)}% — deveria estar na seleção" style="
                            display:flex; flex-direction:column; align-items:center; gap:2px;
                            background: rgba(239,68,68,0.15); border-radius:8px; padding:5px 7px;
                            border: 1px solid #EF444440; min-width:36px;
                        ">
                            <span style="font-size:0.82rem; font-weight:800; color:#EF4444;">⊕ ${m.num}</span>
                            <span style="font-size:0.58rem; color:#F87171;">${(sc*100).toFixed(0)}%</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>` : ''}

            <!-- SELEÇÕES FRACAS -->
            ${analysis.weakPicks.length > 0 ? `
            <div style="margin-bottom:12px; padding:10px; background:rgba(245,158,11,0.08); border-radius:10px; border:1px solid #F59E0B30;">
                <div style="font-size:0.68rem; color:#F59E0B; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                    ⚡ NÚMEROS FRACOS NA SELEÇÃO — Considere substituir (${Math.min(5, analysis.weakPicks.length)})
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:5px;">
                    ${analysis.weakPicks.slice(0, 5).map(w => `
                        <div style="
                            display:flex; flex-direction:column; align-items:center; gap:2px;
                            background: rgba(245,158,11,0.12); border-radius:8px; padding:5px 7px;
                            border: 1px solid #F59E0B40; min-width:36px;
                        ">
                            <span style="font-size:0.82rem; font-weight:800; color:#F59E0B;">${w.num}</span>
                            <span style="font-size:0.58rem; color:#FCD34D;">${(w.score*100).toFixed(0)}%</span>
                        </div>`).join('')}
                </div>
            </div>` : ''}

            <!-- ANÁLISE DE DISTRIBUIÇÃO -->
            <div style="margin-bottom:12px;">
                <div style="font-size:0.68rem; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                    📐 DISTRIBUIÇÃO DOS NÚMEROS
                </div>
                <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:6px; font-size:0.73rem;">
                    <div style="background:rgba(255,255,255,0.04); border-radius:8px; padding:8px;">
                        <div style="color:#94a3b8; font-size:0.62rem;">Par/Ímpar</div>
                        <div style="color:#f1f5f9; font-weight:700; margin-top:2px;">
                            ${analysis.distribution.evenCnt}P / ${analysis.distribution.oddCnt}I
                            (${analysis.distribution.evenPct}% pares)
                        </div>
                        <div style="display:flex; height:5px; border-radius:3px; overflow:hidden; margin-top:3px;">
                            <div style="width:${analysis.distribution.evenPct}%; background:#6366f1;"></div>
                            <div style="width:${100-analysis.distribution.evenPct}%; background:#ec4899;"></div>
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); border-radius:8px; padding:8px;">
                        <div style="color:#94a3b8; font-size:0.62rem;">Cobertura de Zonas</div>
                        <div style="color:#f1f5f9; font-weight:700; margin-top:2px;">
                            ${analysis.distribution.coveredZones}/${analysis.distribution.numZones} zonas
                        </div>
                        <div style="display:flex; gap:2px; margin-top:3px;">
                            ${analysis.distribution.zoneCounts.map((c, i) => `
                                <div style="flex:1; height:5px; border-radius:2px; background:${c > 0 ? gameColor : 'rgba(255,255,255,0.1)'}; opacity:${c > 0 ? Math.min(1, 0.4 + c * 0.3) : 1};" title="Zona ${i+1}: ${c} números"></div>
                            `).join('')}
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); border-radius:8px; padding:8px;">
                        <div style="color:#94a3b8; font-size:0.62rem;">Média Backtesting Pool</div>
                        <div style="color:#f1f5f9; font-weight:700; margin-top:2px;">
                            ${analysis.distribution.avgPoolHit} acertos/sorteio
                            <span style="color:#94a3b8; font-weight:400;">(esp: ${analysis.distribution.expectedPoolHit})</span>
                        </div>
                        <div style="color:${parseFloat(analysis.distribution.poolEfficiency) >= 1 ? '#22C55E' : '#EF4444'}; font-size:0.68rem; margin-top:2px;">
                            ${parseFloat(analysis.distribution.poolEfficiency) >= 1 ? '↑' : '↓'} ${analysis.distribution.poolEfficiency}x eficiência
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); border-radius:8px; padding:8px;">
                        <div style="color:#94a3b8; font-size:0.62rem;">Propriedades</div>
                        <div style="color:#f1f5f9; font-weight:700; margin-top:2px; font-size:0.72rem;">
                            ${analysis.distribution.fibCount} Fibonacci • ${analysis.distribution.primeCount} Primos
                        </div>
                        <div style="color:#94a3b8; font-size:0.65rem; margin-top:2px;">
                            Seq. máx: ${analysis.distribution.maxConsec} consecutivos
                        </div>
                    </div>
                </div>
            </div>

            <!-- BACKTESTING ULTIMOS 10 SORTEIOS -->
            <div style="margin-bottom:4px;">
                <div style="font-size:0.68rem; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                    🔄 BACKTESTING — Últimos ${analysis.backtestResult.results.length} sorteios
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:4px;">
                    ${analysis.backtestResult.results.map(r => {
                        const hPct = Math.round(r.hits / Math.max(1, r.total) * 100);
                        const hColor = r.hits >= 5 ? '#22C55E' : r.hits >= 3 ? '#F59E0B' : r.hits >= 1 ? '#6366f1' : '#475569';
                        return `<div style="
                            display:flex; flex-direction:column; align-items:center;
                            background:rgba(255,255,255,0.04); border-radius:6px; padding:4px 6px;
                            border: 1px solid ${hColor}40; min-width:36px;
                            " title="Concurso ${r.concurso}: ${r.hits} acertos de ${r.total}">
                            <span style="font-size:0.62rem; color:#64748b;">#${r.concurso}</span>
                            <span style="font-size:0.8rem; font-weight:800; color:${hColor};">${r.hits}</span>
                        </div>`;
                    }).join('')}
                </div>
                <div style="margin-top:6px; font-size:0.68rem; color:#64748b;">
                    Melhor: <span style="color:#22C55E; font-weight:700;">${analysis.backtestResult.bestHit} acertos</span> •
                    Taxa vitória: <span style="color:#6366f1; font-weight:700;">${analysis.backtestResult.winRate}%</span> •
                    Melhoria vs acaso: <span style="color:${parseFloat(analysis.backtestResult.improvement) >= 1 ? '#22C55E' : '#EF4444'}; font-weight:700;">${analysis.backtestResult.improvement}x</span>
                </div>
            </div>
        </div>`;
    },

    _renderMetricCard(label, value, sub, color) {
        return `<div style="background:rgba(255,255,255,0.04); border:1px solid ${color}30; border-radius:8px; padding:8px; text-align:center;">
            <div style="font-size:0.6rem; color:#94a3b8; margin-bottom:2px;">${label}</div>
            <div style="font-size:1.1rem; font-weight:900; color:${color};">${value}</div>
            <div style="font-size:0.6rem; color:#64748b;">${sub}</div>
        </div>`;
    },

    // ── helpers ──────────────────────────────────────────────────────
    _isFibonacci(n) {
        const fibs = new Set([1,2,3,5,8,13,21,34,55,89]);
        return fibs.has(n);
    },

    _isPrime(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    }
};

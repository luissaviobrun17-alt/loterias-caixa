/**
 * DIAGNÓSTICO REAL DO MOTOR QUANTUM L99
 * =======================================
 * Este script prova matematicamente onde o motor falha.
 * Execute no console do navegador com a aplicação aberta.
 * 
 * TESTES:
 * 1. Correlação entre camadas (são independentes ou redundantes?)
 * 2. Entropia da seleção (diversidade real vs aparente)
 * 3. Cobertura vs Volume (escala ou trava?)
 * 4. Comparação com aleatório puro (motor é melhor ou igual?)
 */

(function() {
    console.clear();
    console.log('%c═══ DIAGNÓSTICO REAL DO MOTOR — SEM MAQUIAGEM ═══', 
        'color: red; font-size: 18px; font-weight: bold;');

    const gameKey = 'megasena';
    const profile = NovaEraEngine.getProfile(gameKey);
    const startNum = profile.range[0];
    const endNum = profile.range[1];
    const totalRange = endNum - startNum + 1;
    const drawSize = profile.drawSize;

    // Carregar histórico
    let history = [];
    try {
        if (typeof StatsService !== 'undefined') {
            history = StatsService.getRecentResults(gameKey, 200) || [];
        }
        if (history.length === 0 && typeof REAL_HISTORY_DB !== 'undefined') {
            history = REAL_HISTORY_DB[gameKey] || [];
        }
    } catch(e) {}

    const N = history.length;
    if (N < 10) {
        console.error('❌ Histórico insuficiente (' + N + ' sorteios). Abra a aplicação primeiro.');
        return;
    }

    console.log('📊 Histórico: ' + N + ' sorteios | Loteria: Mega Sena (6/60)');
    console.log('');

    // ═══════════════════════════════════════════════════════
    // TESTE 1: CORRELAÇÃO ENTRE CAMADAS
    // Se as camadas são independentes, correlação deve ser <0.3
    // Se são redundantes, correlação será >0.7
    // ═══════════════════════════════════════════════════════
    console.log('%c══ TESTE 1: AS 18 CAMADAS SÃO INDEPENDENTES? ══', 'color: orange; font-weight: bold;');

    const layers = {
        'Frequência': NovaEraEngine._layerFrequency(history, startNum, endNum, N),
        'Tendência': NovaEraEngine._layerTrend(history, startNum, endNum, N),
        'Atraso': NovaEraEngine._layerDelay(history, startNum, endNum, N, drawSize, totalRange),
        'Entropia': NovaEraEngine._layerEntropy(history, startNum, endNum, N, profile),
        'Markov': NovaEraEngine._layerMarkov(history, startNum, endNum, N),
        'Fase': NovaEraEngine._layerPhase(history, startNum, endNum, N),
        'Clairvoyance': NovaEraEngine._layerClairvoyance(history, startNum, endNum, N, drawSize),
        'NextDraw': NovaEraEngine._layerNextDraw(gameKey, history, startNum, endNum, N, profile),
        'Bayesian': NovaEraEngine._godBayesian(history, startNum, endNum, N, drawSize),
        'Posicional': NovaEraEngine._godPositional(history, startNum, endNum, N, drawSize),
        'Sequencial': NovaEraEngine._godSequentialChain(history, startNum, endNum, N),
        'Momentum': NovaEraEngine._godMomentum(history, startNum, endNum, N, drawSize),
        'Espelho': NovaEraEngine._quantumTemporalMirror(history, startNum, endNum, N, drawSize),
        'Lacunas': NovaEraEngine._quantumGapAnalysis(history, startNum, endNum, N, drawSize, totalRange),
        'Clusters': NovaEraEngine._quantumClusters(history, startNum, endNum, N, drawSize),
        'Regressão': NovaEraEngine._quantumMeanReversion(history, startNum, endNum, N, drawSize, totalRange)
    };

    // Função para calcular correlação de Pearson
    function pearsonCorrelation(a, b) {
        const keys = Object.keys(a).filter(k => b[k] !== undefined);
        const n = keys.length;
        if (n < 3) return 0;
        
        let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
        for (const k of keys) {
            sumA += a[k]; sumB += b[k];
            sumAB += a[k] * b[k];
            sumA2 += a[k] * a[k];
            sumB2 += b[k] * b[k];
        }
        const num = n * sumAB - sumA * sumB;
        const den = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
        return den === 0 ? 0 : num / den;
    }

    const layerNames = Object.keys(layers);
    const highCorrelations = [];
    let totalCorrelation = 0;
    let pairCount = 0;

    for (let i = 0; i < layerNames.length; i++) {
        for (let j = i + 1; j < layerNames.length; j++) {
            const corr = pearsonCorrelation(layers[layerNames[i]], layers[layerNames[j]]);
            totalCorrelation += Math.abs(corr);
            pairCount++;
            if (Math.abs(corr) > 0.5) {
                highCorrelations.push({
                    par: layerNames[i] + ' ↔ ' + layerNames[j],
                    correlacao: corr.toFixed(3)
                });
            }
        }
    }

    const avgCorrelation = totalCorrelation / pairCount;
    console.log('Correlação média entre camadas: ' + avgCorrelation.toFixed(3));
    if (avgCorrelation > 0.4) {
        console.log('%c⚠ PROBLEMA: Correlação alta = camadas REDUNDANTES (medem a mesma coisa)', 'color: red;');
    } else {
        console.log('%c✓ Camadas parecem independentes', 'color: green;');
    }

    if (highCorrelations.length > 0) {
        console.log('Pares com correlação > 0.5 (REDUNDANTES):');
        console.table(highCorrelations);
    }

    // ═══════════════════════════════════════════════════════
    // TESTE 2: TOP 10 DE CADA CAMADA — CONCORDAM OU DIVERGEM?
    // ═══════════════════════════════════════════════════════
    console.log('');
    console.log('%c══ TESTE 2: TOP 10 NÚMEROS DE CADA CAMADA ══', 'color: orange; font-weight: bold;');

    const topSets = {};
    for (const [name, scores] of Object.entries(layers)) {
        const ranked = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(e => parseInt(e[0]));
        topSets[name] = new Set(ranked);
    }

    // Contar quantas camadas colocam cada número no top 10
    const numVotes = {};
    for (let n = startNum; n <= endNum; n++) numVotes[n] = 0;
    for (const [name, topSet] of Object.entries(topSets)) {
        for (const n of topSet) numVotes[n]++;
    }

    const consensusNums = Object.entries(numVotes)
        .filter(([n, v]) => v >= 8)
        .sort((a, b) => b[1] - a[1])
        .map(([n, v]) => ({ numero: parseInt(n), votos: v + '/16' }));

    const disagreementNums = Object.entries(numVotes)
        .filter(([n, v]) => v >= 1 && v <= 3)
        .length;

    console.log('Números no top-10 de 8+ camadas (CONSENSO ALTO):');
    console.table(consensusNums);
    console.log('Números no top-10 de apenas 1-3 camadas: ' + disagreementNums + '/60');
    
    if (consensusNums.length > 15) {
        console.log('%c⚠ PROBLEMA: Muitas camadas concordam nos mesmos números — camadas são CÓPIAS', 'color: red;');
    }

    // ═══════════════════════════════════════════════════════
    // TESTE 3: COBERTURA vs VOLUME
    // ═══════════════════════════════════════════════════════
    console.log('');
    console.log('%c══ TESTE 3: COBERTURA ESCALA COM VOLUME? ══', 'color: orange; font-weight: bold;');

    const volumes = [10, 50, 100, 500, 1000];
    const coverageResults = [];

    for (const vol of volumes) {
        const result = NovaEraEngine.generate(gameKey, vol, null, [], null);
        const uniqueNums = new Set(result.games.flat());
        const coverage = Math.round(uniqueNums.size / totalRange * 100);
        
        // Calcular overlap médio entre jogos
        let totalOverlap = 0;
        let overlapCount = 0;
        const gameSets = result.games.slice(0, Math.min(50, result.games.length)).map(g => new Set(g));
        for (let i = 0; i < gameSets.length; i++) {
            for (let j = i + 1; j < Math.min(i + 5, gameSets.length); j++) {
                let overlap = 0;
                for (const n of gameSets[i]) if (gameSets[j].has(n)) overlap++;
                totalOverlap += overlap;
                overlapCount++;
            }
        }
        const avgOverlap = overlapCount > 0 ? (totalOverlap / overlapCount).toFixed(1) : 'N/A';

        // Calcular entropia de Shannon
        const freq = {};
        for (const g of result.games) {
            for (const n of g) freq[n] = (freq[n] || 0) + 1;
        }
        const totalSelections = result.games.length * drawSize;
        let entropy = 0;
        for (const f of Object.values(freq)) {
            const p = f / totalSelections;
            if (p > 0) entropy -= p * Math.log2(p);
        }
        const maxEntropy = Math.log2(totalRange);
        const entropyPct = Math.round(entropy / maxEntropy * 100);

        coverageResults.push({
            jogos: vol,
            cobertura: coverage + '%',
            numsUsados: uniqueNums.size + '/' + totalRange,
            overlapMedio: avgOverlap + '/' + drawSize,
            entropia: entropyPct + '% (max=100%)',
            gerados: result.games.length
        });
    }

    console.table(coverageResults);
    
    const cov10 = parseInt(coverageResults[0].cobertura);
    const cov1000 = parseInt(coverageResults[4].cobertura);
    if (cov1000 - cov10 < 30) {
        console.log('%c⚠ PROBLEMA GRAVE: 1000 jogos tem cobertura quase igual a 10 jogos! Motor está TRAVADO.', 'color: red; font-weight: bold;');
    }

    // ═══════════════════════════════════════════════════════
    // TESTE 4: MOTOR vs ALEATÓRIO PURO — BACKTESTING
    // ═══════════════════════════════════════════════════════
    console.log('');
    console.log('%c══ TESTE 4: MOTOR É MELHOR QUE ALEATÓRIO? ══', 'color: orange; font-weight: bold;');

    // Gerar 100 jogos com motor
    const motorResult = NovaEraEngine.generate(gameKey, 100, null, [], null);
    const motorGames = motorResult.games;

    // Gerar 100 jogos ALEATÓRIOS puros
    const randomGames = [];
    for (let i = 0; i < 100; i++) {
        const nums = [];
        while (nums.length < drawSize) {
            const n = Math.floor(Math.random() * totalRange) + startNum;
            if (!nums.includes(n)) nums.push(n);
        }
        randomGames.push(nums.sort((a, b) => a - b));
    }

    // Testar ambos contra os últimos 20 sorteios
    const testDraws = Math.min(20, N);
    let motorTotal3 = 0, motorTotal4 = 0, motorAvgBest = 0;
    let randomTotal3 = 0, randomTotal4 = 0, randomAvgBest = 0;

    for (let t = 0; t < testDraws; t++) {
        const drawn = new Set((history[t].numbers || []).concat(history[t].numbers2 || []));
        
        let motorBest = 0, randomBest = 0;
        
        for (const g of motorGames) {
            let hits = 0;
            for (const n of g) if (drawn.has(n)) hits++;
            if (hits > motorBest) motorBest = hits;
        }
        
        for (const g of randomGames) {
            let hits = 0;
            for (const n of g) if (drawn.has(n)) hits++;
            if (hits > randomBest) randomBest = hits;
        }
        
        motorAvgBest += motorBest;
        randomAvgBest += randomBest;
        if (motorBest >= 3) motorTotal3++;
        if (motorBest >= 4) motorTotal4++;
        if (randomBest >= 3) randomTotal3++;
        if (randomBest >= 4) randomTotal4++;
    }

    console.table([
        { metodo: 'MOTOR QUANTUM L99', mediaAcertos: (motorAvgBest/testDraws).toFixed(2), taxa3plus: motorTotal3 + '/' + testDraws, taxa4plus: motorTotal4 + '/' + testDraws },
        { metodo: 'ALEATÓRIO PURO', mediaAcertos: (randomAvgBest/testDraws).toFixed(2), taxa3plus: randomTotal3 + '/' + testDraws, taxa4plus: randomTotal4 + '/' + testDraws }
    ]);

    const motorAvg = motorAvgBest / testDraws;
    const randomAvg = randomAvgBest / testDraws;
    const improvement = ((motorAvg - randomAvg) / randomAvg * 100).toFixed(1);
    
    if (motorAvg > randomAvg * 1.3) {
        console.log('%c✓ Motor é ' + improvement + '% melhor que aleatório — há valor real', 'color: green; font-weight: bold;');
    } else if (motorAvg > randomAvg * 1.1) {
        console.log('%c⚠ Motor é apenas ' + improvement + '% melhor que aleatório — melhoria marginal', 'color: orange; font-weight: bold;');
    } else {
        console.log('%c❌ Motor NÃO é significativamente melhor que aleatório (' + improvement + '%) — PROBLEMA GRAVE', 'color: red; font-weight: bold;');
    }

    console.log('');
    console.log('%c═══ FIM DO DIAGNÓSTICO ═══', 'color: red; font-size: 16px; font-weight: bold;');
})();

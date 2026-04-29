/**
 * TESTE COMPLETO DE ASSERTIVIDADE — TODAS AS LOTERIAS
 * Gera 100 jogos para cada loteria e mede acertos contra os últimos 10 sorteios
 */

// Simular ambiente browser
global.window = global;
global.console = console;

// Carregar dependências
const fs = require('fs');
let gamesCode = fs.readFileSync('./js/engines/games.js', 'utf8');
gamesCode = gamesCode.replace('const GAMES', 'var GAMES');
eval(gamesCode);
let statsCode = fs.readFileSync('./js/stats.js', 'utf8');
statsCode = statsCode.replace('class StatsService', 'var StatsService; StatsService = class StatsService');
eval(statsCode);
try { 
    let precCode = fs.readFileSync('./js/engines/precision_calibrator.js', 'utf8');
    precCode = precCode.replace('class PrecisionCalibrator', 'var PrecisionCalibrator; PrecisionCalibrator = class PrecisionCalibrator');
    eval(precCode);
} catch(e) { console.log('PrecisionCalibrator não encontrado'); }
let neCode = fs.readFileSync('./js/engines/nova_era_engine.js', 'utf8');
neCode = neCode.replace('class NovaEraEngine', 'var NovaEraEngine; NovaEraEngine = class NovaEraEngine');
eval(neCode);

const loterias = ['megasena', 'lotofacil', 'quina', 'duplasena', 'lotomania', 'timemania', 'diadesorte'];

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  🔬 TESTE COMPLETO DE ASSERTIVIDADE — QUANTUM L99 v7.1');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

for (const gameKey of loterias) {
    const profile = NovaEraEngine.getProfile(gameKey);
    const game = GAMES[gameKey];
    if (!game) { console.log('❌ ' + gameKey + ': GAMES não encontrado'); continue; }

    const drawSize = game.minBet || profile.drawSize;
    const totalRange = profile.range[1] - profile.range[0] + 1;
    const lotteryDraw = profile.lotteryDraw;

    // Gerar 100 jogos
    const startTime = Date.now();
    let result;
    try {
        result = NovaEraEngine.generate(gameKey, 100, [], [], null);
    } catch(e) {
        console.log('❌ ' + profile.name + ': ERRO na geração — ' + e.message);
        continue;
    }
    const elapsed = Date.now() - startTime;

    if (!result || !result.games || result.games.length === 0) {
        console.log('❌ ' + profile.name + ': 0 jogos gerados!');
        continue;
    }

    // Métricas
    const games = result.games;
    const analysis = result.analysis || {};

    // Conferir contra últimos 10 sorteios
    let history = [];
    try {
        history = StatsService.getRecentResults(gameKey, 20) || [];
        if (history.length === 0 && typeof REAL_HISTORY_DB !== 'undefined') {
            history = REAL_HISTORY_DB[gameKey] || [];
        }
    } catch(e) {}

    const btCount = Math.min(10, history.length);
    let totalBestHits = 0;
    const hitCounts = {};
    
    for (let t = 0; t < btCount; t++) {
        const drawn = new Set((history[t].numbers || []).concat(history[t].numbers2 || []));
        let bestHits = 0;
        for (const g of games) {
            let hits = 0;
            for (const n of g) { if (drawn.has(n)) hits++; }
            if (hits > bestHits) bestHits = hits;
        }
        totalBestHits += bestHits;
        hitCounts[bestHits] = (hitCounts[bestHits] || 0) + 1;
    }

    const avgBest = btCount > 0 ? (totalBestHits / btCount).toFixed(1) : '?';
    const actualDrawnSize = gameKey === 'duplasena' ? lotteryDraw * 2 : lotteryDraw;
    const expectedRandom = (drawSize * actualDrawnSize / totalRange).toFixed(1);
    const improvement = btCount > 0 ? ((totalBestHits / btCount) / (drawSize * actualDrawnSize / totalRange) * 100 - 100).toFixed(0) : '?';

    // Formatar distribuição
    const hitStr = Object.entries(hitCounts)
        .sort((a,b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([h, c]) => h + 'ac=' + c + 'x')
        .join(', ');

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎰 ' + profile.name.toUpperCase() + ' (' + drawSize + '/' + totalRange + ')');
    console.log('   Jogos: ' + games.length + '/100 | Tempo: ' + elapsed + 'ms');
    console.log('   Conferência (' + btCount + ' sorteios):');
    console.log('     Melhor acerto médio: ' + avgBest + ' | Esperado acaso: ' + expectedRandom);
    console.log('     Melhoria vs acaso: +' + improvement + '%');
    console.log('     Distribuição: ' + hitStr);
    console.log('     Confiança: ' + (analysis.confidence || '?') + '%');
    console.log('     Cobertura: ' + (analysis.coveragePct || '?') + '% do range');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  ✅ TESTE COMPLETO FINALIZADO');
console.log('═══════════════════════════════════════════════════════════════');

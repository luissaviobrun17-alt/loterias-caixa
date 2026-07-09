const fs = require('fs');

// Simular ambiente browser
global.window = global;
global.console = console;

let gamesCode = fs.readFileSync('./js/engines/games.js', 'utf8');
gamesCode = gamesCode.replace('const GAMES', 'var GAMES');
eval(gamesCode);

let histCode = fs.readFileSync('./js/data/history_db.js', 'utf8');
let histWrapped = histCode.replace('const REAL_HISTORY_DB =', 'global.REAL_HISTORY_DB =');
eval(histWrapped);

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

let peCode = fs.readFileSync('./js/engines/precision_engine.js', 'utf8');
peCode = peCode.replace('class PrecisionEngine', 'var PrecisionEngine; PrecisionEngine = class PrecisionEngine');
eval(peCode);

let sbCode = fs.readFileSync('./js/engines/smart_bets.js', 'utf8');
sbCode = sbCode.replace('class SmartBetsEngine', 'var SmartBetsEngine; SmartBetsEngine = class SmartBetsEngine');
eval(sbCode);

console.log('--- TESTE WALK-FORWARD REAL (TIMEMANIA) ---');

const gameKey = 'timemania';
const fullHistory = REAL_HISTORY_DB[gameKey] || [];
const drawSize = 10;
const lotteryDraw = 7;
const totalRange = 80;

// Vamos testar 15 concursos da base (da posição 0 à posição 14)
// Para cada um, escondemos a posição i e anteriores, geramos previsões, e conferimos com a posição i.
const testCount = 15;
const volume = 100; // 100 jogos por concurso

let grandTotalHits = 0;
let grandTotalBestHits = 0;
let totalGamesTested = 0;
let hitDistribution = {};

console.log(`Rodando walk-forward em ${testCount} concursos com ${volume} jogos por concurso...`);

for (let i = 0; i < testCount; i++) {
    const targetDraw = fullHistory[i];
    const trainingHistory = fullHistory.slice(i + 1); // Esconder concurso i e futuros
    
    if (trainingHistory.length < 10) {
        console.log(`Histórico insuficiente para testar índice ${i}`);
        continue;
    }
    
    // Substituir temporariamente a base do StatsService ou mockar getRecentResults
    StatsService.getRecentResults = (key, limit) => {
        return trainingHistory.slice(0, limit);
    };
    
    const startTime = Date.now();
    let result;
    try {
        result = SmartBetsEngine.generate(gameKey, volume, [], [], drawSize);
    } catch(e) {
        console.log(`Erro no concurso index ${i}:`, e.message);
        continue;
    }
    
    const drawn = new Set(targetDraw.numbers || []);
    let bestHits = 0;
    let hitsSum = 0;
    
    for (const g of result.games) {
        let hits = 0;
        for (const n of g) {
            if (drawn.has(n)) hits++;
        }
        hitsSum += hits;
        if (hits > bestHits) bestHits = hits;
        hitDistribution[hits] = (hitDistribution[hits] || 0) + 1;
    }
    
    const avgHits = hitsSum / result.games.length;
    grandTotalHits += avgHits;
    grandTotalBestHits += bestHits;
    totalGamesTested += result.games.length;
    
    console.log(`Concurso index ${i} (Sorteio ${targetDraw.drawNumber}): melhor=${bestHits} | média=${avgHits.toFixed(3)} | gerado em ${Date.now() - startTime}ms`);
}

const avgBestOverall = (grandTotalBestHits / testCount).toFixed(2);
const avgHitsOverall = (grandTotalHits / testCount).toFixed(3);
const expectedRandom = (drawSize * lotteryDraw / totalRange).toFixed(3); // 0.875
const improvementAvg = ((avgHitsOverall / expectedRandom) * 100 - 100).toFixed(1);

console.log(`\n=== RESULTADO FINAL WALK-FORWARD ===`);
console.log(`Média do melhor jogo: ${avgBestOverall} (esperado aleatório melhor ~2.5)`);
console.log(`Média geral de acertos: ${avgHitsOverall} (Acaso: ${expectedRandom}) | Melhoria real vs Acaso: ${improvementAvg}%`);
console.log(`Distribuição de acertos detalhada:`);
Object.keys(hitDistribution).sort((a,b) => b-a).forEach(h => {
    const pct = (hitDistribution[h] / totalGamesTested * 100).toFixed(3);
    console.log(`  ${h} dezenas: ${hitDistribution[h]} vezes (${pct}%)`);
});

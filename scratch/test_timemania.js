// Simular ambiente browser
global.window = global;
global.console = console;

const fs = require('fs');

// Carregar dependências
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

console.log('--- TESTE TIMEMANIA ---');

const gameKey = 'timemania';
const profile = NovaEraEngine.getProfile(gameKey);
const game = GAMES[gameKey];
const drawSize = 10;
const lotteryDraw = 7;
const totalRange = 80;

// Vamos testar gerar 1000 jogos e 10000 jogos
const volumes = [100, 1000, 10000];

for (const vol of volumes) {
    console.log(`\n=== TESTANDO VOLUME: ${vol} JOGOS ===`);
    const startTime = Date.now();
    let result;
    try {
        result = SmartBetsEngine.generate(gameKey, vol, [], [], drawSize);
    } catch(e) {
        console.log('Erro na geração:', e.message);
        continue;
    }
    const elapsed = Date.now() - startTime;
    console.log(`Geração concluída em ${elapsed}ms. Total jogos gerados: ${result.games.length}`);

    // Pegar histórico para conferência
    const history = REAL_HISTORY_DB[gameKey] || [];
    console.log(`Conferindo contra os últimos 15 concursos da base...`);

    const btCount = Math.min(15, history.length);
    let totalBestHits = 0;
    let totalHits = 0;
    let hitDistribution = {};

    for (let t = 0; t < btCount; t++) {
        const drawn = new Set(history[t].numbers || []);
        let bestHits = 0;
        let hitsForDraw = 0;

        for (const g of result.games) {
            let hits = 0;
            for (const n of g) {
                if (drawn.has(n)) hits++;
            }
            hitsForDraw += hits;
            if (hits > bestHits) bestHits = hits;
            hitDistribution[hits] = (hitDistribution[hits] || 0) + 1;
        }
        totalBestHits += bestHits;
        totalHits += hitsForDraw / result.games.length;
    }

    const avgBest = (totalBestHits / btCount).toFixed(2);
    const avgHits = (totalHits / btCount).toFixed(2);
    const expectedRandom = (drawSize * lotteryDraw / totalRange).toFixed(2); // 10 * 7 / 80 = 0.875
    const improvementBest = ((avgBest / expectedRandom) * 100 - 100).toFixed(1);
    const improvementAvg = ((avgHits / expectedRandom) * 100 - 100).toFixed(1);

    console.log(`Média do melhor jogo em cada sorteio: ${avgBest} (Acaso: ${expectedRandom}) | Melhoria: ${improvementBest}%`);
    console.log(`Média geral de acertos de todos os jogos: ${avgHits} (Acaso: ${expectedRandom}) | Melhoria: ${improvementAvg}%`);
    console.log(`Distribuição de acertos total em todos os jogos conferidos:`);
    Object.keys(hitDistribution).sort((a,b) => b-a).forEach(h => {
        const pct = (hitDistribution[h] / (result.games.length * btCount) * 100).toFixed(3);
        console.log(`  ${h} acertos: ${hitDistribution[h]} vezes (${pct}%)`);
    });
}

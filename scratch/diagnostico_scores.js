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

let neCode = fs.readFileSync('./js/engines/nova_era_engine.js', 'utf8');
neCode = neCode.replace('class NovaEraEngine', 'var NovaEraEngine; NovaEraEngine = class NovaEraEngine');
eval(neCode);

const gameKey = 'timemania';
const profile = NovaEraEngine.getProfile(gameKey);
const history = REAL_HISTORY_DB[gameKey] || [];
const startNum = 1;
const endNum = 80;
const totalRange = 80;

console.log('--- DIAGNÓSTICO DE SCORES POR CAMADA (TIMEMANIA) ---');

// Vamos calcular os scores de cada camada individualmente
const layerFreq = NovaEraEngine._layerFrequency(history, startNum, endNum, history.length);
const layerTrend = NovaEraEngine._layerTrend(history, startNum, endNum, history.length);
const layerDelay = NovaEraEngine._layerDelay(history, startNum, endNum, history.length, profile.drawSize, totalRange);
const layerEntropy = NovaEraEngine._layerEntropy(history, startNum, endNum, history.length, profile);
const layerMarkov = NovaEraEngine._layerMarkov(history, startNum, endNum, history.length);
const layerPhase = NovaEraEngine._layerPhase(history, startNum, endNum, history.length);

console.log('\nTop 10 Frequência:');
printTop(layerFreq);

console.log('\nTop 10 Tendência:');
printTop(layerTrend);

console.log('\nTop 10 Atraso:');
printTop(layerDelay);

console.log('\nTop 10 Entropia Espacial:');
printTop(layerEntropy);

console.log('\nTop 10 Transição Markov:');
printTop(layerMarkov);

console.log('\nTop 10 Ressonância de Fase:');
printTop(layerPhase);

// Calcular Consenso do NovaEra
const finalScores = NovaEraEngine._scoreAllNumbers(gameKey, profile, history, startNum, endNum, totalRange);
console.log('\nTop 15 Consenso Final NovaEra:');
printTop(finalScores, 15);

function printTop(scores, count = 10) {
    const list = [];
    for (let n = startNum; n <= endNum; n++) {
        list.push({ n: n, val: scores[n] });
    }
    list.sort((a,b) => b.val - a.val);
    const output = list.slice(0, count).map(x => `${x.n}(${x.val.toFixed(3)})`).join(', ');
    console.log(output);
}

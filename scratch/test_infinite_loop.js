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

let peCode = fs.readFileSync('./js/engines/precision_engine.js', 'utf8');

// Vamos ler precision_engine.js e adicionar console.log no loop de geração para ver se ele trava lá
console.log('Modificando PrecisionEngine para debug...');
peCode = peCode.replace('class PrecisionEngine', 'var PrecisionEngine; PrecisionEngine = class PrecisionEngine');

// Injetar logs no loop de geração do PrecisionEngine
peCode = peCode.replace(
    'while (games.length < numGames && failStreak < 500000) {',
    'let loopCount = 0;\n        while (games.length < numGames && failStreak < 500000) {\n            loopCount++;\n            if (loopCount % 50 === 0) console.log(`Loop: games=${games.length}/${numGames}, failStreak=${failStreak}`);'
);

eval(peCode);

console.log('Rodando PrecisionEngine.generate para timemania (5 jogos)...');
try {
    const res = PrecisionEngine.generate('timemania', 5, [], [], 10);
    console.log('Sucesso! Gerou', res.games.length, 'jogos');
} catch(e) {
    console.log('Erro:', e.message, e.stack);
}

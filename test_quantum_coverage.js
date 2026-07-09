// Simular ambiente browser
global.window = global;
global.console = console;

const fs = require('fs');
const vm = require('vm');

console.log('Loading and concatenating engines...');
const files = [
    './js/engines/games.js',
    './js/data/history_db.js',
    './js/stats.js',
    './js/engines/nova_era_engine.js',
    './js/engines/coverage_engine.js',
    './js/engines/smart_coverage_engine.js'
];

try {
    let concatenatedCode = files.map(f => fs.readFileSync(f, 'utf8')).join('\n;\n');
    
    // Expor variáveis chaves para o objeto global
    concatenatedCode = concatenatedCode.replace('const REAL_HISTORY_DB =', 'global.REAL_HISTORY_DB =');
    concatenatedCode = concatenatedCode.replace('class NovaEraEngine', 'global.NovaEraEngine = class NovaEraEngine');
    concatenatedCode = concatenatedCode.replace('class StatsService', 'global.StatsService = class StatsService');
    concatenatedCode = concatenatedCode.replace('class CoverageEngine', 'global.CoverageEngine = class CoverageEngine');
    concatenatedCode = concatenatedCode.replace('class SmartCoverageEngine', 'global.SmartCoverageEngine = class SmartCoverageEngine');
    
    vm.runInThisContext(concatenatedCode, { filename: 'concatenated_engines.js' });
    console.log('Engines loaded successfully!');
} catch (e) {
    console.error('Erro ao carregar os motores:', e);
    process.exit(1);
}

const loterias = ['megasena', 'lotofacil', 'quina', 'duplasena', 'lotomania', 'timemania', 'diadesorte'];

for (const gameKey of loterias) {
    console.log(`\n==================================================`);
    console.log(`TESTANDO LOTERIA: ${gameKey.toUpperCase()}`);
    console.log(`==================================================`);
    
    const profile = NovaEraEngine.getProfile(gameKey);
    const startNum = profile.range[0];
    const endNum = profile.range[1];
    const totalRange = endNum - startNum + 1;
    const drawSize = profile.drawSize;
    
    const history = global.REAL_HISTORY_DB[gameKey] || [];
    const scores = NovaEraEngine._scoreAllNumbers(gameKey, profile, history, startNum, endNum, totalRange);
    
    const ranked = [];
    for (let n = startNum; n <= endNum; n++) {
        ranked.push({ num: n, score: scores[n] || 0 });
    }
    ranked.sort((a, b) => b.score - a.score);
    
    const topHot = ranked.slice(0, drawSize).map(r => r.num).sort((a,b) => a-b);
    console.log(`Top ${drawSize} Números Quentes (IA):`, topHot.join(', '));
    
    // Gerar 10 jogos
    console.log(`Gerando 10 jogos de cobertura para ${gameKey}...`);
    const start = Date.now();
    const result = SmartCoverageEngine.generate(gameKey, 10, null, [], drawSize);
    const elapsed = Date.now() - start;
    
    console.log(`Tempo de processamento: ${elapsed}ms`);
    console.log(`Jogos gerados:`);
    
    const games = result.games;
    for (let i = 0; i < Math.min(5, games.length); i++) {
        console.log(`Jogo ${i + 1}: ${games[i].join(', ')}`);
    }
    if (games.length > 5) {
        console.log(`... e mais ${games.length - 5} jogos`);
    }
    
    // Verificações
    const firstGame = games[0].slice().sort((a,b) => a-b);
    const firstGameMatchesHot = firstGame.every((val, idx) => val === topHot[idx]);
    
    console.log(`\nVerificações:`);
    console.log(`- Jogo 1 é exatamente o Top ${drawSize} quente: ${firstGameMatchesHot ? 'PASSOOU ✓' : 'FALHOU (Filtros Estruturais aplicados)'}`);
    
    // Verificar duplicatas
    const keys = new Set(games.map(g => g.join(',')));
    console.log(`- Sem jogos duplicados: ${keys.size === games.length ? 'PASSOOU ✓' : 'FALHOU ❌'}`);
}

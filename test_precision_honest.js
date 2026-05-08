// Test script: roda PrecisionEngine no Node para verificar se os números mudaram
// Simula o ambiente do browser minimamente

// 1. Carregar history_db (define REAL_HISTORY_DB global)
const fs = require('fs');
const histCode = fs.readFileSync('./js/data/history_db.js', 'utf-8');
const histWrapped = histCode.replace('const REAL_HISTORY_DB =', 'global.REAL_HISTORY_DB =');
eval(histWrapped);

// 2. Stub de StatsService (retorna do REAL_HISTORY_DB)
global.StatsService = {
    getRecentResults: (gameKey, count) => {
        return (REAL_HISTORY_DB[gameKey] || []).slice(0, count);
    }
};

// 3. Carregar PrecisionCalibrator
const calibCode = fs.readFileSync('./js/engines/precision_calibrator.js', 'utf-8');
// No Node, const PrecisionCalibrator = {} nao vaza para global, entao forçar
const calibWrapped = calibCode.replace('const PrecisionCalibrator =', 'global.PrecisionCalibrator =');
eval(calibWrapped);

// 4. Carregar PrecisionEngine (sem NovaEra/QuantumGod para teste isolado)
const peCode = fs.readFileSync('./js/engines/precision_engine.js', 'utf-8');
// class PrecisionEngine fica scoped no eval, forçar global
const peWrapped = peCode.replace('class PrecisionEngine {', 'global.PrecisionEngine = class PrecisionEngine {');
eval(peWrapped);

// 5. Testar Timemania
console.log('=== TESTE TIMEMANIA - PRECISION ENGINE ===');
console.log('PrecisionCalibrator disponivel:', typeof PrecisionCalibrator !== 'undefined');
console.log('PrecisionCalibrator.scoreTicketPrecision:', typeof PrecisionCalibrator.scoreTicketPrecision);

const result = PrecisionEngine.generate('timemania', 3, [], [], 10);
console.log('\n=== RESULTADO ===');
console.log('Jogo 1:', JSON.stringify(result.games[0]));
if (result.games[1]) console.log('Jogo 2:', JSON.stringify(result.games[1]));
if (result.games[2]) console.log('Jogo 3:', JSON.stringify(result.games[2]));
console.log('Confianca:', result.analysis.confidence + '%');
console.log('Engine:', result.analysis.engine);
console.log('Tempo:', result.analysis.elapsedMs + 'ms');

// 6. Comparar com resultado anterior [5, 14, 20, 22, 35, 40, 45, 51, 67, 76]
const anterior = [5, 14, 20, 22, 35, 40, 45, 51, 67, 76];
const novo = result.games[0];
const overlap = novo.filter(n => anterior.includes(n)).length;
const different = novo.filter(n => !anterior.includes(n));
console.log('\n=== COMPARACAO COM ANTERIOR ===');
console.log('Anterior: [' + anterior.join(', ') + ']');
console.log('Novo:     [' + novo.join(', ') + ']');
console.log('Numeros iguais:', overlap + '/10');
console.log('Numeros diferentes:', different.join(', ') || 'NENHUM - SEM MUDANCA!');
console.log('Mudou?', overlap < 10 ? 'SIM (' + (10-overlap) + ' numeros novos)' : 'NAO - IDENTICO');

// 7. Diversidade entre jogos
if (result.games.length >= 2) {
    const g1set = new Set(result.games[0]);
    const g2 = result.games[1];
    const ov12 = g2.filter(n => g1set.has(n)).length;
    console.log('\n=== DIVERSIDADE ===');
    console.log('Overlap J1-J2:', ov12 + '/10 (' + ((10-ov12)*10) + '% diferentes)');
}

/**
 * TESTE v7.0 — Verificar Timemania contra Concurso 2384
 * Resultado: 14, 26, 29, 47, 66, 74, 79
 * 
 * Roda no Node.js para validar se as correções melhoram a assertividade
 */

// Simular ambiente mínimo
global.window = global;
global.GAMES = {
    timemania: {
        name: 'Timemania',
        minBet: 10,
        maxBet: 10,
        range: [1, 80],
        drawSize: 7
    }
};
global.StatsService = undefined;

// Gerar histórico FAKE mas realístico (últimos 30 sorteios)
// Cada sorteio: 7 números de 1-80
function generateFakeHistory(count) {
    const history = [];
    for (let i = 0; i < count; i++) {
        const nums = [];
        const used = new Set();
        while (nums.length < 7) {
            const n = Math.floor(Math.random() * 80) + 1;
            if (!used.has(n)) { nums.push(n); used.add(n); }
        }
        history.push({ numbers: nums.sort((a, b) => a - b), contest: 2383 - i });
    }
    return history;
}

global.REAL_HISTORY_DB = {
    timemania: generateFakeHistory(200)
};

// Carregar engine
const fs = require('fs');
const engineCode = fs.readFileSync('./js/engines/nova_era_engine.js', 'utf-8');

// Carregar PrecisionCalibrator se existe
try {
    const precCode = fs.readFileSync('./js/engines/precision_calibrator.js', 'utf-8');
    eval(precCode);
} catch(e) { /* sem precision calibrator */ }

eval(engineCode);

// Resultado oficial do concurso 2384
const RESULTADO = [14, 26, 29, 47, 66, 74, 79];
const resultSet = new Set(RESULTADO);

console.log('\n' + '='.repeat(60));
console.log('TESTE QUANTUM L99 v7.0 — TIMEMANIA');
console.log('Resultado Concurso 2384: ' + RESULTADO.join(', '));
console.log('='.repeat(60));

// Testar diferentes volumes
const volumes = [10, 50, 100, 500, 1000];

for (const vol of volumes) {
    const result = NovaEraEngine.generate('timemania', vol, null, [], null);
    const games = result.games;
    
    // Conferir cada jogo
    const hitDist = {};
    let total3plus = 0;
    let bestHits = 0;
    let bestGame = null;
    
    for (const game of games) {
        let hits = 0;
        for (const n of game) {
            if (resultSet.has(n)) hits++;
        }
        hitDist[hits] = (hitDist[hits] || 0) + 1;
        if (hits >= 3) total3plus++;
        if (hits > bestHits) { bestHits = hits; bestGame = game; }
    }
    
    const avgHits = games.reduce((sum, g) => {
        let h = 0;
        for (const n of g) if (resultSet.has(n)) h++;
        return sum + h;
    }, 0) / games.length;
    
    console.log('\n--- ' + vol + ' JOGOS ---');
    console.log('Distribuição de acertos:');
    for (let h = 0; h <= 7; h++) {
        if (hitDist[h]) {
            const pct = (hitDist[h] / games.length * 100).toFixed(1);
            console.log('  ' + h + ' acertos: ' + hitDist[h] + 'x (' + pct + '%)');
        }
    }
    console.log('3+ acertos: ' + total3plus + '/' + games.length + ' (' + (total3plus / games.length * 100).toFixed(1) + '%)');
    console.log('Melhor jogo: ' + (bestGame ? bestGame.join(', ') : 'N/A') + ' → ' + bestHits + ' acertos');
    console.log('Média acertos: ' + avgHits.toFixed(2) + ' (esperado aleatório: 0.875)');
}

console.log('\n' + '='.repeat(60));
console.log('TESTE CONCLUÍDO');
console.log('='.repeat(60));

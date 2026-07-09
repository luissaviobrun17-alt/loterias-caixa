/**
 * ═══════════════════════════════════════════════════════════════
 * TESTE DO MOTOR MEGA SENA v13.0 — Análise por Botão e Volume
 * Executa geração de jogos via cada motor e analisa resultados
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

// ── Setup global browser-like environment ──
global.window = global;
global.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { setAttribute: () => {} }, createElement: () => ({ style: {}, appendChild: () => {}, innerHTML: '' }) };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.fetch = () => Promise.resolve({ ok: false });
global.AbortController = class { constructor() { this.signal = {}; } abort() {} };
global.CustomEvent = class { constructor(t, d) { this.type = t; this.detail = d; } };
global.console.warn = () => {}; // Silenciar warnings para limpar output

const basePath = __dirname;

// ── Carregar arquivos na ordem correta ──
function loadFile(filename) {
    const filePath = path.join(basePath, filename);
    if (!fs.existsSync(filePath)) {
        console.log('⚠️  Arquivo não encontrado: ' + filename);
        return false;
    }
    try {
        const code = fs.readFileSync(filePath, 'utf8');
        eval(code);
        return true;
    } catch (e) {
        console.log('❌ Erro ao carregar ' + filename + ': ' + e.message);
        return false;
    }
}

console.log('═══════════════════════════════════════════════════');
console.log('  TESTE MOTOR MEGA SENA v13.0 — PÓS-CORREÇÕES');
console.log('═══════════════════════════════════════════════════\n');

// Carregar engines
const files = [
    'js/data/history_db.js',
    'js/engines/games.js',
    'js/engines/coverage_engine.js',
    'js/engines/smart_coverage_engine.js',
    'js/engines/motor_fechamento_manual.js'
];

for (const f of files) {
    const ok = loadFile(f);
    if (ok) console.log('✅ ' + f);
}

// Mock StatsService
global.StatsService = {
    historyStore: { megasena: REAL_HISTORY_DB.megasena },
    prizeStore: {},
    getRecentResults: (key, count) => (REAL_HISTORY_DB[key] || []).slice(0, count),
    getStats: () => ({ hot: [], cold: [] })
};

console.log('\n═══════════════════════════════════════════════════');
console.log('  CONFIGURAÇÃO MEGA SENA');
console.log('═══════════════════════════════════════════════════');
const game = GAMES.megasena;
console.log('Range: ' + game.range[0] + '-' + game.range[1]);
console.log('Draw: ' + game.draw + ' | MinBet: ' + game.minBet + ' | Preço: R$' + game.price.toFixed(2));
console.log('Histórico disponível: ' + REAL_HISTORY_DB.megasena.length + ' sorteios');

// ── Função de análise de jogos ──
function analyzeGames(games, label) {
    if (!games || games.length === 0) {
        console.log('  ❌ Nenhum jogo gerado!\n');
        return;
    }

    const numGames = games.length;
    const drawSize = games[0].length;
    
    // 1. Números únicos usados
    const allNums = new Set();
    games.forEach(g => g.forEach(n => allNums.add(n)));
    
    // 2. Frequência de cada número
    const freq = {};
    for (let i = 1; i <= 60; i++) freq[i] = 0;
    games.forEach(g => g.forEach(n => freq[n]++));
    
    // Números NUNCA usados
    const missing = [];
    for (let i = 1; i <= 60; i++) {
        if (freq[i] === 0) missing.push(i);
    }
    
    // 3. Cobertura de pares
    const pairs = new Set();
    games.forEach(g => {
        for (let i = 0; i < g.length; i++)
            for (let j = i + 1; j < g.length; j++)
                pairs.add(g[i] + ',' + g[j]);
    });
    const totalPairs = 60 * 59 / 2; // C(60,2) = 1770
    
    // 4. Cobertura de triplas
    const triples = new Set();
    games.forEach(g => {
        for (let i = 0; i < g.length; i++)
            for (let j = i + 1; j < g.length; j++)
                for (let k = j + 1; k < g.length; k++)
                    triples.add(g[i] + ',' + g[j] + ',' + g[k]);
    });
    const totalTriples = 60 * 59 * 58 / 6; // C(60,3) = 34220
    
    // 5. Hamming distance (diversidade)
    let hammingSum = 0;
    let hammingCount = 0;
    const sampleSize = Math.min(numGames, 100);
    for (let s = 0; s < sampleSize; s++) {
        const i = Math.floor(Math.random() * numGames);
        let j = Math.floor(Math.random() * numGames);
        if (j === i) j = (i + 1) % numGames;
        const setA = new Set(games[i]);
        let diff = 0;
        for (const n of games[j]) { if (!setA.has(n)) diff++; }
        hammingSum += diff;
        hammingCount++;
    }
    const avgHamming = hammingCount > 0 ? (hammingSum / hammingCount).toFixed(1) : 'N/A';
    
    // 6. Simulação contra sorteios reais
    const history = REAL_HISTORY_DB.megasena.slice(0, 15);
    let totalQuadras = 0;
    let totalQuinas = 0;
    let totalSenas = 0;
    
    for (const draw of history) {
        const drawn = new Set(draw.numbers);
        let quadras = 0, quinas = 0, senas = 0;
        for (const jogo of games) {
            let hits = 0;
            for (const n of jogo) { if (drawn.has(n)) hits++; }
            if (hits === 6) senas++;
            else if (hits === 5) quinas++;
            else if (hits === 4) quadras++;
        }
        totalQuadras += quadras;
        totalQuinas += quinas;
        totalSenas += senas;
    }
    
    const avgQuadras = (totalQuadras / history.length).toFixed(1);
    const avgQuinas = (totalQuinas / history.length).toFixed(2);
    
    // Expectativa matemática
    const expectedQuadra = numGames * 0.0004288;
    const expectedQuina = numGames * 0.00000647;
    
    // 7. Distribuição por zona (1-10, 11-20, ..., 51-60)
    const zones = [0, 0, 0, 0, 0, 0];
    games.forEach(g => {
        const zs = new Set();
        g.forEach(n => zs.add(Math.floor((n - 1) / 10)));
        zs.forEach(z => zones[z]++);
    });
    
    // Min/Max frequência
    const freqValues = Object.values(freq).filter(v => v > 0);
    const minFreq = freqValues.length > 0 ? Math.min(...freqValues) : 0;
    const maxFreq = Math.max(...Object.values(freq));
    const ratio = maxFreq > 0 && minFreq > 0 ? (maxFreq / minFreq).toFixed(1) : 'N/A';

    // Output
    console.log('\n┌─────────────────────────────────────────────────');
    console.log('│ ' + label);
    console.log('├─────────────────────────────────────────────────');
    console.log('│ Jogos: ' + numGames + ' × ' + drawSize + ' números');
    console.log('│ Investimento: R$ ' + (numGames * game.price).toFixed(2));
    console.log('├─── COBERTURA ──────────────────────────────────');
    console.log('│ Números únicos: ' + allNums.size + '/60' + (missing.length > 0 ? ' ⚠️  FALTAM: [' + missing.join(', ') + ']' : ' ✅'));
    console.log('│ Pares cobertos: ' + pairs.size + '/' + totalPairs + ' (' + (pairs.size/totalPairs*100).toFixed(1) + '%)');
    console.log('│ Triplas cobertas: ' + triples.size + '/' + totalTriples + ' (' + (triples.size/totalTriples*100).toFixed(1) + '%)');
    console.log('│ Hamming médio: ' + avgHamming + '/' + drawSize);
    console.log('├─── EQUILÍBRIO ─────────────────────────────────');
    console.log('│ Freq mín/máx: ' + minFreq + '/' + maxFreq + ' (razão: ' + ratio + 'x)');
    console.log('│ Zonas: [' + zones.map((z,i) => (i*10+1) + '-' + (i*10+10) + ':' + z).join(', ') + ']');
    console.log('├─── SIMULAÇÃO vs 15 SORTEIOS REAIS ────────────');
    console.log('│ Quadras/sorteio: ' + avgQuadras + ' (esperado: ' + expectedQuadra.toFixed(1) + ')');
    console.log('│ Quinas/sorteio: ' + avgQuinas + ' (esperado: ' + expectedQuina.toFixed(3) + ')');
    console.log('│ Eficiência: ' + (avgQuadras / expectedQuadra * 100).toFixed(0) + '% da expectativa');
    console.log('└─────────────────────────────────────────────────');
}

// ══════════════════════════════════════════════════════
//  TESTE 1: BOTÃO 📐 COBERTURA IA (SmartCoverageEngine)
// ══════════════════════════════════════════════════════
console.log('\n\n══════════════════════════════════════════════════');
console.log('  BOTÃO 📐 COBERTURA IA (SmartCoverageEngine)');
console.log('══════════════════════════════════════════════════');

const quantities = [10, 100, 1000, 10000];

for (const qty of quantities) {
    try {
        const result = SmartCoverageEngine.generate('megasena', qty, [], [], 6, {});
        analyzeGames(result.games, '📐 COBERTURA IA — ' + qty + ' jogos (strategy: ' + (result.analysis?.strategy || '?') + ')');
    } catch (e) {
        console.log('\n❌ ERRO em ' + qty + ' jogos: ' + e.message);
    }
}

// ══════════════════════════════════════════════════════
//  TESTE 2: COMPARAÇÃO COM POOL AMPUTADO (simulação v12)
// ══════════════════════════════════════════════════════
console.log('\n\n══════════════════════════════════════════════════');
console.log('  COMPARAÇÃO: Pool Completo vs Pool Amputado');
console.log('══════════════════════════════════════════════════');

// Simular pool amputado (como era antes do fix)
try {
    // Pool amputado: top 25 por frequência nos últimos 15 sorteios
    const hist = REAL_HISTORY_DB.megasena.slice(0, 15);
    const freq = {};
    for (let i = 1; i <= 60; i++) freq[i] = 0;
    hist.forEach(d => d.numbers.forEach(n => freq[n]++));
    const sorted = Object.keys(freq).map(n => parseInt(n)).sort((a, b) => freq[b] - freq[a]);
    const amputatedPool = sorted.slice(0, 25).sort((a, b) => a - b);
    
    console.log('\nPool amputado (25): [' + amputatedPool.join(', ') + ']');
    console.log('Eliminados (35): [' + sorted.slice(25).sort((a,b) => a-b).join(', ') + ']');
    
    // Gerar com pool amputado
    const resultAmp = CoverageEngine.generate('megasena', 1000, amputatedPool, [], 6, {});
    analyzeGames(resultAmp.games, '❌ POOL AMPUTADO (25 números) — 1.000 jogos');
    
    // Gerar com pool completo
    const resultFull = SmartCoverageEngine.generate('megasena', 1000, [], [], 6, {});
    analyzeGames(resultFull.games, '✅ POOL COMPLETO (60 números) — 1.000 jogos');
} catch (e) {
    console.log('❌ Erro na comparação: ' + e.message);
}

console.log('\n═══════════════════════════════════════════════════');
console.log('  TESTE CONCLUÍDO');
console.log('═══════════════════════════════════════════════════');

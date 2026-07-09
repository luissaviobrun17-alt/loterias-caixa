const fs = require('fs');
const path = require('path');

// Mocks
global.GAMES = {
    megasena: {
        name: 'Mega Sena',
        drawSize: 6,
        lotteryDraw: 6,
        range: [1, 60],
        zoneSize: 10,
        zones: 6,
        minZonesCovered: 3,
        maxConsecutive: 2,
        evenOddRange: [2, 4],
        sumRange: [120, 240],
        maxUsagePct: 0.20,
        maxOverlap: 2,
        repeatFromLast: [0, 1]
    }
};

global.StatsService = {
    getRecentResults: () => [],
    historyStore: { megasena: [] }
};
global.REAL_HISTORY_DB = { megasena: [] };

for (let i = 0; i < 20; i++) {
    global.REAL_HISTORY_DB.megasena.push({
        numbers: [Math.floor(Math.random()*60)+1, Math.floor(Math.random()*60)+1, Math.floor(Math.random()*60)+1, Math.floor(Math.random()*60)+1, Math.floor(Math.random()*60)+1, Math.floor(Math.random()*60)+1]
    });
}

// Carregar dependências no global
const load = (file) => {
    const code = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const vm = require('vm');
    vm.runInThisContext(code);
};

load('js/engines/combinations.js');
load('js/engines/nova_era_engine.js');
load('js/engines/coverage_engine.js');
load('js/engines/smart_coverage_engine.js');

try {
    console.log("Gerando 10 jogos...");
    const res10 = SmartCoverageEngine.generate('megasena', 10, [], [], 6, { precisionMode: true, precisionPoolSize: 40 });
    console.log("Sucesso! Jogos:", res10.games.length);

    console.log("Gerando 50 jogos...");
    const res50 = SmartCoverageEngine.generate('megasena', 50, [], [], 6, { precisionMode: true, precisionPoolSize: 40 });
    console.log("Sucesso! Jogos:", res50.games.length);

    console.log("Gerando 100 jogos...");
    const res100 = SmartCoverageEngine.generate('megasena', 100, [], [], 6, { precisionMode: true, precisionPoolSize: 40 });
    console.log("Sucesso! Jogos:", res100.games.length);
} catch (e) {
    console.error("ERRO!", e);
}

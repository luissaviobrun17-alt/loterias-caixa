const fs   = require('fs');
const path = 'js/stats.js';
let content = fs.readFileSync(path, 'utf8');

const oldFunc = `    static getStats(gameType, rangeAnalysis) {`;
const idx = content.indexOf(oldFunc);
if (idx < 0) { console.log('ERRO: getStats não encontrado'); process.exit(1); }

// Encontrar fim da função
const closingBrace = content.indexOf('\n    static simulateDraw', idx);
if (closingBrace < 0) { console.log('ERRO: fim da função não encontrado'); process.exit(1); }

const newFunc = `    static getStats(gameType, rangeAnalysis) {
        var game = typeof GAMES !== 'undefined' ? GAMES[gameType] : null;
        if (!game) return { hot: [], cold: [] };

        if (!this.historyStore[gameType]) {
            this.ensureHistory(gameType);
        }
        var history = this.historyStore[gameType] || [];

        var analyzesCount = (!rangeAnalysis || rangeAnalysis === 0)
            ? history.length
            : Math.min(rangeAnalysis, history.length);

        var recentDraws = history.slice(0, analyzesCount);
        if (recentDraws.length === 0) return { hot: [], cold: [], totalDraws: 0 };

        // ── FREQUÊNCIA PONDERADA com decay exponencial ────────────────────────
        // Sorteios recentes valem mais (peso 3.0) do que antigos (peso ~0.5).
        // Isso garante ordenação REAL de saída, sem empates sequenciais.
        var frequencyMap  = {};
        var weightedMap   = {};
        var recentHeatMap = {};

        for (var i = game.range[0]; i <= game.range[1]; i++) {
            frequencyMap[i]  = 0;
            weightedMap[i]   = 0;
            recentHeatMap[i] = 0;
        }

        var N = recentDraws.length;
        for (var idx = 0; idx < N; idx++) {
            var item = recentDraws[idx];
            var decay = 1.0 + 2.0 * Math.exp(-idx * 0.08); // max ~3.0 no mais recente

            var nums = [];
            if (item.numbers)  nums = nums.concat(item.numbers);
            if (item.numbers2) nums = nums.concat(item.numbers2);

            nums.forEach(function(num) {
                if (frequencyMap[num] !== undefined) {
                    frequencyMap[num]++;
                    weightedMap[num] += decay;
                    if (idx < 5) recentHeatMap[num]++;
                }
            });
        }

        // ── DELAY: há quantos sorteios o número não sai ──────────────────────
        var lastSeenMap = {};
        var fullHistory = this.historyStore[gameType] || [];
        for (var n = game.range[0]; n <= game.range[1]; n++) {
            lastSeenMap[n] = fullHistory.length;
        }
        for (var h = 0; h < fullHistory.length; h++) {
            var drawNums = (fullHistory[h].numbers || []).concat(fullHistory[h].numbers2 || []);
            drawNums.forEach(function(n) {
                if (n >= game.range[0] && n <= game.range[1] && lastSeenMap[n] === fullHistory.length) {
                    lastSeenMap[n] = h;
                }
            });
        }

        // ── SCORE FINAL: frequência ponderada + calor recente + delay ─────────
        var fLen = fullHistory.length;
        var allStats = Object.keys(frequencyMap).map(function(num) {
            var n   = parseInt(num);
            var w   = weightedMap[n]   || 0;
            var f   = frequencyMap[n]  || 0;
            var r5  = recentHeatMap[n] || 0;
            var d   = lastSeenMap[n] !== undefined ? lastSeenMap[n] : fLen;
            var score = w + (r5 * 1.5) - (d > 10 ? d * 0.05 : 0);
            return { number: n, count: f, score: score, delay: d };
        }).sort(function(a, b) {
            if (Math.abs(b.score - a.score) > 0.0001) return b.score - a.score;
            if (b.count !== a.count) return b.count - a.count;
            return b.delay - a.delay;
        });

        // ── SPLIT 50% / 50% ───────────────────────────────────────────────────
        var total = allStats.length;
        var half  = Math.ceil(total / 2);
        var hot  = allStats.slice(0, half);         // mais sorteados → menos
        var cold = allStats.slice(half).reverse();  // menos sorteados → os que mais estão devendo

        return { hot: hot, cold: cold, totalDraws: analyzesCount };
    }
`;

content = content.substring(0, idx) + newFunc + content.substring(closingBrace);
fs.writeFileSync(path, content, 'utf8');
console.log('getStats() reescrito! Tamanho:', content.length, 'bytes');
// Validar
console.log('Contém decay:', content.includes('Math.exp(-idx'));
console.log('Contém score:', content.includes('score: score'));
console.log('Contém split:', content.includes('SPLIT 50%'));

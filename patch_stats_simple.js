const fs = require('fs');
const path = 'js/stats.js';
let content = fs.readFileSync(path, 'utf8');

const oldStart = '    static getStats(gameType, rangeAnalysis) {';
const newEnd   = '\n    static simulateDraw(';

const s = content.indexOf(oldStart);
const e = content.indexOf(newEnd, s);
if (s < 0 || e < 0) { console.log('ERRO marcadores'); process.exit(1); }

const newFunc = `    static getStats(gameType, rangeAnalysis) {
        var game = typeof GAMES !== 'undefined' ? GAMES[gameType] : null;
        if (!game) return { hot: [], cold: [] };

        if (!this.historyStore[gameType]) this.ensureHistory(gameType);
        var history = this.historyStore[gameType] || [];

        var analyzesCount = (!rangeAnalysis || rangeAnalysis === 0)
            ? history.length
            : Math.min(rangeAnalysis, history.length);

        var recentDraws = history.slice(0, analyzesCount);
        if (recentDraws.length === 0) return { hot: [], cold: [], totalDraws: 0 };

        // Contar quantas vezes cada número saiu
        var countMap = {};
        for (var i = game.range[0]; i <= game.range[1]; i++) countMap[i] = 0;

        recentDraws.forEach(function(item) {
            (item.numbers  || []).forEach(function(n) { if (countMap[n] !== undefined) countMap[n]++; });
            (item.numbers2 || []).forEach(function(n) { if (countMap[n] !== undefined) countMap[n]++; });
        });

        // Delay: há quantos sorteios o número não sai
        var delayMap = {};
        var fullHist = history;
        for (var n = game.range[0]; n <= game.range[1]; n++) delayMap[n] = fullHist.length;
        for (var h = 0; h < fullHist.length; h++) {
            var nums = (fullHist[h].numbers || []).concat(fullHist[h].numbers2 || []);
            nums.forEach(function(n) {
                if (n >= game.range[0] && n <= game.range[1] && delayMap[n] === fullHist.length)
                    delayMap[n] = h;
            });
        }

        // Criar lista ordenada pela quantidade de sorteios (desc)
        var sorted = Object.keys(countMap).map(function(num) {
            var n = parseInt(num);
            return { number: n, count: countMap[n], delay: delayMap[n] !== undefined ? delayMap[n] : 0 };
        }).sort(function(a, b) {
            if (b.count !== a.count) return b.count - a.count; // mais sorteados primeiro
            return a.delay - b.delay;                           // desempate: menos atrasado primeiro
        });

        var half = Math.ceil(sorted.length / 2);

        // HOT: top 50% — do mais sorteado ao menos sorteado
        var hot = sorted.slice(0, half);

        // COLD: bottom 50% — do menos sorteado ao mais sorteado
        var cold = sorted.slice(half).reverse();

        return { hot: hot, cold: cold, totalDraws: analyzesCount };
    }
`;

content = content.substring(0, s) + newFunc + content.substring(e);
fs.writeFileSync(path, content, 'utf8');
console.log('OK. Bytes:', content.length);

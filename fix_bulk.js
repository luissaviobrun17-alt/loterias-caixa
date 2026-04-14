const fs = require('fs');
let c = fs.readFileSync('js/engines/nova_era_engine.js', 'utf-8');

const marker = 'static _generateDiverseGames(profile, scores, pool, numGames, drawSize, fixedNumbers, startNum, endNum, hasUserSelection) {';
const start = c.indexOf(marker);
if (start < 0) { console.log('ERRO: nao encontrou funcao'); process.exit(1); }

let bc = 0, end = -1;
for (let i = c.indexOf('{', start); i < c.length; i++) {
    if (c[i] === '{') bc++;
    if (c[i] === '}') { bc--; if (bc === 0) { end = i + 1; break; } }
}
console.log('Funcao encontrada: pos ' + start + ' a ' + end);

const newFunc = `static _generateDiverseGames(profile, scores, pool, numGames, drawSize, fixedNumbers, startNum, endNum, hasUserSelection) {
        const games = [];
        const usedKeys = new Set();
        const usedCount = {};
        for (const n of pool) usedCount[n] = 0;
        const numZones = profile.zones;
        const zoneSize = profile.zoneSize;
        const isBulkMode = numGames > 1000;
        const maxUsage = isBulkMode ? Infinity : Math.max(3, Math.ceil(numGames * profile.maxUsagePct));
        const maxOverlap = isBulkMode ? drawSize : profile.maxOverlap;
        const maxAttempts = Math.min(numGames * 500, 5000000);
        const TIMEOUT_MS = 300000;
        const startTime = Date.now();
        let attempts = 0;
        console.log('[NE-V1] ' + (isBulkMode ? 'MODO BULK 10K+' : 'Modo normal') + ' | ' + numGames + ' jogos | pool=' + pool.length);
        const qualityTarget = isBulkMode ? Math.min(500, numGames) : numGames;
        while (games.length < qualityTarget && attempts < maxAttempts && (Date.now() - startTime) < TIMEOUT_MS) {
            attempts++;
            const ticket = this._generateSingleGame(profile, scores, pool, drawSize, fixedNumbers, usedCount, maxUsage, startNum, endNum, numZones, zoneSize, games.length, numGames);
            if (!ticket || ticket.length < drawSize) continue;
            const key = ticket.join(',');
            if (usedKeys.has(key)) continue;
            if (!isBulkMode && games.length > 0 && attempts < maxAttempts * 0.60) {
                let tooSimilar = false;
                const checkFrom = Math.max(0, games.length - 30);
                for (let g = checkFrom; g < games.length; g++) {
                    const existSet = new Set(games[g]);
                    let overlap = 0;
                    for (const n of ticket) { if (existSet.has(n)) overlap++; }
                    if (overlap > maxOverlap) { tooSimilar = true; break; }
                }
                if (tooSimilar) continue;
            }
            games.push(ticket);
            usedKeys.add(key);
            for (const n of ticket) usedCount[n] = (usedCount[n] || 0) + 1;
        }
        console.log('[NE-V1] Fase1: ' + games.length + ' jogos em ' + attempts + ' tent');
        if (games.length < numGames) {
            console.log('[NE-V1] FASE2 BULK: gerando ' + (numGames - games.length) + ' jogos...');
            let bulkAtt = 0;
            const bulkMax = Math.max(numGames * 100, 2000000);
            const p1 = games.length;
            while (games.length < numGames && bulkAtt < bulkMax && (Date.now() - startTime) < 540000) {
                bulkAtt++;
                const ticket = [...fixedNumbers.filter(f => pool.includes(f))];
                const usedSet = new Set(ticket);
                const shuffled = pool.filter(n => !usedSet.has(n));
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
                }
                for (const n of shuffled) {
                    if (ticket.length >= drawSize) break;
                    ticket.push(n);
                }
                if (ticket.length < drawSize) continue;
                ticket.sort((a, b) => a - b);
                const key = ticket.join(',');
                if (!usedKeys.has(key)) {
                    games.push(ticket);
                    usedKeys.add(key);
                    for (const n of ticket) usedCount[n] = (usedCount[n] || 0) + 1;
                }
            }
            console.log('[NE-V1] Fase2: +' + (games.length - p1) + ' em ' + bulkAtt + ' tent');
        }
        console.log('[NE-V1] TOTAL: ' + games.length + '/' + numGames);
        const maxUsed = Math.max(0, ...Object.values(usedCount));
        const maxPct = games.length > 0 ? (maxUsed / games.length * 100).toFixed(1) : 0;
        const numsUsed = Object.values(usedCount).filter(v => v > 0).length;
        console.log('[NE-V1] MaxConc: ' + maxPct + '% | Nums: ' + numsUsed + '/' + pool.length);
        return games;
    }`;

c = c.substring(0, start) + newFunc + c.substring(end);
fs.writeFileSync('js/engines/nova_era_engine.js', c, 'utf-8');
console.log('SUCESSO! Funcao reescrita com MODO BULK!');

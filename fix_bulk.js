const fs = require('fs');
let c = fs.readFileSync('js/engines/nova_era_engine.js', 'utf-8');

// Encontrar o inicio do metodo generate
const genMarker = 'static generate(gameKey, numGames, selectedNumbers, fixedNumbers, customDrawSize) {';
const genStart = c.indexOf(genMarker);
if (genStart < 0) { console.log('ERRO: generate nao encontrado'); process.exit(1); }

// Inserir ATALHO BULK logo apos a abertura do metodo
const insertAfter = genMarker;
const insertPos = c.indexOf(insertAfter) + insertAfter.length;

const bulkShortcut = `
        // ╔══════════════════════════════════════════════════════════════╗
        // ║  ATALHO BULK 10K+ — Pula IA pesada para lotes grandes     ║
        // ╚══════════════════════════════════════════════════════════════╝
        if (numGames > 1000) {
            console.log('[NE-V1] MODO BULK RAPIDO — ' + numGames + ' jogos (sem IA pesada)');
            const profile = this.getProfile(gameKey);
            const startNum = profile.range[0];
            const endNum = profile.range[1];
            const drawSize = customDrawSize || profile.drawSize;
            const totalRange = endNum - startNum + 1;
            const pool = [];
            for (let n = startNum; n <= endNum; n++) pool.push(n);
            const fixed = (fixedNumbers || []).filter(f => f >= startNum && f <= endNum);
            
            const games = [];
            const usedKeys = new Set();
            const t0 = Date.now();
            let att = 0;
            
            while (games.length < numGames && att < numGames * 50 && (Date.now() - t0) < 60000) {
                att++;
                const ticket = [...fixed];
                const usedSet = new Set(ticket);
                const shuffled = pool.filter(n => !usedSet.has(n));
                // Fisher-Yates shuffle
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
                }
            }
            
            console.log('[NE-V1] BULK RAPIDO: ' + games.length + '/' + numGames + ' em ' + (Date.now() - t0) + 'ms (' + att + ' tentativas)');
            
            const uniqueNums = new Set(games.flat());
            return {
                games: games,
                analysis: {
                    confidence: 50,
                    coverage: Math.round(uniqueNums.size / totalRange * 100),
                    diversity: 95,
                    uniqueNumbers: uniqueNums.size,
                    uniqueCount: uniqueNums.size,
                    maxConcentration: '60%',
                    engine: 'Nova Era V1 — BULK RAPIDO',
                    mode: 'MODO BULK — Geração rápida sem IA'
                },
                pool: [...uniqueNums].sort((a, b) => a - b),
                engine: 'Nova Era V1 — BULK'
            };
        }
`;

// Verificar se ja tem o atalho
if (c.includes('ATALHO BULK 10K+')) {
    console.log('Atalho BULK ja existe. Nada a fazer.');
    process.exit(0);
}

c = c.substring(0, insertPos) + bulkShortcut + c.substring(insertPos);
fs.writeFileSync('js/engines/nova_era_engine.js', c, 'utf-8');
console.log('SUCESSO! Atalho BULK inserido no topo do generate()');

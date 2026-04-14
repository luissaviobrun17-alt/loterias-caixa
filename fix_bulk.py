import re

with open('js/engines/nova_era_engine.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the function start and end
start_marker = 'static _generateDiverseGames(profile, scores, pool, numGames, drawSize, fixedNumbers, startNum, endNum, hasUserSelection) {'
start_idx = content.find(start_marker)
if start_idx < 0:
    print("ERRO: funcao nao encontrada!")
    exit(1)

# Find matching closing brace
brace_count = 0
func_start = start_idx
i = content.index('{', start_idx)
for i in range(i, len(content)):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            func_end = i + 1
            break

print(f"Funcao encontrada: linhas {content[:start_idx].count(chr(10))+1} a {content[:func_end].count(chr(10))+1}")

new_func = '''static _generateDiverseGames(profile, scores, pool, numGames, drawSize, fixedNumbers, startNum, endNum, hasUserSelection) {
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

        // FASE 1: Jogos com qualidade (limitado a 500 em bulk)
        const qualityTarget = isBulkMode ? Math.min(500, numGames) : numGames;
        while (games.length < qualityTarget && attempts < maxAttempts && (Date.now() - startTime) < TIMEOUT_MS) {
            attempts++;
            const ticket = this._generateSingleGame(
                profile, scores, pool, drawSize, fixedNumbers,
                usedCount, maxUsage, startNum, endNum, numZones, zoneSize,
                games.length, numGames
            );
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

        console.log('[NE-V1] Fase 1 (qualidade): ' + games.length + ' jogos em ' + attempts + ' tentativas');

        // FASE 2 (BULK): Gerar jogos APENAS com unicidade
        if (games.length < numGames) {
            console.log('[NE-V1] FASE 2 BULK: gerando ' + (numGames - games.length) + ' jogos adicionais...');
            let bulkAtt = 0;
            const bulkMax = Math.max(numGames * 100, 2000000);
            const phase1Count = games.length;

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
            console.log('[NE-V1] Fase 2 (bulk): +' + (games.length - phase1Count) + ' em ' + bulkAtt + ' tentativas');
        }

        console.log('[NE-V1] TOTAL: ' + games.length + '/' + numGames + ' jogos');
        const maxUsed = Math.max(0, ...Object.values(usedCount));
        const maxPct = games.length > 0 ? (maxUsed / games.length * 100).toFixed(1) : 0;
        const numsUsed = Object.values(usedCount).filter(v => v > 0).length;
        console.log('[NE-V1] Max concentracao: ' + maxPct + '% | Nums usados: ' + numsUsed + '/' + pool.length);

        return games;
    }'''

# Find the indent
indent_match = content[max(0, start_idx-10):start_idx]
indent = '    '  # 4 spaces based on viewing code

content = content[:start_idx] + new_func + content[func_end:]

with open('js/engines/nova_era_engine.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCESSO! Funcao _generateDiverseGames reescrita com MODO BULK!")

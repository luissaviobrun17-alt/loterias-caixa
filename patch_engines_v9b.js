/**
 * PATCH V9-B: Corrigir bug "números selecionados ignorados" + inserir motor Timemania V9
 */
const fs = require('fs');
const sbPath = 'js/engines/smart_bets.js';
let sb = fs.readFileSync(sbPath, 'utf8');

// ============================================================
// FIX 1: Corrigir interceptor da Timemania
// O bug: quando usuário seleciona números, o motor ignora e usa IA própria
// A correção: só usar motor Quantum quando NÃO há números selecionados suficientes
// E quando HÁ números selecionados, passá-los ao motor Quantum como pool
// ============================================================
const oldInterceptor = `if (gameKey === 'timemania' && (!selectedNumbers || selectedNumbers.length < drawSize)) {
            console.log('[SmartBets] 🔮 QUANTUM HARMÔNICO V6 — Motor especializado Timemania ativado!');
            return this._generateTimemaniaQuantum(numGames, fixedNumbers, drawSize, profile, game);
        }`;

const newInterceptor = `// V9: Motor Timemania Quantum — Respeita números selecionados pelo usuário
        if (gameKey === 'timemania') {
            const hasUserSelection = selectedNumbers && selectedNumbers.length >= drawSize;
            if (hasUserSelection) {
                // ✅ Usuário selecionou números: usar pool do usuário no motor Quantum
                console.log('[SmartBets] 🎯 TIMEMANIA V9 — Gerando a partir de ' + selectedNumbers.length + ' números escolhidos pelo usuário');
                return this._generateTimemaniaQuantum(numGames, fixedNumbers, drawSize, profile, game, selectedNumbers);
            } else {
                // ✅ Sem seleção: motor Quantum com análise completa de 1-80
                console.log('[SmartBets] 🔮 TIMEMANIA V9 — Motor Quantum completo (sem seleção manual)');
                return this._generateTimemaniaQuantum(numGames, fixedNumbers, drawSize, profile, game, []);
            }
        }`;

if (sb.includes(oldInterceptor)) {
    sb = sb.replace(oldInterceptor, newInterceptor);
    console.log('[FIX 1] ✅ Interceptor Timemania corrigido — agora respeita números selecionados');
} else {
    // Tentar encontrar variante com \r\n
    const oldAlt = oldInterceptor.replace(/\n/g, '\r\n');
    if (sb.includes(oldAlt)) {
        sb = sb.replace(oldAlt, newInterceptor);
        console.log('[FIX 1] ✅ Interceptor Timemania corrigido (CRLF)');
    } else {
        console.log('[FIX 1] ⚠️  Interceptor não encontrado literalmente, tentando regex...');
        const regex = /if \(gameKey === ['"]timemania['"] && \(!selectedNumbers \|\| selectedNumbers\.length < drawSize\)\) \{[\s\S]*?return this\._generateTimemaniaQuantum\(numGames, fixedNumbers, drawSize, profile, game\);\s*\}/;
        if (regex.test(sb)) {
            sb = sb.replace(regex, newInterceptor);
            console.log('[FIX 1] ✅ Interceptor corrigido via regex');
        } else {
            console.log('[FIX 1] ❌ Não encontrou o interceptor!');
        }
    }
}

// ============================================================
// FIX 2: Substituir motor _generateTimemaniaQuantum V8 pelo V9
// ============================================================
const start = sb.indexOf('    static _generateTimemaniaQuantum(');
const end = sb.indexOf('    static _generateAllCombinations(');

if (start < 0) { console.log('[FIX 2] ❌ Não encontrou _generateTimemaniaQuantum'); }
else if (end < 0) { console.log('[FIX 2] ❌ Não encontrou _generateAllCombinations'); }
else {
    const qhV9 = `    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  QUANTUM HARMONICO V9 — DIVERSIDADE MAXIMA TIMEMANIA              ║
    // ║  RECONSTRUCAO TOTAL: Elimina Elite-12 que causava 0 premios        ║
    // ║  Respeita numeros selecionados pelo usuario como pool               ║
    // ╚══════════════════════════════════════════════════════════════════╝
    static _generateTimemaniaQuantum(numGames, fixedNumbers, drawSize, profile, game, selectedNumbers = []) {
        let history = [];
        try {
            history = StatsService.getRecentResults('timemania', 200) || [];
        } catch(e) { history = []; }

        if (history.length < 5) {
            console.warn('[QH-V9] Historico insuficiente, usando modo basico');
            return this.generate('timemania', numGames, selectedNumbers, fixedNumbers, drawSize);
        }

        const N = history.length;
        console.log('[QH-V9] DIVERSIDADE MAXIMA — Analisando ' + N + ' sorteios...');

        // ══════════════════════════════════════════════
        // FASE 1: ANALISE MULTI-JANELA EQUILIBRADA
        // ══════════════════════════════════════════════
        const freq = {}, delay = {}, recent5 = {}, recent10 = {}, recent15 = {};
        for (let n = 1; n <= 80; n++) {
            freq[n] = 0; delay[n] = N;
            recent5[n] = 0; recent10[n] = 0; recent15[n] = 0;
        }
        history.forEach(d => d.numbers.forEach(n => freq[n]++));
        for (let i = 0; i < Math.min(5,  N); i++) history[i].numbers.forEach(n => recent5[n]++);
        for (let i = 0; i < Math.min(10, N); i++) history[i].numbers.forEach(n => recent10[n]++);
        for (let i = 0; i < Math.min(15, N); i++) history[i].numbers.forEach(n => recent15[n]++);
        for (let i = 0; i < N; i++) history[i].numbers.forEach(n => { if (delay[n] === N) delay[n] = i; });

        // Score V9: peso EQUILIBRADO, sem super-concentracao
        const scores = {};
        for (let n = 1; n <= 80; n++) {
            const fNorm    = freq[n]    / Math.max(1, N);
            const r5Norm   = recent5[n]  / Math.min(5, N);
            const r10Norm  = recent10[n] / Math.min(10, N);
            const r15Norm  = recent15[n] / Math.min(15, N);
            const delayBonus = delay[n] > 8 ? 0.15 : (delay[n] > 5 ? 0.08 : 0);
            scores[n] = fNorm * 0.30 + r5Norm * 0.20 + r10Norm * 0.25 + r15Norm * 0.15 + delayBonus * 0.10;
        }

        // ══════════════════════════════════════════════
        // FASE 2: DEFINIR POOL
        // Se usuario selecionou numeros: usar como pool
        // Caso contrario: pool de 30 numeros distribuidos por zonas
        // ══════════════════════════════════════════════
        let pool = [];
        const hasUserSelection = selectedNumbers && selectedNumbers.length >= drawSize;

        if (hasUserSelection) {
            // ✅ MODO USUARIO: usar exatamente os números escolhidos
            pool = selectedNumbers.slice().sort((a, b) => a - b);
            console.log('[QH-V9] 🎯 Pool do Usuário (' + pool.length + ' nums): [' + pool.join(', ') + ']');
        } else {
            // ✅ MODO IA: pool de 30 números distribuídos por 8 zonas
            const POOL_SIZE = 30;
            let ranked = Object.entries(scores)
                .map(([n, s]) => ({ num: +n, score: s }))
                .sort((a, b) => b.score - a.score);

            const zones = [[], [], [], [], [], [], [], []];
            for (const r of ranked) {
                const zoneIdx = Math.min(7, Math.floor((r.num - 1) / 10));
                zones[zoneIdx].push(r);
            }

            const poolPerZone = Math.ceil(POOL_SIZE / 8);
            for (let z = 0; z < 8; z++) {
                zones[z].slice(0, poolPerZone).forEach(r => pool.push(r.num));
            }
            for (const r of ranked) {
                if (pool.length >= POOL_SIZE) break;
                if (!pool.includes(r.num)) pool.push(r.num);
            }
            pool.sort((a, b) => a - b);
            console.log('[QH-V9] 🧠 Pool IA Diversificado (' + pool.length + ' nums): [' + pool.join(', ') + ']');
        }

        // ══════════════════════════════════════════════
        // FASE 3: GERACAO COM ANTI-CONCENTRACAO BRUTAL
        // Nenhum numero aparece em mais de 20% dos jogos
        // ══════════════════════════════════════════════
        const games = [];
        const usedCount = {};
        pool.forEach(n => usedCount[n] = 0);
        const usedKeys = new Set();

        const getMaxUse = () => Math.max(3, Math.ceil(numGames * 0.20));

        let attempts = 0;
        const maxAttempts = numGames * 2000;

        while (games.length < numGames && attempts < maxAttempts) {
            attempts++;

            // Pesos com penalidade por super-uso
            const weights = {};
            const maxUse = getMaxUse();

            for (const n of pool) {
                let w = (scores[n] || 0.1) + 0.5;
                const usage = usedCount[n] || 0;
                if (usage >= maxUse) {
                    w = 0.001;
                } else if (usage > 0) {
                    const usageRatio = usage / maxUse;
                    w *= Math.pow(1 - usageRatio, 3);
                }
                if (usage === 0) w += 0.8;
                if (usage <= 1) w += 0.3;
                w += (Math.random() - 0.5) * (hasUserSelection ? 0.40 : 0.70);
                weights[n] = Math.max(0.001, w);
            }

            const ticket = [];
            const usedInTicket = new Set();

            // Números fixos
            for (const f of fixedNumbers) {
                if (pool.includes(f) && !usedInTicket.has(f) && ticket.length < drawSize) {
                    ticket.push(f);
                    usedInTicket.add(f);
                }
            }

            // Para pool do usuário: selecao direta ponderada sem obrigacao de zonas
            // Para pool IA: garantir cobertura de 5 zonas
            if (!hasUserSelection) {
                const coveredZones = new Set(ticket.map(n => Math.floor((n - 1) / 10)));
                const MIN_ZONES = Math.min(5, Math.ceil(pool.length / 10));

                if (coveredZones.size < MIN_ZONES) {
                    const emptyZones = [];
                    for (let z = 0; z < 8; z++) {
                        if (!coveredZones.has(z)) emptyZones.push(z);
                    }
                    emptyZones.sort(() => Math.random() - 0.5);

                    for (const z of emptyZones) {
                        if (ticket.length >= drawSize) break;
                        if (coveredZones.size >= MIN_ZONES && ticket.length >= Math.floor(drawSize / 2)) break;
                        const inZone = pool.filter(n => Math.floor((n-1)/10) === z && !usedInTicket.has(n));
                        if (inZone.length === 0) continue;
                        let totalW = inZone.reduce((s, n) => s + weights[n], 0);
                        let rand = Math.random() * totalW;
                        let cumul = 0, chosen = inZone[0];
                        for (const n of inZone) { cumul += weights[n]; if (rand <= cumul) { chosen = n; break; } }
                        ticket.push(chosen); usedInTicket.add(chosen); coveredZones.add(z);
                    }
                }
            }

            // Completar jogo
            const remaining = pool.filter(n => !usedInTicket.has(n));
            while (ticket.length < drawSize && remaining.length > 0) {
                let totalW = remaining.reduce((s, n) => s + weights[n], 0);
                let rand = Math.random() * totalW, cumul = 0, chosenIdx = 0;
                for (let i = 0; i < remaining.length; i++) {
                    cumul += weights[remaining[i]];
                    if (rand <= cumul) { chosenIdx = i; break; }
                }
                ticket.push(remaining[chosenIdx]);
                usedInTicket.add(remaining[chosenIdx]);
                remaining.splice(chosenIdx, 1);
            }

            if (ticket.length < drawSize) continue;
            ticket.sort((a, b) => a - b);

            const key = ticket.join(',');
            if (usedKeys.has(key)) continue;

            // Verificar overlap
            if (games.length > 0) {
                const MAX_OVERLAP = hasUserSelection
                    ? Math.ceil(drawSize * 0.50)   // Pool menor = mais overlap aceitável
                    : Math.ceil(drawSize * 0.30);   // Pool maior = menos overlap
                let tooSimilar = false;
                const checkFrom = Math.max(0, games.length - 50);
                for (let g = checkFrom; g < games.length; g++) {
                    const existSet = new Set(games[g]);
                    if (ticket.filter(n => existSet.has(n)).length > MAX_OVERLAP) {
                        tooSimilar = true; break;
                    }
                }
                if (tooSimilar && attempts < maxAttempts * 0.85) continue;
            }

            // Verificar super-uso
            let hasOverused = false;
            const maxUse2 = getMaxUse();
            for (const n of ticket) {
                if ((usedCount[n] || 0) >= maxUse2) { hasOverused = true; break; }
            }
            if (hasOverused && attempts < maxAttempts * 0.70) continue;

            games.push(ticket);
            usedKeys.add(key);
            ticket.forEach(n => usedCount[n] = (usedCount[n] || 0) + 1);
        }

        console.log('[QH-V9] ✅ ' + games.length + ' jogos gerados em ' + attempts + ' tentativas');

        // ══════════════════════════════════════════════
        // FASE 4: ANALISE DO SET
        // ══════════════════════════════════════════════
        const uniqueNums = new Set();
        games.forEach(g => g.forEach(n => uniqueNums.add(n)));
        const maxFreq = Math.max(0, ...(Object.values(usedCount).filter(v => v > 0)));
        const maxFreqPct = games.length > 0 ? Math.round(maxFreq / games.length * 100) : 0;

        let bt5plus = 0, bt4plus = 0, bt3plus = 0;
        const btCount = Math.min(10, history.length);
        for (let t = 0; t < btCount; t++) {
            const drawn = new Set(history[t].numbers);
            let bestHits = 0;
            for (const g of games) {
                const hits = g.filter(n => drawn.has(n)).length;
                if (hits > bestHits) bestHits = hits;
            }
            if (bestHits >= 5) bt5plus++;
            if (bestHits >= 4) bt4plus++;
            if (bestHits >= 3) bt3plus++;
        }

        const modeLabel = hasUserSelection ? 'Jogos por Seleção do Usuário' : 'Diversidade Quântica IA';
        const setAnalysis = {
            confidence: Math.min(88, 40 + (bt3plus/Math.max(1,btCount))*25 + (bt4plus/Math.max(1,btCount))*15 + (uniqueNums.size/pool.length)*15),
            coverage: Math.round(uniqueNums.size / 80 * 100),
            diversity: Math.round(Math.max(0, 100 - maxFreqPct)),
            uniqueNumbers: uniqueNums.size,
            uniqueCount: uniqueNums.size,
            maxConcentration: maxFreqPct + '%',
            backtestScore: Math.round((bt3plus / Math.max(1,btCount)) * 100),
            backtestHits: { '5+': bt5plus, '4+': bt4plus, '3+': bt3plus },
            pairsCovered: '-',
            triosCovered: '-',
            engine: 'Quantum V9 — ' + modeLabel,
            mode: hasUserSelection ? 'SELEÇÃO' : 'DIVERSIDADE'
        };

        console.log('[QH-V9] Cobertura: ' + uniqueNums.size + ' números únicos | Conc. max: ' + maxFreqPct + '%');
        console.log('[QH-V9] Backtest: 5+=' + bt5plus + '/' + btCount + ', 4+=' + bt4plus + ', 3+=' + bt3plus);

        return {
            pool: [...uniqueNums].sort((a, b) => a - b),
            games,
            analysis: setAnalysis
        };
    }

`;

    sb = sb.substring(0, start) + qhV9 + sb.substring(end);
    console.log('[FIX 2] ✅ Motor Timemania Quantum V9 inserido (' + qhV9.length + ' chars)');
}

// ============================================================
// FIX 3: Corrigir bug genérico em TODAS as loterias
// O problema: na UI, quando selectedArr.length < customDrawSize, 
// passa [] ao invés dos números. Mas o motor SmartBets.generate()
// já lida com isso — o verdadeiro problema é que o motor 
// ignora selectedNumbers quando tem poucos (< drawSize).
// Adicionar fallback: se selectedNumbers < drawSize mas > 0,
// usar como "hint" de pool preferencial
// ============================================================
// Corrigir a condicional de pool para aceitar seleções parciais como preferência
const oldPoolCondition = `let pool = selectedNumbers && selectedNumbers.length >= drawSize
            ? selectedNumbers.slice()
            : this._buildFullPool(startNum, endNum);`;

const newPoolCondition = `// V9: Se usuário selecionou números (mesmo menos que drawSize), usar como pool preferencial
        let pool;
        if (selectedNumbers && selectedNumbers.length >= drawSize) {
            // Seleção completa: usar exclusivamente os números escolhidos
            pool = selectedNumbers.slice();
            console.log('[SmartBets] 🎯 Pool do usuário (' + pool.length + ' nums selecionados)');
        } else if (selectedNumbers && selectedNumbers.length >= Math.ceil(drawSize / 2)) {
            // Seleção parcial: usar como ponto de partida + completar com análise IA
            const fullPool = this._buildFullPool(startNum, endNum);
            const selectedSet = new Set(selectedNumbers);
            // Priorizar: selecionados primeiro, depois os melhores da IA
            pool = [...selectedNumbers, ...fullPool.filter(n => !selectedSet.has(n))];
            console.log('[SmartBets] 🎯 Pool híbrido: ' + selectedNumbers.length + ' do usuário + ' + (pool.length - selectedNumbers.length) + ' IA');
        } else {
            // Sem seleção ou poucas: usar universo completo
            pool = this._buildFullPool(startNum, endNum);
            console.log('[SmartBets] 🧠 Pool IA completo (' + pool.length + ' nums)');
        }`;

if (sb.includes(oldPoolCondition)) {
    sb = sb.replace(oldPoolCondition, newPoolCondition);
    console.log('[FIX 3] ✅ Pool genérico corrigido para respeitar seleção do usuário');
} else {
    const oldAlt = oldPoolCondition.replace(/\n/g, '\r\n');
    if (sb.includes(oldAlt)) {
        sb = sb.replace(oldAlt, newPoolCondition);
        console.log('[FIX 3] ✅ Pool pool corrigido (CRLF)');
    } else {
        console.log('[FIX 3] ⚠️  Pool condition não encontrada literalmente');
    }
}

fs.writeFileSync(sbPath, sb, 'utf8');
console.log('\n=== RESUMO ===');
console.log('Arquivo final: ' + sb.length + ' bytes');
console.log('PATCH V9-B CONCLUIDO!');

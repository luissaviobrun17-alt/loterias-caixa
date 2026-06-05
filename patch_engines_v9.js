/**
 * PATCH V9 — Recalibração Total de Todos os Motores B2B Loterias
 * Executar com: node patch_engines_v9.js
 */
const fs = require('fs');

// ============================================================
// PATCH 1: smart_bets.js — Perfis de todos os jogos
// ============================================================
const sbPath = 'js/engines/smart_bets.js';
let sb = fs.readFileSync(sbPath, 'utf8');
const origSbLen = sb.length;

// Função para patch de um bloco por regex de linha
function patchLines(content, fromLine, toLine, replacement) {
    const lines = content.split('\n');
    // Encontrar by content
    let startIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(fromLine)) { startIdx = i; break; }
    }
    if (startIdx < 0) { console.log('NAO ENCONTROU: ' + fromLine); return content; }
    
    let endIdx = startIdx;
    for (let i = startIdx; i < lines.length; i++) {
        if (lines[i].includes(toLine)) { endIdx = i; break; }
    }
    
    const before = lines.slice(0, startIdx);
    const after = lines.slice(endIdx + 1);
    const result = [...before, ...replacement.split('\n'), ...after].join('\n');
    return result;
}

// ======================================
// FIX 1: Perfil Megasena — linha 33-62
// ======================================
// Usar substituição por padrão chave
sb = sb.replace(
    /markovWeight: 0\.18,\r?\n(\s*)trendWeight: 0\.18,\r?\n(\s*)pairBoost: 0\.10,\r?\n(\s*)trioBoost: 0\.04,\r?\n(\s*)multiWindow: true,\r?\n(\s*)zoneMinCover: 3,/,
    'markovWeight: 0.05,     // V9 ANTI-CONC: 0.18->0.05\r\n$1trendWeight: 0.05,      // V9: 0.18->0.05\r\n$2pairBoost: 0.03,        // V9: 0.10->0.03\r\n$3trioBoost: 0.01,        // V9: 0.04->0.01\r\n$4multiWindow: true,\r\n$5zoneMinCover: 4,        // V9: 3->4'
);

sb = sb.replace(
    /diversityPenalty: 0\.85,\r?\n(\s*)maxConcentration: 0\.10,\r?\n(\s*)forceNewEvery: 2,\r?\n(\s*)maxOverlapBetweenGames: 3,\r?\n(\s*)maxSeedRatio: 0\.17,\r?\n(\s*)noiseLevel: 0\.35,\r?\n(\s*)hotRatio: 0\.50,\r?\n(\s*)warmRatio: 0\.33,\r?\n(\s*)coldRatio: 0\.17/,
    'diversityPenalty: 1.20,   // V9: 0.85->1.20 PENALIDADE SEVERA\r\n$1maxConcentration: 0.08,   // V9: 0.10->0.08\r\n$2forceNewEvery: 1,         // V9: 2->1 rotacao total\r\n$3maxOverlapBetweenGames: 2,// V9: 3->2\r\n$4maxSeedRatio: 0.10,       // V9: 0.17->0.10\r\n$5noiseLevel: 0.55,         // V9: 0.35->0.55 MUITO mais exploracao\r\n$6hotRatio: 0.34,           // V9: equilibrio 1/3\r\n$7warmRatio: 0.33,\r\n$8coldRatio: 0.33'
);
console.log('[1] Megasena patches aplicados');

// ======================================
// FIX 2: Lotofacil — diversidade
// ======================================
sb = sb.replace(
    /diversityPenalty: 0\.40,\s*\/\/ V3: 0\.90->0\.40 — PERMITIR concentra/,
    'diversityPenalty: 0.90,   // V9: 0.40->0.90 ANTI-CONCENTRACAO'
);
sb = sb.replace(
    /maxConcentration: 0\.80,\s*\/\/ V3: 0\.72->0\.80/,
    'maxConcentration: 0.65,   // V9: 0.80->0.65'
);
sb = sb.replace(
    /forceNewEvery: 3,\s*\/\/ V3: 2->3 — menos rota/,
    'forceNewEvery: 2,         // V9: 3->2 rotacao real'
);
sb = sb.replace(
    /maxOverlapBetweenGames: 12,\s*\/\/ V3: 10->12 — jogos mais similares/,
    'maxOverlapBetweenGames: 10, // V9: 12->10'
);
sb = sb.replace(
    /noiseLevel: 0\.12\s*\/\/ V3: 0\.25->0\.12 — MENOS RU/,
    'noiseLevel: 0.28         // V9: 0.12->0.28 MAIS exploracao'
);
console.log('[2] Lotofacil patches aplicados');

// ======================================
// FIX 3: Quina
// ======================================
sb = sb.replace(
    /markovWeight: 0\.15,\s*\/\/ v2\.3: 0\.55->0\.15 — CAUSA RAIZ da concentra/,
    'markovWeight: 0.06,   // V9: 0.15->0.06 ANTI-CONCENTRACAO'
);
sb = sb.replace(
    /trendWeight: 0\.15,\s*\/\/ v2\.3: 0\.50->0\.15\r?\n(\s*)pairBoost: 0\.08,\s*\/\/ v2\.3: 0\.40->0\.08\r?\n(\s*)trioBoost: 0\.04,\s*\/\/ v2\.3: 0\.30->0\.04\r?\n(\s*)multiWindow: true,\r?\n(\s*)zoneMinCover: 3,/,
    'trendWeight: 0.06,    // V9: 0.15->0.06\r\n$1pairBoost: 0.03,     // V9: 0.08->0.03\r\n$2trioBoost: 0.01,     // V9: 0.04->0.01\r\n$3multiWindow: true,\r\n$4zoneMinCover: 4,     // V9: 3->4 cobertura real'
);
sb = sb.replace(
    /diversityPenalty: 0\.85,\s*\/\/ v2\.3: 0\.45->0\.85 — penalidade SEVERA\r?\n(\s*)maxConcentration: 0\.08,\s*\/\/ v2\.3: 0\.35->0\.08 \(5\/80=6\.25%, \+2% margem\)\r?\n(\s*)forceNewEvery: 2,\s*\/\/ v2\.3: 3->2\r?\n(\s*)maxOverlapBetweenGames: 2,\s*\/\/ NOVO: max 2\/5 overlap\r?\n(\s*)maxSeedRatio: 0\.20,\s*\/\/ NOVO\r?\n(\s*)noiseLevel: 0\.50,\s*\/\/ NOVO: ru.do ALTO \(range 80\)\r?\n(\s*)\/\/ Camadas de temperatura\r?\n(\s*)hotRatio: 0\.40,\s*\/\/ ~2\/5 do pool HOT\r?\n(\s*)warmRatio: 0\.35,\s*\/\/ ~2\/5 do warm\r?\n(\s*)coldRatio: 0\.25/,
    'diversityPenalty: 1.50,   // V9: 0.85->1.50 MAXIMO\r\n$1maxConcentration: 0.06,   // V9: 0.08->0.06\r\n$2forceNewEvery: 1,         // V9: 2->1\r\n$3maxOverlapBetweenGames: 1,// V9: 2->1 max 1/5 overlap\r\n$4maxSeedRatio: 0.10,       // V9: 0.20->0.10\r\n$5noiseLevel: 0.70,         // V9: 0.50->0.70 MAX exploracao\r\n$6// Camadas equilibradas V9\r\n$7hotRatio: 0.34,           // V9: equilibrio 1/3\r\n$8warmRatio: 0.33,\r\n$9coldRatio: 0.33'
);
console.log('[3] Quina patches aplicados');

// ======================================
// FIX 4: DuplaSena
// ======================================
sb = sb.replace(
    /markovWeight: 0\.15,\s*\/\/ v2\.3: 0\.55->0\.15 — CAUSA RAIZ\r?\n(\s*)trendWeight: 0\.15,\s*\/\/ v2\.3: 0\.50->0\.15\r?\n(\s*)pairBoost: 0\.08,\s*\/\/ v2\.3: 0\.45->0\.08\r?\n(\s*)trioBoost: 0\.04,\s*\/\/ v2\.3: 0\.35->0\.04\r?\n(\s*)multiWindow: true,\r?\n(\s*)zoneMinCover: 3,/,
    'markovWeight: 0.06,   // V9: ANTI-CONC\r\n$1trendWeight: 0.06,   // V9\r\n$2pairBoost: 0.03,     // V9\r\n$3trioBoost: 0.01,     // V9\r\n$4multiWindow: true,\r\n$5zoneMinCover: 4,     // V9: 3->4'
);
sb = sb.replace(
    /diversityPenalty: 0\.85,\s*\/\/ v2\.3: 0\.35->0\.85 — penalidade SEVERA\r?\n(\s*)maxConcentration: 0\.15,\s*\/\/ v2\.3: 0\.38->0\.15 \(6\/50=12%, \+3%\)\r?\n(\s*)forceNewEvery: 2,\s*\/\/ v2\.3: 3->2\r?\n(\s*)maxOverlapBetweenGames: 2,\s*\/\/ NOVO: max 2\/6 overlap\r?\n(\s*)maxSeedRatio: 0\.20,\s*\/\/ NOVO\r?\n(\s*)noiseLevel: 0\.45,\s*\/\/ NOVO: ru.do para range 50\r?\n(\s*)hotRatio: 0\.40,\r?\n(\s*)warmRatio: 0\.35,\r?\n(\s*)coldRatio: 0\.25/,
    'diversityPenalty: 1.30,   // V9: 0.85->1.30\r\n$1maxConcentration: 0.10,   // V9: 0.15->0.10\r\n$2forceNewEvery: 1,         // V9: 2->1\r\n$3maxOverlapBetweenGames: 2, // mantido\r\n$4maxSeedRatio: 0.10,       // V9: 0.20->0.10\r\n$5noiseLevel: 0.60,         // V9: 0.45->0.60\r\n$6hotRatio: 0.34,           // V9: equilibrio 1/3\r\n$7warmRatio: 0.33,\r\n$8coldRatio: 0.33'
);
console.log('[4] DuplaSena patches aplicados');

// ======================================
// FIX 5: Lotomania
// ======================================
sb = sb.replace(
    /markovWeight: 0\.12,\s*\/\/ v2\.3: 0\.40->0\.12 — anti-concentra/,
    'markovWeight: 0.05,   // V9: 0.12->0.05'
);
sb = sb.replace(
    /trendWeight: 0\.12,\s*\/\/ v2\.3: 0\.35->0\.12[^\r\n]*\r?\n(\s*)pairBoost: 0\.06,\s*\/\/ v2\.3: 0\.25[^\r\n]*\r?\n(\s*)trioBoost: 0\.03,\s*\/\/ v2\.3: 0\.15/,
    'trendWeight: 0.05,    // V9: 0.12->0.05\r\n$1pairBoost: 0.03,     // V9: 0.06->0.03\r\n$2trioBoost: 0.01,     // V9: 0.03->0.01'
);
sb = sb.replace(
    /diversityPenalty: 0\.80,\s*\/\/ v2\.3: 0\.50->0\.80/,
    'diversityPenalty: 1.00,   // V9: 0.80->1.00'
);
sb = sb.replace(
    /maxOverlapBetweenGames: 35,\s*\/\/ NOVO: max 35\/50 overlap\r?\n(\s*)maxSeedRatio: 0\.15,\s*\/\/ NOVO\r?\n(\s*)noiseLevel: 0\.35,\s*\/\/ NOVO: ru.do para explorar range 100\r?\n(\s*)hotRatio: 0\.40,\r?\n(\s*)warmRatio: 0\.35,\r?\n(\s*)coldRatio: 0\.25/,
    'maxOverlapBetweenGames: 30, // V9: 35->30\r\n$1maxSeedRatio: 0.10,       // V9: 0.15->0.10\r\n$2noiseLevel: 0.45,         // V9: 0.35->0.45\r\n$3hotRatio: 0.34,           // V9: equilibrio 1/3\r\n$4warmRatio: 0.33,\r\n$5coldRatio: 0.33'
);
console.log('[5] Lotomania patches aplicados');

// ======================================
// FIX 6: Timemania — RECONSTRUCAO TOTAL
// ======================================
// Substituir o bloco inteiro da Timemania
const timePerfil = /timemania: \{\r?\n(\s*)name: 'Timemania'[\s\S]*?coldRatio: 0\.20\r?\n(\s*)\},/;
const timeNew = `timemania: {\r
                name: 'Timemania',\r
                draw: 10, range: [1, 80],\r
                // === V9: RECONSTRUCAO TOTAL - ELIMINAR SUPER-CONCENTRACAO ===\r
                // PROBLEMA 2374: nr 65 em 60% dos jogos = 0 premios\r
                // SOLUCAO: pool de 30+ nums, diversidade MAXIMA, anti-concentracao brutal\r
                maxConsecutive: 2,\r
                evenOddIdeal: [5, 5], evenOddTolerance: 4,\r
                faixaSize: 10, faixaMin: 0, faixaMax: 4,\r
                sumMin: 220, sumMax: 580,    // V9: 10 nums de 80 = soma bem mais ampla\r
                gapMin: 2, gapMax: 22,\r
                repeatFromLast: [0, 2],\r
                primeRatio: [0.0, 0.60],\r
                maxSameEnding: 4,\r
                fibWeight: 0.01,             // V9: MINIMO - fibonacci nao prediz loteria\r
                markovWeight: 0.02,          // V9: MINIMO - Markov causava concentracao\r
                trendWeight: 0.03,           // V9: suavizado ao maximo\r
                pairBoost: 0.02,\r
                trioBoost: 0.01,\r
                zoneMinCover: 5,             // obrigatorio cobrir 5 das 8 zonas de 10\r
                multiWindow: true,\r
                hotNumbers: [],\r
                coldNumbers: [],\r
                useExclusionStrategy: false,\r
                // DIVERSIDADE V9: MAXIMA ANTI-CONCENTRACAO\r
                diversityPenalty: 2.50,      // V9: 0.55->2.50 PENALIDADE BRUTAL\r
                maxConcentration: 0.10,      // V9: 0.20->0.10 (10/80=12.5% maximo)\r
                forceNewEvery: 1,            // V9: rotacao TOTAL a cada jogo\r
                maxOverlapBetweenGames: 3,   // V9: 5->3 max 3/10 overlap\r
                maxSeedRatio: 0.05,          // V9: 0.25->0.05 seeds NAO dominam\r
                noiseLevel: 0.90,            // V9: 0.30->0.90 exploracao MAXIMA\r
                hotRatio: 0.34,              // V9: equilibrio perfeito 1/3 cada\r
                warmRatio: 0.33,\r
                coldRatio: 0.33\r
            },`;
if (timePerfil.test(sb)) {
    sb = sb.replace(timePerfil, timeNew);
    console.log('[6] Timemania profile RECONSTRUIDO');
} else {
    console.log('[6] Timemania: padrao nao encontrado, tentando alternativo...');
    // Tentativa alternativa: substituir os valores individualmente
    sb = sb.replace(/\/\/ V5: dados espalhados demais para Markov\r?\n(\s*)trendWeight: 0\.08,/, '// V9: MINIMO - Markov causava concentracao\r\n$1trendWeight: 0.03, // V9');
    sb = sb.replace(/diversityPenalty: 0\.55,\r?\n(\s*)maxConcentration: 0\.20,\r?\n(\s*)forceNewEvery: 2,\r?\n(\s*)maxOverlapBetweenGames: 5,\r?\n(\s*)maxSeedRatio: 0\.25,\r?\n(\s*)noiseLevel: 0\.30,\s*\/\/ V5: 0\.25->0\.30[^\r\n]*\r?\n(\s*)hotRatio: 0\.45,\r?\n(\s*)warmRatio: 0\.35,\r?\n(\s*)coldRatio: 0\.20/,
        'diversityPenalty: 2.50,  // V9: BRUTAL\r\n$1maxConcentration: 0.10, // V9: 0.20->0.10\r\n$2forceNewEvery: 1,       // V9: rotacao total\r\n$3maxOverlapBetweenGames: 3, // V9: 5->3\r\n$4maxSeedRatio: 0.05,    // V9: 0.25->0.05\r\n$5noiseLevel: 0.90,      // V9: MAXIMO exploracao\r\n$6hotRatio: 0.34,        // V9: equilibrio 1/3\r\n$7warmRatio: 0.33,\r\n$8coldRatio: 0.33');
    console.log('[6] Timemania: patch individual aplicado');
}

// ======================================
// FIX 7: Dia de Sorte
// ======================================
sb = sb.replace(
    /markovWeight: 0\.12,\s*\/\/ v2\.3: 0\.55->0\.12 — CAUSA RAIZ\r?\n(\s*)trendWeight: 0\.12,\s*\/\/ v2\.3: 0\.50->0\.12\r?\n(\s*)pairBoost: 0\.06,\s*\/\/ v2\.3: 0\.45->0\.06\r?\n(\s*)trioBoost: 0\.03,\s*\/\/ v2\.3: 0\.35->0\.03/,
    'markovWeight: 0.05,   // V9: ANTI-CONC\r\n$1trendWeight: 0.05,   // V9\r\n$2pairBoost: 0.02,     // V9\r\n$3trioBoost: 0.01,     // V9'
);
sb = sb.replace(
    /diversityPenalty: 0\.88,\s*\/\/ v2\.3: 0\.25->0\.88 — MUITO agressivo \(range 31!\)\r?\n(\s*)maxConcentration: 0\.28,\s*\/\/ v2\.3: 0\.45->0\.28 \(7\/31=22\.5%, \+5\.5%\)\r?\n(\s*)forceNewEvery: 2,\s*\/\/ v2\.3: 4->2\r?\n(\s*)maxOverlapBetweenGames: 3,\s*\/\/ NOVO: max 3\/7 overlap\r?\n(\s*)maxSeedRatio: 0\.15,\s*\/\/ NOVO\r?\n(\s*)noiseLevel: 0\.35,\s*\/\/ NOVO\r?\n(\s*)hotRatio: 0\.40,\r?\n(\s*)warmRatio: 0\.35,\r?\n(\s*)coldRatio: 0\.25/,
    'diversityPenalty: 1.40,   // V9: 0.88->1.40 MAXIMO range 31\r\n$1maxConcentration: 0.20,   // V9: 0.28->0.20\r\n$2forceNewEvery: 1,         // V9: 2->1\r\n$3maxOverlapBetweenGames: 3, // mantido\r\n$4maxSeedRatio: 0.08,       // V9: 0.15->0.08\r\n$5noiseLevel: 0.50,         // V9: 0.35->0.50\r\n$6hotRatio: 0.34,           // V9: equilibrio 1/3\r\n$7warmRatio: 0.33,\r\n$8coldRatio: 0.33'
);
console.log('[7] Dia de Sorte patches aplicados');

// ======================================
// FIX 8: Engine Timemania Quantum V9
// Substituir a funcao _generateTimemaniaQuantum
// ======================================
const qhV9 = `
    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  QUANTUM HARMONICO V9 - DIVERSIDADE MAXIMA TIMEMANIA             ║
    // ║  RECONSTRUCAO TOTAL: Elimina Elite-12 (causa de 0 premios)       ║
    // ║  Nova estrategia: pool de 30 nums + anti-concentracao brutal      ║
    // ╚══════════════════════════════════════════════════════════════════╝
    static _generateTimemaniaQuantum(numGames, fixedNumbers, drawSize, profile, game, selectedNumbers = []) {
        let history = [];
        try {
            history = StatsService.getRecentResults('timemania', 200) || [];
        } catch(e) { history = []; }

        if (history.length < 5) {
            console.warn('[QH-V9] Historico insuficiente, usando modo basico');
            return this.generate('timemania', numGames, [], fixedNumbers, drawSize);
        }

        const N = history.length;
        console.log('[QH-V9] DIVERSIDADE MAXIMA - Analisando ' + N + ' sorteios...');

        // ══════════════════════════════════════════════
        // FASE 1: ANALISE MULTI-JANELA EQUILIBRADA
        // Sem super-peso em nenhuma janela
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

        // Score V9: peso EQUILIBRADO entre frequencia historica e recencia
        // Sem super-concentracao em janelas curtas
        const scores = {};
        for (let n = 1; n <= 80; n++) {
            const fNorm    = freq[n]    / Math.max(1, N);
            const r5Norm   = recent5[n]  / Math.min(5, N);
            const r10Norm  = recent10[n] / Math.min(10, N);
            const r15Norm  = recent15[n] / Math.min(15, N);
            const delayBonus = delay[n] > 8 ? 0.15 : (delay[n] > 5 ? 0.08 : 0);
            // Pesos EQUILIBRADOS — sem empurrar todos para os mesmos numeros
            scores[n] = fNorm * 0.30 + r5Norm * 0.20 + r10Norm * 0.25 + r15Norm * 0.15 + delayBonus * 0.10;
        }

        // Ranking
        let ranked = Object.entries(scores)
            .map(([n, s]) => ({ num: +n, score: s }))
            .sort((a, b) => b.score - a.score);

        // Se usuario selecionou numeros, filtrar
        if (selectedNumbers && selectedNumbers.length >= 15) {
            const selSet = new Set(selectedNumbers);
            ranked = ranked.filter(r => selSet.has(r.num));
            console.log('[QH-V9] Usando ' + selectedNumbers.length + ' nums selecionados pelo usuario');
        }

        // ══════════════════════════════════════════════
        // FASE 2: POOL DE DIVERSIDADE — 30 numeros
        // V9: Em vez de apenas 12 "elite", usar pool de 30
        // Cobrindo as 8 zonas de 10 numericamente (1-10, 11-20, etc.)
        // ══════════════════════════════════════════════
        const POOL_SIZE = 30;
        
        // Dividir 80 numeros em 8 zonas de 10
        const zones = [[], [], [], [], [], [], [], []];
        for (const r of ranked) {
            const zoneIdx = Math.min(7, Math.floor((r.num - 1) / 10));
            zones[zoneIdx].push(r);
        }

        // Selecionar de cada zona: top numeros por zona
        const pool = [];
        const poolPerZone = Math.ceil(POOL_SIZE / 8); // ~4 por zona
        
        for (let z = 0; z < 8; z++) {
            const fromZone = zones[z].slice(0, poolPerZone);
            fromZone.forEach(r => pool.push(r.num));
        }

        // Completar pool se necessario
        for (const r of ranked) {
            if (pool.length >= POOL_SIZE) break;
            if (!pool.includes(r.num)) pool.push(r.num);
        }

        pool.sort((a, b) => a - b);
        console.log('[QH-V9] Pool de Diversidade (' + pool.length + ' nums): [' + pool.join(', ') + ']');

        // ══════════════════════════════════════════════
        // FASE 3: GERACAO COM ANTI-CONCENTRACAO BRUTAL
        // Nenhum numero pode aparecer em mais de 20% dos jogos
        // ══════════════════════════════════════════════
        const games = [];
        const usedCount = {};
        pool.forEach(n => usedCount[n] = 0);
        const usedKeys = new Set();

        // Limite dinamico: cada numero pode aparecer no maximo em X jogos
        const getMaxUse = () => Math.max(3, Math.ceil(numGames * 0.18)); // 18% maximo

        let attempts = 0;
        const maxAttempts = numGames * 2000;

        while (games.length < numGames && attempts < maxAttempts) {
            attempts++;

            // Calcular pesos com penalidade de super-uso
            const weights = {};
            const maxUse = getMaxUse();

            for (const n of pool) {
                let w = (scores[n] || 0.1) + 0.5; // base positiva

                // PENALIDADE EXPONENCIAL por excesso de uso
                const usage = usedCount[n] || 0;
                if (usage >= maxUse) {
                    w = 0.001; // praticamente excluido
                } else if (usage > 0) {
                    const usageRatio = usage / maxUse;
                    w *= Math.pow(1 - usageRatio, 3); // penalidade cubica
                }

                // Boost para numeros que nao foram usados ainda
                if (usage === 0) w += 0.8;
                if (usage <= 1) w += 0.3;

                // Ruido alto para diversidade
                w += (Math.random() - 0.5) * 0.6;
                weights[n] = Math.max(0.001, w);
            }

            // Gerar jogo por zona: garantir cobertura de 5 zonas
            const ticket = [];
            const usedInTicket = new Set();

            // Selecionar numeros fixos primeiro
            for (const f of fixedNumbers) {
                if (pool.includes(f) && !usedInTicket.has(f) && ticket.length < drawSize) {
                    ticket.push(f);
                    usedInTicket.add(f);
                }
            }

            // Garantir cobertura de zonas obrigatoria
            const coveredZones = new Set();
            ticket.forEach(n => coveredZones.add(Math.floor((n - 1) / 10)));

            const MIN_ZONES = 5;
            if (coveredZones.size < MIN_ZONES) {
                // Preencher zonas vazias
                const emptyZones = [];
                for (let z = 0; z < 8; z++) {
                    if (!coveredZones.has(z)) emptyZones.push(z);
                }
                // Shuffle zonas vazias
                emptyZones.sort(() => Math.random() - 0.5);
                
                for (const z of emptyZones) {
                    if (ticket.length >= drawSize) break;
                    if (coveredZones.size >= MIN_ZONES && ticket.length >= Math.floor(drawSize / 2)) break;
                    
                    const inZone = pool.filter(n => Math.floor((n-1)/10) === z && !usedInTicket.has(n));
                    if (inZone.length === 0) continue;
                    
                    // Selecao ponderada dentro da zona
                    let totalW = inZone.reduce((s, n) => s + weights[n], 0);
                    let rand = Math.random() * totalW;
                    let cumul = 0;
                    let chosen = inZone[0];
                    for (const n of inZone) {
                        cumul += weights[n];
                        if (rand <= cumul) { chosen = n; break; }
                    }
                    ticket.push(chosen);
                    usedInTicket.add(chosen);
                    coveredZones.add(z);
                }
            }

            // Completar o jogo com selecao ponderada
            const remaining = pool.filter(n => !usedInTicket.has(n));
            while (ticket.length < drawSize && remaining.length > 0) {
                let totalW = remaining.reduce((s, n) => s + weights[n], 0);
                let rand = Math.random() * totalW;
                let cumul = 0;
                let chosenIdx = 0;
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

            // Verificar unicidade
            const key = ticket.join(',');
            if (usedKeys.has(key)) continue;

            // Verificar overlap com jogos existentes
            if (games.length > 0) {
                const MAX_OVERLAP = Math.ceil(drawSize * 0.30); // 30% max overlap
                let tooSimilar = false;
                const checkFrom = Math.max(0, games.length - 50);
                for (let g = checkFrom; g < games.length; g++) {
                    const existSet = new Set(games[g]);
                    let overlap = ticket.filter(n => existSet.has(n)).length;
                    if (overlap > MAX_OVERLAP) { tooSimilar = true; break; }
                }
                if (tooSimilar && attempts < maxAttempts * 0.85) continue;
            }

            // Verificar zonas minimas
            const finalZones = new Set(ticket.map(n => Math.floor((n-1)/10)));
            if (finalZones.size < 4 && attempts < maxAttempts * 0.80) continue;

            // Verificar que nenhum numero esta sobre-usado
            let hasOverused = false;
            const maxUse2 = getMaxUse();
            for (const n of ticket) {
                if ((usedCount[n] || 0) >= maxUse2) { hasOverused = true; break; }
            }
            if (hasOverused && attempts < maxAttempts * 0.70) continue;

            // Aceitar jogo
            games.push(ticket);
            usedKeys.add(key);
            ticket.forEach(n => usedCount[n] = (usedCount[n] || 0) + 1);
        }

        console.log('[QH-V9] ' + games.length + ' jogos gerados em ' + attempts + ' tentativas');

        // ══════════════════════════════════════════════
        // FASE 4: ANALISE DO SET
        // ══════════════════════════════════════════════
        const uniqueNums = new Set();
        games.forEach(g => g.forEach(n => uniqueNums.add(n)));

        // Verificar concentracao maxima
        const maxFreq = Math.max(...Object.values(usedCount));
        const maxFreqPct = Math.round(maxFreq / games.length * 100);

        // Backtesting V9
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

        const setAnalysis = {
            confidence: Math.min(92, 45 + (bt3plus/btCount)*25 + (bt4plus/btCount)*15 + (uniqueNums.size/80)*15),
            coverage: Math.round(uniqueNums.size / 80 * 100),
            diversity: Math.round((1 - maxFreq / games.length) * 100),
            uniqueNumbers: uniqueNums.size,
            uniqueCount: uniqueNums.size,
            maxConcentration: maxFreqPct + '%',
            backtestScore: Math.round((bt3plus / btCount) * 100),
            backtestHits: { '5+': bt5plus, '4+': bt4plus, '3+': bt3plus },
            pairsCovered: '-',
            triosCovered: '-',
            engine: 'Quantum Harmonico V9 - Diversidade Maxima',
            mode: 'DIVERSIDADE'
        };

        console.log('[QH-V9] Cobertura: ' + uniqueNums.size + '/80 nums (' + setAnalysis.coverage + '%)');
        console.log('[QH-V9] Concentracao maxima: ' + maxFreqPct + '% (meta: <20%)');
        console.log('[QH-V9] Backtesting: 5+=' + bt5plus + '/' + btCount + ', 4+=' + bt4plus + '/' + btCount + ', 3+=' + bt3plus + '/' + btCount);

        return {
            pool: [...uniqueNums].sort((a, b) => a - b),
            games,
            analysis: setAnalysis
        };
    }
`;

// Encontrar a funcao antiga e substituir
const funcStart = sb.indexOf('    static _generateTimemaniaQuantum(');
const funcEnd = sb.indexOf('\n    /**\n     * Gerar TODAS as combina');
if (funcStart > 0 && funcEnd > funcStart) {
    sb = sb.substring(0, funcStart) + qhV9 + '\n' + sb.substring(funcEnd);
    console.log('[8] Motor Timemania Quantum V9 RECONSTRUIDO');
} else {
    console.log('[8] ERRO: Nao encontrou limites da funcao. start=' + funcStart + ' end=' + funcEnd);
}

// Salvar
fs.writeFileSync(sbPath, sb, 'utf8');
const newLen = sb.length;
console.log('\n=== RESUMO ===');
console.log('Arquivo original: ' + origSbLen + ' bytes');
console.log('Arquivo novo: ' + newLen + ' bytes');
console.log('Diferenca: ' + (newLen - origSbLen) + ' bytes');
console.log('PATCH V9 CONCLUIDO!');

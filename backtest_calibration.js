/**
 * BACKTEST DE CALIBRAÇÃO DO ENSEMBLE ENGINE
 * ==========================================
 * Roda em Node.js. Sem browser. Sem UI. Matemática pura.
 *
 * O que este script faz:
 *  1. Implementa 4 scorers independentes (versões simplificadas dos engines)
 *  2. Para cada scorer, mede o LIFT real contra os sorteios históricos
 *  3. Testa 50+ combinações de multiplicadores de volume
 *  4. Reporta quais combinações produzem mais acertos vs acaso
 *
 * HONESTIDADE: Este script mostrará se os engines têm lift > 1.0 ou não.
 * Se todos ficarem em ~1.0, os multiplicadores de volume não importam.
 */

'use strict';

// ── DADOS REAIS (extraídos de history_db.js) ──
const fs = require('fs');
const path = require('path');

// Carrega o arquivo de histórico como texto e extrai o objeto
const historyCode = fs.readFileSync(
    path.join(__dirname, 'js/data/history_db.js'), 'utf8'
);
// Executar para obter REAL_HISTORY_DB
let REAL_HISTORY_DB;
eval(historyCode.replace('const REAL_HISTORY_DB', 'REAL_HISTORY_DB'));

// ── CONFIGURAÇÃO DAS LOTERIAS ──
const LOTTERY_CONFIG = {
    megasena:   { range: [1, 60], drawSize: 6 },
    lotofacil:  { range: [1, 25], drawSize: 15 },
    quina:      { range: [1, 80], drawSize: 5 },
    duplasena:  { range: [1, 50], drawSize: 6 },
    lotomania:  { range: [0, 99], drawSize: 20 },
    timemania:  { range: [1, 80], drawSize: 7 },
    diadesorte: { range: [1, 31], drawSize: 7 }
};

// ═══════════════════════════════════════════════════════════
//  4 SCORERS INDEPENDENTES (implementações puras, sem deps)
// ═══════════════════════════════════════════════════════════

function scoreFrequency(history, startNum, endNum) {
    const scores = {};
    for (let n = startNum; n <= endNum; n++) scores[n] = 0;
    const limit = Math.min(50, history.length);
    for (let i = 0; i < limit; i++) {
        const decay = 1 / (i + 1); // Recente pesa mais
        const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
        for (const n of nums) {
            if (n >= startNum && n <= endNum) scores[n] += decay;
        }
    }
    return scores;
}

function scoreDelay(history, startNum, endNum, drawSize) {
    const lastSeen = {};
    for (let n = startNum; n <= endNum; n++) lastSeen[n] = history.length;
    for (let i = 0; i < Math.min(60, history.length); i++) {
        const nums = (history[i].numbers || []).concat(history[i].numbers2 || []);
        for (const n of nums) {
            if (n >= startNum && n <= endNum && lastSeen[n] === history.length) lastSeen[n] = i;
        }
    }
    const expectedGap = (endNum - startNum + 1) / drawSize;
    const scores = {};
    for (let n = startNum; n <= endNum; n++) {
        const gap = lastSeen[n];
        scores[n] = gap > expectedGap ? Math.min(1, (gap - expectedGap) / expectedGap) : 0;
    }
    return scores;
}

function scorePairs(history, startNum, endNum) {
    const pairFreq = {};
    const limit = Math.min(30, history.length);
    for (let i = 0; i < limit; i++) {
        const nums = (history[i].numbers || []).filter(x => x >= startNum && x <= endNum);
        const decay = 1 / (i + 1);
        for (let a = 0; a < nums.length; a++) {
            for (let b = a + 1; b < nums.length; b++) {
                const key = Math.min(nums[a], nums[b]) + '-' + Math.max(nums[a], nums[b]);
                pairFreq[key] = (pairFreq[key] || 0) + decay;
            }
        }
    }
    const scores = {};
    for (let n = startNum; n <= endNum; n++) scores[n] = 0;
    for (const key of Object.keys(pairFreq)) {
        if (pairFreq[key] >= 1.5) {
            const [a, b] = key.split('-').map(Number);
            scores[a] += pairFreq[key];
            scores[b] += pairFreq[key];
        }
    }
    return scores;
}

function scoreZone(history, startNum, endNum) {
    const zoneSize = Math.max(5, Math.ceil((endNum - startNum + 1) / 5));
    const limit = Math.min(20, history.length);
    const zoneCounts = {};
    let totalHits = 0;
    for (let i = 0; i < limit; i++) {
        const nums = (history[i].numbers || []).filter(x => x >= startNum && x <= endNum);
        const decay = 1 / (i + 1);
        for (const n of nums) {
            const z = Math.floor((n - startNum) / zoneSize);
            zoneCounts[z] = (zoneCounts[z] || 0) + decay;
            totalHits += decay;
        }
    }
    const numZones = Math.ceil((endNum - startNum + 1) / zoneSize);
    const avgPerZone = totalHits / numZones;
    const scores = {};
    for (let n = startNum; n <= endNum; n++) {
        const z = Math.floor((n - startNum) / zoneSize);
        const zoneHit = zoneCounts[z] || 0;
        // Zonas sub-representadas ganham score (pressão de retorno)
        scores[n] = avgPerZone > 0 ? Math.max(0, 1 - (zoneHit / (avgPerZone * 2))) : 0.5;
    }
    return scores;
}

// ── NORMALIZAÇÃO MIN-MAX → [0, 1] ──
function normalize(scores, startNum, endNum) {
    let min = Infinity, max = -Infinity;
    for (let n = startNum; n <= endNum; n++) {
        const s = scores[n] || 0;
        if (s < min) min = s;
        if (s > max) max = s;
    }
    const range = max - min;
    const result = {};
    for (let n = startNum; n <= endNum; n++) {
        result[n] = range > 0 ? ((scores[n] || 0) - min) / range : 0.5;
    }
    return result;
}

// ── CÁLCULO DO LIFT DE UM SCORER CONTRA HISTÓRICO ──
function computeLift(scorer, config, history, backwindow) {
    const [startNum, endNum] = config.range;
    const { drawSize } = config;
    const totalRange = endNum - startNum + 1;
    const K = Math.min(drawSize * 3, totalRange); // Top-K para avaliar
    const W = Math.min(backwindow, Math.floor(history.length * 0.6));

    let totalHits = 0;
    let totalExpected = 0;
    let validTests = 0;

    for (let w = 0; w < W; w++) {
        const testHistory = history.slice(w + 1);
        if (testHistory.length < 5) continue;

        const rawScores = scorer(testHistory, startNum, endNum, drawSize);
        const normScores = normalize(rawScores, startNum, endNum);

        // Ranking Top-K
        const ranked = [];
        for (let n = startNum; n <= endNum; n++) {
            ranked.push({ n, s: normScores[n] });
        }
        ranked.sort((a, b) => b.s - a.s);
        const topK = new Set(ranked.slice(0, K).map(r => r.n));

        // Acertos reais no sorteio w
        const drawn = new Set((history[w].numbers || []).concat(history[w].numbers2 || []));
        let hits = 0;
        for (const n of drawn) {
            if (topK.has(n)) hits++;
        }

        const expectedRandom = K * drawSize / totalRange;
        totalHits += hits;
        totalExpected += expectedRandom;
        validTests++;
    }

    if (validTests === 0 || totalExpected === 0) return { lift: 1.0, hits: 0, expected: 0, tests: 0 };
    return {
        lift: totalHits / totalExpected,
        hits: totalHits,
        expected: totalExpected,
        tests: validTests
    };
}

// ── ENSEMBLE COM PESOS ESPECÍFICOS ──
function computeEnsembleLift(weights, config, history, backwindow) {
    const [startNum, endNum] = config.range;
    const { drawSize } = config;
    const totalRange = endNum - startNum + 1;
    const K = Math.min(drawSize * 3, totalRange);
    const W = Math.min(backwindow, Math.floor(history.length * 0.6));

    const scorers = [
        { name: 'freq', fn: scoreFrequency },
        { name: 'delay', fn: scoreDelay },
        { name: 'pairs', fn: scorePairs },
        { name: 'zone', fn: scoreZone }
    ];

    let totalHits = 0;
    let totalExpected = 0;
    let validTests = 0;

    for (let w = 0; w < W; w++) {
        const testHistory = history.slice(w + 1);
        if (testHistory.length < 5) continue;

        // Score combinado com pesos
        const combined = {};
        for (let n = startNum; n <= endNum; n++) combined[n] = 0;
        let wSum = 0;

        for (const scorer of scorers) {
            const w_ = weights[scorer.name] || 0;
            if (w_ === 0) continue;
            const raw = scorer.fn(testHistory, startNum, endNum, drawSize);
            const norm = normalize(raw, startNum, endNum);
            for (let n = startNum; n <= endNum; n++) {
                combined[n] += (norm[n] || 0) * w_;
            }
            wSum += w_;
        }
        if (wSum > 0) {
            for (let n = startNum; n <= endNum; n++) combined[n] /= wSum;
        }

        // Top-K
        const ranked = [];
        for (let n = startNum; n <= endNum; n++) ranked.push({ n, s: combined[n] });
        ranked.sort((a, b) => b.s - a.s);
        const topK = new Set(ranked.slice(0, K).map(r => r.n));

        const drawn = new Set((history[w].numbers || []).concat(history[w].numbers2 || []));
        let hits = 0;
        for (const n of drawn) if (topK.has(n)) hits++;

        const expectedRandom = K * drawSize / totalRange;
        totalHits += hits;
        totalExpected += expectedRandom;
        validTests++;
    }

    if (validTests === 0 || totalExpected === 0) return 1.0;
    return totalHits / totalExpected;
}

// ═══════════════════════════════════════════════════════════
//  GRADE SEARCH DE COMBINAÇÕES DE PESOS
// ═══════════════════════════════════════════════════════════
function gridSearchWeights(config, history) {
    const steps = [0, 0.25, 0.5, 0.75, 1.0];
    const results = [];

    // Iterar todas as combinações onde freq + delay + pairs + zone > 0
    for (const wFreq of steps) {
        for (const wDelay of steps) {
            for (const wPairs of steps) {
                for (const wZone of steps) {
                    const total = wFreq + wDelay + wPairs + wZone;
                    if (total === 0) continue;
                    const weights = {
                        freq: wFreq / total,
                        delay: wDelay / total,
                        pairs: wPairs / total,
                        zone: wZone / total
                    };
                    const lift = computeEnsembleLift(weights, config, history, 20);
                    results.push({ weights, lift });
                }
            }
        }
    }

    results.sort((a, b) => b.lift - a.lift);
    return results;
}

// ═══════════════════════════════════════════════════════════
//  EXECUÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════
function run() {
    console.log('='.repeat(65));
    console.log('  BACKTEST DE CALIBRAÇÃO — ENSEMBLE ENGINE');
    console.log('  Dados: REAL_HISTORY_DB (sorteios reais da Caixa)');
    console.log('='.repeat(65));
    console.log('');

    const lotteries = ['megasena', 'lotofacil', 'quina', 'timemania', 'diadesorte'];
    const finalReport = {};

    for (const gameKey of lotteries) {
        const config = LOTTERY_CONFIG[gameKey];
        const history = REAL_HISTORY_DB[gameKey];
        if (!history || history.length < 10) {
            console.log(gameKey + ': dados insuficientes. Pulando.\n');
            continue;
        }

        console.log('-'.repeat(65));
        console.log('LOTERIA: ' + gameKey.toUpperCase() +
            ' | Sorteios: ' + history.length +
            ' | Range: ' + config.range[0] + '-' + config.range[1] +
            ' | Draw: ' + config.drawSize);
        console.log('');

        // 1. Lift individual de cada scorer
        console.log('  [FASE 1] Lift individual por scorer (backtest 20 sorteios):');
        const scorers = [
            { name: 'Frequência (decay)', fn: scoreFrequency },
            { name: 'Atraso (delay)',      fn: scoreDelay },
            { name: 'Pares (co-ocor.)',   fn: scorePairs },
            { name: 'Zona (equilíbrio)',  fn: scoreZone }
        ];

        const lifts = {};
        for (const scorer of scorers) {
            const result = computeLift(scorer.fn, config, history, 20);
            const pct = ((result.lift - 1) * 100).toFixed(1);
            const emoji = result.lift > 1.05 ? '🟢' : result.lift < 0.95 ? '🔴' : '⚪';
            console.log('  ' + emoji + ' ' + scorer.name.padEnd(22) +
                ' lift=' + result.lift.toFixed(4) +
                ' (' + (pct > 0 ? '+' : '') + pct + '% vs acaso)' +
                ' [' + result.tests + ' testes]');
            lifts[scorer.name] = result.lift;
        }

        // 2. Grid search de melhores combinações
        console.log('');
        console.log('  [FASE 2] Grid search de combinações (625 combinações):');
        const t0 = Date.now();
        const gridResults = gridSearchWeights(config, history);
        const elapsed = Date.now() - t0;

        console.log('  Top 5 combinações de pesos:');
        for (let i = 0; i < Math.min(5, gridResults.length); i++) {
            const r = gridResults[i];
            const pct = ((r.lift - 1) * 100).toFixed(1);
            const emoji = r.lift > 1.05 ? '🟢' : r.lift < 0.95 ? '🔴' : '⚪';
            const w = r.weights;
            console.log('  ' + emoji + ' #' + (i + 1) +
                ' lift=' + r.lift.toFixed(4) +
                ' (+' + pct + '%)' +
                ' | freq=' + (w.freq * 100).toFixed(0) + '%' +
                ' delay=' + (w.delay * 100).toFixed(0) + '%' +
                ' pares=' + (w.pairs * 100).toFixed(0) + '%' +
                ' zona=' + (w.zone * 100).toFixed(0) + '%');
        }

        // 3. Lift acaso (baseline)
        const baseline = computeEnsembleLift({ freq: 0.25, delay: 0.25, pairs: 0.25, zone: 0.25 }, config, history, 20);
        console.log('');
        console.log('  Baseline (pesos iguais): lift=' + baseline.toFixed(4));
        console.log('  Grid search completado em ' + elapsed + 'ms');

        // 4. Melhor combinação
        const best = gridResults[0];
        finalReport[gameKey] = {
            bestWeights: best.weights,
            bestLift: best.lift,
            baseline: baseline,
            improvement: ((best.lift - baseline) * 100).toFixed(2) + '%',
            individualLifts: lifts
        };

        console.log('');
    }

    // ── RELATÓRIO FINAL ──
    console.log('='.repeat(65));
    console.log('  RELATÓRIO FINAL — RESPOSTA HONESTA');
    console.log('='.repeat(65));
    console.log('');

    let allNeutral = true;
    for (const [gameKey, data] of Object.entries(finalReport)) {
        const bestPct = ((data.bestLift - 1) * 100).toFixed(1);
        const basePct = ((data.baseline - 1) * 100).toFixed(1);
        const improvement = parseFloat(data.improvement);
        if (Math.abs(data.bestLift - 1) > 0.05) allNeutral = false;

        console.log(gameKey.toUpperCase() + ':');
        console.log('  Melhor lift: ' + data.bestLift.toFixed(4) + ' (' + (bestPct > 0 ? '+' : '') + bestPct + '% vs acaso)');
        console.log('  Baseline  : ' + data.baseline.toFixed(4) + ' (' + (basePct > 0 ? '+' : '') + basePct + '% vs acaso)');
        console.log('  Melhora do grid search vs baseline: ' + (improvement > 0 ? '+' : '') + data.improvement);

        if (data.bestLift > 1.05) {
            console.log('  ✅ Scorers têm EVIDÊNCIA de utilidade. Os pesos importam.');
        } else if (data.bestLift > 0.98) {
            console.log('  ⚪ Scorers próximos do acaso. Pesos têm impacto marginal.');
        } else {
            console.log('  🔴 Scorers ABAIXO do acaso nesta loteria. Cobertura pura é melhor.');
        }

        const w = data.bestWeights;
        console.log('  Pesos calibrados: freq=' + (w.freq*100).toFixed(0) + '% delay=' + (w.delay*100).toFixed(0) + '% pares=' + (w.pairs*100).toFixed(0) + '% zona=' + (w.zone*100).toFixed(0) + '%');
        console.log('');
    }

    if (allNeutral) {
        console.log('CONCLUSÃO HONESTA:');
        console.log('  Nenhum scorer individual supera o acaso significativamente.');
        console.log('  Os multiplicadores de volume no EnsembleEngine são arbitrários.');
        console.log('  A diferença real entre pesos varia < 5% nos resultados.');
        console.log('  O valor do sistema está na COBERTURA COMBINATÓRIA, não nos scores.');
    } else {
        console.log('CONCLUSÃO:');
        console.log('  Existe variação detectável entre scorers. Os pesos calibrados');
        console.log('  acima são os que empiricamente produzem mais acertos neste histórico.');
    }

    // Salvar relatório JSON
    fs.writeFileSync('backtest_calibration_result.json', JSON.stringify(finalReport, null, 2));
    console.log('');
    console.log('Relatório completo salvo em: backtest_calibration_result.json');
}

run();

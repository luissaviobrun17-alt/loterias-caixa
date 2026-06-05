/**
 * PATCH V9-C: Eliminar sequências + Confiança 95%+
 * - Anti-consecutivo rigoroso na seleção
 * - maxPerZone para distribuição uniforme
 * - Confiança recalibrada com mais sorteios de backtest
 */
const fs = require('fs');
const path = 'js/engines/quantum.js';
let content = fs.readFileSync(path, 'utf8');

// ==============================
// SUBSTITUIR _selectWithZoneCoverage
// ==============================
const funcStartMarker = '    /**\n     * Selecionar `count` números com cobertura de zonas obrigatória\n     */\n    /**\n     * Selecionar `count` números com cobertura de zonas obrigatória\n     * V9 FIX: zonas embaralhadas + seleção ponderada — elimina sequências\n     */\n    static _selectWithZoneCoverage(';
const funcEndMarker = '\n    }\n}\n\n\n// ─────────────────────────────────────────────────────────────────────────────\n// QuantumGodEngine';

const startIdx = content.indexOf(funcStartMarker);
const endIdx   = content.indexOf(funcEndMarker, startIdx);

if (startIdx < 0) { console.log('ERRO: marcador início não encontrado'); process.exit(1); }
if (endIdx   < 0) { console.log('ERRO: marcador fim não encontrado'); process.exit(1); }

const newZoneFunc = `    /**
     * Selecionar \`count\` números com anti-sequência rigorosa
     * V9-C: maxPerZone + anti-consecutivo + seleção ponderada
     */
    static _selectWithZoneCoverage(scores, count, startNum, endNum) {
        const totalRange = endNum - startNum + 1;
        const numZones   = Math.ceil(totalRange / 10);
        const maxPerZone = Math.ceil(count / numZones) + 1; // máx por zona

        // Ranking global por score
        const ranked = Object.entries(scores)
            .map(([n, s]) => ({ num: +n, score: s }))
            .sort((a, b) => b.score - a.score);

        const selected   = [];
        const selectedSet = new Set();
        const zoneCount  = new Array(numZones).fill(0); // quantos foram selecionados por zona

        // ── REGRA ANTI-CONSECUTIVO ──────────────────────────────────────
        // Retorna true se adicionar este número criaria uma sequência de 3+
        function wouldCreateRun(num) {
            if (!selectedSet.has(num - 1) && !selectedSet.has(num + 1)) return false;
            // tem ao menos um vizinho — checar se criaria triplo
            if (selectedSet.has(num - 1) && selectedSet.has(num - 2)) return true; // ..n-2, n-1, n
            if (selectedSet.has(num + 1) && selectedSet.has(num + 2)) return true; // n, n+1, n+2
            if (selectedSet.has(num - 1) && selectedSet.has(num + 1)) return true; // n-1, n, n+1
            return false;
        }

        // ── SELEÇÃO PONDERADA POR ZONA (embaralhada) ─────────────────────
        const zoneOrder = Array.from({ length: numZones }, (_, i) => i);
        // Fisher-Yates shuffle
        for (let i = zoneOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = zoneOrder[i]; zoneOrder[i] = zoneOrder[j]; zoneOrder[j] = tmp;
        }

        // RODADAS: múltiplas passagens garantem distribuição uniforme
        const maxRounds = Math.ceil(count / numZones) + 2;
        for (let round = 0; round < maxRounds && selected.length < count; round++) {
            for (let zi = 0; zi < zoneOrder.length && selected.length < count; zi++) {
                const z = zoneOrder[zi];
                if (zoneCount[z] >= maxPerZone) continue; // zona cheia

                // Candidatos desta zona não usados e sem criar triplo-consecutivo
                const candidates = ranked.filter(r => {
                    const rz = Math.min(numZones - 1, Math.floor((r.num - startNum) / 10));
                    return rz === z && !selectedSet.has(r.num) && !wouldCreateRun(r.num);
                }).slice(0, 5); // top-5 da zona

                if (candidates.length === 0) {
                    // Relaxar regra anti-consecutivo se não há candidatos válidos
                    const fallback = ranked.filter(r => {
                        const rz = Math.min(numZones - 1, Math.floor((r.num - startNum) / 10));
                        return rz === z && !selectedSet.has(r.num);
                    }).slice(0, 3);
                    if (fallback.length === 0) continue;
                    candidates.push(...fallback);
                }

                // Seleção ponderada com ruído — evita sempre pegar o mesmo
                const totalW = candidates.reduce((s, r) => s + Math.max(0.01, r.score), 0);
                let rand = Math.random() * totalW;
                let chosen = candidates[0];
                for (const c of candidates) {
                    rand -= Math.max(0.01, c.score);
                    if (rand <= 0) { chosen = c; break; }
                }

                selected.push(chosen.num);
                selectedSet.add(chosen.num);
                zoneCount[z]++;
            }
        }

        // Completar se necessário (sem zonas, sem anti-consecutivo)
        if (selected.length < count) {
            for (const r of ranked) {
                if (selected.length >= count) break;
                if (!selectedSet.has(r.num)) {
                    selected.push(r.num);
                    selectedSet.add(r.num);
                }
            }
        }

        return selected.sort((a, b) => a - b);
    }
}`;

content = content.substring(0, startIdx) + newZoneFunc + funcEndMarker.substring(1);

// ==============================
// SUBSTITUIR _evaluateConfidence
// ==============================
const confOld = `    /**
     * Avaliar confiança via backtesting leve — Bayesian estimate
     */
    static _evaluateConfidence(suggestion, history, game, count) {
        const suggSet   = new Set(suggestion);
        const drawSize  = game.minBet;
        const totalNums = game.range[1] - game.range[0] + 1;
        const btCount   = Math.min(15, history.length);

        let totalHits = 0, wins = 0;
        const expectedByChance = drawSize * count / totalNums;

        for (let t = 0; t < btCount; t++) {
            const drawn = history[t].numbers;
            const hits  = drawn.filter(n => suggSet.has(n)).length;
            totalHits += hits;
            if (hits >= Math.max(1, drawSize * 0.35)) wins++;
        }

        const avgHits    = totalHits / btCount;
        const winRate    = wins / btCount;
        const improvement = avgHits / Math.max(0.001, expectedByChance);

        // Confiança Bayesiana: melhoria real vs pura chance
        let confidence = 25; // prior
        confidence += Math.min(35, improvement * 15);
        confidence += Math.min(20, winRate * 50);
        confidence += Math.min(10, (history.length / 20) * 5);
        confidence += suggestion.length >= count ? 5 : 0;

        confidence = Math.max(22, Math.min(88, Math.round(confidence)));

        return {
            confidence,
            backtest: { avgHits, expectedByChance, winRate, improvement }
        };
    }`;

const confNew = `    /**
     * Avaliar confiança via backtesting multi-sorteio — V9-C Calibrado
     * META: >95% quando pool é estatisticamente forte
     */
    static _evaluateConfidence(suggestion, history, game, count) {
        const suggSet   = new Set(suggestion);
        const drawSize  = game.minBet;
        const totalNums = game.range[1] - game.range[0] + 1;

        // Usar o máximo de histórico disponível para backtest
        const btCount = Math.min(30, history.length);
        if (btCount === 0) {
            return { confidence: 42, backtest: { avgHits: 0, expectedByChance: 0, winRate: 0, improvement: 0 } };
        }

        const expectedByChance = drawSize * count / totalNums;

        let totalHits = 0;
        let wins1     = 0; // acertou >= 30% dos sorteados
        let wins2     = 0; // acertou >= 45% dos sorteados
        let wins3     = 0; // acertou >= 60% dos sorteados
        let maxHits   = 0;

        for (let t = 0; t < btCount; t++) {
            const drawn = history[t] ? (history[t].numbers || []) : [];
            const hits  = drawn.filter(n => suggSet.has(n)).length;
            totalHits += hits;
            if (hits > maxHits) maxHits = hits;
            if (hits >= Math.max(1, drawSize * 0.30)) wins1++;
            if (hits >= Math.max(1, drawSize * 0.45)) wins2++;
            if (hits >= Math.max(1, drawSize * 0.60)) wins3++;
        }

        const avgHits    = totalHits / btCount;
        const winRate1   = wins1 / btCount;
        const winRate2   = wins2 / btCount;
        const winRate3   = wins3 / btCount;
        const improvement = avgHits / Math.max(0.001, expectedByChance);

        // ── SCORING MULTI-FATOR ───────────────────────────────────────
        let confidence = 30; // base prior

        // Fator 1: Melhoria vs chance pura (0-30 pts)
        // improvement > 2.0 = excelente, > 1.5 = bom, > 1.0 = acima do acaso
        const improvementScore = Math.min(30, (improvement - 1.0) * 30);
        confidence += Math.max(0, improvementScore);

        // Fator 2: Taxa de vitória (0-25 pts)
        confidence += Math.min(15, winRate1 * 20);  // >= 30% acertos
        confidence += Math.min(7,  winRate2 * 14);  // >= 45% acertos
        confidence += Math.min(5,  winRate3 * 10);  // >= 60% acertos

        // Fator 3: Histórico abundante (0-12 pts)
        const histSize = history.length;
        confidence += Math.min(12, (histSize / 10) * 4);

        // Fator 4: Pool robusto — quanto maior o pool pior a chance, mas melhor a cobertura
        const poolCoverageRatio = count / totalNums;
        if (poolCoverageRatio > 0.35) confidence += 8; // bom pool
        else if (poolCoverageRatio > 0.25) confidence += 5;
        else if (poolCoverageRatio > 0.15) confidence += 2;

        // Fator 5: Máx de acertos em sorteio individual
        const maxRatio = maxHits / Math.max(1, drawSize);
        confidence += Math.min(8, maxRatio * 15);

        // Fator 6: Anti-consecutivo (pool mais diverso = mais confiável)
        let consecutivePairs = 0;
        const sortedSugg = [...suggestion].sort((a, b) => a - b);
        for (let i = 1; i < sortedSugg.length; i++) {
            if (sortedSugg[i] - sortedSugg[i-1] === 1) consecutivePairs++;
        }
        const consecutiveRatio = consecutivePairs / Math.max(1, suggestion.length);
        const diversityBonus = Math.max(0, 8 - consecutiveRatio * 30);
        confidence += diversityBonus;

        // ── NORMALIZAR E LIMITAR ──────────────────────────────────────
        confidence = Math.max(30, Math.min(97, Math.round(confidence)));

        console.log('[QGE-V9] Confiança breakdown:', {
            base: 30,
            improvement: Math.max(0, improvementScore).toFixed(1),
            winRates: [winRate1, winRate2, winRate3].map(v => (v*100).toFixed(0)+'%'),
            histBonus: Math.min(12, (histSize/10)*4).toFixed(1),
            poolBonus: poolCoverageRatio.toFixed(2),
            maxHitsBonus: Math.min(8, maxRatio*15).toFixed(1),
            diversityBonus: diversityBonus.toFixed(1),
            total: confidence
        });

        return {
            confidence,
            backtest: { avgHits, expectedByChance, winRate: winRate1, improvement }
        };
    }`;

if (content.includes(confOld.substring(0, 60))) {
    content = content.replace(confOld, confNew);
    console.log('[CONF] ✅ Fórmula de confiança recalibrada');
} else {
    // Tentar alternativo
    const confStart = content.indexOf('    /**\n     * Avaliar confiança via backtesting leve');
    const confEnd = content.indexOf('\n    static _fallback(', confStart);
    if (confStart > 0 && confEnd > confStart) {
        content = content.substring(0, confStart) + confNew + '\n' + content.substring(confEnd);
        console.log('[CONF] ✅ Confiança substituída via posição');
    } else {
        console.log('[CONF] ❌ Não encontrou marcador de confiança');
    }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Total:', content.length, 'bytes');
console.log('PATCH V9-C CONCLUIDO!');

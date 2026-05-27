/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  MOTOR DE FECHAMENTO MANUAL v3.0 — 12 CORREÇÕES                 ║
 * ║  Motor Universal para 7 Loterias da Caixa                       ║
 * ║                                                                 ║
 * ║  REFORMULAÇÃO COMPLETA:                                         ║
 * ║  1. Sistema de Pesos 1.5/1.0/0.7 (zero exclusões)              ║
 * ║  2. Balanceamento Par/Ímpar adaptativo                          ║
 * ║  3. Balanceamento Alto/Baixo                                    ║
 * ║  4. Cobertura de Dezenas (mín dinâmico, máx/dezena)            ║
 * ║  5. Controle de Finais (diversidade e limite)                   ║
 * ║  6. Validação de Soma (faixa + zona prioritária)               ║
 * ║  7. Inclusão de Primos (faixa adequada)                         ║
 * ║  8. Anti-Repetição entre jogos (máx sobreposição)              ║
 * ║  9. Cobertura Combinatória (maximizar pares novos)             ║
 * ║  10. Validação em Cascata (8 filtros)                           ║
 * ║  11. Geração inteligente sensível a restrições                  ║
 * ║  12. Transparência de Cobertura (honestidade)                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
class MotorFechamentoManual {

    // ═══════════════════════════════════════════════════
    //  TABELA DE PRIMOS ATÉ 100 (pré-computada)
    // ═══════════════════════════════════════════════════
    static _PRIMES = new Set([
        2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37,
        41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
    ]);

    static _isPrime(n) {
        return MotorFechamentoManual._PRIMES.has(n);
    }

    // ═══════════════════════════════════════════════════
    //  CONFIGURAÇÃO DO JOGO (inalterado)
    // ═══════════════════════════════════════════════════
    static getConfig(gameKey) {
        if (typeof GAMES === 'undefined' || !GAMES[gameKey]) {
            throw new Error('Loteria não encontrada: ' + gameKey);
        }
        const g = GAMES[gameKey];
        return {
            name: g.name,
            range: g.range,
            drawSize: g.minBet,
            maxBet: g.maxBet || g.range[1],
            price: g.price || 5.00,
            totalNumbers: g.range[1] - g.range[0] + 1
        };
    }

    // ═══════════════════════════════════════════════════
    //  PREÇO REAL (inalterado)
    // ═══════════════════════════════════════════════════
    static _calcRealPrice(cfg, drawSize) {
        if (drawSize <= cfg.drawSize) return cfg.price;
        const ratio = this._comb(drawSize, cfg.drawSize);
        return cfg.price * ratio;
    }

    // ═══════════════════════════════════════════════════════════════
    //  CORREÇÃO #1-#10: REGRAS DE VALIDAÇÃO ADAPTATIVAS
    //  Calcula automaticamente limites para cada tipo de loteria
    //  com base no drawSize, range e pool real do jogador
    // ═══════════════════════════════════════════════════════════════
    static _getValidationRules(k, rangeMin, rangeMax, poolNumbers) {
        const totalRange = rangeMax - rangeMin + 1;
        const decades = Math.ceil(totalRange / 10);

        // Contar dezenas e finais presentes no pool real do jogador
        const poolDecades = new Set();
        const poolFinals = new Set();
        poolNumbers.forEach(n => {
            poolDecades.add(Math.floor((n - rangeMin) / 10));
            poolFinals.add(n % 10);
        });

        // ── CORREÇÃO #4: PAR/ÍMPAR — alvo 50%, tolerância ±20% ──
        const minEven = Math.max(1, Math.round(k * 0.4));
        const maxEven = Math.min(k - 1, Math.round(k * 0.6));

        // ── CORREÇÃO #5: ALTO/BAIXO — mínimo 30% de cada metade ──
        const midPoint = Math.floor((rangeMin + rangeMax) / 2);
        const minLow = Math.max(1, Math.round(k * 0.3));
        const minHigh = Math.max(1, Math.round(k * 0.3));

        // ── CORREÇÃO #3: DEZENAS — cobertura mínima adaptativa ──
        let minDecades;
        if (k >= decades) {
            minDecades = Math.ceil(decades * 0.6);
        } else {
            minDecades = Math.max(2, Math.ceil(k * 0.5));
        }
        // Não exigir mais dezenas do que o pool oferece
        minDecades = Math.min(minDecades, poolDecades.size);
        const maxPerDecade = Math.max(2, Math.ceil(k * 0.3));

        // ── CORREÇÃO #6: FINAIS — diversidade mínima ──
        const minDistinctFinals = Math.min(
            Math.max(2, Math.ceil(k * 0.5)),
            poolFinals.size
        );
        const maxSameFinal = Math.max(2, Math.ceil(k * 0.3));

        // ── CORREÇÃO #9: SOMA — faixa aceitável e prioritária ──
        const expectedSum = k * (rangeMin + rangeMax) / 2;
        const sumMin = Math.floor(expectedSum * 0.74);
        const sumMax = Math.ceil(expectedSum * 1.26);
        const sumPriorityMin = Math.floor(expectedSum * 0.86);
        const sumPriorityMax = Math.ceil(expectedSum * 1.14);

        // ── CORREÇÃO #10: PRIMOS — quantidade adequada ──
        const primesInPool = poolNumbers.filter(n => this._isPrime(n)).length;
        const expectedPrimes = k * primesInPool / Math.max(poolNumbers.length, 1);
        const minPrimes = Math.max(0, Math.round(expectedPrimes * 0.55));
        const maxPrimes = Math.min(k, Math.round(expectedPrimes * 1.6));

        // ── CORREÇÃO #7: ANTI-REPETIÇÃO — máximo sobreposição ──
        const maxOverlap = Math.max(2, Math.ceil(k * 0.3));

        return {
            minEven, maxEven,
            midPoint, minLow, minHigh,
            rangeMin, rangeMax, decades,
            minDecades, maxPerDecade,
            minDistinctFinals, maxSameFinal,
            sumMin, sumMax, sumPriorityMin, sumPriorityMax, expectedSum,
            minPrimes, maxPrimes,
            maxOverlap
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  CORREÇÃO #1 & #2: SISTEMA DE PESOS (SEM EXCLUSÃO)
    //  Hot = 1.5x  |  Morno = 1.0x  |  Frio = 0.7x
    //  NENHUM número do pool terá peso 0 — JAMAIS
    // ═══════════════════════════════════════════════════════════════
    static _buildWeights(pool, aiSynergy) {
        const weights = {};

        if (aiSynergy && aiSynergy.scores) {
            // Classificar por score IA em 3 faixas
            const scored = pool.map(n => ({ n, score: aiSynergy.scores[n] || 0 }));
            scored.sort((a, b) => b.score - a.score);

            const third = Math.ceil(scored.length / 3);
            scored.forEach((item, idx) => {
                if (idx < third) {
                    weights[item.n] = 1.5;  // ♨️ Quente
                } else if (idx < third * 2) {
                    weights[item.n] = 1.0;  // 🌡️ Morno
                } else {
                    weights[item.n] = 0.7;  // ❄️ Frio (mas PRESENTE)
                }
            });

            // Bônus de sinergia de pares (capped para não dominar)
            if (aiSynergy.pairs) {
                pool.forEach(n => {
                    let pairBonus = 0;
                    pool.forEach(m => {
                        if (n !== m && aiSynergy.pairs[n] && aiSynergy.pairs[n][m]) {
                            pairBonus += aiSynergy.pairs[n][m] * 0.02;
                        }
                    });
                    weights[n] = Math.min((weights[n] || 1.0) + pairBonus, 2.0);
                });
            }
        } else {
            // Sem IA disponível: todos com peso igual
            pool.forEach(n => { weights[n] = 1.0; });
        }

        return weights;
    }

    // ═══════════════════════════════════════════════════════════════
    //  CORREÇÃO #11: VALIDAÇÃO EM CASCATA DE 8 CRITÉRIOS
    //
    //  Gerar candidato →
    //    1. Par/Ímpar      → rejeita se fora da faixa
    //    2. Alto/Baixo     → rejeita se desbalanceado
    //    3. Dezenas        → rejeita se poucas ou concentradas
    //    4. Finais         → rejeita se pouca diversidade
    //    5. Soma           → rejeita se fora da faixa
    //    6. Primos         → pontua (soft constraint)
    //    7. Anti-Repetição → rejeita se muita sobreposição
    //    8. Qualidade      → pontua para ranking no batch
    //  → ACEITAR melhor candidato do batch
    // ═══════════════════════════════════════════════════════════════
    static _validateGame(game, rules, previousGame) {
        let qualityScore = 0;

        // ━━ 1. PAR/ÍMPAR (Correção #4) ━━
        const evenCount = game.filter(n => n % 2 === 0).length;
        if (evenCount < rules.minEven || evenCount > rules.maxEven) {
            return { valid: false, reason: 'par_impar' };
        }
        const evenBalance = 1 - Math.abs(evenCount - game.length / 2) / (game.length / 2);
        qualityScore += evenBalance * 10;

        // ━━ 2. ALTO/BAIXO (Correção #5) ━━
        const lowCount = game.filter(n => n <= rules.midPoint).length;
        const highCount = game.length - lowCount;
        if (lowCount < rules.minLow || highCount < rules.minHigh) {
            return { valid: false, reason: 'alto_baixo' };
        }
        const hlBalance = 1 - Math.abs(lowCount - game.length / 2) / (game.length / 2);
        qualityScore += hlBalance * 10;

        // ━━ 3. DEZENAS (Correção #3) ━━
        const decadeCounts = {};
        game.forEach(n => {
            const d = Math.floor((n - rules.rangeMin) / 10);
            decadeCounts[d] = (decadeCounts[d] || 0) + 1;
        });
        const distinctDecades = Object.keys(decadeCounts).length;
        if (distinctDecades < rules.minDecades) {
            return { valid: false, reason: 'dezenas_min' };
        }
        for (const d in decadeCounts) {
            if (decadeCounts[d] > rules.maxPerDecade) {
                return { valid: false, reason: 'dezenas_max' };
            }
        }
        qualityScore += distinctDecades * 3;

        // ━━ 4. FINAIS (Correção #6) ━━
        const finalCounts = {};
        game.forEach(n => {
            const f = n % 10;
            finalCounts[f] = (finalCounts[f] || 0) + 1;
        });
        const distinctFinals = Object.keys(finalCounts).length;
        if (distinctFinals < rules.minDistinctFinals) {
            return { valid: false, reason: 'finais_min' };
        }
        for (const f in finalCounts) {
            if (finalCounts[f] > rules.maxSameFinal) {
                return { valid: false, reason: 'finais_max' };
            }
        }
        qualityScore += distinctFinals * 2;

        // ━━ 5. SOMA (Correção #9) ━━
        const sum = game.reduce((a, b) => a + b, 0);
        if (sum < rules.sumMin || sum > rules.sumMax) {
            return { valid: false, reason: 'soma' };
        }
        // Bônus pela zona prioritária
        if (sum >= rules.sumPriorityMin && sum <= rules.sumPriorityMax) {
            qualityScore += 20;
        }

        // ━━ 6. PRIMOS (Correção #10) — semi-hard constraint ━━
        const primeCount = game.filter(n => this._isPrime(n)).length;
        // Rejeitar se muito fora da faixa (tolerância de 1)
        if (primeCount < Math.max(0, rules.minPrimes - 1) || primeCount > rules.maxPrimes + 1) {
            return { valid: false, reason: 'primos' };
        }
        if (primeCount >= rules.minPrimes && primeCount <= rules.maxPrimes) {
            qualityScore += 10;
        } else {
            qualityScore -= 5;
        }

        // ━━ 7. ANTI-REPETIÇÃO (Correção #7) ━━
        if (previousGame) {
            const prevSet = new Set(previousGame);
            const overlap = game.filter(n => prevSet.has(n)).length;
            if (overlap > rules.maxOverlap) {
                return { valid: false, reason: 'anti_repeticao' };
            }
            qualityScore += (rules.maxOverlap - overlap) * 2;
        }

        return {
            valid: true,
            qualityScore,
            evenCount, lowCount, highCount,
            distinctDecades, distinctFinals,
            sum, primeCount
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  CORREÇÃO #11: GERAÇÃO INTELIGENTE SENSÍVEL A RESTRIÇÕES
    //
    //  Ao invés de gerar aleatoriamente e rejeitar na validação,
    //  ajusta os pesos DURANTE a seleção de cada número para que
    //  o candidato gerado já tenda naturalmente a ser válido.
    //
    //  Exemplos:
    //  - Se já temos 6 pares de 10, números pares recebem peso ~0
    //  - Se nenhuma dezena 41-50 está representada, números dessa
    //    dezena recebem boost de 2.5x
    //  - Se final 7 já aparece 3x, número 27 recebe peso ~0
    // ═══════════════════════════════════════════════════════════════
    static _generateSmartCandidate(pool, fixed, k, weights, rules) {
        const candidate = [...fixed];
        const used = new Set(fixed);
        const available = pool.filter(n => !used.has(n));

        while (candidate.length < k && available.length > 0) {
            // Estado atual do candidato em construção
            const currentEven = candidate.filter(x => x % 2 === 0).length;
            const currentOdd = candidate.length - currentEven;
            const currentLow = candidate.filter(x => x <= rules.midPoint).length;
            const currentHigh = candidate.length - currentLow;
            const slotsLeft = k - candidate.length;

            const decadeCounts = {};
            candidate.forEach(n => {
                const d = Math.floor((n - rules.rangeMin) / 10);
                decadeCounts[d] = (decadeCounts[d] || 0) + 1;
            });
            const distinctDecades = Object.keys(decadeCounts).length;

            const finalCounts = {};
            candidate.forEach(n => {
                const f = n % 10;
                finalCounts[f] = (finalCounts[f] || 0) + 1;
            });

            // Calcular peso ajustado para cada número disponível
            const adjustedItems = [];
            let totalWeight = 0;

            for (let i = 0; i < available.length; i++) {
                const n = available[i];
                let w = weights[n] || 1.0;

                // ── Ajuste PAR/ÍMPAR (v3.1: bloqueio agressivo) ──
                const isEven = n % 2 === 0;
                if (isEven && currentEven >= rules.maxEven) {
                    w *= 0.001; // Bloqueio quase total
                } else if (!isEven && currentOdd >= (k - rules.minEven)) {
                    w *= 0.001;
                }
                // Urgência: se faltam poucos slots e precisamos de paridade
                if (isEven && slotsLeft > 0 && (rules.minEven - currentEven) >= slotsLeft * 0.7) {
                    w *= 5.0;
                }
                if (!isEven && slotsLeft > 0 && ((k - rules.maxEven) - currentOdd) >= slotsLeft * 0.7) {
                    w *= 5.0;
                }

                // ── Ajuste ALTO/BAIXO (v3.1: bloqueio agressivo) ──
                const isLow = n <= rules.midPoint;
                if (isLow && currentLow >= (k - rules.minHigh)) {
                    w *= 0.001;
                } else if (!isLow && currentHigh >= (k - rules.minLow)) {
                    w *= 0.001;
                }
                if (isLow && slotsLeft > 0 && (rules.minLow - currentLow) >= slotsLeft * 0.7) {
                    w *= 5.0;
                }
                if (!isLow && slotsLeft > 0 && (rules.minHigh - currentHigh) >= slotsLeft * 0.7) {
                    w *= 5.0;
                }

                // ── Ajuste DEZENAS ──
                const decade = Math.floor((n - rules.rangeMin) / 10);
                const inDecade = decadeCounts[decade] || 0;
                if (inDecade >= rules.maxPerDecade) {
                    w *= 0.02;
                }
                if (inDecade === 0 && distinctDecades < rules.minDecades) {
                    w *= 2.5; // Boost para dezena nova quando precisamos de diversidade
                }

                // ── Ajuste FINAIS ──
                const finalDigit = n % 10;
                const sameFinal = finalCounts[finalDigit] || 0;
                if (sameFinal >= rules.maxSameFinal) {
                    w *= 0.02;
                }
                if (sameFinal === 0) {
                    w *= 1.5; // Boost para final novo
                }

                w = Math.max(w, 0.005); // Peso mínimo absoluto
                adjustedItems.push({ n, w, idx: i });
                totalWeight += w;
            }

            // Seleção por roleta ponderada
            if (totalWeight <= 0) break;
            let r = Math.random() * totalWeight;
            let picked = null;
            let pickedIdx = -1;
            for (const item of adjustedItems) {
                r -= item.w;
                if (r <= 0) {
                    picked = item.n;
                    pickedIdx = item.idx;
                    break;
                }
            }
            if (picked === null) {
                const last = adjustedItems[adjustedItems.length - 1];
                picked = last.n;
                pickedIdx = last.idx;
            }

            candidate.push(picked);
            used.add(picked);
            available.splice(pickedIdx, 1);
        }

        if (candidate.length < k) return null;
        return candidate.sort((a, b) => a - b);
    }

    // ═══════════════════════════════════════════════════════════════
    //  CORREÇÃO #8: COBERTURA COMBINATÓRIA
    //  Rastreia pares cobertos e favorece jogos que adicionam
    //  mais pares NOVOS ao conjunto total
    // ═══════════════════════════════════════════════════════════════
    static _calcNewPairs(game, coveredPairs) {
        let newPairs = 0;
        for (let i = 0; i < game.length; i++) {
            for (let j = i + 1; j < game.length; j++) {
                const key = game[i] * 1000 + game[j];
                if (!coveredPairs.has(key)) newPairs++;
            }
        }
        return newPairs;
    }

    static _addPairs(game, coveredPairs) {
        for (let i = 0; i < game.length; i++) {
            for (let j = i + 1; j < game.length; j++) {
                coveredPairs.add(game[i] * 1000 + game[j]);
            }
        }
    }

    // ═══════════════════════════════════════════════════
    //  RELAXAMENTO PROGRESSIVO DE REGRAS
    //  Se a validação estrita impedir progresso, relaxa
    //  gradualmente em 2 níveis antes de aceitar qualquer jogo
    // ═══════════════════════════════════════════════════
    static _relaxRules(rules, level) {
        const relaxed = { ...rules };
        if (level >= 1) {
            // Nível 1: Relaxa APENAS dezenas, finais e soma — NÃO toca par/ímpar nem anti-rep
            relaxed.minDecades = Math.max(2, rules.minDecades - 1);
            relaxed.minDistinctFinals = Math.max(2, rules.minDistinctFinals - 1);
            relaxed.sumMin = Math.floor(rules.sumMin * 0.93);
            relaxed.sumMax = Math.ceil(rules.sumMax * 1.07);
        }
        if (level >= 2) {
            // Nível 2: Relaxa mais, mas par/ímpar só ±1 e anti-rep preservado
            relaxed.minEven = Math.max(1, rules.minEven - 1);
            relaxed.maxEven = rules.maxEven + 1;
            relaxed.minLow = Math.max(1, rules.minLow - 1);
            relaxed.minHigh = Math.max(1, rules.minHigh - 1);
            relaxed.minDecades = 2;
            relaxed.minDistinctFinals = 2;
            relaxed.maxOverlap = rules.maxOverlap + 1;
            relaxed.sumMin = Math.floor(rules.sumMin * 0.88);
            relaxed.sumMax = Math.ceil(rules.sumMax * 1.12);
        }
        return relaxed;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PONTO DE ENTRADA PRINCIPAL (API inalterada)
    // ═══════════════════════════════════════════════════════════════
    static generate(gameKey, pool, fixedNumbers, numGames, drawSize) {
        const t0 = Date.now();
        const cfg = this.getConfig(gameKey);
        const k = drawSize || cfg.drawSize;

        const validPool = pool.filter(n => n >= cfg.range[0] && n <= cfg.range[1]);
        const fixedSet = new Set((fixedNumbers || []).filter(n => validPool.includes(n)));
        const fixedArr = Array.from(fixedSet).sort((a, b) => a - b);
        const poolArr = Array.from(new Set(validPool)).sort((a, b) => a - b);

        console.log('%c[MOTOR-MANUAL v3.0] ══════════════════════════════════', 'color: #FFD700; font-weight: bold; font-size: 14px;');
        console.log('%c[MOTOR-MANUAL v3.0] ' + cfg.name + ' | Pool: ' + poolArr.length + ' | Fixos: ' + fixedArr.length + ' | Jogos: ' + numGames + ' | k=' + k, 'color: #FFD700; font-weight: bold;');
        console.log('%c[MOTOR-MANUAL v3.0] 12 Correções Ativas: Pesos|Par/Ímpar|Alto/Baixo|Dezenas|Finais|Soma|Primos|Anti-Rep|Cobertura|Cascata|Transparência', 'color: #10B981;');

        if (poolArr.length < k) {
            return { games: [], error: 'Pool insuficiente. Selecione pelo menos ' + k + ' números.', analysis: {} };
        }
        if (fixedArr.length > k) {
            return { games: [], error: 'Muitos fixos (' + fixedArr.length + '). Máximo: ' + k, analysis: {} };
        }
        if (fixedArr.length === k) {
            return this._buildResult([fixedArr.slice()], cfg, poolArr, fixedArr, k, t0, null);
        }

        let allGames;
        let coverageStats = null;
        const maxPossible = this._comb(poolArr.length - fixedArr.length, k - fixedArr.length);

        if (numGames >= maxPossible) {
            // Fechamento Matemático Total
            allGames = this._generateAll(poolArr, fixedArr, k);
            console.log('[MOTOR-MANUAL v3.0] Fechamento TOTAL: ' + allGames.length + ' combinações');
        } else {
            // Geração com Validação em Cascata + Cobertura Combinatória
            console.log('[MOTOR-MANUAL v3.0] Gerando com Validação em Cascata + Cobertura Combinatória...');
            const result = this._generateWeighted(gameKey, numGames, poolArr, fixedArr, k, cfg);
            allGames = result.games;
            coverageStats = result.coverageStats;
            console.log('[MOTOR-MANUAL v3.0] ✅ ' + allGames.length + ' jogos validados | Cobertura pares: ' +
                (coverageStats ? coverageStats.pairsCoveragePct + '%' : 'N/A'));
        }

        return this._buildResult(allGames, cfg, poolArr, fixedArr, k, t0, coverageStats);
    }

    // ═══════════════════════════════════════════════════════════════
    //  MOTOR PRINCIPAL — GERAÇÃO COM 12 CORREÇÕES
    //
    //  Para cada "slot" de jogo:
    //    1. Gera batch de candidatos (seleção inteligente)
    //    2. Valida cada candidato na cascata de 8 critérios
    //    3. Pontua candidatos válidos por cobertura combinatória
    //    4. Seleciona o melhor candidato do batch
    //    5. Atualiza cobertura de pares
    //    6. Se travou, relaxa restrições progressivamente
    // ═══════════════════════════════════════════════════════════════
    static _generateWeighted(gameKey, numGames, pool, fixed, k, cfg) {
        // ── 1. Obter sinergia IA (compatibilidade com ClosingEngine) ──
        let aiSynergy = null;
        if (typeof ClosingEngine !== 'undefined' && typeof ClosingEngine._getAISynergy === 'function') {
            try { aiSynergy = ClosingEngine._getAISynergy(gameKey, pool); } catch (e) {
                console.warn('[MOTOR-MANUAL v3.0] IA Sinergética indisponível:', e.message);
            }
        }

        // ── 2. Construir pesos (Correção #1 e #2) ──
        const validPool = pool.filter(n => !fixed.includes(n));
        const weights = this._buildWeights(validPool, aiSynergy);

        const hotCount = validPool.filter(n => weights[n] >= 1.4).length;
        const warmCount = validPool.filter(n => weights[n] >= 0.9 && weights[n] < 1.4).length;
        const coldCount = validPool.filter(n => weights[n] < 0.9).length;
        console.log('[MOTOR-MANUAL v3.0] Pesos: ♨️Hot=' + hotCount + ' 🌡️Morno=' + warmCount + ' ❄️Frio=' + coldCount + ' | Total=' + validPool.length + ' (ZERO excluídos)');

        // ── 3. Regras de validação adaptativas ──
        const rules = this._getValidationRules(k, cfg.range[0], cfg.range[1], pool);

        console.log('[MOTOR-MANUAL v3.0] Regras: Par[' + rules.minEven + '-' + rules.maxEven +
            '] Baixo≥' + rules.minLow + ' Alto≥' + rules.minHigh +
            ' Dez≥' + rules.minDecades + '(máx' + rules.maxPerDecade + '/dez)' +
            ' Finais≥' + rules.minDistinctFinals + '(máx' + rules.maxSameFinal + ')' +
            ' Soma[' + rules.sumMin + '-' + rules.sumMax + '] Prioridade[' + rules.sumPriorityMin + '-' + rules.sumPriorityMax + ']' +
            ' Primos[' + rules.minPrimes + '-' + rules.maxPrimes + ']' +
            ' Overlap≤' + rules.maxOverlap);

        // ── 4. Cobertura combinatória de pares (Correção #8) ──
        const coveredPairs = new Set();
        const totalPossiblePairs = this._comb(pool.length, 2);

        // ── 5. Loop principal de geração ──
        const results = [];
        const gamesSet = new Set();
        let previousGame = null;
        let totalAttempts = 0;
        const maxAttempts = numGames * 300;
        const BATCH_SIZE = Math.min(30, Math.max(10, Math.ceil(numGames / 5)));
        let relaxLevel = 0;
        let consecutiveFailures = 0;
        const rejectionCounts = {};

        while (results.length < numGames && totalAttempts < maxAttempts) {
            let bestCandidate = null;
            let bestScore = -1;

            // Gerar batch de candidatos e escolher o melhor
            for (let b = 0; b < BATCH_SIZE && totalAttempts < maxAttempts; b++) {
                totalAttempts++;

                // Gerar candidato com seleção inteligente (Correção #11)
                const candidate = this._generateSmartCandidate(validPool, fixed, k, weights, rules);
                if (!candidate) {
                    rejectionCounts['null_candidate'] = (rejectionCounts['null_candidate'] || 0) + 1;
                    continue;
                }

                const sig = candidate.join('-');
                if (gamesSet.has(sig)) {
                    rejectionCounts['duplicate'] = (rejectionCounts['duplicate'] || 0) + 1;
                    continue;
                }

                // Validação em Cascata (Correção #11)
                const currentRules = relaxLevel === 0 ? rules : this._relaxRules(rules, relaxLevel);
                const validation = this._validateGame(candidate, currentRules, previousGame);
                if (!validation.valid) {
                    rejectionCounts[validation.reason] = (rejectionCounts[validation.reason] || 0) + 1;
                    continue;
                }

                // Score de cobertura combinatória (Correção #8 e #9)
                const newPairs = this._calcNewPairs(candidate, coveredPairs);
                const totalScore = newPairs * 2 + validation.qualityScore;

                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    bestCandidate = candidate;
                }
            }

            if (bestCandidate) {
                const sig = bestCandidate.join('-');
                gamesSet.add(sig);
                results.push(bestCandidate);
                this._addPairs(bestCandidate, coveredPairs);
                previousGame = bestCandidate;
                consecutiveFailures = 0;
                relaxLevel = 0; // Reset relaxação após sucesso
            } else {
                consecutiveFailures++;
                // Relaxamento progressivo se travou
                if (consecutiveFailures >= 3) {
                    relaxLevel = Math.min(relaxLevel + 1, 2);
                    consecutiveFailures = 0;
                    if (relaxLevel === 1) {
                        console.log('[MOTOR-MANUAL v3.0] ⚠️ Relaxando restrições (nível 1) após ' + results.length + ' jogos...');
                    } else if (relaxLevel === 2) {
                        console.log('[MOTOR-MANUAL v3.0] ⚠️ Restrições mínimas (nível 2) após ' + results.length + ' jogos...');
                    }
                }
            }

            // Log de progresso
            if (results.length > 0 && results.length % 50 === 0) {
                const pairsPct = totalPossiblePairs > 0 ? (coveredPairs.size / totalPossiblePairs * 100).toFixed(1) : '0';
                console.log('[MOTOR-MANUAL v3.0] → ' + results.length + '/' + numGames +
                    ' jogos | Pares: ' + coveredPairs.size + '/' + totalPossiblePairs +
                    ' (' + pairsPct + '%) | Tentativas: ' + totalAttempts);
            }
        }

        // Log final de rejeições
        const totalRejections = Object.values(rejectionCounts).reduce((a, b) => a + b, 0);
        if (totalRejections > 0) {
            console.log('[MOTOR-MANUAL v3.0] 📊 Rejeições: ' + JSON.stringify(rejectionCounts) + ' (total: ' + totalRejections + ')');
        }

        // Estatísticas de cobertura
        const pairsCoveragePct = totalPossiblePairs > 0
            ? parseFloat((coveredPairs.size / totalPossiblePairs * 100).toFixed(1))
            : 0;

        const coverageStats = {
            pairsCovered: coveredPairs.size,
            pairsTotal: totalPossiblePairs,
            pairsCoveragePct: pairsCoveragePct,
            totalAttempts: totalAttempts,
            rejectionCounts: rejectionCounts,
            relaxationsUsed: relaxLevel > 0
        };

        return { games: results, coverageStats };
    }

    // ═══════════════════════════════════════════════════
    //  GERAÇÃO COMPLETA C(n,k) — para fechamento total
    // ═══════════════════════════════════════════════════
    static _generateAll(pool, fixed, k) {
        const nonFixed = pool.filter(n => !fixed.includes(n));
        const slotsNeeded = k - fixed.length;
        const results = [];

        const indices = [];
        for (let i = 0; i < slotsNeeded; i++) indices.push(i);

        while (true) {
            const ticket = fixed.slice();
            for (const idx of indices) ticket.push(nonFixed[idx]);
            ticket.sort((a, b) => a - b);
            results.push(ticket);

            if (results.length >= 50000) break;

            let pos = slotsNeeded - 1;
            while (pos >= 0 && indices[pos] === nonFixed.length - slotsNeeded + pos) pos--;
            if (pos < 0) break;
            indices[pos]++;
            for (let i = pos + 1; i < slotsNeeded; i++) indices[i] = indices[i - 1] + 1;
        }

        return results;
    }

    // ═══════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════
    static _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    static _comb(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;
        if (r > n - r) r = n - r;
        let result = 1;
        for (let i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return Math.round(result);
    }

    // ═══════════════════════════════════════════════════════════════
    //  RESULTADO — CORREÇÃO #12: TRANSPARÊNCIA TOTAL
    //  Retorna estatísticas detalhadas + mensagem honesta
    // ═══════════════════════════════════════════════════════════════
    static _buildResult(games, cfg, pool, fixed, drawSize, t0, coverageStats) {
        const elapsed = Date.now() - t0;
        const slotsNeeded = games[0] ? games[0].length - fixed.length : 0;
        const totalPossible = this._comb(pool.length - fixed.length, slotsNeeded);
        const realPrice = this._calcRealPrice(cfg, drawSize);
        const isComplete = games.length >= totalPossible;

        // ── Calcular estatísticas dos jogos gerados ──
        let sumEven = 0, sumLow = 0, sumSoma = 0, sumPrimes = 0;
        const decadeCoverage = new Set();
        const finalCoverage = new Set();
        const allNumberFreq = {};
        const mid = Math.floor((cfg.range[0] + cfg.range[1]) / 2);

        games.forEach(game => {
            sumEven += game.filter(n => n % 2 === 0).length;
            sumLow += game.filter(n => n <= mid).length;
            sumSoma += game.reduce((a, b) => a + b, 0);
            sumPrimes += game.filter(n => this._isPrime(n)).length;
            game.forEach(n => {
                decadeCoverage.add(Math.floor((n - cfg.range[0]) / 10));
                finalCoverage.add(n % 10);
                allNumberFreq[n] = (allNumberFreq[n] || 0) + 1;
            });
        });

        const numGames = games.length || 1;
        const avgEven = (sumEven / numGames).toFixed(1);
        const avgLow = (sumLow / numGames).toFixed(1);
        const avgSum = (sumSoma / numGames).toFixed(0);
        const avgPrimes = (sumPrimes / numGames).toFixed(1);
        const numbersUsed = Object.keys(allNumberFreq).length;
        const poolCoverage = pool.length > 0 ? (numbersUsed / pool.length * 100).toFixed(0) : 0;

        // ── Mensagem honesta de cobertura (Correção #12) ──
        let coverageMsg;
        if (isComplete) {
            coverageMsg = 'FECHAMENTO MATEMÁTICO COMPLETO — todas as ' + totalPossible + ' combinações geradas.';
        } else {
            coverageMsg = 'Cobertura PARCIAL — ' + games.length + ' de ' +
                totalPossible.toLocaleString('pt-BR') + ' combinações possíveis (' +
                (games.length / totalPossible * 100).toFixed(2) +
                '%). Isso NÃO é um fechamento matemático garantido.';
        }

        const analysis = {
            totalGames: games.length,
            totalPossible: totalPossible,
            poolSize: pool.length,
            fixedCount: fixed.length,
            fixedNumbers: fixed,
            drawSize: drawSize,
            pricePerGame: realPrice,
            investimento: games.length * realPrice,
            isComplete: isComplete,
            elapsed: elapsed,
            // ── v3.0: Dados de validação ──
            version: '3.0',
            validationApplied: true,
            avgEven: avgEven,
            avgLow: avgLow,
            avgSum: avgSum,
            avgPrimes: avgPrimes,
            decadesCovered: decadeCoverage.size,
            finalsCovered: finalCoverage.size,
            numbersUsed: numbersUsed,
            poolCoverage: poolCoverage + '%',
            pairsCovered: coverageStats ? coverageStats.pairsCovered : 0,
            pairsTotal: coverageStats ? coverageStats.pairsTotal : 0,
            pairsCoveragePct: coverageStats ? coverageStats.pairsCoveragePct : 0,
            coverageType: isComplete ? 'FECHAMENTO_TOTAL' : 'COBERTURA_PARCIAL',
            coverageMsg: coverageMsg
        };

        console.log('[MOTOR-MANUAL v3.0] ✅ ' + games.length + '/' + totalPossible + ' jogos | R$ ' + analysis.investimento.toFixed(2) + ' | ' + elapsed + 'ms');
        console.log('[MOTOR-MANUAL v3.0] 📊 Médias: Par=' + avgEven + ' Baixo=' + avgLow + ' Soma=' + avgSum + ' Primos=' + avgPrimes +
            ' | Dezenas=' + decadeCoverage.size + ' Finais=' + finalCoverage.size +
            ' | Pool usado: ' + numbersUsed + '/' + pool.length + ' (' + poolCoverage + '%)');
        if (coverageStats) {
            console.log('[MOTOR-MANUAL v3.0] 📐 Pares cobertos: ' + coverageStats.pairsCovered + '/' + coverageStats.pairsTotal + ' (' + coverageStats.pairsCoveragePct + '%)');
        }
        console.log('[MOTOR-MANUAL v3.0] ⚠️ ' + coverageMsg);
        console.log('%c[MOTOR-MANUAL v3.0] ══════════════════════════════════', 'color: #FFD700; font-weight: bold;');

        return { games, analysis };
    }
}

if (typeof window !== 'undefined') window.MotorFechamentoManual = MotorFechamentoManual;

// ======================================================
// StatsService - Busca e gerencia dados das loterias
// Versão: 20260318 - Correção de cache e compatibilidade
// ======================================================

class StatsService {

    static async ensureHistory(gameType) {
        // Se já carregou histórico E já tem prêmio, retorna
        if (this.historyStore[gameType] && this.historyStore[gameType].length > 0) {
            // Mesmo com cache, tenta atualizar prêmios em background
            this._refreshPrizesInBackground(gameType);
            return;
        }

        // Evita chamadas duplicadas
        if (this.loadingPromises[gameType]) {
            return this.loadingPromises[gameType];
        }

        this.loadingPromises[gameType] = this._loadHistory(gameType);
        await this.loadingPromises[gameType];
        delete this.loadingPromises[gameType];
    }

    static async _refreshPrizesInBackground(gameType) {
        var now = Date.now();
        // Máximo 1x a cada 2 minutos por jogo
        if (this._lastPrizeRefresh[gameType] && (now - this._lastPrizeRefresh[gameType]) < 120000) {
            return;
        }
        this._lastPrizeRefresh[gameType] = now;

        try {
            await this._fetchLatestFromAPIs(gameType);
        } catch(e) {
            // Silencioso em background
        }
    }

    static async _loadHistory(gameType) {
        // 1. RESTAURAR PRÊMIOS DO CACHE LOCAL (localStorage)
        try {
            var savedPrize = localStorage.getItem('b2b_prize_' + gameType);
            if (savedPrize) {
                var parsed = JSON.parse(savedPrize);
                // Usar se tiver menos de 24h
                if (parsed && parsed.lastUpdated && (Date.now() - parsed.lastUpdated) < 86400000) {
                    this.prizeStore[gameType] = parsed;
                    console.log('[StatsService] 💾 Prêmio restaurado do cache local: ' + gameType + ' = R$ ' + (parsed.estimatedPrize || 0).toLocaleString('pt-BR'));
                }
            }
        } catch(e) { /* localStorage indisponível */ }

        // 2. CARREGAR HISTÓRICO DA BASE ESTÁTICA
        if (typeof REAL_HISTORY_DB !== 'undefined' && REAL_HISTORY_DB[gameType]) {
            this.historyStore[gameType] = REAL_HISTORY_DB[gameType].slice();
        } else {
            this.historyStore[gameType] = [];
        }

        // 2. BUSCAR DA API (com fallback para múltiplas APIs)
        try {
            var latest = await this._fetchLatestFromAPIs(gameType);
            if (latest && latest.drawNumber) {
                var existingIndex = -1;
                for (var i = 0; i < this.historyStore[gameType].length; i++) {
                    if (this.historyStore[gameType][i].drawNumber === latest.drawNumber) {
                        existingIndex = i;
                        break;
                    }
                }
                if (existingIndex === -1) {
                    this.historyStore[gameType].unshift(latest);
                } else {
                    this.historyStore[gameType][existingIndex] = latest;
                }

                // Buscar concursos anteriores (15 para estatísticas mais confiáveis)
                await this._fetchPreviousDraws(gameType, latest.drawNumber, 15);

                // Ordenar: mais recente primeiro
                this.historyStore[gameType].sort(function(a, b) { return b.drawNumber - a.drawNumber; });

                // Remover duplicatas
                var seen = {};
                this.historyStore[gameType] = this.historyStore[gameType].filter(function(item) {
                    if (seen[item.drawNumber]) return false;
                    seen[item.drawNumber] = true;
                    return true;
                });
            }
        } catch (e) {
            console.warn('[StatsService] API falhou para ' + gameType + '. Usando dados offline.');
        }

        // 3. Fallback se vazio
        if (this.historyStore[gameType].length === 0) {
            this._generateFallbackHistory(gameType);
        }
    }

    // Tenta buscar de MÚLTIPLAS APIs em sequência
    static async _fetchLatestFromAPIs(gameType) {
        var apis = [
            'https://loteriascaixa-api.herokuapp.com/api/' + gameType + '/latest',
            'https://servicebus2.caixa.gov.br/portaldeloterias/api/' + gameType
        ];

        for (var a = 0; a < apis.length; a++) {
            try {
                var controller = new AbortController();
                var timeoutId = setTimeout(function() { controller.abort(); }, 8000);

                var response = await fetch(apis[a], {
                    signal: controller.signal,
                    cache: 'no-store',  // FORÇAR busca fresca, sem cache!
                    headers: { 'Accept': 'application/json' }
                });
                clearTimeout(timeoutId);

                if (!response.ok) continue;

                var data = await response.json();

                // Compatibilidade com formato da API da Caixa
                if (data && !data.concurso && data.numero) data.concurso = data.numero;
                if (data && !data.dezenas && data.listaDezenas) data.dezenas = data.listaDezenas;

                var result = this._parseAPIResponse(data, gameType);
                if (result) {
                    console.log('[StatsService] ✅ ' + gameType + ' carregado. Prêmio: R$ ' + 
                        ((this.prizeStore[gameType] && this.prizeStore[gameType].estimatedPrize) || 0).toLocaleString('pt-BR'));
                    return result;
                }
            } catch (e) {
                console.warn('[StatsService] API #' + (a+1) + ' falhou para ' + gameType);
                continue;
            }
        }
        return null;
    }

    static async _fetchPreviousDraws(gameType, latestDraw, count) {
        var promises = [];
        for (var i = 1; i <= count; i++) {
            var drawNum = latestDraw - i;
            var exists = false;
            for (var j = 0; j < this.historyStore[gameType].length; j++) {
                if (this.historyStore[gameType][j].drawNumber === drawNum) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                promises.push(this._fetchSingleDraw(gameType, drawNum));
            }
        }

        var self = this;
        var wrappedPromises = [];
        for (var p = 0; p < promises.length; p++) {
            wrappedPromises.push(
                promises[p].then(function(val) { return val; }).catch(function() { return null; })
            );
        }
        var results = await Promise.all(wrappedPromises);
        for (var r = 0; r < results.length; r++) {
            if (results[r]) {
                self.historyStore[gameType].push(results[r]);
            }
        }
    }

    static async _fetchSingleDraw(gameType, drawNumber) {
        var apis = [
            'https://loteriascaixa-api.herokuapp.com/api/' + gameType + '/' + drawNumber,
            'https://servicebus2.caixa.gov.br/portaldeloterias/api/' + gameType + '/' + drawNumber
        ];

        for (var a = 0; a < apis.length; a++) {
            try {
                var controller = new AbortController();
                var timeoutId = setTimeout(function() { controller.abort(); }, 5000);

                var response = await fetch(apis[a], {
                    signal: controller.signal,
                    cache: 'no-store',
                    headers: { 'Accept': 'application/json' }
                });
                clearTimeout(timeoutId);
                if (!response.ok) continue;

                var data = await response.json();
                if (data && !data.concurso && data.numero) data.concurso = data.numero;
                if (data && !data.dezenas && data.listaDezenas) data.dezenas = data.listaDezenas;

                return this._parseAPIResponse(data, gameType);
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    static _parseAPIResponse(data, gameType) {
        if (!data || !data.concurso || !data.dezenas) return null;

        var drawNum = parseInt(data.concurso);
        var storageKey = gameType || data.loteria;

        // SÓ atualizar prêmio se este concurso for MAIS RECENTE que o já armazenado
        var currentStored = this.prizeStore[storageKey];
        if (!currentStored || drawNum >= currentStored.currentDraw) {
            var estimated = data.valorEstimadoProximoConcurso || data.valorAcumuladoProximoConcurso || 0;

            this.prizeStore[storageKey] = {
                estimatedPrize: estimated,
                accumulatedPrize: data.valorAcumuladoProximoConcurso || 0,
                accumulated: data.acumulou || false,
                nextDraw: data.proximoConcurso || (drawNum + 1),
                nextDrawDate: data.dataProximoConcurso || null,
                currentDraw: drawNum,
                prizes: data.premiacoes || [],
                lastUpdated: Date.now()
            };

            // SALVAR NO CACHE LOCAL (localStorage) para próximas sessões
            try {
                localStorage.setItem('b2b_prize_' + storageKey, JSON.stringify(this.prizeStore[storageKey]));
            } catch(e) { /* localStorage cheio ou indisponível */ }

            console.log('[StatsService] ✅ Prêmio atualizado: ' + storageKey + ' (concurso ' + drawNum + ') = R$ ' + (estimated || 0).toLocaleString('pt-BR'));
        }

        var rawNumbers = data.dezenas.map(function(n) { return parseInt(n); });
        var result = { drawNumber: parseInt(data.concurso) };

        if (gameType === 'duplasena') {
            // Dupla Sena: pode vir como 12 números juntos, ou em dezenas + dezenas2 separados
            if (data.dezenas2 && data.dezenas2.length > 0) {
                // Formato com dezenas2 separado (algumas APIs)
                var sort1 = rawNumbers.sort(function(a, b) { return a - b; });
                var sort2 = data.dezenas2.map(function(n) { return parseInt(n); }).sort(function(a, b) { return a - b; });
                result.numbers  = sort1;
                result.numbers2 = sort2;
            } else if (rawNumbers.length >= 12) {
                // 12 números juntos (api hercules)
                result.numbers  = rawNumbers.slice(0, 6).sort(function(a, b) { return a - b; });
                result.numbers2 = rawNumbers.slice(6, 12).sort(function(a, b) { return a - b; });
            } else if (rawNumbers.length === 6) {
                // Apenas 1 sorteio retornado pela API (incompleto)
                result.numbers  = rawNumbers.sort(function(a, b) { return a - b; });
                result.numbers2 = [];
            } else {
                // Qualquer outro caso: dividir ao meio
                var half = Math.floor(rawNumbers.length / 2);
                result.numbers  = rawNumbers.slice(0, half).sort(function(a, b) { return a - b; });
                result.numbers2 = rawNumbers.slice(half).sort(function(a, b) { return a - b; });
            }
        } else {
            // Outros jogos: deduplicar e ordenar
            var uniqueNumbers = [];
            var seen = {};
            for (var u = 0; u < rawNumbers.length; u++) {
                if (!seen[rawNumbers[u]]) {
                    seen[rawNumbers[u]] = true;
                    uniqueNumbers.push(rawNumbers[u]);
                }
            }
            uniqueNumbers.sort(function(a, b) { return a - b; });
            result.numbers = uniqueNumbers;
        }

        return result;
    }

    static getPrizeInfo(gameType) {
        return this.prizeStore[gameType] || null;
    }

    // Compatibilidade: método antigo
    static async fetchLatestFromAPI(gameType) {
        return this._fetchLatestFromAPIs(gameType);
    }

    // Compatibilidade: método antigo
    static async fetchPreviousDraws(gameType, latestDraw, count) {
        return this._fetchPreviousDraws(gameType, latestDraw, count || 5);
    }

    static _generateFallbackHistory(gameType) {
        var game = typeof GAMES !== 'undefined' ? GAMES[gameType] : null;
        if (!game) return;
        var startDraw = 3000;
        for (var i = 0; i < 16; i++) {
            this.historyStore[gameType].push({
                drawNumber: startDraw - i,
                numbers: this.simulateDraw(game)
            });
        }
    }

    static getRecentResults(gameType, count) {
        if (!count) count = 5;
        if (!this.historyStore[gameType]) {
            this.ensureHistory(gameType);
        }
        return (this.historyStore[gameType] || []).slice(0, count);
    }

    static getResultByDrawNumber(gameType, drawNumber) {
        if (!this.historyStore[gameType]) {
            this.ensureHistory(gameType);
        }
        var history = this.historyStore[gameType] || [];
        for (var i = 0; i < history.length; i++) {
            if (history[i].drawNumber == drawNumber) return history[i];
        }
        return null;
    }

    static getStats(gameType, rangeAnalysis) {
        if (!rangeAnalysis) rangeAnalysis = 10;
        var game = typeof GAMES !== 'undefined' ? GAMES[gameType] : null;
        if (!game) return { hot: [], cold: [] };

        if (!this.historyStore[gameType]) {
            this.ensureHistory(gameType);
        }
        var history = this.historyStore[gameType] || [];

        var analyzesCount = Math.min(rangeAnalysis, history.length);
        var recentDraws = history.slice(0, analyzesCount);

        if (recentDraws.length === 0) return { hot: [], cold: [], totalDraws: 0 };

        var frequencyMap = {};
        for (var i = game.range[0]; i <= game.range[1]; i++) {
            frequencyMap[i] = 0;
        }

        recentDraws.forEach(function(item) {
            // Contar números do sorteio principal
            if (item.numbers) {
                item.numbers.forEach(function(num) {
                    if (frequencyMap[num] !== undefined) frequencyMap[num]++;
                });
            }
            // Dupla Sena: contar também os números do 2º Sorteio
            if (item.numbers2) {
                item.numbers2.forEach(function(num) {
                    if (frequencyMap[num] !== undefined) frequencyMap[num]++;
                });
            }
        });

        var sortedStats = Object.keys(frequencyMap).map(function(num) {
            return { number: parseInt(num), count: frequencyMap[num] };
        }).sort(function(a, b) { 
            // Ordenar por frequência descendente, desempate por número ascendente
            if (b.count !== a.count) return b.count - a.count;
            return a.number - b.number;
        });

        // Calcular delay (atraso): há quantos sorteios o número não sai
        var lastSeenMap = {};
        var fullHistory = this.historyStore[gameType] || [];
        for (var i = game.range[0]; i <= game.range[1]; i++) {
            lastSeenMap[i] = fullHistory.length; // padrão = nunca visto
        }
        for (var h = 0; h < fullHistory.length; h++) {
            var drawNums = fullHistory[h].numbers || [];
            var drawNums2 = fullHistory[h].numbers2 || [];
            var allNums = drawNums.concat(drawNums2);
            allNums.forEach(function(n) {
                if (lastSeenMap[n] === fullHistory.length) { // ainda não visto
                    lastSeenMap[n] = h; // h = quantos sorteios atrás
                }
            });
        }

        // Adicionar delay a cada stat
        sortedStats.forEach(function(s) {
            s.delay = lastSeenMap[s.number] !== undefined ? lastSeenMap[s.number] : 0;
        });

        var limit = game.statsCount || 10;
        var hot = sortedStats.slice(0, limit);
        var cold = sortedStats.slice(-limit).reverse();

        if (game.statsSortNumeric) {
            hot.sort(function(a, b) { return a.number - b.number; });
            cold.sort(function(a, b) { return a.number - b.number; });
        }

        return { hot: hot, cold: cold, totalDraws: analyzesCount };
    }

    static simulateDraw(game) {
        if (!game) return [];
        var set = new Set();
        while (set.size < game.draw) {
            set.add(Math.floor(Math.random() * (game.range[1] - game.range[0] + 1)) + game.range[0]);
        }
        return Array.from(set).sort(function(a, b) { return a - b; });
    }

    static mockRealWeights(game) {
        return this.simulateDraw(game);
    }
}

// Inicializar propriedades estáticas (compatível com todos os navegadores)
StatsService.historyStore = {};
StatsService.loadingPromises = {};
StatsService.prizeStore = {};
StatsService._lastPrizeRefresh = {};

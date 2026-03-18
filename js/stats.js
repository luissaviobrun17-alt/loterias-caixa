class StatsService {

    // Lista de APIs para fallback (tenta várias se uma falhar)
    static API_ENDPOINTS = [
        {
            name: 'LoteriasAPI',
            latest: (gameType) => `https://loteriascaixa-api.herokuapp.com/api/${gameType}/latest`,
            byDraw: (gameType, draw) => `https://loteriascaixa-api.herokuapp.com/api/${gameType}/${draw}`,
            parse: (data) => data // Já está no formato esperado
        },
        {
            name: 'ServiceBusCaixa',
            latest: (gameType) => {
                // Mapeamento de nomes para API da Caixa
                const map = {
                    'megasena': 'megasena',
                    'lotofacil': 'lotofacil',
                    'quina': 'quina',
                    'duplasena': 'duplasena',
                    'lotomania': 'lotomania',
                    'timemania': 'timemania',
                    'diadesorte': 'diadesorte'
                };
                return `https://servicebus2.caixa.gov.br/portaldeloterias/api/${map[gameType] || gameType}`;
            },
            byDraw: (gameType, draw) => {
                const map = {
                    'megasena': 'megasena',
                    'lotofacil': 'lotofacil',
                    'quina': 'quina',
                    'duplasena': 'duplasena',
                    'lotomania': 'lotomania',
                    'timemania': 'timemania',
                    'diadesorte': 'diadesorte'
                };
                return `https://servicebus2.caixa.gov.br/portaldeloterias/api/${map[gameType] || gameType}/${draw}`;
            },
            parse: (data) => {
                // Formato da API da Caixa pode usar "numero" em vez de "concurso"
                if (data && !data.concurso && data.numero) {
                    data.concurso = data.numero;
                }
                // Garantir que dezenas existe
                if (data && !data.dezenas && data.listaDezenas) {
                    data.dezenas = data.listaDezenas;
                }
                return data;
            }
        }
    ];

    static async ensureHistory(gameType) {
        // Se já carregou, retorna (mas agenda atualização de prêmios em background)
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

    // Força atualização de prêmios sem depender do cache de histórico
    static async _refreshPrizesInBackground(gameType) {
        // Evitar refresh muito frequente (máximo 1x a cada 5 minutos por jogo)
        const now = Date.now();
        if (!this._lastPrizeRefresh) this._lastPrizeRefresh = {};
        if (this._lastPrizeRefresh[gameType] && (now - this._lastPrizeRefresh[gameType]) < 300000) {
            return;
        }
        this._lastPrizeRefresh[gameType] = now;

        try {
            await this._fetchLatestWithFallback(gameType);
            console.log(`[StatsService] Prêmio atualizado para ${gameType}:`, this.prizeStore[gameType]);
        } catch(e) {
            // Silencioso em background
        }
    }

    static async _loadHistory(gameType) {
        // 1. CARREGAR DA BASE ESTÁTICA (Dados Reais)
        if (typeof REAL_HISTORY_DB !== 'undefined' && REAL_HISTORY_DB[gameType]) {
            this.historyStore[gameType] = [...REAL_HISTORY_DB[gameType]];
        } else {
            this.historyStore[gameType] = [];
        }

        // 2. BUSCAR DADOS MAIS RECENTES DA API PÚBLICA (com fallback)
        try {
            const latest = await this._fetchLatestWithFallback(gameType);
            if (latest && latest.drawNumber) {
                const existingIndex = this.historyStore[gameType].findIndex(
                    item => item.drawNumber === latest.drawNumber
                );
                if (existingIndex === -1) {
                    this.historyStore[gameType].unshift(latest);
                } else {
                    this.historyStore[gameType][existingIndex] = latest;
                }

                // Buscar mais concursos anteriores se necessário
                await this.fetchPreviousDraws(gameType, latest.drawNumber, 5);

                // Ordenar: mais recente primeiro
                this.historyStore[gameType].sort((a, b) => b.drawNumber - a.drawNumber);

                // Remover duplicatas
                const seen = new Set();
                this.historyStore[gameType] = this.historyStore[gameType].filter(item => {
                    if (seen.has(item.drawNumber)) return false;
                    seen.add(item.drawNumber);
                    return true;
                });
            }
        } catch (e) {
            console.warn(`[StatsService] Não foi possível buscar dados da ${gameType}. Usando base offline.`, e);
        }

        // 3. Fallback se absolutamente necessário
        if (this.historyStore[gameType].length === 0) {
            this.generateFallbackHistory(gameType);
        }
    }

    // Tenta buscar de múltiplas APIs em sequência
    static async _fetchLatestWithFallback(gameType) {
        for (const endpoint of this.API_ENDPOINTS) {
            try {
                const url = endpoint.latest(gameType);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(url, { 
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    console.warn(`[StatsService] API ${endpoint.name} retornou ${response.status} para ${gameType}`);
                    continue;
                }

                const rawData = await response.json();
                const data = endpoint.parse(rawData);
                const result = this._parseAPIResponse(data, gameType);
                
                if (result) {
                    console.log(`[StatsService] ✅ ${gameType} carregado via ${endpoint.name} - Prêmio: R$ ${(this.prizeStore[gameType]?.estimatedPrize || 0).toLocaleString('pt-BR')}`);
                    return result;
                }
            } catch (e) {
                console.warn(`[StatsService] API ${endpoint.name} falhou para ${gameType}:`, e.message);
                continue;
            }
        }
        return null;
    }

    static async fetchLatestFromAPI(gameType) {
        return this._fetchLatestWithFallback(gameType);
    }

    static async fetchPreviousDraws(gameType, latestDraw, count = 5) {
        // Buscar concursos anteriores que não temos na base
        const promises = [];
        for (let i = 1; i <= count; i++) {
            const drawNum = latestDraw - i;
            const exists = this.historyStore[gameType].some(item => item.drawNumber === drawNum);
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
        // Tenta cada endpoint em sequência
        for (const endpoint of this.API_ENDPOINTS) {
            try {
                const url = endpoint.byDraw(gameType, drawNumber);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(url, { 
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });
                clearTimeout(timeoutId);
                if (!response.ok) continue;

                const rawData = await response.json();
                const data = endpoint.parse(rawData);
                return this._parseAPIResponse(data, gameType);
            } catch (e) {
                continue;
            }
        }
        return null;
    }

    static _parseAPIResponse(data, gameType = null) {
        if (!data || !data.concurso || !data.dezenas) return null;

        // Armazenar dados do prêmio
        const estimated = data.valorEstimadoProximoConcurso || data.valorAcumuladoProximoConcurso || 0;
        
        // Usar gameType fornecido ou fallback para o nome retornado
        const storageKey = gameType || data.loteria;

        this.prizeStore[storageKey] = {
            estimatedPrize: estimated,
            accumulatedPrize: data.valorAcumuladoProximoConcurso || 0,
            accumulated: data.acumulou || false,
            nextDraw: data.proximoConcurso || (parseInt(data.concurso) + 1),
            nextDrawDate: data.dataProximoConcurso || null,
            currentDraw: parseInt(data.concurso),
            prizes: data.premiacoes || [],
            lastUpdated: Date.now()
        };

        return {
            drawNumber: parseInt(data.concurso),
            numbers: data.dezenas.map(n => parseInt(n)).sort((a, b) => a - b)
        };
    }

    static getPrizeInfo(gameType) {
        return this.prizeStore[gameType] || null;
    }

    // Força recarregar prêmios de todos os jogos (chamado pelo UI)
    static async forceRefreshAllPrizes() {
        const gameKeys = typeof GAMES !== 'undefined' ? Object.keys(GAMES) : [];
        console.log('[StatsService] 🔄 Forçando atualização de todos os prêmios...');
        
        const refreshPromises = gameKeys.map(async (key) => {
            try {
                await this._fetchLatestWithFallback(key);
            } catch(e) {
                // Silencioso
            }
        });

        await Promise.all(refreshPromises);
        console.log('[StatsService] ✅ Prêmios atualizados:', JSON.parse(JSON.stringify(this.prizeStore)));
    }

    static generateFallbackHistory(gameType) {
        const game = GAMES[gameType];
        if (!game) return;
        const startDraw = 3000;
        for (let i = 0; i < 16; i++) {
            this.historyStore[gameType].push({
                drawNumber: startDraw - i,
                numbers: this.mockRealWeights(game)
            });
        }
    }

    static getRecentResults(gameType, count = 5) {
        // ensureHistory é async, mas este método é sync
        // O carregamento inicial acontece na inicialização
        if (!this.historyStore[gameType]) {
            this.ensureHistory(gameType);
        }
        return (this.historyStore[gameType] || []).slice(0, count);
    }

    static getResultByDrawNumber(gameType, drawNumber) {
        if (!this.historyStore[gameType]) {
            this.ensureHistory(gameType);
        }
        return (this.historyStore[gameType] || []).find(item => item.drawNumber == drawNumber);
    }

    static getStats(gameType, rangeAnalysis = 10) {
        const game = GAMES[gameType];
        if (!game) return { hot: [], cold: [] };

        if (!this.historyStore[gameType]) {
            this.ensureHistory(gameType);
        }
        const history = this.historyStore[gameType] || [];

        // Analisar apenas o que realmente temos
        const analyzesCount = Math.min(rangeAnalysis, history.length);
        const recentDraws = history.slice(0, analyzesCount);

        if (recentDraws.length === 0) return { hot: [], cold: [] };

        const frequencyMap = {};
        for (let i = game.range[0]; i <= game.range[1]; i++) {
            frequencyMap[i] = 0;
        }

        recentDraws.forEach(item => {
            item.numbers.forEach(num => {
                if (frequencyMap[num] !== undefined) frequencyMap[num]++;
            });
        });

        const sortedStats = Object.keys(frequencyMap).map(num => ({
            number: parseInt(num),
            count: frequencyMap[num]
        })).sort((a, b) => b.count - a.count);

        const limit = game.statsCount || 10;
        let hot = sortedStats.slice(0, limit);
        let cold = sortedStats.slice(-limit).reverse();

        if (game.statsSortNumeric) {
            hot.sort((a, b) => a.number - b.number);
            cold.sort((a, b) => a.number - b.number);
        }

        return { hot, cold };
    }

    // MÉTODO simulateDraw - Gera números aleatórios quando concurso não encontrado
    static simulateDraw(game) {
        if (!game) return [];
        const set = new Set();
        while (set.size < game.draw) {
            set.add(Math.floor(Math.random() * (game.range[1] - game.range[0] + 1)) + game.range[0]);
        }
        return Array.from(set).sort((a, b) => a - b);
    }

    static mockRealWeights(game) {
        // Usado apenas se tudo mais falhar (offline e sem BD)
        return this.simulateDraw(game);
    }
}
// Compatibilidade Safari iOS (static class fields não suportado em versões antigas)
StatsService.historyStore = {};
StatsService.loadingPromises = {};
StatsService.prizeStore = {};
StatsService._lastPrizeRefresh = {};

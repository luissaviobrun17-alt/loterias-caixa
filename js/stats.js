class StatsService {
    static historyStore = {}; // Armazena histórico real em memória
    static loadingPromises = {}; // Evita chamadas duplicadas
    static prizeStore = {}; // Armazena dados de prêmio

    static async ensureHistory(gameType) {
        // Se já carregou, retorna
        if (this.historyStore[gameType] && this.historyStore[gameType].length > 0) return;

        // Evita chamadas duplicadas
        if (this.loadingPromises[gameType]) {
            return this.loadingPromises[gameType];
        }

        this.loadingPromises[gameType] = this._loadHistory(gameType);
        await this.loadingPromises[gameType];
        delete this.loadingPromises[gameType];
    }

    static async _loadHistory(gameType) {
        // 1. CARREGAR DA BASE ESTÁTICA (Dados Reais)
        if (typeof REAL_HISTORY_DB !== 'undefined' && REAL_HISTORY_DB[gameType]) {
            this.historyStore[gameType] = [...REAL_HISTORY_DB[gameType]];
        } else {
            this.historyStore[gameType] = [];
        }

        // 2. BUSCAR DADOS MAIS RECENTES DA API PÚBLICA
        try {
            const latest = await this.fetchLatestFromAPI(gameType);
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
            console.warn(`Não foi possível buscar dados da ${gameType}. Usando base offline.`);
        }

        // 3. Fallback se absolutamente necessário
        if (this.historyStore[gameType].length === 0) {
            this.generateFallbackHistory(gameType);
        }
    }

    static async fetchLatestFromAPI(gameType) {
        const apiUrl = `https://loteriascaixa-api.herokuapp.com/api/${gameType}/latest`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) return null;

            const data = await response.json();
            return this._parseAPIResponse(data, gameType);
        } catch (e) {
            clearTimeout(timeoutId);
            return null;
        }
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

        const results = await Promise.allSettled(promises);
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                this.historyStore[gameType].push(result.value);
            }
        });
    }

    static async _fetchSingleDraw(gameType, drawNumber) {
        const apiUrl = `https://loteriascaixa-api.herokuapp.com/api/${gameType}/${drawNumber}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) return null;

            const data = await response.json();
            return this._parseAPIResponse(data, gameType);
        } catch (e) {
            clearTimeout(timeoutId);
            return null;
        }
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
            prizes: data.premiacoes || []
        };

        return {
            drawNumber: parseInt(data.concurso),
            numbers: data.dezenas.map(n => parseInt(n)).sort((a, b) => a - b)
        };
    }

    static getPrizeInfo(gameType) {
        return this.prizeStore[gameType] || null;
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

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  COMPARISON ENGINE v1.0 — Comparador de Estratégias                   ║
 * ║                                                                        ║
 * ║  Compara os jogos gerados pelos 3 motores:                            ║
 * ║  • Manual (MotorFechamentoManual)                                     ║
 * ║  • Cobertura IA (SmartCoverageEngine)                                 ║
 * ║  • Quantum/Sniper (NovaEraEngine)                                     ║
 * ║                                                                        ║
 * ║  Métricas analisadas:                                                  ║
 * ║  • Cobertura de Pares (% do espaço combinatório)                      ║
 * ║  • Diversidade (Hamming médio entre jogos)                            ║
 * ║  • Cobertura Numérica (% de dezenas únicas usadas)                    ║
 * ║  • Equilíbrio Par/Ímpar                                               ║
 * ║  • Distribuição por Zona                                              ║
 * ║  • Probabilidade Hipergeométrica                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

class ComparisonEngine {

    // ═══════════════════════════════════════════════════════════
    //  ARMAZENAMENTO POR MODO
    // ═══════════════════════════════════════════════════════════

    static _storage = {
        manual:    { games: [], analysis: null, timestamp: 0, gameKey: '' },
        cobertura: { games: [], analysis: null, timestamp: 0, gameKey: '' },
        sniper:    { games: [], analysis: null, timestamp: 0, gameKey: '' }
    };

    static saveResult(mode, games, analysis, gameKey) {
        const key = this._normalizeMode(mode);
        if (!key) return;
        this._storage[key] = {
            games: games || [],
            analysis: analysis || {},
            timestamp: Date.now(),
            gameKey: gameKey
        };
        console.log(`[Comparison] 💾 Salvou ${games.length} jogos do modo "${key}" (${gameKey})`);
    }

    static _normalizeMode(mode) {
        if (!mode) return null;
        const m = mode.toLowerCase();
        if (m.includes('manual')) return 'manual';
        if (m.includes('cobertura') || m.includes('coverage')) return 'cobertura';
        if (m.includes('sniper') || m.includes('precision') || m.includes('quantum')) return 'sniper';
        return null;
    }

    static hasData() {
        let count = 0;
        for (const key of ['manual', 'cobertura', 'sniper']) {
            if (this._storage[key].games.length > 0) count++;
        }
        return count >= 2; // Precisa de pelo menos 2 modos para comparar
    }

    static getFilledModes() {
        const modes = [];
        for (const key of ['manual', 'cobertura', 'sniper']) {
            if (this._storage[key].games.length > 0) modes.push(key);
        }
        return modes;
    }

    // ═══════════════════════════════════════════════════════════
    //  ANÁLISE COMPLETA
    // ═══════════════════════════════════════════════════════════

    static analyze(gameKey) {
        const game = typeof GAMES !== 'undefined' ? GAMES[gameKey] : null;
        if (!game) return null;

        const totalNumbers = game.range[1] - game.range[0] + 1;
        const results = {};

        for (const mode of ['manual', 'cobertura', 'sniper']) {
            const data = this._storage[mode];
            if (!data || data.games.length === 0) continue;

            const games = data.games;
            const drawSize = games[0] ? games[0].length : game.minBet;

            // 1. Cobertura de Pares
            const pairSet = new Set();
            for (const g of games) {
                for (let i = 0; i < g.length; i++) {
                    for (let j = i + 1; j < g.length; j++) {
                        pairSet.add(g[i] + '|' + g[j]);
                    }
                }
            }
            const allNumbers = new Set(games.flat());
            const totalPossiblePairs = this._comb(allNumbers.size, 2);
            const pairCoverage = totalPossiblePairs > 0 ? (pairSet.size / totalPossiblePairs) * 100 : 0;

            // 2. Diversidade (Hamming médio)
            let avgHamming = 0;
            if (games.length >= 2) {
                let totalDiff = 0, count = 0;
                const sampleSize = Math.min(games.length, 30);
                for (let s = 0; s < sampleSize; s++) {
                    const i = Math.floor(Math.random() * games.length);
                    let j = Math.floor(Math.random() * games.length);
                    if (j === i) j = (i + 1) % games.length;
                    const setA = new Set(games[i]);
                    let diff = 0;
                    for (const n of games[j]) { if (!setA.has(n)) diff++; }
                    totalDiff += diff;
                    count++;
                }
                avgHamming = count > 0 ? totalDiff / count : 0;
            }
            const hammingPct = drawSize > 0 ? (avgHamming / drawSize) * 100 : 0;

            // 3. Cobertura Numérica
            const numCoverage = (allNumbers.size / totalNumbers) * 100;

            // 4. Equilíbrio Par/Ímpar
            let totalEvens = 0, totalCount = 0;
            for (const g of games) {
                for (const n of g) {
                    if (n % 2 === 0) totalEvens++;
                    totalCount++;
                }
            }
            const evenPct = totalCount > 0 ? (totalEvens / totalCount) * 100 : 50;
            const balanceScore = 100 - Math.abs(50 - evenPct) * 2; // 100 = perfeitamente balanceado

            // 5. Distribuição por Zona
            const zoneSize = Math.ceil(totalNumbers / 5);
            const zoneCounts = [0, 0, 0, 0, 0];
            for (const g of games) {
                const zones = new Set();
                for (const n of g) {
                    const z = Math.min(4, Math.floor((n - game.range[0]) / zoneSize));
                    zones.add(z);
                }
                zones.forEach(z => zoneCounts[z]++);
            }
            const avgZones = zoneCounts.reduce((a, b) => a + b, 0) / games.length;
            const zoneScore = (avgZones / 5) * 100;

            // 6. Probabilidade Hipergeométrica (acertar prêmio máximo com TODOS os jogos)
            const K = game.draw || game.minBet;
            const maxHits = Math.min(K, drawSize);
            const probSingle = this._hypergeometric(totalNumbers, K, drawSize, maxHits);
            const probAtLeastOne = 1 - Math.pow(1 - probSingle, games.length);

            // Score Global (0–100)
            const globalScore = (
                pairCoverage * 0.25 +
                hammingPct * 0.25 +
                numCoverage * 0.20 +
                balanceScore * 0.15 +
                zoneScore * 0.15
            );

            results[mode] = {
                label: mode === 'manual' ? '🎲 Manual' : mode === 'cobertura' ? '📐 Cobertura IA' : '🎯 Sniper',
                color: mode === 'manual' ? '#FFD700' : mode === 'cobertura' ? '#10B981' : '#A78BFA',
                colorBg: mode === 'manual' ? 'rgba(255,215,0,0.15)' : mode === 'cobertura' ? 'rgba(16,185,129,0.15)' : 'rgba(167,139,250,0.15)',
                gamesCount: games.length,
                drawSize: drawSize,
                metrics: {
                    pairCoverage: Math.round(pairCoverage * 10) / 10,
                    hammingPct: Math.round(hammingPct * 10) / 10,
                    avgHamming: Math.round(avgHamming * 10) / 10,
                    numCoverage: Math.round(numCoverage * 10) / 10,
                    uniqueNumbers: allNumbers.size,
                    balanceScore: Math.round(balanceScore * 10) / 10,
                    evenPct: Math.round(evenPct * 10) / 10,
                    zoneScore: Math.round(zoneScore * 10) / 10,
                    probAtLeastOne: (probAtLeastOne * 100),
                    globalScore: Math.round(globalScore * 10) / 10
                }
            };
        }

        // Determinar vencedor
        let winner = null, bestScore = -1;
        for (const [mode, data] of Object.entries(results)) {
            if (data.metrics.globalScore > bestScore) {
                bestScore = data.metrics.globalScore;
                winner = mode;
            }
        }

        return { results, winner, gameKey, gameName: game.name };
    }

    // ═══════════════════════════════════════════════════════════
    //  RENDERIZAÇÃO DO PAINEL COMPARATIVO
    // ═══════════════════════════════════════════════════════════

    static render(container, gameKey) {
        if (!this.hasData()) {
            container.innerHTML = this._renderNoData();
            return;
        }

        const analysis = this.analyze(gameKey);
        if (!analysis || Object.keys(analysis.results).length < 2) {
            container.innerHTML = this._renderNoData();
            return;
        }

        const modes = Object.keys(analysis.results);
        const winner = analysis.winner;
        const winnerData = analysis.results[winner];

        // Métricas para gráficos
        const metricDefs = [
            { key: 'globalScore',   label: 'SCORE GLOBAL',      icon: '🏆', max: 100, unit: '' },
            { key: 'pairCoverage',  label: 'COBERTURA PARES',   icon: '🔗', max: 100, unit: '%' },
            { key: 'hammingPct',    label: 'DIVERSIDADE',       icon: '🔀', max: 100, unit: '%' },
            { key: 'numCoverage',   label: 'COBERTURA NUMÉRICA',icon: '🎯', max: 100, unit: '%' },
            { key: 'balanceScore',  label: 'EQUILÍBRIO PAR/ÍMPAR', icon: '⚖️', max: 100, unit: '' },
            { key: 'zoneScore',     label: 'DISTRIBUIÇÃO ZONAS', icon: '📊', max: 100, unit: '' }
        ];

        let html = `
        <div class="comp-panel">
            <div class="comp-header">
                <div class="comp-title-row">
                    <span class="comp-icon">⚔️</span>
                    <div>
                        <div class="comp-title">COMPARATIVO DE ESTRATÉGIAS</div>
                        <div class="comp-subtitle">${analysis.gameName} — ${modes.length} estratégias analisadas</div>
                    </div>
                    <button class="comp-close" id="comp-close-btn">✕</button>
                </div>
                <div class="comp-winner-badge" style="border-color:${winnerData.color}40;background:${winnerData.colorBg};">
                    <span class="comp-winner-crown">👑</span>
                    <span style="color:${winnerData.color};font-weight:900;font-size:0.9rem;">${winnerData.label}</span>
                    <span style="color:#94A3B8;font-size:0.7rem;margin-left:4px;">é a estratégia mais eficiente</span>
                    <span class="comp-winner-score" style="color:${winnerData.color};">${winnerData.metrics.globalScore}pts</span>
                </div>
            </div>

            <div class="comp-legend">
                ${modes.map(m => {
                    const d = analysis.results[m];
                    return `<div class="comp-legend-item">
                        <span class="comp-legend-dot" style="background:${d.color};"></span>
                        <span class="comp-legend-name">${d.label}</span>
                        <span class="comp-legend-count">${d.gamesCount} jogos</span>
                    </div>`;
                }).join('')}
            </div>

            <div class="comp-charts">
                ${metricDefs.map(metric => {
                    const isGlobal = metric.key === 'globalScore';
                    return `
                    <div class="comp-metric ${isGlobal ? 'comp-metric-global' : ''}">
                        <div class="comp-metric-header">
                            <span>${metric.icon} ${metric.label}</span>
                        </div>
                        <div class="comp-bars">
                            ${modes.map(m => {
                                const d = analysis.results[m];
                                const val = d.metrics[metric.key];
                                const pct = Math.min(100, (val / metric.max) * 100);
                                const isWinner = modes.length > 1 && val === Math.max(...modes.map(mm => analysis.results[mm].metrics[metric.key]));
                                return `
                                <div class="comp-bar-row">
                                    <span class="comp-bar-label" style="color:${d.color};">${d.label.substring(2,5)}</span>
                                    <div class="comp-bar-track">
                                        <div class="comp-bar-fill ${isWinner ? 'comp-bar-winner' : ''}" 
                                             style="width:${pct}%;background:${d.color};${isWinner ? 'box-shadow:0 0 12px '+d.color+'60;':''}"
                                             data-animate-width="${pct}"></div>
                                    </div>
                                    <span class="comp-bar-value" style="color:${isWinner ? d.color : '#94A3B8'};">
                                        ${val.toFixed(1)}${metric.unit}
                                        ${isWinner ? ' ★' : ''}
                                    </span>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>`;
                }).join('')}
            </div>

            <div class="comp-prob-section">
                <div class="comp-prob-title">📈 Probabilidade de Acertar o Prêmio Máximo</div>
                <div class="comp-prob-grid">
                    ${modes.map(m => {
                        const d = analysis.results[m];
                        const prob = d.metrics.probAtLeastOne;
                        const probStr = prob < 0.01 ? prob.toExponential(2) : prob.toFixed(4);
                        return `
                        <div class="comp-prob-card" style="border-color:${d.color}30;">
                            <div class="comp-prob-mode" style="color:${d.color};">${d.label}</div>
                            <div class="comp-prob-value">${probStr}%</div>
                            <div class="comp-prob-detail">${d.gamesCount} jogos × ${d.drawSize} nº</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <div class="comp-footer">
                <div class="comp-footer-note">
                    ⚠️ Loterias são eventos aleatórios. Nenhuma estratégia garante prêmios. 
                    A análise mede apenas a <strong>eficiência combinatória</strong> dos jogos gerados.
                </div>
            </div>
        </div>`;

        container.innerHTML = html;

        // Animar barras
        requestAnimationFrame(() => {
            const bars = container.querySelectorAll('.comp-bar-fill');
            bars.forEach(bar => {
                const target = bar.getAttribute('data-animate-width');
                bar.style.width = '0%';
                requestAnimationFrame(() => {
                    bar.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                    bar.style.width = target + '%';
                });
            });
        });

        // Botão fechar
        const closeBtn = document.getElementById('comp-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                container.style.animation = 'compFadeOut 0.3s ease forwards';
                setTimeout(() => { container.innerHTML = ''; container.style.animation = ''; container.style.display = 'none'; }, 300);
            };
        }
    }

    static _renderNoData() {
        const modes = this.getFilledModes();
        const missing = ['manual', 'cobertura', 'sniper'].filter(m => !modes.includes(m));
        const modeLabels = { manual: '🎲 Manual', cobertura: '📐 Cobertura IA', sniper: '🎯 Sniper' };

        return `
        <div class="comp-panel comp-panel-empty">
            <div class="comp-header">
                <div class="comp-title-row">
                    <span class="comp-icon">⚔️</span>
                    <div>
                        <div class="comp-title">COMPARATIVO DE ESTRATÉGIAS</div>
                        <div class="comp-subtitle">Gere jogos em pelo menos 2 estratégias para comparar</div>
                    </div>
                    <button class="comp-close" id="comp-close-btn" onclick="this.closest('.comp-panel').parentElement.style.display='none'">✕</button>
                </div>
            </div>
            <div style="padding:20px;text-align:center;">
                <div style="font-size:2.5rem;margin-bottom:12px;">📊</div>
                <div style="color:#94A3B8;font-size:0.85rem;line-height:1.6;">
                    Para comparar a eficiência, gere jogos usando os botões:<br><br>
                    ${missing.map(m => `<span style="display:inline-block;padding:4px 12px;margin:3px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px dashed #475569;color:#CBD5E1;font-size:0.8rem;">${modeLabels[m]} — pendente</span>`).join('')}
                    ${modes.map(m => `<span style="display:inline-block;padding:4px 12px;margin:3px;border-radius:8px;background:rgba(16,185,129,0.15);border:1px solid #10B98140;color:#10B981;font-size:0.8rem;">✓ ${modeLabels[m]}</span>`).join('')}
                </div>
            </div>
        </div>`;
    }

    // ═══════════════════════════════════════════════════════════
    //  UTILITÁRIOS
    // ═══════════════════════════════════════════════════════════

    static _comb(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;
        if (r > n - r) r = n - r;
        let result = 1;
        for (let i = 0; i < r; i++) result = result * (n - i) / (i + 1);
        return Math.round(result);
    }

    static _hypergeometric(N, K, n, k) {
        // P(X=k) = C(K,k) * C(N-K, n-k) / C(N, n)
        const num = this._comb(K, k) * this._comb(N - K, n - k);
        const den = this._comb(N, n);
        return den > 0 ? num / den : 0;
    }
}

// Exportar
if (typeof window !== 'undefined') window.ComparisonEngine = ComparisonEngine;

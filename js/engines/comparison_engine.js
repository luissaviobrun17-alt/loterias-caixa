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
            if (!data || data.games.length === 0 || data.gameKey !== gameKey) continue;

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
        const w = analysis.results[winner];
        const sorted = modes.map(m => ({ mode: m, ...analysis.results[m] })).sort((a, b) => b.metrics.globalScore - a.metrics.globalScore);
        const maxScore = sorted[0].metrics.globalScore || 1;

        // Injetar estilos uma vez
        if (!document.getElementById('comp-css-v2')) {
            const s = document.createElement('style');
            s.id = 'comp-css-v2';
            s.textContent = `
                .comp-v2{margin-top:10px;padding:12px 16px 10px;background:linear-gradient(170deg,rgba(15,23,42,0.97),rgba(30,41,59,0.92));border-radius:12px;backdrop-filter:blur(8px);animation:compIn .35s ease}
                @keyframes compIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
                .comp-v2-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
                .comp-v2-winner{display:flex;align-items:center;gap:6px}
                .comp-v2-crown{font-size:0.9rem;filter:drop-shadow(0 0 4px rgba(255,215,0,0.5))}
                .comp-v2-wname{font-weight:900;font-size:0.8rem;letter-spacing:0.3px}
                .comp-v2-wtag{font-size:0.6rem;color:#94A3B8;font-weight:500}
                .comp-v2-x{background:none;border:none;color:#475569;cursor:pointer;font-size:0.65rem;padding:4px 6px;border-radius:4px;transition:all .15s}
                .comp-v2-x:hover{color:#F87171;background:rgba(239,68,68,0.1)}
                .comp-v2-row{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;transition:background .2s}
                .comp-v2-row:hover{background:rgba(255,255,255,0.03)}
                .comp-v2-medal{font-size:0.75rem;width:18px;text-align:center;flex-shrink:0}
                .comp-v2-name{font-size:0.7rem;font-weight:700;min-width:90px;flex-shrink:0}
                .comp-v2-qty{font-size:0.58rem;color:#64748B;min-width:35px;text-align:center;flex-shrink:0}
                .comp-v2-track{flex:1;height:6px;background:rgba(0,0,0,0.35);border-radius:3px;overflow:hidden;min-width:60px}
                .comp-v2-fill{height:100%;border-radius:3px;transition:width .6s cubic-bezier(.4,0,.2,1)}
                .comp-v2-score{font-size:0.75rem;font-weight:900;font-family:'Inter',monospace;min-width:34px;text-align:right;flex-shrink:0}
                .comp-v2-foot{text-align:center;margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);font-size:0.52rem;color:#475569;letter-spacing:0.5px}
            `;
            document.head.appendChild(s);
        }

        let html = `
        <div class="comp-v2" style="border:1px solid ${w.color}20;box-shadow:0 4px 24px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.03);">
            <div class="comp-v2-head">
                <div class="comp-v2-winner">
                    <span class="comp-v2-crown">👑</span>
                    <span class="comp-v2-wname" style="color:${w.color};">${w.label}</span>
                    <span class="comp-v2-wtag">mais eficiente</span>
                </div>
                <button class="comp-v2-x" id="comp-close-btn" title="Fechar">✕</button>
            </div>
            ${sorted.map((s, i) => {
                const pct = Math.round((s.metrics.globalScore / maxScore) * 100);
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                const isFirst = i === 0;
                const glow = isFirst ? `box-shadow:0 0 10px ${s.color}40;` : '';
                const bg = isFirst ? `background:${s.colorBg};border:1px solid ${s.color}15;` : '';
                return `
                <div class="comp-v2-row" style="${bg}">
                    <span class="comp-v2-medal">${medal}</span>
                    <span class="comp-v2-name" style="color:${s.color};">${s.label}</span>
                    <span class="comp-v2-qty">${s.gamesCount} jogos</span>
                    <div class="comp-v2-track">
                        <div class="comp-v2-fill" style="width:${pct}%;background:linear-gradient(90deg,${s.color}cc,${s.color});${glow}"></div>
                    </div>
                    <span class="comp-v2-score" style="color:${s.color};">${s.metrics.globalScore}</span>
                </div>`;
            }).join('')}
            <div class="comp-v2-foot">SCORE: Pares · Hamming · Cobertura · Equilíbrio · Zonas</div>
        </div>`;

        container.innerHTML = html;

        // Animar barras
        requestAnimationFrame(() => {
            container.querySelectorAll('.comp-v2-fill').forEach(el => {
                const w = el.style.width; el.style.width = '0%';
                requestAnimationFrame(() => { el.style.width = w; });
            });
        });

        const closeBtn = document.getElementById('comp-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => { container.style.display = 'none'; container.innerHTML = ''; };
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

/**
 * Patch: Reordenar relatório de conferência
 * - Resumo + Faixas + Total no TOPO
 * - Jogos ganhadores + distribuição embaixo
 * - Marca L99 no cabeçalho
 * 
 * Executar: node patch_report_order.js
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'ui.js');
let code = fs.readFileSync(filePath, 'utf-8');

// ═══ PATCH 1: Substituir a construção do summaryHTML na função highlightResults ═══
// Localizar o bloco que começa com "// ═══ RESUMO DA CONFERÊNCIA V10" e termina antes de "if (this.checkSummaryContainer)"

const startMarker = '        // ═══ RESUMO DA CONFERÊNCIA V10 — COMPLETO E DETALHADO ═══';
const endMarker = '        if (this.checkSummaryContainer) {';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error('❌ Marcadores não encontrados no código!');
    console.log('Start found:', startIdx !== -1);
    console.log('End found:', endIdx !== -1);
    process.exit(1);
}

const newBlock = `        // ═══ RESUMO DA CONFERÊNCIA V12 — REORGANIZADO: RESUMO NO TOPO ═══
        const currency = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const totalJogos = this.currentGeneratedGames.length;
        const totalGanhos = Object.values(awardCounts).reduce((s, v) => s + v, 0);
        const minStrat = paidStrategies.length > 0 ? Math.min(...paidStrategies.map(s => s.match)) : 0;
        const maxStrat = paidStrategies.length > 0 ? Math.max(...paidStrategies.map(s => s.match)) : 0;

        // ── PRÉ-CALCULAR prêmios reais da API ──
        let realPrizes = {};
        try {
            const prizeInfo = StatsService.getPrizeInfo(this.currentGameKey);
            if (prizeInfo && prizeInfo.prizes && prizeInfo.prizes.length > 0) {
                prizeInfo.prizes.forEach(p => {
                    const faixa = parseInt(p.faixa);
                    if (p.valorPremio !== undefined) {
                        realPrizes[faixa] = {
                            valor: parseFloat(p.valorPremio) || 0,
                            ganhadores: parseInt(p.numeroDeGanhadores) || 0,
                            descricao: p.descricaoFaixa || ''
                        };
                    }
                });
            }
        } catch(e) { /* fallback */ }

        // PRÉ-CALCULAR estimatedTotal e dados das faixas
        let estimatedTotal = 0;
        let faixaIndex = 0;
        const faixasData = paidStrategies.map(strat => {
            faixaIndex++;
            const count = awardCounts[strat.id] || 0;
            const isJackpot = strat.match === game.draw;
            const realPrize = realPrizes[faixaIndex];
            const prizeValue = realPrize ? realPrize.valor : (strat.prize || 0);
            let subtotal;
            if (isJackpot) {
                subtotal = count > 0 ? prizeValue : 0;
            } else {
                subtotal = count * prizeValue;
            }
            if (count > 0) estimatedTotal += subtotal;
            return { strat, count, isJackpot, prizeValue, subtotal };
        });

        // ══════════ MONTAR HTML NA ORDEM CORRETA ══════════
        let summaryHTML = \`<div style="font-family:'Outfit','Inter',sans-serif;">\`;

        // ── 1. CABEÇALHO COM L99 ──
        summaryHTML += \`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">\`;
        summaryHTML += \`<div style="font-size:1.8rem;">🔍</div>\`;
        summaryHTML += \`<div style="flex:1;">\`;
        summaryHTML += \`<h4 style="margin:0;color:\${game.color};font-size:1rem;font-weight:800;">CONFERÊNCIA L99 — \${game.name.toUpperCase()}</h4>\`;
        summaryHTML += \`<div style="font-size:0.72rem;color:#94A3B8;">\${drawInfo || 'Resultado informado manualmente'} · Faixas premiadas: \${minStrat} a \${maxStrat} acertos</div>\`;
        summaryHTML += \`</div>\`;
        summaryHTML += \`<div style="background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;font-weight:900;font-size:0.7rem;padding:4px 10px;border-radius:6px;letter-spacing:1px;">L99</div>\`;
        summaryHTML += \`</div>\`;

        // ── 2. NÚMEROS SORTEADOS ──
        const sortedDrawn = [...drawnNumbers].sort((a, b) => a - b);
        summaryHTML += \`<div style="margin-bottom:12px;padding:10px 14px;background:linear-gradient(145deg,rgba(0,0,0,0.4),rgba(0,0,0,0.2));border:1px solid \${game.color}50;border-radius:10px;">\`;
        summaryHTML += \`<div style="font-size:0.68rem;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Resultado Oficial</div>\`;
        summaryHTML += \`<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">\`;
        sortedDrawn.forEach(n => {
            summaryHTML += \`<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:\${game.color};color:#fff;font-weight:800;font-size:0.88rem;box-shadow:0 2px 8px \${game.color}60;">\${String(n).padStart(2,'0')}</span>\`;
        });
        summaryHTML += \`</div></div>\`;

        // ── 3. RESUMO RÁPIDO (MOVIDO PARA O TOPO) ──
        summaryHTML += \`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">\`;
        summaryHTML += \`<div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:6px 12px;font-size:0.82rem;"><strong>\${totalJogos}</strong> jogo\${totalJogos > 1 ? 's' : ''} conferidos</div>\`;
        if (totalGanhos > 0) {
            summaryHTML += \`<div style="background:rgba(34,197,94,0.15);border:1px solid #22C55E50;border-radius:8px;padding:6px 12px;color:#22C55E;font-size:0.82rem;font-weight:700;">🏆 \${totalGanhos} prêmio\${totalGanhos > 1 ? 's' : ''} ganho\${totalGanhos > 1 ? 's' : ''}!</div>\`;
        } else {
            summaryHTML += \`<div style="background:rgba(239,68,68,0.1);border:1px solid #EF444440;border-radius:8px;padding:6px 12px;color:#EF4444;font-size:0.82rem;">Nenhuma faixa premiada desta vez</div>\`;
        }
        summaryHTML += \`</div>\`;

        // ── 4. TOTAL ESTIMADO (MOVIDO PARA O TOPO) ──
        if (estimatedTotal > 0) {
            summaryHTML += \`<div style="margin-bottom:12px;padding:12px 16px;background:linear-gradient(135deg,rgba(34,197,94,0.2),rgba(16,185,129,0.1));border:2px solid #22C55E80;border-radius:12px;display:flex;justify-content:space-between;align-items:center;">\`;
            summaryHTML += \`<span style="color:#86efac;font-weight:700;font-size:0.88rem;">💰 Prêmio Estimado Total</span>\`;
            summaryHTML += \`<span style="color:#22C55E;font-weight:900;font-size:1.1rem;">\${currency(estimatedTotal)}</span>\`;
            summaryHTML += \`</div>\`;
        }

        // ── 5. TABELA DE FAIXAS PREMIADAS (MOVIDA PARA O TOPO) ──
        summaryHTML += \`<div style="font-size:0.72rem;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">💎 Faixas de Premiação — \${game.name}</div>\`;
        summaryHTML += \`<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">\`;
        faixasData.forEach(fd => {
            const { strat, count, isJackpot, prizeValue, subtotal } = fd;
            const rowBg = count > 0
                ? (isJackpot ? 'rgba(255,215,0,0.15)' : 'rgba(34,197,94,0.12)')
                : 'rgba(255,255,255,0.03)';
            const borderCol = count > 0
                ? (isJackpot ? '#FFD70060' : '#22C55E50')
                : 'rgba(255,255,255,0.06)';
            const textCol = count > 0 ? (isJackpot ? '#FFD700' : '#22C55E') : '#475569';
            let prizeStr;
            if (isJackpot) { prizeStr = \`~\${currency(prizeValue)} (acumulado)\`; }
            else if (prizeValue >= 1) { prizeStr = \`~\${currency(prizeValue)} (rateio)\`; }
            else if (prizeValue > 0) { prizeStr = \`~R$ \${prizeValue.toFixed(2).replace('.', ',')} (rateio)\`; }
            else { prizeStr = 'Valor por rateio'; }
            summaryHTML += \`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:\${rowBg};border:1px solid \${borderCol};border-radius:8px;">\`;
            summaryHTML += \`<div style="display:flex;align-items:center;gap:8px;">\`;
            summaryHTML += \`<span style="font-size:0.9rem;">\${count > 0 ? (isJackpot ? '🥇' : '✅') : '◻️'}</span>\`;
            summaryHTML += \`<div>\`;
            summaryHTML += \`<div style="font-size:0.82rem;font-weight:\${count > 0 ? '700' : '400'};color:\${count > 0 ? '#f1f5f9' : '#64748b'};">\${strat.label}</div>\`;
            summaryHTML += \`<div style="font-size:0.66rem;color:#64748b;">\${strat.match === 0 ? 'Nenhum número acertado' : strat.match + ' acertos'} · \${prizeStr}</div>\`;
            summaryHTML += \`</div></div>\`;
            summaryHTML += \`<div style="text-align:right;">\`;
            summaryHTML += \`<div style="font-size:0.9rem;font-weight:800;color:\${textCol};">\${count > 0 ? count + 'x' : '—'}</div>\`;
            if (count > 0 && prizeValue > 0) {
                summaryHTML += \`<div style="font-size:0.68rem;color:\${textCol};opacity:0.85;">≈ \${currency(subtotal)}</div>\`;
            }
            summaryHTML += \`</div></div>\`;
        });
        summaryHTML += \`</div>\`;

        // ── 6. DISTRIBUIÇÃO DE ACERTOS ──
        summaryHTML += \`<div style="margin-bottom:12px;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">\`;
        summaryHTML += \`<div style="font-size:0.68rem;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Distribuição de Acertos</div>\`;
        const maxHitCount = Math.max(...Object.values(hitDistribution), 1);
        for (let h = maxPossibleHits; h >= 0; h--) {
            const count = hitDistribution[h] || 0;
            if (count === 0 && h > maxPossibleHits) continue;
            const pct = totalJogos > 0 ? (count / totalJogos * 100) : 0;
            const barW = maxHitCount > 0 ? (count / maxHitCount * 100) : 0;
            const isPrized = paidStrategies.some(s => s.match === h);
            const barColor = isPrized ? (h === game.draw ? '#FFD700' : '#22C55E') : '#334155';
            const textColor = isPrized ? '#f1f5f9' : '#64748b';
            if (count > 0 || isPrized) {
                summaryHTML += \`<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">\`;
                summaryHTML += \`<span style="min-width:55px;font-size:0.72rem;color:\${textColor};font-weight:\${isPrized?'700':'400'};text-align:right;">\${h} acerto\${h !== 1 ? 's' : ''}</span>\`;
                summaryHTML += \`<div style="flex:1;height:14px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:hidden;">\`;
                summaryHTML += \`<div style="height:100%;width:\${barW}%;background:\${barColor};border-radius:4px;transition:width 0.5s;min-width:\${count>0?'2px':'0'};"></div>\`;
                summaryHTML += \`</div>\`;
                summaryHTML += \`<span style="min-width:50px;font-size:0.72rem;color:\${textColor};font-weight:600;">\${count}x (\${pct.toFixed(0)}%)</span>\`;
                summaryHTML += \`\${isPrized ? '<span style="font-size:0.65rem;">💰</span>' : ''}\`;
                summaryHTML += \`</div>\`;
            }
        }
        summaryHTML += \`</div>\`;

        // ── 7. JOGOS GANHADORES (MOVIDO PARA BAIXO) ──
        if (winningGames.length > 0) {
            winningGames.sort((a, b) => b.hits - a.hits || b.prize - a.prize);
            summaryHTML += \`<div style="margin-bottom:12px;padding:12px 14px;background:linear-gradient(145deg,rgba(34,197,94,0.06),rgba(0,0,0,0.2));border:2px solid #22C55E40;border-radius:12px;">\`;
            summaryHTML += \`<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">\`;
            summaryHTML += \`<span style="font-size:1.2rem;">🏆</span>\`;
            summaryHTML += \`<div style="font-size:0.78rem;color:#22C55E;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Jogos Ganhadores (\${winningGames.length})</div>\`;
            summaryHTML += \`</div>\`;
            let currentTier = null;
            winningGames.forEach(wg => {
                if (currentTier !== wg.strat.id) {
                    currentTier = wg.strat.id;
                    const isJP = wg.strat.match === game.draw;
                    const tierColor = isJP ? '#FFD700' : '#22C55E';
                    summaryHTML += \`<div style="display:flex;align-items:center;gap:6px;margin:\${currentTier === winningGames[0].strat.id ? '0' : '8px'} 0 6px 0;">\`;
                    summaryHTML += \`<span style="font-size:0.7rem;">\${isJP ? '🥇' : '✅'}</span>\`;
                    summaryHTML += \`<span style="font-size:0.72rem;font-weight:700;color:\${tierColor};">\${wg.strat.label}</span>\`;
                    summaryHTML += \`<div style="flex:1;height:1px;background:\${tierColor}30;"></div>\`;
                    const tierPrize = wg.prize > 100 ? \` ≈ \${currency(wg.prize)}\` : (wg.prize > 0 ? \` ≈ R$ \${wg.prize.toFixed(2).replace('.',',')}\` : '');
                    summaryHTML += \`<span style="font-size:0.62rem;color:\${tierColor};opacity:0.8;">\${tierPrize}/jogo</span>\`;
                    summaryHTML += \`</div>\`;
                }
                const isJP = wg.strat.match === game.draw;
                const cardBorder = isJP ? '#FFD70050' : '#22C55E40';
                const cardBg = isJP ? 'rgba(255,215,0,0.06)' : 'rgba(34,197,94,0.04)';
                summaryHTML += \`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:4px;background:\${cardBg};border:1px solid \${cardBorder};border-radius:8px;">\`;
                summaryHTML += \`<span style="font-size:0.68rem;color:#94A3B8;font-weight:600;min-width:42px;">Jogo \${wg.index + 1}</span>\`;
                summaryHTML += \`<div style="display:flex;flex-wrap:wrap;gap:3px;flex:1;">\`;
                wg.numbers.forEach(n => {
                    const isHit = drawnSet.has(n);
                    const bg = isHit ? '#22C55E' : 'rgba(255,255,255,0.06)';
                    const col = isHit ? '#fff' : '#64748b';
                    const shadow = isHit ? 'box-shadow:0 0 6px rgba(34,197,94,0.4);' : '';
                    summaryHTML += \`<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:\${bg};color:\${col};font-weight:700;font-size:0.7rem;border:1px solid \${isHit ? '#22C55E' : 'rgba(255,255,255,0.1)'};\${shadow}">\${String(n).padStart(2,'0')}</span>\`;
                });
                summaryHTML += \`</div>\`;
                summaryHTML += \`<span style="font-size:0.68rem;font-weight:700;color:\${isJP ? '#FFD700' : '#22C55E'};min-width:28px;text-align:right;">\${wg.hits}/\${game.draw}</span>\`;
                summaryHTML += \`</div>\`;
            });
            summaryHTML += \`</div>\`;
        }

        // ── 8. DISCLAIMER ──
        summaryHTML += \`<div style="margin-top:10px;padding:8px 12px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);border-radius:8px;font-size:0.65rem;color:#EAB308;">\`;
        summaryHTML += \`⚠️ <strong>Importante:</strong> Os valores de prêmios exibidos são estimativas médias baseadas nos sorteios recentes da Caixa. \`;
        summaryHTML += \`O prêmio real depende do rateio oficial (número de ganhadores em cada faixa). \`;
        summaryHTML += \`Confira sempre o resultado oficial em <strong>loterias.caixa.gov.br</strong>\`;
        summaryHTML += \`</div>\`;

        summaryHTML += \`</div>\`;

`;

code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);

// ═══ PATCH 2: Adicionar botão "Abrir Pasta" no modal de conferência ═══
// No openCheckModal, após abrir o modal, adicionar link para pasta de jogos salvos
const checkModalMarker = "this.inputCheckNumbers.focus();";
const checkModalMarkerEnd = "\n    }\n\n    closeCheckModal()";
const focusIdx = code.indexOf(checkModalMarker);

if (focusIdx !== -1) {
    // Adicionar botão de abrir pasta após o focus
    const folderButton = `this.inputCheckNumbers.focus();

        // ── L99: Botão para abrir pasta de jogos salvos ──
        let folderBtn = this.checkModal.querySelector('#btn-open-saved-folder');
        if (!folderBtn) {
            folderBtn = document.createElement('button');
            folderBtn.id = 'btn-open-saved-folder';
            folderBtn.innerHTML = '📂 Abrir Pasta de Jogos Salvos (L99)';
            folderBtn.style.cssText = 'margin-top:12px;width:100%;padding:10px 16px;background:linear-gradient(135deg,#1E40AF,#3B82F6);color:#fff;border:1px solid #60A5FA50;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.85rem;transition:all 0.3s;';
            folderBtn.onmouseenter = () => { folderBtn.style.background = 'linear-gradient(135deg,#2563EB,#60A5FA)'; folderBtn.style.transform = 'scale(1.02)'; };
            folderBtn.onmouseleave = () => { folderBtn.style.background = 'linear-gradient(135deg,#1E40AF,#3B82F6)'; folderBtn.style.transform = 'scale(1)'; };
            folderBtn.onclick = async () => {
                try {
                    const resp = await fetch('/abrir-pasta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameKey: this.currentGameKey }) });
                    const result = await resp.json();
                    if (result.ok) {
                        folderBtn.innerHTML = '✅ Pasta aberta!';
                        setTimeout(() => { folderBtn.innerHTML = '📂 Abrir Pasta de Jogos Salvos (L99)'; }, 2500);
                    } else {
                        alert('Erro ao abrir pasta: ' + (result.error || 'Desconhecido'));
                    }
                } catch(e) {
                    alert('Servidor local não está respondendo.\\nVerifique se o servidor L99 está rodando.');
                }
            };
            // Inserir antes do botão de confirmar
            const modalContent = this.checkModal.querySelector('.modal-content') || this.checkModal.querySelector('div');
            if (modalContent) modalContent.appendChild(folderBtn);
        }`;
    code = code.replace(checkModalMarker, folderButton);
}

fs.writeFileSync(filePath, code, 'utf-8');
console.log('✅ Patch aplicado com sucesso!');
console.log('  → Resumo + Faixas + Total movidos para o TOPO do relatório');
console.log('  → Marca L99 adicionada ao cabeçalho');
console.log('  → Botão "Abrir Pasta" adicionado ao modal de conferência');

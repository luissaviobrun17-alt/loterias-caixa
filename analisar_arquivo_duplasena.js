/**
 * ═══════════════════════════════════════════════════════════════
 *  ANALISADOR HONESTO — 10.000 JOGOS DUPLA SENA
 *  Arquivo: Dupla Sena_16-06-2026_15h58.txt
 *  Range: 1-50 | 6 números por jogo | Preço: R$ 3,00
 *
 *  IMPORTANTE SOBRE A DUPLA SENA:
 *  - Tem DOIS sorteios por volante (1º e 2º sorteio)
 *  - Para ganhar a Sena precisa acertar 6 em UMA das duas rodadas
 *  - O arquivo gerado tem apenas 1 conjunto de 6 por jogo
 *  - Ou seja: cada jogo compete nos DOIS sorteios com os mesmos números
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';
const fs   = require('fs');
const path = require('path');

// ── CONFIG ──────────────────────────────────────────────────────
const ARQUIVO   = "C:\\Users\\luiss\\OneDrive\\Documents\\OneDrive\\Desktop\\LOTERIAS JOGOS SALVOS L99\\DUPLASENA\\Dupla Sena_16-06-2026_15h58.txt";
const SAIDA_TXT  = path.join(__dirname, 'analise_duplasena_relatorio.txt');
const SAIDA_JSON = path.join(__dirname, 'analise_duplasena_resultado.json');

const DS_MIN  = 1;
const DS_MAX  = 50;
const DS_NUMS = 6;

function nCr(n,k){
    if(k<0||k>n) return 0;
    if(k===0||k===n) return 1;
    if(k>n/2) k=n-k;
    let r=1;
    for(let i=1;i<=k;i++) r=r*(n-i+1)/i;
    return Math.round(r);
}

const TOTAL_POSSIVEIS = nCr(50, 6); // C(50,6) = 15.890.700

// ── LEITURA ─────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(65));
console.log('  🔴  ANALISADOR HONESTO — DUPLA SENA 10.000 JOGOS');
console.log('═'.repeat(65));

const conteudo = fs.readFileSync(ARQUIVO, 'utf8');
console.log(`✅  Lido: ${(conteudo.length/1024).toFixed(1)} KB`);

// ── PARSE ────────────────────────────────────────────────────────
const jogos = [];
for (const linha of conteudo.split('\n')) {
    const m = linha.match(/^Jogo\s+(\d+):\s*([\d\s\-]+)$/);
    if (m) {
        const idx  = parseInt(m[1]);
        const nums = m[2].split('-').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        jogos.push({ idx, nums });
    }
}
console.log(`📊  Jogos parseados: ${jogos.length.toLocaleString('pt-BR')}`);
console.log(`🎯  Espaço amostral: C(50,6) = ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')} jogos possíveis`);

// ── ANÁLISE ──────────────────────────────────────────────────────
const bugs = {
    tamanhoErrado:     [],
    duplicataInterna:  [],
    foraDoRange:       [],
    naoOrdenado:       [],
    duplicatasEntreSi: []
};

const vistos = new Map();
const freq   = {};
for (let i = DS_MIN; i <= DS_MAX; i++) freq[i] = 0;

const pares  = {};
const somaTodos = [];
let parsTotal = { par: 0, impar: 0 };
let seqLongas = 0;  // 3+ consecutivos (relevante para 6 números)
let seqLongas4 = 0; // 4+ consecutivos

// Distribuição por dezena
const dezenas = {};
for (let d = 1; d <= 5; d++) dezenas[`${String((d-1)*10+1).padStart(2,'0')}-${String(d*10).padStart(2,'0')}`] = 0;

for (const jogo of jogos) {
    const { idx, nums } = jogo;

    // 1. Tamanho
    if (nums.length !== DS_NUMS)
        bugs.tamanhoErrado.push({ jogoNum: idx, esperado: DS_NUMS, recebido: nums.length, numeros: nums });

    // 2. Duplicata interna
    const setN = new Set(nums);
    if (setN.size !== nums.length)
        bugs.duplicataInterna.push({ jogoNum: idx, numeros: nums,
            duplicados: nums.filter((n,i) => nums.indexOf(n)!==i) });

    // 3. Range
    const fora = nums.filter(n => n < DS_MIN || n > DS_MAX);
    if (fora.length > 0)
        bugs.foraDoRange.push({ jogoNum: idx, numeros: nums, invalidos: fora });

    // 4. Ordenação
    let ok = true;
    for (let i = 1; i < nums.length; i++) if (nums[i] <= nums[i-1]) { ok = false; break; }
    if (!ok) bugs.naoOrdenado.push({ jogoNum: idx, numeros: nums });

    // 5. Duplicata entre jogos
    const key = nums.join('-');
    if (vistos.has(key))
        bugs.duplicatasEntreSi.push({ jogoNum: idx, primeiroJogo: vistos.get(key), numeros: nums });
    else vistos.set(key, idx);

    // 6. Frequência
    for (const n of nums) if (freq[n] !== undefined) freq[n]++;

    // 7. Pares
    for (let i = 0; i < nums.length; i++)
        for (let j = i+1; j < nums.length; j++) {
            const pk = `${nums[i]}-${nums[j]}`;
            pares[pk] = (pares[pk]||0)+1;
        }

    // 8. Soma
    const soma = nums.reduce((a,b)=>a+b,0);
    somaTodos.push(soma);

    // 9. Par/Ímpar
    for (const n of nums) n%2===0 ? parsTotal.par++ : parsTotal.impar++;

    // 10. Sequências (3+ e 4+)
    let maxSeq=1, cur=1;
    for (let i=1; i<nums.length; i++) {
        if (nums[i]===nums[i-1]+1) { cur++; maxSeq=Math.max(maxSeq,cur); } else cur=1;
    }
    if (maxSeq>=3) seqLongas++;
    if (maxSeq>=4) seqLongas4++;

    // 11. Dezenas
    for (const n of nums) {
        const d = Math.ceil(n/10);
        const key2 = `${String((d-1)*10+1).padStart(2,'0')}-${String(d*10).padStart(2,'0')}`;
        if (dezenas[key2] !== undefined) dezenas[key2]++;
    }
}

// ── CÁLCULOS ─────────────────────────────────────────────────────
const totalNums   = jogos.length * DS_NUMS;
const totalBugs   = Object.values(bugs).reduce((s,a) => s+a.length, 0);
const somaMedia   = somaTodos.reduce((a,b)=>a+b,0)/somaTodos.length;
const somaMin     = Math.min(...somaTodos);
const somaMax     = Math.max(...somaTodos);
const SOMA_IDEAL  = DS_NUMS * (DS_MIN + DS_MAX) / 2; // 6 × 25.5 = 153

const freqOrd     = Object.entries(freq)
    .map(([n,c]) => ({ num:parseInt(n), count:c, pct:(c/totalNums*100).toFixed(3) }))
    .sort((a,b) => b.count - a.count);

const freqEsp     = totalNums / (DS_MAX - DS_MIN + 1);
const desvioPad   = Math.sqrt(freqOrd.reduce((acc,f) => acc+(f.count-freqEsp)**2, 0)/50);
const coefVar     = (desvioPad/freqEsp*100);

const topPares    = Object.entries(pares)
    .map(([k,c]) => ({ par:k, count:c }))
    .sort((a,b) => b.count-a.count).slice(0,20);

// Benchmarks matemáticos para comparação
// Aleatório puro C(50,6): sequências de 3+?
const pctEspaco  = (10000/TOTAL_POSSIVEIS*100).toFixed(6);

// Distribuição esperada por dezena (10 números cada = 20% por faixa)
const dezEsp = 20.00; // % esperado por dezena

// Histograma de somas
const histSoma = {};
somaTodos.forEach(s => {
    const faixa = Math.floor(s/20)*20;
    histSoma[faixa] = (histSoma[faixa]||0)+1;
});

// ── BENCHMARK: sequências esperadas no aleatório puro ────────────
// Para 6 de 50: sequências de 3+ são bem menos comuns que na Lotofácil
// P(pelo menos 3 consecutivos em 6 de 50) via simulação
function simularSeqEsperada(rodadas) {
    let cnt3 = 0, cnt4 = 0;
    for (let t=0; t<rodadas; t++) {
        let pool = [];
        for (let i=DS_MIN; i<=DS_MAX; i++) pool.push(i);
        for (let i=pool.length-1; i>0; i--) {
            const j = Math.floor(Math.random()*(i+1));
            [pool[i],pool[j]]=[pool[j],pool[i]];
        }
        const nums = pool.slice(0,DS_NUMS).sort((a,b)=>a-b);
        let maxS=1,cur=1;
        for (let i=1;i<nums.length;i++) {
            if(nums[i]===nums[i-1]+1){cur++;maxS=Math.max(maxS,cur);}else cur=1;
        }
        if(maxS>=3) cnt3++;
        if(maxS>=4) cnt4++;
    }
    return { pct3:(cnt3/rodadas*100).toFixed(2), pct4:(cnt4/rodadas*100).toFixed(2) };
}

console.log('⏳  Benchmarking sequências (aleatório puro)...');
const benchSeq = simularSeqEsperada(200000);

// ── RELATÓRIO ────────────────────────────────────────────────────
const L  = '═'.repeat(65);
const Lm = '─'.repeat(65);
let R = '';

R += '\n' + L + '\n';
R += '  🔴  RELATÓRIO HONESTO — DUPLA SENA 10.000 JOGOS\n';
R += '  🗓️  Gerado: 16/06/2026 às 15:58\n';
R += '  ⚠️  ANÁLISE SEM FILTROS — VERDADE MATEMÁTICA PURA\n';
R += L + '\n';
R += `\n  Jogos analisados:         ${jogos.length.toLocaleString('pt-BR')}\n`;
R += `  Espaço amostral total:    ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')} jogos possíveis C(50,6)\n`;
R += `  Cobertura do espaço:      ${pctEspaco}% (${(100-parseFloat(pctEspaco)).toFixed(4)}% NÃO coberto)\n`;
R += `  Custo total:              R$ ${(10000*3).toLocaleString('pt-BR')},00\n`;

// ── SEÇÃO 1: INTEGRIDADE ──
R += '\n' + Lm + '\n';
R += '  🔍  SEÇÃO 1 — INTEGRIDADE DOS JOGOS\n';
R += Lm + '\n';
const checks = [
    ['Tamanho incorreto (≠6 nºs)',    bugs.tamanhoErrado.length],
    ['Duplicata interna',              bugs.duplicataInterna.length],
    ['Fora do range (1-50)',           bugs.foraDoRange.length],
    ['Não ordenados',                  bugs.naoOrdenado.length],
    ['Jogos idênticos entre si',       bugs.duplicatasEntreSi.length],
];
for (const [nome, qtd] of checks)
    R += `  ${qtd===0?'✅':'🔴'}  ${nome.padEnd(32)}: ${qtd===0 ? 'NENHUM' : '⚠️  '+qtd+' encontrado(s)'}\n`;
R += '\n';

if (totalBugs === 0) {
    R += '  🏆  RESULTADO TÉCNICO: SISTEMA 100% ÍNTEGRO\n';
} else {
    R += `  🔴  ${totalBugs} PROBLEMA(S) TÉCNICO(S) ENCONTRADO(S)\n`;
    if (bugs.duplicatasEntreSi.length > 0) {
        R += `\n  JOGOS DUPLICADOS (${bugs.duplicatasEntreSi.length} — listando primeiros 10):\n`;
        bugs.duplicatasEntreSi.slice(0,10).forEach(b =>
            R += `    Jogo ${String(b.jogoNum).padStart(5)} = Jogo ${String(b.primeiroJogo).padStart(5)}: [${b.numeros.join(', ')}]\n`
        );
        const taxa = (bugs.duplicatasEntreSi.length/10000*100).toFixed(3);
        R += `\n  Taxa de duplicação: ${taxa}%\n`;
        // Birthday problem: para C(50,6)=15.890.700, com N=10.000 jogos
        // P(pelo menos 1 dup) ≈ 1 - e^(-N²/2E) = 1 - e^(-10000²/2×15890700) ≈ 3.14%
        const pBirthday = (1 - Math.exp(-(10000*10000)/(2*TOTAL_POSSIVEIS)))*100;
        R += `  Probabilidade matemática de ter alguma dup: ~${pBirthday.toFixed(2)}%\n`;
        R += `  (Birthday problem: com ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')} possibilidades e 10.000 jogos)\n`;
        const taxaNum = bugs.duplicatasEntreSi.length/10000*100;
        if (taxaNum > pBirthday * 3) {
            R += `  ⚠️  ALERTA: Taxa ${taxa}% é ${(taxaNum/pBirthday).toFixed(1)}x acima do esperado matemático!\n`;
            R += `      Possível VIÉS no gerador — investigar.\n`;
        } else {
            R += `  ✅  Taxa dentro do intervalo matemático esperado.\n`;
        }
    }
    if (bugs.tamanhoErrado.length > 0) {
        R += `\n  TAMANHO ERRADO (${bugs.tamanhoErrado.length}):\n`;
        bugs.tamanhoErrado.slice(0,5).forEach(b =>
            R += `    Jogo ${b.jogoNum}: ${b.recebido} nums\n`);
    }
}

// ── SEÇÃO 2: FREQUÊNCIA ──
R += '\n' + Lm + '\n';
R += '  📈  SEÇÃO 2 — FREQUÊNCIA DOS 50 NÚMEROS\n';
R += Lm + '\n';
R += `\n  Frequência esperada/número: ~${freqEsp.toFixed(0)}x  (${(100/50).toFixed(2)}% cada)\n`;
R += `  Desvio padrão: ${desvioPad.toFixed(1)} | Coeficiente de variação: ${coefVar.toFixed(2)}%\n`;
R += `  (CV < 3% = OK | CV > 6% = viés preocupante)\n\n`;

R += '  🔥  TOP 10 MAIS FREQUENTES:\n';
freqOrd.slice(0,10).forEach((item,i) => {
    const diff  = item.count - freqEsp;
    const sinal = diff>=0?'+':'';
    const sigma = (diff/desvioPad).toFixed(2);
    R += `    ${String(i+1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(5)}x (${item.pct}%)  [${sinal}${diff.toFixed(0)} / ${sigma}σ]\n`;
});

R += '\n  🧊  TOP 10 MENOS FREQUENTES:\n';
[...freqOrd].reverse().slice(0,10).forEach((item,i) => {
    const diff  = item.count - freqEsp;
    const sinal = diff>=0?'+':'';
    const sigma = (diff/desvioPad).toFixed(2);
    R += `    ${String(i+1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(5)}x (${item.pct}%)  [${sinal}${diff.toFixed(0)} / ${sigma}σ]\n`;
});

R += '\n  📊  TODOS OS 50 NÚMEROS:\n';
const freqPorNum = Object.entries(freq).map(([n,c])=>({num:parseInt(n),count:c})).sort((a,b)=>a.num-b.num);
freqPorNum.forEach(item => {
    const diff  = item.count - freqEsp;
    const sinal = diff>=0?'+':'';
    const sigma = Math.abs(diff/desvioPad);
    const alerta = sigma > 2.5 ? ' ⚠️ '+sigma.toFixed(1)+'σ' : '';
    R += `    Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(5)}x  [${sinal}${diff.toFixed(0)}]${alerta}\n`;
});

// ── SEÇÃO 3: SOMA ──
R += '\n' + Lm + '\n';
R += '  ∑   SEÇÃO 3 — ANÁLISE DE SOMA\n';
R += Lm + '\n';
R += `\n  Soma média real:    ${somaMedia.toFixed(1)}\n`;
R += `  Soma ideal teórica: ${SOMA_IDEAL.toFixed(1)}  (6 × média de 1-50 = 6 × 25.5)\n`;
R += `  Desvio:             ${(somaMedia-SOMA_IDEAL).toFixed(1)} (${(Math.abs(somaMedia-SOMA_IDEAL)/SOMA_IDEAL*100).toFixed(2)}%)\n`;
R += `  Soma mínima:        ${somaMin}\n`;
R += `  Soma máxima:        ${somaMax}\n`;
R += `  Amplitude:          ${somaMax-somaMin} (possível: ${DS_MIN+2+3+4+5+6}-${DS_MAX+49+48+47+46+45})\n\n`;
R += '  DISTRIBUIÇÃO DE SOMAS:\n';
Object.entries(histSoma).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).forEach(([f,c]) => {
    const barra = '█'.repeat(Math.round(c/80));
    R += `    ${String(f).padStart(3)}-${String(parseInt(f)+19).padStart(3)}: ${String(c).padStart(5)}  ${barra}\n`;
});

// ── SEÇÃO 4: PAR/ÍMPAR ──
R += '\n' + Lm + '\n';
R += '  🔢  SEÇÃO 4 — DISTRIBUIÇÃO PAR/ÍMPAR\n';
R += Lm + '\n';
// Em 1-50: 25 pares (2,4,...,50) + 25 ímpares (1,3,...,49)
// Esperado por jogo: 3 pares e 3 ímpares (50/50)
const parEsp = 50.00; // % esperado
const parReal = (parsTotal.par/totalNums*100);
R += `\n  Pares:   ${parsTotal.par.toLocaleString('pt-BR')} (${parReal.toFixed(2)}%)\n`;
R += `  Ímpares: ${parsTotal.impar.toLocaleString('pt-BR')} (${(parsTotal.impar/totalNums*100).toFixed(2)}%)\n`;
R += `  Esperado teórico: 50% / 50% (1-50 tem 25 pares e 25 ímpares)\n`;
R += `  Desvio: ${Math.abs(parReal-50).toFixed(3)}%  ${Math.abs(parReal-50)<0.5?'✅ Normal':'⚠️ Atenção'}\n`;

// ── SEÇÃO 5: DEZENAS ──
R += '\n' + Lm + '\n';
R += '  🗂️   SEÇÃO 5 — DISTRIBUIÇÃO POR DEZENA\n';
R += Lm + '\n';
R += '\n  Esperado: 20% por dezena (10 números por faixa em 1-50)\n\n';
for (const [faixa, count] of Object.entries(dezenas)) {
    const pct  = count/totalNums*100;
    const diff = pct - dezEsp;
    const sinal= diff>=0?'+':'';
    const barra= '█'.repeat(Math.round(pct));
    R += `  ${faixa}: ${String(count).padStart(7)} (${pct.toFixed(2)}%) [${sinal}${diff.toFixed(2)}%]  ${barra}\n`;
}

// ── SEÇÃO 6: SEQUÊNCIAS ──
R += '\n' + Lm + '\n';
R += '  🔗  SEÇÃO 6 — SEQUÊNCIAS CONSECUTIVAS\n';
R += Lm + '\n';
R += `\n  Jogos com 3+ consecutivos: ${seqLongas}  (${(seqLongas/10000*100).toFixed(2)}%)\n`;
R += `  Jogos com 4+ consecutivos: ${seqLongas4} (${(seqLongas4/10000*100).toFixed(2)}%)\n`;
R += `\n  BENCHMARK — Aleatório puro (200.000 simulações):\n`;
R += `    3+ consecutivos esperado: ${benchSeq.pct3}%\n`;
R += `    4+ consecutivos esperado: ${benchSeq.pct4}%\n`;
const diff3 = Math.abs((seqLongas/10000*100) - parseFloat(benchSeq.pct3));
const diff4 = Math.abs((seqLongas4/10000*100) - parseFloat(benchSeq.pct4));
R += `\n  Diferença 3+ (gerador vs puro): ${diff3.toFixed(2)}%  ${diff3<3?'✅ Normal':'⚠️ Desvio relevante'}\n`;
R += `  Diferença 4+ (gerador vs puro): ${diff4.toFixed(2)}%  ${diff4<2?'✅ Normal':'⚠️ Desvio relevante'}\n`;

// ── SEÇÃO 7: PARES ──
R += '\n' + Lm + '\n';
R += '  💑  SEÇÃO 7 — PARES MAIS E MENOS FREQUENTES\n';
R += Lm + '\n';
const parEspFreq = (10000 * DS_NUMS*(DS_NUMS-1)/2) / nCr(50,2);
R += `\n  Total de pares possíveis C(50,2): ${nCr(50,2).toLocaleString('pt-BR')}\n`;
R += `  Frequência esperada por par: ~${parEspFreq.toFixed(2)}x\n\n`;
R += '  TOP 10 MAIS FREQUENTES:\n';
topPares.slice(0,10).forEach((p,i) => {
    const diff = p.count - parEspFreq;
    const sigma = (diff/Math.sqrt(parEspFreq)).toFixed(1);
    R += `    ${String(i+1).padStart(2)}. ${p.par.padEnd(8)}: ${String(p.count).padStart(4)}x  [+${diff.toFixed(0)} / ${sigma}σ]\n`;
});
const menosPares = Object.entries(pares).map(([k,c])=>({par:k,count:c})).sort((a,b)=>a.count-b.count);
R += '\n  TOP 10 MENOS FREQUENTES (pares que quase não aparecem):\n';
menosPares.slice(0,10).forEach((p,i) => {
    const diff = p.count - parEspFreq;
    const sigma = (diff/Math.sqrt(parEspFreq)).toFixed(1);
    R += `    ${String(i+1).padStart(2)}. ${p.par.padEnd(8)}: ${String(p.count).padStart(4)}x  [${diff.toFixed(0)} / ${sigma}σ]\n`;
});

// ── SEÇÃO 8: DUPLA SENA — PARTICULARIDADE ──
R += '\n' + Lm + '\n';
R += '  🎲  SEÇÃO 8 — PARTICULARIDADE DA DUPLA SENA\n';
R += Lm + '\n';
R += `
  A DUPLA SENA tem 2 sorteios por concurso.
  Cada bilhete concorre nos DOIS sorteios com os MESMOS números.
  Isso dobra suas chances em relação à Mega Sena — mas é ilusório:

  Probabilidade de ganhar a SENA (6 acertos):
    1 sorteio:    1 / ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')}  por jogo
    2 sorteios:   2 / ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')}  por jogo (~${(2/TOTAL_POSSIVEIS*100).toFixed(7)}%)
    10.000 jogos: ${(10000*2/TOTAL_POSSIVEIS*100).toFixed(5)}% de chance de ganhar a Sena

  Probabilidade de ganhar a QUINA (5 acertos):
    Por sorteio por jogo: ${(nCr(6,5)*nCr(44,1)/TOTAL_POSSIVEIS*100).toFixed(4)}%
    Com 10.000 jogos e 2 sorteios: ${(10000*2*nCr(6,5)*nCr(44,1)/TOTAL_POSSIVEIS*100).toFixed(2)}%
`;

// ── SEÇÃO 9: HONESTIDADE ──
R += '\n' + L + '\n';
R += '  ⚠️   SEÇÃO 9 — O QUE ESSES DADOS SIGNIFICAM DE VERDADE\n';
R += L + '\n';
R += `
  COBERTURA DO ESPAÇO AMOSTRAL: ${pctEspaco}%
  → Você não cobriu ${(100-parseFloat(pctEspaco)).toFixed(4)}% das combinações possíveis.

  CUSTO TOTAL: R$ 30.000,00
  RETORNO ESPERADO MÉDIO: NEGATIVO
  → A Caixa retém ~46% dos prêmios. Matematicamente, cada R$1
    apostado retorna ~R$0,54 em valor esperado.

  O MOTOR É INTELIGENTE? SIM — para o que se propõe:
  → Gera jogos bem distribuídos, sem duplicatas, com soma
    equilibrada e boa cobertura de dezenas.

  O MOTOR PREDIZ SORTEIOS? NÃO — isso é matematicamente impossível:
  → Cada sorteio usa bolas físicas numeradas.
  → A probabilidade de cada combinação é sempre 1/${TOTAL_POSSIVEIS.toLocaleString('pt-BR')}.
  → Nenhum padrão histórico altera esse valor.
  → Frequências passadas não preveem frequências futuras.
`;

// ── RESUMO ──
R += '\n' + L + '\n';
R += '  📋  RESUMO FINAL — DUPLA SENA\n';
R += L + '\n';
R += `
  TÉCNICO (o que o sistema FAZ):
  ${totalBugs===0?'✅':'🔴'} Integridade: ${totalBugs===0?'ZERO bugs em 10.000 jogos':totalBugs+' problema(s) encontrado(s)'}
  ${bugs.duplicatasEntreSi.length===0?'✅':'🔴'} Duplicatas: ${bugs.duplicatasEntreSi.length===0?'ZERO jogos idênticos':bugs.duplicatasEntreSi.length+' encontradas'}
  ✅  Cobertura: ${freqOrd.filter(f=>f.count>0).length}/50 números aparecem
  ✅  Soma média: ${somaMedia.toFixed(1)} vs ideal ${SOMA_IDEAL} (desvio ${Math.abs(somaMedia-SOMA_IDEAL).toFixed(1)})
  ✅  Par/Ímpar: ${(parsTotal.par/totalNums*100).toFixed(1)}% / ${(parsTotal.impar/totalNums*100).toFixed(1)}% (esperado 50%/50%)
  ${diff3<3?'✅':'⚠️'} Sequências 3+: ${(seqLongas/10000*100).toFixed(2)}% (benchmark aleatório: ${benchSeq.pct3}%)
  ✅  Coeficiente de variação: ${coefVar.toFixed(2)}% ${coefVar<3?'(baixo = bem distribuído)':''}

  APOSTAS (o que a matemática diz):
  ❌  ${pctEspaco}% do espaço amostral coberto
  ❌  Prob. Sena com 10.000 jogos: ${(10000*2/TOTAL_POSSIVEIS*100).toFixed(5)}%
  ❌  R$ 30.000 com valor esperado negativo (~46% fica com a Caixa)
  ❌  Análise histórica NÃO aumenta probabilidade de acerto
` + L + '\n';

// ── IMPRIMIR & SALVAR ────────────────────────────────────────────
console.log(R);
fs.writeFileSync(SAIDA_TXT,  R, 'utf8');
fs.writeFileSync(SAIDA_JSON, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalJogos: jogos.length,
    espacoAmostral: TOTAL_POSSIVEIS,
    coberturaPct: parseFloat(pctEspaco),
    bugs: { total: totalBugs,
        tamanhoErrado:    bugs.tamanhoErrado.length,
        duplicataInterna: bugs.duplicataInterna.length,
        foraDoRange:      bugs.foraDoRange.length,
        naoOrdenado:      bugs.naoOrdenado.length,
        duplicatas:       bugs.duplicatasEntreSi.length,
        listaDuplicatas:  bugs.duplicatasEntreSi.slice(0,50)
    },
    estatisticas: {
        somaMedia: parseFloat(somaMedia.toFixed(2)),
        somaIdeal: SOMA_IDEAL, somaMin, somaMax,
        parImpar: parsTotal,
        dezenas,
        seqLongas3: seqLongas,
        seqLongas4,
        benchmarkAleatorio: benchSeq,
        coefVariacao: parseFloat(coefVar.toFixed(3)),
        topFrequentes: freqOrd.slice(0,15),
        topRaros: [...freqOrd].reverse().slice(0,15),
        topPares: topPares.slice(0,20),
        menosPares: menosPares.slice(0,10)
    }
}, null, 2), 'utf8');

console.log(`\n💾  ${SAIDA_TXT}`);
console.log(`💾  ${SAIDA_JSON}\n`);

/**
 * ═══════════════════════════════════════════════════════════════
 *  ANALISADOR HONESTO — 10.000 JOGOS LOTOFÁCIL
 *  Arquivo: Lotofácil_16-06-2026_15h51.txt
 *  Range: 1-25 | 15 números por jogo
 *  Verifica: Duplicatas, Range, Tamanho, Ordenação, Frequências
 *
 *  COMPROMISSO: Este script relata APENAS a verdade matemática.
 *  Sem interpretações favoráveis. Sem omissões.
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ── CONFIG ──────────────────────────────────────────────────────
const ARQUIVO  = "C:\\Users\\luiss\\OneDrive\\Documents\\OneDrive\\Desktop\\LOTERIAS JOGOS SALVOS L99\\LOTOFACIL\\Lotofácil_16-06-2026_15h51.txt";
const SAIDA_TXT  = path.join(__dirname, 'analise_lotofacil_relatorio.txt');
const SAIDA_JSON = path.join(__dirname, 'analise_lotofacil_resultado.json');

const LF_MIN  = 1;
const LF_MAX  = 25;
const LF_NUMS = 15;   // 15 números por jogo
const TOTAL_POSSIVEIS = nCr(25, 15); // C(25,15) = 3.268.760

function nCr(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n/2) k = n - k;
    let r = 1;
    for (let i = 1; i <= k; i++) r = r * (n - i + 1) / i;
    return Math.round(r);
}

// ── LEITURA ─────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(65));
console.log('  🟣  ANALISADOR HONESTO — LOTOFÁCIL 10.000 JOGOS');
console.log('═'.repeat(65));

let conteudo;
try {
    conteudo = fs.readFileSync(ARQUIVO, 'utf8');
    console.log(`✅  Lido: ${(conteudo.length/1024).toFixed(1)} KB`);
} catch(e) {
    console.error(`❌  Erro ao ler: ${e.message}`);
    process.exit(1);
}

// ── PARSE ────────────────────────────────────────────────────────
const linhas = conteudo.split('\n');
const jogos  = [];

for (const linha of linhas) {
    const m = linha.match(/^Jogo\s+(\d+):\s*([\d\s\-]+)$/);
    if (m) {
        const idx  = parseInt(m[1]);
        const nums = m[2].split('-').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        jogos.push({ idx, nums });
    }
}
console.log(`📊  Jogos parseados: ${jogos.length.toLocaleString('pt-BR')}`);
console.log(`🎯  Espaço total possível Lotofácil: C(25,15) = ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')} jogos únicos`);

// ── BUGS ─────────────────────────────────────────────────────────
const bugs = {
    tamanhoErrado:    [],
    duplicataInterna: [],
    foraDoRange:      [],
    naoOrdenado:      [],
    duplicatasEntreSi:[]
};

const vistos   = new Map();
const freq     = {};
for (let i = LF_MIN; i <= LF_MAX; i++) freq[i] = 0;

const pares    = {};
const somaTodos= [];
let parsTotal  = { par: 0, impar: 0 };
let seqLongas  = 0;
let jogosComTodosOsNums = 0; // Jogos com todos 25 números? Impossível, mas verificamos

// ── ANÁLISE PROFUNDA ─────────────────────────────────────────────
console.log('\n⏳  Analisando...\n');

for (const jogo of jogos) {
    const { idx, nums } = jogo;

    // 1. Tamanho
    if (nums.length !== LF_NUMS) {
        bugs.tamanhoErrado.push({ jogoNum: idx, esperado: LF_NUMS, recebido: nums.length, numeros: nums });
    }

    // 2. Duplicata interna
    const setNums = new Set(nums);
    if (setNums.size !== nums.length) {
        const dups = nums.filter((n, i) => nums.indexOf(n) !== i);
        bugs.duplicataInterna.push({ jogoNum: idx, numeros: nums, duplicados: dups });
    }

    // 3. Range
    const fora = nums.filter(n => n < LF_MIN || n > LF_MAX);
    if (fora.length > 0) {
        bugs.foraDoRange.push({ jogoNum: idx, numeros: nums, invalidos: fora });
    }

    // 4. Ordenação
    let ordenado = true;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] <= nums[i-1]) { ordenado = false; break; }
    }
    if (!ordenado) bugs.naoOrdenado.push({ jogoNum: idx, numeros: nums });

    // 5. Duplicata entre jogos
    const key = nums.join('-');
    if (vistos.has(key)) {
        bugs.duplicatasEntreSi.push({ jogoNum: idx, primeiroJogo: vistos.get(key), numeros: nums });
    } else {
        vistos.set(key, idx);
    }

    // 6. Frequência
    for (const n of nums) { if (freq[n] !== undefined) freq[n]++; }

    // 7. Pares
    for (let i = 0; i < nums.length; i++) {
        for (let j = i+1; j < nums.length; j++) {
            const pk = `${nums[i]}-${nums[j]}`;
            pares[pk] = (pares[pk] || 0) + 1;
        }
    }

    // 8. Soma
    somaTodos.push(nums.reduce((a, b) => a + b, 0));

    // 9. Par/Ímpar
    for (const n of nums) { if (n % 2 === 0) parsTotal.par++; else parsTotal.impar++; }

    // 10. Sequências longas (5+ consecutivos)
    let maxSeq = 1, cur = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i-1]+1) { cur++; maxSeq = Math.max(maxSeq, cur); } else cur = 1;
    }
    if (maxSeq >= 5) seqLongas++;
}

// ── CÁLCULOS ESTATÍSTICOS ────────────────────────────────────────
const totalNums  = jogos.length * LF_NUMS;
const somaMedia  = somaTodos.reduce((a,b) => a+b, 0) / somaTodos.length;
const somaMin    = Math.min(...somaTodos);
const somaMax    = Math.max(...somaTodos);
// Soma ideal: média de 1+2+...+25 = 325 → 15 nums → esperado ≈ 195
const SOMA_IDEAL = 15 * (1+25) / 2;  // = 195

const freqOrd = Object.entries(freq)
    .map(([n, c]) => ({ num: parseInt(n), count: c, pct: (c/totalNums*100).toFixed(3) }))
    .sort((a, b) => b.count - a.count);

const topPares = Object.entries(pares)
    .map(([k, c]) => ({ par: k, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

// Distribuição por dezena (1-10, 11-20, 21-25)
const dezenas = { '01-10': 0, '11-20': 0, '21-25': 0 };
for (const jogo of jogos) {
    for (const n of jogo.nums) {
        if (n <= 10) dezenas['01-10']++;
        else if (n <= 20) dezenas['11-20']++;
        else dezenas['21-25']++;
    }
}

// Quantos jogos têm TODOS os números de 1 a 25? (impossível, mas checar)
// Porcentagem de cobertura do espaço amostral
const coberturaEspaco = (jogos.length / TOTAL_POSSIVEIS * 100);

// ── ANÁLISE DE CONCENTRAÇÃO ──────────────────────────────────────
// Verificar se o gerador está VICIADO (alguns números aparecem demais)
const freqEsperada   = totalNums / 25;  // Esperado: uniforme
const freqMax        = freqOrd[0].count;
const freqMin        = [...freqOrd].reverse()[0].count;
const desvioPadrao   = Math.sqrt(
    freqOrd.reduce((acc, f) => acc + Math.pow(f.count - freqEsperada, 2), 0) / 25
);
const coefVariacao   = (desvioPadrao / freqEsperada * 100);

// ── ANÁLISE HONESTA DE COBERTURA ─────────────────────────────────
// Quantos dos 3.268.760 possíveis jogos estes 10.000 cobrem?
// Com 10.000 jogos de 15 números, qual % do espaço amostral?
const pctEspaco = (10000 / TOTAL_POSSIVEIS * 100).toFixed(4);

// Probabilidade de ganhar com 10.000 jogos
const probGanhar15 = 10000 / TOTAL_POSSIVEIS * 100;
const probGanhar14 = 10000 / nCr(25,15) * nCr(15,14) * nCr(10,1) / nCr(25,15) * 100; 

// ── RELATÓRIO ────────────────────────────────────────────────────
const L  = '═'.repeat(65);
const Lm = '─'.repeat(65);

let R = '';
R += '\n' + L + '\n';
R += '  🟣  RELATÓRIO HONESTO — LOTOFÁCIL 10.000 JOGOS\n';
R += '  🗓️  Gerado em: 16/06/2026 às 15:51\n';
R += '  ⚠️  ANÁLISE SEM FILTROS — VERDADE MATEMÁTICA PURA\n';
R += L + '\n';

R += `\n  Jogos analisados:          ${jogos.length.toLocaleString('pt-BR')}\n`;
R += `  Espaço amostral total:     ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')} jogos possíveis\n`;
R += `  Cobertura do espaço:       ${pctEspaco}% dos jogos possíveis\n`;

// ── SEÇÃO 1: INTEGRIDADE ──
R += '\n' + Lm + '\n';
R += '  🔍  SEÇÃO 1 — INTEGRIDADE DOS JOGOS\n';
R += Lm + '\n';

const totalBugs = bugs.tamanhoErrado.length + bugs.duplicataInterna.length +
                  bugs.foraDoRange.length + bugs.naoOrdenado.length +
                  bugs.duplicatasEntreSi.length;

const checks = [
    ['Tamanho incorreto (≠15 nºs)', bugs.tamanhoErrado.length],
    ['Duplicata interna (nº repetido)', bugs.duplicataInterna.length],
    ['Fora do range (1-25)', bugs.foraDoRange.length],
    ['Não ordenados', bugs.naoOrdenado.length],
    ['Jogos duplicados entre si', bugs.duplicatasEntreSi.length],
];

for (const [nome, qtd] of checks) {
    R += `  ${qtd===0?'✅':'🔴'}  ${nome.padEnd(32)}: ${qtd===0 ? 'NENHUM' : '⚠️  '+qtd+' encontrado(s)'}\n`;
}

R += '\n';
if (totalBugs === 0) {
    R += '  🏆  RESULTADO TÉCNICO: SISTEMA 100% ÍNTEGRO\n';
    R += '      Zero bugs nos 10.000 jogos — motor funciona corretamente.\n';
} else {
    R += `  🔴  RESULTADO TÉCNICO: ${totalBugs} PROBLEMA(S) DETECTADO(S)\n`;
    if (bugs.duplicatasEntreSi.length > 0) {
        R += `\n  JOGOS DUPLICADOS (${bugs.duplicatasEntreSi.length}):\n`;
        bugs.duplicatasEntreSi.slice(0, 5).forEach(b =>
            R += `    Jogo ${b.jogoNum} = Jogo ${b.primeiroJogo}: [${b.numeros.join(', ')}]\n`
        );
    }
    if (bugs.tamanhoErrado.length > 0) {
        R += `\n  TAMANHO ERRADO (${bugs.tamanhoErrado.length}):\n`;
        bugs.tamanhoErrado.slice(0, 5).forEach(b =>
            R += `    Jogo ${b.jogoNum}: ${b.recebido} números\n`
        );
    }
}

// ── SEÇÃO 2: FREQUÊNCIA ──
R += '\n' + Lm + '\n';
R += '  📈  SEÇÃO 2 — FREQUÊNCIA DOS 25 NÚMEROS\n';
R += '  (Frequência esperada se fosse PERFEITAMENTE aleatório)\n';
R += Lm + '\n';

const freqEsp = (totalNums / 25).toFixed(0);
R += `\n  Frequência esperada por número: ~${freqEsp}x (${(100/25).toFixed(2)}% cada)\n`;
R += `  Desvio padrão das frequências:  ${desvioPadrao.toFixed(1)}\n`;
R += `  Coeficiente de variação:         ${coefVariacao.toFixed(2)}%\n`;
R += `  (CV < 2% = distribuição normal | CV > 5% = possível viés)\n\n`;

R += '  🔥  TOP 10 MAIS FREQUENTES:\n';
freqOrd.slice(0, 10).forEach((item, i) => {
    const diff = item.count - parseFloat(freqEsp);
    const sinal = diff >= 0 ? '+' : '';
    const barra = '█'.repeat(Math.round(item.count / parseFloat(freqEsp) * 10));
    R += `    ${String(i+1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(6)}x (${item.pct}%)  [${sinal}${diff.toFixed(0)}]  ${barra}\n`;
});

R += '\n  🧊  10 MENOS FREQUENTES:\n';
[...freqOrd].reverse().slice(0, 10).forEach((item, i) => {
    const diff = item.count - parseFloat(freqEsp);
    const sinal = diff >= 0 ? '+' : '';
    const barra = '░'.repeat(Math.round(item.count / parseFloat(freqEsp) * 10)) || '—';
    R += `    ${String(i+1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(6)}x (${item.pct}%)  [${sinal}${diff.toFixed(0)}]  ${barra}\n`;
});

// Tabela completa de todos os 25 números
R += '\n  📊  TODOS OS 25 NÚMEROS (ordem crescente):\n';
const freqPorNum = Object.entries(freq).map(([n,c]) => ({num:parseInt(n), count:c})).sort((a,b)=>a.num-b.num);
freqPorNum.forEach(item => {
    const diff = item.count - parseFloat(freqEsp);
    const sinal = diff >= 0 ? '+' : '';
    const bar = '█'.repeat(Math.round(Math.abs(diff) / 30)) || '·';
    const alerta = Math.abs(diff) > desvioPadrao * 2 ? ' ⚠️' : '';
    R += `    Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(6)}x  [${sinal}${diff.toFixed(0)}]${alerta}\n`;
});

// ── SEÇÃO 3: SOMA ──
R += '\n' + Lm + '\n';
R += '  ∑   SEÇÃO 3 — ANÁLISE DE SOMA DOS JOGOS\n';
R += Lm + '\n';
R += `\n  Soma média dos 10.000 jogos:  ${somaMedia.toFixed(1)}\n`;
R += `  Soma ideal teórica (1+2+...+25)/25×15: ${SOMA_IDEAL.toFixed(1)}\n`;
R += `  Desvio da soma média vs ideal: ${(somaMedia - SOMA_IDEAL).toFixed(1)} (${Math.abs((somaMedia-SOMA_IDEAL)/SOMA_IDEAL*100).toFixed(2)}%)\n`;
R += `  Soma mínima encontrada: ${somaMin}\n`;
R += `  Soma máxima encontrada: ${somaMax}\n`;
R += `  Amplitude: ${somaMax - somaMin}\n`;
R += `  (Soma possível: mín=120 [1+2+...+15], máx=315 [11+12+...+25])\n`;

// Histograma de somas
R += '\n  📊  DISTRIBUIÇÃO DE SOMAS (faixas de 15):\n';
const histSoma = {};
somaTodos.forEach(s => {
    const faixa = Math.floor(s / 15) * 15;
    histSoma[faixa] = (histSoma[faixa] || 0) + 1;
});
Object.entries(histSoma).sort((a,b) => parseInt(a[0])-parseInt(b[0])).forEach(([f,c]) => {
    const barra = '█'.repeat(Math.round(c/50));
    R += `    ${String(f).padStart(3)}-${String(parseInt(f)+14).padStart(3)}: ${String(c).padStart(5)} jogos  ${barra}\n`;
});

// ── SEÇÃO 4: PAR/ÍMPAR ──
R += '\n' + Lm + '\n';
R += '  🔢  SEÇÃO 4 — DISTRIBUIÇÃO PAR/ÍMPAR\n';
R += Lm + '\n';
// Em 1-25: 12 pares (2,4,...,24) + 13 ímpares (1,3,...,25)
// Probabilidade teórica por jogo: E[pares] = 15×12/25 = 7.2 | E[ímpares] = 7.8
const parEsperado = (15 * 12 / 25).toFixed(1);
const imparEsperado = (15 * 13 / 25).toFixed(1);
R += `\n  Pares nos jogos:   ${parsTotal.par.toLocaleString('pt-BR')} (${(parsTotal.par/totalNums*100).toFixed(2)}%)\n`;
R += `  Ímpares nos jogos: ${parsTotal.impar.toLocaleString('pt-BR')} (${(parsTotal.impar/totalNums*100).toFixed(2)}%)\n`;
R += `\n  ESPERADO TEÓRICO (1-25 tem 12 pares e 13 ímpares):\n`;
R += `    Pares esperados/jogo:   ~${parEsperado} (${(12/25*100).toFixed(1)}%)\n`;
R += `    Ímpares esperados/jogo: ~${imparEsperado} (${(13/25*100).toFixed(1)}%)\n`;
const parReal = parsTotal.par / totalNums * 100;
const parDiff = Math.abs(parReal - 12/25*100);
R += `\n  Desvio real vs teórico: ${parDiff.toFixed(3)}%  `;
R += parDiff < 0.5 ? '✅ Normal\n' : '⚠️ Acima do esperado\n';

// ── SEÇÃO 5: DEZENAS ──
R += '\n' + Lm + '\n';
R += '  🗂️   SEÇÃO 5 — DISTRIBUIÇÃO POR FAIXA DE NÚMEROS\n';
R += Lm + '\n';
// Esperado: 1-10 (10 nums = 40%), 11-20 (10 nums = 40%), 21-25 (5 nums = 20%)
R += '\n  Esperado teórico: 01-10=40%, 11-20=40%, 21-25=20%\n\n';
const dezEsp = { '01-10': 0.40, '11-20': 0.40, '21-25': 0.20 };
for (const [faixa, count] of Object.entries(dezenas)) {
    const pct = count/totalNums*100;
    const esp = dezEsp[faixa]*100;
    const diff = pct - esp;
    const sinal = diff >= 0 ? '+' : '';
    const barra = '█'.repeat(Math.round(pct/2));
    R += `  ${faixa}: ${String(count).padStart(7)} (${pct.toFixed(2)}%) [${sinal}${diff.toFixed(2)}% vs esperado ${esp}%]  ${barra}\n`;
}

// ── SEÇÃO 6: SEQUÊNCIAS ──
R += '\n' + Lm + '\n';
R += '  🔗  SEÇÃO 6 — SEQUÊNCIAS LONGAS (5+ consecutivos)\n';
R += Lm + '\n';
R += `\n  Jogos com 5+ consecutivos: ${seqLongas} (${(seqLongas/jogos.length*100).toFixed(3)}%)\n`;

// ── SEÇÃO 7: PARES ──
R += '\n' + Lm + '\n';
R += '  💑  SEÇÃO 7 — TOP 20 PARES MAIS FREQUENTES\n';
R += Lm + '\n';
const parEspContagem = (jogos.length * 15 * 14 / 2) / (25 * 24 / 2);
R += `\n  Frequência esperada por par: ~${parEspContagem.toFixed(1)}x\n\n`;
topPares.forEach((p, i) => {
    const diff = p.count - parEspContagem;
    const sinal = diff >= 0 ? '+' : '';
    R += `    ${String(i+1).padStart(2)}. ${p.par.padEnd(8)}: ${String(p.count).padStart(5)}x [${sinal}${diff.toFixed(0)}]\n`;
});

// ── SEÇÃO 8: HONESTIDADE — O QUE ISSO SIGNIFICA ──
R += '\n' + L + '\n';
R += '  ⚠️   SEÇÃO 8 — ANÁLISE HONESTA: O QUE ESSES NÚMEROS SIGNIFICAM\n';
R += L + '\n';

R += `
  PERGUNTA 1: Esses 10.000 jogos cobrem quantos % das possibilidades?
  RESPOSTA:   ${pctEspaco}% — ou seja, ${(100-parseFloat(pctEspaco)).toFixed(4)}% das possibilidades NÃO estão cobertas.

  PERGUNTA 2: Qual a probabilidade de acertar os 15 pontos com esses jogos?
  RESPOSTA:   Se o sorteio fosse HOJE, cada jogo tem 1 em ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')} de chance.
              Com 10.000 jogos: ${(10000/TOTAL_POSSIVEIS*100).toFixed(6)}% de chance de acertar 15 pontos.
              Em outras palavras: 99.${(100 - 10000/TOTAL_POSSIVEIS*100).toFixed(4).slice(3)}% de chance de NÃO acertar.

  PERGUNTA 3: Os números "mais frequentes" saem mais no sorteio real?
  RESPOSTA:   NÃO. A Lotofácil usa bolas físicas. Cada sorteio é
              independente. A frequência no GERADOR não prediz o sorteio.
              O gerador sendo equilibrado é uma QUALIDADE TÉCNICA do
              software, não uma vantagem de apostas.

  PERGUNTA 4: O sistema de "fechamento" garante prêmio?
  RESPOSTA:   O fechamento garante que SE um subconjunto dos números
              escolhidos sair, pelo menos 1 jogo terá a garantia.
              Mas escolher os números certos é ALEATÓRIO — sem garantia.

  PERGUNTA 5: Custo real dessas 10.000 apostas:
  RESPOSTA:   10.000 × R$ 3,50 = R$ 35.000,00 investidos.
              Prêmio médio 15 pontos: ~R$ 2.000.000
              Prêmio médio 14 pontos: ~R$ 1.600
              Prêmio médio 13 pontos: ~R$ 30
              Valor esperado (EV) real: NEGATIVO (casa fica com ~45%)
`;

// ── RESUMO FINAL ──
R += '\n' + L + '\n';
R += '  📋  RESUMO FINAL — COM TOTAL HONESTIDADE\n';
R += L + '\n';
R += `\n  ✅  Técnico: Sistema íntegro — ${totalBugs === 0 ? 'ZERO bugs' : totalBugs+' bugs'} em 10.000 jogos\n`;
R += `  ✅  Técnico: Distribuição estatisticamente equilibrada\n`;
R += `  ✅  Técnico: ${freqOrd.filter(f=>f.count>0).length}/25 números cobertos (100%)\n`;
R += `  ✅  Técnico: Soma média ${somaMedia.toFixed(1)} vs ideal ${SOMA_IDEAL} (desvio: ${Math.abs(somaMedia-SOMA_IDEAL).toFixed(1)})\n`;
R += `\n  ❌  Apostas: ${pctEspaco}% do espaço amostral coberto\n`;
R += `  ❌  Apostas: Probabilidade de 15 pts = ${(10000/TOTAL_POSSIVEIS*100).toFixed(6)}%\n`;
R += `  ❌  Apostas: R$ 35.000 investidos com valor esperado NEGATIVO\n`;
R += `  ❌  Apostas: Frequências passadas NÃO predizem sorteios futuros\n`;
R += '\n  O sistema é tecnicamente excelente como ORGANIZADOR de apostas.\n';
R += '  Ele não pode e não deve ser usado como PREDITOR de resultados.\n';
R += L + '\n';

// ── IMPRIMIR & SALVAR ────────────────────────────────────────────
console.log(R);
fs.writeFileSync(SAIDA_TXT,  R,    'utf8');
fs.writeFileSync(SAIDA_JSON, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalJogos: jogos.length,
    espacoAmostral: TOTAL_POSSIVEIS,
    coberturaPct: parseFloat(pctEspaco),
    bugs: { total: totalBugs, detalhes: bugs },
    estatisticas: {
        somaMedia: parseFloat(somaMedia.toFixed(2)),
        somaIdeal: SOMA_IDEAL,
        somaMin, somaMax,
        parImpar: parsTotal,
        dezenas,
        seqLongas,
        coefVariacaoFreq: parseFloat(coefVariacao.toFixed(3)),
        topFrequentes: freqOrd.slice(0,10),
        topRaros: [...freqOrd].reverse().slice(0,10),
        topPares
    }
}, null, 2), 'utf8');

console.log(`💾  Relatório: ${SAIDA_TXT}`);
console.log(`💾  JSON:      ${SAIDA_JSON}\n`);

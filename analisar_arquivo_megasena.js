/**
 * ═══════════════════════════════════════════════════════════════
 *  ANALISADOR COMPLETO — 10.000 JOGOS MEGA SENA
 *  Arquivo: Mega Sena_16-06-2026_15h39.txt
 *  Verifica: Duplicatas, Range, Tamanho, Ordenação, Frequências
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── CONFIGURAÇÃO ───────────────────────────────────────────────
const ARQUIVO = "C:\\Users\\luiss\\OneDrive\\Documents\\OneDrive\\Desktop\\LOTERIAS JOGOS SALVOS L99\\MEGASENA\\Mega Sena_16-06-2026_15h39.txt";
const SAIDA_JSON = path.join(__dirname, 'analise_megasena_resultado.json');
const SAIDA_TXT  = path.join(__dirname, 'analise_megasena_relatorio.txt');

const MEGA_MIN = 1;
const MEGA_MAX = 60;
const MEGA_NUMS = 6;

// ─── LEITURA DO ARQUIVO ─────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  🎰  ANALISADOR B2B LOTERIAS — MEGA SENA 10.000 JOGOS');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`\n📂  Arquivo: ${ARQUIVO}`);

let conteudo;
try {
    conteudo = fs.readFileSync(ARQUIVO, 'utf8');
    console.log(`✅  Arquivo lido: ${(conteudo.length / 1024).toFixed(1)} KB`);
} catch (e) {
    console.error(`❌  Erro ao ler arquivo: ${e.message}`);
    process.exit(1);
}

// ─── PARSEAR JOGOS ──────────────────────────────────────────────
const linhas = conteudo.split('\n');
const jogos = [];
let linhasIgnoradas = 0;

for (const linha of linhas) {
    const m = linha.match(/^Jogo\s+(\d+):\s*([\d\s\-]+)$/);
    if (m) {
        const idx = parseInt(m[1]);
        const nums = m[2].split('-').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        jogos.push({ idx, nums, linha: linha.trim() });
    } else if (linha.trim() && !linha.startsWith('═') && !linha.startsWith('Jogo') && !linha.startsWith('  ') && !linha.startsWith('Data') && !linha.startsWith('Total')) {
        linhasIgnoradas++;
    }
}

console.log(`\n📊  Jogos parseados: ${jogos.length.toLocaleString('pt-BR')}`);
console.log(`    Linhas ignoradas: ${linhasIgnoradas}`);

// ─── ANÁLISE COMPLETA ───────────────────────────────────────────
const bugs = {
    tamanhoErrado: [],
    duplicataInterna: [],
    foraDoRange: [],
    naoOrdenado: [],
    duplicatasEntreSi: []
};

const vistos = new Map(); // key -> primeiro índice
const frequencia = {};
for (let i = MEGA_MIN; i <= MEGA_MAX; i++) frequencia[i] = 0;

const parFrequencia = {};
const somaTodos = [];
const parImparDist = { par: 0, impar: 0 };
let sequenciasLongas = 0;

console.log('\n⏳  Analisando jogos...\n');

for (const jogo of jogos) {
    const { idx, nums } = jogo;

    // ── 1. TAMANHO ──────────────────────────────────
    if (nums.length !== MEGA_NUMS) {
        bugs.tamanhoErrado.push({
            jogoNum: idx,
            esperado: MEGA_NUMS,
            recebido: nums.length,
            numeros: nums
        });
    }

    // ── 2. DUPLICATA INTERNA ────────────────────────
    const set = new Set(nums);
    if (set.size !== nums.length) {
        bugs.duplicataInterna.push({
            jogoNum: idx,
            numeros: nums,
            duplicados: nums.filter((n, i) => nums.indexOf(n) !== i)
        });
    }

    // ── 3. RANGE ────────────────────────────────────
    const foraRange = nums.filter(n => n < MEGA_MIN || n > MEGA_MAX);
    if (foraRange.length > 0) {
        bugs.foraDoRange.push({
            jogoNum: idx,
            numeros: nums,
            invalidos: foraRange
        });
    }

    // ── 4. ORDENAÇÃO ────────────────────────────────
    let ordenado = true;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] <= nums[i - 1]) { ordenado = false; break; }
    }
    if (!ordenado) {
        bugs.naoOrdenado.push({
            jogoNum: idx,
            numeros: nums
        });
    }

    // ── 5. DUPLICATA ENTRE JOGOS ────────────────────
    const key = nums.join('-');
    if (vistos.has(key)) {
        bugs.duplicatasEntreSi.push({
            jogoNum: idx,
            primeiroJogo: vistos.get(key),
            numeros: nums
        });
    } else {
        vistos.set(key, idx);
    }

    // ── 6. FREQUÊNCIA ───────────────────────────────
    for (const n of nums) {
        if (frequencia[n] !== undefined) frequencia[n]++;
    }

    // ── 7. PARES FREQUENTES ─────────────────────────
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            const pk = `${nums[i]}-${nums[j]}`;
            parFrequencia[pk] = (parFrequencia[pk] || 0) + 1;
        }
    }

    // ── 8. SOMA ─────────────────────────────────────
    const soma = nums.reduce((a, b) => a + b, 0);
    somaTodos.push(soma);

    // ── 9. PAR/ÍMPAR ────────────────────────────────
    for (const n of nums) {
        if (n % 2 === 0) parImparDist.par++;
        else parImparDist.impar++;
    }

    // ── 10. SEQUÊNCIAS LONGAS ───────────────────────
    let maxSeq = 1, cur = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1] + 1) { cur++; maxSeq = Math.max(maxSeq, cur); }
        else cur = 1;
    }
    if (maxSeq >= 4) sequenciasLongas++;
}

// ─── ESTATÍSTICAS ────────────────────────────────────────────────
const somaMedia = somaTodos.reduce((a, b) => a + b, 0) / somaTodos.length;
const somaMin = Math.min(...somaTodos);
const somaMax = Math.max(...somaTodos);
const somaModa = (() => {
    const hist = {};
    somaTodos.forEach(s => hist[s] = (hist[s] || 0) + 1);
    return Object.entries(hist).sort((a, b) => b[1] - a[1])[0][0];
})();

// Frequência ordenada
const freqOrdenada = Object.entries(frequencia)
    .map(([n, c]) => ({ num: parseInt(n), count: c }))
    .sort((a, b) => b.count - a.count);

// Top pares
const topPares = Object.entries(parFrequencia)
    .map(([k, c]) => ({ par: k, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

// Distribuição de dezenas (1-10, 11-20, ..., 51-60)
const dezenas = { '01-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0, '51-60': 0 };
for (const jogo of jogos) {
    for (const n of jogo.nums) {
        if (n >= 1 && n <= 10)   dezenas['01-10']++;
        else if (n <= 20)        dezenas['11-20']++;
        else if (n <= 30)        dezenas['21-30']++;
        else if (n <= 40)        dezenas['31-40']++;
        else if (n <= 50)        dezenas['41-50']++;
        else                     dezenas['51-60']++;
    }
}

const totalNums = jogos.length * MEGA_NUMS;
const dezenasPct = Object.fromEntries(
    Object.entries(dezenas).map(([k, v]) => [k, { count: v, pct: (v / totalNums * 100).toFixed(2) }])
);

// ─── RELATÓRIO ───────────────────────────────────────────────────
const linha = '═'.repeat(65);
const linhaMeio = '─'.repeat(65);

const totalBugs = bugs.tamanhoErrado.length + bugs.duplicataInterna.length +
                  bugs.foraDoRange.length + bugs.naoOrdenado.length +
                  bugs.duplicatasEntreSi.length;

let relatorio = '';
relatorio += '\n' + linha + '\n';
relatorio += '  📊  RELATÓRIO COMPLETO — MEGA SENA 10.000 JOGOS\n';
relatorio += '  🗓️  Análise: 16/06/2026 às 15:39\n';
relatorio += '  🔬  B2B Loterias — Motor L99 QuantumGodMode\n';
relatorio += linha + '\n';

relatorio += `\n  Total de jogos analisados: ${jogos.length.toLocaleString('pt-BR')}\n`;
relatorio += `  Faixa válida: ${MEGA_MIN} a ${MEGA_MAX}\n`;
relatorio += `  Números por jogo: ${MEGA_NUMS}\n`;

// ── BUGS ──
relatorio += '\n' + linhaMeio + '\n';
relatorio += '  🔍  VERIFICAÇÃO DE INTEGRIDADE\n';
relatorio += linhaMeio + '\n';

const pBugs = [
    ['Tamanho incorreto', bugs.tamanhoErrado.length],
    ['Duplicata interna', bugs.duplicataInterna.length],
    ['Fora do range (1-60)', bugs.foraDoRange.length],
    ['Não ordenados', bugs.naoOrdenado.length],
    ['Duplicatas entre jogos', bugs.duplicatasEntreSi.length],
];

for (const [nome, qtd] of pBugs) {
    const icone = qtd === 0 ? '✅' : '🔴';
    relatorio += `  ${icone}  ${nome.padEnd(28)}: ${qtd === 0 ? 'NENHUM' : qtd + ' encontrado(s)'}\n`;
}

relatorio += '\n';
if (totalBugs === 0) {
    relatorio += '  🏆  RESULTADO: SISTEMA 100% ÍNTEGRO!\n';
    relatorio += '      Nenhum bug encontrado nos 10.000 jogos.\n';
} else {
    relatorio += `  🔴  RESULTADO: ${totalBugs} BUG(S) ENCONTRADO(S)!\n`;
    
    if (bugs.tamanhoErrado.length > 0) {
        relatorio += `\n  TAMANHO INCORRETO (${bugs.tamanhoErrado.length}):\n`;
        bugs.tamanhoErrado.slice(0, 5).forEach(b =>
            relatorio += `    Jogo ${b.jogoNum}: ${b.recebido} números em vez de ${b.esperado}\n`
        );
    }
    if (bugs.duplicataInterna.length > 0) {
        relatorio += `\n  DUPLICATA INTERNA (${bugs.duplicataInterna.length}):\n`;
        bugs.duplicataInterna.slice(0, 5).forEach(b =>
            relatorio += `    Jogo ${b.jogoNum}: [${b.numeros.join(', ')}] — dups: ${b.duplicados.join(', ')}\n`
        );
    }
    if (bugs.foraDoRange.length > 0) {
        relatorio += `\n  FORA DO RANGE (${bugs.foraDoRange.length}):\n`;
        bugs.foraDoRange.slice(0, 5).forEach(b =>
            relatorio += `    Jogo ${b.jogoNum}: números inválidos: ${b.invalidos.join(', ')}\n`
        );
    }
    if (bugs.naoOrdenado.length > 0) {
        relatorio += `\n  NÃO ORDENADOS (${bugs.naoOrdenado.length}):\n`;
        bugs.naoOrdenado.slice(0, 5).forEach(b =>
            relatorio += `    Jogo ${b.jogoNum}: [${b.numeros.join(', ')}]\n`
        );
    }
    if (bugs.duplicatasEntreSi.length > 0) {
        relatorio += `\n  DUPLICATAS ENTRE JOGOS (${bugs.duplicatasEntreSi.length}):\n`;
        bugs.duplicatasEntreSi.slice(0, 10).forEach(b =>
            relatorio += `    Jogo ${b.jogoNum} = Jogo ${b.primeiroJogo}: [${b.numeros.join(', ')}]\n`
        );
    }
}

// ── FREQUÊNCIAS ──
relatorio += '\n' + linhaMeio + '\n';
relatorio += '  📈  FREQUÊNCIA DOS NÚMEROS (10.000 jogos)\n';
relatorio += linhaMeio + '\n';

relatorio += '\n  🔥  TOP 15 MAIS FREQUENTES:\n';
freqOrdenada.slice(0, 15).forEach((item, i) => {
    const barra = '█'.repeat(Math.round(item.count / jogos.length * 200));
    const pct = (item.count / totalNums * 100).toFixed(2);
    relatorio += `    ${String(i + 1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(5)}x (${pct}%)  ${barra}\n`;
});

relatorio += '\n  🧊  15 MENOS FREQUENTES:\n';
[...freqOrdenada].reverse().slice(0, 15).forEach((item, i) => {
    const barra = '░'.repeat(Math.round(item.count / jogos.length * 200)) || '—';
    const pct = (item.count / totalNums * 100).toFixed(2);
    relatorio += `    ${String(i + 1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(5)}x (${pct}%)  ${barra}\n`;
});

// ── SOMA ──
relatorio += '\n' + linhaMeio + '\n';
relatorio += '  ∑   ANÁLISE DE SOMA DOS JOGOS\n';
relatorio += linhaMeio + '\n';
relatorio += `  Soma média:     ${somaMedia.toFixed(1)}\n`;
relatorio += `  Soma mínima:    ${somaMin}\n`;
relatorio += `  Soma máxima:    ${somaMax}\n`;
relatorio += `  Soma mais freq: ${somaModa}\n`;
relatorio += `  Soma ideal MS:  183 (soma esperada = 60*61/2/10 × 6 ≈ 183)\n`;

// ── PAR/ÍMPAR ──
relatorio += '\n' + linhaMeio + '\n';
relatorio += '  🔢  DISTRIBUIÇÃO PAR/ÍMPAR\n';
relatorio += linhaMeio + '\n';
relatorio += `  Números pares:  ${parImparDist.par.toLocaleString('pt-BR')} (${(parImparDist.par / totalNums * 100).toFixed(1)}%)\n`;
relatorio += `  Números ímpares:${parImparDist.impar.toLocaleString('pt-BR')} (${(parImparDist.impar / totalNums * 100).toFixed(1)}%)\n`;
relatorio += `  Esperado teórico: 50% / 50%  (30 pares, 30 ímpares em 1-60)\n`;

// ── DEZENAS ──
relatorio += '\n' + linhaMeio + '\n';
relatorio += '  🗂️   DISTRIBUIÇÃO POR DEZENA\n';
relatorio += linhaMeio + '\n';
relatorio += '  Dezena esperada: ~16.67% por faixa (6 faixas × 10 números)\n\n';
for (const [faixa, dados] of Object.entries(dezenasPct)) {
    const barra = '█'.repeat(Math.round(parseFloat(dados.pct) / 2));
    const diff = parseFloat(dados.pct) - 16.67;
    const sinal = diff >= 0 ? '+' : '';
    relatorio += `  ${faixa}: ${String(dados.count).padStart(6)} (${dados.pct}%) [${sinal}${diff.toFixed(2)}%]  ${barra}\n`;
}

// ── SEQUÊNCIAS ──
relatorio += '\n' + linhaMeio + '\n';
relatorio += '  🔗  SEQUÊNCIAS LONGAS (4+ números consecutivos)\n';
relatorio += linhaMeio + '\n';
relatorio += `  Jogos com sequência de 4+: ${sequenciasLongas} (${(sequenciasLongas/jogos.length*100).toFixed(2)}%)\n`;
relatorio += `  Esperado: <0.5% em sorteios reais\n`;

// ── PARES MAIS FREQUENTES ──
relatorio += '\n' + linhaMeio + '\n';
relatorio += '  💑  TOP 20 PARES MAIS FREQUENTES\n';
relatorio += linhaMeio + '\n';
topPares.forEach((p, i) => {
    relatorio += `    ${String(i + 1).padStart(2)}. ${p.par.padEnd(8)}: ${p.count}x\n`;
});

// ── RESUMO ──
relatorio += '\n' + linha + '\n';
relatorio += '  📋  RESUMO EXECUTIVO\n';
relatorio += linha + '\n';
relatorio += `  Total de jogos:           ${jogos.length.toLocaleString('pt-BR')}\n`;
relatorio += `  Total de bugs críticos:   ${totalBugs}\n`;
relatorio += `  Duplicatas encontradas:   ${bugs.duplicatasEntreSi.length}\n`;
relatorio += `  Jogos únicos válidos:     ${(jogos.length - totalBugs).toLocaleString('pt-BR')}\n`;
relatorio += `  Soma média por jogo:      ${somaMedia.toFixed(1)}\n`;
relatorio += `  % par vs ímpar:           ${(parImparDist.par / totalNums * 100).toFixed(1)}% / ${(parImparDist.impar / totalNums * 100).toFixed(1)}%\n`;
relatorio += `  Cobertura de números:     ${freqOrdenada.filter(f => f.count > 0).length} de 60 (${(freqOrdenada.filter(f=>f.count>0).length/60*100).toFixed(1)}%)\n`;

if (totalBugs === 0) {
    relatorio += '\n  ✅  SISTEMA APROVADO — MOTOR L99 FUNCIONANDO CORRETAMENTE!\n';
} else {
    relatorio += `\n  ⚠️   ATENÇÃO: ${totalBugs} PROBLEMA(S) DETECTADO(S) — REVISÃO NECESSÁRIA!\n`;
}
relatorio += linha + '\n';

// ─── IMPRIMIR & SALVAR ───────────────────────────────────────────
console.log(relatorio);

fs.writeFileSync(SAIDA_TXT, relatorio, 'utf8');
console.log(`\n💾  Relatório salvo em: ${SAIDA_TXT}`);

const jsonSaida = {
    timestamp: new Date().toISOString(),
    arquivo: ARQUIVO,
    totalJogos: jogos.length,
    bugs: {
        total: totalBugs,
        tamanhoErrado: bugs.tamanhoErrado,
        duplicataInterna: bugs.duplicataInterna,
        foraDoRange: bugs.foraDoRange,
        naoOrdenado: bugs.naoOrdenado,
        duplicatasEntreSi: bugs.duplicatasEntreSi
    },
    estatisticas: {
        somaMedia: parseFloat(somaMedia.toFixed(2)),
        somaMin,
        somaMax,
        parImpar: parImparDist,
        dezenas: dezenasPct,
        sequenciasLongas,
        topFrequentes: freqOrdenada.slice(0, 20),
        topRaros: [...freqOrdenada].reverse().slice(0, 20),
        topPares,
        cobertura: freqOrdenada.filter(f => f.count > 0).length
    }
};

fs.writeFileSync(SAIDA_JSON, JSON.stringify(jsonSaida, null, 2), 'utf8');
console.log(`💾  JSON exportado em: ${SAIDA_JSON}\n`);

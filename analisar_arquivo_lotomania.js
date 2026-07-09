/**
 * ═══════════════════════════════════════════════════════════════
 *  ANALISADOR EXTREMAMENTE HONESTO — 10.000 JOGOS LOTOMANIA
 *  Range: 0-99 (100 números) | Aposta padrão: 20 números
 *  ⚠️  ATENÇÃO: arquivo contém 50 números por jogo — será investigado
 *
 *  REGRAS REAIS DA LOTOMANIA:
 *  - Jogador marca 50 números de 0-99
 *  - Caixa sorteia 20 números
 *  - Ganha prêmio maior com mais acertos (ou 0 acertos = prêmio especial)
 *  - Preço: R$ 3,00 por jogo de 50 números
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const ARQUIVO   = "C:\\Users\\luiss\\OneDrive\\Documents\\OneDrive\\Desktop\\LOTERIAS JOGOS SALVOS L99\\LOTOMANIA\\Lotomania_16-06-2026_16h20.txt";
const SAIDA_TXT  = path.join(__dirname, 'analise_lotomania_relatorio.txt');
const SAIDA_JSON = path.join(__dirname, 'analise_lotomania_resultado.json');

// Lotomania: 0-99 (100 números), jogo de 50 números
const LM_MIN  = 0;
const LM_MAX  = 99;
const LM_TOTAL= 100; // 0 a 99
// Jogador marca 50 → Caixa sorteia 20 → acertos de 15 a 20 ganham (ou 0)
// C(100, 50) = espaço amostral do jogador
// C(100, 20) = espaço amostral do sorteio

function nCr(n,k){
    if(k<0||k>n)return 0n;if(k===0||k===n)return 1n;if(k>n/2)k=n-k;
    let r=1n;const bn=BigInt(n);for(let i=1n;i<=BigInt(k);i++)r=r*(bn-i+1n)/i;return r;
}
// C(100,50) é astronômico — usar aproximação logarítmica
function logNCr(n,k){
    if(k<0||k>n)return -Infinity;
    let r=0;
    for(let i=0;i<k;i++) r+=Math.log(n-i)-Math.log(i+1);
    return r;
}

const logEspaco50 = logNCr(100,50);
const logEspaco20 = logNCr(100,20);

// ── LEITURA ──────────────────────────────────────────────────────
console.log('\n'+'═'.repeat(65));
console.log('  🟠  ANALISADOR EXTREMAMENTE HONESTO — LOTOMANIA 10.000 JOGOS');
console.log('═'.repeat(65));

const conteudo = fs.readFileSync(ARQUIVO,'utf8');
console.log(`✅  Lido: ${(conteudo.length/1024/1024).toFixed(2)} MB`);

// ── PARSE ─────────────────────────────────────────────────────────
const jogos = [];
let contadorNums = {};
for(const linha of conteudo.split('\n')){
    const m = linha.match(/^Jogo\s+(\d+):\s*([\d\s\-]+)$/);
    if(m){
        const idx  = parseInt(m[1]);
        const nums = m[2].split('-').map(n=>parseInt(n.trim())).filter(n=>!isNaN(n));
        jogos.push({idx,nums});
        if(!contadorNums[nums.length]) contadorNums[nums.length]=0;
        contadorNums[nums.length]++;
    }
}

// Detectar quantos números por jogo
const numsPorJogo = Object.keys(contadorNums).map(Number).sort((a,b)=>a-b);
const numDominante = numsPorJogo.reduce((a,b)=>contadorNums[a]>contadorNums[b]?a:b);

console.log(`📊  Jogos: ${jogos.length.toLocaleString('pt-BR')}`);
console.log(`\n⚠️  DISTRIBUIÇÃO DE TAMANHOS ENCONTRADA:`);
for(const[tam,cnt]of Object.entries(contadorNums).sort((a,b)=>parseInt(b[1])-parseInt(a[1]))){
    console.log(`    ${tam} números/jogo: ${cnt.toLocaleString()} jogos (${(cnt/jogos.length*100).toFixed(2)}%)`);
}

const LM_NUMS = numDominante; // tamanho predominante
console.log(`\n✅  Tamanho predominante: ${LM_NUMS} números por jogo`);

if(LM_NUMS !== 20 && LM_NUMS !== 50){
    console.log(`\n⚠️  NOTA: A Lotomania padrão usa 50 números por aposta (não 20).`);
    console.log(`    O sistema pode estar gerando o "fechamento" de 20 em 50.`);
    console.log(`    Ou seja: você aposta 50 nums e o sorteio é de 20.`);
}

// ── ANÁLISE ───────────────────────────────────────────────────────
const bugs = {
    tamanhoErrado:[], duplicataInterna:[],
    foraDoRange:[], naoOrdenado:[],
    duplicatasEntreSi:[]
};
const vistos = new Map();
const freq   = {};
for(let i=LM_MIN;i<=LM_MAX;i++) freq[i]=0;

const somaTodos  = [];
let   parsTotal  = {par:0,impar:0};
// Distribuição por dezena 0-9, 10-19, ..., 90-99
const dezenas = {};
for(let d=0;d<10;d++) dezenas[`${String(d*10).padStart(2,'0')}-${String(d*10+9).padStart(2,'0')}`]=0;

// Verificar balanceamento: cada jogo deve ter ~50 nums → metade superior (50-99), metade inferior (0-49)
let balanceamentoOk = 0;
let balanceamentoRuim = [];
let totalNums = 0;

for(const jogo of jogos){
    const {idx,nums} = jogo;
    totalNums += nums.length;

    // 1. Tamanho — verificar contra tamanho esperado
    // Na Lotomania, o jogo tem 50 números (não 20)
    if(nums.length !== LM_NUMS && nums.length !== 20 && nums.length !== 50)
        bugs.tamanhoErrado.push({jogoNum:idx,recebido:nums.length,numeros:nums.slice(0,5)});

    // 2. Duplicata interna
    const setN=new Set(nums);
    if(setN.size!==nums.length)
        bugs.duplicataInterna.push({jogoNum:idx,numeros:nums,
            duplicados:nums.filter((n,i)=>nums.indexOf(n)!==i)});

    // 3. Range
    const fora=nums.filter(n=>n<LM_MIN||n>LM_MAX);
    if(fora.length>0) bugs.foraDoRange.push({jogoNum:idx,numeros:nums.slice(0,5),invalidos:fora});

    // 4. Ordenação
    let ok=true;
    for(let i=1;i<nums.length;i++) if(nums[i]<=nums[i-1]){ok=false;break;}
    if(!ok) bugs.naoOrdenado.push({jogoNum:idx,numeros:nums.slice(0,5)});

    // 5. Dup entre jogos
    const key=nums.join('-');
    if(vistos.has(key)) bugs.duplicatasEntreSi.push({jogoNum:idx,primeiroJogo:vistos.get(key),numeros:nums.slice(0,6)});
    else vistos.set(key,idx);

    // 6. Freq
    for(const n of nums) if(freq[n]!==undefined) freq[n]++;

    // 7. Soma
    somaTodos.push(nums.reduce((a,b)=>a+b,0));

    // 8. Par/Ímpar (0-99: 50 pares 0,2,...,98 + 50 ímpares 1,3,...,99)
    for(const n of nums) n%2===0?parsTotal.par++:parsTotal.impar++;

    // 9. Dezenas
    for(const n of nums){
        const d=Math.floor(n/10);
        const k=`${String(d*10).padStart(2,'0')}-${String(d*10+9).padStart(2,'0')}`;
        if(dezenas[k]!==undefined) dezenas[k]++;
    }

    // 10. Balanceamento: metade inferior (0-49) vs superior (50-99)
    const baixos = nums.filter(n=>n<50).length;
    const altos  = nums.filter(n=>n>=50).length;
    const diff   = Math.abs(baixos-altos);
    if(diff<=4) balanceamentoOk++;
    else balanceamentoRuim.push({jogoNum:idx, baixos, altos, diff});
}

// ── CÁLCULOS ──────────────────────────────────────────────────────
const totalBugs  = Object.values(bugs).reduce((s,a)=>s+a.length,0);
const somaMedia  = somaTodos.reduce((a,b)=>a+b,0)/somaTodos.length;
const somaMin    = Math.min(...somaTodos);
const somaMax    = Math.max(...somaTodos);
// Soma ideal: LM_NUMS × média de 0-99 = LM_NUMS × 49.5
const SOMA_IDEAL = LM_NUMS * 49.5;

const freqOrd = Object.entries(freq)
    .map(([n,c])=>({num:parseInt(n),count:c,pct:(c/totalNums*100).toFixed(4)}))
    .sort((a,b)=>b.count-a.count);

const freqEsp = totalNums/LM_TOTAL;
const desvPad = Math.sqrt(freqOrd.reduce((acc,f)=>acc+(f.count-freqEsp)**2,0)/LM_TOTAL);
const coefVar = (desvPad/freqEsp*100);
const anomalias = freqOrd.filter(f=>Math.abs(f.count-freqEsp)>2.5*desvPad);

const nunca = new Set();
for(let i=LM_MIN;i<=LM_MAX;i++) nunca.add(i);
freqOrd.forEach(f=>{ if(f.count>0) nunca.delete(f.num); });

// Histograma de somas
const histSoma={};
somaTodos.forEach(s=>{const f=Math.floor(s/100)*100;histSoma[f]=(histSoma[f]||0)+1;});

// ── BENCHMARK aleatório puro ──────────────────────────────────────
console.log('⏳  Benchmarking...');
let bSoma=[], bBal=0, bSeqLong=0;
for(let t=0;t<50000;t++){
    let pool=[];for(let i=0;i<100;i++)pool.push(i);
    for(let i=pool.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];
    }
    const nums=pool.slice(0,LM_NUMS).sort((a,b)=>a-b);
    bSoma.push(nums.reduce((a,b)=>a+b,0));
    const baixos=nums.filter(n=>n<50).length;
    const altos=nums.filter(n=>n>=50).length;
    if(Math.abs(baixos-altos)<=4) bBal++;
    // Sequência de 5+ em LM_NUMS números de 100
    let ms=1,c=1;
    for(let i=1;i<nums.length;i++){
        if(nums[i]===nums[i-1]+1){c++;ms=Math.max(ms,c);}else c=1;
    }
    if(ms>=5) bSeqLong++;
}
const bench={
    somaMedia:(bSoma.reduce((a,b)=>a+b,0)/bSoma.length).toFixed(1),
    balanceadoPct:(bBal/50000*100).toFixed(2),
    seqLong5Pct:(bSeqLong/50000*100).toFixed(2)
};

// Sequências longas nos jogos
let seqLong5=0;
jogos.forEach(jogo=>{
    let ms=1,c=1;
    for(let i=1;i<jogo.nums.length;i++){
        if(jogo.nums[i]===jogo.nums[i-1]+1){c++;ms=Math.max(ms,c);}else c=1;
    }
    if(ms>=5) seqLong5++;
});

// ── PROBABILIDADES REAIS LOTOMANIA ───────────────────────────────
// Caixa sorteia 20 de 100. Jogador tem 50 de 100.
// P(k acertos) = C(50,k)*C(50,20-k) / C(100,20)
// Usando log para não explodir
function probAcertos(k){
    // C(50,k) * C(50,20-k) / C(100,20)
    const logNum = logNCr(50,k) + logNCr(50,20-k);
    const logDen = logNCr(100,20);
    return Math.exp(logNum - logDen);
}

// ── RELATÓRIO ─────────────────────────────────────────────────────
const L ='═'.repeat(65);
const Lm='─'.repeat(65);
let R='';

R+='\n'+L+'\n';
R+='  🟠  RELATÓRIO EXTREMAMENTE HONESTO — LOTOMANIA 10.000 JOGOS\n';
R+='  🗓️  Gerado: 16/06/2026 às 16:20\n';
R+='  ⚠️  ANÁLISE SEM FILTROS — DADOS PUROS\n';
R+=L+'\n';

// ── SEÇÃO 0: ESTRUTURA DO JOGO ──
R+='\n'+Lm+'\n';
R+='  📋  SEÇÃO 0 — ESTRUTURA DO ARQUIVO (INVESTIGAÇÃO)\n';
R+=Lm+'\n';
R+=`\n  Jogos analisados: ${jogos.length.toLocaleString('pt-BR')}\n`;
R+=`  Tamanhos encontrados por jogo:\n`;
for(const[tam,cnt]of Object.entries(contadorNums).sort((a,b)=>parseInt(b[1])-parseInt(a[1]))){
    R+=`    ${tam} números/jogo: ${String(cnt).padStart(6)} jogos (${(cnt/jogos.length*100).toFixed(2)}%)\n`;
}
R+=`\n  ⚠️  LOTOMANIA REAL — COMO FUNCIONA:\n`;
R+=`    O jogador MARCA 50 números de 0-99 (não 20)\n`;
R+=`    A Caixa SORTEIA 20 números\n`;
R+=`    Ganha quem acertar: 15, 16, 17, 18, 19, 20 números\n`;
R+=`    (ou 0 acertos = prêmio especial "Acerta Zero")\n`;
R+=`    Preço padrão: R$ 3,00 (aposta de 50 números)\n`;
R+=`\n  TAMANHO DETECTADO NO ARQUIVO: ${LM_NUMS} números/jogo\n`;

if(LM_NUMS===50){
    R+=`  ✅  CORRETO: arquivo contém apostas de 50 números (padrão Lotomania)\n`;
    R+=`  → Cada jogo é um "fechamento" completo de 50 números\n`;
}else if(LM_NUMS===20){
    R+=`  ⚠️  ATENÇÃO: arquivo contém 20 números/jogo\n`;
    R+=`  → Isso é o tamanho do SORTEIO, não da aposta.\n`;
    R+=`  → A Lotomania APOSTA tem 50 números. Verificar o motor.\n`;
}else{
    R+=`  ⚠️  TAMANHO INCOMUM: ${LM_NUMS} números. Investigar configuração.\n`;
}

// ── SEÇÃO 1: INTEGRIDADE ──
R+='\n'+Lm+'\n';
R+='  🔍  SEÇÃO 1 — INTEGRIDADE\n';
R+=Lm+'\n';
const checks=[
    [`Tamanho diferente de ${LM_NUMS}`, bugs.tamanhoErrado.length],
    ['Duplicata interna',              bugs.duplicataInterna.length],
    ['Fora do range (0-99)',           bugs.foraDoRange.length],
    ['Não ordenados',                 bugs.naoOrdenado.length],
    ['Jogos idênticos entre si',      bugs.duplicatasEntreSi.length],
];
for(const[nome,qtd]of checks)
    R+=`  ${qtd===0?'✅':'🔴'}  ${nome.padEnd(32)}: ${qtd===0?'NENHUM':'⚠️  '+qtd+' encontrado(s)'}\n`;
R+='\n';
if(totalBugs===0){
    R+=`  🏆  SISTEMA ÍNTEGRO — ZERO BUGS\n`;
}else{
    R+=`  🔴  ${totalBugs} PROBLEMA(S) ENCONTRADO(S)\n`;
    if(bugs.duplicatasEntreSi.length>0){
        R+=`\n  DUPLICATAS (${bugs.duplicatasEntreSi.length}):\n`;
        bugs.duplicatasEntreSi.slice(0,10).forEach(b=>
            R+=`    Jogo ${b.jogoNum} = Jogo ${b.primeiroJogo}: [${b.numeros.join('-')}...]\n`);
    }
    if(bugs.tamanhoErrado.length>0){
        R+=`\n  TAMANHO ERRADO (${bugs.tamanhoErrado.length}):\n`;
        bugs.tamanhoErrado.slice(0,5).forEach(b=>R+=`    Jogo ${b.jogoNum}: ${b.recebido} nºs\n`);
    }
    if(bugs.foraDoRange.length>0){
        R+=`\n  FORA DO RANGE 0-99 (${bugs.foraDoRange.length}):\n`;
        bugs.foraDoRange.slice(0,5).forEach(b=>R+=`    Jogo ${b.jogoNum}: [${b.invalidos.join(',')}]\n`);
    }
}

// ── SEÇÃO 2: NÚMEROS AUSENTES ──
R+='\n'+Lm+'\n';
R+='  🚫  SEÇÃO 2 — NÚMEROS QUE NUNCA APARECERAM\n';
R+=Lm+'\n';
const nuncaList=[...nunca].sort((a,b)=>a-b);
if(nuncaList.length===0){
    R+=`\n  ✅  Todos os 100 números (0-99) aparecem pelo menos uma vez.\n`;
    const pNunca=Math.pow(1-LM_NUMS/100,10000)*100;
    R+=`  (P(um nº nunca aparecer) teórico: ${pNunca.toFixed(8)}% — praticamente impossível)\n`;
}else{
    R+=`\n  🔴  ${nuncaList.length} número(s) NUNCA apareceram:\n      [${nuncaList.join(', ')}]\n`;
}

// ── SEÇÃO 3: FREQUÊNCIA ──
R+='\n'+Lm+'\n';
R+='  📈  SEÇÃO 3 — FREQUÊNCIA DOS 100 NÚMEROS (0-99)\n';
R+=Lm+'\n';
R+=`\n  Frequência esperada: ~${freqEsp.toFixed(0)}x  (${(100/LM_TOTAL).toFixed(2)}% cada)\n`;
R+=`  Desvio padrão:       ${desvPad.toFixed(1)}\n`;
R+=`  Coef. variação:      ${coefVar.toFixed(3)}%\n`;
R+=`  Interpretação: ${coefVar<2?'✅ Excelente (<2%)':coefVar<4?'✅ Bom (2-4%)':coefVar<6?'⚠️ Irregular (4-6%)':'🔴 VIÉS SEVERO (>6%)'}\n`;

if(anomalias.length>0){
    R+=`\n  ⚠️  ANOMALIAS (>2.5σ): ${anomalias.length} números:\n`;
    anomalias.forEach(f=>{
        const diff=f.count-freqEsp;
        const sg=diff>=0?'+':'';
        const sigma=(diff/desvPad).toFixed(2);
        R+=`    Nº ${String(f.num).padStart(2)}: ${f.count}x  [${sg}${diff.toFixed(0)} = ${sigma}σ]\n`;
    });
}else{
    R+=`\n  ✅  Nenhum número fora de 2.5σ\n`;
}

R+='\n  🔥  TOP 10 MAIS FREQUENTES:\n';
freqOrd.slice(0,10).forEach((item,i)=>{
    const diff=item.count-freqEsp;
    const sg=diff>=0?'+':'';
    const sigma=(diff/desvPad).toFixed(2);
    R+=`    ${String(i+1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(6)}x  [${sg}${diff.toFixed(0)} / ${sigma}σ]\n`;
});
R+='\n  🧊  TOP 10 MENOS FREQUENTES:\n';
[...freqOrd].reverse().slice(0,10).forEach((item,i)=>{
    const diff=item.count-freqEsp;
    const sg=diff>=0?'+':'';
    const sigma=(diff/desvPad).toFixed(2);
    R+=`    ${String(i+1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(6)}x  [${sg}${diff.toFixed(0)} / ${sigma}σ]\n`;
});

// Todos os 100 números
R+='\n  📊  TODOS OS 100 NÚMEROS (em ordem crescente):\n';
const fpn=Object.entries(freq).map(([n,c])=>({num:parseInt(n),count:c})).sort((a,b)=>a.num-b.num);
fpn.forEach(item=>{
    const diff=item.count-freqEsp;
    const sg=diff>=0?'+':'';
    const sigma=Math.abs(diff/desvPad);
    const alerta=sigma>2.5?` ⚠️ ${sigma.toFixed(1)}σ`:'';
    R+=`    Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(6)}x  [${sg}${diff.toFixed(0)}]${alerta}\n`;
});

// ── SEÇÃO 4: SOMA ──
R+='\n'+Lm+'\n';
R+='  ∑   SEÇÃO 4 — SOMA DOS JOGOS\n';
R+=Lm+'\n';
R+=`\n  Soma média real:      ${somaMedia.toFixed(1)}\n`;
R+=`  Soma média aleatório: ${bench.somaMedia}\n`;
R+=`  Soma ideal teórica:   ${SOMA_IDEAL.toFixed(1)}  (${LM_NUMS} × 49.5)\n`;
R+=`  Desvio:               ${(somaMedia-SOMA_IDEAL).toFixed(1)} (${(Math.abs(somaMedia-SOMA_IDEAL)/SOMA_IDEAL*100).toFixed(3)}%)\n`;
R+=`  Soma mínima:          ${somaMin}\n`;
R+=`  Soma máxima:          ${somaMax}\n`;
R+=`  Amplitude:            ${somaMax-somaMin}\n\n`;
R+='  DISTRIBUIÇÃO DE SOMAS (histograma):\n';
Object.entries(histSoma).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).forEach(([f,c])=>{
    const barra='█'.repeat(Math.round(c/60));
    R+=`    ${String(f).padStart(4)}-${String(parseInt(f)+99).padStart(4)}: ${String(c).padStart(5)}  ${barra}\n`;
});

// ── SEÇÃO 5: PAR/ÍMPAR ──
R+='\n'+Lm+'\n';
R+='  🔢  SEÇÃO 5 — PAR/ÍMPAR\n';
R+=Lm+'\n';
// 0-99: 50 pares (0,2,...,98) + 50 ímpares (1,3,...,99)
// Esperado: 50%/50% com LM_NUMS números
const parReal=(parsTotal.par/totalNums*100);
R+=`\n  Pares:   ${parsTotal.par.toLocaleString('pt-BR')} (${parReal.toFixed(3)}%)\n`;
R+=`  Ímpares: ${parsTotal.impar.toLocaleString('pt-BR')} (${(parsTotal.impar/totalNums*100).toFixed(3)}%)\n`;
R+=`  Esperado: 50%/50%  (0-99 tem 50 pares e 50 ímpares)\n`;
R+=`  Desvio: ${Math.abs(parReal-50).toFixed(3)}%  ${Math.abs(parReal-50)<0.5?'✅ Normal':'⚠️ Atenção'}\n`;

// ── SEÇÃO 6: DEZENAS ──
R+='\n'+Lm+'\n';
R+='  🗂️   SEÇÃO 6 — DISTRIBUIÇÃO POR DEZENA (10 faixas de 10)\n';
R+=Lm+'\n';
const dezEsp=10.0; // 10% por dezena
R+=`\n  Esperado: 10% por dezena (10 números de 100)\n\n`;
for(const[faixa,count]of Object.entries(dezenas)){
    const pct=count/totalNums*100;
    const diff=pct-dezEsp;
    const sg=diff>=0?'+':'';
    const barra='█'.repeat(Math.round(pct));
    const alerta=Math.abs(diff)>0.5?' ⚠️':'';
    R+=`  ${faixa}: ${String(count).padStart(7)} (${pct.toFixed(3)}%) [${sg}${diff.toFixed(3)}%]  ${barra}${alerta}\n`;
}

// ── SEÇÃO 7: BALANCEAMENTO BAIXO/ALTO ──
R+='\n'+Lm+'\n';
R+='  ⚖️   SEÇÃO 7 — BALANCEAMENTO INFERIOR(0-49) VS SUPERIOR(50-99)\n';
R+=Lm+'\n';
R+=`\n  Jogos bem balanceados (diff ≤4): ${balanceamentoOk} (${(balanceamentoOk/10000*100).toFixed(2)}%)\n`;
R+=`  Jogos desbalanceados (diff >4):  ${balanceamentoRuim.length} (${(balanceamentoRuim.length/10000*100).toFixed(2)}%)\n`;
R+=`\n  BENCHMARK aleatório puro (50.000 simulações):\n`;
R+=`    Balanceados esperado: ${bench.balanceadoPct}%\n`;
const diffBal=Math.abs(balanceamentoOk/100-parseFloat(bench.balanceadoPct));
R+=`    Diferença real vs puro: ${diffBal.toFixed(2)}%  ${diffBal<5?'✅ Normal':'⚠️ Desvio relevante'}\n`;
if(balanceamentoRuim.length>0 && balanceamentoRuim.length<20){
    R+=`\n  Jogos desbalanceados:\n`;
    balanceamentoRuim.slice(0,10).forEach(b=>
        R+=`    Jogo ${b.jogoNum}: ${b.baixos} baixos / ${b.altos} altos (diff=${b.diff})\n`);
}

// ── SEÇÃO 8: SEQUÊNCIAS ──
R+='\n'+Lm+'\n';
R+='  🔗  SEÇÃO 8 — SEQUÊNCIAS CONSECUTIVAS (5+ em 50 números de 100)\n';
R+=Lm+'\n';
R+=`\n  Gerador — com 5+ consecutivos: ${seqLong5} (${(seqLong5/10000*100).toFixed(2)}%)\n`;
R+=`  Aleatório puro (benchmark):    ${bench.seqLong5Pct}%\n`;
const diffSeq5=Math.abs(seqLong5/10000*100-parseFloat(bench.seqLong5Pct));
R+=`  Diferença: ${diffSeq5.toFixed(2)}%  ${diffSeq5<5?'✅ Normal':'⚠️ Desvio relevante'}\n`;
R+=`\n  NOTA: Com 50 de 100 números (50% de cobertura), sequências longas\n`;
R+=`  são matematicamente comuns. Diferente da Quina/Dupla Sena.\n`;

// ── SEÇÃO 9: PROBABILIDADES ──
R+='\n'+L+'\n';
R+='  💣  SEÇÃO 9 — PROBABILIDADES REAIS DA LOTOMANIA\n';
R+=L+'\n';

const logC100_20 = logNCr(100,20);
R+=`\n  REGRA DO JOGO: Você marca ${LM_NUMS} de 100. Sorteados: 20 de 100.\n`;
R+=`  Espaço do sorteio: C(100,20) = exp(${logC100_20.toFixed(1)}) ≈ 10^${(logC100_20/Math.log(10)).toFixed(0)} combinações\n\n`;
R+=`  PROBABILIDADE POR JOGO (por sorteio):\n`;
const premios=[20,19,18,17,16,15,0];
for(const k of premios){
    const p=probAcertos(k);
    if(p<1e-15) { R+=`    ${k} acertos: probabilidade < 10^-15 (irrelevante)\n`; continue; }
    const em1=Math.round(1/p);
    R+=`    ${String(k).padStart(2)} acertos: ${(p*100).toFixed(8)}%  (1 em ${em1.toLocaleString('pt-BR')})\n`;
}

R+=`\n  COM 10.000 JOGOS (R$ 30.000,00):\n`;
for(const k of premios){
    const p=probAcertos(k);
    if(p<1e-15) continue;
    const p10k=1-Math.pow(1-p,10000);
    R+=`    P(pelo menos 1 jogo com ${k} acertos): ${(p10k*100).toFixed(6)}%\n`;
}

R+=`\n  ⚠️  CUSTO REAL:\n`;
R+=`    10.000 jogos × R$ 3,00 = R$ 30.000,00 investidos\n`;
R+=`    Retorno esperado (EV): ~R$ 16.200,00  (casa retém ~46%)\n`;
R+=`    Prejuízo esperado: ~R$ 13.800,00\n`;

// ── SEÇÃO 10: RESUMO ──
R+='\n'+L+'\n';
R+='  📋  SEÇÃO 10 — RESUMO COM MÁXIMA HONESTIDADE\n';
R+=L+'\n';
R+=`
  ┌───────────────────────────────────────────────────────────┐
  │                    LADO TÉCNICO                           │
  ├───────────────────────────────────────────────────────────┤
  │ Bugs totais:    ${String(totalBugs===0?'ZERO':totalBugs+' ⚠️').padEnd(43)}│
  │ Duplicatas:     ${String(bugs.duplicatasEntreSi.length===0?'ZERO':bugs.duplicatasEntreSi.length+' ⚠️').padEnd(43)}│
  │ Nºs ausentes:  ${String(nuncaList.length===0?'NENHUM — 100/100 cobertos':'⚠️ '+nuncaList.length+' ausentes').padEnd(44)}│
  │ Anomalias >2.5σ:${String(anomalias.length===0?'NENHUMA':anomalias.length+' números ⚠️').padEnd(43)}│
  │ Soma média:     ${String(somaMedia.toFixed(1)+' vs ideal '+SOMA_IDEAL+' (desvio '+Math.abs(somaMedia-SOMA_IDEAL).toFixed(1)+')').padEnd(43)}│
  │ Par/Ímpar:      ${String((parsTotal.par/totalNums*100).toFixed(2)+'% / '+(parsTotal.impar/totalNums*100).toFixed(2)+'% (esp 50%/50%)').padEnd(43)}│
  │ Coef.variação:  ${String(coefVar.toFixed(3)+'% — '+(coefVar<4?'BOM':'⚠️ IRREGULAR')).padEnd(43)}│
  │ Tamanho jogo:   ${String(LM_NUMS+' números '+(LM_NUMS===50?'(✅ correto para Lotomania)':'(⚠️ verificar)')).padEnd(43)}│
  └───────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────┐
  │                    LADO DAS APOSTAS                       │
  ├───────────────────────────────────────────────────────────┤
  │ Custo:          R$ 30.000,00                              │
  │ Retorno esp.:   ~R$ 16.200,00 (EV NEGATIVO)               │
  │ Prediz sorteio: NÃO. NUNCA. MATEMATICAMENTE IMPOSSÍVEL.   │
  └───────────────────────────────────────────────────────────┘
`+L+'\n';

console.log(R);
fs.writeFileSync(SAIDA_TXT,  R,'utf8');
fs.writeFileSync(SAIDA_JSON,JSON.stringify({
    timestamp:new Date().toISOString(),
    totalJogos:jogos.length,
    numsPorJogo:LM_NUMS,
    contadorTamanhos:contadorNums,
    bugs:{total:totalBugs,
        tamanhoErrado:bugs.tamanhoErrado.length,
        duplicataInterna:bugs.duplicataInterna.length,
        foraDoRange:bugs.foraDoRange.length,
        naoOrdenado:bugs.naoOrdenado.length,
        duplicatas:bugs.duplicatasEntreSi.length,
        listaDuplicatas:bugs.duplicatasEntreSi.slice(0,20)
    },
    numerosAusentes:nuncaList,
    anomalias,
    estatisticas:{
        somaMedia:parseFloat(somaMedia.toFixed(2)),
        somaIdeal:SOMA_IDEAL,somaMin,somaMax,
        parImpar:parsTotal,dezenas,
        balanceamento:{ok:balanceamentoOk,ruim:balanceamentoRuim.length},
        seqLong5,benchmark:bench,
        coefVariacao:parseFloat(coefVar.toFixed(4)),
        topFrequentes:freqOrd.slice(0,15),
        topRaros:[...freqOrd].reverse().slice(0,15)
    }
},null,2),'utf8');

console.log(`\n💾  ${SAIDA_TXT}`);
console.log(`💾  ${SAIDA_JSON}\n`);

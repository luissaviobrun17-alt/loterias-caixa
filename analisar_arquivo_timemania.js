/**
 * ═══════════════════════════════════════════════════════════════
 *  ANALISADOR EXTREMAMENTE HONESTO — 10.000 JOGOS TIMEMANIA
 *  Range numérico: 1-80 | 10 números por jogo
 *  + "Time do Coração" (não presente no arquivo — investigado)
 *
 *  REGRAS REAIS DA TIMEMANIA:
 *  - Jogador escolhe 10 números de 1-80
 *  - Jogador escolhe 1 time de futebol ("Time do Coração")
 *  - Caixa sorteia 7 números + 1 time
 *  - Prêmios: 7, 6, 5, 4, 3 acertos numéricos + time
 *  - Preço: R$ 3,00
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const ARQUIVO   = "C:\\Users\\luiss\\OneDrive\\Documents\\OneDrive\\Desktop\\LOTERIAS JOGOS SALVOS L99\\TIMEMANIA\\Timemania_16-06-2026_16h23.txt";
const SAIDA_TXT  = path.join(__dirname, 'analise_timemania_relatorio.txt');
const SAIDA_JSON = path.join(__dirname, 'analise_timemania_resultado.json');

const TM_MIN  = 1;
const TM_MAX  = 80;
const TM_NUMS = 10;  // jogador escolhe 10
const TM_SORT = 7;   // sorteio é de 7 números
const TM_TIMES= 80;  // 80 times possíveis

function nCr(n,k){
    if(k<0||k>n)return 0;if(k===0||k===n)return 1;if(k>n/2)k=n-k;
    let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r);
}

// Espaço amostral Timemania
// C(80,10) × 80 (times) = combinações possíveis de apostas
// C(80,7) = sorteios possíveis (sem contar time)
const C80_10 = nCr(80,10);
const C80_7  = nCr(80,7);

// ── LEITURA ──────────────────────────────────────────────────────
console.log('\n'+'═'.repeat(65));
console.log('  ⚽  ANALISADOR EXTREMAMENTE HONESTO — TIMEMANIA 10.000 JOGOS');
console.log('═'.repeat(65));

const conteudo = fs.readFileSync(ARQUIVO,'utf8');
console.log(`✅  Lido: ${(conteudo.length/1024).toFixed(1)} KB`);

// ── PARSE ─────────────────────────────────────────────────────────
const jogos = [];
const contadorTams = {};
for(const linha of conteudo.split('\n')){
    const m = linha.match(/^Jogo\s+(\d+):\s*([\d\s\-]+)$/);
    if(m){
        const idx  = parseInt(m[1]);
        const nums = m[2].split('-').map(n=>parseInt(n.trim())).filter(n=>!isNaN(n));
        jogos.push({idx,nums});
        contadorTams[nums.length]=(contadorTams[nums.length]||0)+1;
    }
}

console.log(`📊  Jogos: ${jogos.length.toLocaleString('pt-BR')}`);
console.log(`📏  Tamanhos encontrados:`);
Object.entries(contadorTams).sort().forEach(([t,c])=>
    console.log(`    ${t} números/jogo: ${c} (${(c/jogos.length*100).toFixed(2)}%)`));

const numDom = Object.entries(contadorTams).sort((a,b)=>b[1]-a[1])[0][0];
console.log(`\n✅  Tamanho dominante: ${numDom} números/jogo`);

// ── ANÁLISE ───────────────────────────────────────────────────────
const bugs = {
    tamanhoErrado:[], duplicataInterna:[],
    foraDoRange:[], naoOrdenado:[], duplicatasEntreSi:[]
};
const vistos = new Map();
const freq   = {};
for(let i=TM_MIN;i<=TM_MAX;i++) freq[i]=0;

const somaTodos = [];
let   parsTotal = {par:0,impar:0};
let   seqLongas2=0, seqLongas3=0;
const dezenas = {};
for(let d=1;d<=8;d++) dezenas[`${String((d-1)*10+1).padStart(2,'0')}-${String(d*10).padStart(2,'0')}`]=0;

const gapHist = {};
const nunca   = new Set();
for(let i=TM_MIN;i<=TM_MAX;i++) nunca.add(i);

let totalNums = 0;

// Análise de padrões suspeitos
const distribNumerosAltos   = []; // quantos números > 40 por jogo
const distribNumerosZona    = {baixa:0,media:0,alta:0}; // 1-27, 28-54, 55-80

for(const jogo of jogos){
    const {idx,nums} = jogo;
    totalNums += nums.length;

    // 1. Tamanho
    if(nums.length !== parseInt(numDom))
        bugs.tamanhoErrado.push({jogoNum:idx,recebido:nums.length});

    // 2. Dup interna
    const setN=new Set(nums);
    if(setN.size!==nums.length)
        bugs.duplicataInterna.push({jogoNum:idx,numeros:nums,
            duplicados:nums.filter((n,i)=>nums.indexOf(n)!==i)});

    // 3. Range
    const fora=nums.filter(n=>n<TM_MIN||n>TM_MAX);
    if(fora.length>0) bugs.foraDoRange.push({jogoNum:idx,invalidos:fora});

    // 4. Ordenação
    let ok=true;
    for(let i=1;i<nums.length;i++) if(nums[i]<=nums[i-1]){ok=false;break;}
    if(!ok) bugs.naoOrdenado.push({jogoNum:idx,numeros:nums});

    // 5. Dup entre jogos
    const key=nums.join('-');
    if(vistos.has(key)) bugs.duplicatasEntreSi.push({jogoNum:idx,primeiroJogo:vistos.get(key),numeros:nums});
    else vistos.set(key,idx);

    // 6. Freq
    for(const n of nums){
        if(freq[n]!==undefined) freq[n]++;
        nunca.delete(n);
    }

    // 7. Soma
    somaTodos.push(nums.reduce((a,b)=>a+b,0));

    // 8. Par/ímpar (1-80: 40 pares, 40 ímpares)
    for(const n of nums) n%2===0?parsTotal.par++:parsTotal.impar++;

    // 9. Dezenas
    for(const n of nums){
        const d=Math.ceil(n/10);
        const k=`${String((d-1)*10+1).padStart(2,'0')}-${String(d*10).padStart(2,'0')}`;
        if(dezenas[k]!==undefined) dezenas[k]++;
    }

    // 10. Sequências
    let ms=1,c=1;
    for(let i=1;i<nums.length;i++){
        if(nums[i]===nums[i-1]+1){c++;ms=Math.max(ms,c);}else c=1;
    }
    if(ms>=2) seqLongas2++;
    if(ms>=3) seqLongas3++;

    // 11. Gaps
    for(let i=1;i<nums.length;i++){
        const g=nums[i]-nums[i-1];
        gapHist[g]=(gapHist[g]||0)+1;
    }

    // 12. Distribuição zona
    const altos=nums.filter(n=>n>40).length;
    distribNumerosAltos.push(altos);
    nums.forEach(n=>{
        if(n<=27) distribNumerosZona.baixa++;
        else if(n<=54) distribNumerosZona.media++;
        else distribNumerosZona.alta++;
    });
}

// ── CÁLCULOS ──────────────────────────────────────────────────────
const totalBugs  = Object.values(bugs).reduce((s,a)=>s+a.length,0);
const somaMedia  = somaTodos.reduce((a,b)=>a+b,0)/somaTodos.length;
const somaMin    = Math.min(...somaTodos);
const somaMax    = Math.max(...somaTodos);
// Soma ideal: 10 × (1+80)/2 = 10 × 40.5 = 405
const SOMA_IDEAL = TM_NUMS*(TM_MIN+TM_MAX)/2;

const freqOrd = Object.entries(freq)
    .map(([n,c])=>({num:parseInt(n),count:c,pct:(c/totalNums*100).toFixed(4)}))
    .sort((a,b)=>b.count-a.count);

const freqEsp = totalNums/80;
const desvPad = Math.sqrt(freqOrd.reduce((acc,f)=>acc+(f.count-freqEsp)**2,0)/80);
const coefVar = (desvPad/freqEsp*100);
const anomalias = freqOrd.filter(f=>Math.abs(f.count-freqEsp)>2.5*desvPad);

// Gaps
const gapTotal = Object.entries(gapHist).reduce((s,[g,c])=>s+parseInt(g)*c,0);
const gapCount = Object.entries(gapHist).reduce((s,[,c])=>s+c,0);
const gapMedia = gapTotal/gapCount;
// Gap esperado: (80+1)/(10+1) = 7.36
const gapEsp   = (TM_MAX+1)/(TM_NUMS+1);

// Histograma somas
const histSoma={};
somaTodos.forEach(s=>{const f=Math.floor(s/40)*40;histSoma[f]=(histSoma[f]||0)+1;});

// ── BENCHMARK ─────────────────────────────────────────────────────
console.log('⏳  Benchmark (200.000 jogos aleatórios puros)...');
let b2=0,b3=0,bSoma=[];
for(let t=0;t<200000;t++){
    let pool=[];for(let i=TM_MIN;i<=TM_MAX;i++)pool.push(i);
    for(let i=pool.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];
    }
    const nums=pool.slice(0,TM_NUMS).sort((a,b)=>a-b);
    let ms=1,c=1;
    for(let i=1;i<nums.length;i++){if(nums[i]===nums[i-1]+1){c++;ms=Math.max(ms,c);}else c=1;}
    if(ms>=2) b2++;
    if(ms>=3) b3++;
    bSoma.push(nums.reduce((a,b)=>a+b,0));
}
const bench={
    pct2:(b2/200000*100).toFixed(2),
    pct3:(b3/200000*100).toFixed(2),
    somaMedia:(bSoma.reduce((a,b)=>a+b,0)/bSoma.length).toFixed(1)
};

// ── PROBABILIDADES ────────────────────────────────────────────────
// P(k acertos numéricos) = C(10,k)*C(70,7-k)/C(80,7)
// + time do coração: P(time correto) = 1/80
function probNum(k){
    if(k<0||k>7||k>TM_NUMS) return 0;
    return nCr(10,k)*nCr(70,7-k)/C80_7;
}
const probTime = 1/TM_TIMES; // 1 em 80

// Prêmios: 7pts, 6pts, 5pts, 4pts, 3pts
const premioNums = [7,6,5,4,3];

// ── RELATÓRIO ─────────────────────────────────────────────────────
const L ='═'.repeat(65);
const Lm='─'.repeat(65);
let R='';

R+='\n'+L+'\n';
R+='  ⚽  RELATÓRIO EXTREMAMENTE HONESTO — TIMEMANIA 10.000 JOGOS\n';
R+='  🗓️  Gerado: 16/06/2026 às 16:23\n';
R+='  ⚠️  ANÁLISE SEM FILTROS — DADOS PUROS\n';
R+=L+'\n';

// ── SEÇÃO 0: ESTRUTURA ──
R+='\n'+Lm+'\n';
R+='  📋  SEÇÃO 0 — ESTRUTURA DO ARQUIVO E REGRAS DO JOGO\n';
R+=Lm+'\n';
R+=`\n  COMO A TIMEMANIA FUNCIONA (verdade completa):\n`;
R+=`    Jogador escolhe: 10 números de 1-80\n`;
R+=`                   + 1 "Time do Coração" de 80 times disponíveis\n`;
R+=`    Sorteio:         7 números de 1-80\n`;
R+=`                   + 1 time sorteado\n`;
R+=`    Preço:           R$ 3,00 por jogo\n`;
R+=`\n  O QUE O ARQUIVO CONTÉM:\n`;
Object.entries(contadorTams).sort().forEach(([t,c])=>
    R+=`    ${t} números/jogo: ${c} jogos (${(c/jogos.length*100).toFixed(2)}%)\n`);
R+=`\n  ⚠️  AUSENTE NO ARQUIVO: "Time do Coração"\n`;
R+=`    O arquivo registra apenas os 10 números numéricos.\n`;
R+=`    O time não está salvo no TXT — não é possível analisar.\n`;
R+=`    Impacto na probabilidade: fator ×${TM_TIMES} no denominador.\n`;
R+=`    (cada combinação numérica ainda compete com 1/80 de prob do time)\n`;
R+=`\n  C(80,10) = ${C80_10.toLocaleString('pt-BR')} combinações numéricas possíveis\n`;
R+=`  C(80,7)  = ${C80_7.toLocaleString('pt-BR')} sorteios numéricos possíveis\n`;
R+=`  10.000 apostas = ${(10000/C80_10*100).toFixed(6)}% do espaço numérico\n`;
R+=`  Custo total:    R$ ${(10000*3).toLocaleString('pt-BR')},00\n`;

// ── SEÇÃO 1: INTEGRIDADE ──
R+='\n'+Lm+'\n';
R+='  🔍  SEÇÃO 1 — INTEGRIDADE\n';
R+=Lm+'\n';
const checks=[
    [`Tamanho incorreto (≠${numDom})`, bugs.tamanhoErrado.length],
    ['Duplicata interna',               bugs.duplicataInterna.length],
    ['Fora do range (1-80)',            bugs.foraDoRange.length],
    ['Não ordenados',                  bugs.naoOrdenado.length],
    ['Jogos idênticos entre si',       bugs.duplicatasEntreSi.length],
];
for(const[nome,qtd]of checks)
    R+=`  ${qtd===0?'✅':'🔴'}  ${nome.padEnd(30)}: ${qtd===0?'NENHUM':'⚠️  '+qtd+' encontrado(s)'}\n`;
R+='\n';
if(totalBugs===0){
    R+=`  🏆  SISTEMA ÍNTEGRO — ZERO BUGS\n`;
}else{
    R+=`  🔴  ${totalBugs} PROBLEMA(S) ENCONTRADO(S)\n`;
    if(bugs.duplicatasEntreSi.length>0){
        const pBD=(1-Math.exp(-(10000**2)/(2*C80_10)))*100;
        R+=`\n  DUPLICATAS (${bugs.duplicatasEntreSi.length}):\n`;
        bugs.duplicatasEntreSi.slice(0,10).forEach(b=>
            R+=`    Jogo ${b.jogoNum} = Jogo ${b.primeiroJogo}: [${b.numeros.join('-')}]\n`);
        R+=`  Birthday problem (esperado): ~${pBD.toFixed(4)}%\n`;
        const taxaReal=bugs.duplicatasEntreSi.length/10000*100;
        R+=`  Taxa real: ${taxaReal.toFixed(3)}%  → ${taxaReal>pBD*3?'⚠️ VIÉS NO GERADOR':'dentro do esperado'}\n`;
    }
    if(bugs.tamanhoErrado.length>0){
        R+=`\n  TAMANHO ERRADO (${bugs.tamanhoErrado.length}):\n`;
        bugs.tamanhoErrado.slice(0,5).forEach(b=>R+=`    Jogo ${b.jogoNum}: ${b.recebido} nºs\n`);
    }
    if(bugs.foraDoRange.length>0){
        R+=`\n  FORA DO RANGE (${bugs.foraDoRange.length}):\n`;
        bugs.foraDoRange.slice(0,5).forEach(b=>R+=`    Jogo ${b.jogoNum}: inválidos=${b.invalidos.join(',')}\n`);
    }
}

// ── SEÇÃO 2: NÚMEROS AUSENTES ──
R+='\n'+Lm+'\n';
R+='  🚫  SEÇÃO 2 — NÚMEROS QUE NUNCA APARECERAM\n';
R+=Lm+'\n';
const nuncaList=[...nunca].sort((a,b)=>a-b);
if(nuncaList.length===0){
    R+=`\n  ✅  Todos os 80 números (1-80) aparecem pelo menos 1 vez.\n`;
    const pN=Math.pow(1-10/80,10000)*100;
    R+=`  P(número específico nunca aparecer): ${pN.toFixed(8)}% (praticamente 0)\n`;
}else{
    R+=`\n  🔴  ${nuncaList.length} número(s) NUNCA apareceram:\n      [${nuncaList.join(', ')}]\n`;
    const pN=Math.pow(1-10/80,10000)*100;
    R+=`  P(esperada) de nunca aparecer: ${pN.toFixed(8)}%\n`;
    R+=`  ${nuncaList.length} ausentes sugere ${nuncaList.length>3?'⚠️ POSSÍVEL VIÉS no gerador':'flutuação normal'}\n`;
}

// ── SEÇÃO 3: FREQUÊNCIAS ──
R+='\n'+Lm+'\n';
R+='  📈  SEÇÃO 3 — FREQUÊNCIA DOS 80 NÚMEROS\n';
R+=Lm+'\n';
R+=`\n  Freq esperada: ~${freqEsp.toFixed(0)}x  (${(100/80).toFixed(2)}% cada)\n`;
R+=`  Desvio padrão: ${desvPad.toFixed(1)}\n`;
R+=`  Coef. variação: ${coefVar.toFixed(3)}%\n`;
R+=`  Interpretação: ${coefVar<3?'✅ BOM (<3%)':coefVar<5?'⚠️ IRREGULAR (3-5%)':'🔴 VIÉS SEVERO (>5%)'}\n`;

if(anomalias.length>0){
    R+=`\n  ⚠️  ANOMALIAS (>2.5σ): ${anomalias.length} números:\n`;
    anomalias.forEach(f=>{
        const diff=f.count-freqEsp;
        const sg=diff>=0?'+':'';
        const sigma=(diff/desvPad).toFixed(2);
        R+=`    Nº ${String(f.num).padStart(2)}: ${f.count}x  [${sg}${diff.toFixed(0)} = ${sigma}σ]\n`;
    });
}else{
    R+=`\n  ✅  Nenhum número fora de 2.5σ — distribuição estatisticamente normal.\n`;
}

R+='\n  🔥  TOP 10 MAIS FREQUENTES:\n';
freqOrd.slice(0,10).forEach((item,i)=>{
    const diff=item.count-freqEsp;
    const sg=diff>=0?'+':'';
    const sigma=(diff/desvPad).toFixed(2);
    R+=`    ${String(i+1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(5)}x (${item.pct}%)  [${sg}${diff.toFixed(0)} / ${sigma}σ]\n`;
});

R+='\n  🧊  TOP 10 MENOS FREQUENTES:\n';
[...freqOrd].reverse().slice(0,10).forEach((item,i)=>{
    const diff=item.count-freqEsp;
    const sg=diff>=0?'+':'';
    const sigma=(diff/desvPad).toFixed(2);
    R+=`    ${String(i+1).padStart(2)}. Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(5)}x (${item.pct}%)  [${sg}${diff.toFixed(0)} / ${sigma}σ]\n`;
});

R+='\n  📊  TODOS OS 80 NÚMEROS:\n';
Object.entries(freq).map(([n,c])=>({num:parseInt(n),count:c})).sort((a,b)=>a.num-b.num).forEach(item=>{
    const diff=item.count-freqEsp;
    const sg=diff>=0?'+':'';
    const sigma=Math.abs(diff/desvPad);
    const alerta=sigma>2.5?` ⚠️ ${sigma.toFixed(1)}σ`:'';
    R+=`    Nº ${String(item.num).padStart(2)}: ${String(item.count).padStart(5)}x  [${sg}${diff.toFixed(0)}]${alerta}\n`;
});

// ── SEÇÃO 4: SOMA ──
R+='\n'+Lm+'\n';
R+='  ∑   SEÇÃO 4 — SOMA DOS JOGOS\n';
R+=Lm+'\n';
R+=`\n  Soma média real:      ${somaMedia.toFixed(1)}\n`;
R+=`  Soma média aleatório: ${bench.somaMedia}\n`;
R+=`  Soma ideal teórica:   ${SOMA_IDEAL.toFixed(1)}  (10 × 40.5)\n`;
R+=`  Desvio:               ${(somaMedia-SOMA_IDEAL).toFixed(1)} (${(Math.abs(somaMedia-SOMA_IDEAL)/SOMA_IDEAL*100).toFixed(2)}%)\n`;
R+=`  Soma mínima:          ${somaMin}\n`;
R+=`  Soma máxima:          ${somaMax}\n\n`;
R+='  DISTRIBUIÇÃO DE SOMAS:\n';
Object.entries(histSoma).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).forEach(([f,c])=>{
    const barra='█'.repeat(Math.round(c/50));
    R+=`    ${String(f).padStart(3)}-${String(parseInt(f)+39).padStart(3)}: ${String(c).padStart(5)}  ${barra}\n`;
});

// ── SEÇÃO 5: PAR/ÍMPAR ──
R+='\n'+Lm+'\n';
R+='  🔢  SEÇÃO 5 — PAR/ÍMPAR\n';
R+=Lm+'\n';
// 1-80: 40 pares + 40 ímpares = 50%/50%
const parReal=(parsTotal.par/totalNums*100);
R+=`\n  Pares:   ${parsTotal.par.toLocaleString('pt-BR')} (${parReal.toFixed(2)}%)\n`;
R+=`  Ímpares: ${parsTotal.impar.toLocaleString('pt-BR')} (${(parsTotal.impar/totalNums*100).toFixed(2)}%)\n`;
R+=`  Esperado: 50% / 50%\n`;
R+=`  Desvio: ${Math.abs(parReal-50).toFixed(3)}%  ${Math.abs(parReal-50)<0.5?'✅ Normal':'⚠️ Atenção'}\n`;

// ── SEÇÃO 6: DEZENAS ──
R+='\n'+Lm+'\n';
R+='  🗂️   SEÇÃO 6 — DISTRIBUIÇÃO POR DEZENA (8 faixas de 10)\n';
R+=Lm+'\n';
const dezEsp=12.5; // 12.5% por dezena
R+=`\n  Esperado: 12.5% por dezena (10 de 80)\n\n`;
for(const[faixa,count]of Object.entries(dezenas)){
    const pct=count/totalNums*100;
    const diff=pct-dezEsp;
    const sg=diff>=0?'+':'';
    const barra='█'.repeat(Math.round(pct));
    const alerta=Math.abs(diff)>1.5?' ⚠️':'';
    R+=`  ${faixa}: ${String(count).padStart(6)} (${pct.toFixed(2)}%) [${sg}${diff.toFixed(2)}%]  ${barra}${alerta}\n`;
}

// ── SEÇÃO 7: ZONAS ──
R+='\n'+Lm+'\n';
R+='  🗺️   SEÇÃO 7 — DISTRIBUIÇÃO POR ZONA (baixa/média/alta)\n';
R+=Lm+'\n';
const znTotal = distribNumerosZona.baixa+distribNumerosZona.media+distribNumerosZona.alta;
// Zonas: baixa=1-27 (27 nums=33.75%), média=28-54 (27 nums=33.75%), alta=55-80 (26 nums=32.5%)
const znEspBaixa=33.75, znEspMedia=33.75, znEspAlta=32.5;
R+=`\n  Zona 01-27 (baixa,  27 nums): ${distribNumerosZona.baixa.toLocaleString()} (${(distribNumerosZona.baixa/znTotal*100).toFixed(2)}%)  [esperado ${znEspBaixa}%]\n`;
R+=`  Zona 28-54 (média,  27 nums): ${distribNumerosZona.media.toLocaleString()} (${(distribNumerosZona.media/znTotal*100).toFixed(2)}%)  [esperado ${znEspMedia}%]\n`;
R+=`  Zona 55-80 (alta,   26 nums): ${distribNumerosZona.alta.toLocaleString()}  (${(distribNumerosZona.alta/znTotal*100).toFixed(2)}%)  [esperado ${znEspAlta}%]\n`;

// ── SEÇÃO 8: SEQUÊNCIAS ──
R+='\n'+Lm+'\n';
R+='  🔗  SEÇÃO 8 — SEQUÊNCIAS CONSECUTIVAS\n';
R+=Lm+'\n';
R+=`\n  GERADOR:\n`;
R+=`    Com 2+ consecutivos: ${seqLongas2} (${(seqLongas2/10000*100).toFixed(2)}%)\n`;
R+=`    Com 3+ consecutivos: ${seqLongas3} (${(seqLongas3/10000*100).toFixed(2)}%)\n`;
R+=`\n  BENCHMARK aleatório puro (200.000 sim.):\n`;
R+=`    Com 2+ consecutivos: ${bench.pct2}%\n`;
R+=`    Com 3+ consecutivos: ${bench.pct3}%\n`;
const diff2=Math.abs(seqLongas2/10000*100-parseFloat(bench.pct2));
const diff3=Math.abs(seqLongas3/10000*100-parseFloat(bench.pct3));
R+=`\n  Diferenças:\n`;
R+=`    2+: ${diff2.toFixed(2)}%  ${diff2<3?'✅ Normal':'⚠️ Desvio relevante'}\n`;
R+=`    3+: ${diff3.toFixed(2)}%  ${diff3<2?'✅ Normal':'⚠️ Desvio relevante'}\n`;

// ── SEÇÃO 9: GAPS ──
R+='\n'+Lm+'\n';
R+='  📐  SEÇÃO 9 — GAPS ENTRE NÚMEROS\n';
R+=Lm+'\n';
R+=`\n  Gap médio real:       ${gapMedia.toFixed(2)}\n`;
R+=`  Gap médio aleatório:  ~${(gapEsp).toFixed(2)}  ((80+1)/(10+1))\n`;
R+=`  Diferença:            ${(gapMedia-gapEsp).toFixed(2)}  ${Math.abs(gapMedia-gapEsp)<1?'✅ Normal':'⚠️ Desvio'}\n`;
const gap1=gapHist[1]||0;
R+=`\n  Gap=1 (consecutivos): ${gap1}x (${(gap1/gapCount*100).toFixed(2)}%)\n`;
R+=`  Esperado aleatório:   ~${(100/gapEsp).toFixed(2)}%\n`;
const gap1Diff=Math.abs(gap1/gapCount*100-100/gapEsp);
R+=`  Diferença: ${gap1Diff.toFixed(2)}%  ${gap1Diff<2?'✅ Normal':'⚠️ Desvio'}\n`;

// ── SEÇÃO 10: O TIME DO CORAÇÃO — ANÁLISE CRÍTICA ──
R+='\n'+L+'\n';
R+='  ⚽  SEÇÃO 10 — TIME DO CORAÇÃO (ANÁLISE CRÍTICA)\n';
R+=L+'\n';
R+=`
  ⚠️  O "TIME DO CORAÇÃO" NÃO ESTÁ NO ARQUIVO ANALISADO.

  O que isso significa:
  ━━━━━━━━━━━━━━━━━━━━
  1. IMPACTO NA PROBABILIDADE:
     Cada jogo tem um time associado. A probabilidade de ganhar
     o prêmio principal (7 acertos + time) inclui o fator 1/80.
     Sem saber qual time foi escolhido, não é possível verificar
     se o sistema distribui os times uniformemente.

  2. RISCO DE CONCENTRAÇÃO:
     Se o sistema escolhe sempre o mesmo time para todos os jogos,
     e aquele time não for sorteado, NENHUM jogo ganha o prêmio
     bônus do time — independente dos acertos numéricos.

  3. O QUE VERIFICAR NO SISTEMA:
     - O sistema distribui os 80 times uniformemente?
     - Ou concentra em 1-2 times "populares"?
     - Se concentra: você perde a diversificação do time.

  4. PROBABILIDADE COM/SEM ACERTO DO TIME:
     Com time correto:    P(7 nums) × (1/80)
     Sem time correto:    P(7 nums) × (79/80) — prêmio menor
`;

// ── SEÇÃO 11: PROBABILIDADES ──
R+='\n'+L+'\n';
R+='  💣  SEÇÃO 11 — PROBABILIDADES REAIS DA TIMEMANIA\n';
R+=L+'\n';
R+=`\n  BASE: C(80,10)=${C80_10.toLocaleString('pt-BR')} apostas | C(80,7)=${C80_7.toLocaleString('pt-BR')} sorteios\n`;
R+=`\n  PROBABILIDADE POR JOGO (sem contar time):\n`;
for(const k of [7,6,5,4,3]){
    const p=probNum(k);
    const em1=Math.round(1/p);
    R+=`    ${k} acertos: ${(p*100).toFixed(7)}%  (1 em ${em1.toLocaleString('pt-BR')})\n`;
}
R+=`\n  COM FATOR DO TIME (×1/80 para prêmio do time):\n`;
for(const k of [7,6]){
    const p=probNum(k)/80;
    const em1=p>0?Math.round(1/p).toLocaleString('pt-BR'):'∞';
    R+=`    ${k} acertos + time correto: ${(p*100).toFixed(9)}%  (1 em ${em1})\n`;
}

R+=`\n  COM 10.000 JOGOS (R$ 30.000,00):\n`;
for(const k of [7,6,5,4,3]){
    const p=probNum(k);
    const p10k=(1-Math.pow(1-p,10000))*100;
    R+=`    P(≥1 jogo com ${k} acertos numéricos): ${p10k.toFixed(4)}%\n`;
}
R+=`\n  CUSTO × RETORNO:\n`;
R+=`    Investimento:   R$ 30.000,00\n`;
R+=`    Retorno esperado: ~R$ 16.200,00 (casa retém ~46%)\n`;
R+=`    Prejuízo esperado: ~R$ 13.800,00\n`;

// ── SEÇÃO 12: RESUMO ──
R+='\n'+L+'\n';
R+='  📋  SEÇÃO 12 — RESUMO COM MÁXIMA HONESTIDADE\n';
R+=L+'\n';
R+=`
  ┌──────────────────────────────────────────────────────────┐
  │                    LADO TÉCNICO                          │
  ├──────────────────────────────────────────────────────────┤
  │ Bugs totais:    ${String(totalBugs===0?'ZERO':totalBugs+' ⚠️').padEnd(42)}│
  │ Duplicatas:     ${String(bugs.duplicatasEntreSi.length===0?'ZERO':bugs.duplicatasEntreSi.length+' ⚠️').padEnd(42)}│
  │ Nºs ausentes:  ${String(nuncaList.length===0?'NENHUM — 80/80 cobertos':'⚠️ '+nuncaList.length+' ausentes').padEnd(43)}│
  │ Anomalias >2.5σ:${String(anomalias.length===0?'NENHUMA':anomalias.length+' números ⚠️').padEnd(42)}│
  │ Soma média:     ${String(somaMedia.toFixed(1)+' vs ideal '+SOMA_IDEAL+' (dev '+Math.abs(somaMedia-SOMA_IDEAL).toFixed(1)+')').padEnd(42)}│
  │ Par/Ímpar:      ${String((parsTotal.par/totalNums*100).toFixed(1)+'% / '+(parsTotal.impar/totalNums*100).toFixed(1)+'%  (esp 50%/50%)').padEnd(42)}│
  │ Coef.variação:  ${String(coefVar.toFixed(3)+'% — '+(coefVar<3?'BOM':coefVar<5?'⚠️ IRREGULAR':'🔴 SEVERO')).padEnd(42)}│
  │ Seq 3+ consec:  ${String((seqLongas3/10000*100).toFixed(2)+'% vs '+bench.pct3+'% puro aleatório').padEnd(42)}│
  │ Time do coração:${String('⚠️ NÃO ANALISÁVEL — ausente no arquivo').padEnd(42)}│
  └──────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────┐
  │                    LADO DAS APOSTAS                      │
  ├──────────────────────────────────────────────────────────┤
  │ Espaço numérico: C(80,10)=${String(C80_10.toLocaleString('pt-BR')+' comb.').padEnd(28)}│
  │ 10.000 jogos:   ${String((10000/C80_10*100).toFixed(6)+'% do espaço coberto').padEnd(42)}│
  │ Prob 7 acertos: ${String((probNum(7)*100).toFixed(7)+'% por jogo').padEnd(42)}│
  │ Custo:          ${String('R$ 30.000,00').padEnd(42)}│
  │ EV:             ${String('NEGATIVO — ~R$ 13.800 de prejuízo esperado').padEnd(42)}│
  │ Prediz sorteio: ${String('NÃO. MATEMATICAMENTE IMPOSSÍVEL.').padEnd(42)}│
  └──────────────────────────────────────────────────────────┘
`+L+'\n';

console.log(R);
fs.writeFileSync(SAIDA_TXT,  R,'utf8');
fs.writeFileSync(SAIDA_JSON,JSON.stringify({
    timestamp:new Date().toISOString(),
    totalJogos:jogos.length,
    numsPorJogo:parseInt(numDom),
    contadorTamanhos:contadorTams,
    timeDoCoracao:'AUSENTE_NO_ARQUIVO',
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
        seqLongas2,seqLongas3,
        gapMedia:parseFloat(gapMedia.toFixed(3)),
        gapEsperado:parseFloat(gapEsp.toFixed(3)),
        benchmark:bench,
        coefVariacao:parseFloat(coefVar.toFixed(4)),
        topFrequentes:freqOrd.slice(0,15),
        topRaros:[...freqOrd].reverse().slice(0,15)
    }
},null,2),'utf8');

console.log(`\n💾  ${SAIDA_TXT}`);
console.log(`💾  ${SAIDA_JSON}\n`);

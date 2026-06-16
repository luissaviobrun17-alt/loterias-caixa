/**
 * ═══════════════════════════════════════════════════════════════
 *  ANALISADOR EXTREMAMENTE HONESTO — 10.000 JOGOS DIA DE SORTE
 *  Range numérico: 1-31 | 7 números por jogo
 *  + "Mês da Sorte" (1-12, NÃO presente no arquivo — investigado)
 *
 *  REGRAS REAIS DO DIA DE SORTE:
 *  - Jogador escolhe 7 números de 1-31
 *  - Jogador escolhe 1 "Mês da Sorte" (Janeiro a Dezembro)
 *  - Caixa sorteia 7 números + 1 mês
 *  - Prêmios: 7, 6, 5, 4 acertos numéricos + bônus do mês
 *  - Preço: R$ 3,00
 *  - Espaço amostral: C(31,7) × 12 = 2.629.575 × 12 = 31.554.900
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const ARQUIVO   = "C:\\Users\\luiss\\OneDrive\\Documents\\OneDrive\\Desktop\\LOTERIAS JOGOS SALVOS L99\\DIA DE SORTE\\Dia de Sorte_16-06-2026_16h28.txt";
const SAIDA_TXT  = path.join(__dirname, 'analise_diadesorte_relatorio.txt');
const SAIDA_JSON = path.join(__dirname, 'analise_diadesorte_resultado.json');

const DS_MIN   = 1;
const DS_MAX   = 31;
const DS_NUMS  = 7;   // jogador escolhe 7
const DS_MESES = 12;  // meses possíveis (Janeiro=1 ... Dezembro=12)

function nCr(n,k){
    if(k<0||k>n)return 0;if(k===0||k===n)return 1;if(k>n/2)k=n-k;
    let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r);
}

const C31_7   = nCr(31,7);   // 2.629.575 — espaço numérico
const C31_7x12= C31_7*12;    // 31.554.900 — espaço total com mês

// ── LEITURA ──────────────────────────────────────────────────────
console.log('\n'+'═'.repeat(65));
console.log('  🍀  ANALISADOR EXTREMAMENTE HONESTO — DIA DE SORTE 10.000 JOGOS');
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
console.log(`📏  Tamanhos:`);
Object.entries(contadorTams).sort().forEach(([t,c])=>
    console.log(`    ${t} números/jogo: ${c} (${(c/jogos.length*100).toFixed(2)}%)`));

// ── ANÁLISE ───────────────────────────────────────────────────────
const bugs = {
    tamanhoErrado:[], duplicataInterna:[],
    foraDoRange:[], naoOrdenado:[], duplicatasEntreSi:[]
};
const vistos = new Map();
const freq   = {};
for(let i=DS_MIN;i<=DS_MAX;i++) freq[i]=0;

const somaTodos = [];
let   parsTotal = {par:0,impar:0};
let   seqLongas2=0, seqLongas3=0, seqLongas4=0;

// Faixas: 1-10, 11-20, 21-31
const faixas = {'01-10':0,'11-20':0,'21-31':0};

const gapHist = {};
const nunca   = new Set();
for(let i=DS_MIN;i<=DS_MAX;i++) nunca.add(i);

let totalNums = 0;

// Análise de cobertura: frequência de cada número
// Com 31 números e 7 por jogo: cada número esperado em 7/31 × 10000 = 2258 jogos

for(const jogo of jogos){
    const {idx,nums} = jogo;
    totalNums += nums.length;

    // 1. Tamanho
    if(nums.length !== DS_NUMS)
        bugs.tamanhoErrado.push({jogoNum:idx,recebido:nums.length,numeros:nums});

    // 2. Dup interna
    const setN=new Set(nums);
    if(setN.size!==nums.length)
        bugs.duplicataInterna.push({jogoNum:idx,numeros:nums,
            duplicados:nums.filter((n,i)=>nums.indexOf(n)!==i)});

    // 3. Range 1-31
    const fora=nums.filter(n=>n<DS_MIN||n>DS_MAX);
    if(fora.length>0) bugs.foraDoRange.push({jogoNum:idx,numeros:nums,invalidos:fora});

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

    // 8. Par/ímpar
    // Em 1-31: 15 pares (2,4,...,30) e 16 ímpares (1,3,...,31)
    for(const n of nums) n%2===0?parsTotal.par++:parsTotal.impar++;

    // 9. Faixas
    for(const n of nums){
        if(n<=10)      faixas['01-10']++;
        else if(n<=20) faixas['11-20']++;
        else           faixas['21-31']++;
    }

    // 10. Sequências
    let ms=1,c=1;
    for(let i=1;i<nums.length;i++){
        if(nums[i]===nums[i-1]+1){c++;ms=Math.max(ms,c);}else c=1;
    }
    if(ms>=2) seqLongas2++;
    if(ms>=3) seqLongas3++;
    if(ms>=4) seqLongas4++;

    // 11. Gaps
    for(let i=1;i<nums.length;i++){
        const g=nums[i]-nums[i-1];
        gapHist[g]=(gapHist[g]||0)+1;
    }
}

// ── CÁLCULOS ──────────────────────────────────────────────────────
const totalBugs  = Object.values(bugs).reduce((s,a)=>s+a.length,0);
const somaMedia  = somaTodos.reduce((a,b)=>a+b,0)/somaTodos.length;
const somaMin    = Math.min(...somaTodos);
const somaMax    = Math.max(...somaTodos);
// Soma ideal: 7 × (1+31)/2 = 7 × 16 = 112
const SOMA_IDEAL = DS_NUMS*(DS_MIN+DS_MAX)/2;

const freqOrd = Object.entries(freq)
    .map(([n,c])=>({num:parseInt(n),count:c,pct:(c/totalNums*100).toFixed(4)}))
    .sort((a,b)=>b.count-a.count);

const freqEsp = totalNums/31; // = 10000*7/31 = 2258.06
const desvPad = Math.sqrt(freqOrd.reduce((acc,f)=>acc+(f.count-freqEsp)**2,0)/31);
const coefVar = (desvPad/freqEsp*100);
const anomalias = freqOrd.filter(f=>Math.abs(f.count-freqEsp)>2.5*desvPad);

// Gaps
const gapTotal = Object.entries(gapHist).reduce((s,[g,c])=>s+parseInt(g)*c,0);
const gapCount = Object.entries(gapHist).reduce((s,[,c])=>s+c,0);
const gapMedia = gapTotal/gapCount;
const gapEsp   = (DS_MAX+1)/(DS_NUMS+1); // 32/8 = 4.0

// Histograma somas
const histSoma={};
somaTodos.forEach(s=>{const f=Math.floor(s/15)*15;histSoma[f]=(histSoma[f]||0)+1;});

// Pares mais frequentes
const pares={};
for(const jogo of jogos){
    const nums=jogo.nums;
    for(let i=0;i<nums.length;i++)
        for(let j=i+1;j<nums.length;j++){
            const pk=`${nums[i]}-${nums[j]}`;
            pares[pk]=(pares[pk]||0)+1;
        }
}
const topPares = Object.entries(pares)
    .map(([k,c])=>({par:k,count:c}))
    .sort((a,b)=>b.count-a.count).slice(0,15);
const menosPares = Object.entries(pares)
    .map(([k,c])=>({par:k,count:c}))
    .sort((a,b)=>a.count-b.count).slice(0,10);

// Pares esperados: C(31,2)=465 pares possíveis
// Freq esperada = 10000 * C(7,2) / C(31,2) = 10000*21/465 = 451.6
const parEspFreq = 10000*nCr(7,2)/nCr(31,2);
const totalParesReg = Object.keys(pares).length;

// ── BENCHMARK ─────────────────────────────────────────────────────
console.log('⏳  Benchmark (500.000 jogos aleatórios puros de 7 em 31)...');
let b2=0,b3=0,b4=0,bSoma=[];
for(let t=0;t<500000;t++){
    let pool=[];for(let i=DS_MIN;i<=DS_MAX;i++)pool.push(i);
    for(let i=pool.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];
    }
    const nums=pool.slice(0,DS_NUMS).sort((a,b)=>a-b);
    let ms=1,c=1;
    for(let i=1;i<nums.length;i++){if(nums[i]===nums[i-1]+1){c++;ms=Math.max(ms,c);}else c=1;}
    if(ms>=2)b2++;if(ms>=3)b3++;if(ms>=4)b4++;
    bSoma.push(nums.reduce((a,b)=>a+b,0));
}
const bench={
    pct2:(b2/500000*100).toFixed(2),
    pct3:(b3/500000*100).toFixed(2),
    pct4:(b4/500000*100).toFixed(2),
    somaMedia:(bSoma.reduce((a,b)=>a+b,0)/bSoma.length).toFixed(1)
};

// ── PROBABILIDADES ────────────────────────────────────────────────
// P(k acertos numéricos) = C(7,k)*C(24,7-k)/C(31,7)
function probNum(k){
    if(k<0||k>Math.min(DS_NUMS,7)) return 0;
    return nCr(7,k)*nCr(24,7-k)/C31_7;
}
const probMes = 1/DS_MESES; // 1/12

// ── RELATÓRIO ─────────────────────────────────────────────────────
const L ='═'.repeat(65);
const Lm='─'.repeat(65);
let R='';

R+='\n'+L+'\n';
R+='  🍀  RELATÓRIO EXTREMAMENTE HONESTO — DIA DE SORTE 10.000 JOGOS\n';
R+='  🗓️  Gerado: 16/06/2026 às 16:28\n';
R+='  ⚠️  ANÁLISE SEM FILTROS — DADOS PUROS\n';
R+=L+'\n';

// ── SEÇÃO 0: ESTRUTURA ──
R+='\n'+Lm+'\n';
R+='  📋  SEÇÃO 0 — REGRAS DO JOGO E ESTRUTURA DO ARQUIVO\n';
R+=Lm+'\n';
R+=`
  COMO O DIA DE SORTE FUNCIONA (completo):
    Jogador escolhe: 7 números de 1-31
                   + 1 "Mês da Sorte" (Janeiro a Dezembro)
    Sorteio:         7 números de 1-31
                   + 1 mês sorteado
    Prêmios:         7, 6, 5, 4 acertos + bônus do mês
    Preço:           R$ 3,00

  ESPAÇO AMOSTRAL:
    Numérico:        C(31,7) = ${C31_7.toLocaleString('pt-BR')} combinações
    Com mês:         ${C31_7.toLocaleString('pt-BR')} × 12 = ${C31_7x12.toLocaleString('pt-BR')} combinações
    10.000 apostas:  ${(10000/C31_7*100).toFixed(4)}% do espaço numérico
                     ${(10000/C31_7x12*100).toFixed(5)}% do espaço total (com mês)
    Custo total:     R$ 30.000,00

  ARQUIVO DETECTADO:
`;
Object.entries(contadorTams).sort().forEach(([t,c])=>
    R+=`    ${t} números/jogo: ${c} (${(c/jogos.length*100).toFixed(2)}%)\n`);
R+=`
  ⚠️  AUSENTE NO ARQUIVO: "Mês da Sorte"
    Igual à Timemania: o mês não é salvo no TXT.
    Impacto: não é possível auditar a distribuição dos 12 meses.
    Risco: se todos os 10.000 jogos usam o mesmo mês e esse
    mês não for sorteado → 100% dos jogos perdem o bônus do mês.
`;

// ── SEÇÃO 1: INTEGRIDADE ──
R+='\n'+Lm+'\n';
R+='  🔍  SEÇÃO 1 — INTEGRIDADE\n';
R+=Lm+'\n';
const checks=[
    [`Tamanho incorreto (≠${DS_NUMS})`, bugs.tamanhoErrado.length],
    ['Duplicata interna',               bugs.duplicataInterna.length],
    ['Fora do range (1-31)',            bugs.foraDoRange.length],
    ['Não ordenados',                  bugs.naoOrdenado.length],
    ['Jogos idênticos entre si',       bugs.duplicatasEntreSi.length],
];
for(const[nome,qtd]of checks)
    R+=`  ${qtd===0?'✅':'🔴'}  ${nome.padEnd(32)}: ${qtd===0?'NENHUM':'⚠️  '+qtd+' encontrado(s)'}\n`;
R+='\n';
if(totalBugs===0){
    R+=`  🏆  SISTEMA ÍNTEGRO — ZERO BUGS\n`;
}else{
    R+=`  🔴  ${totalBugs} PROBLEMA(S) ENCONTRADO(S)\n`;
    if(bugs.duplicatasEntreSi.length>0){
        // Birthday problem C(31,7)=2.629.575
        const pBD=(1-Math.exp(-(10000**2)/(2*C31_7)))*100;
        R+=`\n  DUPLICATAS (${bugs.duplicatasEntreSi.length}):\n`;
        bugs.duplicatasEntreSi.slice(0,15).forEach(b=>
            R+=`    Jogo ${String(b.jogoNum).padStart(5)} = Jogo ${String(b.primeiroJogo).padStart(5)}: [${b.numeros.join('-')}]\n`);
        R+=`\n  Birthday problem com C(31,7)=${C31_7.toLocaleString('pt-BR')}:\n`;
        R+=`    P(esperada de ter ≥1 dup): ~${pBD.toFixed(3)}%\n`;
        const taxaReal=bugs.duplicatasEntreSi.length/10000*100;
        R+=`    Taxa real de duplicatas: ${taxaReal.toFixed(3)}%\n`;
        if(taxaReal>pBD*3){
            R+=`    🔴 ALERTA: Taxa ${taxaReal.toFixed(2)}% é ${(taxaReal/pBD).toFixed(1)}x acima do esperado!\n`;
            R+=`       Isso indica VIÉS no gerador — jogos se repetem mais que o aleatório.\n`;
        }else if(taxaReal > pBD * 1.5){
            R+=`    ⚠️  Taxa levemente acima do esperado matemático (${pBD.toFixed(2)}%).\n`;
        }else{
            R+=`    ✅  Taxa dentro do intervalo matemático esperado.\n`;
        }
    }
    if(bugs.tamanhoErrado.length>0){
        R+=`\n  TAMANHO ERRADO (${bugs.tamanhoErrado.length}):\n`;
        bugs.tamanhoErrado.slice(0,5).forEach(b=>R+=`    Jogo ${b.jogoNum}: ${b.recebido} nºs\n`);
    }
    if(bugs.foraDoRange.length>0){
        R+=`\n  FORA DO RANGE 1-31 (${bugs.foraDoRange.length}):\n`;
        bugs.foraDoRange.slice(0,5).forEach(b=>R+=`    Jogo ${b.jogoNum}: inválidos=${b.invalidos.join(',')}\n`);
    }
}

// ── SEÇÃO 2: NÚMEROS AUSENTES ──
R+='\n'+Lm+'\n';
R+='  🚫  SEÇÃO 2 — NÚMEROS QUE NUNCA APARECERAM\n';
R+=Lm+'\n';
const nuncaList=[...nunca].sort((a,b)=>a-b);
if(nuncaList.length===0){
    R+=`\n  ✅  Todos os 31 números (1-31) aparecem pelo menos 1 vez.\n`;
    const pN=(Math.pow(1-7/31,10000)*100).toFixed(10);
    R+=`  P(número nunca aparecer): ${pN}% (astronomicamente improvável)\n`;
}else{
    R+=`\n  🔴  ${nuncaList.length} número(s) NUNCA apareceram: [${nuncaList.join(', ')}]\n`;
    const pN=(Math.pow(1-7/31,10000)*100).toFixed(10);
    R+=`  P(esperada) de nunca aparecer: ${pN}% — praticamente impossível\n`;
    R+=`  → ${nuncaList.length} ausentes indica VIÉS SEVERO no gerador.\n`;
}

// ── SEÇÃO 3: FREQUÊNCIAS ──
R+='\n'+Lm+'\n';
R+='  📈  SEÇÃO 3 — FREQUÊNCIA DOS 31 NÚMEROS\n';
R+=Lm+'\n';
R+=`\n  Freq esperada: ~${freqEsp.toFixed(0)}x  (${(100/31).toFixed(2)}% cada)\n`;
R+=`  Desvio padrão: ${desvPad.toFixed(1)}\n`;
R+=`  Coef. variação: ${coefVar.toFixed(3)}%\n`;
R+=`  Interpretação: ${coefVar<3?'✅ BOM (<3%)':coefVar<5?'⚠️ IRREGULAR (3-5%)':'🔴 VIÉS SEVERO (>5%)'}\n`;

if(anomalias.length>0){
    R+=`\n  ⚠️  ANOMALIAS (>2.5σ): ${anomalias.length} números:\n`;
    anomalias.forEach(f=>{
        const diff=f.count-freqEsp;
        const sg=diff>=0?'+':'';
        const sigma=(diff/desvPad).toFixed(2);
        R+=`    Nº ${String(f.num).padStart(2)}: ${String(f.count).padStart(5)}x  [${sg}${diff.toFixed(0)} = ${sigma}σ]\n`;
    });
}else{
    R+=`\n  ✅  Nenhum número fora de 2.5σ\n`;
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

R+='\n  📊  TODOS OS 31 NÚMEROS:\n';
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
R+=`  Soma ideal teórica:   ${SOMA_IDEAL.toFixed(1)}  (7 × 16.0 = 7 × (1+31)/2)\n`;
R+=`  Desvio:               ${(somaMedia-SOMA_IDEAL).toFixed(1)} (${(Math.abs(somaMedia-SOMA_IDEAL)/SOMA_IDEAL*100).toFixed(2)}%)\n`;
R+=`  Soma mínima:          ${somaMin}\n`;
R+=`  Soma máxima:          ${somaMax}\n`;
R+=`  (Amplitude possível: mín=${1+2+3+4+5+6+7}, máx=${25+26+27+28+29+30+31})\n\n`;
R+='  DISTRIBUIÇÃO DE SOMAS:\n';
Object.entries(histSoma).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).forEach(([f,c])=>{
    const barra='█'.repeat(Math.round(c/50));
    R+=`    ${String(f).padStart(3)}-${String(parseInt(f)+14).padStart(3)}: ${String(c).padStart(5)}  ${barra}\n`;
});

// ── SEÇÃO 5: PAR/ÍMPAR ──
R+='\n'+Lm+'\n';
R+='  🔢  SEÇÃO 5 — PAR/ÍMPAR\n';
R+=Lm+'\n';
// 1-31: 15 pares (2,4,...,30) e 16 ímpares (1,3,...,31)
// Esperado: 7 × 15/31 pares = 3.387 e 7 × 16/31 ímpares = 3.613 por jogo
const parEspGeral = 15/31*100;
const impEspGeral = 16/31*100;
const parReal=(parsTotal.par/totalNums*100);
R+=`\n  Pares:   ${parsTotal.par.toLocaleString('pt-BR')} (${parReal.toFixed(3)}%)\n`;
R+=`  Ímpares: ${parsTotal.impar.toLocaleString('pt-BR')} (${(parsTotal.impar/totalNums*100).toFixed(3)}%)\n`;
R+=`  Esperado teórico: ${parEspGeral.toFixed(2)}% pares / ${impEspGeral.toFixed(2)}% ímpares\n`;
R+=`  (1-31 tem 15 pares e 16 ímpares — não é 50%/50%!)\n`;
const desvPar=Math.abs(parReal-parEspGeral);
R+=`  Desvio: ${desvPar.toFixed(3)}%  ${desvPar<0.5?'✅ Normal':'⚠️ Atenção'}\n`;

// ── SEÇÃO 6: FAIXAS ──
R+='\n'+Lm+'\n';
R+='  🗂️   SEÇÃO 6 — DISTRIBUIÇÃO POR FAIXA\n';
R+=Lm+'\n';
// 1-10 (10 nums), 11-20 (10 nums), 21-31 (11 nums)
const fEsp1_10  = 10/31*100; // 32.26%
const fEsp11_20 = 10/31*100; // 32.26%
const fEsp21_31 = 11/31*100; // 35.48%
const fTotal = Object.values(faixas).reduce((a,b)=>a+b,0);
R+=`\n  Esperado teórico (proporcional ao range 1-31):\n`;
R+=`    01-10 (10 nums): ${fEsp1_10.toFixed(2)}%\n`;
R+=`    11-20 (10 nums): ${fEsp11_20.toFixed(2)}%\n`;
R+=`    21-31 (11 nums): ${fEsp21_31.toFixed(2)}%\n\n`;
R+=`  REAL:\n`;
const faixasMeses = [['01-10',fEsp1_10],['11-20',fEsp11_20],['21-31',fEsp21_31]];
faixasMeses.forEach(([faixa,esp])=>{
    const count=faixas[faixa];
    const pct=count/fTotal*100;
    const diff=pct-esp;
    const sg=diff>=0?'+':'';
    const barra='█'.repeat(Math.round(pct/2));
    const alerta=Math.abs(diff)>1.5?' ⚠️':'';
    R+=`    ${faixa}: ${String(count).padStart(6)} (${pct.toFixed(2)}%) [${sg}${diff.toFixed(2)}%]  ${barra}${alerta}\n`;
});

// ── SEÇÃO 7: SEQUÊNCIAS ──
R+='\n'+Lm+'\n';
R+='  🔗  SEÇÃO 7 — SEQUÊNCIAS CONSECUTIVAS\n';
R+=Lm+'\n';
R+=`\n  GERADOR (10.000 jogos):\n`;
R+=`    Com 2+ consecutivos: ${seqLongas2} (${(seqLongas2/10000*100).toFixed(2)}%)\n`;
R+=`    Com 3+ consecutivos: ${seqLongas3} (${(seqLongas3/10000*100).toFixed(2)}%)\n`;
R+=`    Com 4+ consecutivos: ${seqLongas4} (${(seqLongas4/10000*100).toFixed(2)}%)\n`;
R+=`\n  BENCHMARK aleatório puro (500.000 sim.):\n`;
R+=`    Com 2+ consecutivos: ${bench.pct2}%\n`;
R+=`    Com 3+ consecutivos: ${bench.pct3}%\n`;
R+=`    Com 4+ consecutivos: ${bench.pct4}%\n`;
const d2=Math.abs(seqLongas2/10000*100-parseFloat(bench.pct2));
const d3=Math.abs(seqLongas3/10000*100-parseFloat(bench.pct3));
const d4=Math.abs(seqLongas4/10000*100-parseFloat(bench.pct4));
R+=`\n  DIFERENÇAS (gerador vs aleatório puro):\n`;
R+=`    2+: ${d2.toFixed(2)}%  ${d2<3?'✅ Normal':'⚠️ Desvio relevante'}\n`;
R+=`    3+: ${d3.toFixed(2)}%  ${d3<2?'✅ Normal':'⚠️ Desvio relevante'}\n`;
R+=`    4+: ${d4.toFixed(2)}%  ${d4<1?'✅ Normal':'⚠️ Desvio relevante'}\n`;

// ── SEÇÃO 8: GAPS ──
R+='\n'+Lm+'\n';
R+='  📐  SEÇÃO 8 — GAPS ENTRE NÚMEROS\n';
R+=Lm+'\n';
R+=`\n  Gap médio real:       ${gapMedia.toFixed(2)}\n`;
R+=`  Gap esperado teórico: ${gapEsp.toFixed(2)}  ((31+1)/(7+1))\n`;
R+=`  Diferença:            ${Math.abs(gapMedia-gapEsp).toFixed(2)}  ${Math.abs(gapMedia-gapEsp)<0.5?'✅ Normal':'⚠️ Desvio'}\n`;
const gap1=gapHist[1]||0;
R+=`\n  Gap=1 (consecutivos): ${gap1}x (${(gap1/gapCount*100).toFixed(2)}%)\n`;
R+=`  Esperado aleatório:   ~${(100/gapEsp).toFixed(2)}%\n`;
R+=`\n  DISTRIBUIÇÃO DE GAPS (top 15):\n`;
Object.entries(gapHist).map(([g,c])=>({g:parseInt(g),c})).sort((a,b)=>b.c-a.c).slice(0,15).forEach(({g,c})=>{
    const barra='█'.repeat(Math.round(c/400));
    R+=`    Gap ${String(g).padStart(2)}: ${String(c).padStart(6)}x  ${barra}\n`;
});

// ── SEÇÃO 9: PARES ──
R+='\n'+Lm+'\n';
R+='  💑  SEÇÃO 9 — PARES MAIS E MENOS FREQUENTES\n';
R+=Lm+'\n';
R+=`\n  C(31,2) = ${nCr(31,2)} pares possíveis\n`;
R+=`  Freq esperada por par: ~${parEspFreq.toFixed(2)}x\n`;
R+=`  Pares registrados: ${totalParesReg} de ${nCr(31,2)} (${(totalParesReg/nCr(31,2)*100).toFixed(1)}%)\n\n`;
R+=`  TOP 15 PARES MAIS FREQUENTES:\n`;
topPares.forEach((p,i)=>{
    const diff=p.count-parEspFreq;
    const sigma=(diff/Math.sqrt(parEspFreq)).toFixed(1);
    R+=`    ${String(i+1).padStart(2)}. ${p.par.padEnd(6)}: ${String(p.count).padStart(5)}x  [+${diff.toFixed(0)} / ${sigma}σ]\n`;
});
R+=`\n  TOP 10 PARES MENOS FREQUENTES:\n`;
menosPares.forEach((p,i)=>{
    const diff=p.count-parEspFreq;
    const sigma=(diff/Math.sqrt(parEspFreq)).toFixed(1);
    R+=`    ${String(i+1).padStart(2)}. ${p.par.padEnd(6)}: ${String(p.count).padStart(5)}x  [${diff.toFixed(0)} / ${sigma}σ]\n`;
});

// ── SEÇÃO 10: MÊS DA SORTE ──
R+='\n'+L+'\n';
R+='  📅  SEÇÃO 10 — MÊS DA SORTE (ANÁLISE CRÍTICA)\n';
R+=L+'\n';
const meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
             'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
R+=`
  ⚠️  O "MÊS DA SORTE" NÃO ESTÁ NO ARQUIVO — MESMO PROBLEMA DA TIMEMANIA.

  IMPACTO REAL:
  ━━━━━━━━━━━━
  O Dia de Sorte tem apenas 12 meses possíveis.
  A probabilidade de acertar o mês por sorte: 1/12 = 8.33%
  Com 10.000 jogos e 1 sorteio, qual a chance do mês correto?
  → Se o sistema usa 1 mês fixo: 8.33% de chance no mês, 91.67% de falhar.
  → Se o sistema distribui entre 12 meses: melhor diversificação.

  SEM O MÊS NO ARQUIVO: IMPOSSÍVEL VERIFICAR.

  RISCO CONCRETO:
  Se todos os 10.000 jogos têm o mesmo mês escolhido,
  e o sorteio cair num mês diferente:
  → 10.000 jogos perdem o bônus do mês (100%).
  → Perda de prêmios nas faixas que dependem do mês.

  OS 12 MESES E SUA IMPLICAÇÃO NA PROBABILIDADE:
  P(7 acertos + mês) = P(7 acertos) × (1/12)
    = ${(probNum(7)*100).toFixed(7)}% × 8.33% = ${(probNum(7)/12*100).toFixed(9)}%
    = 1 em ${Math.round(C31_7*12).toLocaleString('pt-BR')} combinações

  RECOMENDAÇÃO TÉCNICA:
  O sistema deveria registrar o mês escolhido no arquivo de saída.
  Sem isso, não há auditoria possível da escolha do mês.
`;

// ── SEÇÃO 11: PROBABILIDADES ──
R+='\n'+L+'\n';
R+='  💣  SEÇÃO 11 — PROBABILIDADES REAIS DO DIA DE SORTE\n';
R+=L+'\n';
R+=`\n  BASE: C(31,7)=${C31_7.toLocaleString('pt-BR')} | Com mês: ${C31_7x12.toLocaleString('pt-BR')}\n\n`;
R+=`  PROBABILIDADE POR JOGO (só números, sem mês):\n`;
for(const k of [7,6,5,4]){
    const p=probNum(k);
    const em1=Math.round(1/p);
    R+=`    ${k} acertos: ${(p*100).toFixed(6)}%  (1 em ${em1.toLocaleString('pt-BR')})\n`;
}
R+=`\n  COM MÊS CORRETO (÷12):\n`;
for(const k of [7,6]){
    const p=probNum(k)/12;
    R+=`    ${k} acertos + mês: ${(p*100).toFixed(8)}%  (1 em ${Math.round(1/p).toLocaleString('pt-BR')})\n`;
}
R+=`\n  COM 10.000 JOGOS (R$ 30.000,00):\n`;
for(const k of [7,6,5,4]){
    const p=probNum(k);
    const p10k=(1-Math.pow(1-p,10000))*100;
    R+=`    P(≥1 jogo com ${k} acertos): ${p10k.toFixed(4)}%\n`;
}
R+=`\n  BIRTHDAY PROBLEM — RISCO DE DUPLICATAS:\n`;
const pBD=(1-Math.exp(-(10000**2)/(2*C31_7)))*100;
R+=`    C(31,7)=${C31_7.toLocaleString('pt-BR')} — espaço PEQUENO para 10.000 jogos!\n`;
R+=`    P(matemática de ≥1 duplicata): ~${pBD.toFixed(2)}%\n`;
R+=`    → ${pBD>80?'🔴 ALTAMENTE PROVÁVEL ter duplicatas':'⚠️ Risco real de duplicatas'}\n`;
R+=`    → Verificar a seção 1 para contagem real de duplicatas\n`;
R+=`\n  CUSTO × RETORNO:\n`;
R+=`    Investimento: R$ 30.000,00\n`;
R+=`    EV matemático: ~R$ 16.200,00  (casa retém ~46%)\n`;
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
  │ Duplicatas:     ${String(bugs.duplicatasEntreSi.length===0?'ZERO':bugs.duplicatasEntreSi.length+' JOGOS IGUAIS ⚠️').padEnd(42)}│
  │ Nºs ausentes:  ${String(nuncaList.length===0?'NENHUM — 31/31 cobertos':'⚠️ '+nuncaList.length+' ausentes: '+nuncaList.join(',')).padEnd(43)}│
  │ Anomalias >2.5σ:${String(anomalias.length===0?'NENHUMA':anomalias.length+' número(s) ⚠️').padEnd(42)}│
  │ Soma média:     ${String(somaMedia.toFixed(1)+' vs ideal '+SOMA_IDEAL+' (dev '+Math.abs(somaMedia-SOMA_IDEAL).toFixed(1)+')').padEnd(42)}│
  │ Par/Ímpar:      ${String((parsTotal.par/totalNums*100).toFixed(1)+'% / '+(parsTotal.impar/totalNums*100).toFixed(1)+'% (esp 48.4%/51.6%)').padEnd(42)}│
  │ Coef.variação:  ${String(coefVar.toFixed(3)+'% — '+(coefVar<3?'BOM':coefVar<5?'⚠️ IRREGULAR':'🔴 SEVERO')).padEnd(42)}│
  │ Seq 3+ consec:  ${String((seqLongas3/10000*100).toFixed(2)+'% vs '+bench.pct3+'% puro aleat.').padEnd(42)}│
  │ Mês da Sorte:   ${String('⚠️ NÃO ANALISÁVEL — ausente no arquivo').padEnd(42)}│
  │ Risco dup (mat):${String('~'+pBD.toFixed(1)+'% prob matemática de duplicatas').padEnd(42)}│
  └──────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────┐
  │                    LADO DAS APOSTAS                      │
  ├──────────────────────────────────────────────────────────┤
  │ Espaço numérico: C(31,7)=${String(C31_7.toLocaleString('pt-BR')+' combinações').padEnd(31)}│
  │ Espaço c/ mês:   ${String(C31_7x12.toLocaleString('pt-BR')+' combinações').padEnd(43)}│
  │ 10.000 jogos:    ${String((10000/C31_7*100).toFixed(4)+'% do espaço numérico').padEnd(42)}│
  │ Prob 7 acertos:  ${String((probNum(7)*100).toFixed(6)+'% por jogo').padEnd(42)}│
  │ Custo:           ${String('R$ 30.000,00').padEnd(42)}│
  │ EV:              ${String('NEGATIVO — ~R$ 13.800 de prejuízo').padEnd(42)}│
  │ Mês auditável:   ${String('NÃO — não registrado no arquivo').padEnd(42)}│
  │ Prediz sorteio:  ${String('NÃO. MATEMATICAMENTE IMPOSSÍVEL.').padEnd(42)}│
  └──────────────────────────────────────────────────────────┘
`+L+'\n';

console.log(R);
fs.writeFileSync(SAIDA_TXT,  R,'utf8');
fs.writeFileSync(SAIDA_JSON,JSON.stringify({
    timestamp:new Date().toISOString(),
    totalJogos:jogos.length,
    numsPorJogo:DS_NUMS,
    mesDoSorte:'AUSENTE_NO_ARQUIVO',
    espacoAmostralNumerico:C31_7,
    espacoAmostralComMes:C31_7x12,
    coberturaNumerica:parseFloat((10000/C31_7*100).toFixed(6)),
    probabilidadeDuplicatas:parseFloat(((1-Math.exp(-(10000**2)/(2*C31_7)))*100).toFixed(3)),
    bugs:{total:totalBugs,
        tamanhoErrado:bugs.tamanhoErrado.length,
        duplicataInterna:bugs.duplicataInterna.length,
        foraDoRange:bugs.foraDoRange.length,
        naoOrdenado:bugs.naoOrdenado.length,
        duplicatas:bugs.duplicatasEntreSi.length,
        listaDuplicatas:bugs.duplicatasEntreSi.slice(0,50)
    },
    numerosAusentes:nuncaList,
    anomalias,
    estatisticas:{
        somaMedia:parseFloat(somaMedia.toFixed(2)),
        somaIdeal:SOMA_IDEAL,somaMin,somaMax,
        parImpar:parsTotal,faixas,
        seqLongas2,seqLongas3,seqLongas4,
        gapMedia:parseFloat(gapMedia.toFixed(3)),
        gapEsperado:parseFloat(gapEsp.toFixed(3)),
        benchmark:bench,
        coefVariacao:parseFloat(coefVar.toFixed(4)),
        topFrequentes:freqOrd.slice(0,15),
        topRaros:[...freqOrd].reverse().slice(0,15),
        topPares,menosPares
    }
},null,2),'utf8');

console.log(`\n💾  ${SAIDA_TXT}`);
console.log(`💾  ${SAIDA_JSON}\n`);

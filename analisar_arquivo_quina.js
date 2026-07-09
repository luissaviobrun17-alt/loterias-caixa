/**
 * ═══════════════════════════════════════════════════════════════
 *  ANALISADOR EXTREMAMENTE HONESTO — 10.000 JOGOS QUINA
 *  Range: 1-80 | 5 números por jogo | Preço: R$ 2,00
 *  Compromisso: sem eufemismos, sem omissões, só verdade.
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const ARQUIVO   = "C:\\Users\\luiss\\OneDrive\\Documents\\OneDrive\\Desktop\\LOTERIAS JOGOS SALVOS L99\\QUINA\\Quina_16-06-2026_16h03.txt";
const SAIDA_TXT  = path.join(__dirname, 'analise_quina_relatorio.txt');
const SAIDA_JSON = path.join(__dirname, 'analise_quina_resultado.json');

const Q_MIN  = 1;
const Q_MAX  = 80;
const Q_NUMS = 5;

function nCr(n,k){
    if(k<0||k>n)return 0;if(k===0||k===n)return 1;if(k>n/2)k=n-k;
    let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r);
}
const TOTAL_POSSIVEIS = nCr(80,5); // C(80,5) = 24.040.160

// ── LEITURA ──────────────────────────────────────────────────────
console.log('\n'+'═'.repeat(65));
console.log('  🟡  ANALISADOR EXTREMAMENTE HONESTO — QUINA 10.000 JOGOS');
console.log('═'.repeat(65));

const conteudo = fs.readFileSync(ARQUIVO,'utf8');
console.log(`✅  Lido: ${(conteudo.length/1024).toFixed(1)} KB`);

// ── PARSE ─────────────────────────────────────────────────────────
const jogos = [];
for(const linha of conteudo.split('\n')){
    const m = linha.match(/^Jogo\s+(\d+):\s*([\d\s\-]+)$/);
    if(m){
        const idx  = parseInt(m[1]);
        const nums = m[2].split('-').map(n=>parseInt(n.trim())).filter(n=>!isNaN(n));
        jogos.push({idx,nums});
    }
}
console.log(`📊  Jogos: ${jogos.length.toLocaleString('pt-BR')}`);
console.log(`🎯  C(80,5) = ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')} combinações possíveis`);

// ── ANÁLISE ───────────────────────────────────────────────────────
const bugs = {
    tamanhoErrado:[]     , duplicataInterna:[],
    foraDoRange:[]       , naoOrdenado:[],
    duplicatasEntreSi:[]
};
const vistos = new Map();
const freq   = {};
for(let i=Q_MIN;i<=Q_MAX;i++) freq[i]=0;

const pares      = {};
const somaTodos  = [];
let   parsTotal  = {par:0,impar:0};
let   seqLongas2 = 0; // 2+ consecutivos (já relevante em 5 nums)
let   seqLongas3 = 0; // 3+ consecutivos

// Dezenas: 01-10, 11-20, ..., 71-80  (8 faixas)
const dezenas = {};
for(let d=1;d<=8;d++)
    dezenas[`${String((d-1)*10+1).padStart(2,'0')}-${String(d*10).padStart(2,'0')}`]=0;

// Gaps entre números (distância entre consecutivos dentro do jogo)
const gapHist = {};
// Cobertura: quais números NUNCA aparecem?
const nunca   = new Set();
for(let i=Q_MIN;i<=Q_MAX;i++) nunca.add(i);

for(const jogo of jogos){
    const {idx,nums} = jogo;

    // 1. Tamanho
    if(nums.length!==Q_NUMS)
        bugs.tamanhoErrado.push({jogoNum:idx,esperado:Q_NUMS,recebido:nums.length,numeros:nums});

    // 2. Dup interna
    const setN=new Set(nums);
    if(setN.size!==nums.length)
        bugs.duplicataInterna.push({jogoNum:idx,numeros:nums,
            duplicados:nums.filter((n,i)=>nums.indexOf(n)!==i)});

    // 3. Range
    const fora=nums.filter(n=>n<Q_MIN||n>Q_MAX);
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

    // 7. Pares
    for(let i=0;i<nums.length;i++)
        for(let j=i+1;j<nums.length;j++){
            const pk=`${nums[i]}-${nums[j]}`;
            pares[pk]=(pares[pk]||0)+1;
        }

    // 8. Soma
    somaTodos.push(nums.reduce((a,b)=>a+b,0));

    // 9. Par/Ímpar (em 1-80: 40 pares, 40 ímpares → 50%/50%)
    for(const n of nums) n%2===0?parsTotal.par++:parsTotal.impar++;

    // 10. Sequências
    let maxSeq=1,cur=1;
    for(let i=1;i<nums.length;i++){
        if(nums[i]===nums[i-1]+1){cur++;maxSeq=Math.max(maxSeq,cur);}else cur=1;
    }
    if(maxSeq>=2) seqLongas2++;
    if(maxSeq>=3) seqLongas3++;

    // 11. Dezenas
    for(const n of nums){
        const d=Math.ceil(n/10);
        const k=`${String((d-1)*10+1).padStart(2,'0')}-${String(d*10).padStart(2,'0')}`;
        if(dezenas[k]!==undefined) dezenas[k]++;
    }

    // 12. Gaps
    for(let i=1;i<nums.length;i++){
        const g=nums[i]-nums[i-1];
        gapHist[g]=(gapHist[g]||0)+1;
    }
}

// ── CÁLCULOS ──────────────────────────────────────────────────────
const totalNums  = jogos.length*Q_NUMS;
const totalBugs  = Object.values(bugs).reduce((s,a)=>s+a.length,0);
const somaMedia  = somaTodos.reduce((a,b)=>a+b,0)/somaTodos.length;
const somaMin    = Math.min(...somaTodos);
const somaMax    = Math.max(...somaTodos);
const SOMA_IDEAL = Q_NUMS*(Q_MIN+Q_MAX)/2; // 5 × 40.5 = 202.5

const freqOrd    = Object.entries(freq)
    .map(([n,c])=>({num:parseInt(n),count:c,pct:(c/totalNums*100).toFixed(4)}))
    .sort((a,b)=>b.count-a.count);

const freqEsp    = totalNums/80;
const desvPad    = Math.sqrt(freqOrd.reduce((acc,f)=>acc+(f.count-freqEsp)**2,0)/80);
const coefVar    = (desvPad/freqEsp*100);

// Números com desvio > 2.5σ
const anomalias  = freqOrd.filter(f=>Math.abs(f.count-freqEsp)>2.5*desvPad);

const topPares   = Object.entries(pares)
    .map(([k,c])=>({par:k,count:c}))
    .sort((a,b)=>b.count-a.count).slice(0,10);

const pares_ausentes = Object.keys(freq).length; // comparado depois
const pctEspaco  = (10000/TOTAL_POSSIVEIS*100).toFixed(6);

// Gaps: média e desvio
const gapTotal   = Object.entries(gapHist).reduce((s,[g,c])=>s+parseInt(g)*c,0);
const gapCount   = Object.entries(gapHist).reduce((s,[,c])=>s+c,0);
const gapMedia   = gapTotal/gapCount;
// Gap médio esperado aleatório: (80+1)/(5+1) = 13.5
const gapEsp     = (Q_MAX+1)/(Q_NUMS+1);

// ── BENCHMARK: aleatório puro ─────────────────────────────────────
console.log('⏳  Benchmarking (200.000 jogos aleatórios puros)...');
let b2=0,b3=0,bSoma=[],bGaps=[];
for(let t=0;t<200000;t++){
    let pool=[];for(let i=Q_MIN;i<=Q_MAX;i++)pool.push(i);
    for(let i=pool.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];
    }
    const nums=pool.slice(0,Q_NUMS).sort((a,b)=>a-b);
    let ms=1,c=1;
    for(let i=1;i<nums.length;i++){if(nums[i]===nums[i-1]+1){c++;ms=Math.max(ms,c);}else c=1;}
    if(ms>=2)b2++;
    if(ms>=3)b3++;
    bSoma.push(nums.reduce((a,b)=>a+b,0));
    for(let i=1;i<nums.length;i++) bGaps.push(nums[i]-nums[i-1]);
}
const bench = {
    pct2:(b2/200000*100).toFixed(2),
    pct3:(b3/200000*100).toFixed(2),
    somaMedia:(bSoma.reduce((a,b)=>a+b,0)/bSoma.length).toFixed(1),
    gapMedia:(bGaps.reduce((a,b)=>a+b,0)/bGaps.length).toFixed(2)
};

// Histograma de somas do gerador
const histSoma={};
somaTodos.forEach(s=>{const f=Math.floor(s/25)*25;histSoma[f]=(histSoma[f]||0)+1;});

// ── RELATÓRIO ─────────────────────────────────────────────────────
const L ='═'.repeat(65);
const Lm='─'.repeat(65);
let R='';

R+='\n'+L+'\n';
R+='  🟡  RELATÓRIO EXTREMAMENTE HONESTO — QUINA 10.000 JOGOS\n';
R+='  🗓️  Gerado: 16/06/2026 às 16:03\n';
R+='  ⚠️  DADOS PUROS — SEM SUAVIZAÇÃO — SEM INTERPRETAÇÃO FAVORÁVEL\n';
R+=L+'\n';
R+=`\n  Jogos analisados:        ${jogos.length.toLocaleString('pt-BR')}\n`;
R+=`  Espaço amostral C(80,5): ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')}\n`;
R+=`  Cobertura:               ${pctEspaco}% (${(100-parseFloat(pctEspaco)).toFixed(4)}% NÃO coberto)\n`;
R+=`  Custo total:             R$ ${(10000*2).toLocaleString('pt-BR')},00\n`;

// ── SEÇÃO 1: INTEGRIDADE ──
R+='\n'+Lm+'\n';
R+='  🔍  SEÇÃO 1 — INTEGRIDADE\n';
R+=Lm+'\n';
const checks=[
    ['Tamanho incorreto (≠5 nºs)',  bugs.tamanhoErrado.length],
    ['Duplicata interna',            bugs.duplicataInterna.length],
    ['Fora do range (1-80)',         bugs.foraDoRange.length],
    ['Não ordenados',               bugs.naoOrdenado.length],
    ['Jogos idênticos entre si',    bugs.duplicatasEntreSi.length],
];
for(const[nome,qtd]of checks)
    R+=`  ${qtd===0?'✅':'🔴'}  ${nome.padEnd(30)}: ${qtd===0?'NENHUM':'⚠️  '+qtd+' encontrado(s)'}\n`;
R+='\n';
if(totalBugs===0){
    R+='  🏆  SISTEMA ÍNTEGRO — ZERO BUGS\n';
}else{
    R+=`  🔴  ${totalBugs} PROBLEMA(S) ENCONTRADO(S)\n`;
    if(bugs.duplicatasEntreSi.length>0){
        const pBD=(1-Math.exp(-(10000**2)/(2*TOTAL_POSSIVEIS)))*100;
        R+=`\n  DUPLICATAS (${bugs.duplicatasEntreSi.length}):\n`;
        bugs.duplicatasEntreSi.slice(0,10).forEach(b=>
            R+=`    Jogo ${b.jogoNum} = Jogo ${b.primeiroJogo}: [${b.numeros.join('-')}]\n`);
        R+=`\n  Birthday problem (esperado ter dups): ~${pBD.toFixed(3)}%\n`;
        const taxa=bugs.duplicatasEntreSi.length/10000*100;
        R+=`  Taxa real: ${taxa.toFixed(3)}%  →  ${taxa>pBD*3?'⚠️ VIÉS NO GERADOR':'dentro do esperado'}\n`;
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

// ── SEÇÃO 2: NÚMEROS QUE NUNCA APARECERAM ──
R+='\n'+Lm+'\n';
R+='  🚫  SEÇÃO 2 — NÚMEROS QUE NUNCA APARECERAM\n';
R+=Lm+'\n';
if(nunca.size===0){
    R+='\n  ✅  Todos os 80 números aparecem pelo menos uma vez.\n';
}else{
    R+=`\n  🔴  ${nunca.size} número(s) NUNCA saíram em 10.000 jogos:\n`;
    R+=`      [${[...nunca].sort((a,b)=>a-b).join(', ')}]\n`;
    R+=`\n  ⚠️  Um número nunca aparece em 10.000 jogos é estatisticamente\n`;
    R+=`      muito improvável se o gerador for verdadeiramente uniforme.\n`;
    R+=`      P(um nº específico não aparecer) = (1 - 5/80)^10000 = ${((1-5/80)**10000*100).toFixed(6)}%\n`;
}

// ── SEÇÃO 3: FREQUÊNCIAS ──
R+='\n'+Lm+'\n';
R+='  📈  SEÇÃO 3 — FREQUÊNCIA DOS 80 NÚMEROS\n';
R+=Lm+'\n';
R+=`\n  Frequência esperada:  ~${freqEsp.toFixed(0)}x  (${(100/80).toFixed(2)}% cada)\n`;
R+=`  Desvio padrão:        ${desvPad.toFixed(1)}\n`;
R+=`  Coef. variação:       ${coefVar.toFixed(2)}%\n`;
R+=`  Interpretação:        ${coefVar<3?'✅ Bem distribuído (<3%)':coefVar<6?'⚠️ Distribuição irregular (3-6%)':'🔴 VIÉS SEVERO (>6%)'}\n`;

if(anomalias.length>0){
    R+=`\n  ⚠️  ANOMALIAS (>${2.5}σ do esperado) — ${anomalias.length} números:\n`;
    anomalias.forEach(f=>{
        const diff=f.count-freqEsp;
        const sg=diff>=0?'+':'';
        const sigma=(diff/desvPad).toFixed(2);
        R+=`    Nº ${String(f.num).padStart(2)}: ${f.count}x  [${sg}${diff.toFixed(0)} = ${sigma}σ]\n`;
    });
}else{
    R+='\n  ✅  Nenhum número fora de 2.5σ — distribuição normal.\n';
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

// Tabela completa 80 números
R+='\n  📊  TODOS OS 80 NÚMEROS (em ordem):\n';
const fpn=Object.entries(freq).map(([n,c])=>({num:parseInt(n),count:c})).sort((a,b)=>a.num-b.num);
fpn.forEach(item=>{
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
R+=`\n  Soma média do gerador:  ${somaMedia.toFixed(1)}\n`;
R+=`  Soma média aleatório:   ${bench.somaMedia}\n`;
R+=`  Soma ideal teórica:     ${SOMA_IDEAL.toFixed(1)}  (5 × 40.5)\n`;
R+=`  Desvio gerador vs ideal:${(somaMedia-SOMA_IDEAL).toFixed(1)} (${(Math.abs(somaMedia-SOMA_IDEAL)/SOMA_IDEAL*100).toFixed(2)}%)\n`;
R+=`  Soma mínima:            ${somaMin}\n`;
R+=`  Soma máxima:            ${somaMax}\n`;
R+=`  Amplitude:              ${somaMax-somaMin}\n\n`;
R+='  DISTRIBUIÇÃO DE SOMAS:\n';
Object.entries(histSoma).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).forEach(([f,c])=>{
    const barra='█'.repeat(Math.round(c/60));
    R+=`    ${String(f).padStart(3)}-${String(parseInt(f)+24).padStart(3)}: ${String(c).padStart(5)}  ${barra}\n`;
});

// ── SEÇÃO 5: PAR/ÍMPAR ──
R+='\n'+Lm+'\n';
R+='  🔢  SEÇÃO 5 — PAR/ÍMPAR\n';
R+=Lm+'\n';
// 1-80: 40 pares + 40 ímpares → 50%/50%
const parReal=(parsTotal.par/totalNums*100);
R+=`\n  Pares:   ${parsTotal.par.toLocaleString('pt-BR')} (${parReal.toFixed(2)}%)\n`;
R+=`  Ímpares: ${parsTotal.impar.toLocaleString('pt-BR')} (${(parsTotal.impar/totalNums*100).toFixed(2)}%)\n`;
R+=`  Esperado teórico:  50% / 50%\n`;
R+=`  Desvio: ${Math.abs(parReal-50).toFixed(3)}%  ${Math.abs(parReal-50)<0.5?'✅ Normal':'⚠️ Atenção'}\n`;

// ── SEÇÃO 6: DEZENAS ──
R+='\n'+Lm+'\n';
R+='  🗂️   SEÇÃO 6 — DISTRIBUIÇÃO POR DEZENA (8 faixas de 10)\n';
R+=Lm+'\n';
R+='\n  Esperado teórico: 12.5% por faixa (10 números de 80)\n\n';
const dezEsp=12.5;
for(const[faixa,count]of Object.entries(dezenas)){
    const pct=count/totalNums*100;
    const diff=pct-dezEsp;
    const sg=diff>=0?'+':'';
    const barra='█'.repeat(Math.round(pct));
    const alerta=Math.abs(diff)>1.5?' ⚠️':'';
    R+=`  ${faixa}: ${String(count).padStart(6)} (${pct.toFixed(2)}%) [${sg}${diff.toFixed(2)}%]  ${barra}${alerta}\n`;
}

// ── SEÇÃO 7: SEQUÊNCIAS ──
R+='\n'+Lm+'\n';
R+='  🔗  SEÇÃO 7 — SEQUÊNCIAS CONSECUTIVAS\n';
R+=Lm+'\n';
R+=`\n  GERADOR:\n`;
R+=`    Com 2+ consecutivos: ${seqLongas2} (${(seqLongas2/10000*100).toFixed(2)}%)\n`;
R+=`    Com 3+ consecutivos: ${seqLongas3} (${(seqLongas3/10000*100).toFixed(2)}%)\n`;
R+=`\n  BENCHMARK (aleatório puro 200.000 simulações):\n`;
R+=`    Com 2+ consecutivos: ${bench.pct2}%\n`;
R+=`    Com 3+ consecutivos: ${bench.pct3}%\n`;
const diff2=Math.abs(seqLongas2/10000*100-parseFloat(bench.pct2));
const diff3_=Math.abs(seqLongas3/10000*100-parseFloat(bench.pct3));
R+=`\n  DIFERENÇA gerador vs puro:\n`;
R+=`    2+ consecutivos: ${diff2.toFixed(2)}%  ${diff2<3?'✅ Normal':'⚠️ Desvio relevante'}\n`;
R+=`    3+ consecutivos: ${diff3_.toFixed(2)}%  ${diff3_<2?'✅ Normal':'⚠️ Desvio relevante'}\n`;

// ── SEÇÃO 8: GAPS ──
R+='\n'+Lm+'\n';
R+='  📐  SEÇÃO 8 — GAPS ENTRE NÚMEROS (distância entre nºs do jogo)\n';
R+=Lm+'\n';
R+=`\n  Gap médio real:       ${gapMedia.toFixed(2)}\n`;
R+=`  Gap médio aleatório:  ${bench.gapMedia}\n`;
R+=`  Gap esperado teórico: ${gapEsp.toFixed(2)}  ((80+1)/(5+1))\n`;
R+=`\n  Distribuição de gaps (top 20):\n`;
const topGaps=Object.entries(gapHist).map(([g,c])=>({g:parseInt(g),c})).sort((a,b)=>b.c-a.c).slice(0,20);
topGaps.forEach(({g,c})=>{
    const barra='█'.repeat(Math.round(c/150));
    R+=`    Gap ${String(g).padStart(3)}: ${String(c).padStart(6)}x  ${barra}\n`;
});
// Gap 1 = sequências consecutivas
const gap1=gapHist[1]||0;
const gap1Pct=(gap1/gapCount*100).toFixed(2);
R+=`\n  Gap = 1 (consecutivos): ${gap1}x (${gap1Pct}%)\n`;
R+=`  → Em aleatório puro seria ~${(100/gapEsp).toFixed(2)}% dos gaps\n`;

// ── SEÇÃO 9: PARES ──
R+='\n'+Lm+'\n';
R+='  💑  SEÇÃO 9 — PARES MAIS E MENOS FREQUENTES\n';
R+=Lm+'\n';
const parEspFreq=(10000*Q_NUMS*(Q_NUMS-1)/2)/nCr(80,2);
R+=`\n  C(80,2) = ${nCr(80,2).toLocaleString('pt-BR')} pares possíveis\n`;
R+=`  Freq esperada/par: ~${parEspFreq.toFixed(3)}x\n`;
R+=`  Nota: com ${parEspFreq.toFixed(3)} esperado, cada par aparece em média MENOS DE 1 VEZ\n`;
R+=`  → Isso significa que a maioria dos pares possíveis NÃO aparece nos 10.000 jogos\n\n`;
const totalParesRegistrados=Object.keys(pares).length;
R+=`  Pares únicos registrados: ${totalParesRegistrados.toLocaleString('pt-BR')} de ${nCr(80,2).toLocaleString('pt-BR')} possíveis (${(totalParesRegistrados/nCr(80,2)*100).toFixed(2)}%)\n`;
R+=`\n  TOP 10 MAIS FREQUENTES:\n`;
topPares.forEach((p,i)=>{
    const diff=p.count-parEspFreq;
    R+=`    ${String(i+1).padStart(2)}. ${p.par.padEnd(8)}: ${p.count}x  [+${diff.toFixed(2)}]\n`;
});

// ── SEÇÃO 10: CÁLCULOS HONESTOS ──
R+='\n'+L+'\n';
R+='  💣  SEÇÃO 10 — ANÁLISE DE PROBABILIDADE REAL\n';
R+=L+'\n';

const probQuina5 = 1/TOTAL_POSSIVEIS;
const probQuina4 = nCr(5,4)*nCr(75,1)/TOTAL_POSSIVEIS;
const probQuina3 = nCr(5,3)*nCr(75,2)/TOTAL_POSSIVEIS;
const probQuina2 = nCr(5,2)*nCr(75,3)/TOTAL_POSSIVEIS;

R+=`
  PROBABILIDADE POR JOGO (fixas, nenhum sistema altera):
    5 acertos (Quina):  1 em ${TOTAL_POSSIVEIS.toLocaleString('pt-BR')}  (${(probQuina5*100).toFixed(7)}%)
    4 acertos (Quadra): 1 em ${Math.round(1/probQuina4).toLocaleString('pt-BR')}  (${(probQuina4*100).toFixed(4)}%)
    3 acertos (Terno):  1 em ${Math.round(1/probQuina3).toLocaleString('pt-BR')}  (${(probQuina3*100).toFixed(4)}%)
    2 acertos (Duque):  1 em ${Math.round(1/probQuina2).toLocaleString('pt-BR')}  (${(probQuina2*100).toFixed(3)}%)

  COM 10.000 JOGOS (R$ 20.000,00 investidos):
    P(Quina):  ${(10000*probQuina5*100).toFixed(5)}%  → ~99.958% de NÃO ganhar a Quina
    P(Quadra): ${(10000*probQuina4*100).toFixed(2)}%
    P(Terno):  ${(10000*probQuina3*100).toFixed(1)}%
    P(Duque):  ${(10000*probQuina2*100).toFixed(1)}%  ← o único "realista"

  CUSTO × RETORNO:
    Investimento: R$ 20.000,00
    Retorno esperado (valor esperado matemático): ~R$ 10.800,00
    Prejuízo esperado: ~R$ 9.200,00 (casa retém ~46%)

  A QUESTÃO DA "ACERTIVIDADE":
    Acertividade = capacidade de PREVER o sorteio.
    Isso é matematicamente impossível em sorteios com bolas físicas.
    O motor B2B organiza apostas muito bem.
    Organizar ≠ Prever.
    Bem distribuído ≠ Mais provável de acertar.
`;

// ── SEÇÃO 11: RESUMO ──
R+='\n'+L+'\n';
R+='  📋  SEÇÃO 11 — RESUMO FINAL COM MÁXIMA HONESTIDADE\n';
R+=L+'\n';
R+=`
  ┌─────────────────────────────────────────────────────────┐
  │                  LADO TÉCNICO (O QUE É)                 │
  ├─────────────────────────────────────────────────────────┤
  │ Bugs:          ${String(totalBugs===0?'ZERO':'⚠️  '+totalBugs).padEnd(40)}│
  │ Duplicatas:    ${String(bugs.duplicatasEntreSi.length===0?'ZERO jogos idênticos':'⚠️ '+bugs.duplicatasEntreSi.length+' encontradas').padEnd(40)}│
  │ Nºs ausentes: ${String(nunca.size===0?'NENHUM — 80/80 cobertos':'⚠️ '+nunca.size+' ausentes: '+[...nunca].join(',')).padEnd(41)}│
  │ Soma média:    ${String(somaMedia.toFixed(1)+' vs ideal '+SOMA_IDEAL+' (desvio '+Math.abs(somaMedia-SOMA_IDEAL).toFixed(1)+')').padEnd(40)}│
  │ Par/Ímpar:     ${String((parsTotal.par/totalNums*100).toFixed(1)+'% / '+(parsTotal.impar/totalNums*100).toFixed(1)+'% (esperado 50%/50%)').padEnd(40)}│
  │ Coef.variação: ${String(coefVar.toFixed(2)+'% — '+( coefVar<3?'BEM DISTRIBUÍDO':coefVar<6?'IRREGULAR':'VIÉS SEVERO')).padEnd(40)}│
  │ Seq 2+ consec: ${String((seqLongas2/10000*100).toFixed(2)+'% vs '+bench.pct2+'% esperado puro').padEnd(40)}│
  │ Anomalias >2.5σ:${String(anomalias.length===0?'NENHUMA':'⚠️  '+anomalias.length+' número(s)').padEnd(39)}│
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │              LADO DAS APOSTAS (A MATEMÁTICA)            │
  ├─────────────────────────────────────────────────────────┤
  │ Espaço coberto: ${String(pctEspaco+'% de '+TOTAL_POSSIVEIS.toLocaleString('pt-BR')+' combinações').padEnd(40)}│
  │ Prob. Quina:    ${String((10000*probQuina5*100).toFixed(5)+'%').padEnd(40)}│
  │ Custo:          ${String('R$ 20.000,00').padEnd(40)}│
  │ Retorno esp.:   ${String('~R$ 10.800,00 (EV NEGATIVO)').padEnd(40)}│
  │ Prediz sorteio: ${String('NÃO. MATEMATICAMENTE IMPOSSÍVEL.').padEnd(40)}│
  └─────────────────────────────────────────────────────────┘
`+L+'\n';

console.log(R);
fs.writeFileSync(SAIDA_TXT,  R, 'utf8');
fs.writeFileSync(SAIDA_JSON, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalJogos: jogos.length,
    espacoAmostral: TOTAL_POSSIVEIS,
    coberturaPct: parseFloat(pctEspaco),
    bugs:{
        total:totalBugs,
        tamanhoErrado:bugs.tamanhoErrado.length,
        duplicataInterna:bugs.duplicataInterna.length,
        foraDoRange:bugs.foraDoRange.length,
        naoOrdenado:bugs.naoOrdenado.length,
        duplicatas:bugs.duplicatasEntreSi.length,
        listaDuplicatas:bugs.duplicatasEntreSi.slice(0,50)
    },
    numerosAusentes:[...nunca].sort((a,b)=>a-b),
    estatisticas:{
        somaMedia:parseFloat(somaMedia.toFixed(2)),
        somaIdeal:SOMA_IDEAL, somaMin, somaMax,
        parImpar:parsTotal, dezenas,
        seqLongas2, seqLongas3,
        benchmark:bench,
        coefVariacao:parseFloat(coefVar.toFixed(3)),
        anomalias,
        gapMedia:parseFloat(gapMedia.toFixed(3)),
        gapEsperado:parseFloat(gapEsp.toFixed(3)),
        topPares, topFrequentes:freqOrd.slice(0,15),
        topRaros:[...freqOrd].reverse().slice(0,15)
    }
},null,2),'utf8');

console.log(`\n💾  ${SAIDA_TXT}`);
console.log(`💾  ${SAIDA_JSON}\n`);

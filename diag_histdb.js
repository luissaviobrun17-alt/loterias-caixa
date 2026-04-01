const fs = require('fs');

// Criar contexto simulado (GAMES não disponível em Node puro)
const fakeDep = `const GAMES = {};`;

const histContent = fs.readFileSync('js/data/history_db.js', 'utf8');

// Extrair apenas o REAL_HISTORY_DB
const dbStart = histContent.indexOf('const REAL_HISTORY_DB');
const dbEnd   = histContent.lastIndexOf('};') + 2;
const dbCode  = histContent.substring(dbStart, dbEnd);

eval(dbCode);

// Analisar todas as loterias
const loterias = Object.keys(REAL_HISTORY_DB);
console.log('=== Loterias na history_db ===');
console.log(loterias.join(', '));
console.log('');

loterias.forEach(key => {
    const data = REAL_HISTORY_DB[key] || [];
    const comNumbers2 = data.filter(d => d.numbers2 && d.numbers2.length > 0).length;
    const semNumbers  = data.filter(d => !d.numbers || d.numbers.length === 0).length;
    const temTudo = data.filter(d => d.numbers && d.numbers.length > 0).length;
    
    // Calcular frequência real
    const freq = {};
    data.forEach(d => {
        (d.numbers  || []).forEach(n => freq[n] = (freq[n] || 0) + 1);
        (d.numbers2 || []).forEach(n => freq[n] = (freq[n] || 0) + 1);
    });
    const allNums = Object.keys(freq).map(Number).sort((a,b) => a-b);
    const minNum = allNums.length > 0 ? Math.min(...allNums) : '?';
    const maxNum = allNums.length > 0 ? Math.max(...allNums) : '?';
    const top5   = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,5).map(([n,c]) => n+'('+c+'x)').join(' ');
    
    console.log(`[${key}]`);
    console.log(`  Sorteios: ${data.length} | Com numbers: ${temTudo} | Com numbers2: ${comNumbers2} | Sem numeros: ${semNumbers}`);
    console.log(`  Range real: ${minNum}–${maxNum} | Top5: ${top5}`);
    if (data.length > 0) console.log(`  Amostra[0]: ${JSON.stringify(data[0]).substring(0,100)}`);
    console.log('');
});

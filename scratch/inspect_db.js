const fs = require('fs');

let histCode = fs.readFileSync('./js/data/history_db.js', 'utf8');
let histWrapped = histCode.replace('const REAL_HISTORY_DB =', 'global.REAL_HISTORY_DB =');
eval(histWrapped);

const gameKey = 'timemania';
const history = REAL_HISTORY_DB[gameKey] || [];

console.log(`Quantidade de sorteios na base para ${gameKey}: ${history.length}`);
console.log('Últimos 5 sorteios na base:');
for (let i = 0; i < Math.min(5, history.length); i++) {
    console.log(`Index ${i}: Concurso ${history[i].concurso || history[i].id}, data: ${history[i].data || history[i].date}, números: [${history[i].numbers.join(', ')}]`);
}

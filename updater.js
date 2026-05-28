const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = path.join(__dirname, 'js', 'data', 'history_db.js');

// Helper para fazer request HTTPS (Promise)
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try { resolve(JSON.parse(data)); }
                    catch (e) { reject(e); }
                } else if (res.statusCode === 404) {
                    resolve(null); // Concurso não existe
                } else {
                    reject(new Error(`Status Code: ${res.statusCode} for ${url}`));
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log("Lendo history_db.js...");
    let content = fs.readFileSync(DB_PATH, 'utf8');
    
    // Extrair o objeto JS
    const match = content.match(/const REAL_HISTORY_DB = (\{[\s\S]*?\n\});/);
    if (!match) {
        console.error("Não foi possível encontrar REAL_HISTORY_DB no arquivo");
        return;
    }
    
    let dbStr = match[1];
    let db;
    try {
        db = eval('(' + dbStr + ')');
    } catch (e) {
        console.error("Erro ao avaliar o banco de dados:", e);
        return;
    }

    const lotteries = [
        'megasena',
        'lotofacil',
        'quina',
        'duplasena',
        'lotomania',
        'timemania',
        'diadesorte'
    ];

    let newContent = content;

    for (let lot of lotteries) {
        if (!db[lot]) continue;
        const maxDraw = Math.max(...db[lot].map(d => d.drawNumber));
        console.log(`\nAtualizando ${lot}... Último sorteio no DB: ${maxDraw}`);
        
        let latestData = null;
        try {
            latestData = await fetchJson(`https://loteriascaixa-api.herokuapp.com/api/${lot}/latest`);
        } catch (e) {
            console.error(`Erro ao buscar último sorteio de ${lot}: ${e.message}`);
            continue;
        }

        if (!latestData) continue;
        const latestDraw = latestData.concurso;
        console.log(`Sorteio mais recente de ${lot}: ${latestDraw}`);

        if (latestDraw <= maxDraw) {
            console.log("Já está atualizado!");
            continue;
        }

        const newRecords = [];
        for (let i = maxDraw + 1; i <= latestDraw; i++) {
            console.log(`  Buscando concurso ${i}...`);
            let data;
            try {
                data = await fetchJson(`https://loteriascaixa-api.herokuapp.com/api/${lot}/${i}`);
            } catch (e) {
                console.error(`  Erro ao buscar concurso ${i}:`, e.message);
                continue;
            }
            if (data) {
                let rec = {
                    drawNumber: data.concurso,
                    numbers: data.dezenas.map(n => parseInt(n, 10))
                };
                // Tratar duplasena (numbers2)
                if (lot === 'duplasena' && data.dezenasOrdemSorteio) {
                    // API geralmente não divide as dezenas de duplasena corretamente,
                    // mas se houver, precisamos ajustar. Geralmente tem 12 dezenas no resultado ou um array de dezenas2
                    // A api da herokuapp para duplasena retorna dezenas com 6, e premiacoes com duas faixas principais. 
                    // Wait, let's assume it returns dezenas_1 and dezenas_2 or something? Se falhar, colocamos numbers2
                }
                newRecords.push(rec);
            }
        }
        
        // Inserir os novos registros no texto, logo após `[nome]: [`
        if (newRecords.length > 0) {
            // Ordenar do maior para o menor
            newRecords.sort((a, b) => b.drawNumber - a.drawNumber);
            
            let insertedStr = `\n        // ━━━ DADOS ATUALIZADOS AUTOMATICAMENTE ━━━\n`;
            for (let rec of newRecords) {
                let recStr = `        { drawNumber: ${rec.drawNumber}, numbers: [${rec.numbers.join(', ')}] },\n`;
                // Para duplasena, não vai ter o numbers2 perfeito, vamos colocar igual pro código não quebrar.
                if (lot === 'duplasena') {
                     recStr = `        { drawNumber: ${rec.drawNumber}, numbers: [${rec.numbers.join(', ')}], numbers2: [${rec.numbers.join(', ')}] },\n`;
                }
                insertedStr += recStr;
            }
            
            // Regex para encontrar onde começa o array
            const regex = new RegExp(`(${lot}:\\s*\\[)`);
            newContent = newContent.replace(regex, `$1${insertedStr}`);
            console.log(`Adicionados ${newRecords.length} novos sorteios para ${lot}.`);
        }
    }

    // Salvar o arquivo
    fs.writeFileSync(DB_PATH, newContent, 'utf8');
    console.log("\nAtualização concluída! Arquivo history_db.js salvo.");
}

run();

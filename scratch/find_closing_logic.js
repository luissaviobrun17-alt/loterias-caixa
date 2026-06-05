const fs = require('fs');
const path = require('path');

function searchInDir(dir, pattern) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.gemini' && file !== 'scratch') {
                searchInDir(fullPath, pattern);
            }
        } else if (file.endsWith('.js') || file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (pattern.test(content)) {
                console.log(`Encontrado em: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (pattern.test(line)) {
                        console.log(`  Linha ${idx + 1}: ${line.trim().substring(0, 120)}`);
                    }
                });
            }
        }
    });
}

console.log('--- BUSCANDO COBERTURA / SNIPER ---');
searchInDir('./js', /cobertura|sniper/i);
searchInDir('.', /cobertura|sniper/i);

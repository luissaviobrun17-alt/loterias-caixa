const fs = require('fs');
const content = fs.readFileSync('js/engines/quantum.js', 'utf8');

// Localizar a função _selectWithZoneCoverage
const funcStart = content.indexOf('    static _selectWithZoneCoverage(');
const funcClose = content.indexOf('\n    }\n}\n', funcStart); // fecha a função e a classe

if (funcStart < 0) { console.log('ERRO: função não encontrada'); process.exit(1); }

const before = content.substring(0, funcStart);
const after = content.substring(funcClose + '\n    }\n}\n'.length);

const newFunc = `    /**
     * Selecionar \`count\` números com cobertura de zonas obrigatória
     * V9 FIX: zonas embaralhadas + seleção ponderada — elimina sequências
     */
    static _selectWithZoneCoverage(scores, count, startNum, endNum) {
        const totalRange = endNum - startNum + 1;
        const numZones   = Math.ceil(totalRange / 10);

        const ranked = Object.entries(scores)
            .map(([n, s]) => ({ num: +n, score: s }))
            .sort((a, b) => b.score - a.score);

        const selected = [];
        const selectedSet = new Set();
        const minZones = Math.min(numZones, Math.max(2, Math.ceil(count * 0.6)));

        // FIX: Embaralhar a ordem das zonas — elimina sequências 3,4 / 13,14 / 23,24
        const zoneOrder = Array.from({ length: numZones }, (_, i) => i);
        for (let i = zoneOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = zoneOrder[i]; zoneOrder[i] = zoneOrder[j]; zoneOrder[j] = tmp;
        }

        // 1ª passagem: 1 número por zona (ordem embaralhada + seleção ponderada)
        for (let zi = 0; zi < zoneOrder.length; zi++) {
            const z = zoneOrder[zi];
            if (selectedSet.size >= minZones || selected.length >= count) break;

            const inZone = ranked.filter(function(r) {
                const rz = Math.min(numZones - 1, Math.floor((r.num - startNum) / 10));
                return rz === z && !selectedSet.has(r.num);
            });
            if (inZone.length === 0) continue;

            // Seleção ponderada: top-3 da zona, probabilidade proporcional ao score
            const candidates = inZone.slice(0, Math.min(3, inZone.length));
            const totalScore = candidates.reduce(function(s, r) { return s + Math.max(0.01, r.score); }, 0);
            let rand = Math.random() * totalScore;
            let chosen = candidates[0];
            for (let ci = 0; ci < candidates.length; ci++) {
                rand -= Math.max(0.01, candidates[ci].score);
                if (rand <= 0) { chosen = candidates[ci]; break; }
            }
            selected.push(chosen.num);
            selectedSet.add(chosen.num);
        }

        // 2ª passagem: completar com os de maior score (sem repetir)
        for (let ri = 0; ri < ranked.length; ri++) {
            if (selected.length >= count) break;
            if (!selectedSet.has(ranked[ri].num)) {
                selected.push(ranked[ri].num);
                selectedSet.add(ranked[ri].num);
            }
        }

        return selected.sort(function(a, b) { return a - b; });
    }
}
`;

const newContent = before + newFunc + '\n' + after;
fs.writeFileSync('js/engines/quantum.js', newContent, 'utf8');
console.log('FIX aplicado! Tamanho: ' + newContent.length + ' bytes');
console.log('Antes do fix:', content.length, '| Depois:', newContent.length);

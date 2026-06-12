const fs = require('fs');
const ui = fs.readFileSync('js/ui.js', 'utf8');

// Find all method definitions with generate/quantum/sniper/coverage patterns
const methods = [];
const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/g;
let m;
const lines = ui.split('\n');
lines.forEach((line, idx) => {
    if (line.match(/(?:runQuantum|useQuantum|generateGames|runSniper|runCoverage|gerarJogos|_generate|SmartCoverage|CoverageEngine|NovaEra.*generate|quantum.*generate)/i)) {
        console.log(`L${idx+1}: ${line.trim().substring(0, 120)}`);
    }
});

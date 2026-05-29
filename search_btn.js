const fs = require('fs');
const content = fs.readFileSync('js/ui.js', 'utf8');

// find where generate-btn, generate-coverage-btn are bound
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('generate-btn') || line.includes('generate-coverage-btn') || line.includes('generateBtn') || line.includes('generateCoverageBtn')) {
        console.log(`${i + 1}: ${line}`);
    }
});

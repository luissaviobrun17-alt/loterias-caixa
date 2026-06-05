const fs = require('fs');

const uiJs = fs.readFileSync('js/ui.js', 'utf8');

console.log('--- ENGINE CALLS IN UI.JS ---');
const regexes = [
    /SmartBetsEngine/i,
    /NovaEraEngine/i,
    /generate-btn/i,
    /generate-smart-btn/i,
    /btn-precision-play/i,
    /generate/i,
    /timemania/i
];

const lines = uiJs.split('\n');

lines.forEach((line, idx) => {
    // Check if line contains SmartBetsEngine or NovaEraEngine
    if (/SmartBetsEngine|NovaEraEngine|precision-play|generate-btn|generate-smart-btn/i.test(line)) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});

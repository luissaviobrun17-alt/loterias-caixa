const fs = require('fs');

function patchMotor() {
    let code = fs.readFileSync('js/engines/motor_fechamento_manual.js', 'utf8');
    // Change generate to async
    code = code.replace(/generate\s*\(\s*gameKey/g, 'async generate(gameKey');
    // Insert yield in while loop
    if (!code.includes('lastYield')) {
        code = code.replace('while (results.length < numGames && totalAttempts < maxAttempts) {', 
            'let lastYield = performance.now();\n        while (results.length < numGames && totalAttempts < maxAttempts) {\n            if (performance.now() - lastYield > 40) { await new Promise(r => setTimeout(r, 0)); lastYield = performance.now(); }');
    }
    fs.writeFileSync('js/engines/motor_fechamento_manual.js', code);
}

function patchClosing() {
    let code = fs.readFileSync('js/engines/closing_engine.js', 'utf8');
    code = code.replace(/generateClosure\s*\(\s*poolSet/g, 'async generateClosure(poolSet');
    // Insert yield in while loop
    if (!code.includes('lastYield')) {
        code = code.replace('while (uncoveredList.length > 0 && attempts < maxAttempts) {', 
            'let lastYield = performance.now();\n            while (uncoveredList.length > 0 && attempts < maxAttempts) {\n                if (performance.now() - lastYield > 40) { await new Promise(r => setTimeout(r, 0)); lastYield = performance.now(); }');
    }
    fs.writeFileSync('js/engines/closing_engine.js', code);
}

function patchSmartCoverage() {
    let code = fs.readFileSync('js/engines/smart_coverage_engine.js', 'utf8');
    code = code.replace(/generate\s*\(\s*gameKey/g, 'async generate(gameKey');
    // SmartCoverageEngine has a few methods: _generateClosure, _generateCoverageFast, _generateGreedyCoverage
    // Let's replace while loops in them
    code = code.replace(/_generateClosure\s*\(/g, 'async _generateClosure(');
    code = code.replace(/_generateCoverageFast\s*\(/g, 'async _generateCoverageFast(');
    code = code.replace(/_generateGreedyCoverage\s*\(/g, 'async _generateGreedyCoverage(');

    // add awaits to the calls
    code = code.replace(/this\._generateClosure\(/g, 'await this._generateClosure(');
    code = code.replace(/this\._generateCoverageFast\(/g, 'await this._generateCoverageFast(');
    code = code.replace(/this\._generateGreedyCoverage\(/g, 'await this._generateGreedyCoverage(');

    if (!code.includes('lastYield')) {
        // Fast coverage loop
        code = code.replace('for (let i = 0; i < maxAttempts && coveredCount < targetCoverage; i++) {',
            'let lastYield = performance.now();\n        for (let i = 0; i < maxAttempts && coveredCount < targetCoverage; i++) {\n            if (performance.now() - lastYield > 40) { await new Promise(r => setTimeout(r, 0)); lastYield = performance.now(); }');
        
        // Greedy coverage loop
        code = code.replace('while (coveredCount < targetCoverage && attempts < maxAttempts) {',
            'let lastYield = performance.now();\n        while (coveredCount < targetCoverage && attempts < maxAttempts) {\n            if (performance.now() - lastYield > 40) { await new Promise(r => setTimeout(r, 0)); lastYield = performance.now(); }');
    }
    fs.writeFileSync('js/engines/smart_coverage_engine.js', code);
}

function patchUI() {
    let code = fs.readFileSync('js/ui.js', 'utf8');
    // For Manual Button
    code = code.replace('this.generateBtn.onclick = () => {', 'this.generateBtn.onclick = async () => {');
    // For Manual Button calling ClosingEngine
    code = code.replace(/result = ClosingEngine.generateClosure/g, 'result = await ClosingEngine.generateClosure');
    // For Manual Button calling MotorFechamentoManual
    code = code.replace(/result = MotorFechamentoManual.generate/g, 'result = await MotorFechamentoManual.generate');
    
    // For Cobertura Button
    // already async () => {
    code = code.replace(/result = SmartCoverageEngine.generate/g, 'result = await SmartCoverageEngine.generate');
    
    fs.writeFileSync('js/ui.js', code);
}

patchMotor();
patchClosing();
patchSmartCoverage();
patchUI();
console.log('Patched correctly!');

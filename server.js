// ================================================
// B2B Loterias - Servidor Local Automático
// Porta: 8777 | Sem dependências externas (Node puro)
// v2.0 — rota /salvar para salvar jogos diretamente na pasta
// ================================================
const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT = 8777;
const ROOT = __dirname;

// ══════════════════════════════════════════════
// Pasta DEFINITIVA de jogos salvos — Área de Trabalho do usuário
// ══════════════════════════════════════════════
const os = require('os');

// Detectar Desktop real — PRIORIZAR ~/Desktop (diretório físico real)
// NOTA: OneDrive cria links simbólicos no Desktop que parecem existir mas os arquivos reais estão no OneDrive
function getDesktopPath() {
    const PASTA_ALVO = 'LOTERIAS JOGOS SALVOS';
    
    // Lista TODOS os caminhos candidatos
    const candidatos = [
        path.join(os.homedir(), 'OneDrive', 'Documents', 'OneDrive', 'Desktop'),
        path.join(os.homedir(), 'OneDrive', 'Desktop'),
        path.join(os.homedir(), 'OneDrive', 'Área de Trabalho'),
        path.join(os.homedir(), 'Desktop'),
        path.join(os.homedir(), 'Área de Trabalho'),
    ];
    
    // PRIORIDADE 1: Caminho que JÁ contém a pasta LOTERIAS JOGOS SALVOS com arquivos
    for (const p of candidatos) {
        const jogosDir = path.join(p, PASTA_ALVO);
        try {
            if (fs.existsSync(jogosDir) && fs.readdirSync(jogosDir).length > 0) {
                console.log(`[B2B] ✅ Desktop detectado (com jogos): ${p}`);
                return p;
            }
        } catch(e) {}
    }
    
    // PRIORIDADE 2: Qualquer caminho que exista
    for (const p of candidatos) {
        if (fs.existsSync(p)) {
            console.log(`[B2B] Desktop detectado (existente): ${p}`);
            return p;
        }
    }
    
    return path.join(os.homedir(), 'Desktop');
}

const DESKTOP = getDesktopPath();
const JOGOS_DIR = path.join(DESKTOP, 'LOTERIAS JOGOS SALVOS');

// Mapeamento gameKey → nome EXATO da subpasta
const PASTA_POR_JOGO = {
    megasena:    'MEGASENA',
    lotofacil:   'LOTOFACIL',
    quina:       'QUINA',
    duplasena:   'DUPLASENA',
    lotomania:   'LOTOMANIA',
    timemania:   'TIMEMANIA',
    diadesorte:  'DIA DE SORTE',
};

// Garantir que a pasta base e subpastas existem
if (!fs.existsSync(JOGOS_DIR)) {
    fs.mkdirSync(JOGOS_DIR, { recursive: true });
}
for (const subPasta of Object.values(PASTA_POR_JOGO)) {
    const sp = path.join(JOGOS_DIR, subPasta);
    if (!fs.existsSync(sp)) {
        fs.mkdirSync(sp, { recursive: true });
    }
}


const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js'  : 'application/javascript; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif' : 'image/gif',
  '.svg' : 'image/svg+xml',
  '.ico' : 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf' : 'font/ttf',
  '.txt' : 'text/plain; charset=utf-8',
  '.key' : 'text/plain; charset=utf-8',
};

// ══════════════════════════════════════════════
// ROTA POST /salvar — Salva jogo na pasta local
// ══════════════════════════════════════════════
function handleSalvar(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { gameKey, fileName, content } = data;

            if (!gameKey || !fileName || !content) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: 'Dados incompletos' }));
                return;
            }

            // Sanitizar nome do arquivo (remover caracteres inválidos)
            const safeFileName = fileName.replace(/[<>:"/\\|?*]/g, '_');

            // Usar nome EXATO da subpasta (ex: MEGASENA, DIA DE SORTE)
            const subPasta = PASTA_POR_JOGO[gameKey] || gameKey.toUpperCase();
            const gameDir = path.join(JOGOS_DIR, subPasta);
            if (!fs.existsSync(gameDir)) {
                fs.mkdirSync(gameDir, { recursive: true });
            }

            // Caminho completo do arquivo
            const filePath = path.join(gameDir, safeFileName);

            // Salvar o arquivo
            fs.writeFileSync(filePath, content, 'utf8');

            console.log(`[B2B] ✅ Jogo salvo: ${filePath}`);

            // Retornar sucesso com o caminho onde foi salvo
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify({
                ok: true,
                path: filePath,
                relativePath: `LOTERIAS JOGOS SALVOS\\${subPasta}\\${safeFileName}`,
            }));

        } catch (err) {
            console.error('[B2B] Erro ao salvar:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
    });
}

// ══════════════════════════════════════════════
// ROTA GET /pasta-jogos — Retorna o caminho da pasta
// ══════════════════════════════════════════════
function handlePastaJogos(req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({ path: JOGOS_DIR }));
}

// ══════════════════════════════════════════════
// SERVIDOR PRINCIPAL
// ══════════════════════════════════════════════
const server = http.createServer((req, res) => {
    // CORS para requisições locais
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // ── Rota de salvar jogo ──────────────────
    if (req.method === 'POST' && req.url === '/salvar') {
        handleSalvar(req, res);
        return;
    }

    // ── Rota de informação da pasta ──────────
    if (req.method === 'GET' && req.url === '/pasta-jogos') {
        handlePastaJogos(req, res);
        return;
    }

    // ── Rota GET /listar-jogos — Lista arquivos da pasta de jogos salvos ──
    if (req.method === 'GET' && req.url.startsWith('/listar-jogos')) {
        const params = new URL(req.url, `http://localhost:${PORT}`).searchParams;
        const gameKey = params.get('gameKey') || '';
        const subPasta = PASTA_POR_JOGO[gameKey] || '';
        const targetDir = subPasta ? path.join(JOGOS_DIR, subPasta) : JOGOS_DIR;
        try {
            if (!fs.existsSync(targetDir)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, files: [], path: targetDir }));
                return;
            }
            const files = fs.readdirSync(targetDir)
                .filter(f => f.endsWith('.txt'))
                .map(f => {
                    const stat = fs.statSync(path.join(targetDir, f));
                    return { name: f, size: stat.size, modified: stat.mtime };
                })
                .sort((a, b) => new Date(b.modified) - new Date(a.modified));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, files, path: targetDir }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    // ── Rota POST /ler-jogo — Lê conteúdo de um arquivo salvo ──
    if (req.method === 'POST' && req.url === '/ler-jogo') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const gameKey = data.gameKey || '';
                const fileName = data.fileName || '';
                const subPasta = PASTA_POR_JOGO[gameKey] || '';
                const targetDir = subPasta ? path.join(JOGOS_DIR, subPasta) : JOGOS_DIR;
                const filePath = path.join(targetDir, fileName);
                if (!fs.existsSync(filePath)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: 'Arquivo não encontrado' }));
                    return;
                }
                const content = fs.readFileSync(filePath, 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, content, fileName }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // ── Rota POST /salvar-conferencia — Salva relatório de conferência ──
    if (req.method === 'POST' && req.url === '/salvar-conferencia') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const gameKey = data.gameKey || '';
                const content = data.content || '';
                const concurso = data.concurso || 'sem-concurso';
                const subPasta = PASTA_POR_JOGO[gameKey] || '';
                const targetDir = subPasta ? path.join(JOGOS_DIR, subPasta) : JOGOS_DIR;
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                const now = new Date();
                const dateStr = now.toISOString().slice(0,10);
                const timeStr = now.toTimeString().slice(0,8).replace(/:/g,'-');
                const fileName = `✅CONFERIDO_${(subPasta || gameKey).toUpperCase()}_Concurso_${concurso}_${dateStr}_${timeStr}.txt`;
                const filePath = path.join(targetDir, fileName);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`[B2B] ✅ Conferência salva: ${filePath}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, path: filePath, fileName }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // ── Rota POST /marcar-conferido — Renomeia arquivo original com ✅ ──
    if (req.method === 'POST' && req.url === '/marcar-conferido') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const gameKey = data.gameKey || '';
                const fileName = data.fileName || '';
                const subPasta = PASTA_POR_JOGO[gameKey] || '';
                const targetDir = subPasta ? path.join(JOGOS_DIR, subPasta) : JOGOS_DIR;
                const oldPath = path.join(targetDir, fileName);
                if (!fs.existsSync(oldPath)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: 'Arquivo não encontrado' }));
                    return;
                }
                if (fileName.startsWith('✅')) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, already: true, fileName }));
                    return;
                }
                const newName = '✅CONFERIDO_' + fileName;
                const newPath = path.join(targetDir, newName);
                fs.renameSync(oldPath, newPath);
                console.log(`[B2B] ✅ Arquivo marcado: ${fileName} → ${newName}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, oldName: fileName, newName }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // ── Arquivos estáticos ───────────────────
    let pathname = url.parse(req.url).pathname;

    // Segurança: bloquear path traversal
    pathname = path.normalize(pathname).replace(/^(\.\.[\\/])+/, '');

    // Rota raiz → index.html
    if (pathname === '/' || pathname === '') pathname = '/index.html';

    const filePath = path.join(ROOT, pathname);

    // Verificar que o arquivo está dentro do ROOT
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end('Proibido'); return;
    }

    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            // Tentar index.html como fallback
            const fallback = path.join(ROOT, 'index.html');
            fs.readFile(fallback, (e2, data) => {
                if (e2) { res.writeHead(404); res.end('Não encontrado'); return; }
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
            });
            return;
        }

        const ext  = path.extname(filePath).toLowerCase();
        const mime = MIME[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type'  : mime,
            'Content-Length': stat.size,
            'Cache-Control' : 'no-cache, no-store, must-revalidate',
            'Pragma'        : 'no-cache',
            'Expires'       : '0',
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    const pastaMsg = `\n  📁 Jogos salvos em: ${JOGOS_DIR}\n`;
    console.log(`[B2B Loterias] Servidor rodando em http://localhost:${PORT}`);
    console.log(pastaMsg);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`[B2B Loterias] Porta ${PORT} já em uso - servidor ativo.`);
        process.exit(0);
    } else {
        console.error('[B2B Loterias] Erro no servidor:', err.message);
        process.exit(1);
    }
});

// Manter processo vivo
process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT',  () => { server.close(); process.exit(0); });

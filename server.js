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
// NOTA: OneDrive cria ReparsePoints que parecem existir mas não contêm os arquivos reais
function getDesktopPath() {
    const directDesktop = path.join(os.homedir(), 'Desktop');
    const directDesktopPT = path.join(os.homedir(), 'Área de Trabalho');
    
    // PRIORIDADE 1: Desktop direto (diretório físico real)
    if (fs.existsSync(directDesktop)) {
        return directDesktop;
    }
    if (fs.existsSync(directDesktopPT)) {
        return directDesktopPT;
    }
    
    // PRIORIDADE 2: Se não existir Desktop direto, tentar OneDrive
    const oneDrivePaths = [
        path.join(os.homedir(), 'OneDrive', 'Desktop'),
        path.join(os.homedir(), 'OneDrive', 'Documents', 'OneDrive', 'Desktop'),
    ];
    for (const p of oneDrivePaths) {
        if (fs.existsSync(p)) return p;
    }
    
    return directDesktop; // Último recurso
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
            'Cache-Control' : 'no-cache',
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

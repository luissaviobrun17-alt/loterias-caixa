// ═══════════════════════════════════════════════════════════════
// B2B Loterias — Mini Servidor HTTP Local
// Serve os arquivos via localhost para habilitar APIs modernas
// + Endpoint POST /salvar para gravar direto na pasta da loteria
// ═══════════════════════════════════════════════════════════════

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8777;
const ROOT = __dirname;

// ── Descobrir Área de Trabalho real (funciona com OneDrive) ──
function getDesktopPath() {
    // Tentar caminhos comuns do OneDrive primeiro
    const userProfile = os.homedir();
    const candidates = [
        path.join(userProfile, 'OneDrive', 'Documents', 'OneDrive', 'Desktop'),
        path.join(userProfile, 'OneDrive', 'Desktop'),
        path.join(userProfile, 'OneDrive', 'Área de Trabalho'),
        path.join(userProfile, 'Desktop'),
        path.join(userProfile, 'Área de Trabalho'),
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return path.join(userProfile, 'Desktop');
}

const DESKTOP = getDesktopPath();
const SAVE_ROOT = path.join(DESKTOP, 'LOTERIAS JOGOS SALVOS');
console.log(`[B2B] Pasta de salvamento: ${SAVE_ROOT}`);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.ico':  'image/x-icon',
    '.svg':  'image/svg+xml',
    '.webp': 'image/webp',
    '.txt':  'text/plain; charset=utf-8',
    '.zip':  'application/zip',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
};

// Mapeamento de gameKey → nome da pasta
const FOLDER_MAP = {
    'megasena':   'Mega Sena',
    'lotofacil':  'LOTOFACIL',
    'quina':      'QUINA',
    'duplasena':  'Dupla Sena',
    'lotomania':  'LOTOMANIA',
    'timemania':  'TIMEMANIA',
    'diadesorte': 'DIA DE SORTE',
};

const server = http.createServer((req, res) => {

    // ═══════════════════════════════════════
    // POST /salvar — Salvar arquivo direto
    // ═══════════════════════════════════════
    if (req.method === 'POST' && req.url === '/salvar') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { gameKey, fileName, content } = data;

                if (!gameKey || !fileName || !content) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: 'Dados incompletos' }));
                    return;
                }

                // Determinar a pasta
                const folderName = FOLDER_MAP[gameKey] || gameKey;
                const folderPath = path.join(SAVE_ROOT, folderName);

                // Criar a pasta se não existir
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }

                // Salvar o arquivo
                const filePath = path.join(folderPath, fileName);
                fs.writeFileSync(filePath, content, 'utf-8');

                console.log(`[B2B] ✅ Salvo: ${filePath}`);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                });
                res.end(JSON.stringify({
                    ok: true,
                    path: filePath,
                    folder: folderPath,
                }));

            } catch (err) {
                console.error('[B2B] Erro ao salvar:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // ═══════════════════════════════════════
    // OPTIONS (CORS preflight)
    // ═══════════════════════════════════════
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end();
        return;
    }

    // ═══════════════════════════════════════
    // GET — Servir arquivos estáticos
    // ═══════════════════════════════════════
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(ROOT, urlPath);

    // Segurança: impedir traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Acesso negado');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Arquivo não encontrado: ' + urlPath);
            } else {
                res.writeHead(500);
                res.end('Erro interno');
            }
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';

        // HTML = sem cache (sempre busca versão nova)
        // JS/CSS = cache curto de 5 min (evita re-download constante)
        // Imagens = cache de 1 hora
        let cacheControl;
        if (ext === '.html') {
            cacheControl = 'no-cache, no-store, must-revalidate';
        } else if (ext === '.js' || ext === '.css') {
            cacheControl = 'public, max-age=300'; // 5 minutos
        } else {
            cacheControl = 'public, max-age=3600'; // 1 hora
        }

        res.writeHead(200, {
            'Content-Type': mime,
            'Cache-Control': cacheControl,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[B2B] Servidor rodando em http://localhost:${PORT}`);
    console.log(`[B2B] Salvando em: ${SAVE_ROOT}`);
});

// Manter o processo rodando silenciosamente
process.on('SIGINT', () => process.exit(0));
process.on('uncaughtException', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log('[B2B] Porta ' + PORT + ' já em uso — servidor já está rodando.');
        process.exit(0);
    }
});

// ═══════════════════════════════════════════════════════════════
// B2B Loterias — Mini Servidor HTTP Local
// Serve os arquivos via localhost para habilitar APIs modernas
// (File System Access, Service Workers, Clipboard, etc.)
// ═══════════════════════════════════════════════════════════════

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8777;
const ROOT = __dirname;

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

const server = http.createServer((req, res) => {
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

        res.writeHead(200, {
            'Content-Type': mime,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[B2B] Servidor rodando em http://localhost:${PORT}`);
});

// Manter o processo rodando silenciosamente
process.on('SIGINT', () => process.exit(0));
process.on('uncaughtException', (e) => {
    if (e.code === 'EADDRINUSE') {
        // Porta já em uso — outro servidor já está rodando, OK
        console.log('[B2B] Porta ' + PORT + ' já em uso — servidor já está rodando.');
        process.exit(0);
    }
});

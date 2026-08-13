# server.ps1 - PowerShell HTTP Server for B2B Loterias
# Serves static files and handles API endpoints on http://localhost:8777/

$port = 8777
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Pasta de jogos salvos
$desktop = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'LOTERIAS JOGOS SALVOS L99')
if (-not (Test-Path $desktop)) {
    New-Item -ItemType Directory -Path $desktop -Force | Out-Null
}

$pastaPorJogo = @{
    "megasena" = "MEGASENA"
    "lotofacil" = "LOTOFACIL"
    "quina" = "QUINA"
    "duplasena" = "DUPLASENA"
    "lotomania" = "LOTOMANIA"
    "timemania" = "TIMEMANIA"
    "diadesorte" = "DIA DE SORTE"
}

# Garantir subpastas
foreach ($sp in $pastaPorJogo.Values) {
    $dir = Join-Path $desktop $sp
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".txt"  = "text/plain; charset=utf-8"
}

# Iniciar Listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
} catch {
    # Se a porta já estiver em uso, sair silenciosamente
    Write-Host "Porta $port ja em uso - servidor ativo."
    exit 0
}
Write-Host "Servidor B2B Loterias rodando em http://localhost:$port/"

# Função para enviar resposta JSON
function Send-Json($context, $obj, $statusCode = 200) {
    $res = $context.Response
    $res.StatusCode = $statusCode
    $res.ContentType = "application/json; charset=utf-8"
    $res.Headers.Add("Access-Control-Allow-Origin", "*")
    $res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
    
    $json = ConvertTo-Json -InputObject $obj -Depth 10
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
    $res.ContentLength64 = $buffer.Length
    $res.OutputStream.Write($buffer, 0, $buffer.Length)
    $res.Close()
}

# Função para enviar resposta estática
function Send-File($context, $filePath) {
    $res = $context.Response
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    $mime = $mimeTypes[$ext]
    if (-not $mime) { $mime = "application/octet-stream" }
    
    $res.StatusCode = 200
    $res.ContentType = $mime
    $res.Headers.Add("Access-Control-Allow-Origin", "*")
    
    # v16.2: Adicionar cabecalhos de controle de cache para evitar cache persistente de HTML/JS pelo navegador
    $res.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
    $res.Headers.Add("Pragma", "no-cache")
    $res.Headers.Add("Expires", "0")
    
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.Close()
}

# Loop principal
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        # CORS OPTIONS
        if ($req.HttpMethod -eq "OPTIONS") {
            $res.StatusCode = 204
            $res.Headers.Add("Access-Control-Allow-Origin", "*")
            $res.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
            $res.Close()
            continue
        }
        
        # Parse body helper
        $body = ""
        if ($req.HasEntityBody) {
            $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
        }
        
        $url = $req.Url.LocalPath
        
        # ROTA /salvar
        if ($req.HttpMethod -eq "POST" -and $url -eq "/salvar") {
            $data = ConvertFrom-Json $body
            $gameKey = $data.gameKey
            $fileName = $data.fileName
            $content = $data.content
            
            $subPasta = $pastaPorJogo[$gameKey]
            if (-not $subPasta) { $subPasta = $gameKey.ToUpper() }
            
            $safeFileName = $fileName -replace '[<>:"/\\|?*]', '_'
            $gameDir = Join-Path $desktop $subPasta
            if (-not (Test-Path $gameDir)) {
                New-Item -ItemType Directory -Path $gameDir -Force | Out-Null
            }
            
            $filePath = Join-Path $gameDir $safeFileName
            [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
            
            $respObj = @{
                "ok" = $true
                "path" = $filePath
                "relativePath" = "LOTERIAS JOGOS SALVOS L99\$subPasta\$safeFileName"
            }
            Send-Json $context $respObj
            continue
        }
        
        # ROTA /pasta-jogos
        if ($req.HttpMethod -eq "GET" -and $url -eq "/pasta-jogos") {
            Send-Json $context @{ "path" = $desktop }
            continue
        }
        
        # ROTA /listar-jogos
        if ($req.HttpMethod -eq "GET" -and $url -eq "/listar-jogos") {
            $gameKey = $req.QueryString["gameKey"]
            $subPasta = $pastaPorJogo[$gameKey]
            $targetDir = if ($subPasta) { Join-Path $desktop $subPasta } else { $desktop }
            
            if (-not (Test-Path $targetDir)) {
                Send-Json $context @{ "ok" = $true; "files" = @(); "path" = $targetDir }
                continue
            }
            
            $files = Get-ChildItem -Path $targetDir -Filter "*.txt" | ForEach-Object {
                @{
                    "name" = $_.Name
                    "size" = $_.Length
                    "modified" = $_.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                }
            }
            
            # Formatar para array se houver apenas 1 elemento
            if ($files -and $files -isnot [array]) {
                $files = @($files)
            }
            if (-not $files) { $files = @() }
            
            $files = $files | Sort-Object { $_.modified } -Descending
            
            Send-Json $context @{ "ok" = $true; "files" = $files; "path" = $targetDir }
            continue
        }
        
        # ROTA /ler-jogo
        if ($req.HttpMethod -eq "POST" -and $url -eq "/ler-jogo") {
            $data = ConvertFrom-Json $body
            $gameKey = $data.gameKey
            $fileName = $data.fileName
            
            $safeFileName = [System.IO.Path]::GetFileName($fileName)
            $subPasta = $pastaPorJogo[$gameKey]
            $targetDir = if ($subPasta) { Join-Path $desktop $subPasta } else { $desktop }
            $filePath = Join-Path $targetDir $safeFileName
            
            if (-not (Test-Path $filePath)) {
                Send-Json $context @{ "ok" = $false; "error" = "Arquivo nao encontrado" } 404
                continue
            }
            
            $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
            Send-Json $context @{ "ok" = $true; "content" = $content; "fileName" = $fileName }
            continue
        }
        
        # ROTA /salvar-conferencia
        if ($req.HttpMethod -eq "POST" -and $url -eq "/salvar-conferencia") {
            $data = ConvertFrom-Json $body
            $gameKey = $data.gameKey
            $content = $data.content
            $concurso = if ($data.concurso) { $data.concurso } else { "sem-concurso" }
            
            $subPasta = $pastaPorJogo[$gameKey]
            $targetDir = if ($subPasta) { Join-Path $desktop $subPasta } else { $desktop }
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            $now = Get-Date
            $dateStr = $now.ToString("yyyy-MM-dd")
            $timeStr = $now.ToString("HH-mm-ss")
            $fileName = "✅CONFERIDO_$([string]$subPasta.ToUpper())_Concurso_$($concurso)_$($dateStr)_$($timeStr).txt"
            $filePath = Join-Path $targetDir $fileName
            
            [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
            Send-Json $context @{ "ok" = $true; "path" = $filePath; "fileName" = $fileName }
            continue
        }
        
        # ROTA /marcar-conferido
        if ($req.HttpMethod -eq "POST" -and $url -eq "/marcar-conferido") {
            $data = ConvertFrom-Json $body
            $gameKey = $data.gameKey
            $fileName = $data.fileName
            
            $safeFileName = [System.IO.Path]::GetFileName($fileName)
            $subPasta = $pastaPorJogo[$gameKey]
            $targetDir = if ($subPasta) { Join-Path $desktop $subPasta } else { $desktop }
            $oldPath = Join-Path $targetDir $safeFileName
            
            if (-not (Test-Path $oldPath)) {
                Send-Json $context @{ "ok" = $false; "error" = "Arquivo nao encontrado" } 404
                continue
            }
            
            if ($safeFileName.StartsWith("✅")) {
                Send-Json $context @{ "ok" = $true; "already" = $true; "fileName" = $safeFileName }
                continue
            }
            
            $newName = "✅CONFERIDO_" + $safeFileName
            $newPath = Join-Path $targetDir $newName
            Rename-Item -Path $oldPath -NewName $newName -Force
            
            Send-Json $context @{ "ok" = $true; "oldName" = $fileName; "newName" = $newName }
            continue
        }
        
        # ROTA /gerar-zip
        if ($url -eq "/gerar-zip") {
            $res.StatusCode = 302
            $res.Headers.Add("Location", "https://github.com/luissaviobrun17-alt/loterias-caixa/archive/refs/heads/main.zip")
            $res.Close()
            continue
        }
        
        # SERVIR ARQUIVOS ESTÁTICOS
        $pathName = $url
        if ($pathName -eq "/" -or $pathName -eq "") {
            $pathName = "/index.html"
        }
        
        # Segurança contra path traversal
        $normalizedPath = $pathName.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        if ($normalizedPath.StartsWith([System.IO.Path]::DirectorySeparatorChar)) {
            $normalizedPath = $normalizedPath.Substring(1)
        }
        $filePath = Join-Path $root $normalizedPath
        
        if ((Test-Path $filePath) -and -not (Test-Path -Path $filePath -PathType Container)) {
            Send-File $context $filePath
        } else {
            # Fallback para index.html
            $fallback = Join-Path $root "index.html"
            if (Test-Path $fallback) {
                Send-File $context $fallback
            } else {
                $res.StatusCode = 404
                $res.Close()
            }
        }
        
    } catch {
        Write-Error $_.Exception.Message
        if ($context) {
            try {
                Send-Json $context @{ "ok" = $false; "error" = $_.Exception.Message } 500
            } catch {}
        }
    }
}

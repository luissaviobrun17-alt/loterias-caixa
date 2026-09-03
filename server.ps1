# server.ps1 - PowerShell HTTP Server for B2B Loterias
# Serves static files and handles API endpoints on http://localhost:8777/
# v2.1 — Multi-desktop mirroring, anti-collision, and auto-sync

$port = 8777
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Detectar TODOS os desktops
$candidatos = @(
    [System.IO.Path]::Combine($env:USERPROFILE, 'Desktop'),
    [System.IO.Path]::Combine($env:USERPROFILE, 'OneDrive', 'Desktop'),
    [System.IO.Path]::Combine($env:USERPROFILE, 'OneDrive', 'Área de Trabalho'),
    [System.IO.Path]::Combine($env:USERPROFILE, 'Área de Trabalho'),
    [System.IO.Path]::Combine($env:USERPROFILE, 'OneDrive', 'Documents', 'OneDrive', 'Desktop')
)

$desktopPaths = @()
foreach ($c in $candidatos) {
    if ((Test-Path $c) -and ($desktopPaths -notcontains $c)) {
        $desktopPaths += $c
    }
}
if ($desktopPaths.Count -eq 0) {
    $desktopPaths = @([System.IO.Path]::Combine($env:USERPROFILE, 'Desktop'))
}

$desktop = [System.IO.Path]::Combine($desktopPaths[0], 'LOTERIAS JOGOS SALVOS L99')
$allJogosDirs = @()
foreach ($dp in $desktopPaths) {
    $allJogosDirs += [System.IO.Path]::Combine($dp, 'LOTERIAS JOGOS SALVOS L99')
}

$pastaPorJogo = @{
    "megasena" = "MEGASENA"
    "lotofacil" = "LOTOFACIL"
    "quina" = "QUINA"
    "duplasena" = "DUPLASENA"
    "lotomania" = "LOTOMANIA"
    "timemania" = "TIMEMANIA"
    "diadesorte" = "DIA DE SORTE"
    "milionaria" = "MILIONARIA"
    "maismilionaria" = "MILIONARIA"
}

function Get-CandidateSubPastas($key) {
    $k = if ($key) { $key.ToLower().Trim() } else { "" }
    if ($k -eq "milionaria" -or $k -eq "maismilionaria" -or $k -eq "+milionaria") {
        return @("MILIONARIA", "+MILIONARIA", "+MILIONÁRIA")
    }
    if ($k -eq "diadesorte" -or $k -eq "dia de sorte") {
        return @("DIA DE SORTE", "DIADESORTE")
    }
    $primary = $pastaPorJogo[$k]
    if (-not $primary -and $k) { $primary = $k.ToUpper() }
    if ($primary) { return @($primary) }
    return @()
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

# Iniciar Listener IMEDIATAMENTE na inicializacao (sem atraso de pastas)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
} catch {}

try {
    $listener.Start()
} catch {
    Write-Host "Porta $port ja em uso - servidor ativo."
    exit 0
}
Write-Host "Servidor B2B Loterias rodando em http://localhost:$port/"

# Garantir subpastas em todos os caminhos
$allSubPastasToEnsure = @($pastaPorJogo.Values) + @("+MILIONARIA")
foreach ($baseDir in $allJogosDirs) {
    if (-not (Test-Path $baseDir)) { New-Item -ItemType Directory -Path $baseDir -Force | Out-Null }
    foreach ($sp in $allSubPastasToEnsure) {
        $dir = Join-Path $baseDir $sp
        if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    }
}

# Sincronizacao de arquivos entre todos os desktops
function Sync-DesktopDirs {
    if ($allJogosDirs.Count -le 1) { return }
    $subPastasToSync = @($pastaPorJogo.Values) + @("+MILIONARIA") | Select-Object -Unique
    foreach ($sp in $subPastasToSync) {
        for ($i = 0; $i -lt $allJogosDirs.Count; $i++) {
            $srcDir = Join-Path $allJogosDirs[$i] $sp
            if (-not (Test-Path $srcDir)) { continue }
            $files = Get-ChildItem -Path $srcDir -Filter "*.txt" -File -ErrorAction SilentlyContinue
            foreach ($f in $files) {
                for ($j = 0; $j -lt $allJogosDirs.Count; $j++) {
                    if ($i -eq $j) { continue }
                    $dstDir = Join-Path $allJogosDirs[$j] $sp
                    if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
                    $dstFile = Join-Path $dstDir $f.Name
                    if (-not (Test-Path $dstFile)) {
                        Copy-Item -Path $f.FullName -Destination $dstFile -Force -ErrorAction SilentlyContinue
                    }
                }
            }
        }
    }
}
Sync-DesktopDirs

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
            
            $safeFileName = ($fileName -replace '[<>:"/\\|?*]', '_').Trim()
            if (-not $safeFileName.EndsWith('.txt')) { $safeFileName += '.txt' }
            
            $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($safeFileName)
            $finalFileName = $safeFileName
            $counter = 2
            
            # Anti-sobrescrita: se existir com conteúdo diferente, incrementa sufixo
            while ($true) {
                $collision = $false
                foreach ($baseDir in $allJogosDirs) {
                    $testPath = Join-Path (Join-Path $baseDir $subPasta) $finalFileName
                    if (Test-Path $testPath) {
                        try {
                            $existing = [System.IO.File]::ReadAllText($testPath, [System.Text.Encoding]::UTF8)
                            if ($existing.Trim() -ne $content.Trim()) {
                                $collision = $true
                                break
                            }
                        } catch {}
                    }
                }
                if ($collision) {
                    $finalFileName = "${nameWithoutExt}_${counter}.txt"
                    $counter++
                } else {
                    break
                }
            }
            
            $primaryFilePath = Join-Path (Join-Path $desktop $subPasta) $finalFileName
            
            # Gravar em todos os desktops
            foreach ($baseDir in $allJogosDirs) {
                $gameDir = Join-Path $baseDir $subPasta
                if (-not (Test-Path $gameDir)) {
                    New-Item -ItemType Directory -Path $gameDir -Force | Out-Null
                }
                $filePath = Join-Path $gameDir $finalFileName
                [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
            }
            
            $respObj = @{
                "ok" = $true
                "path" = $primaryFilePath
                "fileName" = $finalFileName
                "relativePath" = "LOTERIAS JOGOS SALVOS L99\$subPasta\$finalFileName"
            }
            Send-Json $context $respObj
            continue
        }
        
        # ROTA /pasta-jogos
        if ($req.HttpMethod -eq "GET" -and $url -eq "/pasta-jogos") {
            Send-Json $context @{ "path" = $desktop; "allPaths" = $allJogosDirs }
            continue
        }
        
        # ROTA /listar-jogos
        if ($req.HttpMethod -eq "GET" -and $url -eq "/listar-jogos") {
            $gameKey = $req.QueryString["gameKey"]
            $candidateSubPastas = Get-CandidateSubPastas $gameKey
            $primarySubPasta = if ($candidateSubPastas.Count -gt 0) { $candidateSubPastas[0] } else { "" }
            $targetDir = if ($primarySubPasta) { Join-Path $desktop $primarySubPasta } else { $desktop }
            
            Sync-DesktopDirs
            
            $fileDict = @{}
            foreach ($baseDir in $allJogosDirs) {
                $subPastasToScan = if ($candidateSubPastas.Count -gt 0) { $candidateSubPastas } else { @("") }
                foreach ($sp in $subPastasToScan) {
                    $dir = if ($sp) { Join-Path $baseDir $sp } else { $baseDir }
                    if (Test-Path $dir) {
                        Get-ChildItem -Path $dir -Filter "*.txt" -File -ErrorAction SilentlyContinue | ForEach-Object {
                            if (-not $fileDict.ContainsKey($_.Name) -or $_.LastWriteTime -gt $fileDict[$_.Name].LastWriteTime) {
                                $fileDict[$_.Name] = @{
                                    "name" = $_.Name
                                    "size" = $_.Length
                                    "modified" = $_.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                                    "LastWriteTime" = $_.LastWriteTime
                                }
                            }
                        }
                    }
                }
            }
            
            $files = @($fileDict.Values | Sort-Object { $_.LastWriteTime } -Descending | ForEach-Object {
                @{
                    "name" = $_.name
                    "size" = $_.size
                    "modified" = $_.modified
                }
            })
            
            Send-Json $context @{ "ok" = $true; "files" = $files; "path" = $targetDir }
            continue
        }
        
        # ROTA /ler-jogo
        if ($req.HttpMethod -eq "POST" -and $url -eq "/ler-jogo") {
            $data = ConvertFrom-Json $body
            $gameKey = $data.gameKey
            $fileName = $data.fileName
            
            $safeFileName = [System.IO.Path]::GetFileName($fileName)
            $candidateSubPastas = Get-CandidateSubPastas $gameKey
            $subPastasToSearch = if ($candidateSubPastas.Count -gt 0) { $candidateSubPastas } else { @("") }
            
            $content = $null
            foreach ($baseDir in $allJogosDirs) {
                foreach ($sp in $subPastasToSearch) {
                    $dir = if ($sp) { Join-Path $baseDir $sp } else { $baseDir }
                    $filePath = Join-Path $dir $safeFileName
                    if (Test-Path $filePath) {
                        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
                        break
                    }
                }
                if ($null -ne $content) { break }
            }
            
            if ($null -eq $content) {
                Send-Json $context @{ "ok" = $false; "error" = "Arquivo nao encontrado" } 404
                continue
            }
            
            Send-Json $context @{ "ok" = $true; "content" = $content; "fileName" = $fileName }
            continue
        }
        
        # ROTA /salvar-conferencia
        if ($req.HttpMethod -eq "POST" -and $url -eq "/salvar-conferencia") {
            $data = ConvertFrom-Json $body
            $gameKey = $data.gameKey
            $content = $data.content
            $concurso = if ($data.concurso) { $data.concurso } else { "sem-concurso" }
            
            $candidateSubPastas = Get-CandidateSubPastas $gameKey
            $subPasta = if ($candidateSubPastas.Count -gt 0) { $candidateSubPastas[0] } else { if ($gameKey) { $gameKey.ToUpper() } else { "" } }
            $now = Get-Date
            $dateStr = $now.ToString("yyyy-MM-dd")
            $timeStr = $now.ToString("HH-mm-ss")
            $fileName = "✅CONFERIDO_$([string]$subPasta.ToUpper())_Concurso_$($concurso)_$($dateStr)_$($timeStr).txt"
            
            $primaryPath = ""
            foreach ($baseDir in $allJogosDirs) {
                $targetDir = if ($subPasta) { Join-Path $baseDir $subPasta } else { $baseDir }
                if (-not (Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                }
                $filePath = Join-Path $targetDir $fileName
                [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
                if (-not $primaryPath) { $primaryPath = $filePath }
            }
            
            Send-Json $context @{ "ok" = $true; "path" = $primaryPath; "fileName" = $fileName }
            continue
        }
        
        # ROTA /marcar-conferido
        if ($req.HttpMethod -eq "POST" -and $url -eq "/marcar-conferido") {
            $data = ConvertFrom-Json $body
            $gameKey = $data.gameKey
            $fileName = $data.fileName
            
            $safeFileName = [System.IO.Path]::GetFileName($fileName)
            $candidateSubPastas = Get-CandidateSubPastas $gameKey
            $subPastasToSearch = if ($candidateSubPastas.Count -gt 0) { $candidateSubPastas } else { @("") }
            
            if ($safeFileName.StartsWith("✅")) {
                Send-Json $context @{ "ok" = $true; "already" = $true; "fileName" = $safeFileName }
                continue
            }
            
            $newName = "✅CONFERIDO_" + $safeFileName
            foreach ($baseDir in $allJogosDirs) {
                foreach ($sp in $subPastasToSearch) {
                    $targetDir = if ($sp) { Join-Path $baseDir $sp } else { $baseDir }
                    $oldPath = Join-Path $targetDir $safeFileName
                    $newPath = Join-Path $targetDir $newName
                    if (Test-Path $oldPath) {
                        Rename-Item -Path $oldPath -NewName $newName -Force
                    }
                }
            }
            
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
        
        $normalizedPath = $pathName.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        if ($normalizedPath.StartsWith([System.IO.Path]::DirectorySeparatorChar)) {
            $normalizedPath = $normalizedPath.Substring(1)
        }
        $filePath = Join-Path $root $normalizedPath
        
        if ((Test-Path $filePath) -and -not (Test-Path -Path $filePath -PathType Container)) {
            Send-File $context $filePath
        } else {
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

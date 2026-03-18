# ============================================
# GERAR VERSÃO MOBILE - B2B Loterias
# ============================================
# Este script gera um arquivo HTML auto-contido
# que pode ser aberto em qualquer celular,
# sem necessidade de servidor ou arquivos extras.
# ============================================

$ErrorActionPreference = "Stop"
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputFile = Join-Path $baseDir "B2B_Loterias_Mobile.html"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  B2B Loterias - Gerador Versao Mobile  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Ler o HTML original
Write-Host "[1/5] Lendo HTML original..." -ForegroundColor Yellow
$htmlContent = Get-Content -Path (Join-Path $baseDir "index.html") -Raw -Encoding UTF8

# 2. Converter logo para Base64
Write-Host "[2/5] Convertendo logo para Base64..." -ForegroundColor Yellow
$logoPath = Join-Path $baseDir "img\logo_atom.png"
if (Test-Path $logoPath) {
    $logoBytes = [System.IO.File]::ReadAllBytes($logoPath)
    $logoBase64 = [System.Convert]::ToBase64String($logoBytes)
    $logoDataUri = "data:image/png;base64,$logoBase64"
    # Substituir referência da imagem
    $htmlContent = $htmlContent -replace 'src="img/logo_atom\.png"', "src=`"$logoDataUri`""
    Write-Host "   Logo convertido ($(($logoBytes.Length / 1024).ToString('N0')) KB)" -ForegroundColor Green
} else {
    Write-Host "   Logo nao encontrado, pulando..." -ForegroundColor Red
}

# 3. Substituir CSS externos por inline
Write-Host "[3/5] Embutindo CSS..." -ForegroundColor Yellow
$cssFiles = @(
    "styles/main.css",
    "styles/components.css",
    "styles/lottery.css",
    "styles/responsive.css"
)

foreach ($cssFile in $cssFiles) {
    $cssPath = Join-Path $baseDir $cssFile
    if (Test-Path $cssPath) {
        $cssContent = Get-Content -Path $cssPath -Raw -Encoding UTF8
        # Remover referências a imagens de background externas (header-studio-bg.png)
        $cssContent = $cssContent -replace "url\('\.\./img/header-studio-bg\.png'\)", "url('')"
        $cssContent = $cssContent -replace 'url\("\.\./img/header-studio-bg\.png"\)', "url('')"
        
        $styleBlock = "<style>/* $cssFile */`n$cssContent</style>"
        
        # Encontrar e substituir a tag link correspondente
        $pattern = '<link\s+rel="stylesheet"\s+href="' + [regex]::Escape($cssFile).Replace("\\", "[/\\\\]") + '[^"]*"\s*>'
        # Tentar padrões diferentes
        $basename = [System.IO.Path]::GetFileName($cssFile)
        $htmlContent = $htmlContent -replace "<link[^>]*$basename[^>]*>", $styleBlock
        
        Write-Host "   Embutido: $cssFile" -ForegroundColor Green
    } else {
        Write-Host "   Nao encontrado: $cssFile" -ForegroundColor Red
    }
}

# 4. Substituir JS externos por inline
Write-Host "[4/5] Embutindo JavaScript..." -ForegroundColor Yellow
$jsFiles = @(
    @{ path = "js/engines/games.js"; pattern = 'games\.js' },
    @{ path = "js/data/history_db.js"; pattern = 'history_db\.js' },
    @{ path = "js/stats.js"; pattern = 'stats\.js' },
    @{ path = "js/engines/combinations.js"; pattern = 'combinations\.js' },
    @{ path = "js/engines/quantum.js"; pattern = 'quantum\.js"' },
    @{ path = "js/engines/quantum_god_mode.js"; pattern = 'quantum_god_mode\.js' },
    @{ path = "js/ui.js"; pattern = 'ui\.js' },
    @{ path = "js/main.js"; pattern = 'main\.js' },
    @{ path = "js/license.js"; pattern = 'license\.js' }
)

foreach ($jsInfo in $jsFiles) {
    $jsPath = Join-Path $baseDir $jsInfo.path
    if (Test-Path $jsPath) {
        $jsContent = Get-Content -Path $jsPath -Raw -Encoding UTF8
        $scriptBlock = "<script>/* $($jsInfo.path) */`n$jsContent</script>"
        
        $htmlContent = $htmlContent -replace "<script[^>]*$($jsInfo.pattern)[^>]*></script>", $scriptBlock
        
        Write-Host "   Embutido: $($jsInfo.path)" -ForegroundColor Green
    } else {
        Write-Host "   Nao encontrado: $($jsInfo.path)" -ForegroundColor Red
    }
}

# 5. Salvar o arquivo final
Write-Host "[5/6] Salvando arquivo mobile..." -ForegroundColor Yellow
[System.IO.File]::WriteAllText($outputFile, $htmlContent, [System.Text.Encoding]::UTF8)

$fileSize = (Get-Item $outputFile).Length
$fileSizeKB = [math]::Round($fileSize / 1024, 1)
$fileSizeMB = [math]::Round($fileSize / 1048576, 2)

# 6. Criar ZIP para envio (WhatsApp/iMessage corrompe HTML)
Write-Host "[6/6] Criando ZIP para envio..." -ForegroundColor Yellow
$zipFile = Join-Path $baseDir "B2B_Loterias_Mobile.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
$filesToZip = @($outputFile)
$leiaMe = Join-Path $baseDir "LEIA-ME_MOBILE.txt"
if (Test-Path $leiaMe) { $filesToZip += $leiaMe }
Compress-Archive -Path $filesToZip -DestinationPath $zipFile -Force
$zipSize = (Get-Item $zipFile).Length
$zipSizeKB = [math]::Round($zipSize / 1024, 1)
Write-Host "   ZIP criado: ${zipSizeKB} KB" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Arquivos gerados:" -ForegroundColor White
Write-Host "  HTML: B2B_Loterias_Mobile.html (${fileSizeMB} MB)" -ForegroundColor Cyan
Write-Host "  ZIP:  B2B_Loterias_Mobile.zip  (${zipSizeKB} KB)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  COMO ENVIAR PARA O CELULAR:" -ForegroundColor Yellow
Write-Host "  1. Envie o arquivo ZIP (nao o HTML!)" -ForegroundColor White
Write-Host "     via WhatsApp, Email, Google Drive, etc." -ForegroundColor White
Write-Host "  2. No celular, descompacte o ZIP" -ForegroundColor White
Write-Host "  3. Abra o HTML no navegador (Safari/Chrome)" -ForegroundColor White
Write-Host ""
Write-Host "  IMPORTANTE: Envie o .ZIP, nao o .HTML!" -ForegroundColor Red
Write-Host "  O WhatsApp e iMessage corrompem arquivos HTML." -ForegroundColor Red
Write-Host ""
Write-Host "========================================" -ForegroundColor Green

# Abrir a pasta no Explorer (selecionar o ZIP)
Start-Process explorer.exe -ArgumentList "/select, `"$zipFile`""

Read-Host "Pressione ENTER para fechar"

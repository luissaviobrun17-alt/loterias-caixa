# =====================================================
# GERADOR DE LICENÇA PARA CLIENTES
# B2B Loterias - Uso exclusivo do proprietário
# =====================================================
# Execute este script na SUA máquina (LUISB2B)
# quando um cliente comprar o programa.
#
# O cliente deve informar o nome do computador dele.
# =====================================================

Write-Host ""
Write-Host "=========================================="
Write-Host "  B2B LOTERIAS - GERADOR DE LICENCA"
Write-Host "  Uso exclusivo do proprietario"
Write-Host "=========================================="
Write-Host ""

# Verificar se está na máquina mestre
if ($env:COMPUTERNAME -ne "LUISB2B") {
    Write-Host "ERRO: Este script só pode ser executado na máquina mestre (LUISB2B)!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

# Pedir dados do cliente
$nomeCliente = Read-Host "  Nome do cliente"
$computadorCliente = Read-Host "  Nome do computador do cliente"
$emailCliente = Read-Host "  Email do cliente (opcional)"
$telefoneCliente = Read-Host "  Telefone/WhatsApp (opcional)"

if ([string]::IsNullOrWhiteSpace($nomeCliente) -or [string]::IsNullOrWhiteSpace($computadorCliente)) {
    Write-Host ""
    Write-Host "ERRO: Nome e computador são obrigatórios!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

# Gerar chave de licença
$secret = "B2B-LOTERIAS-2026-PREMIUM"
$raw = "$computadorCliente|$nomeCliente|$secret"
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hash = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($raw))
$keyHex = [System.BitConverter]::ToString($hash).Replace("-", "").Substring(0, 20)
$chave = $keyHex.Substring(0,5) + "-" + $keyHex.Substring(5,5) + "-" + $keyHex.Substring(10,5) + "-" + $keyHex.Substring(15,5)

# Criar pasta do cliente
$clienteDir = Join-Path $PSScriptRoot "licencas_clientes"
if (-not (Test-Path $clienteDir)) { New-Item -ItemType Directory -Path $clienteDir -Force | Out-Null }

$clienteSubDir = Join-Path $clienteDir ($computadorCliente.ToUpper() + "_" + (Get-Date -Format "yyyyMMdd"))
if (-not (Test-Path $clienteSubDir)) { New-Item -ItemType Directory -Path $clienteSubDir -Force | Out-Null }

# Gerar licenca.key para o cliente
$licencaPath = Join-Path $clienteSubDir "licenca.key"
$licencaContent = @"
[B2B LOTERIAS - LICENÇA]
MaquinaID=CLIENT
ChaveLicenca=$chave
DataAtivacao=$(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
Proprietario=$nomeCliente
Computador=$computadorCliente
Email=$emailCliente
Telefone=$telefoneCliente
Status=ATIVA
VendidoPor=LUISB2B
"@

Set-Content -Path $licencaPath -Value $licencaContent -Encoding UTF8

# Gerar license.js para o cliente
$jsPath = Join-Path $clienteSubDir "license.js"
$jsContent = @"
// Licença B2B Loterias - NÃO MODIFIQUE
var B2B_LICENSE = {
    machineId: 'CLIENT',
    key: '$chave',
    owner: '$nomeCliente',
    computer: '$computadorCliente',
    activated: '$(Get-Date -Format "dd/MM/yyyy")'
};
"@

Set-Content -Path $jsPath -Value $jsContent -Encoding UTF8

# Gerar instruções para o cliente
$instrPath = Join-Path $clienteSubDir "INSTRUCOES.txt"
$instrContent = @"
=============================================
  B2B LOTERIAS - INSTRUÇÕES DE ATIVAÇÃO
=============================================

Olá $nomeCliente!

Obrigado por adquirir o B2B Loterias!

PASSOS PARA ATIVAR:

1. Copie o arquivo "licenca.key" para a pasta
   principal do programa (mesma pasta do index.html)

2. Copie o arquivo "license.js" para a pasta
   "js\" dentro do programa

3. Abra o programa pelo atalho na área de trabalho

4. A senha de acesso é: 130767

IMPORTANTE:
- Esta licença funciona APENAS no computador: $computadorCliente
- NÃO compartilhe estes arquivos com terceiros
- Cada licença é INDIVIDUAL e INTRANSFERÍVEL

Suporte: Entre em contato pelo WhatsApp
=============================================
"@

Set-Content -Path $instrPath -Value $instrContent -Encoding UTF8

Write-Host ""
Write-Host "=========================================="
Write-Host "  LICENÇA GERADA COM SUCESSO!" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""
Write-Host "  Cliente: $nomeCliente"
Write-Host "  Máquina: $computadorCliente"
Write-Host "  Chave: $chave"
Write-Host ""
Write-Host "  Arquivos salvos em:"
Write-Host "  $clienteSubDir"
Write-Host ""
Write-Host "  Envie ao cliente:"
Write-Host "  1. licenca.key (pasta raiz do programa)"
Write-Host "  2. license.js (pasta js\ do programa)"
Write-Host "  3. INSTRUCOES.txt"
Write-Host ""
Write-Host "=========================================="
Read-Host "Pressione Enter para sair"

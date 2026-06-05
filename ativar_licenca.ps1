# =====================================================
# Sistema de Licença - B2B Loterias
# Gera ID único da máquina e arquivo de licença
# =====================================================

# Coletar informações únicas da máquina
$computerName = $env:COMPUTERNAME
$userName = $env:USERNAME
$processorId = (Get-WmiObject Win32_Processor).ProcessorId
$diskSerial = (Get-WmiObject Win32_DiskDrive | Select-Object -First 1).SerialNumber
$motherboard = (Get-WmiObject Win32_BaseBoard).SerialNumber
$macAddress = (Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -First 1).MacAddress

# Criar fingerprint único
$rawFingerprint = "$computerName|$userName|$processorId|$diskSerial|$motherboard|$macAddress"

# Gerar hash SHA256 do fingerprint
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($rawFingerprint)
$hash = $sha256.ComputeHash($bytes)
$machineId = [System.BitConverter]::ToString($hash).Replace("-", "").Substring(0, 16)

# Gerar chave de licença baseada no machineId + segredo
$secret = "B2B-LOTERIAS-2026-PREMIUM"
$licenseRaw = "$machineId|$secret"
$licenseBytes = [System.Text.Encoding]::UTF8.GetBytes($licenseRaw)
$licenseHash = $sha256.ComputeHash($licenseBytes)
$licenseKey = [System.BitConverter]::ToString($licenseHash).Replace("-", "").Substring(0, 20)

# Formatar chave: XXXXX-XXXXX-XXXXX-XXXXX
$formattedKey = $licenseKey.Substring(0,5) + "-" + $licenseKey.Substring(5,5) + "-" + $licenseKey.Substring(10,5) + "-" + $licenseKey.Substring(15,5)

# Criar arquivo de licença
$licenseDir = Split-Path $MyInvocation.MyCommand.Path
$licensePath = Join-Path $licenseDir "licenca.key"

$licenseContent = @"
[B2B LOTERIAS - LICENÇA]
MaquinaID=$machineId
ChaveLicenca=$formattedKey
DataAtivacao=$(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
Proprietario=$userName
Computador=$computerName
Status=ATIVA
"@

Set-Content -Path $licensePath -Value $licenseContent -Encoding UTF8

# Também criar um arquivo JS com o machineId para validação no navegador
$jsPath = Join-Path $licenseDir "js\license.js"
$jsContent = @"
// Sistema de Licença B2B Loterias - NÃO MODIFIQUE ESTE ARQUIVO
var B2B_LICENSE = {
    machineId: '$machineId',
    key: '$formattedKey',
    owner: '$userName',
    computer: '$computerName',
    activated: '$(Get-Date -Format "dd/MM/yyyy")'
};
"@

Set-Content -Path $jsPath -Value $jsContent -Encoding UTF8

Write-Host ""
Write-Host "=========================================="
Write-Host "  LICENÇA B2B LOTERIAS ATIVADA!"
Write-Host "=========================================="
Write-Host ""
Write-Host "  ID da Máquina: $machineId"
Write-Host "  Chave: $formattedKey"
Write-Host "  Proprietário: $userName"
Write-Host "  Computador: $computerName"
Write-Host ""
Write-Host "  Arquivo: $licensePath"
Write-Host "=========================================="
Write-Host ""

$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $Desktop 'Loterias da Caixa - Link.lnk'
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = 'wscript.exe'
$Shortcut.Arguments = '"C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa\AbrirLoterias.vbs"'
$Shortcut.Description = 'Gerador de Apostas - Loterias da Caixa (Protegido por Senha)'
$Shortcut.WorkingDirectory = 'C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa'

$ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (Test-Path $ChromePath) {
    $Shortcut.IconLocation = "$ChromePath,0"
}

$Shortcut.Save()
Write-Host 'Link criado com sucesso na area de trabalho!'

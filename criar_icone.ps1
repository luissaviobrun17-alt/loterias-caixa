Add-Type -AssemblyName System.Drawing

$imgPath = "C:\Users\luiss\.gemini\antigravity\brain\dab8db06-ef89-4274-9409-8eafcd3852b3\lottery_icon_1773410657833.png"
$icoPath = "C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa\loterias.ico"

$img = [System.Drawing.Image]::FromFile($imgPath)
$bmp = New-Object System.Drawing.Bitmap($img, 64, 64)
$icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
$fs = [System.IO.File]::Create($icoPath)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp.Dispose()
$img.Dispose()

# Atualizar atalhos com o novo icone
$Desktop = [Environment]::GetFolderPath('Desktop')
$WshShell = New-Object -ComObject WScript.Shell

$shortcuts = @('Loterias da Caixa.lnk', 'Loterias da Caixa - Link.lnk')
foreach ($name in $shortcuts) {
    $path = Join-Path $Desktop $name
    if (Test-Path $path) {
        $shortcut = $WshShell.CreateShortcut($path)
        $shortcut.IconLocation = "$icoPath,0"
        $shortcut.Save()
        Write-Host "Atualizado: $name"
    }
}

Write-Host 'Icone e atalhos atualizados com sucesso!'

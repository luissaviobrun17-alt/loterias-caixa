
$WScriptShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "B2B Loterias.lnk"
$Target = "c:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa\index.html"
$Icon = "C:\Windows\System32\shell32.dll,43"

$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $Target
$Shortcut.IconLocation = $Icon
$Shortcut.Save()

Write-Host "Shortcut created at $ShortcutPath"

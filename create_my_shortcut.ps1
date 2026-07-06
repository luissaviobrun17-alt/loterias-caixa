$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$s = $ws.CreateShortcut("$desktop\B2B Loterias.lnk")
$s.TargetPath = "C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa\INICIAR_B2B.bat"
$s.IconLocation = "C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa\loterias.ico"
$s.WorkingDirectory = "C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa"
$s.Save()

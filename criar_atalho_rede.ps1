$ws = New-Object -COM WScript.Shell
$lnk = $ws.CreateShortcut("C:\Users\luiss\OneDrive\Documents\OneDrive\Desktop\B2B Loterias REDE.lnk")
$lnk.TargetPath = "C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa\INICIAR_REDE.bat"
$lnk.WorkingDirectory = "C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa"
$lnk.IconLocation = "C:\Users\luiss\.gemini\antigravity\scratch\loterias-caixa\loterias.ico,0"
$lnk.Description = "B2B Loterias - Acesso pela Rede"
$lnk.Save()
Write-Output "Atalho criado com sucesso na Area de Trabalho!"

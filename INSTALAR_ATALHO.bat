@echo off
set "target=%~dp0INICIAR_B2B.bat"
set "shortcut=%USERPROFILE%\Desktop\B2B Loterias.lnk"
set "icon=%~dp0loterias.ico"
set "workdir=%~dp0"

echo Criando atalho na Area de Trabalho do novo computador...

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%shortcut%'); $s.TargetPath = '%target%'; $s.IconLocation = '%icon%'; $s.WorkingDirectory = '%workdir%'; $s.Save()"

echo.
echo Atalho B2B Loterias criado com sucesso na Area de Trabalho!
echo Agora e so dar dois cliques no novo atalho!
echo.
pause

@echo off
set "target=%~dp0index.html"
set "shortcut=%USERPROFILE%\Desktop\Loterias Caixa.lnk"
set "icon=%~dp0img\logo_v2.png"

echo Criando atalho na Area de Trabalho...

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%shortcut%'); $s.TargetPath = '%target%'; $s.IconLocation = '%icon%'; $s.Save()"

echo.
echo Atalho criado com sucesso!
echo Verifique sua Area de Trabalho.
echo.
pause

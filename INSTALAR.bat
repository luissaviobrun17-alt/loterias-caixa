@echo off
echo.
echo  ========================================
echo    B2B LOTERIAS - Instalador
echo  ========================================
echo.

set "PASTA=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"
set "ATALHO=%DESKTOP%\B2B Loterias.lnk"
set "ICONE=%PASTA%img\b2b_loterias.ico"

REM Detecta Chrome
set "CHROME="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

if "%CHROME%"=="" (
    echo  Chrome nao encontrado, usando navegador padrao...
    powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ATALHO%'); $s.TargetPath = '%PASTA%index.html'; $s.Description = 'B2B Loterias'; $s.IconLocation = '%ICONE%'; $s.Save()"
) else (
    echo  Chrome encontrado!
    powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ATALHO%'); $s.TargetPath = '%CHROME%'; $s.Arguments = '\"%PASTA%index.html\"'; $s.Description = 'B2B Loterias'; $s.IconLocation = '%ICONE%'; $s.Save()"
)

if exist "%ATALHO%" (
    echo.
    echo  [OK] Atalho criado no Desktop!
    echo  [OK] Abrira no Google Chrome!
) else (
    echo.
    echo  [ERRO] Falha ao criar atalho.
)

echo.
echo  Pressione qualquer tecla para fechar...
pause >nul

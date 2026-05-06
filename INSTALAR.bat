@echo off
echo.
echo  ========================================
echo    B2B LOTERIAS - Instalador
echo  ========================================
echo.

set "PASTA=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"

REM Detectar OneDrive Desktop
if exist "%USERPROFILE%\OneDrive\Desktop" set "DESKTOP=%USERPROFILE%\OneDrive\Desktop"
if exist "%USERPROFILE%\OneDrive\Área de Trabalho" set "DESKTOP=%USERPROFILE%\OneDrive\Área de Trabalho"

set "ATALHO=%DESKTOP%\B2B Loterias.lnk"
set "VBS=%PASTA%AbrirLoterias.vbs"
set "ICONE=%PASTA%loterias.ico"

REM Criar atalho apontando para AbrirLoterias.vbs (inicia servidor + abre Chrome)
echo  Criando atalho com servidor automatico...
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%ATALHO%'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%VBS%\"'; $s.WorkingDirectory = '%PASTA%'; $s.Description = 'B2B Loterias - Gerador Inteligente'; $s.IconLocation = '%ICONE%'; $s.Save()"

if exist "%ATALHO%" (
    echo.
    echo  [OK] Atalho criado no Desktop!
    echo  [OK] Inicia servidor + abre no Chrome automaticamente!
    echo.
    echo  Para abrir: duplo clique em "B2B Loterias" no Desktop
) else (
    echo.
    echo  [ERRO] Falha ao criar atalho.
    echo  Tente executar como Administrador.
)

echo.
echo  Pressione qualquer tecla para fechar...
pause >nul

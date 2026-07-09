@echo off
title B2B Loterias - Iniciando...
color 0A
cls

echo.
echo  =============================================
echo   B2B LOTERIAS - INICIANDO O SISTEMA
echo  =============================================
echo.

:: Verificar se Node.js está instalado (comando global ou pasta padrão)
where node >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    ) else (
        echo  ERRO: Node.js nao encontrado!
        echo  Baixe em: https://nodejs.org
        pause
        exit /b 1
    )
) else (
    set "NODE_EXE=node"
)

:: Matar servidor anterior se existir
echo  Verificando servidor anterior...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8777" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Iniciar servidor em background
echo  Iniciando servidor B2B Loterias...
start /B "" "%NODE_EXE%" "%~dp0server.js"

:: Aguardar servidor inicializar
timeout /t 2 /nobreak >nul

:: Verificar se iniciou
netstat -ano | findstr ":8777" | findstr "LISTEN" >nul
if %errorlevel% neq 0 (
    echo  Aguardando mais um momento...
    timeout /t 2 /nobreak >nul
)

:: Abrir browser como aplicativo desktop
echo  Abrindo B2B Loterias em Tela Cheia (Modo App)...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:8777" --start-maximized
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="http://localhost:8777" --start-maximized
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" --app="http://localhost:8777" --start-maximized
) else (
    start "" "http://localhost:8777"
)

echo.
echo  =============================================
echo   SERVIDOR RODANDO em http://localhost:8777
echo   Feche esta janela para PARAR o servidor
echo  =============================================
echo.
echo  Pressione qualquer tecla para PARAR o servidor...
pause >nul

:: Parar servidor ao fechar
echo  Parando servidor...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8777" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo  Servidor parado. Ate logo!
timeout /t 2 /nobreak >nul

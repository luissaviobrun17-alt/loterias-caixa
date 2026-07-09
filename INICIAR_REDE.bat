@echo off
chcp 65001 >nul
title B2B Loterias - Modo REDE
color 0A
cls

echo.
echo  =============================================
echo   B2B LOTERIAS - MODO REDE (Acesso Remoto)
echo  =============================================
echo.

:: Verificar se Node.js esta instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERRO: Node.js nao encontrado!
    echo  Baixe em: https://nodejs.org
    pause
    exit /b 1
)

:: Matar servidor anterior se existir
echo  Verificando servidor anterior...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8777" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Descobrir IP da rede local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set IP=%%a
)
:: Remover espaco no inicio
set IP=%IP: =%

:: Iniciar servidor em background
echo  Iniciando servidor B2B Loterias na rede...
start /B node "%~dp0server.js"

:: Aguardar servidor inicializar
timeout /t 3 /nobreak >nul

echo.
echo  =============================================
echo   SERVIDOR ATIVO - ACESSO PELA REDE
echo  =============================================
echo.
echo   No SEU computador:
echo     http://localhost:8777
echo.
echo   No OUTRO computador (copie este link):
echo     http://%IP%:8777
echo.
echo  =============================================
echo.

:: Abrir no browser local
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:8777" --start-maximized
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="http://localhost:8777" --start-maximized
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" --app="http://localhost:8777" --start-maximized
) else (
    start "" "http://localhost:8777"
)

echo  NAO FECHE ESTA JANELA!
echo  O outro computador so acessa enquanto esta janela estiver aberta.
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

@echo off
:: =====================================================================
:: B2B Loterias — Iniciador do Servidor (versao .bat)
:: Mais confiavel que VBS em alguns ambientes Windows
:: =====================================================================

set APP_DIR=C:\Users\luiss\Desktop\B2B_Loterias
set SERVER=%APP_DIR%\server.js
set NODE="C:\Program Files\nodejs\node.exe"

:: Verificar se servidor ja esta rodando
curl -s --connect-timeout 2 http://localhost:8777/ >nul 2>&1
if %errorlevel%==0 (
    echo [B2B] Servidor ja esta rodando em localhost:8777
    exit /b 0
)

:: Iniciar servidor em background
echo [B2B] Iniciando servidor...
start "" /min %NODE% "%SERVER%"

:: Aguardar o servidor subir (ate 15 segundos)
set /a tentativas=0
:aguardar
set /a tentativas=%tentativas%+1
if %tentativas% GTR 15 goto timeout_msg
timeout /t 1 /nobreak >nul
curl -s --connect-timeout 1 http://localhost:8777/ >nul 2>&1
if %errorlevel% NEQ 0 goto aguardar

echo [B2B] Servidor iniciado com sucesso!
exit /b 0

:timeout_msg
echo [B2B] Servidor demorou mas pode estar subindo ainda...
exit /b 0

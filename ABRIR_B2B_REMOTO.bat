@echo off
chcp 65001 >nul
title B2B Loterias - Abrindo...

:: === CONFIGURACAO ===
:: Altere o IP abaixo se necessario (IP do computador principal)
set SERVIDOR=http://192.168.2.53:8777

:: Tentar abrir Chrome no modo APP (sem barra de navegacao)
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="%SERVIDOR%" --start-maximized
    exit
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="%SERVIDOR%" --start-maximized
    exit
)
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" --app="%SERVIDOR%" --start-maximized
    exit
)

:: Tentar Edge no modo APP
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="%SERVIDOR%" --start-maximized
    exit
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="%SERVIDOR%" --start-maximized
    exit
)

:: Fallback - abre no navegador padrao
start "" "%SERVIDOR%"

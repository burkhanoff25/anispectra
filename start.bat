@echo off
title AI Agents Master Control - Anispectra
cls
echo =========================================
echo    AI AGENTS MASTER CONTROL PANEL (WINDOWS)
echo =========================================
echo [1] Next.js Web-saytini ishga tushirish (http://localhost:3000)
echo [2] Python Browser Agent Web UI ni ishga tushirish (http://localhost:7860)
echo [0] Chiqish
echo =========================================
set /p choice="Tanlang (1, 2 yoki 0): "

if "%choice%"=="1" (
    echo Next.js server ishga tushmoqda...
    cmd /c npm run dev
) else if "%choice%"=="2" (
    echo Python Browser Agent ishga tushmoqda...
    python scratch/browser_agent.py
) else (
    echo Chiqildi.
)
pause

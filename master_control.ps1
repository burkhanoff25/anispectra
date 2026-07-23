# AI AGENTS MASTER CONTROL PANEL (WINDOWS)
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "      AI AGENTS CONTROL PANEL (WINDOWS)  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "1. Anispectra Web-saytini ishga tushirish (http://localhost:3000)"
Write-Host "2. Python Browser-Use Web UI ni ishga tushirish (http://localhost:7860)"
Write-Host "0. Chiqish"
Write-Host ""

$pythonCmd = if (Test-Path ".\venv\Scripts\python.exe") {
    ".\venv\Scripts\python.exe"
} elseif (Get-Command "C:\Program Files\Python312\python.exe" -ErrorAction SilentlyContinue) {
    "C:\Program Files\Python312\python.exe"
} else {
    "python"
}

$choice = Read-Host "Tanlang (0-2)"

switch ($choice) {
    "1" {
        Write-Host "Next.js server ishga tushirilmoqda..." -ForegroundColor Green
        cmd /c npm run dev
    }
    "2" {
        Write-Host "Browser Agent ishga tushirilmoqda..." -ForegroundColor Green
        & $pythonCmd scratch/browser_agent.py
    }
    "0" {
        Write-Host "Chiqildi." -ForegroundColor Yellow
    }
    default {
        Write-Host "Noto'g'ri tanlov!" -ForegroundColor Red
    }
}

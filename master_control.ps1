# AI AGENTS MASTER CONTROL PANEL (WINDOWS)
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "      AI AGENTS CONTROL PANEL (WINDOWS)  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "1. Anispectra Web-saytini ishga tushirish (http://localhost:3000)"
Write-Host "2. Python Browser-Use Web UI ni ishga tushirish (http://localhost:7860)"
Write-Host "3. OpenHands Docker container ishga tushirish (Docker talab etiladi)"
Write-Host "0. Chiqish"
Write-Host ""

$choice = Read-Host "Tanlang (0-3)"

switch ($choice) {
    "1" {
        Write-Host "Next.js server ishga tushirilmoqda..." -ForegroundColor Green
        cmd /c npm run dev
    }
    "2" {
        Write-Host "Browser Agent ishga tushirilmoqda..." -ForegroundColor Green
        python scratch/browser_agent.py
    }
    "3" {
        Write-Host "OpenHands Docker container ishga tushirilmoqda..." -ForegroundColor Green
        docker run -it --rm -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.32-nikolaik -v "//var/run/docker.sock:/var/run/docker.sock" -p 3000:3000 docker.all-hands.dev/all-hands-ai/openhands:0.32
    }
    "0" {
        Write-Host "Chiqildi." -ForegroundColor Yellow
    }
    default {
        Write-Host "Noto'g'ri tanlov!" -ForegroundColor Red
    }
}

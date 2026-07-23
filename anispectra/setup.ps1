# ============================================
# AI AGENTS MASTER SETUP SCRIPT (Windows PowerShell)
# OpenHands + Hermes Agent + Browser Use
# ============================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   AI AGENTS WINDOWS INSTALLER v1.0      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. TIZIM TEKSHIRISH
Write-Host "[1/4] Tizim talablari tekshirilmoqda..." -ForegroundColor Yellow

# Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✓ Node.js mavjud: $(node -v)" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js topilmadi." -ForegroundColor Red
}

# Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "✓ Python mavjud: $(python --version)" -ForegroundColor Green
} else {
    Write-Host "⚠ Python o'rnatilmagan." -ForegroundColor Red
}

Write-Host ""

# 2. .ENV FAYLI YARATISH
Write-Host "[2/4] Sozlamalar fayli (.env) tekshirilmoqda..." -ForegroundColor Yellow

$envPath = ".\.env"
if (-not (Test-Path $envPath)) {
    $envContent = @"
# ============================================
# AI AGENTS SOZLAMALARI (WINDOWS)
# ============================================

ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
GOOGLE_API_KEY=

BROWSER_USE_HEADLESS=false
BROWSER_USE_TIMEOUT=60000

OPENHANDS_PORT=3000
LLM_MODEL=anthropic/claude-sonnet-4-6
"@
    Set-Content -Path $envPath -Value $envContent
    Write-Host "✓ .env fayli yaratildi!" -ForegroundColor Green
} else {
    Write-Host "✓ .env fayli allaqachon mavjud." -ForegroundColor Green
}

Write-Host ""

# 3. WINDOWS CONTROL SCRIPT (master_control.ps1) YARATISH
Write-Host "[3/4] Master Control script (master_control.ps1) yaratilmoqda..." -ForegroundColor Yellow

$controlScript = @"
# AI AGENTS MASTER CONTROL PANEL (WINDOWS)
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "      AI AGENTS CONTROL PANEL (WINDOWS)  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "1. Anispectra Web-saytini ishga tushirish (http://localhost:3000)"
Write-Host "2. Python Browser-Use Web UI ni ishga tushirish (http://localhost:7860)"
Write-Host "0. Chiqish"
Write-Host ""

`$choice = Read-Host "Tanlang (0-2)"

switch (`$choice) {
    "1" {
        Write-Host "Next.js server ishga tushirilmoqda..." -ForegroundColor Green
        cmd /c npm run dev
    }
    "2" {
        Write-Host "Browser Agent ishga tushirilmoqda..." -ForegroundColor Green
        python scratch/browser_agent.py
    }
    "0" {
        Write-Host "Xayr!" -ForegroundColor Yellow
    }
    default {
        Write-Host "Noto'g'ri tanlov!" -ForegroundColor Red
    }
}
"@

Set-Content -Path ".\master_control.ps1" -Value $controlScript
Write-Host "✓ master_control.ps1 yaratildi!" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   WINDOWS O'RNATISH TAYYOR!            " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

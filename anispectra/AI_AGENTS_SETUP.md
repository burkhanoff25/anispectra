# 🤖 AI Agents Master Setup Guide
## OpenHands + Hermes Agent + Browser Use

---

## 📊 3 TA TOOL TAHLILI

| Tool | Nima qiladi | Eng yaxshi tomoni |
|------|-------------|-------------------|
| **OpenHands** | AI coding agent — kod yozadi, tuzatadi, loyiha boshqaradi | Kod yozish, GitHub bilan ishlash |
| **Hermes Agent** | Personal AI agent — Telegram, Discord, CLI orqali ishlaydi | Ko'p platform, 400+ model |
| **Browser Use** | Brauzer avtomatlashtirish — saytlarda o'zi harakat qiladi | Web scraping, form to'ldirish |

---

## 🚀 BITTA COMMAND BILAN HAMMANI O'RNATISH

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/your-setup/install.sh)
```

Yoki quyidagi `setup.sh` faylini yaratib ishlatish:

```bash
chmod +x setup.sh && ./setup.sh
```

---

## 📁 setup.sh — MASTER INSTALL SCRIPT

```bash
#!/bin/bash
# ============================================
# AI AGENTS MASTER SETUP SCRIPT
# OpenHands + Hermes Agent + Browser Use
# ============================================

set -e  # Xato bo'lsa to'xta

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI AGENTS MASTER INSTALLER v1.0    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"

# ─────────────────────────────────────
# 1. TIZIM TALABLARINI TEKSHIRISH
# ─────────────────────────────────────
echo -e "\n${YELLOW}[1/6] Tizim tekshirilmoqda...${NC}"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 topilmadi — o'rnatilmoqda...${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 mavjud${NC}"
        return 0
    fi
}

# Python tekshirish
check_command python3 || {
    sudo apt-get update -qq && sudo apt-get install -y python3 python3-pip
}

# Node.js tekshirish
check_command node || {
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
}

# Git tekshirish
check_command git || sudo apt-get install -y git

# Docker tekshirish (OpenHands uchun)
check_command docker || {
    echo -e "${YELLOW}Docker o'rnatilmoqda...${NC}"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
}

# uv (Python package manager) o'rnatish
check_command uv || {
    echo -e "${YELLOW}uv o'rnatilmoqda...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env 2>/dev/null || true
    export PATH="$HOME/.local/bin:$PATH"
}

echo -e "${GREEN}✓ Barcha talablar bajarildi!${NC}"

# ─────────────────────────────────────
# 2. BROWSER USE O'RNATISH
# ─────────────────────────────────────
echo -e "\n${YELLOW}[2/6] Browser Use o'rnatilmoqda...${NC}"

pip3 install browser-use --break-system-packages 2>/dev/null || pip3 install browser-use

# Playwright brauzer o'rnatish
python3 -m playwright install chromium 2>/dev/null || {
    pip3 install playwright --break-system-packages
    python3 -m playwright install chromium
}

echo -e "${GREEN}✓ Browser Use o'rnatildi!${NC}"

# ─────────────────────────────────────
# 3. HERMES AGENT O'RNATISH
# ─────────────────────────────────────
echo -e "\n${YELLOW}[3/6] Hermes Agent o'rnatilmoqda...${NC}"

# uv orqali o'rnatish (rasmiy yo'l)
uv tool install hermes-agent 2>/dev/null || pip3 install hermes-agent --break-system-packages

echo -e "${GREEN}✓ Hermes Agent o'rnatildi!${NC}"

# ─────────────────────────────────────
# 4. OPENHANDS O'RNATISH
# ─────────────────────────────────────
echo -e "\n${YELLOW}[4/6] OpenHands o'rnatilmoqda...${NC}"

# Docker orqali (eng ishonchli yo'l)
docker pull docker.all-hands.dev/all-hands-ai/runtime:0.32-nikolaik 2>/dev/null || true

echo -e "${GREEN}✓ OpenHands tayyor!${NC}"

# ─────────────────────────────────────
# 5. .env FAYL YARATISH
# ─────────────────────────────────────
echo -e "\n${YELLOW}[5/6] Sozlamalar faylini yaratish...${NC}"

if [ ! -f ".env" ]; then
cat > .env << 'EOF'
# ============================================
# AI AGENTS — KALIT SO'ZLAR (API KEYS)
# ============================================

# Anthropic (Claude uchun — MAJBURIY)
ANTHROPIC_API_KEY=your_anthropic_key_here

# OpenAI (ixtiyoriy)
OPENAI_API_KEY=your_openai_key_here

# Browser Use sozlamalari
BROWSER_USE_HEADLESS=true
BROWSER_USE_TIMEOUT=30000

# OpenHands sozlamalari
OPENHANDS_MODEL=anthropic/claude-sonnet-4-6
OPENHANDS_PORT=3000

# Hermes Agent sozlamalari
HERMES_MODEL=claude-sonnet-4-6
HERMES_PROVIDER=anthropic
EOF
    echo -e "${GREEN}✓ .env fayli yaratildi — API kalitlarni kiriting!${NC}"
else
    echo -e "${YELLOW}⚠ .env fayli allaqachon mavjud${NC}"
fi

# ─────────────────────────────────────
# 6. NAZORAT SKRIPTLARI YARATISH
# ─────────────────────────────────────
echo -e "\n${YELLOW}[6/6] Nazorat skriptlari yaratilmoqda...${NC}"

# master_control.sh yaratish
cat > master_control.sh << 'CONTROL_EOF'
#!/bin/bash
# ============================================
# AI AGENTS MASTER CONTROL
# ============================================
source .env 2>/dev/null || true

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

show_menu() {
    clear
    echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     AI AGENTS CONTROL PANEL          ║${NC}"
    echo -e "${BLUE}╠══════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║  1. OpenHands ishga tushirish        ║${NC}"
    echo -e "${BLUE}║  2. Hermes Agent ishga tushirish     ║${NC}"
    echo -e "${BLUE}║  3. Browser Use test                 ║${NC}"
    echo -e "${BLUE}║  4. Barcha agentlarni to'xtatish     ║${NC}"
    echo -e "${BLUE}║  5. Holat tekshirish (Status)        ║${NC}"
    echo -e "${BLUE}║  6. Loglarni ko'rish                 ║${NC}"
    echo -e "${BLUE}║  0. Chiqish                          ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
    echo -n "Tanlang: "
}

start_openhands() {
    echo -e "${YELLOW}OpenHands ishga tushirilmoqda...${NC}"
    docker run -d --name openhands-app \
        --pull=always \
        -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.32-nikolaik \
        -e LOG_ALL_EVENTS=true \
        -e LLM_API_KEY=$ANTHROPIC_API_KEY \
        -e LLM_MODEL=anthropic/claude-sonnet-4-6 \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v ~/.openhands-state:/.openhands-state \
        -p 3000:3000 \
        --add-host host.docker.internal:host-gateway \
        docker.all-hands.dev/all-hands-ai/openhands:0.32 2>/dev/null || \
    docker start openhands-app 2>/dev/null || \
    echo -e "${RED}OpenHands ishga tushmadi!${NC}"
    
    echo -e "${GREEN}✓ OpenHands: http://localhost:3000${NC}"
}

start_hermes() {
    echo -e "${YELLOW}Hermes Agent ishga tushirilmoqda...${NC}"
    export ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
    nohup hermes > logs/hermes.log 2>&1 &
    echo $! > /tmp/hermes.pid
    echo -e "${GREEN}✓ Hermes Agent ishga tushdi (PID: $(cat /tmp/hermes.pid))${NC}"
}

test_browser() {
    echo -e "${YELLOW}Browser Use test ishga tushirilmoqda...${NC}"
    python3 -c "
import asyncio
from browser_use import Agent
from langchain_anthropic import ChatAnthropic
import os

async def main():
    agent = Agent(
        task='Go to google.com and search for Blue Lock anime',
        llm=ChatAnthropic(model='claude-sonnet-4-6', api_key=os.getenv('ANTHROPIC_API_KEY')),
    )
    result = await agent.run()
    print('Result:', result)

asyncio.run(main())
"
}

stop_all() {
    echo -e "${RED}Barcha agentlar to'xtatilmoqda...${NC}"
    docker stop openhands-app 2>/dev/null && echo "OpenHands to'xtatildi"
    kill $(cat /tmp/hermes.pid 2>/dev/null) 2>/dev/null && echo "Hermes to'xtatildi"
    echo -e "${GREEN}✓ Hammasi to'xtatildi${NC}"
}

check_status() {
    echo -e "\n${BLUE}=== AGENT HOLATLARI ===${NC}"
    
    # OpenHands
    if docker ps | grep -q openhands-app; then
        echo -e "${GREEN}✓ OpenHands: ISHLAMOQDA → http://localhost:3000${NC}"
    else
        echo -e "${RED}✗ OpenHands: TO'XTATILGAN${NC}"
    fi
    
    # Hermes
    if kill -0 $(cat /tmp/hermes.pid 2>/dev/null) 2>/dev/null; then
        echo -e "${GREEN}✓ Hermes Agent: ISHLAMOQDA${NC}"
    else
        echo -e "${RED}✗ Hermes Agent: TO'XTATILGAN${NC}"
    fi
    
    # Browser Use
    python3 -c "import browser_use; print('\033[0;32m✓ Browser Use: O\'RNATILGAN\033[0m')" 2>/dev/null || \
    echo -e "${RED}✗ Browser Use: O'RNATILMAGAN${NC}"
}

view_logs() {
    echo -e "\n${YELLOW}Qaysi log? (1=OpenHands, 2=Hermes):${NC}"
    read log_choice
    case $log_choice in
        1) docker logs openhands-app --tail 50 ;;
        2) tail -50 logs/hermes.log 2>/dev/null || echo "Log topilmadi" ;;
    esac
}

# Logs papkasi
mkdir -p logs

# Menyu
while true; do
    show_menu
    read choice
    case $choice in
        1) start_openhands ;;
        2) start_hermes ;;
        3) test_browser ;;
        4) stop_all ;;
        5) check_status ;;
        6) view_logs ;;
        0) echo "Chiqildi."; exit 0 ;;
        *) echo "Noto'g'ri tanlov!" ;;
    esac
    echo -e "\nDavom etish uchun Enter bosing..."
    read
done
CONTROL_EOF

chmod +x master_control.sh
chmod +x setup.sh 2>/dev/null || true

echo -e "\n${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   O'RNATISH MUVAFFAQIYATLI YAKUNLANDI ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "Keyingi qadam:"
echo -e "${YELLOW}1. .env faylini oching va API kalitlarni kiriting${NC}"
echo -e "${YELLOW}2. ./master_control.sh ni ishga tushiring${NC}"
echo ""
```

---

## 🎛️ NAZORAT PROMPTI (Claude uchun)

Agar Claude bilan ishlasangiz, quyidagi system promptni ishlating:

```
Sen professional AI agents nazoratchi agentisan.
Sening vazifang:
1. OpenHands, Hermes Agent va Browser Use agentlarini boshqarish
2. Foydalanuvchi so'rovlarini to'g'ri agentga yo'naltirish
3. Barcha agentlar holatini kuzatib borish

QOIDALAR:
- Kod yozish/tuzatish → OpenHands
- Web sayt avtomatlashtirish → Browser Use  
- Telegram/Discord/CLI orqali ish → Hermes Agent
- Har bir buyruq bajarilganda natijani hisobot qil
- Xato bo'lsa, alternativ yo'l taklif qil

SOZLAMALAR:
- Model: claude-sonnet-4-6
- Til: foydalanuvchi tilida javob ber
- Xavfsizlik: faqat ruxsat berilgan papkalar bilan ishlash
```

---

## ⚠️ MUHIM ESLATMALAR

1. **GitHub ulana olmaydi** — bu Claude sandbox muhitida tarmoq cheklangan
2. **Local kompyuteringizda** yuqoridagi script ishlaydi
3. **API kalitlar** kerak: Anthropic API key (bepul emas)
4. **Docker** kerak OpenHands uchun
5. **4GB+ RAM** kerak barcha agentlar birgalikda ishlashi uchun
   - Bu sotib olinadigan narsa emas — kompyuteringizda allaqachon bor
   - Tekshirish: **Windows** → `Ctrl+Shift+Esc` → Performance → Memory | **Mac** → `Apple menu` → About This Mac | **Linux** → `free -h`
   - 4GB dan kam bo'lsa — faqat bitta agentni ishga tushiring

---

## 💰 NARXLAR

| Xizmat | Narx |
|--------|------|
| Anthropic API | ~$3/million token |
| OpenHands (self-hosted) | Bepul |
| Hermes Agent | Bepul (Nous Portal ixtiyoriy) |
| Browser Use | Bepul |

---

*Yaratildi: 2026 | Claude Sonnet 4.6*

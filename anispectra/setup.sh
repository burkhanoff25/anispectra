#!/bin/bash
# ============================================
# AI AGENTS MASTER SETUP SCRIPT v1.0
# OpenHands + Hermes Agent + Browser Use
# ============================================
# ISHLATISH: chmod +x setup.sh && ./setup.sh
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║   AI AGENTS MASTER INSTALLER v1.0        ║"
echo "║   OpenHands + Hermes + Browser Use       ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# ─────────────────────────────────────
# TIZIM TEKSHIRISH
# ─────────────────────────────────────
echo -e "${YELLOW}[1/6] Tizim talablari tekshirilmoqda...${NC}"

check_and_install() {
    local cmd=$1
    local install_cmd=$2
    if ! command -v $cmd &> /dev/null; then
        echo -e "${RED}✗ $cmd topilmadi — o'rnatilmoqda...${NC}"
        eval "$install_cmd"
    else
        echo -e "${GREEN}✓ $cmd mavjud ($(which $cmd))${NC}"
    fi
}

# OS aniqlash
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PKG_MGR="sudo apt-get install -y"
    UPDATE="sudo apt-get update -qq"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PKG_MGR="brew install"
    UPDATE="brew update"
    check_and_install brew '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
fi

$UPDATE 2>/dev/null || true

check_and_install python3 "$PKG_MGR python3 python3-pip"
check_and_install git "$PKG_MGR git"
check_and_install node "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && $PKG_MGR nodejs"
check_and_install docker "curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker \$USER"

# uv o'rnatish
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}uv (Python manager) o'rnatilmoqda...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi

echo -e "${GREEN}✓ Tizim talablari bajarildi!${NC}\n"

# ─────────────────────────────────────
# BROWSER USE
# ─────────────────────────────────────
echo -e "${YELLOW}[2/6] Browser Use o'rnatilmoqda...${NC}"

pip3 install browser-use langchain-anthropic --break-system-packages 2>/dev/null || \
pip3 install browser-use langchain-anthropic

python3 -m playwright install chromium --with-deps 2>/dev/null || {
    pip3 install playwright --break-system-packages 2>/dev/null || pip3 install playwright
    python3 -m playwright install chromium
}

echo -e "${GREEN}✓ Browser Use o'rnatildi!${NC}\n"

# ─────────────────────────────────────
# HERMES AGENT
# ─────────────────────────────────────
echo -e "${YELLOW}[3/6] Hermes Agent o'rnatilmoqda...${NC}"

uv tool install hermes-agent 2>/dev/null || \
pip3 install hermes-agent --break-system-packages 2>/dev/null || \
pip3 install hermes-agent

echo -e "${GREEN}✓ Hermes Agent o'rnatildi!${NC}\n"

# ─────────────────────────────────────
# OPENHANDS (Docker orqali)
# ─────────────────────────────────────
echo -e "${YELLOW}[4/6] OpenHands Docker image yuklanmoqda...${NC}"

docker pull docker.all-hands.dev/all-hands-ai/runtime:0.32-nikolaik 2>/dev/null && \
docker pull docker.all-hands.dev/all-hands-ai/openhands:0.32 2>/dev/null && \
echo -e "${GREEN}✓ OpenHands tayyor!${NC}" || \
echo -e "${YELLOW}⚠ OpenHands keyinroq yuklanadi (internet kerak)${NC}"

echo ""

# ─────────────────────────────────────
# .env FAYL
# ─────────────────────────────────────
echo -e "${YELLOW}[5/6] Sozlamalar fayli yaratilmoqda...${NC}"

mkdir -p logs

if [ ! -f ".env" ]; then
cat > .env << 'ENVEOF'
# ============================================
# AI AGENTS SOZLAMALARI
# ============================================

# === MAJBURIY ===
ANTHROPIC_API_KEY=sk-ant-SHATANGA-API-KALIT-KIRITING

# === IXTIYORIY ===
OPENAI_API_KEY=
GOOGLE_API_KEY=
FIRECRAWL_API_KEY=

# === BROWSER USE ===
BROWSER_USE_HEADLESS=true
BROWSER_USE_TIMEOUT=60000

# === OPENHANDS ===
OPENHANDS_PORT=3000
LLM_MODEL=anthropic/claude-sonnet-4-6

# === HERMES AGENT ===
HERMES_MODEL=claude-sonnet-4-6
HERMES_PROVIDER=anthropic
HERMES_TUI=1
ENVEOF
    echo -e "${GREEN}✓ .env yaratildi${NC}"
else
    echo -e "${YELLOW}⚠ .env allaqachon mavjud${NC}"
fi

# ─────────────────────────────────────
# MASTER CONTROL SKRIPT
# ─────────────────────────────────────
echo -e "${YELLOW}[6/6] Master nazorat skripti yaratilmoqda...${NC}"

cat > master_control.sh << 'MASTEREOF'
#!/bin/bash
# ============================================
# AI AGENTS MASTER CONTROL PANEL
# ============================================
source .env 2>/dev/null || { echo "XATO: .env topilmadi!"; exit 1; }
export ANTHROPIC_API_KEY

RED='\033[0;31m'; GREEN='\033[0;32m'
YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

mkdir -p logs

show_menu() {
    clear
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║      AI AGENTS CONTROL PANEL v1.0       ║"
    echo "╠══════════════════════════════════════════╣"
    echo "║                                          ║"
    echo "║  [1] 🤖 OpenHands ishga tushirish        ║"
    echo "║  [2] 🧠 Hermes Agent ishga tushirish     ║"
    echo "║  [3] 🌐 Browser Use test qilish          ║"
    echo "║  [4] 🔴 Barcha agentlarni to'xtatish     ║"
    echo "║  [5] 📊 Holat tekshirish (Status)        ║"
    echo "║  [6] 📋 Loglarni ko'rish                 ║"
    echo "║  [7] ⚙️  Sozlamalarni tahrirlash          ║"
    echo "║  [0] 🚪 Chiqish                          ║"
    echo "║                                          ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -n "  Tanlang [0-7]: "
}

start_openhands() {
    echo -e "\n${YELLOW}OpenHands ishga tushirilmoqda...${NC}"
    
    if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "sk-ant-SHATANGA-API-KALIT-KIRITING" ]; then
        echo -e "${RED}XATO: ANTHROPIC_API_KEY ni .env ga kiriting!${NC}"
        return 1
    fi
    
    # Eski container bo'lsa ishga tushir, bo'lmasa yangi yaratish
    docker start openhands-app 2>/dev/null || \
    docker run -d \
        --name openhands-app \
        -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.32-nikolaik \
        -e LOG_ALL_EVENTS=true \
        -e LLM_API_KEY=$ANTHROPIC_API_KEY \
        -e LLM_MODEL=${LLM_MODEL:-anthropic/claude-sonnet-4-6} \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v ~/.openhands-state:/.openhands-state \
        -p ${OPENHANDS_PORT:-3000}:3000 \
        --add-host host.docker.internal:host-gateway \
        docker.all-hands.dev/all-hands-ai/openhands:0.32
    
    sleep 2
    echo -e "${GREEN}✓ OpenHands ishlamoqda → http://localhost:${OPENHANDS_PORT:-3000}${NC}"
}

start_hermes() {
    echo -e "\n${YELLOW}Hermes Agent ishga tushirilmoqda...${NC}"
    
    if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "sk-ant-SHATANGA-API-KALIT-KIRITING" ]; then
        echo -e "${RED}XATO: ANTHROPIC_API_KEY ni .env ga kiriting!${NC}"
        return 1
    fi
    
    # Eski jarayonni to'xtatish
    kill $(cat /tmp/hermes.pid 2>/dev/null) 2>/dev/null || true
    
    # Yangi ishga tushirish
    nohup hermes > logs/hermes.log 2>&1 &
    echo $! > /tmp/hermes.pid
    
    sleep 1
    echo -e "${GREEN}✓ Hermes Agent ishga tushdi (PID: $(cat /tmp/hermes.pid))${NC}"
    echo -e "${BLUE}  Log: logs/hermes.log${NC}"
}

test_browser() {
    echo -e "\n${YELLOW}Browser Use test...${NC}"
    
    if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "sk-ant-SHATANGA-API-KALIT-KIRITING" ]; then
        echo -e "${RED}XATO: ANTHROPIC_API_KEY ni .env ga kiriting!${NC}"
        return 1
    fi
    
    python3 << 'PYEOF'
import asyncio, os, sys
try:
    from browser_use import Agent
    from langchain_anthropic import ChatAnthropic
    
    async def test():
        print("Browser ishga tushirilmoqda...")
        agent = Agent(
            task="Open google.com and search for 'Blue Lock anime'",
            llm=ChatAnthropic(
                model="claude-haiku-4-5-20251001",
                api_key=os.getenv("ANTHROPIC_API_KEY")
            ),
        )
        result = await agent.run(max_steps=3)
        print("✓ Test muvaffaqiyatli!", result)
    
    asyncio.run(test())
except ImportError as e:
    print(f"XATO: {e}")
    print("Yechim: pip3 install browser-use langchain-anthropic")
except Exception as e:
    print(f"XATO: {e}")
PYEOF
}

stop_all() {
    echo -e "\n${RED}Barcha agentlar to'xtatilmoqda...${NC}"
    
    docker stop openhands-app 2>/dev/null && \
        docker rm openhands-app 2>/dev/null && \
        echo -e "${GREEN}✓ OpenHands to'xtatildi${NC}" || \
        echo -e "${YELLOW}OpenHands ishlamayotgan edi${NC}"
    
    local hermes_pid=$(cat /tmp/hermes.pid 2>/dev/null)
    if kill $hermes_pid 2>/dev/null; then
        echo -e "${GREEN}✓ Hermes to'xtatildi${NC}"
        rm -f /tmp/hermes.pid
    else
        echo -e "${YELLOW}Hermes ishlamayotgan edi${NC}"
    fi
}

check_status() {
    echo -e "\n${BLUE}═══ AGENT HOLATLARI ═══${NC}\n"
    
    # OpenHands
    if docker ps 2>/dev/null | grep -q openhands-app; then
        echo -e "${GREEN}  🟢 OpenHands    : ISHLAMOQDA → http://localhost:${OPENHANDS_PORT:-3000}${NC}"
    elif docker ps -a 2>/dev/null | grep -q openhands-app; then
        echo -e "${YELLOW}  🟡 OpenHands    : TO'XTATILGAN (mavjud)${NC}"
    else
        echo -e "${RED}  🔴 OpenHands    : O'RNATILMAGAN${NC}"
    fi
    
    # Hermes
    local hermes_pid=$(cat /tmp/hermes.pid 2>/dev/null)
    if kill -0 $hermes_pid 2>/dev/null; then
        echo -e "${GREEN}  🟢 Hermes Agent : ISHLAMOQDA (PID: $hermes_pid)${NC}"
    else
        echo -e "${RED}  🔴 Hermes Agent : TO'XTATILGAN${NC}"
    fi
    
    # Browser Use
    if python3 -c "import browser_use" 2>/dev/null; then
        echo -e "${GREEN}  🟢 Browser Use  : O'RNATILGAN${NC}"
    else
        echo -e "${RED}  🔴 Browser Use  : O'RNATILMAGAN${NC}"
    fi
    
    echo -e "\n${BLUE}═══ API KALIT HOLATI ═══${NC}"
    if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "sk-ant-SHATANGA-API-KALIT-KIRITING" ]; then
        echo -e "${RED}  ⚠ ANTHROPIC_API_KEY: KIRITILMAGAN (.env ni tahrirlang)${NC}"
    else
        echo -e "${GREEN}  ✓ ANTHROPIC_API_KEY: Mavjud (${ANTHROPIC_API_KEY:0:20}...)${NC}"
    fi
    echo ""
}

view_logs() {
    echo -e "\n${YELLOW}Qaysi log?${NC}"
    echo "  [1] OpenHands logs"
    echo "  [2] Hermes Agent logs"
    echo -n "  Tanlang: "
    read log_choice
    case $log_choice in
        1) 
            echo -e "${BLUE}=== OpenHands logs (oxirgi 50 qator) ===${NC}"
            docker logs openhands-app --tail 50 2>/dev/null || echo "Log topilmadi"
            ;;
        2) 
            echo -e "${BLUE}=== Hermes logs (oxirgi 50 qator) ===${NC}"
            tail -50 logs/hermes.log 2>/dev/null || echo "Log topilmadi"
            ;;
    esac
}

edit_config() {
    echo -e "\n${YELLOW}.env fayli ochilmoqda...${NC}"
    ${EDITOR:-nano} .env
    echo -e "${GREEN}Saqlandi. Agentlarni qayta ishga tushiring.${NC}"
}

# ASOSIY TSIKL
while true; do
    show_menu
    read -r choice
    case $choice in
        1) start_openhands ;;
        2) start_hermes ;;
        3) test_browser ;;
        4) stop_all ;;
        5) check_status ;;
        6) view_logs ;;
        7) edit_config ;;
        0) echo -e "\n${GREEN}Chiqildi. Xayr!${NC}\n"; exit 0 ;;
        *) echo -e "${RED}Noto'g'ri tanlov! 0-7 orasida kiriting.${NC}" ;;
    esac
    echo -e "\n${YELLOW}Davom etish uchun ENTER bosing...${NC}"
    read
done
MASTEREOF

chmod +x master_control.sh

# ─────────────────────────────────────
# YAKUNIY XABAR
# ─────────────────────────────────────
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅ O'RNATISH MUVAFFAQIYATLI YAKUNLANDI!   ║"
echo "╠══════════════════════════════════════════════╣"
echo "║                                              ║"
echo "║  KEYINGI QADAMLAR:                          ║"
echo "║                                              ║"
echo "║  1. API kalitni kiriting:                   ║"
echo "║     nano .env                               ║"
echo "║     → ANTHROPIC_API_KEY=sk-ant-...          ║"
echo "║                                              ║"
echo "║  2. Nazorat panelini oching:                ║"
echo "║     ./master_control.sh                     ║"
echo "║                                              ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

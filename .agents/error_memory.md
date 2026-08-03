# Error Memory Log
This file tracks failed attempts to strictly comply with RULE #1 of the AI AGENT EXECUTION PROTOCOL.
Before executing ANY new action, this log MUST be consulted.

## Format
- **Step Number**:
- **What was tried**:
- **Why it failed**:
- **Evidence**:
- **Root Cause**:
- **Better Strategy**:

---

## Error #1 — Telegram Userbot kanallardan xabar kelmayapti

- **Step Number**: 1
- **What was tried**: `NewMessage({})` bilan barcha xabarlarni tinglash va `message.getChat()` orqali kanal filtrlash
- **Why it failed**: 
  1. `NewMessage({})` usersdan ham xabar oladi — kanallar uchun alohida `chats` parametri kerak edi
  2. `chat.username` case-sensitive, `AniLibria_TV` va `anivaultik` bosh-kichik harf farqi muammo yaratgan
  3. `.env.local` da `TELEGRAM_CHAT_ID=7918236863` (shaxsiy chat) — kanal ID emas, shuning uchun forward kanal emas shaxsiy chatga ketgan
  4. `sendMessage` bilan `file` yuborish ba'zi media turlarida ishlamaydi
- **Evidence**: `.env` da `TELEGRAM_CHAT_ID=-1004410113145`, `.env.local` da esa `7918236863` — ikki xil qiymat
- **Root Cause**: Chat ID mismatch + `message.getChat()` filtri ishonchsiz
- **Better Strategy**: 
  - `forwardMessages()` ishlatish — to'g'ridan-to'g'ri forward, media muammosi yo'q
  - `chat.username.toLowerCase()` bilan case-insensitive solishtirish
  - `.env.local` da ham `TELEGRAM_CHAT_ID=-1004410113145` qilish
  - `TELEGRAM_CHANNEL_ID` ni alohida o'zgaruvchi sifatida saqlash

---

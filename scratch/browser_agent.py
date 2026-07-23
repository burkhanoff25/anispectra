import sys
import os

# Fix Windows console UTF-8 encoding for stdout/stderr
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import asyncio
from dotenv import load_dotenv
import gradio as gr

# Load environment variables (.env / .env.local)
load_dotenv(dotenv_path="../.env.local")
load_dotenv(dotenv_path="../.env")
load_dotenv(dotenv_path="./.env")
load_dotenv()

# Model presets for each provider
MODEL_PRESETS = {
    "Claude (Anthropic)": [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229"
    ],
    "ChatGPT (OpenAI)": [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo"
    ],
    "Gemini (Google)": [
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp"
    ]
}

def check_env_status():
    """Validates loaded API keys and reports available models."""
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()

    status_report = []
    status_report.append("=========================================")
    status_report.append("🔍 API KEYS & ENV HOLATI TEKSHIRUVI")
    status_report.append("=========================================\n")

    if anthropic_key:
        masked = anthropic_key[:8] + "..." + anthropic_key[-4:] if len(anthropic_key) > 12 else "mavjud"
        status_report.append(f"🟢 Anthropic (Claude): MAVJUD ({masked})")
        status_report.append(f"   ► Tavsiya etilgan modellar: {', '.join(MODEL_PRESETS['Claude (Anthropic)'])}\n")
    else:
        status_report.append("🔴 Anthropic (Claude): TOPILMADI (.env da ANTHROPIC_API_KEY o'rnating)\n")

    if openai_key:
        masked = openai_key[:8] + "..." + openai_key[-4:] if len(openai_key) > 12 else "mavjud"
        status_report.append(f"🟢 OpenAI (ChatGPT): MAVJUD ({masked})")
        status_report.append(f"   ► Tavsiya etilgan modellar: {', '.join(MODEL_PRESETS['ChatGPT (OpenAI)'])}\n")
    else:
        status_report.append("🔴 OpenAI (ChatGPT): TOPILMADI (.env da OPENAI_API_KEY o'rnating)\n")

    if gemini_key:
        masked = gemini_key[:8] + "..." + gemini_key[-4:] if len(gemini_key) > 12 else "mavjud"
        status_report.append(f"🟢 Google (Gemini): MAVJUD ({masked})")
        status_report.append(f"   ► Tavsiya etilgan modellar: {', '.join(MODEL_PRESETS['Gemini (Google)'])}\n")
    else:
        status_report.append("🔴 Google (Gemini): TOPILMADI (.env da GEMINI_API_KEY o'rnating)\n")

    status_report.append("=========================================")
    status_report.append("💡 Ishlatmoqchi bo'lgan provayder tugmasini bosib topshiriqni yuboring.")

    return "\n".join(status_report)

async def run_browser_agent(task_text: str, provider: str, custom_api_key: str, model_name: str, headless_mode: bool):
    if not task_text.strip():
        return "⚠️ Iltimos, bajarilishi kerak bo'lgan topshiriqni (prompt) kiriting!"

    try:
        from browser_use import Agent, Browser
    except ImportError as e:
        return f"❌ Xatolik: browser-use topilmadi ({str(e)})"

    # Set up LLM Provider
    llm = None
    
    if provider == "Claude (Anthropic)":
        api_key = custom_api_key.strip() or os.getenv("ANTHROPIC_API_KEY", "").strip()
        if not api_key:
            return "❌ Xatolik: ANTHROPIC_API_KEY topilmadi! API key kiriting yoki .env ga qo'shing."
        os.environ["ANTHROPIC_API_KEY"] = api_key
        
        try:
            from langchain_anthropic import ChatAnthropic
            selected_model = model_name.strip() if model_name.strip() else "claude-3-5-sonnet-20241022"
            llm = ChatAnthropic(model=selected_model, api_key=api_key)
            object.__setattr__(llm, "provider", "anthropic")
        except ImportError:
            return "❌ Xatolik: langchain-anthropic o'rnatilmagan"

    elif provider == "ChatGPT (OpenAI)":
        api_key = custom_api_key.strip() or os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            return "❌ Xatolik: OPENAI_API_KEY topilmadi! API key kiriting yoki .env ga qo'shing."
        os.environ["OPENAI_API_KEY"] = api_key
        
        try:
            from langchain_openai import ChatOpenAI
            selected_model = model_name.strip() if model_name.strip() else "gpt-4o"
            llm = ChatOpenAI(model=selected_model, api_key=api_key)
            object.__setattr__(llm, "provider", "openai")
        except ImportError:
            return "❌ Xatolik: langchain-openai o'rnatilmagan"

    elif provider == "Gemini (Google)":
        api_key = custom_api_key.strip() or os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()
        if not api_key:
            return "❌ Xatolik: GEMINI_API_KEY / GOOGLE_API_KEY topilmadi! API key kiriting yoki .env ga qo'shing."
        os.environ["GOOGLE_API_KEY"] = api_key
        
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            selected_model = model_name.strip() if model_name.strip() else "gemini-1.5-pro"
            llm = ChatGoogleGenerativeAI(model=selected_model, google_api_key=api_key)
            object.__setattr__(llm, "provider", "google")
        except ImportError:
            return "❌ Xatolik: langchain-google-genai o'rnatilmagan"

    try:
        # Local Chrome/Edge browser fallback or standard browser
        edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        
        extra_kwargs = {}
        if os.path.exists(edge_path):
            extra_kwargs["chrome_instance_path"] = edge_path
        elif os.path.exists(chrome_path):
            extra_kwargs["chrome_instance_path"] = chrome_path

        try:
            browser = Browser(headless=headless_mode, **extra_kwargs)
        except Exception:
            browser = Browser(headless=headless_mode)
        
        agent = Agent(
            task=task_text,
            llm=llm,
            browser=browser,
        )
        
        history = await agent.run()
        final_result = history.final_result()
        return final_result if final_result else "✅ Topshiriq muvaffaqiyatli bajarildi."
    except Exception as e:
        return f"❌ Xatolik yuz berdi: {str(e)}"

def start_agent(task_text, provider, custom_api_key, model_name, headless_mode):
    return asyncio.run(run_browser_agent(task_text, provider, custom_api_key, model_name, headless_mode))

def update_model_dropdown(provider_choice):
    presets = MODEL_PRESETS.get(provider_choice, [])
    default_val = presets[0] if presets else ""
    return gr.Dropdown(choices=presets, value=default_val)

# Gradio Web UI
def create_ui():
    with gr.Blocks(title="AI Agents Master Web Panel") as demo:
        gr.Markdown(
            """
            # 🤖 AI Agents Master Control Panel
            **Claude**, **ChatGPT (OpenAI)** va **Gemini** API kalitlari bilan ishlaydigan mukammal brauzer agenti.
            """
        )
        
        with gr.Row():
            with gr.Column(scale=2):
                task_input = gr.Textbox(
                    label="Topshiriq (Prompt)",
                    placeholder="Masalan: Google-ga kir va Anispectra loyihasi haqida ma'lumot qidir...",
                    lines=4
                )
                
                with gr.Row():
                    btn_claude = gr.Button("🤖 Claude", variant="secondary")
                    btn_openai = gr.Button("🧠 ChatGPT", variant="secondary")
                    btn_gemini = gr.Button("✨ Gemini", variant="secondary")
                
                provider_dropdown = gr.Dropdown(
                    label="AI Provider",
                    choices=["Claude (Anthropic)", "ChatGPT (OpenAI)", "Gemini (Google)"],
                    value="Claude (Anthropic)"
                )
                
                model_dropdown = gr.Dropdown(
                    label="Modelni Tanlang",
                    choices=MODEL_PRESETS["Claude (Anthropic)"],
                    value=MODEL_PRESETS["Claude (Anthropic)"][0]
                )
                
                api_key_input = gr.Textbox(
                    label="Maxsus API Key (bo'sh qolsa, .env dagi kalit ishlatiladi)",
                    placeholder="sk-...",
                    type="password"
                )
                
                headless_checkbox = gr.Checkbox(
                    label="Brauzerni fonda yashirin (Headless) ishlatish",
                    value=False
                )
                
                with gr.Row():
                    btn_check_env = gr.Button("🔍 ENV va API Keys Tekshirish", variant="secondary")
                    run_btn = gr.Button("🚀 Topshiriqni Bajarish", variant="primary")
            
            with gr.Column(scale=2):
                output_text = gr.Textbox(
                    label="Agent Natijasi / Status Hisoboti",
                    lines=16,
                    interactive=False
                )
        
        # Provider selection button clicks
        btn_claude.click(
            fn=lambda: ("Claude (Anthropic)", gr.Dropdown(choices=MODEL_PRESETS["Claude (Anthropic)"], value=MODEL_PRESETS["Claude (Anthropic)"][0])),
            outputs=[provider_dropdown, model_dropdown]
        )
        btn_openai.click(
            fn=lambda: ("ChatGPT (OpenAI)", gr.Dropdown(choices=MODEL_PRESETS["ChatGPT (OpenAI)"], value=MODEL_PRESETS["ChatGPT (OpenAI)"][0])),
            outputs=[provider_dropdown, model_dropdown]
        )
        btn_gemini.click(
            fn=lambda: ("Gemini (Google)", gr.Dropdown(choices=MODEL_PRESETS["Gemini (Google)"], value=MODEL_PRESETS["Gemini (Google)"][0])),
            outputs=[provider_dropdown, model_dropdown]
        )
        
        # Dropdown change updates model options
        provider_dropdown.change(
            fn=update_model_dropdown,
            inputs=provider_dropdown,
            outputs=model_dropdown
        )
        
        # Check ENV button
        btn_check_env.click(
            fn=check_env_status,
            outputs=output_text
        )
        
        # Run button
        run_btn.click(
            fn=start_agent,
            inputs=[task_input, provider_dropdown, api_key_input, model_dropdown, headless_checkbox],
            outputs=output_text
        )
        
    return demo

if __name__ == "__main__":
    app = create_ui()
    print("\nMaster Web Panel ishga tushmoqda: http://127.0.0.1:7860\n")
    app.launch(server_name="127.0.0.1", server_port=7860, share=False, theme=gr.themes.Soft())

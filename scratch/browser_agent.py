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

# Model presets for each provider (using OpenRouter endpoints)
MODEL_PRESETS = {
    "Claude (Anthropic)": [
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3.5-haiku",
        "anthropic/claude-3-opus"
    ],
    "ChatGPT (OpenAI)": [
        "openai/gpt-4o",
        "openai/gpt-4o-mini",
        "openai/gpt-4-turbo"
    ],
    "Gemini (Google)": [
        "google/gemini-1.5-pro",
        "google/gemini-1.5-flash",
        "google/gemini-2.0-flash-exp:free"
    ]
}

def check_env_status():
    """Validates loaded API keys and reports available models."""
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()

    openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()

    status_report = []
    status_report.append("=========================================")
    status_report.append("🔍 API KEYS & ENV HOLATI TEKSHIRUVI")
    status_report.append("=========================================\n")

    if openrouter_key:
        masked = openrouter_key[:8] + "..." + openrouter_key[-4:] if len(openrouter_key) > 12 else "mavjud"
        status_report.append(f"🟢 OpenRouter (Universal API): MAVJUD ({masked})")
        status_report.append("   ► Ushbu kalit orqali Claude, ChatGPT va Gemini ishlayveradi!\n")
    else:
        status_report.append("🔴 OpenRouter API kaliti TOPILMADI (.env ga qo'shing)\n")

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

    # Set up LLM Provider using OpenRouter
    openrouter_key = custom_api_key.strip() or os.getenv("OPENROUTER_API_KEY", "").strip()
    if not openrouter_key:
        return "❌ Xatolik: OPENROUTER_API_KEY topilmadi! API key kiriting yoki .env ga qo'shing."

    try:
        from browser_use import ChatOpenAI # type: ignore
        selected_model = model_name.strip() if model_name.strip() else "openai/gpt-4o-mini"
        
        # We route ALL providers through OpenRouter.
        llm = ChatOpenAI(
            model=selected_model,
            api_key=openrouter_key,
            base_url="https://openrouter.ai/api/v1"
        )
    except ImportError as e:
        return f"❌ Xatolik: ChatOpenAI klassini import qilib bo'lmadi: {e}"

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
        
        output = "✅ TOPSHIRIQ YAKUNLANDI.\n"
        output += "=" * 50 + "\n\n"
        
        if final_result:
            output += f"🎯 YAKUNIY NATIJA:\n{final_result}\n\n"
            output += "=" * 50 + "\n\n"
        
        output += "🔍 MONITORING (QADAM-BA-QADAM JARAYON):\n"
        output += "-" * 50 + "\n"
        
        try:
            urls = history.urls()
            if urls:
                output += "🌐 TASHRIF BUYURILGAN SAYTLAR:\n"
                for u in set(urls):
                    output += f" - {u}\n"
                output += "\n"
        except Exception:
            pass
            
        try:
            for idx, action_result in enumerate(history.action_results()):
                step_str = f"🔄 QADAM {idx + 1}:\n"
                has_content = False
                for res in action_result:
                    if getattr(res, 'extracted_content', None):
                        step_str += f"   📄 Ma'lumot: {res.extracted_content}\n"
                        has_content = True
                    if getattr(res, 'error', None):
                        step_str += f"   ❌ Xato: {res.error}\n"
                        has_content = True
                if has_content:
                    output += step_str + "\n"
        except Exception:
            pass

        if not final_result and "🔄 QADAM" not in output:
            output += "Agent hech qanday natija qaytarmadi. Topshiriqni aniqroq bering.\n"

        return output
    except Exception as e:
        return f"❌ Xatolik yuz berdi: {str(e)}"

def update_model_dropdown(provider_choice):
    presets = MODEL_PRESETS.get(provider_choice, [])
    default_val = presets[0] if presets else ""
    return gr.update(choices=presets, value=default_val)

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
        btn_claude.click(  # type: ignore # pylint: disable=no-member
            fn=lambda: ("Claude (Anthropic)", gr.update(choices=MODEL_PRESETS["Claude (Anthropic)"], value=MODEL_PRESETS["Claude (Anthropic)"][0])),
            outputs=[provider_dropdown, model_dropdown]
        )
        btn_openai.click(  # type: ignore # pylint: disable=no-member
            fn=lambda: ("ChatGPT (OpenAI)", gr.update(choices=MODEL_PRESETS["ChatGPT (OpenAI)"], value=MODEL_PRESETS["ChatGPT (OpenAI)"][0])),
            outputs=[provider_dropdown, model_dropdown]
        )
        btn_gemini.click(  # type: ignore # pylint: disable=no-member
            fn=lambda: ("Gemini (Google)", gr.update(choices=MODEL_PRESETS["Gemini (Google)"], value=MODEL_PRESETS["Gemini (Google)"][0])),
            outputs=[provider_dropdown, model_dropdown]
        )
        
        # Dropdown change updates model options
        provider_dropdown.change(  # type: ignore # pylint: disable=no-member
            fn=update_model_dropdown,
            inputs=provider_dropdown,
            outputs=model_dropdown
        )
        
        # Check ENV button
        btn_check_env.click(  # type: ignore # pylint: disable=no-member
            fn=check_env_status,
            outputs=output_text
        )
        
        # Run button
        run_btn.click(  # type: ignore # pylint: disable=no-member
            fn=run_browser_agent,
            inputs=[task_input, provider_dropdown, api_key_input, model_dropdown, headless_checkbox],
            outputs=output_text
        )
        
    return demo

if __name__ == "__main__":
    app = create_ui()
    print("\nMaster Web Panel ishga tushmoqda: http://127.0.0.1:7860\n")
    app.launch(server_name="127.0.0.1", server_port=7860, share=False, theme=gr.themes.Soft())

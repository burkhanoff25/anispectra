import asyncio
import os
from dotenv import load_dotenv
import gradio as gr

# Environment variable'larni yuklash (.env / .env.local)
load_dotenv(dotenv_path="../.env.local")
load_dotenv(dotenv_path="../.env")
load_dotenv(dotenv_path="./.env")
load_dotenv()

async def run_browser_agent(task_text: str, provider: str, custom_api_key: str, model_name: str, headless_mode: bool):
    if not task_text.strip():
        return "Iltimos, bajarilishi kerak bo'lgan topshiriqni kiriting!"

    try:
        from browser_use import Agent, Browser, BrowserConfig
    except ImportError:
        return "Xatolik: browser-use o'rnatilmagan. Buyruq: pip install browser-use playwright"

    # Provider bo'yicha LLM sozlash
    llm = None
    
    if provider == "Claude (Anthropic)":
        api_key = custom_api_key.strip() or os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            return "Xatolik: ANTHROPIC_API_KEY topilmadi!"
        os.environ["ANTHROPIC_API_KEY"] = api_key
        
        try:
            from langchain_anthropic import ChatAnthropic
            model = model_name if model_name else "claude-3-5-sonnet-20241022"
            llm = ChatAnthropic(model=model, api_key=api_key)
        except ImportError:
            return "Xatolik: langchain-anthropic o'rnatilmagan. Buyruq: pip install langchain-anthropic"

    elif provider == "ChatGPT (OpenAI)":
        api_key = custom_api_key.strip() or os.getenv("OPENAI_API_KEY")
        if not api_key:
            return "Xatolik: OPENAI_API_KEY topilmadi!"
        os.environ["OPENAI_API_KEY"] = api_key
        
        try:
            from langchain_openai import ChatOpenAI
            model = model_name if model_name else "gpt-4o"
            llm = ChatOpenAI(model=model, api_key=api_key)
        except ImportError:
            return "Xatolik: langchain-openai o'rnatilmagan. Buyruq: pip install langchain-openai"

    elif provider == "Gemini (Google)":
        api_key = custom_api_key.strip() or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return "Xatolik: GEMINI_API_KEY / GOOGLE_API_KEY topilmadi!"
        os.environ["GOOGLE_API_KEY"] = api_key
        
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            model = model_name if model_name else "gemini-1.5-pro"
            llm = ChatGoogleGenerativeAI(model=model, google_api_key=api_key)
        except ImportError:
            return "Xatolik: langchain-google-genai o'rnatilmagan. Buyruq: pip install langchain-google-genai"

    try:
        # Brauzerni sozlash (Headless=False bo'lsa, brauzer ekranda ochiq ko'rinadi)
        browser = Browser(config=BrowserConfig(headless=headless_mode))
        
        agent = Agent(
            task=task_text,
            llm=llm,
            browser=browser,
        )
        
        history = await agent.run()
        final_result = history.final_result()
        return final_result if final_result else "Topshiriq muvaffaqiyatli bajarildi."
    except Exception as e:
        return f"Xatolik yuz berdi: {str(e)}"

def start_agent(task_text, provider, custom_api_key, model_name, headless_mode):
    return asyncio.run(run_browser_agent(task_text, provider, custom_api_key, model_name, headless_mode))

# Gradio Web UI
def create_ui():
    with gr.Blocks(title="AI Agents — Master Web Control") as demo:
        gr.Markdown(
            """
            # 🤖 AI Agents Master Web Panel
            **Claude**, **ChatGPT (OpenAI)** va **Gemini** API kalitlari bilan ishlaydigan brauzer agenti.
            """
        )
        
        with gr.Row():
            with gr.Column(scale=2):
                task_input = gr.Textbox(
                    label="Topshiriq (Prompt)",
                    placeholder="Masalan: Google-ga kir va Anispectra loyihasi haqida ma'lumot qidir...",
                    lines=4
                )
                
                provider_dropdown = gr.Dropdown(
                    label="AI Provider",
                    choices=["Claude (Anthropic)", "ChatGPT (OpenAI)", "Gemini (Google)"],
                    value="Claude (Anthropic)"
                )
                
                model_input = gr.Textbox(
                    label="Model nomi (ixtiyoriy)",
                    placeholder="Masalan: claude-3-5-sonnet-20241022 / gpt-4o / gemini-1.5-pro",
                    value=""
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
                
                run_btn = gr.Button("🚀 Topshiriqni Bajarish", variant="primary")
            
            with gr.Column(scale=2):
                output_text = gr.Textbox(
                    label="Agent Natijasi / Hisobot",
                    lines=14,
                    interactive=False
                )
        
        run_btn.click(
            fn=start_agent,
            inputs=[task_input, provider_dropdown, api_key_input, model_input, headless_checkbox],
            outputs=output_text
        )
        
    return demo

if __name__ == "__main__":
    app = create_ui()
    print("\n🌐 Master Web Panel ishga tushmoqda: http://127.0.0.1:7860\n")
    app.launch(server_name="127.0.0.1", server_port=7860, share=False)

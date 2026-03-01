from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from app.config import settings


class AgentConfig:
    """
    เลียนแบบ Google ADK ADK LlmAgent Config
    เพื่อให้ง่ายต่อการจัดการ Model Parameters และ Safety Settings
    """

    def __init__(self, provider: str, model_name: str, temperature: float = 0.7):
        self.provider = provider
        self.model_name = model_name
        self.temperature = temperature
        self.safety_settings = self._get_default_safety_settings()

    def _get_default_safety_settings(self):
        return {
            "HARM_CATEGORY_HARASSMENT": "BLOCK_MEDIUM_AND_ABOVE",
            "HARM_CATEGORY_HATE_SPEECH": "BLOCK_MEDIUM_AND_ABOVE",
        }


class LLMProvider:
    """
    Standardized Provider ที่ช่วยให้การเปลี่ยน Model ทำได้ง่ายผ่าน Config เดียว
    """

    @staticmethod
    def get_model(config: AgentConfig):
        api_key = settings.LLM_API_KEY

        if config.provider == "google":
            return ChatGoogleGenerativeAI(
                model=config.model_name,
                google_api_key=settings.GOOGLE_API_KEY or api_key,
                temperature=config.temperature,
                safety_settings=config.safety_settings,
            )
        elif config.provider == "openai":
            return ChatOpenAI(
                model=config.model_name,
                openai_api_key=settings.OPENAI_API_KEY or api_key,
                temperature=config.temperature,
            )
        elif config.provider == "anthropic":
            return ChatAnthropic(
                model=config.model_name,
                anthropic_api_key=settings.ANTHROPIC_API_KEY or api_key,
                temperature=config.temperature,
            )
        elif config.provider == "openrouter":
            return ChatOpenAI(
                model=config.model_name,
                openai_api_key=api_key,
                base_url=settings.LLM_BASE_URL or "https://openrouter.ai/api/v1",
                temperature=config.temperature,
            )
        elif config.provider == "deepseek":
            return ChatOpenAI(
                model=config.model_name,
                openai_api_key=api_key,
                base_url=settings.LLM_BASE_URL or "https://api.deepseek.com",
                temperature=config.temperature,
            )
        raise ValueError(f"Unsupported provider: {config.provider}")


current_config = AgentConfig(
    provider=settings.LLM_PROVIDER, model_name=settings.LLM_MODEL_NAME, temperature=0.2
)
llm = LLMProvider.get_model(current_config)

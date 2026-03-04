from langchain_google_genai import ChatGoogleGenerativeAI
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

    config = AgentConfig(
        provider=settings.LLM_PROVIDER,
        model_name=settings.LLM_MODEL_NAME,
        temperature=0.2,
    )

    @classmethod
    def get_model(cls, temperature: float = 0.7):
        api_key = settings.LLM_API_KEY
        config = cls.config

        return ChatGoogleGenerativeAI(
            model=config.model_name,
            google_api_key=settings.GOOGLE_API_KEY or api_key,
            temperature=temperature,
            safety_settings=config.safety_settings,
        )

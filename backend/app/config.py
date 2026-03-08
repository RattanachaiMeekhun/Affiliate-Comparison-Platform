from pydantic_settings import BaseSettings, SettingsConfigDict

MAX_RETRIES = 3


class Settings(BaseSettings):
    PROJECT_NAME: str = "Affiliate Comparison Platform API"
    API_V1_STR: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database
    URL_DATABASE: str | None = None
    SUPABASE_URL: str | None = None
    SUPABASE_KEY: str | None = None

    # LLM Keys
    GOOGLE_API_KEY: str | None = None

    # Generic LLM Settings (from .env)
    LLM_PROVIDER: str = "google"
    LLM_MODEL_NAME: str = "gemini-2.5-pro"
    LLM_API_KEY: str | None = None
    LLM_BASE_URL: str | None = None
    LLM_TEMPERATURE: float = 0.2
    LLM_SAFETY_SETTINGS: dict = {
        "HARM_CATEGORY_HARASSMENT": "BLOCK_MEDIUM_AND_ABOVE",
        "HARM_CATEGORY_HATE_SPEECH": "BLOCK_MEDIUM_AND_ABOVE",
    }

    # eBay Browse API
    EBAY_CLIENT_ID: str | None = None
    EBAY_CLIENT_SECRET: str | None = None
    EBAY_SANDBOX: bool | None = True  # "true" = sandbox, "false" = production
    EBAY_MARKETPLACE_ID: str = "EBAY_TH"  # e.g. EBAY_US, EBAY_GB, EBAY_AU

    # Auth
    JWT_SECRET_KEY: str | None = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

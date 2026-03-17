from app.config import settings
from supabase import create_client
from langchain_openai import OpenAIEmbeddings


class VectorService:
    """Handles embedding generation and pgvector similarity search via Supabase RPC."""

    def __init__(self):
        self.provider = "openai"
        self.model = "openai/text-embedding-3-small"

        # Supabase client for RPC calls
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            self.supabase = create_client(
                settings.SUPABASE_URL, settings.SUPABASE_KEY
            )
        else:
            self.supabase = None

    def _get_embeddings_model(self):
        """Get a LangChain embeddings instance based on provider config."""
        if self.provider == "google":
            from langchain_google_genai import GoogleGenerativeAIEmbeddings

            api_key = settings.GOOGLE_API_KEY or settings.LLM_API_KEY
            return GoogleGenerativeAIEmbeddings(
                model=self.model,
                google_api_key=api_key,
            )
        elif self.provider == "openai":
            from langchain_openai import OpenAIEmbeddings

            # Use LLM_BASE_URL if provided (important for OpenRouter)
            # OpenAI base url default is https://api.openai.com/v1
            base_url = settings.LLM_BASE_URL
            
            # If it's an OpenRouter key but no base_url provided, default to OpenRouter
            api_key = settings.LLM_API_KEY
            if api_key and api_key.startswith("sk-or-") and not base_url:
                base_url = "https://openrouter.ai/api/v1"

            return OpenAIEmbeddings(
                model=self.model,
                openai_api_key="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",
                base_url=base_url,
            )
        else:
            raise ValueError(f"Unknown embedding provider: {self.provider}")


    def embed_text(self, text: str) -> list[float]:
        """Generate an embedding vector for the given text."""
        model = self._get_embeddings_model()
        return model.embed_query(text)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Batch embed multiple texts (more efficient than one-by-one)."""
        model = self._get_embeddings_model()
        return model.embed_documents(texts)

    def search_products(
        self,
        query: str,
        min_price: float = 0,
        max_price: float = 999_999_999,
        limit: int = 20,
    ) -> list[dict]:
        """Embed query and find similar products via Supabase match_products RPC."""
        if not self.supabase:
            return []

        # Embed the search query
        query_embedding = self.embed_text(query)

        # Call the match_products RPC function
        response = self.supabase.rpc(
            "match_products",
            {
                "query_embedding": query_embedding,
                "match_count": limit,
                "min_price": float(min_price),
                "max_price": float(max_price),
            },
        ).execute()

        return response.data if response.data else []

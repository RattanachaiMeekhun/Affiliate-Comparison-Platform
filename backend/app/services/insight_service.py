from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.llm import LLMProvider
from app.ai.searchagent.prompt import INSIGHT_WRITER_AGENT_SYSTEM_PROMPT
from app.ai.helper import _parse_json_response
from app.services.vector_service import VectorService
import logging

logger = logging.getLogger(__name__)

async def clean_product_title(raw_title: str) -> str:
    """Clean product title and extract just the clean product brand and model name."""
    llm = LLMProvider.get_model(temperature=0.1)
    prompt = f"""
You are a product data cleaning agent.
The user will provide a raw, messy product title.
Your task is to extract ONLY the clean, standard product brand and series/model name from the title.
Exclude any promotional text, specifications, bracketed text, emojis, or corrupted characters (like mojibake/unreadable language).
Your entire response must be ONLY the clean product name. Do not return anything else.

Raw Title: {raw_title}
"""
    messages = [HumanMessage(content=prompt)]
    response = await llm.ainvoke(messages)
    return response.content.strip()

async def clean_product_description(raw_description: str) -> str:
    """Clean product description and extract just the clean product description."""
    llm = LLMProvider.get_model(temperature=0.1)
    prompt = f"""
You are a product data cleaning agent.
The user will provide a raw, messy product description.
Your task is to extract ONLY the clean, standard product description from the title.
Exclude any promotional text, specifications, bracketed text, emojis, or corrupted characters (like mojibake/unreadable language).
Your entire response must be ONLY the clean product description. Do not return anything else.

Raw Description: {raw_description}
"""
    messages = [HumanMessage(content=prompt)]
    response = await llm.ainvoke(messages)
    return response.content.strip()

async def generate_product_insight(product_name: str, product_description: str) -> str | None:
    """
    Generate a professional AI insight for a product using the LLM.
    """
    try:
        clean_name = await clean_product_title(product_name)
        logger.info(f"Cleaned product name '{product_name}' -> '{clean_name}'")

        llm = LLMProvider.get_model(temperature=0.3)
        
        context = f"Product Name: {clean_name}\nDescription: {product_description}"
        system_prompt = INSIGHT_WRITER_AGENT_SYSTEM_PROMPT + "\n\nNote: You are providing an insight for a single product. Focus on analysis and value recommendation.\nCRITICAL: WRITE THE INSIGHT ENTIRELY IN ENGLISH. This is mandatory regardless of the input language. Use the provided name and description to generate the insight."
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=context)
        ]
        
        response = await llm.ainvoke(messages)
        content = response.content
        
        data = _parse_json_response(content)
        if isinstance(data, dict) and "ai_insight" in data:
            return data["ai_insight"]
        
        return content
    except Exception as e:
        logger.error(f"Error generating insight for {product_name}: {e}")
        return None

def build_product_search_text(product_name: str, description: str, specs: dict | str | None, insight: str | None) -> str:
    """Build a rich text representation for embedding."""
    parts = [product_name]
    if description:
        parts.append(description)
    if specs:
        if isinstance(specs, dict):
            parts.append(", ".join(f"{k}: {v}" for k, v in specs.items()))
        else:
            parts.append(str(specs))
    if insight:
        parts.append(insight)
    return ". ".join(parts)

async def generate_product_embedding(text: str) -> list[float] | None:
    """Generate embedding vector using the VectorService."""
    try:
        vs = VectorService()
        return vs.embed_text(text)
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return None

"""
LangChain Tool wrappers for Serper.dev API
============================================
These tools allow the AI search agent to call Google Shopping directly
as part of its reasoning flow.
"""

import json
from langchain_core.tools import tool
from app.services.serper_service import SerperService


@tool
async def serper_search(query: str, limit: int = 10) -> str:
    """
    Search for products using Google Shopping (via Serper).
    Use this when you need real product listings with prices, sellers, and links.

    Args:
        query: The product search query (e.g. 'MacBook Pro M3 16 inch')
        limit: Maximum number of results to return (default 10, max 50)

    Returns:
        JSON string containing shopping listings with title, price, seller, URL, and image.
    """
    service = SerperService()
    try:
        results = await service.search_products(query, limit=min(limit, 50))
        normalized = service.normalize_search_results(results)

        # Slim down for LLM context – keep only what the agent needs
        slim = []
        for item in normalized:
            slim.append(
                {
                    "title": item["raw_data"]["title"],
                    "price": item["price"],
                    "currency": item["currency"],
                    "seller": item["raw_data"]["seller"],
                    "url": item["source_url"],
                    "image": item["raw_data"]["image_url"],
                    "rating": item["raw_data"]["rating"],
                }
            )

        return json.dumps(
            {"total": len(slim), "items": slim},
            ensure_ascii=False,
        )
    except Exception as e:
        return json.dumps({"error": str(e), "items": []})


# Export list for easy import
SERPER_TOOLS = [serper_search]

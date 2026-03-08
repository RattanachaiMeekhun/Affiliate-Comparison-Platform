"""
LangChain Tool wrappers for eBay Browse API
============================================
These tools allow the AI search agent to call eBay directly
as part of its reasoning flow.
"""

import json
from langchain_core.tools import tool
from app.services.ebay_service import EbayService


@tool
async def ebay_search(query: str, limit: int = 10) -> str:
    """
    Search for products on eBay.
    Use this when you need real product listings with prices, sellers, and links.

    Args:
        query: The product search query (e.g. 'MacBook Pro M3 16 inch')
        limit: Maximum number of results to return (default 10, max 50)

    Returns:
        JSON string containing eBay listings with title, price, seller, URL, and condition.
    """
    service = EbayService()
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
                    "condition": item["raw_data"]["condition"],
                    "seller": item["raw_data"]["seller_username"],
                    "seller_rating": item["raw_data"]["seller_feedback_percentage"],
                    "url": item["source_url"],
                    "item_id": item["source_product_id"],
                    "image": item["raw_data"]["image_url"],
                    "shipping": item["raw_data"]["shipping_cost"],
                }
            )

        return json.dumps(
            {"total": results.get("total", 0), "items": slim},
            ensure_ascii=False,
        )
    except Exception as e:
        return json.dumps({"error": str(e), "items": []})


@tool
async def ebay_item_details(item_id: str) -> str:
    """
    Get detailed information about a specific eBay item.
    Use this to get full specifications, description, and seller details.

    Args:
        item_id: The eBay item ID (e.g. 'v1|123456789|0')

    Returns:
        JSON string with full item details.
    """
    service = EbayService()
    try:
        item = await service.get_item(item_id)
        detail = {
            "title": item.get("title", ""),
            "price": item.get("price", {}).get("value"),
            "currency": item.get("price", {}).get("currency"),
            "condition": item.get("condition", ""),
            "description": item.get("shortDescription", ""),
            "category": item.get("categoryPath", ""),
            "brand": item.get("brand", ""),
            "mpn": item.get("mpn", ""),
            "item_url": item.get("itemWebUrl", ""),
            "image": item.get("image", {}).get("imageUrl", ""),
            "additional_images": [
                img.get("imageUrl", "") for img in item.get("additionalImages", [])
            ],
            "seller": {
                "username": item.get("seller", {}).get("username", ""),
                "feedback_percentage": item.get("seller", {}).get(
                    "feedbackPercentage", ""
                ),
                "feedback_score": item.get("seller", {}).get("feedbackScore", 0),
            },
            "shipping": [
                {
                    "type": opt.get("shippingServiceCode", ""),
                    "cost": opt.get("shippingCost", {}).get("value"),
                }
                for opt in item.get("shippingOptions", [])
            ],
            "return_terms": item.get("returnTerms", {}),
            "specs": {
                lnv.get("name", ""): lnv.get("value", "")
                for lnv in item.get("localizedAspects", [])
            },
        }
        return json.dumps(detail, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)})


# Export list for easy import
EBAY_TOOLS = [ebay_search, ebay_item_details]

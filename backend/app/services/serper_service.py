import aiohttp
from typing import Dict, Any, List
from app.config import settings


class SerperService:
    def __init__(self):
        self.api_key = settings.SERPER_API_KEY
        self.base_url = "https://google.serper.dev/shopping"
        self.headers = {
            "X-API-KEY": self.api_key or "",
            "Content-Type": "application/json",
        }

    async def search_products(self, query: str, limit: int = 15) -> Dict[str, Any]:
        """
        Search for products using Google Shopping (via Serper).
        """
        if not self.api_key:
            raise ValueError("SERPER_API_KEY is not configured")

        payload = {
            "q": query,
            "gl": "th",  # Localize to Thailand
            "hl": "th",  # Language Thai
            "num": limit,  # Number of results
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.base_url, headers=self.headers, json=payload
            ) as response:
                if response.status != 200:
                    text = await response.text()
                    raise Exception(f"Serper API error: {response.status} {text}")

                data = await response.json()
                return data

    async def search_image(self, query: str) -> str | None:
        """
        Search for an image using Google Images (via Serper).
        Returns the first image URL found, or None.
        """
        if not self.api_key:
            return None

        # Override URL for this specific call
        url = "https://google.serper.dev/images"
        payload = {"q": query, "num": 5}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url, headers=self.headers, json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        images = data.get("images", [])
                        if images:
                            return images[0].get("imageUrl")
        except Exception as e:
            print(f"Failed to search image via Serper: {e}")

        return None

    def normalize_search_results(
        self, raw_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Normalize the Shopping results into our standardized format.
        """
        shopping_results = raw_data.get("shopping", [])
        normalized = []

        for item in shopping_results:
            price_raw = item.get("price", "0")
            # Extract numbers from price string (e.g., '฿15,900.00' -> 15900.00)
            import re

            price_str = re.sub(r"[^\d.]", "", str(price_raw).replace(",", ""))
            price_val = float(price_str) if price_str else 0.0

            normalized.append(
                {
                    "source_name": item.get("source", "Google Shopping"),
                    "source_product_id": item.get(
                        "item_id", str(item.get("position", ""))
                    ),
                    "source_url": item.get("link", ""),
                    "price": price_val,
                    "currency": item.get(
                        "currency", "THB"
                    ),  # Serper usually returns currency or we assume THB since gl=th
                    "image_url": item.get("imageUrl", ""),
                    "raw_data": {
                        "title": item.get("title", ""),
                        "condition": "New",
                        "seller": item.get("source", "Unknown Seller"),
                        "rating": item.get("rating"),
                        "review_count": item.get("ratingCount"),
                        "image_url": item.get("imageUrl", ""),
                        "delivery": item.get("delivery", ""),
                    },
                }
            )

        return normalized

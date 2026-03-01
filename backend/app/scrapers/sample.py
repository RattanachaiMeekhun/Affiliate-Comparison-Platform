from .base import BaseScraper
from typing import List, Dict, Any
import random

class SampleScraper(BaseScraper):
    def __init__(self):
        super().__init__(source_name="SampleShop")

    async def scrape_products(self, query: str) -> List[Dict[str, Any]]:
        # This is a mock scraper for demonstration
        # In a real scenario, you'd fetch and parse HTML here
        mock_products = [
            {
                "source_name": self.source_name,
                "source_product_id": f"ss-{random.randint(1000, 9999)}",
                "source_url": f"https://sampleshop.com/product/{query}",
                "price": random.uniform(500, 1500),
                "currency": "THB",
                "raw_data": {"name": f"{query} Pro", "specs": "Mock Specs"}
            }
        ]
        return mock_products

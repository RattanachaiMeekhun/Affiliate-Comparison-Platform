from .base import BaseScraper
from typing import List, Dict, Any
import random


class SampleScraper(BaseScraper):
    def __init__(self):
        super().__init__(source_name="SampleShop")

    async def scrape_products(self, query: str) -> List[Dict[str, Any]]:
        # This is a pre-defined realistic mocker for Admitad review purposes
        query_lower = query.lower()

        if "macbook" in query_lower or "apple" in query_lower:
            return [
                {
                    "source_name": "Lazada",
                    "source_product_id": f"laz-{random.randint(1000, 9999)}",
                    "source_url": "https://www.lazada.co.th/products/apple-macbook-pro-14-m3",
                    "price": 79900.00,
                    "currency": "THB",
                    "raw_data": {
                        "name": "Apple MacBook Pro 14 (M3 Pro) 18GB/512GB",
                        "specs": "M3 Pro 11-core CPU, 14-core GPU, 18GB RAM, 512GB SSD Space Black",
                    },
                },
                {
                    "source_name": "Shopee",
                    "source_product_id": f"shp-{random.randint(1000, 9999)}",
                    "source_url": "https://shopee.co.th/apple-macbook-pro-14-inch-m3-pro",
                    "price": 78500.00,
                    "currency": "THB",
                    "raw_data": {
                        "name": "MacBook Pro 14-inch M3 Pro Chip",
                        "specs": "18GB RAM 512GB Storage - English Keyboard",
                    },
                },
            ]
        elif "rtx" in query_lower or "gpu" in query_lower:
            return [
                {
                    "source_name": "JIB",
                    "source_product_id": f"jib-{random.randint(1000, 9999)}",
                    "source_url": "https://www.jib.co.th/web/product/readProduct/rtx-4070-ti-super",
                    "price": 34900.00,
                    "currency": "THB",
                    "raw_data": {
                        "name": "ASUS TUF GAMING GEFORCE RTX 4070 TI SUPER 16GB",
                        "specs": "16GB GDDR6X, 256-bit, PCIe 4.0",
                    },
                },
                {
                    "source_name": "Advice",
                    "source_product_id": f"adv-{random.randint(1000, 9999)}",
                    "source_url": "https://www.advice.co.th/product/graphic-card/vga-asus-tuf-rtx4070ti-super",
                    "price": 33990.00,
                    "currency": "THB",
                    "raw_data": {
                        "name": "VGA ASUS TUF GAMING GEFORCE RTX 4070 TI SUPER OC 16GB",
                        "specs": "16GB GDDR6X",
                    },
                },
            ]

        # Default generic realistic response
        return [
            {
                "source_name": "GeneralTech",
                "source_product_id": f"gt-{random.randint(1000, 9999)}",
                "source_url": f"https://example.com/product/{query}",
                "price": random.uniform(5000, 25000),
                "currency": "THB",
                "raw_data": {
                    "name": f"{query} Standard Edition",
                    "specs": "High Performance Tech Specs",
                },
            }
        ]

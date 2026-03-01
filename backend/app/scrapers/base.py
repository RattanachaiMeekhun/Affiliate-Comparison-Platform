from abc import ABC, abstractmethod
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any

class BaseScraper(ABC):
    def __init__(self, source_name: str):
        self.source_name = source_name
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    async def fetch_page(self, url: str) -> str:
        async with httpx.AsyncClient(headers=self.headers) as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            return response.text

    @abstractmethod
    async def scrape_products(self, query: str) -> List[Dict[str, Any]]:
        """
        Scrape products from the source based on a query.
        Returns a list of dicts consistent with AffiliateProductCreate schema.
        """
        pass

    def parse_html(self, html: str) -> BeautifulSoup:
        return BeautifulSoup(html, "html.parser")

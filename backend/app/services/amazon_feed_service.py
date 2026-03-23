import aiohttp
import re
from typing import Dict, Any, Optional
from app.services.serper_service import SerperService
from app.services.affiliate_service import affiliate_service

class AmazonFeedService:
    def __init__(self, serper_service: SerperService):
        self.serper_service = serper_service

    async def search_amazon_product(self, product_name: str) -> Optional[Dict[str, Any]]:
        """
        Search for a product specifically on Amazon using Serper organic search.
        """
        if not self.serper_service.api_key:
            print("Missing Serper API key.")
            return None
            
        url = "https://google.serper.dev/search"
        payload = {
            "q": f"site:amazon.com/dp OR site:amazon.com/gp/product {product_name}",
            "gl": "us",
            "hl": "en",
            "num": 5
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url, headers=self.serper_service.headers, json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self.parse_amazon_result(data, product_name)
                    else:
                        print(f"Serper error: {response.status}")
        except Exception as e:
            print(f"Failed to search Amazon via Serper: {e}")
            
        return None

    def parse_amazon_result(self, search_data: Dict[str, Any], query: str) -> Optional[Dict[str, Any]]:
        """
        Parses organic search results to find the best Amazon product link.
        """
        organic_results = search_data.get("organic", [])
        for item in organic_results:
            link = item.get("link", "")
            if "amazon.com" in link and ("/dp/" in link or "/gp/product/" in link):
                # Extract Price
                price = 0.0
                snippet = item.get("snippet", "")
                
                # Look for price in snippet
                price_match = re.search(r'\$\s?([0-9,]+(?:\.[0-9]{2})?)', snippet)
                if price_match:
                    price_str = price_match.group(1).replace(",", "")
                    price = float(price_str)
                    
                affiliate_url = affiliate_service.generate_amazon_affiliate_url(link)
                
                # Extract ASIN
                asin_match = re.search(r'/(?:dp|product)/([A-Z0-9]{10})', link)
                source_id = asin_match.group(1) if asin_match else "unknown"

                return {
                    "source_name": "Amazon",
                    "source_product_id": source_id,
                    "source_url": affiliate_url,
                    "price": price,
                    "currency": "USD",
                    "raw_data": {
                        "title": item.get("title"),
                        "snippet": snippet,
                        "position": item.get("position")
                    }
                }
        return None

    async def update_product_feed(self, db_session):
        """
        Iterates over products to find and add missing Amazon affiliate links.
        """
        from app.models import Product, AffiliateProduct
        from datetime import datetime
        
        products = db_session.query(Product).all()
        updated_count = 0
        
        for product in products:
            has_amazon = any(ap.source_name.lower() == "amazon" for ap in product.affiliate_products)
            if not has_amazon:
                amazon_data = await self.search_amazon_product(product.name)
                
                if amazon_data:
                    ap = AffiliateProduct(
                        product_id=product.id,
                        source_name=amazon_data["source_name"],
                        source_product_id=amazon_data["source_product_id"],
                        source_url=amazon_data["source_url"],
                        price=amazon_data["price"],
                        currency=amazon_data["currency"],
                        raw_data=amazon_data["raw_data"],
                        last_scraped=datetime.utcnow()
                    )
                    db_session.add(ap)
                    updated_count += 1
                    
        if updated_count > 0:
            db_session.commit()
            
        return updated_count

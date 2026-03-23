import sys
import os
import asyncio
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.crud import get_categories, get_products_by_category
from app.ai.seo.generator import generate_category_seo

async def test_seo():
    db = SessionLocal()
    categories = get_categories(db, limit=1)
    if not categories:
        print("No categories found.")
        return
        
    cat = categories[0]
    print(f"Testing SEO generation for Category: {cat.name}")
    
    products = get_products_by_category(db, str(cat.id), limit=3)
    
    res = await generate_category_seo(cat.name, cat.description or "", products)
    print("SEO Data Generated:")
    print(res)
    
if __name__ == "__main__":
    asyncio.run(test_seo())

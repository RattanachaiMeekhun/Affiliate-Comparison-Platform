from fastapi import APIRouter, Depends, HTTPException
from ..scrapers.lazada_scraper import LazadaScraper
from ..scrapers.shopee_scraper import ShopeeScraper
from app.database import get_db
from sqlalchemy.orm import Session
from app.models import Product, AffiliateProduct
import uuid
from datetime import datetime

router = APIRouter(tags=["scraper"])


def save_scraped_product(db: Session, scraped_data: dict):
    # Try to find existing AffiliateProduct by source_product_id and source_name
    affiliate_product = (
        db.query(AffiliateProduct)
        .filter(
            AffiliateProduct.source_name == scraped_data["source_name"],
            AffiliateProduct.source_product_id == scraped_data["source_product_id"],
        )
        .first()
    )

    if affiliate_product:
        # Update price and last_scraped
        affiliate_product.price = scraped_data["price"]
        affiliate_product.last_scraped = datetime.utcnow()
        affiliate_product.raw_data = scraped_data["raw_data"]
    else:
        # Create a new base Product if we don't try to smartly match them initially
        # A full system would use AI matching here. For now, create a generic Product
        new_product = Product(
            name=scraped_data["raw_data"].get("name", "Unknown"),
            slug=str(uuid.uuid4())[:18],  # Generate a simple distinct slug
        )
        db.add(new_product)
        db.flush()  # To get the new_product.id

        affiliate_product = AffiliateProduct(
            product_id=new_product.id,
            source_name=scraped_data["source_name"],
            source_product_id=scraped_data["source_product_id"],
            source_url=scraped_data["source_url"],
            price=scraped_data["price"],
            currency=scraped_data["currency"],
            raw_data=scraped_data["raw_data"],
        )
        db.add(affiliate_product)

    db.commit()


@router.get("/scrape")
def scrape(list: str, db: Session = Depends(get_db)):
    try:
        productName = list.split(",")
        lazadaScraper = LazadaScraper()
        shopeeScraper = ShopeeScraper()
        lazadaProducts = []
        shopeeProducts = []
        for query in productName:
            # Scrape Lazada
            lazada_results = lazadaScraper.scrape_products(query)
            for item in lazada_results:
                save_scraped_product(db, item)
            lazadaProducts.extend(lazada_results)

            # Scrape Shopee
            shopee_results = shopeeScraper.scrape_products(query)
            for item in shopee_results:
                save_scraped_product(db, item)
            shopeeProducts.extend(shopee_results)

        return {
            "lazadaProducts": lazadaProducts,
            "shopeeProducts": shopeeProducts,
            "message": "Scraping completed and data saved to database.",
        }
    except Exception as e:
        import traceback

        db.rollback()
        return {"error": str(e), "trace": traceback.format_exc()}

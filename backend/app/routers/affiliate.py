from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid
from pydantic import BaseModel
from .. import crud, schemas, database
from ..scrapers.sample import SampleScraper
from ..ai.matching import MatchingEngine

router = APIRouter(tags=["affiliate"])


@router.post("/affiliate-products/", response_model=schemas.AffiliateProduct)
def create_affiliate_product(
    affiliate_product: schemas.AffiliateProductCreate,
    db: Session = Depends(database.get_db),
):
    return crud.create_affiliate_product(db=db, affiliate_product=affiliate_product)


@router.get("/affiliate-products/", response_model=List[schemas.AffiliateProduct])
def read_affiliate_products(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)
):
    return crud.get_affiliate_products(db, skip=skip, limit=limit)


class ScrapeMatchRequest(BaseModel):
    queries: List[str]
    limit_per_query: int = 10


@router.post("/scrape-and-match/")
async def scrape_and_match(
    request: ScrapeMatchRequest, db: Session = Depends(database.get_db)
):
    results = []
    scraper = SampleScraper()
    engine = MatchingEngine()

    for query in request.queries:
        # 1. Scrape
        scraped_data = await scraper.scrape_products(query)

        # Apply limit
        scraped_data = scraped_data[: request.limit_per_query]

        # 2. Match & Persist
        for item in scraped_data:
            # Create AffiliateProduct
            aff_prod_data = schemas.AffiliateProductCreate(**item)
            db_aff_prod = crud.create_affiliate_product(db, aff_prod_data)

            # Get candidates for matching
            # For simplicity, we get all normalized products to compare
            db_products = crud.get_products(db)
            candidates = [
                {"id": str(p.id), "name": p.name, "description": p.description}
                for p in db_products
            ]

            # Run AI Matching
            match_result = await engine.run_matching(item, candidates)

            if match_result["best_match_id"]:
                # Link to existing product
                db_aff_prod.product_id = match_result["best_match_id"]
                db.commit()
                results.append(
                    {
                        "query": query,
                        "status": "matched",
                        "source_id": item["source_product_id"],
                        "matched_to": match_result["best_match_id"],
                    }
                )
            else:
                # Create new normalized product if highly confident it's unique (simplified here)
                new_prod_data = schemas.ProductCreate(
                    name=item["raw_data"]["name"],
                    slug=f"{item['raw_data']['name'].lower().replace(' ', '-')}-{uuid.uuid4().hex[:4]}",
                    description=item["raw_data"].get("specs", ""),
                    ai_insight=match_result.get("insight"),
                )
                new_db_prod = crud.create_product(db, new_prod_data)
                db_aff_prod.product_id = new_db_prod.id
                db.commit()
                results.append(
                    {
                        "query": query,
                        "status": "created_new",
                        "source_id": item["source_product_id"],
                        "new_product_id": str(new_db_prod.id),
                    }
                )

    return {"results": results}

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from . import models, schemas, crud
from .database import engine, get_db
from .scrapers.sample import SampleScraper
from .ai.matching import MatchingEngine
from fastapi.responses import RedirectResponse

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Affiliate Comparison Platform API")

@app.get("/")
async def root():
      return RedirectResponse(url="/docs")


# Categories
@app.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)

@app.get("/categories/", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)

# Products
@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@app.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.get("/products/{product_id}", response_model=schemas.Product)
def read_product(product_id: str, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

# Affiliate Products
@app.post("/affiliate-products/", response_model=schemas.AffiliateProduct)
def create_affiliate_product(affiliate_product: schemas.AffiliateProductCreate, db: Session = Depends(get_db)):
    return crud.create_affiliate_product(db=db, affiliate_product=affiliate_product)

@app.get("/affiliate-products/", response_model=List[schemas.AffiliateProduct])
def read_affiliate_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_affiliate_products(db, skip=skip, limit=limit)

# Integrated Scraping & AI Matching
@app.post("/scrape-and-match/")
async def scrape_and_match(query: str, db: Session = Depends(get_db)):
    # 1. Scrape
    scraper = SampleScraper()
    scraped_data = await scraper.scrape_products(query)
    
    # 2. Match & Persist
    engine = MatchingEngine()
    results = []
    
    for item in scraped_data:
        # Create AffiliateProduct
        aff_prod_data = schemas.AffiliateProductCreate(**item)
        db_aff_prod = crud.create_affiliate_product(db, aff_prod_data)
        
        # Get candidates for matching
        # For simplicity, we get all normalized products to compare
        db_products = crud.get_products(db)
        candidates = [{"id": str(p.id), "name": p.name, "description": p.description} for p in db_products]
        
        # Run AI Matching
        match_result = await engine.run_matching(item, candidates)
        
        if match_result["best_match_id"]:
            # Link to existing product
            db_aff_prod.product_id = match_result["best_match_id"]
            db.commit()
            results.append({"status": "matched", "source_id": item["source_product_id"], "matched_to": match_result["best_match_id"]})
        else:
            # Create new normalized product if highly confident it's unique (simplified here)
            new_prod_data = schemas.ProductCreate(
                name=item["raw_data"]["name"],
                slug=f"{item['raw_data']['name'].lower().replace(' ', '-')}-{uuid.uuid4().hex[:4]}",
                description=item["raw_data"].get("specs", ""),
                ai_insight=match_result.get("insight")
            )
            new_db_prod = crud.create_product(db, new_prod_data)
            db_aff_prod.product_id = new_db_prod.id
            db.commit()
            results.append({"status": "created_new", "source_id": item["source_product_id"], "new_product_id": str(new_db_prod.id)})
            
    return {"results": results}

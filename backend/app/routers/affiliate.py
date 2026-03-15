from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
from pydantic import BaseModel
from .. import models, crud, schemas, database

router = APIRouter(prefix="/affiliate", tags=["affiliate"])


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


@router.get("/go/{aff_id}")
def redirect_to_affiliate(
    aff_id: uuid.UUID,
    db: Session = Depends(database.get_db)
):
    aff_product = db.query(models.AffiliateProduct).filter(models.AffiliateProduct.id == aff_id).first()
    if not aff_product:
        return RedirectResponse(url="/")
    
    # Increment click counter
    aff_product.clicks = (aff_product.clicks or 0) + 1
    db.commit()
    
    return RedirectResponse(url=aff_product.source_url)


class ScrapeMatchRequest(BaseModel):
    queries: List[str]
    limit_per_query: int = 10


# @router.post("/scrape-and-match/")
# async def scrape_and_match(
#     request: ScrapeMatchRequest, db: Session = Depends(database.get_db)
# ):
#     # ... (original commented out code)
#     pass

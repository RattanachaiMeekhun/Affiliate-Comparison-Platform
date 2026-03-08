"""
eBay API Router
===============
Exposes endpoints for direct eBay product search, item details,
and batch import into the affiliate products table.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app import database, crud, schemas
from app.services.ebay_service import EbayService
from app.ai.searchagent.tools import ebay_search as ebay_search_tool

router = APIRouter(prefix="/ebay", tags=["ebay"])


# ── Request / Response models ──────────────────
class EbaySearchRequest(BaseModel):
    query: str
    limit: int = 10
    sort: str = "BEST_MATCH"
    price_min: Optional[float] = None
    price_max: Optional[float] = None


class EbayImportRequest(BaseModel):
    query: str
    limit: int = 10
    auto_match: bool = False  # If True, run matching engine after import


class EbayItemResponse(BaseModel):
    item_id: str
    title: str
    price: float
    currency: str
    condition: str
    seller: str
    url: str
    image: Optional[str] = None


# ── Endpoints ──────────────────────────────────


@router.get("/search")
async def search_ebay_products(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    sort: str = Query("BEST_MATCH"),
    price_min: Optional[float] = Query(None),
    price_max: Optional[float] = Query(None),
):
    """
    Search eBay products via Browse API.
    Returns normalised results ready for display or import.
    """
    service = EbayService()
    try:
        raw = await service.search_products(
            q,
            limit=limit,
            sort=sort,
            price_min=price_min,
            price_max=price_max,
        )
        normalized = service.normalize_search_results(raw)
        return {
            "total": raw.get("total", 0),
            "offset": raw.get("offset", 0),
            "limit": raw.get("limit", limit),
            "items": normalized,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"eBay API error: {str(e)}")


@router.get("/item/{item_id}")
async def get_ebay_item(item_id: str):
    """
    Get detailed eBay item info by item_id.
    """
    service = EbayService()
    try:
        item = await service.get_item(item_id)
        return item
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"eBay API error: {str(e)}")


@router.post("/import")
async def import_ebay_products(
    request: EbayImportRequest,
    db: Session = Depends(database.get_db),
):
    """
    Search eBay and bulk-import results as AffiliateProducts.
    Optionally triggers the AI matching engine.
    """
    service = EbayService()
    try:
        raw = await service.search_products(request.query, limit=request.limit)
        normalized = service.normalize_search_results(raw)

        if not normalized:
            return {"imported": 0, "message": "No eBay listings found"}

        imported = []
        for item in normalized:
            aff_data = schemas.AffiliateProductCreate(
                source_name=item["source_name"],
                source_product_id=item["source_product_id"],
                source_url=item["source_url"],
                price=item["price"],
                currency=item["currency"],
                raw_data=item["raw_data"],
            )
            db_aff = crud.create_affiliate_product(db, aff_data)
            imported.append(
                {
                    "id": str(db_aff.id),
                    "source_product_id": db_aff.source_product_id,
                    "price": float(db_aff.price) if db_aff.price else 0,
                }
            )

        result = {
            "imported": len(imported),
            "items": imported,
        }

        # Optional: run matching engine
        if request.auto_match:
            from app.ai.matching import MatchingEngine

            engine = MatchingEngine()
            db_products = crud.get_products(db)
            candidates = [
                {"id": str(p.id), "name": p.name, "description": p.description}
                for p in db_products
            ]

            match_results = []
            for item in normalized:
                match = await engine.run_matching(
                    {
                        "name": item["raw_data"]["title"],
                        "raw_data": item["raw_data"],
                        "price": item["price"],
                        "currency": item["currency"],
                    },
                    candidates,
                )
                if match.get("best_match_id"):
                    match_results.append(
                        {
                            "ebay_title": item["raw_data"]["title"],
                            "matched_product_id": match["best_match_id"],
                            "confidence": match["confidence"],
                        }
                    )

            result["matches"] = match_results

        return result

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Import error: {str(e)}")


@router.post("/ai-search")
async def ai_ebay_search(
    q: str = Query(..., description="Product to search for"),
):
    """
    Use the AI agent's eBay tool to search and get analysed results.
    This wraps the LangChain tool so the front end can call it directly.
    """
    try:
        result = await ebay_search_tool.ainvoke({"query": q, "limit": 15})
        import json

        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI eBay search error: {str(e)}")

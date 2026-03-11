"""
Serper API Router
=================
Exposes endpoints for direct Google Shopping product search
and batch import into the affiliate products table.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app import database, crud, schemas
from app.services.serper_service import SerperService
from app.ai.searchagent.tools import serper_search as serper_search_tool

router = APIRouter(prefix="/serper", tags=["serper"])


# ── Request / Response models ──────────────────
class SerperSearchRequest(BaseModel):
    query: str
    limit: int = 10


class SerperImportRequest(BaseModel):
    query: str
    limit: int = 10
    auto_match: bool = False  # If True, run matching engine after import


class SerperItemResponse(BaseModel):
    item_id: str
    title: str
    price: float
    currency: str
    seller: str
    url: str
    image: Optional[str] = None


# ── Endpoints ──────────────────────────────────


@router.get("/search")
async def search_shopping_products(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Search Google Shopping via Serper API.
    Returns normalised results ready for display or import.
    """
    service = SerperService()
    try:
        raw = await service.search_products(q, limit=limit)
        normalized = service.normalize_search_results(raw)
        return {
            "total": len(normalized),
            "limit": limit,
            "items": normalized,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Serper API error: {str(e)}")


@router.post("/import")
async def import_shopping_products(
    request: SerperImportRequest,
    db: Session = Depends(database.get_db),
):
    """
    Search Google Shopping and bulk-import results as AffiliateProducts.
    Optionally triggers the AI matching engine.
    """
    service = SerperService()
    try:
        raw = await service.search_products(request.query, limit=request.limit)
        normalized = service.normalize_search_results(raw)

        if not normalized:
            return {"imported": 0, "message": "No Google Shopping listings found"}

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
                            "title": item["raw_data"]["title"],
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
async def ai_shopping_search(
    q: str = Query(..., description="Product to search for"),
):
    """
    Use the AI agent's Serper tool to search and get analysed results.
    This wraps the LangChain tool so the front end can call it directly.
    """
    try:
        result = await serper_search_tool.ainvoke({"query": q, "limit": 15})
        import json

        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Serper search error: {str(e)}")

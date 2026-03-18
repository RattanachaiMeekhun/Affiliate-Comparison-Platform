from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/currencies", tags=["currencies"])

@router.get("/", response_model=List[schemas.CurrencyRate])
def read_currencies(db: Session = Depends(database.get_db)):
    return crud.get_currency_rates(db)

@router.post("/seed")
def seed_currencies(db: Session = Depends(database.get_db)):
    """Seed initial exchange rates relative to THB."""
    # Base is THB = 1.0
    initial_rates = [
        {"code": "THB", "rate": 1.0},
        {"code": "USD", "rate": 0.028}, # 1 THB = 0.028 USD (approx 35.7 THB/USD)
        {"code": "EUR", "rate": 0.026}, # 1 THB = 0.026 EUR
        {"code": "GBP", "rate": 0.022}, # 1 THB = 0.022 GBP
    ]
    
    for rate_data in initial_rates:
        crud.update_currency_rate(db, code=rate_data["code"], rate=rate_data["rate"])
        
    return {"message": "Currencies seeded successfully"}

@router.post("/update")
async def update_currencies_manually(db: Session = Depends(database.get_db)):
    """Manually trigger an update of exchange rates from the external API."""
    from app.services.currency_service import fetch_and_update_rates
    try:
        await fetch_and_update_rates(db)
        return {"message": "Currency rates updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


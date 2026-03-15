import httpx
from sqlalchemy.orm import Session
from app.config import settings
from app.crud import update_currency_rate
import logging

logger = logging.getLogger(__name__)

async def fetch_and_update_rates(db: Session):
    """
    Fetches the latest exchange rates from ExchangeRate-API
    and updates the database. Uses THB as the base currency.
    """
    if not settings.EXCHANGERATE_API_KEY or settings.EXCHANGERATE_API_KEY == "your-exchangerate-api-key":
        logger.warning("EXCHANGERATE_API_KEY is missing or invalid. Skipping currency update.")
        return

    url = f"https://v6.exchangerate-api.com/v6/{settings.EXCHANGERATE_API_KEY}/latest/THB"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            if data and data.get("result") == "success":
                conversion_rates = data.get("conversion_rates", {})
                
                # Update specific supported currencies or all if preferred.
                # Let's update our target currencies explicitly.
                target_currencies = ["THB", "USD", "EUR", "GBP"]
                
                for code in target_currencies:
                    rate = conversion_rates.get(code)
                    if rate is not None:
                        # Database stores rate relative to THB.
                        # Since base is THB, the rate is exactly what we need.
                        update_currency_rate(db, code=code, rate=float(rate))
                        logger.info(f"Updated rate for {code}: {rate}")
            else:
                logger.error(f"Failed to fetch currency rates: {data.get('error-type')}")
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred while fetching currencies: {e}")
    except Exception as e:
        logger.error(f"Unexpected error while fetching currencies: {e}")

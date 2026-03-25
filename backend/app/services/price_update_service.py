import logging
from app.database import SessionLocal
from app.services import SerperService
from app import models, crud

logger = logging.getLogger(__name__)


async def run_daily_price_update():
    """
    Daily background job that sweeps all products, searches for current
    prices via Serper Shopping API, and upserts them into PriceHistory.
    Only inserts new records when prices actually change.
    """
    logger.info("🔄 Starting daily price update sweep...")
    db = SessionLocal()
    serper = SerperService()

    try:
        products = db.query(models.Product).all()
        updated_count = 0
        skipped_count = 0
        error_count = 0

        for product in products:
            try:
                # Search for product prices via Serper Shopping
                results = await serper.search_products(product.name, limit=10)
                normalized = serper.normalize_search_results(results)

                if not normalized:
                    skipped_count += 1
                    continue

                # Group by source and take best price per source
                source_prices = {}
                for item in normalized:
                    source = item["source_name"].lower()

                    # Classify into known marketplaces
                    if "amazon" in source:
                        key = "amazon"
                    elif "shopee" in source:
                        key = "shopee"
                    elif "lazada" in source:
                        key = "lazada"
                    else:
                        key = source[:30]  # Truncate unknown sources

                    price = item["price"]
                    currency = item.get("currency", "USD")

                    if price and price > 0:
                        if key not in source_prices or price < source_prices[key]["price"]:
                            source_prices[key] = {
                                "price": price,
                                "currency": currency,
                            }

                # Upsert each source price into PriceHistory
                for source_key, price_data in source_prices.items():
                    crud.upsert_price_history(
                        db=db,
                        product_id=product.id,
                        price=price_data["price"],
                        currency=price_data["currency"],
                        source=source_key,
                    )

                updated_count += 1

            except Exception as e:
                error_count += 1
                logger.warning(f"Failed to update price for '{product.name}': {e}")

        logger.info(
            f"✅ Daily price update complete: "
            f"{updated_count} updated, {skipped_count} skipped, {error_count} errors"
        )

    except Exception as e:
        logger.error(f"❌ Daily price update failed: {e}")
    finally:
        db.close()

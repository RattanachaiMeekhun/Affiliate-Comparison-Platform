import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import SessionLocal
from app.services.currency_service import fetch_and_update_rates

logger = logging.getLogger(__name__)

async def scheduled_currency_update():
    """
    Job that runs daily to fetch and update currency rates.
    It creates its own database session.
    """
    logger.info("Starting scheduled currency update...")
    db = SessionLocal()
    try:
        await fetch_and_update_rates(db)
        logger.info("Successfully completed scheduled currency update.")
    except Exception as e:
        logger.error(f"Error during scheduled currency update: {e}")
    finally:
        db.close()


def setup_scheduler():
    """
    Configures and starts the APScheduler with the background jobs.
    """
    scheduler = AsyncIOScheduler()
    
    # Run the currency update job once every day at 1:00 AM
    scheduler.add_job(scheduled_currency_update, 'cron', hour=1, minute=0, id='currency_update_job', replace_existing=True)
    
    scheduler.start()
    logger.info("Background scheduler started.")
    return scheduler

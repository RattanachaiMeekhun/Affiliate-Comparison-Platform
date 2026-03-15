from sqlalchemy import text
from app.database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_missing_column():
    """Adds the missing 'clicks' column to the 'affiliate_products' table."""
    sql = text("ALTER TABLE affiliate_products ADD COLUMN IF NOT EXISTS clicks NUMERIC(10, 0) DEFAULT 0;")
    
    with open("scripts/fix_status.txt", "w") as f:
        f.write("Starting...\n")
        try:
            with engine.connect() as conn:
                logger.info("Connecting to database...")
                f.write("Connecting...\n")
                conn.execute(sql)
                conn.commit()
                logger.info("Successfully added 'clicks' column.")
                f.write("SUCCESS\n")
        except Exception as e:
            logger.error(f"Error: {e}")
            f.write(f"ERROR: {e}\n")
            raise

if __name__ == "__main__":
    fix_missing_column()

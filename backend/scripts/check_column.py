from sqlalchemy import text, inspect
from app.database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_column():
    """Checks if the 'clicks' column exists in 'affiliate_products'."""
    try:
        inspector = inspect(engine)
        columns = inspector.get_columns('affiliate_products')
        column_names = [c['name'] for c in columns]
        
        with open("scripts/check_result.txt", "w") as f:
            if 'clicks' in column_names:
                f.write("EXISTS\n")
                logger.info("Column 'clicks' EXISTS.")
            else:
                f.write("MISSING\n")
                logger.info("Column 'clicks' is MISSING.")
            
            f.write(f"Columns: {', '.join(column_names)}\n")
            
    except Exception as e:
        logger.error(f"Error checking: {e}")
        with open("scripts/check_result.txt", "w") as f:
            f.write(f"ERROR: {e}\n")

if __name__ == "__main__":
    check_column()

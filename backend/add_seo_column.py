import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import engine

def add_col():
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_content TEXT;"))
            print("Successfully added seo_content column to categories table.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_col()

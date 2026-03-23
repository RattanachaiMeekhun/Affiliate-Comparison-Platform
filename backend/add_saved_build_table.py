import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import engine

def add_table():
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS saved_builds (
                    id UUID PRIMARY KEY,
                    user_id UUID NOT NULL REFERENCES users(id),
                    name VARCHAR NOT NULL,
                    items JSON NOT NULL,
                    total_price NUMERIC(10, 2) DEFAULT 0.0,
                    currency VARCHAR DEFAULT 'THB',
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
                );
            """))
            print("Successfully added saved_builds table.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_table()

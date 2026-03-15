from app.database import SessionLocal
from app import crud

def seed():
    db = SessionLocal()
    try:
        initial_rates = [
            {"code": "THB", "rate": 1.0},
            {"code": "USD", "rate": 0.028},
            {"code": "EUR", "rate": 0.026},
            {"code": "GBP", "rate": 0.022},
        ]
        for rate_data in initial_rates:
            crud.update_currency_rate(db, code=rate_data["code"], rate=rate_data["rate"])
        print("Currencies seeded successfully")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

from app.database import SessionLocal
from app.models import Product

db = SessionLocal()
products = db.query(Product).all()
total = len(products)
with_images = 0
for p in products:
    if p.image_url:
        with_images += 1

print(f"Total products: {total}")
print(f"Products with top-level image_url: {with_images}")
db.close()

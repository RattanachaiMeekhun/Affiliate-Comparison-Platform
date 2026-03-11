from app.database import SessionLocal
from app.models import Product, AffiliateProduct

db = SessionLocal()
products = db.query(Product).all()
total = len(products)
with_images = 0
for p in products:
    has_img = any(aff.image_url for aff in p.affiliate_products)
    if has_img:
        with_images += 1

print(f"Total products: {total}")
print(f"Products with at least one affiliate image: {with_images}")
db.close()

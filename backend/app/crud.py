from sqlalchemy.orm import Session
from . import models, schemas
import uuid


def get_product(db: Session, product_id: uuid.UUID):
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()


def create_products(db: Session, products_data: list[dict]):
    db_products = []
    for data in products_data:
        # Extract nested data
        affiliate_data = data.pop("affiliate_products", [])
        _ = data.pop("category_name", None)

        # Filter valid keys for Product model
        product_keys = [
            "name",
            "slug",
            "description",
            "specs",
            "ai_insight",
            "best_value",
            "trending_score",
            "category_id",
        ]
        p_data = {k: v for k, v in data.items() if k in product_keys}

        db_product = models.Product(**p_data)

        # Add affiliate products if present
        for aff in affiliate_data:
            aff_keys = [
                "source_name",
                "source_product_id",
                "source_url",
                "price",
                "currency",
                "raw_data",
            ]
            # Some prompts might return price as image_url or generic data, try to be safe
            a_data = {k: v for k, v in aff.items() if k in aff_keys}
            db_aff = models.AffiliateProduct(**a_data)
            db_product.affiliate_products.append(db_aff)

        db.add(db_product)
        db_products.append(db_product)

    db.commit()
    # Refresh to get IDs
    for p in db_products:
        db.refresh(p)
    return db_products


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()


def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def create_affiliate_product(
    db: Session, affiliate_product: schemas.AffiliateProductCreate
):
    db_affiliate_product = models.AffiliateProduct(**affiliate_product.dict())
    db.add(db_affiliate_product)
    db.commit()
    db.refresh(db_affiliate_product)
    return db_affiliate_product


def get_affiliate_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AffiliateProduct).offset(skip).limit(limit).all()

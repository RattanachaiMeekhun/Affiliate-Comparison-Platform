from datetime import datetime
from sqlalchemy.orm import Session
from . import models, schemas
import uuid
from slugify import slugify
from typing import List


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
            "price",
            "currency",
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
                "image_url",
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


def get_all_product_names(db: Session):
    return [name[0] for name in db.query(models.Product.name).all()]


def get_category(db: Session, category_id: uuid.UUID):
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()


def create_category(db: Session, category: schemas.CategoryCreate):
    category_data = category.dict()
    category_data["id"] = uuid.uuid4()
    category_data["created_at"] = datetime.now()
    category_data["updated_at"] = datetime.now()
    if not category_data.get("slug"):
        category_data["slug"] = slugify(category_data["name"])
    parent_id = category_data.pop("parent_id", None)
    db_category = models.Category(**category_data)
    if parent_id:
        db_category.parent_id = parent_id
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


def get_categories_by_names(db: Session, names: str):
    names_list = [name.strip() for name in names.split(",")]
    return db.query(models.Category).filter(models.Category.name.in_(names_list)).all()


def update_category(db: Session, categorise: List[models.Category]):
    db.commit()
    for category in categorise:
        db.refresh(category)
    return categorise

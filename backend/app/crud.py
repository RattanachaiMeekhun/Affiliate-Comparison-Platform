from datetime import datetime
from . import models, schemas
from sqlalchemy.orm import Session, joinedload
import uuid
from slugify import slugify
from typing import List


def get_product(db: Session, product_id: uuid.UUID):
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def get_products(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Product)
        .options(joinedload(models.Product.affiliate_products))
        .order_by(models.Product.image_url.is_not(None).desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


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
            "image_url",
        ]
        p_data = {k: v for k, v in data.items() if k in product_keys}

        # Enforce HTTPS on product image
        if p_data.get("image_url") and not p_data["image_url"].startswith("https://"):
            p_data["image_url"] = None

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

            # Enforce HTTPS on affiliate image
            if a_data.get("image_url") and not a_data["image_url"].startswith(
                "https://"
            ):
                a_data["image_url"] = None

            db_aff = models.AffiliateProduct(**a_data)
            db_product.affiliate_products.append(db_aff)

        # Pick first image logic: if product has no image, use the first affiliate image
        if not db_product.image_url:
            for aff in db_product.affiliate_products:
                if aff.image_url:
                    db_product.image_url = aff.image_url
                    break

        db.add(db_product)
        db_products.append(db_product)

        # Record initial price in PriceHistory if price exists
        if db_product.price:
            history = models.PriceHistory(
                product_id=db_product.id,
                price=db_product.price,
                currency=db_product.currency,
            )
            db.add(history)

    db.commit()
    # Refresh to get IDs
    for p in db_products:
        db.refresh(p)
    return db_products


def update_products(db: Session, products: List[models.Product]):
    db.commit()
    for product in products:
        db.refresh(product)
    return products


def get_all_product_names(db: Session):
    return [name[0] for name in db.query(models.Product.name).all()]


def get_product_names_by_category(db: Session, category_id: uuid.UUID):
    return [
        name[0]
        for name in db.query(models.Product.name)
        .filter(models.Product.category_id == category_id)
        .all()
    ]


def get_products_by_category(
    db: Session, category: str, skip: int = 0, limit: int = 100
):
    # Try to see if 'category' is a UUID (category_id)
    try:
        uuid.UUID(category)
        return (
            db.query(models.Product)
            .options(joinedload(models.Product.affiliate_products))
            .filter(models.Product.category_id == category)
            .offset(skip)
            .limit(limit)
            .all()
        )
    except ValueError:
        # If not a UUID, assume it's a slug
        return (
            db.query(models.Product)
            .options(joinedload(models.Product.affiliate_products))
            .join(models.Category)
            .filter(models.Category.slug == category)
            .offset(skip)
            .limit(limit)
            .all()
        )


def get_category(db: Session, category_id: uuid.UUID):
    return (
        db.query(models.Category)
        .filter(models.Category.id == category_id)
        .order_by(models.Category.sort_order.asc())
        .first()
    )


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()


def get_category_by_slug(db: Session, slug: str):
    return db.query(models.Category).filter(models.Category.slug == slug).first()


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


def get_currency_rates(db: Session):
    return db.query(models.CurrencyRate).all()


def update_currency_rate(db: Session, code: str, rate: float):
    db_rate = (
        db.query(models.CurrencyRate).filter(models.CurrencyRate.code == code).first()
    )
    if db_rate:
        db_rate.rate = rate
    else:
        db_rate = models.CurrencyRate(code=code, rate=rate)
        db.add(db_rate)
    db.commit()
    db.refresh(db_rate)
    return db_rate

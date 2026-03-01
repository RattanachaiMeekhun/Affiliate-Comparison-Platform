from sqlalchemy.orm import Session
from . import models, schemas
import uuid

def get_product(db: Session, product_id: uuid.UUID):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def create_affiliate_product(db: Session, affiliate_product: schemas.AffiliateProductCreate):
    db_affiliate_product = models.AffiliateProduct(**affiliate_product.dict())
    db.add(db_affiliate_product)
    db.commit()
    db.refresh(db_affiliate_product)
    return db_affiliate_product

def get_affiliate_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AffiliateProduct).offset(skip).limit(limit).all()

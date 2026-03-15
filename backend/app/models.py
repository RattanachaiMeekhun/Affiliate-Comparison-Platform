from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    ForeignKey,
    DateTime,
    Numeric,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.database import Base



class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    meta_title = Column(String(160))
    meta_description = Column(String(255))
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    icon_url = Column(String)
    sort_order = Column(Numeric(5, 0), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), index=True)
    description = Column(Text)
    specs = Column(JSON)  # Store technical specs as JSONB
    ai_insight = Column(Text)
    best_value = Column(Boolean, default=False)
    trending_score = Column(Numeric(5, 2), default=0.0)  # For homepage curation
    price = Column(Numeric(10, 2))
    currency = Column(String, default="THB")
    image_url = Column(String)  # Main product image

    category = relationship("Category", back_populates="products")
    affiliate_products = relationship("AffiliateProduct", back_populates="product")
    price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")


class AffiliateProduct(Base):
    __tablename__ = "affiliate_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True, index=True)
    source_name = Column(String, nullable=False)  # e.g., Lazada, Shopee
    source_product_id = Column(String, nullable=False)
    source_url = Column(String, nullable=False)
    price = Column(Numeric(10, 2))
    currency = Column(String, default="THB")
    image_url = Column(String)
    raw_data = Column(JSON)
    clicks = Column(Numeric(10, 0), default=0)
    last_scraped = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="affiliate_products")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), index=True)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="THB")
    timestamp = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="price_history")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CurrencyRate(Base):
    __tablename__ = "currency_rates"

    code = Column(String, primary_key=True)  # e.g., USD, EUR
    rate = Column(Numeric(10, 6), nullable=False)  # Relative to base THB
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

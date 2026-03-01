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
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    description = Column(Text)
    specs = Column(JSON)  # Store technical specs as JSONB
    ai_insight = Column(Text)
    best_value = Column(Boolean, default=False)
    trending_score = Column(Numeric(5, 2), default=0.0)  # For homepage curation

    category = relationship("Category", back_populates="products")

    affiliate_products = relationship("AffiliateProduct", back_populates="product")


class AffiliateProduct(Base):
    __tablename__ = "affiliate_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)
    source_name = Column(String, nullable=False)  # e.g., Lazada, Shopee
    source_product_id = Column(String, nullable=False)
    source_url = Column(String, nullable=False)
    price = Column(Numeric(10, 2))
    currency = Column(String, default="THB")
    raw_data = Column(JSON)
    last_scraped = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="affiliate_products")

from pydantic import BaseModel, UUID4
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class CategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[UUID4] = None
    is_active: bool = True
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    icon_url: Optional[str] = None
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AffiliateProductBase(BaseModel):
    source_name: str
    source_product_id: str
    source_url: str
    price: Decimal
    currency: str = "THB"
    image_url: Optional[str] = None
    raw_data: Optional[dict] = None


class AffiliateProductCreate(AffiliateProductBase):
    product_id: Optional[UUID4] = None


class AffiliateProduct(AffiliateProductBase):
    id: UUID4
    product_id: Optional[UUID4] = None
    last_scraped: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    ai_insight: Optional[str] = None
    best_value: bool = False
    category_id: Optional[UUID4] = None
    specs: Optional[dict] = None
    trending_score: Decimal = Decimal("0.0")
    price: Optional[Decimal] = None
    currency: str = "THB"
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: UUID4
    specs: Optional[dict] = None
    trending_score: Decimal
    affiliate_products: List[AffiliateProduct] = []

    class Config:
        from_attributes = True



class ProductImageUpdateResponse(BaseModel):
    total_updated: int
    total_errors: int
    products: List[Product]
    errors: List[dict]


class CurrencyRateBase(BaseModel):
    code: str
    rate: Decimal


class CurrencyRate(CurrencyRateBase):
    updated_at: datetime

    class Config:
        from_attributes = True


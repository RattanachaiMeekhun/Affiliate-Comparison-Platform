from pydantic import BaseModel, UUID4, field_validator
from typing import List, Optional, Any
from datetime import datetime
from decimal import Decimal


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[UUID4] = None
    is_active: bool = True
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    seo_content: Optional[str] = None
    icon_url: Optional[str] = None
    sort_order: Optional[int] = 0


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: UUID4
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

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
    trending_score: float = 0.0
    price: Optional[Decimal] = None
    currency: str = "THB"
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: UUID4
    category_name: Optional[str] = None
    specs: Optional[dict] = None
    trending_score: float = 0.0
    affiliate_url: Optional[str] = None
    affiliate_products: List[AffiliateProduct] = []
    price_min: Optional[Decimal] = None
    price_max: Optional[Decimal] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PriceHistoryEntry(BaseModel):
    id: UUID4
    source: str = "system"
    price: Decimal
    currency: str = "THB"
    timestamp: datetime

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


class SavedBuildBase(BaseModel):
    name: str
    items: list
    total_price: Decimal = Decimal("0.0")
    currency: str = "THB"

class SavedBuildCreate(SavedBuildBase):
    pass

class SavedBuild(SavedBuildBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class UserResponse(UserBase):
    id: UUID4
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AmazonRawData(BaseModel):
    title: Optional[str] = None
    snippet: Optional[str] = None
    position: Optional[int] = None


class AmazonSearchResult(BaseModel):
    source_name: str = "Amazon"
    source_product_id: str
    source_url: str
    price: Decimal
    currency: str = "USD"
    raw_data: AmazonRawData


class ShopeeProductImport(BaseModel):
    itemid: str
    shopid: str
    title: str
    description: Optional[str] = None
    price: Decimal
    sale_price: Optional[Decimal] = None
    image_link: str
    product_link: str
    global_category3: Optional[str] = None
    global_brand: Optional[str] = None
    category_id: Optional[UUID4] = None

    @field_validator('itemid', 'shopid', mode='before')
    @classmethod
    def cast_to_string(cls, v: Any) -> str:
        return str(v)


class ShopeeImportRequest(BaseModel):
    products: List[ShopeeProductImport]


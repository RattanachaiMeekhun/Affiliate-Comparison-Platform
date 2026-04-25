from app.services import SerperService, affiliate_service
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database, models
from app.ai.searchagent import build_search_graph, TokenTracker, set_tracker
from langchain_core.messages import HumanMessage
from app.ai.helper import _parse_json_response
from slugify import slugify
from pydantic import BaseModel
import uuid
from datetime import datetime
import json
import asyncio
from langchain_core.messages import SystemMessage
from app.ai.llm import LLMProvider
from app.services.storage_service import StorageService

router = APIRouter(prefix="/products", tags=["products"])


async def process_product_ai_task(product_id: uuid.UUID):
    """
    Background task to generate AI insights, embeddings, and find Amazon links.
    This runs after the import request is finished to avoid blocking.
    """
    from app.database import SessionLocal
    from ..services.insight_service import (
        generate_product_insight,
        generate_product_embedding,
        build_product_search_text,
    )
    from app.services.amazon_feed_service import AmazonFeedService
    from app.services.serper_service import SerperService

    db = SessionLocal()
    try:
        # 1. Fetch the product
        product = crud.get_product(db, product_id)
        if not product:
            return

        # 2. Generate Insight
        insight = await generate_product_insight(product.name, product.description or "")
        if insight:
            crud.update_product_insight(db, product_id, insight)
            # Refresh product to get updated insight
            db.refresh(product)

        # 3. Generate Embedding (Name + Desc + Specs + Insight)
        search_text = build_product_search_text(
            product.name, 
            product.description or "", 
            product.specs, 
            product.ai_insight
        )
        embedding = await generate_product_embedding(search_text)
        if embedding:
            crud.update_product_embedding(db, product_id, embedding)

        # 4. Amazon Link Matching (Skip quietly if not found)
        try:
            serper = SerperService()
            amazon_service = AmazonFeedService(serper)
            await amazon_service.update_single_product_amazon_feed(db, product_id)
        except Exception as e:
            print(f"Background Amazon search skipped for {product_id}: {e}")

    except Exception as e:
        print(f"Error in background AI task for {product_id}: {e}")
    finally:
        db.close()

async def process_imported_products_pipeline(product_ids: List[uuid.UUID]):
    """
    Sequentially processes a list of products in the background.
    """
    for pid in product_ids:
        await process_product_ai_task(pid)
        # Minor sleep to prevent rapid-fire API calls
        await asyncio.sleep(0.5)


@router.get("/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0,
    limit: int = 100,
    category: str | None = None,
    db: Session = Depends(database.get_db),
):
    try:
        products = []
        if category:
            products = crud.get_products_by_category(
                db, category=category, skip=skip, limit=limit
            )
        else:
            products = crud.get_products(db, skip=skip, limit=limit)
        
        # Inject affiliate URL and price range
        for p in products:
            p.affiliate_url = affiliate_service.generate_amazon_search_url(p.name)
            price_min, price_max = crud.get_price_range(db, p.id)
            p.price_min = price_min
            p.price_max = price_max
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: str, db: Session = Depends(database.get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Inject affiliate URL and price range
    db_product.affiliate_url = affiliate_service.generate_amazon_search_url(db_product.name)
    price_min, price_max = crud.get_price_range(db, db_product.id)
    db_product.price_min = price_min
    db_product.price_max = price_max
    return db_product


@router.get("/slug/{slug}", response_model=schemas.Product)
def read_product_by_slug(slug: str, db: Session = Depends(database.get_db)):
    db_product = crud.get_product_by_slug(db, slug=slug)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Inject affiliate URL and price range
    db_product.affiliate_url = affiliate_service.generate_amazon_search_url(db_product.name)
    price_min, price_max = crud.get_price_range(db, db_product.id)
    db_product.price_min = price_min
    db_product.price_max = price_max
    return db_product


@router.post("/sync-images")
async def sync_images(
    re_search: bool = False, limit: int = 50, db: Session = Depends(database.get_db)
):
    """
    Sync missing product images from existing affiliate listings.
    If re_search is True, it will also try to find new listings via the AI agent
    for products that still have no image.
    """
    products = (
        db.query(models.Product)
        .filter(models.Product.image_url.is_(None))
        .limit(limit)
        .all()
    )
    updated_count = 0
    searched_count = 0

    workflow = build_search_graph()
    storage = StorageService()

    for product in products:
        # 1. Try existing affiliates
        for aff in product.affiliate_products:
            if aff.image_url and aff.image_url.startswith("https://"):
                product.image_url = aff.image_url
                updated_count += 1
                break

        # 2. Re-search if still missing and re_search is True
        if not product.image_url and re_search:
            try:
                state = await workflow.ainvoke(
                    {"messages": [HumanMessage(content=product.name)]}
                )
                last_specs = state.get("specs", "")
                data = _parse_json_response(last_specs)

                if data:
                    # Look for main image in parsed JSON
                    new_img = None
                    if isinstance(data, dict):
                        new_img = data.get("image_url") or (
                            data.get("product", {})
                            if isinstance(data.get("product"), dict)
                            else {}
                        ).get("image_url")

                    if new_img and new_img.startswith("https://"):
                        # Upload to R2
                        r2_url = await storage.upload_image_from_url(
                            new_img, product.slug
                        )
                        product.image_url = r2_url
                        updated_count += 1
                        searched_count += 1

                    # Also update/add affiliate products (CRUD does this but we need logic here)
                    # For simplicity, we just update the main image for now in this sync
            except Exception as e:
                print(f"Failed to re-search image for {product.name}: {e}")

    db.commit()
    return {
        "status": "success",
        "products_checked": len(products),
        "images_updated": updated_count,
        "ai_searches_performed": searched_count,
    }


@router.post("/feed-new-products")
async def feed_new_products(products: str, db: Session = Depends(database.get_db)):
    """
    Feed one or more product names (comma or newline separated).
    Each product is processed individually through the AI search graph
    to avoid LLM output-token truncation.

    Returns token usage per product and grand total.
    """
    import re

    # ── 1. Split input into individual product names ──
    raw_names = re.split(r"[,\n]+", products)
    product_names = [name.strip() for name in raw_names if name.strip()]

    if not product_names:
        raise HTTPException(status_code=400, detail="No product names provided")

    print(f"📦 Processing {len(product_names)} products individually...")

    workflow = build_search_graph()
    storage = StorageService()
    all_results = []
    errors = []
    token_usage_per_product = []
    grand_total_input = 0
    grand_total_output = 0
    grand_total_tokens = 0

    # ── 2. Process each product one-by-one ──
    for idx, name in enumerate(product_names, 1):
        print(f"\n{'=' * 50}")
        print(f"🔍 [{idx}/{len(product_names)}] Processing: {name}")
        print(f"{'=' * 50}")

        # Create a fresh tracker for this product
        tracker = TokenTracker()
        set_tracker(tracker)

        try:
            state = await workflow.ainvoke({"messages": [HumanMessage(content=name)]})

            last_specs = state.get("specs", "")
            if not last_specs:
                errors.append({"product": name, "error": "AI returned empty response"})
                continue

            data = _parse_json_response(last_specs)
            if not data:
                errors.append({"product": name, "error": "Failed to parse AI JSON"})
                continue

            # Normalise into a list of product dicts
            if isinstance(data, dict):
                if "product" in data:
                    product_data = data["product"]
                    product_data["slug"] = slugify(product_data.get("name", name))
                    if "listings" in data:
                        product_data["affiliate_products"] = data["listings"]
                    processed = [product_data]
                else:
                    data["slug"] = slugify(data.get("name", name))
                    processed = [data]
            elif isinstance(data, list):
                for item in data:
                    item["slug"] = slugify(item.get("name", name))
                processed = data
            else:
                errors.append({"product": name, "error": "Invalid data format"})
                continue

            # Upload images to R2
            for item in processed:
                if item.get("image_url"):
                    item["image_url"] = await storage.upload_image_from_url(
                        item["image_url"], item["slug"]
                    )

                if "affiliate_products" in item:
                    for aff in item["affiliate_products"]:
                        if aff.get("image_url"):
                            aff["image_url"] = await storage.upload_image_from_url(
                                aff["image_url"], item["slug"]
                            )

            # ── 3. Save to DB ──
            saved = crud.create_products(db, processed)
            all_results.extend(processed)
            print(f"    ✅ Saved {len(saved)} product(s) for '{name}'")

        except Exception as e:
            import traceback

            traceback.print_exc()
            errors.append({"product": name, "error": str(e)})
            print(f"    ❌ Failed: {e}")

        # Record token usage for this product regardless of success/failure
        summary = tracker.summary()
        token_usage_per_product.append({"product": name, **summary})
        grand_total_input += summary["total_input_tokens"]
        grand_total_output += summary["total_output_tokens"]
        grand_total_tokens += summary["total_tokens"]

        print(
            f"    📊 Subtotal: in={summary['total_input_tokens']:,}  "
            f"out={summary['total_output_tokens']:,}  "
            f"total={summary['total_tokens']:,}"
        )

    # Clear tracker
    set_tracker(None)

    # ── 4. Print grand total ──
    print("\n" + "=" * 50)
    print(f"🏁 GRAND TOTAL TOKEN USAGE")
    print(f"   Input:  {grand_total_input:,}")
    print(f"   Output: {grand_total_output:,}")
    print(f"   Total:  {grand_total_tokens:,}")
    print("=" * 50)

    # ── 5. Return summary ──
    return {
        "total_requested": len(product_names),
        "total_saved": len(all_results),
        "total_errors": len(errors),
        "products": all_results,
        "errors": errors,
        "token_usage": {
            "per_product": token_usage_per_product,
            "grand_total": {
                "input_tokens": grand_total_input,
                "output_tokens": grand_total_output,
                "total_tokens": grand_total_tokens,
            },
        },
    }


class FeedCategoryProductsRequest(BaseModel):
    category_id: uuid.UUID | None = None


@router.post("/feed-category-products")
async def feed_category_products(
    request: FeedCategoryProductsRequest, db: Session = Depends(database.get_db)
):
    """
    Feed up to 10 products for a specific category or for all categories if none provided.
    Products already in the system will be avoided to prevent duplication.
    """
    if request.category_id:
        categories = [crud.get_category(db, request.category_id)]
        if not categories[0]:
            raise HTTPException(status_code=404, detail="Category not found")
    else:
        categories = crud.get_categories(db, limit=100)

    existing_product_names = set(crud.get_all_product_names(db))

    workflow = build_search_graph()
    storage = StorageService()
    llm = LLMProvider.get_model(temperature=0.7)

    all_results = []
    errors = []

    for category in categories:
        print(f"\n{'=' * 50}")
        print(f"📦 Processing category: {category.name}")
        print(f"{'=' * 50}")

        existing_in_category = crud.get_product_names_by_category(db, category.id)
        products_to_process = []
        MAX_RETRIES = 3

        for attempt in range(MAX_RETRIES):
            if len(products_to_process) >= 10:
                break

            needed = 10 - len(products_to_process)

            prompt = f"""
You are a product researcher.
Generate a list of exactly 30 popular, specific product names (e.g., exact models like 'Apple iPhone 15 Pro 256GB' or 'Sony WH-1000XM5') that strictly belong to the category '{category.name}'.

CRITICAL RULES:
1. Try to generate a diverse set of brands, models, and price ranges.
2. Return ONLY a valid JSON array of strings containing the 30 product names. DO NOT wrap in markdown blocks like ```json ... ```. Just the raw array.
"""
            if existing_in_category:
                prompt += f"\n3. DO NOT INCLUDE any of these products, as they already exist: {existing_in_category[-100:]}"

            try:
                response = llm.invoke([SystemMessage(content=prompt)])
                content = response.content.strip()

                if content.startswith("```json"):
                    content = content[7:-3].strip()
                elif content.startswith("```"):
                    content = content[3:-3].strip()

                new_product_names = json.loads(content)

                if not isinstance(new_product_names, list):
                    continue

                # Python-side filtering: drop duplicates globally
                filtered_names = [
                    n for n in new_product_names if n not in existing_product_names
                ]

                # Take what we need
                taken = filtered_names[:needed]
                products_to_process.extend(taken)

                # Add to local cache to avoid in the next attempt if necessary
                existing_in_category.extend(taken)

                # Add to global cache to prevent crossover between categories
                for t in taken:
                    existing_product_names.add(t)

            except Exception as e:
                import traceback

                traceback.print_exc()
                print(
                    f"    ⚠ Attempt {attempt + 1} failed to generate category products: {e}"
                )
                continue

        if not products_to_process:
            errors.append(
                {
                    "category": category.name,
                    "error": "Could not generate any new unique products after retries",
                }
            )
            print(f"    ❌ No unique products found for category {category.name}")
            continue

        print(
            f"🔍 Final selection: {len(products_to_process)} unique products for {category.name}: {products_to_process}"
        )

        for name in products_to_process:
            tracker = TokenTracker()
            set_tracker(tracker)
            try:
                state = await workflow.ainvoke(
                    {"messages": [HumanMessage(content=name)]}
                )

                last_specs = state.get("specs", "")
                if not last_specs:
                    errors.append(
                        {"product": name, "error": "AI returned empty response"}
                    )
                    continue

                data = _parse_json_response(last_specs)
                if not data:
                    errors.append({"product": name, "error": "Failed to parse AI JSON"})
                    continue

                if isinstance(data, dict):
                    if "product" in data:
                        product_data = data["product"]
                        product_data["slug"] = slugify(product_data.get("name", name))
                        product_data["category_id"] = category.id
                        if "listings" in data:
                            product_data["affiliate_products"] = data["listings"]
                        processed = [product_data]
                    else:
                        data["slug"] = slugify(data.get("name", name))
                        data["category_id"] = category.id
                        processed = [data]
                elif isinstance(data, list):
                    for item in data:
                        item["slug"] = slugify(item.get("name", name))
                        item["category_id"] = category.id
                    processed = data
                else:
                    errors.append({"product": name, "error": "Invalid data format"})
                    continue

                # Upload images to R2
                for item in processed:
                    if item.get("image_url"):
                        item["image_url"] = await storage.upload_image_from_url(
                            item["image_url"], item["slug"]
                        )

                    if "affiliate_products" in item:
                        for aff in item["affiliate_products"]:
                            if aff.get("image_url"):
                                aff["image_url"] = await storage.upload_image_from_url(
                                    aff["image_url"], item["slug"]
                                )

                saved = crud.create_products(db, processed)

                # Convert to a stable dictionary representation before the next commit
                for p, s in zip(processed, saved):
                    p["id"] = str(s.id)

                all_results.extend(processed)

                for p in processed:
                    existing_product_names.add(p.get("name", name))

                print(f"    ✅ Saved {len(saved)} product(s) for '{name}'")
                
                # Strategic yield to prevent event loop starvation and potential timeouts
                await asyncio.sleep(0.1)

            except Exception as e:
                import traceback

                traceback.print_exc()
                errors.append({"product": name, "error": str(e)})
                print(f"    ❌ Failed: {e}")
            finally:
                set_tracker(None)

    return {
        "total_saved": len(all_results),
        "total_errors": len(errors),
        "products": all_results,
        "errors": errors,
    }


@router.patch("/update-images", response_model=schemas.ProductImageUpdateResponse)
async def update_product_images(
    category_name: str,
    db: Session = Depends(database.get_db),
):
    try:
        """
        Update images for existing products.
        Searches for new images if none exist or if the current one is invalid.
        """
        categories = crud.get_categories_by_names(db, category_name)
        if not categories:
            raise HTTPException(status_code=404, detail="Category not found")

        products = crud.get_products_by_category(db, categories[0].id)
        storage = StorageService()
        serper = SerperService()

        updated_products = []
        errors = []

        for product in products:
            try:
                # Check if we need to update the image
                needs_update = False
                if not product.image_url or not product.image_url.startswith("http"):
                    needs_update = True
                else:
                    # Optional: Add a check here to verify if the current image URL is still valid
                    # For now, we'll just update if it's missing or invalid format
                    pass

                if needs_update:
                    # Search for a new image
                    search_query = f"{product.name} product image"
                    new_image_url = await serper.search_image(search_query)

                    if new_image_url and new_image_url.startswith("http"):
                        # Upload to R2
                        try:
                            updated_url = await storage.upload_image_from_url(
                                new_image_url, product.slug
                            )
                            product.image_url = updated_url
                            updated_products.append(product)
                            print(f"✅ Updated image for '{product.name}'")
                        except Exception as e:
                            errors.append({"product": product.name, "error": str(e)})
                            print(
                                f"❌ Failed to upload image for '{product.name}': {e}"
                            )
                    else:
                        errors.append(
                            {"product": product.name, "error": "No valid image found"}
                        )
                        print(f"❌ No valid image found for '{product.name}'")

            except Exception as e:
                errors.append({"product": product.name, "error": str(e)})
                print(f"❌ Error processing '{product.name}': {e}")

        # Save all updated products
        if updated_products:
            crud.update_products(db, updated_products)

        return {
            "total_updated": len(updated_products),
            "total_errors": len(errors),
            "products": updated_products,
            "errors": errors,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/import-shopee")
async def import_shopee(
    request: schemas.ShopeeImportRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    """
    Import products from Shopee JSON format.
    Handles duplication by source_product_id (itemid).
    Links to existing products by name slug OR semantic matching if titles differ.
    """
    from app.services.insight_service import (
        clean_product_title, 
        generate_product_embedding,
        build_product_search_text
    )
    
    success_count = 0
    skip_count = 0
    error_count = 0
    results = []
    successful_product_ids = []
    has_batch_error = False
    
    # 1. In-memory Batch Filtering (deduplicate within the upload)
    unique_items = []
    seen_batch_itemids = set()
    for item in request.products:
        if item.itemid not in seen_batch_itemids:
            unique_items.append(item)
            seen_batch_itemids.add(item.itemid)
        else:
            skip_count += 1
            results.append({"itemid": item.itemid, "status": "skipped_batch_duplicate"})

    for item in unique_items:
        try:            
            # 2. Check if this Shopee listing already exists in DB
            existing_aff = (
                db.query(models.AffiliateProduct)
                .filter(
                    models.AffiliateProduct.source_name == "Shopee",
                    models.AffiliateProduct.source_product_id == str(item.itemid),
                )
                .first()
            )

            if existing_aff:
                new_price = item.sale_price or item.price
                # Update price if changed
                if float(existing_aff.price) != float(new_price):
                    existing_aff.price = new_price
                    existing_aff.last_scraped = datetime.utcnow()
                    
                    # Also log to PriceHistory
                    crud.upsert_price_history(
                        db=db,
                        product_id=existing_aff.product_id,
                        price=float(new_price),
                        currency=existing_aff.currency,
                        source="shopee"
                    )
                    
                    results.append({"itemid": item.itemid, "status": "updated_price"})
                    success_count += 1
                else:
                    results.append({"itemid": item.itemid, "status": "skipped"})
                    skip_count += 1
                continue

            # 3. Find or create the main Product
            clean_title = await clean_product_title(item.title)
            name_slug = slugify(clean_title)
            
            # Strategy A: Exact Slug Match
            db_product = crud.get_product_by_slug(db, name_slug)

            # Strategy B: Semantic Search (if no slug match)
            if not db_product:
                # Generate embedding for the new product title/description
                search_text = build_product_search_text(clean_title, item.description, None, None)
                new_embedding = await generate_product_embedding(search_text)
                
                # Check for similar products in DB (threshold 0.15 = ~85% similarity)
                db_product = crud.get_similar_product(db, new_embedding, threshold=0.15)
                
                if db_product:
                    print(f"🔍 Semantic Match: '{clean_title}' matched existing product '{db_product.name}' (linking)")

            if not db_product:
                # Create new product
                new_product_data = {
                    "name": clean_title,
                    "slug": name_slug,
                    "description": item.description,
                    "category_id": item.category_id,
                    "price": float(item.price),
                    "image_url": item.image_link,
                }
                db_product = crud.create_product(db, schemas.ProductCreate(**new_product_data))
                successful_product_ids.append(db_product.id)

            # 4. Create the Affiliate Listing
            raw_data = {
                "itemid": item.itemid,
                "shopid": item.shopid,
                "sale_price": str(item.sale_price) if item.sale_price else None,
                "global_category3": item.global_category3,
                "global_brand": item.global_brand,
            }

            new_aff = models.AffiliateProduct(
                product_id=db_product.id,
                source_name="Shopee",
                source_product_id=str(item.itemid),
                source_url=item.product_link,
                price=float(item.sale_price or item.price),
                image_url=item.image_link,
                raw_data=raw_data,
                last_scraped=datetime.utcnow()
            )
            db.add(new_aff)
            
            # Initial Price History
            crud.upsert_price_history(
                db=db,
                product_id=db_product.id,
                price=float(new_aff.price),
                currency=new_aff.currency,
                source="shopee"
            )

            results.append({"itemid": item.itemid, "status": "imported", "product_id": str(db_product.id)})
            success_count += 1

        except Exception as e:
            print(f"Failed to process Shopee item {item.itemid}: {e}")
            error_count += 1
            has_batch_error = True

    # 5. Commit changes
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Database commit failed: {e}")
        has_batch_error = True

    # 6. Trigger Background tasks ONLY if no batch errors
    if not has_batch_error and successful_product_ids:
        print(f"🚀 Triggering background pipeline for {len(successful_product_ids)} products")
        background_tasks.add_task(process_imported_products_pipeline, successful_product_ids)

    return {
        "status": "completed",
        "has_batch_error": has_batch_error,
        "imported": success_count,
        "skipped": skip_count,
        "errors": error_count,
        "results": results,
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from app.ai.searchagent import build_search_graph, TokenTracker, set_tracker
from langchain_core.messages import HumanMessage
from app.ai.helper import _parse_json_response
from slugify import slugify
from pydantic import BaseModel
import uuid
import json
from langchain_core.messages import SystemMessage
from app.ai.llm import LLMProvider

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)
):
    return crud.get_products(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: str, db: Session = Depends(database.get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


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
    print(f"\n{'=' * 50}")
    print(f"🏁 GRAND TOTAL TOKEN USAGE")
    print(f"   Input:  {grand_total_input:,}")
    print(f"   Output: {grand_total_output:,}")
    print(f"   Total:  {grand_total_tokens:,}")
    print(f"{'=' * 50}")

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
    llm = LLMProvider.get_model(temperature=0.7)

    all_results = []
    errors = []

    for category in categories:
        print(f"\n{'=' * 50}")
        print(f"📦 Processing category: {category.name}")
        print(f"{'=' * 50}")

        prompt = f"""
You are a product researcher.
Generate a list of exactly 10 popular, specific product names (e.g., exact models like 'Apple iPhone 15 Pro 256GB' or 'Sony WH-1000XM5') that strictly belong to the category '{category.name}'.

CRITICAL RULES:
1. DO NOT include any of the following products, as they already exist in our system:
{list(existing_product_names)[:1000]}
2. Return ONLY a valid JSON array of strings containing the 10 product names. DO NOT wrap in markdown blocks like ```json ... ```. Just the raw array.
"""

        try:
            response = llm.invoke([SystemMessage(content=prompt)])
            content = response.content.strip()

            if content.startswith("```json"):
                content = content[7:-3].strip()
            elif content.startswith("```"):
                content = content[3:-3].strip()

            new_product_names = json.loads(content)

            if not isinstance(new_product_names, list):
                errors.append(
                    {"category": category.name, "error": "LLM did not return a list"}
                )
                continue

            # Filter duplicates just in case
            new_product_names = [
                n for n in new_product_names if n not in existing_product_names
            ][:10]

            print(
                f"🔍 Generated {len(new_product_names)} unique products for {category.name}: {new_product_names}"
            )

            for name in new_product_names:
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
                        errors.append(
                            {"product": name, "error": "Failed to parse AI JSON"}
                        )
                        continue

                    if isinstance(data, dict):
                        if "product" in data:
                            product_data = data["product"]
                            product_data["slug"] = slugify(
                                product_data.get("name", name)
                            )
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

                    saved = crud.create_products(db, processed)

                    # Convert to a stable dictionary representation before the next commit
                    for p, s in zip(processed, saved):
                        p["id"] = str(s.id)

                    all_results.extend(processed)

                    for p in processed:
                        existing_product_names.add(p.get("name", name))

                    print(f"    ✅ Saved {len(saved)} product(s) for '{name}'")

                except Exception as e:
                    import traceback

                    traceback.print_exc()
                    errors.append({"product": name, "error": str(e)})
                    print(f"    ❌ Failed: {e}")
                finally:
                    set_tracker(None)

        except Exception as e:
            import traceback

            traceback.print_exc()
            errors.append({"category": category.name, "error": str(e)})
            print(f"    ❌ Failed category generation: {e}")

    return {
        "total_saved": len(all_results),
        "total_errors": len(errors),
        "products": all_results,
        "errors": errors,
    }

import json
import re
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.llm import LLMProvider
from app.ai.setbuilder.state import SetBuilderState
from app.ai.setbuilder.prompt import (
    SETBUILDER_SYSTEM_PROMPT,
    SETBUILDER_WITH_CATALOGUE_PROMPT,
)
from app.services.vector_service import VectorService


# ── Budget label → (min_usd, max_usd) mapping ──
BUDGET_RANGES = {
    "Budget (Under $500)": (0, 500),
    "Mid-Range ($500 - $1,000)": (500, 1000),
    "High-End ($1,000 - $2,000)": (1000, 2000),
    "Enthusiast ($2,000 - $3,500)": (2000, 3500),
    "No Limit ($3,500+)": (3500, 999_999),
}

def get_exchange_rate(target_currency: str = "USD") -> float:
    """
    Returns the exchange rate from THB to target_currency.
    Defaults to 1/36 USD/THB if not found.
    """
    from app.database import SessionLocal
    from app.models import CurrencyRate
    
    db = SessionLocal()
    try:
        rate_obj = db.query(CurrencyRate).filter(CurrencyRate.code == target_currency).first()
        if rate_obj:
            return float(rate_obj.rate)
    except Exception as e:
        print(f"Error fetching rate: {e}")
    finally:
        db.close()
    
    # Fallback rates (relative to THB)
    fallbacks = {
        "THB": 1.0,
        "USD": 0.028, # ~36 THB/USD
    }
    return fallbacks.get(target_currency, 1.0)

def parse_budget(budget_str: str) -> tuple[float, float, str]:
    """
    Parses a budget string like 'Under ฿35,000' or 'Mid-Range ($500 - $1,000)'
    Returns (min_val, max_val, currency_code)
    """
    # 1. Check predefined ranges first
    if budget_str in BUDGET_RANGES:
        min_usd, max_usd = BUDGET_RANGES[budget_str]
        return min_usd, max_usd, "USD"
    
    # 2. Extract numbers and currency symbols
    # Pattern for numbers with commas/dots
    nums = re.findall(r"[\d,]+(?:\.\d+)?", budget_str)
    if not nums:
        return 0, 999_999, "USD"
    
    # Clean numbers
    cleaned_nums = [float(n.replace(",", "")) for n in nums]
    
    # Determine currency
    currency = "USD"
    if "฿" in budget_str or "THB" in budget_str.upper():
        currency = "THB"
    elif "€" in budget_str or "EUR" in budget_str.upper():
        currency = "EUR"
    
    if "Under" in budget_str or "Below" in budget_str or "Less than" in budget_str:
        return 0, cleaned_nums[0], currency
    elif "Above" in budget_str or "Over" in budget_str or "+" in budget_str:
        return cleaned_nums[0], 999_999, currency
    elif len(cleaned_nums) >= 2:
        return cleaned_nums[0], cleaned_nums[1], currency
    else:
        # Just a single number, assume it's the max
        return 0, cleaned_nums[0], currency

def vector_search_node(state: SetBuilderState) -> dict:
    """
    Embeds the user's requirements and searches for similar products
    in the pgvector-indexed products table via Supabase RPC.
    """
    print("--- RUNNING VECTOR SEARCH NODE ---")

    target_categories = ["Processor", "Graphics Card", "Memory", "Storage", "Motherboard", "PSU"]
    
    # Parse budget
    budget_label = state.get("budget", "")
    min_val, max_val, currency = parse_budget(budget_label)
    
    # Convert to THB for DB filtering (since DB defaults to THB)
    # If the budget is already in THB, use as is. 
    # If it's in USD, convert to THB using 1/rate (since rate is USD per 1 THB)
    if currency == "USD":
        rate_usd = get_exchange_rate("USD")
        max_price_thb = max_val / rate_usd if rate_usd > 0 else max_val * 36
    elif currency == "THB":
        max_price_thb = max_val
    else:
        # Fallback for other currencies
        max_price_thb = max_val * 36 # rough estimate
        
    all_products = []
    vs = VectorService()

    custom_reqs = state.get("custom_requirements", "") or ""

    try:
        for category in target_categories:
            query_parts = [
                f"standalone internal {category} hardware component",
                "for custom PC build",
                f"ecosystem: {state['ecosystem']}",
            ]
            
            if category == "Memory":
                query_parts.append(f"RAM capacity: {state['memory']}")
            elif category == "Storage":
                query_parts.append(f"capacity: {state['storage']}")

            if custom_reqs:
                query_parts.append(f"user requirements: {custom_reqs}")
                
            query = ", ".join(query_parts)
            
            # Use max_price_thb for filtering in DB
            products = vs.search_products(
                query=query,
                min_price=0,
                max_price=max_price_thb * 0.7, 
                limit=15,
            )
            all_products.extend(products)
            
        print(f"    ✓ Found {len(all_products)} matching products across categories")
        
        seen_ids = set()
        unique_products = []
        for p in all_products:
            if p.get("id") not in seen_ids:
                seen_ids.add(p.get("id"))
                unique_products.append(p)
                
    except Exception as e:
        print(f"    ✗ Vector search failed: {e}")
        unique_products = []

    return {"retrieved_products": unique_products}


def recommend_node(state: SetBuilderState) -> dict:
    """
    Takes the user's survey selections + currency and asks the LLM
    for a structured PC build recommendation (IDs only).
    Then enriches the IDs with full database data.
    """
    print("--- RUNNING SETBUILDER RECOMMEND NODE ---")

    retrieved = state.get("retrieved_products") or []
    requested_currency = state.get("currency", "THB")

    custom_reqs = state.get("custom_requirements", "") or ""

    # Build user prompt
    user_prompt = (
        f"Build me a PC with these preferences:\n"
        f"- Use Case: {state['use_case']}\n"
        f"- Budget Limit: {state['budget']}\n"
        f"- Ecosystem: {state['ecosystem']}\n"
        f"- Storage: {state['storage']}\n"
        f"- Memory (RAM): {state['memory']}\n"
        f"- Display Currency: {requested_currency}\n"
    )

    if custom_reqs:
        user_prompt += f"\n## Additional User Requirements:\n{custom_reqs}\n\n"
    
    user_prompt += "IMPORTANT: Select exactly 6 components from the catalogue. Return ONLY the JSON with product IDs.\n"

    catalogue_lines = []
    if retrieved:
        for p in retrieved:
            p_price = p.get('price', 0)
            p_currency = p.get('currency', 'THB')
            line = f"- ID: {p.get('id', 'null')} | {p.get('name', 'Unknown')} | Price: {p_price:,.2f} {p_currency}"
            catalogue_lines.append(line)

    catalogue_block = "\n".join(catalogue_lines) if catalogue_lines else "No matching products found."
    user_prompt += f"\n## Product Catalogue:\n{catalogue_block}\n"
    
    system_prompt = SETBUILDER_WITH_CATALOGUE_PROMPT

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]

    llm = LLMProvider.get_model(temperature=0.3)
    response = llm.invoke(messages)

    raw = response.content.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        recommendation = json.loads(cleaned)
        
        # --- ENRICHMENT STEP ---
        component_ids = []
        picks = ["value_pick", "premium_pick"]
        for pick in picks:
            if pick in recommendation:
                # Add IDs from each pick
                component_ids.extend([c.get("id") for c in recommendation[pick].get("components", []) if c.get("id")])
        
        from sqlalchemy.orm import joinedload
        from app.database import SessionLocal
        from app.models import Product
        
        db = SessionLocal()
        try:
            # Fetch products from DB with category joined
            db_products = (
                db.query(Product)
                .options(joinedload(Product.category))
                .filter(Product.id.in_(component_ids))
                .all()
            )
            prod_map = {str(p.id): p for p in db_products}
            
            for pick in picks:
                if pick not in recommendation:
                    continue
                
                enriched_components = []
                for comp_ref in recommendation[pick].get("components", []):
                    p_id = comp_ref.get("id")
                    p = prod_map.get(str(p_id))
                    
                    if p:
                        # Map category/label to icon_key
                        icon_map = {
                            "Processor": "processor",
                            "Graphics Card": "gpu",
                            "Memory": "memory",
                            "Storage": "storage",
                            "Motherboard": "motherboard",
                            "PSU": "psu",
                            "CPU": "processor",
                            "GPU": "gpu",
                            "RAM": "memory",
                            "SSD": "storage",
                            "HDD": "storage"
                        }
                        
                        category_name = p.category.name if p.category else comp_ref.get("label", "Component")
                        icon_key = icon_map.get(category_name, p.category.slug if p.category else "processor")
                        if "Graphics" in category_name:
                            icon_key = "gpu"
                        if "Power" in category_name:
                            icon_key = "psu"

                        enriched_components.append({
                            "id": str(p.id),
                            "label": comp_ref.get("label", category_name),
                            "name": p.name,
                            "price": float(p.price),
                            "icon_key": icon_key,
                            "from_catalogue": True
                        })
                
                recommendation[pick]["components"] = enriched_components
            
        except Exception as e:
            print(f"    ✗ Enrichment failed: {e}")
        finally:
            db.close()
            
    except json.JSONDecodeError as e:
        print(f"    ✗ JSON parse failed: {e}")
        recommendation = {
            "value_pick": {
                "title": "Build Recommendation",
                "subtitle": "AI-generated build",
                "components": [],
                "insight": raw,
            },
            "premium_pick": {
                "title": "Build Recommendation",
                "subtitle": "AI-generated premium build",
                "components": [],
                "insight": "Data load failed",
            }
        }

    return {
        "messages": [user_prompt],
        "recommendation": recommendation,
    }



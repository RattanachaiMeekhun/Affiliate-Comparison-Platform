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


def vector_search_node(state: SetBuilderState) -> dict:
    """
    Embeds the user's requirements and searches for similar products
    in the pgvector-indexed products table via Supabase RPC.
    """
    print("--- RUNNING VECTOR SEARCH NODE ---")

    # Build a semantic query from user preferences
    query_parts = [
        f"PC for {state['use_case']}",
        f"ecosystem: {state['ecosystem']}",
        f"RAM: {state['memory']}",
        f"storage: {state['storage']}",
    ]
    query = ", ".join(query_parts)

    # Parse budget label → price range
    budget_label = state.get("budget", "")
    min_price, max_price = BUDGET_RANGES.get(budget_label, (0, 999_999))

    try:
        vs = VectorService()
        products = vs.search_products(
            query=query,
            min_price=min_price,
            max_price=max_price,
            limit=20,
        )
        print(f"    ✓ Found {len(products)} matching products")
    except Exception as e:
        print(f"    ✗ Vector search failed: {e}")
        products = []

    return {"retrieved_products": products}


def recommend_node(state: SetBuilderState) -> dict:
    """
    Takes the user's 5 survey selections + currency and asks the LLM
    for a structured PC build recommendation.

    If retrieved_products is available, includes them as a catalogue
    so the LLM picks from real DB products.
    """
    print("--- RUNNING SETBUILDER RECOMMEND NODE ---")

    retrieved = state.get("retrieved_products") or []

    # Build user prompt
    user_prompt = (
        f"Build me a PC with these preferences:\n"
        f"- Use Case: {state['use_case']}\n"
        f"- Budget: {state['budget']}\n"
        f"- Ecosystem: {state['ecosystem']}\n"
        f"- Storage: {state['storage']}\n"
        f"- Memory (RAM): {state['memory']}\n"
        f"- Currency for display: {state['currency']}\n"
    )

    # If we have catalogue products, append them and use the catalogue prompt
    if retrieved:
        catalogue_lines = []
        for p in retrieved:
            line = f"- {p.get('name', 'Unknown')} | ${p.get('price', 0):.2f} | {p.get('description', '')[:120]}"
            if p.get("specs"):
                line += f" | Specs: {json.dumps(p['specs'])[:200]}"
            catalogue_lines.append(line)

        catalogue_block = "\n".join(catalogue_lines)
        user_prompt += f"\n\n## Available Products in Our Store:\n{catalogue_block}\n"
        system_prompt = SETBUILDER_WITH_CATALOGUE_PROMPT
        print(f"    ℹ Using catalogue prompt with {len(retrieved)} products")
    else:
        system_prompt = SETBUILDER_SYSTEM_PROMPT
        print("    ℹ No catalogue products — using generic prompt")

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]

    llm = LLMProvider.get_model(temperature=0.3)
    response = llm.invoke(messages)

    raw = response.content.strip()
    print(f"    ✓ LLM response length: {len(raw)} chars")

    # Strip markdown code-fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        recommendation = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"    ✗ JSON parse failed: {e}")
        recommendation = {
            "title": "Build Recommendation",
            "subtitle": "AI-generated build",
            "components": [],
            "insight": raw,  # pass the raw text as insight for debugging
        }

    return {
        "messages": [user_prompt],
        "recommendation": recommendation,
    }

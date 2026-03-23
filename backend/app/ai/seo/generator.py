import json
from app.ai.llm import LLMProvider
from langchain_core.messages import SystemMessage, HumanMessage

SEO_PROMPT = """You are an expert SEO copywriter and hardware reviewer.
Your task is to write a compelling summary review and meta tags for a product category page.

You will be provided with:
1. Category Name
2. Category Description
3. A list of top products in this category (with their specs and prices).

Please write:
1. A catchy `meta_title` (under 60 characters).
2. A compelling `meta_description` (under 160 characters).
3. A detailed `seo_content` summary (around 200-300 words) that discusses the category, mentions the top products, and gives a brief buying guide or overview. Format this content in Markdown.

Output strictly in the following JSON format without formatting backticks:
{
  "meta_title": "...",
  "meta_description": "...",
  "seo_content": "..."
}
"""

async def generate_category_seo(category_name: str, category_description: str, products: list) -> dict:
    product_details = ""
    for p in products[:10]: # Use top 10 products
        price_str = f"{p.price} {p.currency}" if p.price else "N/A"
        product_details += f"- {p.name} (Price: {price_str})\n"
        if p.specs:
            product_details += f"  Specs: {json.dumps(p.specs)}\n"

    messages = [
        SystemMessage(content=SEO_PROMPT),
        HumanMessage(
            content=f"Category Name: {category_name}\nDescription: {category_description or ''}\n\nTop Products:\n{product_details}"
        ),
    ]
    
    llm = LLMProvider.get_model(temperature=0.4)
    response = await llm.ainvoke(messages)
    
    # parse json from response.content
    content = response.content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
        
    try:
        data = json.loads(content.strip())
        return data
    except Exception as e:
        print(f"Error parsing SEO JSON: {e}\nContent: {content}")
        return {
            "meta_title": category_name[:60],
            "meta_description": (category_description or category_name)[:160] if category_description or category_name else "",
            "seo_content": category_description or ""
        }

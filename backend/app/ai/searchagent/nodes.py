import json
from langchain_core.messages import SystemMessage
from app.ai.llm import LLMProvider
from app.ai.searchagent.state import SearchAgentState
from app.ai.searchagent.prompt import (
    SEARCH_AGENT_SYSTEM_PROMPT,
    INSIGHT_WRITER_AGENT_SYSTEM_PROMPT,
    EBAY_ANALYSIS_SYSTEM_PROMPT,
)
from app.services.ebay_service import EbayService
from app.config import settings


# ──────────────────────────────────────────────
# Token Tracker (thread-safe per-request accumulator)
# ──────────────────────────────────────────────
class TokenTracker:
    """Accumulates token usage across multiple LLM calls."""

    def __init__(self):
        self.calls: list[dict] = []
        self.total_input = 0
        self.total_output = 0
        self.total_tokens = 0

    def record(self, node_name: str, response):
        """Extract usage_metadata from a LangChain response and record it."""
        meta = getattr(response, "usage_metadata", None) or {}

        input_tokens = meta.get("input_tokens", 0)
        output_tokens = meta.get("output_tokens", 0)
        total = meta.get("total_tokens", input_tokens + output_tokens)

        self.calls.append(
            {
                "node": node_name,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": total,
            }
        )
        self.total_input += input_tokens
        self.total_output += output_tokens
        self.total_tokens += total

        print(
            f"    🪙 {node_name}: "
            f"in={input_tokens:,}  out={output_tokens:,}  total={total:,}"
        )

    def summary(self) -> dict:
        return {
            "calls": self.calls,
            "total_input_tokens": self.total_input,
            "total_output_tokens": self.total_output,
            "total_tokens": self.total_tokens,
        }


# Module-level tracker – replaced per-request from the router
_tracker: TokenTracker | None = None


def set_tracker(tracker: TokenTracker):
    global _tracker
    _tracker = tracker


def get_tracker() -> TokenTracker | None:
    return _tracker


# ──────────────────────────────────────────────
# Original nodes (1 & 2)
# ──────────────────────────────────────────────
def search_node(state: SearchAgentState) -> SearchAgentState:
    """
    Search for the product via LLM knowledge + Google Search Grounding.
    """
    print("--- RUNNING SEARCH NODE ---")
    messages = [SystemMessage(content=SEARCH_AGENT_SYSTEM_PROMPT)] + state["messages"]
    llm = LLMProvider.get_model(temperature=0.2)

    # 💡 OPTION A: Enable Google Search Grounding
    try:
        # Many Langchain-Gemini versions support grounding this way:
        response = llm.invoke(messages, tools=[{"google_search": {}}])
    except Exception as e:
        print(f"    ⚠ Grounding failed/unsupported, fallback to standard LLM: {e}")
        response = llm.invoke(messages)

    if _tracker:
        _tracker.record("search", response)

    return {"messages": messages, "specs": response.content}


def insight_writer_node(state: SearchAgentState) -> SearchAgentState:
    """
    Generate polished product insights from LLM + eBay data + Web Data.
    """
    print("--- RUNNING INSIGHT WRITER NODE ---")

    # Build context that includes eBay data when available
    context_parts = []

    # Original LLM search data
    if state.get("specs"):
        context_parts.append(f"### LLM Product Data\n{state['specs']}")

    # eBay market data
    if state.get("ebay_raw") and state.get("ebay_raw") != "[]":
        context_parts.append(f"### eBay Live Market Data\n{state['ebay_raw']}")

    # Shopee/Lazada web market data
    if state.get("web_raw") and state.get("web_raw") != "[]":
        context_parts.append(
            f"### Web Search Market Data (Shopee/Lazada/etc)\n{state['web_raw']}"
        )

    combined_context = "\n\n".join(context_parts) if context_parts else ""

    messages = [
        SystemMessage(
            content=INSIGHT_WRITER_AGENT_SYSTEM_PROMPT
            + f"\n\n--- AVAILABLE DATA ---\n{combined_context}"
        )
    ] + state["messages"]

    llm = LLMProvider.get_model(temperature=0.2)

    try:
        response = llm.invoke(messages, tools=[{"google_search": {}}])
    except Exception:
        response = llm.invoke(messages)

    if _tracker:
        _tracker.record("insight_writer", response)

    return {
        "messages": messages,
        "specs": response.content,
        "combined_analysis": response.content,
    }


# ──────────────────────────────────────────────
# New: Web search node (fallback for Shopee/Lazada)
# ──────────────────────────────────────────────
def web_search_node(state: SearchAgentState) -> SearchAgentState:
    """
    Fetch real product links & prices from the web (specifically Shopee/Lazada)
    using DuckDuckGo Search.
    """
    print("--- RUNNING WEB SEARCH NODE ---")
    query = ""
    for msg in reversed(state.get("messages", [])):
        if hasattr(msg, "content"):
            query = msg.content
            break
        elif isinstance(msg, str):
            query = msg
            break

    if not query:
        return {"web_results": [], "web_raw": "[]"}

    # 💡 OPTION B: Additional external API (DuckDuckGo searching Shopee/Lazada)
    try:
        from ddgs import DDGS
        import json

        search_query = f"{query} price (shopee.co.th OR lazada.co.th OR advice.co.th)"

        with DDGS() as ddgs:
            results = list(ddgs.text(search_query, max_results=5))

        print(f"    ✓ Found {len(results)} Web listings (0 LLM tokens)")

        web_json = json.dumps(results, ensure_ascii=False)
        return {"web_results": results, "web_raw": web_json}
    except Exception as e:
        print(f"    ✗ Web search failed: {e}")
        return {"web_results": [], "web_raw": "[]"}


# ──────────────────────────────────────────────
# New: eBay search node (3) — no LLM tokens
# ──────────────────────────────────────────────
async def ebay_search_node(state: SearchAgentState) -> SearchAgentState:
    """
    Fetch real product listings from eBay Browse API.
    Runs in parallel with the LLM search node.
    """
    print("--- RUNNING EBAY SEARCH NODE ---")

    # Guard: skip if eBay credentials are not configured
    if not settings.EBAY_CLIENT_ID or not settings.EBAY_CLIENT_SECRET:
        print("    ⚠ eBay credentials not set – skipping eBay search")
        return {"ebay_results": [], "ebay_raw": "[]"}

    # Extract query from the user message
    query = ""
    for msg in reversed(state.get("messages", [])):
        if hasattr(msg, "content"):
            query = msg.content
            break
        elif isinstance(msg, str):
            query = msg
            break

    if not query:
        return {"ebay_results": [], "ebay_raw": "[]"}

    service = EbayService()
    try:
        raw_response = await service.search_products(query, limit=15)
        normalized = service.normalize_search_results(raw_response)

        # Build slim JSON for LLM context
        slim_items = []
        for item in normalized:
            slim_items.append(
                {
                    "title": item["raw_data"]["title"],
                    "price": item["price"],
                    "currency": item["currency"],
                    "condition": item["raw_data"]["condition"],
                    "seller": item["raw_data"]["seller_username"],
                    "url": item["source_url"],
                    "item_id": item["source_product_id"],
                }
            )

        ebay_json = json.dumps(slim_items, ensure_ascii=False)
        print(f"    ✓ Found {len(normalized)} eBay listings (0 LLM tokens)")

        return {"ebay_results": normalized, "ebay_raw": ebay_json}
    except Exception as e:
        print(f"    ✗ eBay search failed: {e}")
        return {"ebay_results": [], "ebay_raw": "[]"}


# ──────────────────────────────────────────────
# New: eBay analysis node (4)
# ──────────────────────────────────────────────
def ebay_analysis_node(state: SearchAgentState) -> SearchAgentState:
    """
    Use LLM to analyse eBay results: rank by value, flag suspicious sellers,
    suggest best deals. This enriches the final output.
    """
    print("--- RUNNING EBAY ANALYSIS NODE ---")

    ebay_raw = state.get("ebay_raw", "[]")
    if ebay_raw == "[]" or not ebay_raw:
        print("    ⚠ No eBay data – skipping analysis (0 LLM tokens)")
        return {"combined_analysis": state.get("specs", "")}

    messages = [
        SystemMessage(
            content=EBAY_ANALYSIS_SYSTEM_PROMPT
            + f"\n\n--- EBAY LISTINGS ---\n{ebay_raw}"
        )
    ] + state["messages"]

    llm = LLMProvider.get_model(temperature=0.2)
    response = llm.invoke(messages)

    if _tracker:
        _tracker.record("ebay_analysis", response)

    return {"combined_analysis": response.content}

import json
from langchain_core.messages import SystemMessage
from app.ai.llm import LLMProvider
from app.ai.searchagent.state import SearchAgentState
from app.ai.searchagent.prompt import (
    SEARCH_AGENT_SYSTEM_PROMPT,
    INSIGHT_WRITER_AGENT_SYSTEM_PROMPT,
    MARKET_ANALYSIS_SYSTEM_PROMPT,
)
from app.services.serper_service import SerperService
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
    Generate polished product insights from LLM + Serper data + Web Data.
    """
    print("--- RUNNING INSIGHT WRITER NODE ---")

    # Build context that includes Serper Data when available
    context_parts = []

    # Original LLM search data
    if state.get("specs"):
        context_parts.append(f"### LLM Product Data\n{state['specs']}")

    # Serper market data
    if state.get("serper_raw") and state.get("serper_raw") != "[]":
        context_parts.append(
            f"### Google Shopping Live Market Data\n{state['serper_raw']}"
        )

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
# Web search node (fallback for Shopee/Lazada)
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
# New: Serper search node (3) — no LLM tokens
# ──────────────────────────────────────────────
async def serper_search_node(state: SearchAgentState) -> SearchAgentState:
    """
    Fetch real product listings from Serper Google Shopping API.
    Runs in parallel with the LLM search node.
    """
    print("--- RUNNING SERPER SEARCH NODE ---")

    # Guard: skip if Serper credentials are not configured
    if not settings.SERPER_API_KEY:
        print("    ⚠ Serper API key not set – skipping Google Shopping search")
        return {"serper_results": [], "serper_raw": "[]"}

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
        return {"serper_results": [], "serper_raw": "[]"}

    service = SerperService()
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
                    "seller": item["raw_data"]["seller"],
                    "url": item["source_url"],
                    "item_id": item["source_product_id"],
                }
            )

        serper_json = json.dumps(slim_items, ensure_ascii=False)
        print(f"    ✓ Found {len(normalized)} Google Shopping listings (0 LLM tokens)")

        return {"serper_results": normalized, "serper_raw": serper_json}
    except Exception as e:
        print(f"    ✗ Google Shopping search failed: {e}")
        return {"serper_results": [], "serper_raw": "[]"}


# ──────────────────────────────────────────────
# New: Serper analysis node (4)
# ──────────────────────────────────────────────
def serper_analysis_node(state: SearchAgentState) -> SearchAgentState:
    """
    Use LLM to analyse Google Shopping results: rank by value, flag suspicious sellers,
    suggest best deals. This enriches the final output.
    """
    print("--- RUNNING SERPER ANALYSIS NODE ---")

    serper_raw = state.get("serper_raw", "[]")
    if serper_raw == "[]" or not serper_raw:
        print("    ⚠ No Shopping data – skipping analysis (0 LLM tokens)")
        return {"combined_analysis": state.get("specs", "")}

    messages = [
        SystemMessage(
            content=MARKET_ANALYSIS_SYSTEM_PROMPT
            + f"\n\n--- GOOGLE SHOPPING LISTINGS ---\n{serper_raw}"
        )
    ] + state["messages"]

    llm = LLMProvider.get_model(temperature=0.2)
    response = llm.invoke(messages)

    if _tracker:
        _tracker.record("serper_analysis", response)

    return {"combined_analysis": response.content}

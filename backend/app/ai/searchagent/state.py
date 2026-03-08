from typing import List, TypedDict, Optional


class SearchState(TypedDict):
    messages: List[str]


def add_messages(state: SearchState, message: str) -> SearchState:
    return {"messages": state["messages"] + [message]}


class SearchAgentState(TypedDict):
    product_name: str
    messages: List[str]
    specs: str
    price: float
    currency: str
    source: str
    # ── eBay integration fields ──
    ebay_results: Optional[List[dict]]  # Normalized eBay listings
    ebay_raw: Optional[str]  # Raw JSON string from eBay tool

    # ── Web search (Shopee/Lazada fallback) ──
    web_results: Optional[List[dict]]
    web_raw: Optional[str]

    combined_analysis: Optional[str]  # AI analysis merging all data

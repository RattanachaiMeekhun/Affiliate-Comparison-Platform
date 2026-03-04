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
    insight: str
    best_match_id: Optional[str]
    confidence: float

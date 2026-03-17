from typing import List, TypedDict, Optional


class SetBuilderState(TypedDict):
    # ── Inputs (from user survey) ──
    use_case: str
    budget: str
    ecosystem: str
    storage: str
    memory: str
    currency: str

    # ── Intermediate ──
    messages: List[str]
    retrieved_products: Optional[List[dict]]  # Products from pgvector search

    # ── Output ──
    recommendation: Optional[dict]  # {title, subtitle, components[], insight}

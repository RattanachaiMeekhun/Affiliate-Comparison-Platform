from langgraph.graph import StateGraph, END
from app.ai.setbuilder.state import SetBuilderState
from app.ai.setbuilder.nodes import vector_search_node, recommend_node


def build_setbuilder_graph():
    """
    Build the SetBuilder recommendation graph with pgvector RAG.

    Flow:
        ┌───────────────────────┐
        │  vector_search_node   │  ← embeds query, finds similar products
        └──────────┬────────────┘
                   │
        ┌──────────▼────────────┐
        │   recommend_node      │  ← LLM picks from catalogue + builds JSON
        └──────────┬────────────┘
                   │
                  END
    """
    workflow = StateGraph(SetBuilderState)

    workflow.add_node("vector_search", vector_search_node)
    workflow.add_node("recommend", recommend_node)

    workflow.set_entry_point("vector_search")
    workflow.add_edge("vector_search", "recommend")
    workflow.add_edge("recommend", END)

    return workflow.compile()

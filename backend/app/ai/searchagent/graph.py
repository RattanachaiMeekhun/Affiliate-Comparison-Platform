from app.ai.searchagent.nodes import (
    search_node,
    insight_writer_node,
    ebay_search_node,
    ebay_analysis_node,
    web_search_node,
)
from langgraph.graph import StateGraph, END
from app.ai.searchagent.state import SearchAgentState


def build_search_graph():
    """
    Build the enhanced search agent graph.

    Flow:
        ┌──────────────┐   ┌────────────┐   ┌────────────────┐
        │ search (LLM) │   │ ebay_search│   │ web_search (DDG)│
        └──────┬───────┘   └──────┬─────┘   └────────┬───────┘
               │                  │                  │
               └─────────┬────────┴─────────┬────────┘
                         │                  │
               ┌─────────▼──────────┐       │
               │  ebay_analysis      │──────┘
               │  (rank & flag)      │
               └─────────┬──────────┘
                         │
               ┌─────────▼──────────┐
               │  insight_writer     │
               │  (merge & output)   │
               └─────────┬──────────┘
                         │
                        END
    """
    workflow = StateGraph(SearchAgentState)

    # Nodes
    workflow.add_node("search", search_node)
    workflow.add_node("ebay_search", ebay_search_node)
    workflow.add_node("web_search", web_search_node)
    workflow.add_node("ebay_analysis", ebay_analysis_node)
    workflow.add_node("insight_writer", insight_writer_node)

    # Entry: all three run from the start (parallel fan-out)
    workflow.set_entry_point("search")

    workflow.add_edge("__start__", "ebay_search")
    workflow.add_edge("__start__", "web_search")

    # All three converge into ebay_analysis
    workflow.add_edge("search", "ebay_analysis")
    workflow.add_edge("ebay_search", "ebay_analysis")
    workflow.add_edge("web_search", "ebay_analysis")

    # Analysis feeds into insight_writer
    workflow.add_edge("ebay_analysis", "insight_writer")

    # Insight writer is the final output
    workflow.add_edge("insight_writer", END)

    return workflow.compile()

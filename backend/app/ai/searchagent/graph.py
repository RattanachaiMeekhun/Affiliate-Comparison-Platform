from app.ai.searchagent.nodes import (
    search_node,
    insight_writer_node,
    serper_search_node,
    serper_analysis_node,
    web_search_node,
)
from langgraph.graph import StateGraph, END
from app.ai.searchagent.state import SearchAgentState


def build_search_graph():
    """
    Build the enhanced search agent graph.

    Flow:
        ┌──────────────┐   ┌────────────┐   ┌────────────────┐
        │ search (LLM) │   │ serper_search│ │ web_search (DDG)│
        └──────┬───────┘   └──────┬─────┘   └────────┬───────┘
               │                  │                  │
               └─────────┬────────┴─────────┬────────┘
                         │                  │
               ┌─────────▼──────────┐       │
               │ serper_analysis     │──────┘
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
    workflow.add_node("serper_search", serper_search_node)
    workflow.add_node("web_search", web_search_node)
    workflow.add_node("serper_analysis", serper_analysis_node)
    workflow.add_node("insight_writer", insight_writer_node)

    # Entry: all three run from the start (parallel fan-out)
    workflow.set_entry_point("search")

    workflow.add_edge("__start__", "serper_search")
    workflow.add_edge("__start__", "web_search")

    # All three converge into serper_analysis
    workflow.add_edge("search", "serper_analysis")
    workflow.add_edge("serper_search", "serper_analysis")
    workflow.add_edge("web_search", "serper_analysis")

    # Analysis feeds into insight_writer
    workflow.add_edge("serper_analysis", "insight_writer")

    # Insight writer is the final output
    workflow.add_edge("insight_writer", END)

    return workflow.compile()

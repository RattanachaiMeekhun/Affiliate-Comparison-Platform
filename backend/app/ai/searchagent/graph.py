from app.ai.searchagent.nodes import search_node, insight_writer_node
from langgraph.graph import StateGraph, END
from app.ai.searchagent.state import SearchAgentState


def build_search_graph():
    workflow = StateGraph(SearchAgentState)
    workflow.add_node("search", search_node)
    workflow.add_node("insight_writer", insight_writer_node)
    workflow.add_edge("search", "insight_writer")
    workflow.set_entry_point("search")
    workflow.add_edge("insight_writer", END)
    return workflow.compile()

from backend.app.ai.searchagent.nodes import parse_node
from backend.app.ai.searchagent.nodes import search_node
from langgraph.graph import StateGraph, END
from app.ai.searchagent.state import SearchAgentState


def build_search_graph():
    workflow = StateGraph(SearchAgentState)
    workflow.add_node("search", search_node)
    workflow.add_node("parse", parse_node)
    workflow.add_edge("search", "parse")
    workflow.set_entry_point("search")
    workflow.add_edge("parse", END)
    return workflow.compile()

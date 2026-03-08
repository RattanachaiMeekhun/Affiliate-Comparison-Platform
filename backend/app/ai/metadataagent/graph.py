from langgraph.constants import END
from langgraph.graph import StateGraph
from app.ai.metadataagent.state import MetaWriterAgentState
from app.ai.metadataagent.nodes import meta_writer_node


def build_meta_writer_graph():
    workflow = StateGraph(MetaWriterAgentState)
    workflow.add_node("meta_writer", meta_writer_node)
    workflow.set_entry_point("meta_writer")
    workflow.add_edge("__start__", "meta_writer")
    workflow.add_edge("meta_writer", END)
    return workflow.compile()

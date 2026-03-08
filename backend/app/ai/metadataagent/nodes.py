from app.ai.searchagent.nodes import _tracker
from app.ai.llm import LLMProvider
from app.ai.metadataagent.prompts import META_WRITER_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.metadataagent.state import MetaWriterAgentState


def meta_writer_node(state: MetaWriterAgentState):
    messages = [
        SystemMessage(content=META_WRITER_PROMPT),
        HumanMessage(
            content=f"Product Name: {state['wording']}\nDescription: {state['description']}"
        ),
    ]
    llm = LLMProvider.get_model(temperature=0.4)
    response = llm.invoke(messages)

    content = response.content
    meta_title = ""
    meta_description = ""

    for line in content.split("\n"):
        if line.lower().startswith("title:"):
            meta_title = line[6:].strip()
        elif line.lower().startswith("description:"):
            meta_description = line[12:].strip()

    if _tracker:
        _tracker.record("meta_writer", response)

    return {
        "wording": state["wording"],
        "description": state["description"],
        "meta_title": meta_title or content[:60],
        "meta_description": meta_description or content[:160],
    }

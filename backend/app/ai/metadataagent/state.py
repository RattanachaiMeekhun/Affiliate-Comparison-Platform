from typing import List, TypedDict, Optional


class MetaWriterState(TypedDict):
    messages: List[str]


def add_messages(state: MetaWriterState, message: str) -> MetaWriterState:
    return {"messages": state["messages"] + [message]}


class MetaWriterAgentState(TypedDict):
    wording: Optional[str]
    description: Optional[str]
    meta_title: Optional[str]
    meta_description: Optional[str]

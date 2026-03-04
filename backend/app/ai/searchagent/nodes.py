from langchain_core.messages import SystemMessage
from app.ai.llm import LLMProvider
from app.ai.searchagent.state import SearchAgentState
from app.ai.searchagent.prompt import (
    SEARCH_AGENT_SYSTEM_PROMPT,
    INSIGHT_WRITER_AGENT_SYSTEM_PROMPT,
)


def search_node(state: SearchAgentState) -> SearchAgentState:
    """
    Search for the product in the from internet.
    """
    print("--- RUNNING SEARCH NODE ---")
    messages = [SystemMessage(content=SEARCH_AGENT_SYSTEM_PROMPT)] + state["messages"]
    llm = LLMProvider.get_model(temperature=0.2)
    response = llm.invoke(messages)
    return {"messages": messages, "specs": response.content}


def insight_writer_node(state: SearchAgentState) -> SearchAgentState:
    """
    Parse the product information.
    """
    print("--- RUNNING INSIGHT WRITER NODE ---")
    messages = [SystemMessage(content=INSIGHT_WRITER_AGENT_SYSTEM_PROMPT)] + state[
        "messages"
    ]
    llm = LLMProvider.get_model(temperature=0.2)
    response = llm.invoke(messages)
    return {"messages": messages, "specs": response.content}

from app.ai.searchagent.state import SearchAgentState


def search_node(state: SearchAgentState) -> SearchAgentState:
    """
    Search for the product in the from internet.
    """
    product_name = state["product_name"]
    messages = state["messages"]
    messages.append(f"Search for {product_name}")
    return {"messages": messages}


def parse_node(state: SearchAgentState) -> SearchAgentState:
    """
    Parse the product information.
    """
    messages = state["messages"]
    messages.append(f"Parse the product information")
    return {"messages": messages}

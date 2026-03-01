from typing import List, TypedDict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

# Define state for our matching graph
class MatchingState(TypedDict):
    source_product: dict
    candidates: List[dict]
    best_match_id: Optional[str]
    confidence: float
    insight: Optional[str]

# Define the LLM output structure for matching
class MatchDecision(BaseModel):
    is_match: bool = Field(description="Whether the two products are the same")
    confidence: float = Field(description="Confidence score between 0 and 1")
    reasoning: str = Field(description="Explanation for the decision")

class AIInsight(BaseModel):
    summary: str = Field(description="A brief, vertical-market-optimized comparison summary")
    best_value_reason: str = Field(description="Why this is or isn't the best value")

class MatchingEngine:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro")
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(MatchingState)
        
        # Define nodes
        workflow.add_node("analyze_candidates", self._analyze_candidates)
        workflow.add_node("generate_insight", self._generate_insight)
        
        # Define edges
        workflow.set_entry_point("analyze_candidates")
        workflow.add_edge("analyze_candidates", "generate_insight")
        workflow.add_edge("generate_insight", END)
        
        return workflow.compile()

    async def _analyze_candidates(self, state: MatchingState) -> MatchingState:
        source = state["source_product"]
        candidates = state["candidates"]
        
        best_match_id = None
        highest_confidence = 0.0
        
        for cand in candidates:
            # Enhanced prompt for Thai context and technical precision
            prompt = f"""
            Compare these two tech products from Thai marketplaces (Lazada, Shopee, etc.) 
            and decide if they are EXACTLY the same model and variant:
            
            Product A (New): 
            Name: {source['name']}
            Specs/Raw: {source.get('raw_data', {})}
            
            Product B (Existing): 
            Name: {cand['name']}
            Specs/Raw: {cand.get('raw_data', {})}
            
            Context:
            - Ignore minor differences in seller naming (e.g., "Official Store", "[Ready Stock]").
            - Pay close attention to model numbers (e.g., RTX 4070 vs RTX 4070 Ti).
            - Check capacity and regional variants (e.g., TH/A vs LL/A for Apple).
            - Identify if '8GB RAM' on one is 'Unified Memory' on another for Mac.
            
            Return JSON with is_match (bool), confidence (0-1), and reasoning (str).
            """
            
            decision = await self.llm.with_structured_output(MatchDecision).ainvoke(prompt)
            
            if decision.is_match and decision.confidence > highest_confidence:
                highest_confidence = decision.confidence
                best_match_id = cand['id']
                
        return {**state, "best_match_id": best_match_id, "confidence": highest_confidence}

    async def _generate_insight(self, state: MatchingState) -> MatchingState:
        if not state["best_match_id"]:
            return state
            
        source = state["source_product"]
        # In a real scenario, we'd pull the best match for comparison
        # Here we generate a 'best value' insight targeted at tech enthusiasts
        prompt = f"""
        Analyze this tech product: {source['name']} at price {source['price']} {source['currency']}.
        
        Identify:
        1. Is it a good deal compared to typical MSRP?
        2. Are there specific technical advantages (e.g., superior cooling, better warranty)?
        3. Who is this for? (e.g., Pro Devs, Gamers, Casual Users)
        
        Return a concise, vertical-market-optimized comparison summary and a 'best_value_reason'.
        """
        insight_data = await self.llm.with_structured_output(AIInsight).ainvoke(prompt)
        
        return {**state, "insight": insight_data.summary}


    async def run_matching(self, source_product: dict, candidates: List[dict]):
        initial_state = {
            "source_product": source_product,
            "candidates": candidates,
            "best_match_id": None,
            "confidence": 0.0,
            "insight": None
        }
        return await self.graph.ainvoke(initial_state)

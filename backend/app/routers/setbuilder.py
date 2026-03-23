from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ai.setbuilder.graph import build_setbuilder_graph

router = APIRouter(prefix="/api/setbuilder", tags=["SetBuilder"])


class SetBuilderRequest(BaseModel):
    use_case: str
    budget: str
    ecosystem: str
    storage: str | None = "No Preference"
    memory: str | None = "No Preference"
    currency: str = "THB"
    custom_requirements: str | None = None


class ComponentResponse(BaseModel):
    id: str | None = None
    label: str
    name: str
    price: float
    icon_key: str
    from_catalogue: bool = False


class SetBuilderResponse(BaseModel):
    title: str
    subtitle: str
    components: list[ComponentResponse]
    insight: str


@router.post("/recommend", response_model=SetBuilderResponse)
async def recommend_build(req: SetBuilderRequest):
    """
    Accept survey selections and return an AI-generated PC build recommendation.
    """
    try:
        graph = build_setbuilder_graph()
        result = await graph.ainvoke(
            {
                "use_case": req.use_case,
                "budget": req.budget,
                "ecosystem": req.ecosystem,
                "storage": req.storage,
                "memory": req.memory,
                "currency": req.currency,
                "custom_requirements": req.custom_requirements or "",
                "messages": [],
                "recommendation": None,
            }
        )
    except Exception as e:
        print(f"SetBuilder graph error: {e}")
        raise HTTPException(status_code=500, detail=f"AI graph failed: {str(e)}")

    recommendation_data = result.get("recommendation")
    if not recommendation_data:
        raise HTTPException(
            status_code=500,
            detail="AI returned no recommendation data",
        )

    # The AI returns two builds: value_pick and premium_pick.
    # We'll return the premium_pick as the primary recommendation, or fallback to value_pick.
    recommendation = recommendation_data.get("premium_pick")
    if not recommendation or not recommendation.get("components"):
        recommendation = recommendation_data.get("value_pick")
    
    if not recommendation or not recommendation.get("components"):
        raise HTTPException(
            status_code=500,
            detail="AI returned an empty or invalid recommendation",
        )

    # Normalise components to match response schema
    components = []
    for c in recommendation.get("components", []):
        components.append(
            ComponentResponse(
                id=c.get("id"),
                label=c.get("label", "Unknown"),
                name=c.get("name", "Unknown"),
                price=float(c.get("price", c.get("price_usd", 0))),
                icon_key=c.get("icon_key", "processor"),
                from_catalogue=c.get("from_catalogue", False),
            )
        )

    return SetBuilderResponse(
        title=recommendation.get("title", "Custom Build"),
        subtitle=recommendation.get("subtitle", "AI-generated build"),
        components=components,
        insight=recommendation.get("insight", ""),
    )

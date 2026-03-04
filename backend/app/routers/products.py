from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from app.ai.searchagent import build_search_graph
from langchain_core.messages import HumanMessage
from app.ai.helper import _parse_json_response
from slugify import slugify

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)
):
    return crud.get_products(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: str, db: Session = Depends(database.get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.post("/feed-new-products")
async def feed_new_products(products: str, db: Session = Depends(database.get_db)):
    try:
        workflow = build_search_graph()

        # ainvoke returns the final state dictionary
        state = await workflow.ainvoke({"messages": [HumanMessage(content=products)]})

        # Log the raw AI result for debugging
        last_specs = state.get("specs", "")
        print(f"AI Result Path: {last_specs}")

        if not last_specs:
            raise HTTPException(status_code=500, detail="AI returned an empty response")

        # Use helper to extract JSON from potentially markdown-wrapped content
        data = _parse_json_response(last_specs)

        if not data:
            raise HTTPException(
                status_code=500, detail="Failed to parse JSON from AI response"
            )

        # The prompt might return a list or a single object
        if isinstance(data, dict):
            # If it's the structure from search_node prompt: {"product": ..., "listings": ...}
            if "product" in data:
                product_data = data["product"]
                product_data["slug"] = slugify(product_data.get("name", "product"))
                # Handle listings if present
                if "listings" in data:
                    product_data["affiliate_products"] = data["listings"]
                processed_data = [product_data]
            else:
                # If it's the structure from insight_writer prompt or raw dict
                data["slug"] = slugify(data.get("name", "product"))
                processed_data = [data]
        elif isinstance(data, list):
            for item in data:
                item["slug"] = slugify(item.get("name", "product"))
            processed_data = data
        else:
            raise HTTPException(status_code=500, detail="Invalid data format from AI")

        # Save to DB using the updated CRUD method
        _ = crud.create_products(db, processed_data)

        # Return the first one or the whole list (depending on preference)
        return processed_data
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

from app.ai.metadataagent.graph import build_meta_writer_graph
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=schemas.Category)
async def create_category(
    category: schemas.CategoryCreate, db: Session = Depends(database.get_db)
):
    meta_writer_graph = build_meta_writer_graph()
    state = await meta_writer_graph.ainvoke(
        {
            "wording": category.name,
            "description": category.description,
        }
    )
    category.meta_title = state["meta_title"]
    category.meta_description = state["meta_description"]
    return crud.create_category(db=db, category=category)


@router.get("/", response_model=List[schemas.Category])
def read_categories(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)
):
    return crud.get_categories(db, skip=skip, limit=limit)


@router.patch("/", response_model=List[schemas.Category])
async def update_category(
    names: str,
    db: Session = Depends(database.get_db),
):
    categories = crud.get_categories_by_names(db, names)
    for category in categories:
        meta_writer_graph = build_meta_writer_graph()
        state = await meta_writer_graph.ainvoke(
            {
                "wording": category.name,
                "description": category.description,
            }
        )
        category.meta_title = state["meta_title"]
        category.meta_description = state["meta_description"]
    crud.update_category(db=db, categorise=categories)
    return categories

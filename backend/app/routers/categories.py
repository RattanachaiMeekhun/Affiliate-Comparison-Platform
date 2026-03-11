from app.ai.metadataagent.graph import build_meta_writer_graph
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from app.services.storage_service import StorageService
from app.services.serper_service import SerperService

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

    # We can also add image upload here if it comes in
    if getattr(category, "icon_url", None):
        pass  # Wait for user request if create also needs R2 upload

    return crud.create_category(db=db, category=category)


@router.get("/", response_model=List[schemas.Category])
def read_categories(
    skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)
):
    return crud.get_categories(db, skip=skip, limit=limit)


@router.patch("/", response_model=List[schemas.Category])
async def update_category(
    names: str,
    updateImage: bool = False,
    db: Session = Depends(database.get_db),
):
    categories = crud.get_categories_by_names(db, names)
    storage = StorageService() if updateImage else None
    serper = SerperService() if updateImage else None

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

        if updateImage:
            raw_url = category.icon_url

            # If no icon url exists (or if we want to replace it explicitly), search for one
            if not raw_url or not raw_url.startswith("http"):
                search_query = f"{category.name} icon transparent"
                raw_url = await serper.search_image(search_query)

            # If we successfully got a URL (either old one or newly searched one), upload to R2
            if raw_url and raw_url.startswith("http"):
                try:
                    new_url = await storage.upload_image_from_url(
                        raw_url, f"cat-{category.slug}"
                    )
                    category.icon_url = new_url
                except Exception as e:
                    print(f"Failed to update category image to R2: {e}")

    crud.update_category(db=db, categorise=categories)
    return categories

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)

@router.post("/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(database.get_db)):
    return crud.create_category(db=db, category=category)

@router.get("/", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)

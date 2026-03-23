from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SavedBuild, User
from app.schemas import SavedBuildCreate, SavedBuild as SavedBuildSchema
from typing import List
from uuid import UUID

router = APIRouter(prefix="/builds", tags=["Builds"])

@router.post("/", response_model=SavedBuildSchema)
def create_build(build: SavedBuildCreate, user_id: UUID, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_build = SavedBuild(
        user_id=user_id,
        name=build.name,
        items=build.items,
        total_price=build.total_price,
        currency=build.currency
    )
    db.add(db_build)
    db.commit()
    db.refresh(db_build)
    return db_build

@router.get("/user/{user_id}", response_model=List[SavedBuildSchema])
def get_user_builds(user_id: UUID, db: Session = Depends(get_db)):
    builds = db.query(SavedBuild).filter(SavedBuild.user_id == user_id).order_by(SavedBuild.created_at.desc()).all()
    return builds

@router.delete("/{build_id}")
def delete_build(build_id: UUID, db: Session = Depends(get_db)):
    build = db.query(SavedBuild).filter(SavedBuild.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
        
    db.delete(build)
    db.commit()
    return {"message": "Build deleted successfully"}

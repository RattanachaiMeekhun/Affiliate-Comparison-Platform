from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/guest", response_model=UserResponse)
def create_guest(db: Session = Depends(get_db)):
    guest_email = f"guest_{uuid.uuid4().hex[:8]}@guest.local"
    db_user = User(
        email=guest_email,
        hashed_password="guest_no_password",
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

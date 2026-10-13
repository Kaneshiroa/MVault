from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MediaItem
from ..schemas import MediaItemCreate, MediaItemRead

router = APIRouter(
    prefix="/media",
    tags=["media"]
)

Database = Annotated[Session, Depends(get_db)]

@router.post("/", response_model=MediaItemRead, status_code=status.HTTP_201_CREATED)
def create_media(media: MediaItemCreate, db: Database):
    db_media = MediaItem(**media.model_dump())
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

@router.get("/", response_model=list[MediaItemRead], status_code=status.HTTP_200_OK)
def get_media(db: Database):
    statement = select(MediaItem)
    return db.scalars(statement).all()
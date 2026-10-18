from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MediaItem
from ..schemas import MediaItemCreate, MediaItemRead, MediaItemUpdate

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

@router.patch("/{media_id}", response_model=MediaItemRead)
def update_media(
    media_id: int,
    updates: MediaItemUpdate,
    db: Database,
):
    db_media = db.get(MediaItem, media_id)

    if db_media is None:
        raise HTTPException(status_code=404, detail="Media item not found")

    update_data = updates.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_media, field, value)

    db.commit()
    db.refresh(db_media)

    return db_media

@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(media_id: int, db: Database):
    db_media = db.get(MediaItem, media_id)

    if db_media is None:
        raise HTTPException(status_code=404, detail="Media item not found")

    db.delete(db_media)
    db.commit()
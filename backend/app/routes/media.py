from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import CurrentUserId
from ..database import get_db
from ..models import MediaItem
from ..schemas import MediaItemCreate, MediaItemRead, MediaItemUpdate


router = APIRouter(
    prefix="/media",
    tags=["media"],
)

Database = Annotated[Session, Depends(get_db)]


def get_unit_type(category: str) -> str:
    """Return the unit type that belongs to a media category."""

    if category == "reading":
        return "chapters"

    return "episodes"


def get_owned_media_or_404(
    media_id: int,
    user_id: UUID,
    db: Session,
) -> MediaItem:
    """Return an item only when it belongs to the authenticated user."""

    statement = select(MediaItem).where(
        MediaItem.id == media_id,
        MediaItem.user_id == user_id,
    )

    media_item = db.scalar(statement)

    if media_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found.",
        )

    return media_item


@router.post(
    "/",
    response_model=MediaItemRead,
    status_code=status.HTTP_201_CREATED,
)
def create_media(
    media: MediaItemCreate,
    user_id: CurrentUserId,
    db: Database,
):
    media_data = media.model_dump()
    media_data["unit_type"] = get_unit_type(media.category)
    media_data["user_id"] = user_id

    db_media = MediaItem(**media_data)

    db.add(db_media)
    db.commit()
    db.refresh(db_media)

    return db_media


@router.get(
    "/",
    response_model=list[MediaItemRead],
    status_code=status.HTTP_200_OK,
)
def get_media(
    user_id: CurrentUserId,
    db: Database,
):
    statement = select(MediaItem).where(MediaItem.user_id == user_id)

    return db.scalars(statement).all()


@router.patch("/{media_id}", response_model=MediaItemRead)
def update_media(
    media_id: int,
    updates: MediaItemUpdate,
    user_id: CurrentUserId,
    db: Database,
):
    db_media = get_owned_media_or_404(media_id, user_id, db)

    update_data = updates.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_media, field, value)

    db_media.unit_type = get_unit_type(db_media.category)

    db.commit()
    db.refresh(db_media)

    return db_media


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(
    media_id: int,
    user_id: CurrentUserId,
    db: Database,
):
    db_media = get_owned_media_or_404(media_id, user_id, db)

    db.delete(db_media)
    db.commit()
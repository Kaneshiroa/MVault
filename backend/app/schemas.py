from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


UnitType = Literal["episodes", "chapters"]


class MediaItemBase(BaseModel):
    """Shared fields returned for every media item."""

    title: str
    category: str
    format: str
    status: str = "planned"

    progress: int = Field(default=1, ge=0)
    total_units: int | None = Field(default=None, ge=1)
    unit_type: UnitType | None = None
    season_number: int | None = Field(default=None, ge=1)

    rating: float | None = Field(
        default=None,
        ge=1,
        le=10,
        multiple_of=0.5,
    )

    notes: str | None = None


class MediaItemCreate(MediaItemBase):
    """Fields accepted when creating a media item."""

    pass


class MediaItemRead(MediaItemBase):
    """Media item returned by the API."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MediaItemUpdate(BaseModel):
    """Fields that may be changed after a media item is created."""

    status: str | None = None

    progress: int | None = Field(
        default=None,
        ge=0,
    )

    total_units: int | None = Field(
        default=None,
        ge=1,
    )

    season_number: int | None = Field(
        default=None,
        ge=1,
    )

    rating: float | None = Field(
        default=None,
        ge=1,
        le=10,
        multiple_of=0.5,
    )

    notes: str | None = None
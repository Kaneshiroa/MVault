from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


UnitType = Literal[
    "episodes",
    "chapters",
    "volumes",
    "seasons",
]


class MediaItemBase(BaseModel):
    title: str
    category: str
    format: str
    status: str = "planned"

    progress: int = Field(default=0, ge=0)
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
    #Inherits from MediaItemBase and adds any additional fields needed for creating a media item
    pass


class MediaItemRead(MediaItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MediaItemUpdate(BaseModel):
    status: str | None = None

    progress: int | None = Field(
        default=None,
        ge=0,
    )

    total_units: int | None = Field(
        default=None,
        ge=1,
    )

    unit_type: UnitType | None = None

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
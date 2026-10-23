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

    progress: int = Field(default=0, ge=0)
    total_units: int | None = Field(default=None, ge=1)
    unit_type: UnitType | None = None
    season_number: int | None = Field(default=None, ge=1)

    rating: float | None = Field(
        default=None,
        ge=1,
        le=10,
        multiple_of=0.1,
    )

    notes: str | None = None

    poster_url: str | None = None
    backdrop_url: str | None = None
    metadata_source: str | None = Field(default=None, max_length=30)
    metadata_id: str | None = Field(default=None, max_length=100)


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
        multiple_of=0.1,
    )

    notes: str | None = None


class MetadataSearchResult(BaseModel):
    """One normalized title result from an external metadata source."""

    source: Literal["tmdb", "anilist"]
    source_id: str
    title: str
    media_type: Literal["movie", "tv", "anime", "manga"]
    release_year: str | None = None
    overview: str | None = None
    poster_url: str | None = None
    backdrop_url: str | None = None


class MetadataSearchResponse(BaseModel):
    """Search results returned to the MVault frontend."""

    results: list[MetadataSearchResult]
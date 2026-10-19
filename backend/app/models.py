from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class MediaItem(Base):
    """Database model for one saved media title."""

    __tablename__ = "media_items"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(255), index=True)
    category: Mapped[str] = mapped_column(String(30))
    format: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30), default="planned")

    progress: Mapped[int] = mapped_column(Integer, default=1)
    total_units: Mapped[int | None] = mapped_column(Integer, nullable=True)
    unit_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    season_number: Mapped[int | None] = mapped_column(Integer, nullable=True)

    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class MediaItem(Base):
    __tablename__ = "media_items"
    
    # Primary key, like 1 - Attack on Titan, 2 - Naruto, etc.
    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(255), index=True)
    media_type: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(30), default="planned")

    #Total_units represents the total number of units in the media item (e.g., total episodes, total chapters, etc.)
    #Unit_type represents the type of unit (e.g., episodes, chapters, etc.)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    total_units: Mapped[int | None] = mapped_column(Integer, nullable=True)
    unit_type: Mapped[str | None] = mapped_column(String(20), nullable=True)

    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
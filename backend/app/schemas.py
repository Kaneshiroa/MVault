from datetime import datetime
from pydantic import BaseModel, ConfigDict

class MediaItemBase(BaseModel):
    title: str
    category: str
    format: str
    status: str = "planned"
    
    progress: int = 0
    total_units: int | None = None
    unit_type: str | None = None
    
    rating: int | None = None
    notes: str | None = None
    
class MediaItemCreate(MediaItemBase):
    #Inherits from MediaItemBase and adds any additional fields needed for creating a media item
    pass
    
class MediaItemRead(MediaItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
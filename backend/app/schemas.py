from datetime import datetime
from pydantic import BaseModel, ConfigDict

class MediaItemBase(BaseModel):
    title: str
    media_type: str
    status: str = "planned"
    
    progress: int = 0
    total_units: int | None = None
    unit_type: str | None = None
    
    rating: int | None = None
    notes: str | None = None
    
class MediaItemCreate(MediaItemBase):
    id:int
    created_at: datetime = datetime.now()
    
    model_config = ConfigDict(from_attributes=True)
    
class MediaItemRead(MediaItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
from datetime import datetime
from pydantic import BaseModel, HttpUrl, ConfigDict

class LayerCreate(BaseModel):
    name: str
    geojson_url: HttpUrl

class LayerUpdate(BaseModel):
    name: str | None = None
    geojson_url: HttpUrl | None = None

class LayerResponse(BaseModel):
    id: int
    name: str
    geojson_url: str
    geojson: dict
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

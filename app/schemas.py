from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LayerCreate(BaseModel):
    name: str
    squadrats_uid: str


class LayerUpdate(BaseModel):
    name: str | None = None
    squadrats_uid: str | None = None


class LayerResponse(BaseModel):
    id: int
    name: str
    squadrats_uid: str
    geojson: dict
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
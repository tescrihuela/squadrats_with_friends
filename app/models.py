from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base

class Layer(Base):
    __tablename__ = "layers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    geojson_url = Column(String(2048), nullable=False)
    geojson = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

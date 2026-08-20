from pathlib import Path
import httpx
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from . import crud
from .schemas import LayerCreate, LayerUpdate, LayerResponse

BASE_DIR = Path(__file__).resolve().parent
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Squadrats Maison",
    version="1.0.0"
)

app.mount(
    "/squadrats/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)

@app.get("/squadrats/")
def index():
    return FileResponse(BASE_DIR / "static" / "index.html")

async def download_geojson(url: str) -> dict:
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
            response = await client.get(url)
            response.raise_for_status()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Impossible de télécharger le GeoJSON : {e}")

    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=400, detail="L'URL ne renvoie pas un JSON valide.")

    validate_geojson(data)
    return data

def validate_geojson(data: dict):
    if not isinstance(data, dict) or data.get("type") != "FeatureCollection":
        raise HTTPException(status_code=400, detail="Le GeoJSON doit être une FeatureCollection.")

    features = data.get("features")
    if not isinstance(features, list):
        raise HTTPException(status_code=400, detail="Le GeoJSON ne contient pas de liste features.")

    if len(features) != 9:
        raise HTTPException(
            status_code=400,
            detail=f"Le GeoJSON doit contenir exactement 9 entités. Nombre trouvé : {len(features)}."
        )

    for i, feature in enumerate(features):
        if not isinstance(feature, dict) or feature.get("type") != "Feature":
            raise HTTPException(status_code=400, detail=f"L'entité {i + 1} n'est pas une Feature.")

        properties = feature.get("properties")
        if not isinstance(properties, dict) or not properties.get("name"):
            raise HTTPException(
                status_code=400,
                detail=f"L'entité {i + 1} ne possède pas de propriété name."
            )

@app.get("/squadrats/api/layers", response_model=list[LayerResponse])
def list_layers(db: Session = Depends(get_db)):
    return crud.get_layers(db)

@app.post("/squadrats/api/layers/refresh")
async def refresh_layers(db: Session = Depends(get_db)):
    layers = crud.get_layers(db)

    results = []

    for layer in layers:
        try:
            geojson = await download_geojson(layer.geojson_url)

            crud.update_layer(
                db,
                layer,
                geojson=geojson
            )

            results.append({
                "id": layer.id,
                "name": layer.name,
                "success": True
            })

        except Exception as e:
            results.append({
                "id": layer.id,
                "name": layer.name,
                "success": False,
                "error": str(e)
            })

    return {
        "success": True,
        "updated": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"]),
        "results": results
    }

@app.get("/squadrats/api/layers/{layer_id}", response_model=LayerResponse)
def get_layer(layer_id: int, db: Session = Depends(get_db)):
    layer = crud.get_layer(db, layer_id)
    if layer is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    return layer

@app.post("/squadrats/api/layers", response_model=LayerResponse, status_code=201)
async def create_layer(payload: LayerCreate, db: Session = Depends(get_db)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Le nom est obligatoire.")

    geojson_url = str(payload.geojson_url)
    geojson = await download_geojson(geojson_url)

    return crud.create_layer(db, name, geojson_url, geojson)

@app.put("/squadrats/api/layers/{layer_id}", response_model=LayerResponse)
async def update_layer(layer_id: int, payload: LayerUpdate, db: Session = Depends(get_db)):
    layer = crud.get_layer(db, layer_id)
    if layer is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    geojson = None
    geojson_url = None

    if payload.geojson_url is not None:
        geojson_url = str(payload.geojson_url)
        geojson = await download_geojson(geojson_url)

    name = None
    if payload.name is not None:
        name = payload.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Le nom ne peut pas être vide.")

    return crud.update_layer(db, layer, name=name, geojson_url=geojson_url, geojson=geojson)

@app.delete("/squadrats/api/layers/{layer_id}")
def delete_layer(layer_id: int, db: Session = Depends(get_db)):
    layer = crud.get_layer(db, layer_id)
    if layer is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    crud.delete_layer(db, layer)
    return {"success": True}

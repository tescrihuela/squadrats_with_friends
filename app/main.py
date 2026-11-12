from pathlib import Path
import re
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
SQUADRATS_GEOJSON_URL = ("https://mainframe-api.squadrats.com/anonymous/squadrants/{uid}/geojson")

app = FastAPI(
    title="Squadrats Maison",
    version="1.0.0"
)

app.mount(
    "/squadrats/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static"
)

def get_geojson_url(uid: str) -> str:
    return SQUADRATS_GEOJSON_URL.format(uid=uid)

@app.get("/squadrats/")
def index():
    return FileResponse(BASE_DIR / "static" / "index.html")

<<<<<<< HEAD
async def get_geojson_url_from_uid(uid: str) -> str:
    url = get_geojson_url(uid)

=======
TROPHY_UID = re.compile(r"/trophies/([^/]+)/")
MAINFRAME_GEOJSON = "https://mainframe-api.squadrats.com/anonymous/squadrants/{uid}/geojson"

async def resolve_geojson_url(url: str) -> str:
    """Les liens squadrats.org expirent. On redemande l'URL fraîche via l'identifiant."""
    match = TROPHY_UID.search(url)
    if not match:
        return url

    lookup = MAINFRAME_GEOJSON.format(uid=match.group(1))
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
            response = await client.get(lookup)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError) as e:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de retrouver le GeoJSON Squadrats : {e}"
        )

    fresh = data.get("url") if isinstance(data, dict) else None
    if not isinstance(fresh, str) or not fresh:
        raise HTTPException(
            status_code=400,
            detail="L'API Squadrats ne fournit pas d'URL GeoJSON."
        )
    return fresh

async def download_geojson(url: str) -> dict:
>>>>>>> bd11d53 (maj)
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=30
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de récupérer l'URL du GeoJSON : {e}"
        )

    try:
        data = response.json()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="L'API Squadrats ne renvoie pas un JSON valide."
        )

    geojson_url = data.get("url")

    if not geojson_url:
        raise HTTPException(
            status_code=400,
            detail="L'API Squadrats ne fournit pas d'URL GeoJSON."
        )

    return geojson_url


async def download_geojson(url: str) -> dict:
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=30
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de télécharger le GeoJSON : {e}"
        )

    try:
        data = response.json()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="L'URL ne renvoie pas un JSON valide."
        )

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
<<<<<<< HEAD
            geojson_url = await get_geojson_url_from_uid(
                layer.squadrats_uid
            )

=======
            geojson_url = await resolve_geojson_url(layer.geojson_url)
>>>>>>> bd11d53 (maj)
            geojson = await download_geojson(geojson_url)

            crud.update_layer(
                db,
                layer,
                geojson_url=geojson_url,
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

@app.post(
    "/squadrats/api/layers",
    response_model=LayerResponse,
    status_code=201
)
async def create_layer(
    payload: LayerCreate,
    db: Session = Depends(get_db)
):
    name = payload.name.strip()

<<<<<<< HEAD
    if not name:
        raise HTTPException(
            status_code=400,
            detail="Le nom est obligatoire."
        )

    uid = payload.squadrats_uid.strip()

    if not uid:
        raise HTTPException(
            status_code=400,
            detail="Le UID Squadrats est obligatoire."
        )

    geojson_url = await get_geojson_url_from_uid(uid)
=======
    geojson_url = await resolve_geojson_url(str(payload.geojson_url))
>>>>>>> bd11d53 (maj)
    geojson = await download_geojson(geojson_url)

    return crud.create_layer(
        db,
        name,
        uid,
        geojson
    )

@app.put(
    "/squadrats/api/layers/{layer_id}",
    response_model=LayerResponse
)
async def update_layer(
    layer_id: int,
    payload: LayerUpdate,
    db: Session = Depends(get_db)
):
    layer = crud.get_layer(db, layer_id)

    if layer is None:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur introuvable."
        )

    geojson = None
    uid = None

<<<<<<< HEAD
    if payload.squadrats_uid is not None:
        uid = payload.squadrats_uid.strip()

        if not uid:
            raise HTTPException(
                status_code=400,
                detail="Le UID Squadrats ne peut pas être vide."
            )

        url = get_geojson_url(uid)
        geojson_url = await get_geojson_url_from_uid(uid)
=======
    if payload.geojson_url is not None:
        geojson_url = await resolve_geojson_url(str(payload.geojson_url))
>>>>>>> bd11d53 (maj)
        geojson = await download_geojson(geojson_url)
        
    name = None

    if payload.name is not None:
        name = payload.name.strip()

        if not name:
            raise HTTPException(
                status_code=400,
                detail="Le nom ne peut pas être vide."
            )

    return crud.update_layer(
        db,
        layer,
        name=name,
        squadrats_uid=uid,
        geojson=geojson
    )

@app.delete("/squadrats/api/layers/{layer_id}")
def delete_layer(layer_id: int, db: Session = Depends(get_db)):
    layer = crud.get_layer(db, layer_id)
    if layer is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    crud.delete_layer(db, layer)
    return {"success": True}

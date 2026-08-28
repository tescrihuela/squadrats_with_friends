from sqlalchemy.orm import Session
from .models import Layer


def get_layers(db: Session):
    return db.query(Layer).order_by(Layer.name).all()


def get_layer(db: Session, layer_id: int):
    return db.query(Layer).filter(Layer.id == layer_id).first()


def create_layer(
    db: Session,
    name: str,
    squadrats_uid: str,
    geojson: dict
):
    layer = Layer(
        name=name,
        squadrats_uid=squadrats_uid,
        geojson=geojson
    )

    db.add(layer)
    db.commit()
    db.refresh(layer)

    return layer


def update_layer(
    db: Session,
    layer: Layer,
    name=None,
    squadrats_uid=None,
    geojson=None
):
    if name is not None:
        layer.name = name

    if squadrats_uid is not None:
        layer.squadrats_uid = squadrats_uid

    if geojson is not None:
        layer.geojson = geojson

    db.commit()
    db.refresh(layer)

    return layer


def delete_layer(db: Session, layer: Layer):
    db.delete(layer)
    db.commit()
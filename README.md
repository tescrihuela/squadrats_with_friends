# Squadrats Overlay

MVP d'une application permettant de stocker plusieurs GeoJSON Squadrats et d'afficher indépendamment leurs 9 entités sur une carte Leaflet.

## Pré-requis

- Python 3.11+
- Docker / Docker Compose
- accès réseau au GeoJSON

## Installation

```bash
docker compose up -d

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

set -a
source .env
set +a

uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Puis ouvrir http://localhost:8000

## Fonctionnalités

- ajout d'un nom + URL GeoJSON
- téléchargement et validation côté serveur
- validation de FeatureCollection avec exactement 9 features
- validation de `properties.name`
- stockage persistant dans PostgreSQL
- affichage transparent des 9 entités
- affichage/masquage d'un utilisateur
- affichage/masquage de chaque entité
- modification de l'URL et du nom
- suppression

## Attention production

Ce MVP ne comporte pas encore d'authentification ni de protection SSRF avancée. Pour une exposition publique, il faut notamment restreindre les domaines autorisés pour les URLs GeoJSON et protéger les opérations d'ajout/modification/suppression.


## Nouveautés de la version 2

- Layer switcher Leaflet avec OpenStreetMap, Carto Positron, Carto Dark Matter, Esri World Imagery et Esri World Gray Canvas.
- Les 9 entités sont triées alphabétiquement.
- Seule `Squadratinhos` est activée par défaut pour chaque utilisateur.
- La propriété GeoJSON `size` est récupérée côté navigateur et affichée à côté de chaque entité.
- Classement dynamique des utilisateurs selon la somme des `size` des entités actuellement sélectionnées et des utilisateurs actuellement visibles.
- Le classement est recalculé sans recharger la page.

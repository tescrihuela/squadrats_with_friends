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
- affichage de tout le monde sur une seule carte
- mode commun (Squadrats, Yardinho, Ubersquadrat, …) appliqué à chaque personne
- contour superposable
- affichage/masquage d'une personne, tout afficher / tout masquer
- classement selon la taille du mode en cours
- modification de l'URL et du nom
- suppression

## Attention production

Ce MVP ne comporte pas encore d'authentification ni de protection SSRF avancée. Pour une exposition publique, il faut notamment restreindre les domaines autorisés pour les URLs GeoJSON et protéger les opérations d'ajout/modification/suppression.


## Nouveautés de la version 2

- Layer switcher Leaflet avec fond gris clair, OpenStreetMap et satellite.
- La propriété GeoJSON `size` est récupérée côté navigateur.
- Le classement est recalculé sans recharger la page.

## Nouveautés de la version 3

- Un sélecteur de mode commun remplace les cases par entité : Yardinho, Ubersquadrat, Squadratinhos, etc. s’affichent pour tout le monde d’un seul coup.
- Le contour (`squadrats-outline`) se superpose sans quitter le mode en cours.
- Le classement, la légende et le cadrage suivent le mode choisi.
- Les tracés les plus petits sont dessinés au-dessus, pour rester visibles.

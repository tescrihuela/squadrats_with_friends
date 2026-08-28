const map = L.map("map").setView([46.5, 2.5], 6);


// --- Fonds de carte ---
const baseMaps = {
    "OpenStreetMap": L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ),

    "Carto Positron": L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_2gk1_1_8e1ea88c2fa1c25338c6a05f",
        {
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
    ),

    "Carto Dark Matter": L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_2gk1_1_8e1ea88c2fa1c25338c6a05f",
        {
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
    ),

    "Esri World Imagery": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution: "Tiles &copy; Esri"
        }
    ),

    "Esri World Gray Canvas": L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 16,
            attribution: "Tiles &copy; Esri"
        }
    )
};

baseMaps["Carto Positron"].addTo(map);


// --- Grilles Squadrats / Squadratinhos ---

const squadratsGrid = L.layerGroup();
const squadratinhosGrid = L.layerGroup();

const overlayMaps = {
    "Squadrats": squadratsGrid,
    "Squadratinhos": squadratinhosGrid
};

L.control.layers(
    baseMaps,
    overlayMaps,
    {
        collapsed: false
    }
).addTo(map);

// --- Calcul des tuiles OSM ---

function latLngToTile(lat, lon, zoom) {
    const n = Math.pow(2, zoom);

    const x = Math.floor((lon + 180) / 360 * n);

    const latRad = lat * Math.PI / 180;

    const y = Math.floor(
        (1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n
    );

    return { x, y };
}


function tileToLatLng(x, y, zoom) {
    const n = Math.pow(2, zoom);

    const lon = x / n * 360 - 180;

    const latRad = Math.atan(
        Math.sinh(Math.PI * (1 - 2 * y / n))
    );

    const lat = latRad * 180 / Math.PI;

    return { lat, lon };
}

function updateGrid(layerGroup, zoom) {
    layerGroup.clearLayers();

    const bounds = map.getBounds();

    const northWest = latLngToTile(
        bounds.getNorth(),
        bounds.getWest(),
        zoom
    );

    const southEast = latLngToTile(
        bounds.getSouth(),
        bounds.getEast(),
        zoom
    );

    // Petite marge pour éviter les trous au bord de l'écran
    const minX = northWest.x - 1;
    const maxX = southEast.x + 1;
    const minY = northWest.y - 1;
    const maxY = southEast.y + 1;

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {

            const nw = tileToLatLng(x, y, zoom);
            const se = tileToLatLng(x + 1, y + 1, zoom);

            L.rectangle(
                [
                    [nw.lat, nw.lon],
                    [se.lat, se.lon]
                ],
                {
                    color: "#1b5e20",
                    weight: 0.5,
                    opacity: 0.2,
                    fill: false,
                    interactive: false
                }
            ).addTo(layerGroup);
        }
    }
}


function updateGrids() {

    const zoom = map.getZoom();

    if (map.hasLayer(squadratsGrid)) {
        if (zoom >= 10) {
		updateGrid(squadratsGrid, 14);
	}
	else {
		squadratsGrid.clearLayers();
	}
    }

    if (map.hasLayer(squadratinhosGrid)) {

        if (zoom >= 13) {
            updateGrid(squadratinhosGrid, 17);
        } else {
            squadratinhosGrid.clearLayers();
        }
    }
}
map.on("moveend", updateGrids);

// --- Données ---
const users = new Map();

const colors = [
    "#e74c3c",
    "#3388ff",
    "#9b59b6",
    "#f39c12",
    "#2ecc71",
    "#1abc9c",
    "#e84393",
    "#636e72",
    "#d63031",
    "#0984e3"
];

function getColor(index) {
    return colors[index % colors.length];
}

function getFeatureName(feature) {
    return String(feature?.properties?.name ?? "Sans nom");
}

function getFeatureSize(feature) {
    const value = feature?.properties?.size;
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatSize(value) {
    return new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0
    }).format(value);
}

function createUserLayer(user, index) {
    const color = getColor(index);
    const featureLayers = {};

    user.geojson.features.forEach(feature => {
        const featureName = getFeatureName(feature);

        const layer = L.geoJSON(feature, {
            style: {
                color,
                fillColor: color,
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.20
            }
        });

        // Par défaut, seule l'entité "Squadratinhos" est affichée.
        if (featureName.toLowerCase() === "squadratinhos".toLowerCase()) {
            layer.addTo(map);
        }

        featureLayers[featureName] = {
            layer,
            feature,
            visible: featureName.toLowerCase() === "squadratinhos".toLowerCase()
        };
    });

    users.set(user.id, {
        user,
        color,
        features: featureLayers,
        visible: true
    });
}

function removeUserLayer(id) {
    const entry = users.get(id);
    if (!entry) return;

    Object.values(entry.features).forEach(item => {
        map.removeLayer(item.layer);
    });

    users.delete(id);
}

function setUserVisibility(id, visible) {
    const entry = users.get(id);
    if (!entry) return;

    entry.visible = visible;

    Object.values(entry.features).forEach(item => {
        if (visible && item.visible) {
            item.layer.addTo(map);
        } else {
            map.removeLayer(item.layer);
        }
    });

    updateRanking();
}

function setFeatureVisibility(id, featureName, visible) {
    const entry = users.get(id);
    if (!entry) return;

    const item = entry.features[featureName];
    if (!item) return;

    item.visible = visible;

    if (entry.visible && visible) {
        item.layer.addTo(map);
    } else {
        map.removeLayer(item.layer);
    }

    updateRanking();
}

function getSelectedFeatureNames() {
    const names = new Set();

    document.querySelectorAll(".feature-checkbox:checked").forEach(cb => {
        names.add(cb.dataset.feature);
    });

    return names;
}

// Classement : pour chaque utilisateur visible, somme des `size` des entités
// actuellement sélectionnées. Les entités non sélectionnées ne comptent pas.
function updateRanking() {
    const container = document.getElementById("ranking");
    if (!container) return;

    const selectedNames = getSelectedFeatureNames();

    const ranking = [];

    users.forEach(entry => {
        if (!entry.visible) return;

        let total = 0;

        Object.values(entry.features).forEach(item => {
            const name = getFeatureName(item.feature);

            if (item.visible && selectedNames.has(name)) {
                total += getFeatureSize(item.feature);
            }
        });

        ranking.push({
            id: entry.user.id,
            name: entry.user.name,
            total
        });
    });

    ranking.sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return a.name.localeCompare(b.name, "fr");
    });

    container.innerHTML = "";

    if (ranking.length === 0) {
        container.innerHTML = '<div class="empty-ranking">Aucun utilisateur sélectionné.</div>';
        return;
    }

    ranking.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "ranking-row";

        const rank = document.createElement("span");
        rank.className = "ranking-position";
        rank.textContent = `${index + 1}.`;

        const name = document.createElement("span");
        name.className = "ranking-name";
        name.textContent = item.name;

        const size = document.createElement("span");
        size.className = "ranking-size";
        size.textContent = formatSize(item.total);

        row.append(rank, name, size);
        container.appendChild(row);
    });
}

function renderUsers(layers) {
    // Nettoyage des anciennes couches.
    users.forEach((_, id) => removeUserLayer(id));

    const container = document.getElementById("layers");
    container.innerHTML = "";

    layers.forEach((user, index) => {
        // On trie les 9 entités par nom.
        user.geojson.features.sort((a, b) =>
            getFeatureName(a).localeCompare(getFeatureName(b), "fr")
        );

        createUserLayer(user, index);

        const element = document.createElement("div");
        element.className = "user";

        const header = document.createElement("div");
        header.className = "user-header";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;

        checkbox.addEventListener("change", () => {
            setUserVisibility(user.id, checkbox.checked);

            document
                .querySelectorAll(`.feature-checkbox[data-user="${user.id}"]`)
                .forEach(cb => {
                    cb.closest(".feature")?.classList.toggle("disabled", !checkbox.checked);
                });
        });

	const name = document.createElement("span");
	name.className = "user-name";
	name.textContent = user.name;

	const colorIndicator = document.createElement("span");
	colorIndicator.className = "user-color-indicator";
	colorIndicator.style.backgroundColor = getColor(index);

        const edit = document.createElement("button");
        edit.className = "icon-button";
        edit.title = "Modifier";
        edit.textContent = "✏️";
        edit.addEventListener("click", () => openEditModal(user));

        const remove = document.createElement("button");
        remove.className = "icon-button";
        remove.title = "Supprimer";
        remove.textContent = "🗑️";
        remove.addEventListener("click", () => deleteUser(user));

        header.append(checkbox, colorIndicator, name, edit, remove);
        element.appendChild(header);

        const features = document.createElement("div");
        features.className = "features";

        user.geojson.features.forEach(feature => {
            const featureName = getFeatureName(feature);

            // Entités techniques que l'on ne veut pas afficher dans l'interface
            const hiddenFeatures = [
                "backyardinhos",
                "backyards",
                "squadrats-outline"
            ];

            if (hiddenFeatures.includes(featureName.toLowerCase())) {
                return;
            }

            const featureSize = getFeatureSize(feature);

            const row = document.createElement("label");
            row.className = "feature";

            const featureCheckbox = document.createElement("input");
            featureCheckbox.type = "checkbox";
            featureCheckbox.className = "feature-checkbox";
            featureCheckbox.dataset.user = user.id;
            featureCheckbox.dataset.feature = featureName;

            // Seul Squadratinhos est actif par défaut.
            featureCheckbox.checked =
                featureName.toLowerCase() === "squadratinhos";

            featureCheckbox.addEventListener("change", () => {
                setFeatureVisibility(user.id, featureName, featureCheckbox.checked);
            });

            const text = document.createElement("span");
            text.textContent = featureName;

            const size = document.createElement("span");
            size.className = "feature-size";
            size.textContent = formatSize(featureSize);

            row.append(featureCheckbox, text, size);
            features.appendChild(row);
        });

        element.appendChild(features);
        container.appendChild(element);
    });

    updateRanking();
}

async function loadLayers() {
    const response = await fetch("/squadrats/api/layers");

    if (!response.ok) {
        alert("Impossible de charger les utilisateurs.");
        return;
    }

    const layers = await response.json();
    renderUsers(layers);
}

function openAddModal() {
    document.getElementById("modalTitle").textContent = "Ajouter un utilisateur";
    document.getElementById("layerId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("squadratsUid").value = "";
    document.getElementById("formError").textContent = "";
    document.getElementById("modal").classList.remove("hidden");
}

function openEditModal(user) {
    document.getElementById("modalTitle").textContent = "Modifier un utilisateur";
    document.getElementById("layerId").value = user.id;
    document.getElementById("name").value = user.name;
    document.getElementById("squadratsUid").value = user.squadrats_uid;
    document.getElementById("formError").textContent = "";
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

async function saveUser(event) {
    event.preventDefault();

    const id = document.getElementById("layerId").value;
    const name = document.getElementById("name").value;
    const squadrats_uid = document.getElementById("squadratsUid").value;
    const error = document.getElementById("formError");

    error.textContent = "Téléchargement et validation du GeoJSON...";

    try {
        const method = id ? "PUT" : "POST";
        const url = id
            ? `/squadrats/api/layers/${id}`
            : "/squadrats/api/layers";

        const response = await fetch(url, {
            method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name,
                squadrats_uid
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Erreur inconnue.");
        }

        closeModal();
        await loadLayers();

    } catch (e) {
        error.textContent = e.message;
    }
}

async function deleteUser(user) {
    if (!confirm(`Supprimer ${user.name} ?`)) return;

    const response = await fetch(`/squadrats/api/layers/${user.id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        alert("Impossible de supprimer cet utilisateur.");
        return;
    }

    removeUserLayer(user.id);
    await loadLayers();
}

document.getElementById("addButton").addEventListener("click", openAddModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelButton").addEventListener("click", closeModal);
document.getElementById("layerForm").addEventListener("submit", saveUser);

document
    .getElementById("refreshLayersBtn")
    .addEventListener("click", async () => {

        const button = document.getElementById("refreshLayersBtn");

        button.disabled = true;
        button.textContent = "🔄 Actualisation...";

        try {
            const response = await fetch(
                "/squadrats/api/layers/refresh",
                {
                    method: "POST"
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || "Erreur");
            }

            console.log("Actualisation terminée :", result);

            // Recharge les données affichées
            await loadLayers();

            alert("Les GeoJSON ont été actualisés.");

        } catch (error) {
            console.error(error);
            alert(
                "Erreur lors de l'actualisation : " +
                error.message
            );

        } finally {
            button.disabled = false;
            button.textContent = "↻ Actualiser";
        }
    });

loadLayers();

L.control.locate({
    position: "topleft",
    setView: "once",
    flyTo: true,
    keepCurrentZoomLevel: false,
    initialZoomLevel: 16,
    drawCircle: true,
    drawMarker: true,
    strings: {
        title: "Me localiser"
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}).addTo(map);

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

sidebarToggle.addEventListener("click", function () {

    const isOpen = sidebar.classList.toggle("mobile-open");

    if (isOpen) {
        sidebarToggle.textContent = "\u00D7";
        sidebarToggle.title = "Fermer le menu";
    } else {
        sidebarToggle.textContent = "\u2630";
        sidebarToggle.title = "Afficher le menu";
    }
});

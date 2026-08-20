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
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
    ),

    "Carto Dark Matter": L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
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
L.control.layers(baseMaps, null, {collapsed: false}).addTo(map);

// --- Données ---
const users = new Map();

const colors = [
    "#3388ff",
    "#e74c3c",
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

        header.append(checkbox, name, edit, remove);
        element.appendChild(header);

        const features = document.createElement("div");
        features.className = "features";

        user.geojson.features.forEach(feature => {
            const featureName = getFeatureName(feature);
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
    document.getElementById("geojsonUrl").value = "";
    document.getElementById("formError").textContent = "";
    document.getElementById("modal").classList.remove("hidden");
}

function openEditModal(user) {
    document.getElementById("modalTitle").textContent = "Modifier un utilisateur";
    document.getElementById("layerId").value = user.id;
    document.getElementById("name").value = user.name;
    document.getElementById("geojsonUrl").value = user.geojson_url;
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
    const geojson_url = document.getElementById("geojsonUrl").value;
    const error = document.getElementById("formError");

    error.textContent = "Téléchargement et validation du GeoJSON...";

    try {
        const method = id ? "PUT" : "POST";
        const url = id ? `/squadrats/api/layers/${id}` : "/squadrats/api/layers";

        const response = await fetch(url, {
            method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, geojson_url})
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
            button.textContent = "🔄 Actualiser les stats";
        }
    });

loadLayers();

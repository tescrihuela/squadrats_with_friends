const map = L.map("map", { zoomControl: false }).setView([46.5, 2.5], 6);

const esriAttribution = "Tiles &copy; Esri";

<<<<<<< HEAD

// --- Fonds de carte ---
=======
>>>>>>> bd11d53 (maj)
const baseMaps = {
    "Gris clair": L.layerGroup([
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            { maxZoom: 19, maxNativeZoom: 16, attribution: esriAttribution }
        ),
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
            { maxZoom: 19, maxNativeZoom: 16 }
        )
    ]),
    "OpenStreetMap": L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }
    ),
<<<<<<< HEAD

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
=======
    "Satellite": L.tileLayer(
>>>>>>> bd11d53 (maj)
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: esriAttribution }
    )
};

<<<<<<< HEAD
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
=======
baseMaps["Gris clair"].addTo(map);
L.control.zoom({ position: "topright" }).addTo(map);
L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);
>>>>>>> bd11d53 (maj)

map.createPane("grids");
map.getPane("grids").style.zIndex = 350;
map.getPane("grids").style.pointerEvents = "none";

<<<<<<< HEAD
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
=======
const squadratsGrid = L.layerGroup();
const squadratinhosGrid = L.layerGroup();
const STORAGE_GRID_SQUADRATS = "squadrats-maison-grid-squadrats";
const STORAGE_GRID_SQUADRATINHOS = "squadrats-maison-grid-squadratinhos";

if (readStorage(STORAGE_GRID_SQUADRATS) === "1") squadratsGrid.addTo(map);
if (readStorage(STORAGE_GRID_SQUADRATINHOS) === "1") squadratinhosGrid.addTo(map);

L.control.layers(baseMaps, {
    "Squadrats": squadratsGrid,
    "Squadratinhos": squadratinhosGrid
}, { collapsed: true, position: "bottomright" }).addTo(map);

map.on("overlayadd overlayremove", event => {
    if (event.layer === squadratsGrid) {
        writeStorage(STORAGE_GRID_SQUADRATS, event.type === "overlayadd" ? "1" : "0");
    }
    if (event.layer === squadratinhosGrid) {
        writeStorage(STORAGE_GRID_SQUADRATINHOS, event.type === "overlayadd" ? "1" : "0");
    }
    updateGrids();
});

function latLngToTile(lat, lon, zoom) {
    const n = 2 ** zoom;
    const x = Math.floor((lon + 180) / 360 * n);
    const latRad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n);
    return { x, y };
}

function tileToLatLng(x, y, zoom) {
    const n = 2 ** zoom;
    const lon = x / n * 360 - 180;
    const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
    return { lat, lon };
}

function updateGrid(layerGroup, zoom, color) {
    layerGroup.clearLayers();

    const bounds = map.getBounds();
    const northWest = latLngToTile(bounds.getNorth(), bounds.getWest(), zoom);
    const southEast = latLngToTile(bounds.getSouth(), bounds.getEast(), zoom);
    const minX = northWest.x - 1;
    const maxX = southEast.x + 1;
    const minY = northWest.y - 1;
    const maxY = southEast.y + 1;
    const columns = maxX - minX + 1;
    const rows = maxY - minY + 1;

    if (columns < 1 || rows < 1 || columns * rows > 6000) return;

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            const nw = tileToLatLng(x, y, zoom);
            const se = tileToLatLng(x + 1, y + 1, zoom);
            L.rectangle(
                [[nw.lat, nw.lon], [se.lat, se.lon]],
                {
                    pane: "grids",
                    color,
                    weight: 1,
                    opacity: 0.55,
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
        if (zoom >= 10) updateGrid(squadratsGrid, 14, "#1b5e20");
        else squadratsGrid.clearLayers();
    } else {
        squadratsGrid.clearLayers();
    }

    if (map.hasLayer(squadratinhosGrid)) {
        if (zoom >= 13) updateGrid(squadratinhosGrid, 17, "#0d47a1");
        else squadratinhosGrid.clearLayers();
    } else {
        squadratinhosGrid.clearLayers();
    }
}

map.on("moveend", updateGrids);

const MODE_CATALOG = [
    {
        id: "squadrats",
        group: "Grands carrés",
        label: "Squadrats",
        hint: "Carrés d’environ 1,2 km. Chacun devient le vôtre dès que vous y entrez."
    },
    {
        id: "yard",
        group: "Grands carrés",
        label: "Yard",
        hint: "La plus grande zone de squadrats reliés par les quatre côtés."
    },
    {
        id: "backyards",
        group: "Grands carrés",
        label: "Backyards",
        hint: "Les autres yards, plus petits que le yard principal."
    },
    {
        id: "ubersquadrat",
        group: "Grands carrés",
        label: "Ubersquadrat",
        hint: "Le plus grand carré entièrement rempli de squadrats."
    },
    {
        id: "squadratinhos",
        group: "Petits carrés",
        label: "Squadratinhos",
        hint: "Les petits carrés : il en faut 64 pour couvrir un squadrat."
    },
    {
        id: "yardinho",
        group: "Petits carrés",
        label: "Yardinho",
        hint: "La plus grande zone de squadratinhos reliés par les quatre côtés."
    },
    {
        id: "backyardinhos",
        group: "Petits carrés",
        label: "Backyardinhos",
        hint: "Les autres yardinhos, plus petits que le yardinho principal."
    },
    {
        id: "ubersquadratinho",
        group: "Petits carrés",
        label: "Ubersquadratinho",
        hint: "Le plus grand carré entièrement rempli de squadratinhos."
    }
>>>>>>> bd11d53 (maj)
];

const OUTLINE_ID = "squadrats-outline";
const STORAGE_MODE = "squadrats-maison-mode";
const STORAGE_OUTLINE = "squadrats-maison-outline";

const users = new Map();
const colors = [
    "#7c3aed",
    "#e11d48",
    "#0284c7",
    "#059669",
    "#d97706",
    "#db2777",
    "#0f766e",
    "#4f46e5",
    "#c2410c",
    "#475569"
];

let activeMode = readStorage(STORAGE_MODE) || "squadratinhos";
let outlineEnabled = readStorage(STORAGE_OUTLINE) === "1";
let didFitOnce = false;
let toastTimer = 0;

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* stockage indisponible */
    }
}

function getColor(index) {
    return colors[index % colors.length];
}

function featureId(feature) {
    return String(feature?.properties?.name ?? "").trim().toLowerCase();
}

function getFeatureSize(feature) {
    const value = feature?.properties?.size;
    if (value == null || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function formatSize(value) {
    return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);
}

function modeLabel(id) {
    const known = MODE_CATALOG.find(mode => mode.id === id);
    if (known) return known.label;
    if (id === OUTLINE_ID) return "Contour";
    return id || "Mode";
}

function sizeOf(entry, modeId) {
    const item = entry.features[modeId];
    if (!item) return null;
    return getFeatureSize(item.feature);
}

function styleFor(color, id) {
    const outline = id === OUTLINE_ID;
    return {
        color,
        fillColor: color,
        weight: outline ? 3 : 1.5,
        opacity: 0.92,
        fillOpacity: outline ? 0 : 0.28,
        lineCap: "round",
        lineJoin: "round"
    };
}

function showToast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3400);
}

function iconSvg(name) {
    const paths = {
        eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
        eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 6.2A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a18.2 18.2 0 0 1-3.2 3.8"/><path d="M6.1 6.1C3.8 7.8 2 12 2 12s3.5 6 10 6c1.5 0 2.9-.3 4.1-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
        pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        trash: '<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 13h8l1-13"/>'
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = paths[name];
    return svg;
}

function iconButton(label, name, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-btn";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.append(iconSvg(name));
    button.addEventListener("click", event => {
        event.stopPropagation();
        onClick();
    });
    return button;
}

function collectModes() {
    const present = new Set();
    users.forEach(entry => {
        Object.keys(entry.features).forEach(id => {
            if (id !== OUTLINE_ID) present.add(id);
        });
    });

    const known = MODE_CATALOG.filter(mode => present.has(mode.id));
    const knownIds = new Set(known.map(mode => mode.id));
    const extra = [...present]
        .filter(id => !knownIds.has(id))
        .sort((a, b) => a.localeCompare(b, "fr"));

    return { known, extra };
}

function hasOutline() {
    let found = false;
    users.forEach(entry => {
        if (entry.features[OUTLINE_ID]) found = true;
    });
    return found;
}

function ensureActiveMode() {
    const { known, extra } = collectModes();
    const ids = [...known.map(mode => mode.id), ...extra];
    if (ids.includes(activeMode)) return;
    if (ids.includes("squadratinhos")) activeMode = "squadratinhos";
    else activeMode = ids[0] || "";
}

function createUserLayer(user, index, visible) {
    const color = getColor(index);
    const features = {};

    user.geojson.features.forEach(feature => {
        const id = featureId(feature);
        if (!id) return;

        const style = styleFor(color, id);
        const layer = L.geoJSON(feature, { style });
        const size = getFeatureSize(feature);
        const tip = size == null
            ? `${user.name} · ${modeLabel(id)}`
            : `${user.name} · ${modeLabel(id)} · ${formatSize(size)}`;

        layer.bindTooltip(tip, {
            sticky: true,
            direction: "top",
            opacity: 1,
            className: "map-tip"
        });
        layer.on("mouseover", () => {
            layer.setStyle({
                ...style,
                weight: style.weight + 1.4,
                fillOpacity: id === OUTLINE_ID ? 0 : 0.5
            });
            layer.bringToFront();
        });
        layer.on("mouseout", () => layer.setStyle(style));
        layer.on("click", () => focusPerson(user.id));

        features[id] = { layer, feature };
    });

    users.set(user.id, { user, color, features, visible });
}

function removeUserLayer(id) {
    const entry = users.get(id);
    if (!entry) return;
    Object.values(entry.features).forEach(item => map.removeLayer(item.layer));
    users.delete(id);
}

function applyMode() {
    const entries = [...users.values()];

    entries.forEach(entry => {
        Object.values(entry.features).forEach(item => {
            if (map.hasLayer(item.layer)) map.removeLayer(item.layer);
        });
    });

    const visible = entries
        .filter(entry => entry.visible)
        .sort((a, b) => (sizeOf(b, activeMode) ?? -1) - (sizeOf(a, activeMode) ?? -1));

    visible.forEach(entry => {
        const item = entry.features[activeMode];
        if (item) item.layer.addTo(map);
    });

    if (outlineEnabled) {
        visible.forEach(entry => {
            const outline = entry.features[OUTLINE_ID];
            if (!outline) return;
            outline.layer.addTo(map);
            outline.layer.bringToFront();
        });
    }

    renderPeople();
    updateModeChrome();
}

function fitToVisible() {
    const bounds = L.latLngBounds([]);
    users.forEach(entry => {
        if (!entry.visible) return;
        const item = entry.features[activeMode];
        if (!item || !map.hasLayer(item.layer)) return;
        const layerBounds = item.layer.getBounds();
        if (layerBounds.isValid()) bounds.extend(layerBounds);
    });
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { padding: [36, 36], animate: true, duration: 0.45 });
}

function setMode(id) {
    activeMode = id;
    writeStorage(STORAGE_MODE, id);
    applyMode();
    requestAnimationFrame(() => fitToVisible());
}

function setAllVisible(visible) {
    users.forEach(entry => {
        entry.visible = visible;
    });
    applyMode();
}

function focusPerson(id) {
    const row = document.querySelector(`[data-person="${id}"]`);
    if (!row) return;
    row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    row.classList.remove("is-pulse");
    void row.offsetWidth;
    row.classList.add("is-pulse");
}

function updateModeChrome() {
    document.querySelectorAll(".mode-btn").forEach(button => {
        button.setAttribute("aria-checked", button.dataset.mode === activeMode ? "true" : "false");
    });

    const meta = MODE_CATALOG.find(mode => mode.id === activeMode);
    document.getElementById("modeHint").textContent = meta
        ? meta.hint
        : (activeMode ? "Ce mode est affiché pour chaque personne." : "Aucun mode disponible.");

    const label = modeLabel(activeMode);
    document.getElementById("rankingTitle").textContent = label;
    document.getElementById("mapBadge").textContent = outlineEnabled && hasOutline()
        ? `${label} + contour`
        : label;

    const outlineRow = document.getElementById("outlineRow");
    outlineRow.hidden = !hasOutline();
    document.getElementById("outlineToggle").checked = outlineEnabled;
}

function renderModeControls() {
    const { known, extra } = collectModes();
    const signature = [...known.map(mode => mode.id), ...extra].join("|");
    const grid = document.getElementById("modeGrid");

    if (grid.dataset.signature !== signature) {
        grid.dataset.signature = signature;
        grid.replaceChildren();

        const groups = new Map();
        known.forEach(mode => {
            if (!groups.has(mode.group)) groups.set(mode.group, []);
            groups.get(mode.group).push(mode);
        });
        if (extra.length) {
            groups.set("Autres", extra.map(id => ({ id, label: id })));
        }

        groups.forEach((modes, group) => {
            const wrap = document.createElement("div");
            wrap.className = "mode-group";

            const title = document.createElement("p");
            title.className = "group-label";
            title.textContent = group;

            const buttons = document.createElement("div");
            buttons.className = "mode-grid";

            modes.forEach(mode => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "mode-btn";
                button.dataset.mode = mode.id;
                button.setAttribute("role", "radio");
                button.textContent = mode.label;
                button.addEventListener("click", () => setMode(mode.id));
                buttons.append(button);
            });

            wrap.append(title, buttons);
            grid.append(wrap);
        });
    }

    updateModeChrome();
}

function compareRows(a, b) {
    const left = a.size ?? -1;
    const right = b.size ?? -1;
    if (right !== left) return right - left;
    return a.entry.user.name.localeCompare(b.entry.user.name, "fr");
}

function summaryText(visibleRows) {
    const count = visibleRows.length;
    const people = count === 0
        ? "Aucune personne affichée"
        : count === 1
            ? "1 personne"
            : `${count} personnes`;
    const total = visibleRows.reduce((sum, row) => sum + (row.size ?? 0), 0);
    const hasSize = visibleRows.some(row => row.size != null);
    if (!hasSize) return people;
    return `${people} · ${formatSize(total)} au total`;
}

function personNode(row, rank, max) {
    const { entry, size } = row;
    const article = document.createElement("article");
    article.className = "person";
    if (!entry.visible) article.classList.add("is-hidden");
    if (rank === 1) article.classList.add("is-leader");
    article.dataset.person = String(entry.user.id);
    article.style.setProperty("--person", entry.color);
    article.title = entry.visible ? "Masquer sur la carte" : "Afficher sur la carte";

    if (entry.visible && max > 0 && size != null) {
        article.style.setProperty("--share", `${Math.max(8, (size / max) * 100)}%`);
    }

    const bar = document.createElement("span");
    bar.className = "person-bar";
    bar.setAttribute("aria-hidden", "true");

    const rankEl = document.createElement("span");
    rankEl.className = "rank";
    rankEl.textContent = rank ? String(rank) : "";

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "person-name";
    name.textContent = entry.user.name;

    const sizeEl = document.createElement("span");
    sizeEl.className = "person-size";
    sizeEl.textContent = size == null ? "—" : formatSize(size);

    const actions = document.createElement("div");
    actions.className = "person-actions";
    actions.append(
        iconButton(
            entry.visible ? `Masquer ${entry.user.name}` : `Afficher ${entry.user.name}`,
            entry.visible ? "eye" : "eyeOff",
            () => {
                entry.visible = !entry.visible;
                applyMode();
            }
        ),
        iconButton(`Modifier ${entry.user.name}`, "pencil", () => openEditModal(entry.user)),
        iconButton(`Supprimer ${entry.user.name}`, "trash", () => deleteUser(entry.user))
    );
    actions.lastElementChild.classList.add("danger");

    article.append(bar, rankEl, dot, name, sizeEl, actions);
    article.addEventListener("click", event => {
        if (event.target.closest("button")) return;
        entry.visible = !entry.visible;
        applyMode();
    });
    return article;
}

function renderLegend(visibleRows) {
    const legend = document.getElementById("mapLegend");
    legend.replaceChildren();
    visibleRows.forEach(row => {
        const chip = document.createElement("span");
        chip.style.setProperty("--person", row.entry.color);
        const swatch = document.createElement("i");
        chip.append(swatch, document.createTextNode(row.entry.user.name));
        legend.append(chip);
    });
}

function renderPeople() {
    const container = document.getElementById("people");
    const summary = document.getElementById("modeSummary");
    const sidebar = document.getElementById("sidebar");
    const scrollTop = sidebar.scrollTop;

    const rows = [...users.values()].map(entry => ({
        entry,
        size: sizeOf(entry, activeMode)
    }));
    const visible = rows.filter(row => row.entry.visible).sort(compareRows);
    const hidden = rows.filter(row => !row.entry.visible).sort(compareRows);
    const max = visible.reduce((current, row) => Math.max(current, row.size ?? 0), 0);

    summary.textContent = users.size === 0
        ? "En attente de la première carte."
        : summaryText(visible);

    container.replaceChildren();

    if (users.size === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Ajoute une carte pour commencer la comparaison.";
        container.append(empty);
        renderLegend([]);
        sidebar.scrollTop = scrollTop;
        return;
    }

    visible.forEach((row, index) => container.append(personNode(row, index + 1, max)));

    if (hidden.length) {
        const label = document.createElement("p");
        label.className = "people-label";
        label.textContent = "Masqués";
        container.append(label);
        hidden.forEach(row => container.append(personNode(row, null, max)));
    }

    renderLegend(visible);
    sidebar.scrollTop = scrollTop;
}

function snapshotHidden() {
    const hidden = new Set();
    users.forEach((entry, id) => {
        if (!entry.visible) hidden.add(id);
    });
    return hidden;
}

function renderUsers(layers, hidden) {
    users.forEach((_, id) => removeUserLayer(id));

    [...layers]
        .sort((a, b) => a.name.localeCompare(b.name, "fr"))
        .forEach((user, index) => {
            createUserLayer(user, index, !hidden.has(user.id));
        });

<<<<<<< HEAD
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
=======
    ensureActiveMode();
    renderModeControls();
    applyMode();

    if (!didFitOnce) {
        didFitOnce = true;
        requestAnimationFrame(() => fitToVisible());
    }
>>>>>>> bd11d53 (maj)
}

async function loadLayers() {
    const hidden = snapshotHidden();

    try {
        const response = await fetch("/squadrats/api/layers");
        if (!response.ok) throw new Error("chargement");
        const layers = await response.json();
        renderUsers(layers, hidden);
    } catch {
        showToast("Impossible de charger les cartes.");
        document.getElementById("modeHint").textContent = "Les cartes n’ont pas pu être chargées.";
        document.getElementById("modeSummary").textContent = "";
    }
}

function openAddModal() {
    document.getElementById("modalTitle").textContent = "Ajouter une personne";
    document.getElementById("layerId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("squadratsUid").value = "";
    document.getElementById("formError").textContent = "";
    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("name").focus();
}

function openEditModal(user) {
    document.getElementById("modalTitle").textContent = "Modifier une personne";
    document.getElementById("layerId").value = user.id;
    document.getElementById("name").value = user.name;
    document.getElementById("squadratsUid").value = user.squadrats_uid;
    document.getElementById("formError").textContent = "";
    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("name").focus();
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
    const submit = event.target.querySelector('button[type="submit"]');

    error.textContent = "Téléchargement et validation du GeoJSON…";
    submit.disabled = true;

    try {
<<<<<<< HEAD
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
=======
        const response = await fetch(id ? `/squadrats/api/layers/${id}` : "/squadrats/api/layers", {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, geojson_url })
>>>>>>> bd11d53 (maj)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Erreur inconnue.");

        closeModal();
        await loadLayers();
<<<<<<< HEAD

    } catch (e) {
        error.textContent = e.message;
=======
        showToast(id ? `${name.trim()} a été mis à jour.` : `${name.trim()} a été ajouté.`);
    } catch (err) {
        error.textContent = err.message;
    } finally {
        submit.disabled = false;
>>>>>>> bd11d53 (maj)
    }
}

async function deleteUser(user) {
    if (!confirm(`Supprimer ${user.name} ?`)) return;

    const response = await fetch(`/squadrats/api/layers/${user.id}`, { method: "DELETE" });
    if (!response.ok) {
        showToast("Impossible de supprimer cette personne.");
        return;
    }

    showToast(`${user.name} a été retiré.`);
    await loadLayers();
}

document.getElementById("addButton").addEventListener("click", openAddModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelButton").addEventListener("click", closeModal);
document.getElementById("layerForm").addEventListener("submit", saveUser);
document.getElementById("modal").addEventListener("click", event => {
    if (event.target.id === "modal") closeModal();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !document.getElementById("modal").classList.contains("hidden")) {
        closeModal();
    }
});

document.getElementById("showAll").addEventListener("click", () => setAllVisible(true));
document.getElementById("hideAll").addEventListener("click", () => setAllVisible(false));
document.getElementById("fitButton").addEventListener("click", fitToVisible);
document.getElementById("outlineToggle").addEventListener("change", event => {
    outlineEnabled = event.target.checked;
    writeStorage(STORAGE_OUTLINE, outlineEnabled ? "1" : "0");
    applyMode();
});

document.getElementById("refreshLayersBtn").addEventListener("click", async () => {
    const button = document.getElementById("refreshLayersBtn");
    const label = button.querySelector("span");
    const previous = label.textContent;

    button.disabled = true;
    label.textContent = "Actualisation…";

    try {
        const response = await fetch("/squadrats/api/layers/refresh", { method: "POST" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Erreur");

        await loadLayers();

<<<<<<< HEAD
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
=======
        const updated = result.updated ?? 0;
        const failed = result.failed ?? 0;
        if (failed) {
            showToast(`${updated} carte(s) actualisée(s), ${failed} en échec.`);
        } else if (updated > 1) {
            showToast(`${updated} cartes actualisées.`);
        } else {
            showToast("Carte actualisée.");
>>>>>>> bd11d53 (maj)
        }
    } catch (error) {
        showToast(`Actualisation impossible : ${error.message}`);
    } finally {
        button.disabled = false;
        label.textContent = previous;
    }
});

updateGrids();
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

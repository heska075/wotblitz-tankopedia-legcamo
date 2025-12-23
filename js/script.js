let nations = {};

const nationList = [
    { id: "usa", label: "U.S.A." },
    { id: "germany", label: "Germany" },
    { id: "ussr", label: "U.S.S.R." },
    { id: "uk", label: "U.K." },
    { id: "japan", label: "Japan" },
    { id: "china", label: "China" },
    { id: "france", label: "France" },
    { id: "european", label: "European Nation" },
    { id: "other", label: "Hybrid Nation" }
];

window.addEventListener("DOMContentLoaded", () => {
    loadAllNations();
});

document.getElementById("tankGrid").classList.add("holidayBackground");

async function loadAllNations() {
    nations = {};

    for (const nation of nationList) {
        try {
            const res = await fetch(`json/${nation.id}.json`);
            nations[nation.id] = await res.json();
        } catch (err) {
            console.error(`Failed to load ${nation.id}.json`, err);
        }
    }

    buildTabs();
}

function buildTabs() {
    const tabs = document.getElementById("tabs");
    tabs.innerHTML = "";

    nationList.forEach(nation => {
        const btn = document.createElement("button");

        btn.innerHTML = `
            <img class="flagIcon" src="img/flags/${nation.id}.webp" draggable="false" loading="lazy" onerror="this.style.display='none'">
            <span>${nation.label}</span>
        `;

        btn.onclick = () => {
            document.querySelectorAll("#tabs button")
                .forEach(b => b.classList.remove("activeTab"));

            btn.classList.add("activeTab");
            showNation(nation.id);

            console.log("Loaded nations:", Object.keys(nations));
        };

        tabs.appendChild(btn);
    });

    const first = tabs.querySelector("button");
    if (first) first.click();
}

function cleanNationName(name) {
    return name
        .replace(/\./g, "")
        .trim();
}

function showNation(nationName) {
    const grid = document.getElementById("tankGrid");
    grid.innerHTML = "";

    const tankList = nations[nationName];

    if (!Array.isArray(tankList)) {
        console.warn("No tanks found for nation:", nationName);
        return;
    }

    tankList.forEach(tank => {
        const card = document.createElement("div");
        card.className = "tankCard";

        const tankType = String(tank.type || "").toLowerCase();

        if (tankType.includes("premium")) {
            card.classList.add("premium");
        } else if (tankType.includes("collector")) {
            card.classList.add("collector");
        }

        const folderName = cleanNationName(nationName);
        const devId = tank.dev_id;

        card.innerHTML = `
            <img src="img/tanks/${folderName}/${devId}.webp"
                draggable="false"
                loading="lazy"
                onerror="this.style.display='none'">

            <h3>${tank.short_name || tank.full_name}</h3>
            <div class="meta">Tier ${tank.tier} — ${tank.class}</div>
            <div class="meta">${tank.type}</div>
        `;

        grid.appendChild(card);
        card.onclick = () => openPricePopup(tank, folderName, devId);
    });
}

const popup = document.getElementById("pricePopup");
const popupTitle = document.getElementById("popupTitle");
const priceBody = document.getElementById("priceTableBody");
const camoTable = document.querySelector(".camoTable");
const camoHead = document.getElementById("camoTableHead");
const camoBody = document.getElementById("camoTableBody");

popup.querySelector(".closeBtn").onclick = () => {
    popup.classList.add("hidden");
};

function formatNumber(value) {
    if (typeof value !== "number") return value;
    return value.toLocaleString("en-US");
}

function openPricePopup(tank, folderName, devId) {
    priceBody.innerHTML = "";
    popupTitle.textContent = tank.full_name || tank.short_name;

    const popupImage = document.getElementById("popupTankImage");

    popupImage.style.display = "";
    popupImage.src = `img/tanks/${folderName}/${devId}.webp`;

    const type = String(tank.type || "").toLowerCase();
    const group =
        type.includes("premium") ? "premium" :
        type.includes("collector") ? "collector" :
        "tech tree";

    priceColumns[group].forEach(entry => {
        const value = tank[entry.key];

        if (value === null) return;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.label}</td>
            <td class="value-cell"><p>${formatNumber(value)}</p> <img class="currency-icon" src="img/currency/${entry.icon}.webp" draggable="false"></td>
        `;
        priceBody.appendChild(row);
    });

    popup.classList.remove("hidden");

    camoBody.innerHTML = "";
    camoTable.classList.add("hidden");

    let hasCamo = false;

    if (tank.camouflage && typeof tank.camouflage === "object") {
        Object.entries(tank.camouflage).forEach(([presetId, name]) => {
            if (!name) return;

            hasCamo = true;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${name}</td>
                <td>
                    <div class="camo-images">
                        <img class="tank-camo"
                            src="img/camo/${devId}_${presetId}.webp"
                            draggable="false"
                            loading="lazy"
                            onerror="this.style.display='none'">

                        <img class="camo-icon"
                            src="img/camo/icon/${devId}_${presetId}.webp"
                            draggable="false"
                            loading="lazy"
                            onerror="this.style.display='none'">
                    </div>
                </td>
            `;

            camoBody.appendChild(row);
        });
    }

    if(hasCamo) {
        camoTable.classList.remove("hidden");
    }
}

console.log("camoTable tag:", camoTable?.tagName);

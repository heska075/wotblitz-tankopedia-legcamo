/* import { version } from "react"; */
import {
    initNationSelector
} from "./switch_nation_tree.js";

const params =
    new URLSearchParams(
        window.location.search
    );

const version =
    params.get("version")
    || "current";

const nation =
    params.get("nation")
    || "usa";

const unavailableNations54 = ["european", "other"];

if (version === "5.4" && unavailableNations54.includes(nation)) {
    nation = "usa";
    params.set("nation", nation);
    window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
    );
}

initNationSelector(nation, version);



const versionSelector =
    document.getElementById("version-selector");

if (versionSelector) {

    versionSelector.value = version;

    versionSelector.addEventListener(
        "change",
        () => {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            params.set(
                "version",
                versionSelector.value
            );

            window.location.search =
                params.toString();
        }
    );
}

const menuToggle =
    document.getElementById("menu-toggle");

const sideMenu =
    document.getElementById("side-menu");

if (menuToggle && sideMenu) {

    menuToggle.addEventListener(
        "click",
        () => {
            sideMenu.classList.toggle("open");
        }
    );
}

/* const response =
    await fetch(`json/${nation}.json`); */

const jsonPath =
    version === "current"
        ? `json/${nation}.json`
        : `json/${version}/${nation}.json`;

const response = await fetch(jsonPath);

const tanks =
    await response.json();
const svg = document.getElementById("tree-lines");

const treeTanks = tanks.filter(
    tank => tank.tree?.row !== undefined
);

const tankMap = {};

tanks.forEach(tank => {
    tankMap[tank.dev_id] = tank;
});

const incomingConnections = {};

tanks.forEach(tank => {

    if (!tank.next) return;

    tank.next.forEach(childId => {

        if (!incomingConnections[childId]) {
            incomingConnections[childId] = [];
        }

        incomingConnections[childId].push(
            tank.dev_id
        );

    });

});

const container = document.getElementById("research-tree");

const COLUMN_WIDTH = 280;
const ROW_HEIGHT = 140;

const tierToColumn = {
    "I": 0,
    "II": 1,
    "III": 2,
    "IV": 3,
    "V": 4,
    "VI": 5,
    "VII": 6,
    "VIII": 7,
    "IX": 8,
    "X": 9,
    "XI": 10
};

const classShort = {
    "Light": "LT",
    "Medium": "MT",
    "Heavy": "HT"
};

const minRow = Math.min(
    ...treeTanks.map(tank => tank.tree.row)
);
const rowOffset = -minRow;

treeTanks.forEach(tank => {
    const shortClass = (classShort[tank.class] || tank.class).toLowerCase();

    let iconName = shortClass;

    if (tank.type === "Premium") {
        iconName += "_pr";
    } else if (tank.type === "Collector") {
        iconName += "_co";
    } else {
        iconName += "_tt";
    }

    const node = document.createElement("div");

    if (tank.type === "Premium") {
        node.className = "tank-node premium";
    } else if (tank.type === "Collector") {
        node.className = "tank-node collector";
    } else {
        node.className = "tank-node";
    }
    node.dataset.id = tank.dev_id;
    node.id = `tank-${tank.dev_id}`;

    const x = tierToColumn[tank.tier] * COLUMN_WIDTH;

    const TOP_PADDING = 20;

    const y = TOP_PADDING + (tank.tree.row + rowOffset) * ROW_HEIGHT;

    

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    const tankImagePath =
        version === "current"
            ? `img/tanks/${nation}/${tank.dev_id}.webp`
            : `img/tanks/${version}/${nation}/${tank.dev_id}.webp`;

    node.innerHTML = `
        <div class="tank-info">
            <strong>${tank.short_name}</strong>
            <div class="tank-meta">
                <div class="tank-class-icon" style="background-image: url('img/tank_class/${iconName}.svg')" alt="${tank.class}"></div>
                <span>${tank.tier}</span>
            </div>
        </div>
        
        <img class="tt-image" src="${tankImagePath}" draggable="false" data-fallback="img/tanks/${nation}/${tank.dev_id}.webp" onerror="if (this.src.includes('placeholder/Placeholder.webp')) return; this.src = this.dataset.fallback;" />
    `;

    container.appendChild(node);
});

const SEPARATOR_OFFSET = 5;
const premiumRows = treeTanks
    .filter(tank => tank.type === "Premium" || tank.type === "Collector")
    .map(tank => Number(tank.tree.row));

if (premiumRows.length) {

    const topPremiumRow = Math.min(...premiumRows);
    const bottomPremiumRow = Math.max(...premiumRows);

    const premiumBg = document.createElement("div");

    premiumBg.id = "premium-background";

    premiumBg.style.top =
        `${(topPremiumRow + rowOffset) * ROW_HEIGHT}px`;

    premiumBg.style.height =
        `${((bottomPremiumRow - topPremiumRow + 1) * ROW_HEIGHT) - SEPARATOR_OFFSET}px`;

    container.prepend(premiumBg);
}

svg.setAttribute(
    "width",
    container.scrollWidth
);

svg.setAttribute(
    "height",
    container.scrollHeight
);

const defs = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "defs"
);

const marker = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
);

marker.setAttribute("id", "arrow");
marker.setAttribute("markerWidth", "6");
marker.setAttribute("markerHeight", "6");
marker.setAttribute("refX", "5");
marker.setAttribute("refY", "2");
marker.setAttribute("orient", "auto");
marker.setAttribute("markerUnits", "strokeWidth");

const arrowPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
);

arrowPath.setAttribute(
    "d",
    "M0,0 L0,4 L5,2 z"
);

arrowPath.setAttribute(
    "fill",
    "#d13030"
);

marker.appendChild(arrowPath);
defs.appendChild(marker);
svg.appendChild(defs);

tanks.forEach(tank => {

    if (!tank.next) return;

    tank.next.forEach(childId => {

        const child = tankMap[childId];

        if (!child) return;

        drawConnection(
            tank.dev_id,
            childId
        );

    });

});

function drawConnection(parentId, childId) {

    const parentNode =
        document.getElementById(`tank-${parentId}`);

    const childNode =
        document.getElementById(`tank-${childId}`);

    if (!parentNode || !childNode) return;

    const incoming =
        incomingConnections[childId] || [];

    const connectionIndex =
        incoming.indexOf(parentId);

    const parentRow =
        tankMap[parentId].tree.row;

    const childRow =
        tankMap[childId].tree.row;

    let yOffset = 0;

    if (incoming.length === 2) {

        if (parentRow < childRow) {
            yOffset = -15;
        } else {
            yOffset = 15;
        }

    }
    else if (incoming.length === 3) {

        if (connectionIndex === 0) {
            yOffset = -15;
        }
        else if (connectionIndex === 1) {
            yOffset = 0;
        }
        else {
            yOffset = 15;
        }

    }

    const parentRect =
        parentNode.getBoundingClientRect();

    const childRect =
        childNode.getBoundingClientRect();

    const svgRect =
        svg.getBoundingClientRect();

    const x1 =
        parentRect.right - svgRect.left;

    const y1 =
        parentRect.top -
        svgRect.top +
        parentRect.height / 2;

    const x2 =
        childRect.left - svgRect.left;

    let y2 =
        childRect.top -
        svgRect.top +
        childRect.height / 2;

    if (incoming.length === 2) {

        if (parentRow < childRow) {
            y2 -= 20;
        }
        else if (parentRow > childRow) {
            y2 += 20;
        }

    }
    else if (incoming.length === 3) {

        if (connectionIndex === 0) {
            y2 -= 15;
        }
        else if (connectionIndex === 2) {
            y2 += 15;
        }

    }

    //const midX = x2 - 30;

    const parentTank = tankMap[parentId];
    const childTank = tankMap[childId];

    let pathData;
    let arrowPoints;

    // Same-tier progression
    if (parentTank.tier === childTank.tier) {

        const x =
            parentRect.left -
            svgRect.left +
            parentRect.width / 2;

        const childBelow = childRow > parentRow;

        let startY;
        let endY;

        if (childBelow) {

            // parent -> child below
            startY =
                parentRect.bottom - svgRect.top;

            endY =
                childRect.top - svgRect.top;

            pathData =
                `M ${x} ${startY}
                V ${endY - 8}`;

            arrowPoints =
                `${x - 5},${endY - 10}
                ${x + 5},${endY - 10}
                ${x},${endY}`;

        } else {

            // parent -> child above
            startY =
                parentRect.top - svgRect.top;

            endY =
                childRect.bottom - svgRect.top;

            pathData =
                `M ${x} ${startY}
                V ${endY + 8}`;

            arrowPoints =
                `${x - 5},${endY + 10}
                ${x + 5},${endY + 10}
                ${x},${endY}`;
        }
    } 
    else {

        const splitX = x2 - 30;

        pathData =
            `M ${x1} ${y1}
            H ${splitX}
            V ${y2}
            H ${x2 - 7}`;

        arrowPoints =
            `${x2-10},${y2-5}
            ${x2-10},${y2+5}
            ${x2},${y2}`;
    }

    const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    path.setAttribute(
        "d",
        pathData
    );

    const arrow = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon"
    );

    arrow.setAttribute(
        "points",
        arrowPoints
    );

    arrow.setAttribute("fill", "#888");

    svg.appendChild(arrow);

    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#888");
    path.setAttribute("stroke-width", "1.5");
    
    svg.appendChild(path);
}

const actualHeight = Math.max(
    ...Array.from(
        document.querySelectorAll(".tank-node")
    ).map(
        node =>
            node.offsetTop +
            node.offsetHeight
    )
);

const actualWidth = Math.max(
    ...Array.from(
        document.querySelectorAll(".tank-node")
    ).map(
        node =>
            node.offsetLeft +
            node.offsetWidth
    )
);

container.style.width =
    `${actualWidth + 20}px`;

container.style.height =
    `${actualHeight + 20}px`;

svg.setAttribute(
    "width",
    actualWidth
);

svg.setAttribute(
    "height",
    actualHeight
);

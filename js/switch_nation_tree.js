import { nationList } from "./nations.js";

export const unavailableNationsByVersion = {
    "5.4": ["european", "other"],
    "1.0": ["china", "european", "france", "japan", "other", "uk"]
};

export function getUnavailableNations(version) {
    return unavailableNationsByVersion[version] || [];
}

export function getAvailableNations(version) {
    const unavailableNations = getUnavailableNations(version);

    return nationList.filter(
        nation => !unavailableNations.includes(nation.id)
    );
}

export function initNationSelector(currentNation, version = "current") {
    const selector = document.getElementById("nation-selector");

    selector.innerHTML = "";

    const availableNations = getAvailableNations(version);

    availableNations.forEach(nation => {
        const button = document.createElement("button");

        button.className = "nation-button";

        if (nation.id === currentNation) {
            button.classList.add("active");
        }

        button.innerHTML =`
            <img src="../img/flags/tank_tree/5.4/${nation.id}.webp" alt="${nation.label}" draggable="false" loading="lazy" />
        `;

        button.addEventListener("click", () => {
            if (nation.id === currentNation) return;

            const params = new URLSearchParams(window.location.search);
            params.set("nation", nation.id);
            window.location.search = params.toString();
            // window.location.href = `/tech_tree/${version}/${nation.id}`;
        });

        selector.appendChild(button);
    });
}
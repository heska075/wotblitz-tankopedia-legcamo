import { nationList } from "./nations.js";

export function initNationSelector(currentNation, version = "current") {
    const selector = document.getElementById("nation-selector");

    selector.innerHTML = "";

    const unavailableNations54 = ["european", "other"];

    const availableNations = nationList.filter(nation => {
        if (version === "5.4" && unavailableNations54.includes(nation.id)) {
            return false;
        }

        return true;
    });

    availableNations.forEach(nation => {
        const button = document.createElement("button");

        button.className = "nation-button";

        if (nation.id === currentNation) {
            button.classList.add("active");
        }

        button.innerHTML =`
            <img src="img/flags/tank_tree/5.4/${nation.id}.webp" alt="${nation.label}" draggable="false" />
        `;

        button.addEventListener("click", () => {
            if (nation.id === currentNation) return;

            const params = new URLSearchParams(window.location.search);
            params.set("nation", nation.id);
            window.location.search = params.toString();
        });

        selector.appendChild(button);
    });
}
// const GAME_VERSION = "null";
const GAME_VERSION = "11.19.0.638_7320204";

// const TEST_VERSION = "null";
const TEST_VERSION = null;

const versionEl = document.getElementById("gameVersion");

versionEl.textContent = TEST_VERSION
    ? `${GAME_VERSION} (${TEST_VERSION})`
    : GAME_VERSION;


// const GAME_VERSION = "null";
const GAME_VERSION = "11.16.1.646_6486309";

// const TEST_VERSION = "null";
const TEST_VERSION = null;

const versionEl = document.getElementById("gameVersion");

versionEl.textContent = TEST_VERSION
    ? `${GAME_VERSION} (${TEST_VERSION})`
    : GAME_VERSION;


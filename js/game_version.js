const GAME_VERSION = "11.4.0.57_6360835";

const TEST_VERSION = "11.16.0_supertest";
// const TEST_VERSION = null;

const versionEl = document.getElementById("gameVersion");

versionEl.textContent = TEST_VERSION
    ? `${GAME_VERSION} (${TEST_VERSION})`
    : GAME_VERSION;


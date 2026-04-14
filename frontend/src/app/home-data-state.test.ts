import test from "node:test";
import assert from "node:assert/strict";

import { getTop10PanelState } from "./home-data-state.js";

test("shows an error state instead of an endless loading state when merged data fails", () => {
  assert.equal(getTop10PanelState(null, "No se pudo cargar el análisis territorial."), "error");
});

test("keeps the loading state while merged data is still pending", () => {
  assert.equal(getTop10PanelState(null, null), "loading");
});

test("shows the ranking once merged data is available", () => {
  assert.equal(getTop10PanelState({ features: [{ properties: { NOMBRE: "Sol" } }] }, null), "ready");
});

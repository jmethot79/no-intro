/**
 * YT Skipper — popup.js
 *
 * Gère l'interface de configuration :
 *  - activation / désactivation du plugin
 *  - réglage du nombre de secondes à sauter (1–60)
 *
 * Utilise browser.storage.sync (via le polyfill) pour persister les réglages
 * et browser.tabs pour notifier les onglets YouTube ouverts en temps réel.
 */

"use strict";

const DEFAULTS = { skipSeconds: 5, enabled: true };
const MIN = 1;
const MAX = 60;

// ─── Références DOM ───────────────────────────────────────────────────────────
const toggleEnabled = document.getElementById("toggleEnabled");
const secCard       = document.getElementById("secCard");
const secValue      = document.getElementById("secValue");
const secRange      = document.getElementById("secRange");
const btnMinus      = document.getElementById("btnMinus");
const btnPlus       = document.getElementById("btnPlus");
const statusBar     = document.getElementById("statusBar");

let saveTimer   = null;
let statusTimer = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
browser.storage.sync.get(DEFAULTS).then((data) => {
  toggleEnabled.checked = data.enabled;
  renderSeconds(data.skipSeconds);
  updateCardState(data.enabled);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function renderSeconds(val) {
  val = clamp(val, MIN, MAX);
  secValue.textContent = val;
  secRange.value = val;
  btnMinus.disabled = val <= MIN;
  btnPlus.disabled  = val >= MAX;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function currentSeconds() {
  return parseInt(secRange.value, 10);
}

function updateCardState(enabled) {
  secCard.classList.toggle("disabled", !enabled);
}

// ─── Sauvegarde ───────────────────────────────────────────────────────────────
function saveSettings() {
  const payload = {
    skipSeconds: currentSeconds(),
    enabled:     toggleEnabled.checked,
  };

  browser.storage.sync.set(payload);

  // Notifier les onglets YouTube ouverts (sans attendre de réponse)
  browser.tabs.query({ url: "*://*.youtube.com/*" }).then((tabs) => {
    tabs.forEach((tab) => {
      browser.tabs.sendMessage(tab.id, {
        type:        "settingsUpdated",
        skipSeconds: payload.skipSeconds,
        enabled:     payload.enabled,
      });
    });
  });

  showSaved();
}

function showSaved() {
  clearTimeout(statusTimer);
  statusBar.classList.add("visible");
  statusTimer = setTimeout(() => statusBar.classList.remove("visible"), 1600);
}

// ─── Événements ───────────────────────────────────────────────────────────────
toggleEnabled.addEventListener("change", () => {
  updateCardState(toggleEnabled.checked);
  saveSettings();
});

secRange.addEventListener("input", () => {
  renderSeconds(currentSeconds());
  saveSettings();
});

btnMinus.addEventListener("click", () => {
  renderSeconds(currentSeconds() - 1);
  saveSettings();
});

btnPlus.addEventListener("click", () => {
  renderSeconds(currentSeconds() + 1);
  saveSettings();
});

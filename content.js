/**
 * YT Skipper — content.js
 *
 * Injecté sur toutes les pages YouTube. Détecte le démarrage de chaque vidéo
 * et avance automatiquement la position de lecture au délai configuré.
 *
 * Fonctionnement :
 *  1. Écoute les changements d'URL (YouTube est une Single Page App).
 *  2. Sur chaque nouvelle vidéo, attend que l'élément <video> soit prêt.
 *  3. Dès le premier événement "play", avance currentTime si on est encore
 *     dans la zone à sauter.
 *  4. Affiche un toast discret pour informer l'utilisateur.
 */

"use strict";

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEFAULTS = {
  skipSeconds: 5,
  enabled: true,
};

// Nombre de tentatives max pour trouver l'élément <video> (intervalle de 100ms)
const MAX_POLL_ATTEMPTS = 150; // 15 secondes

// ─── État interne ─────────────────────────────────────────────────────────────

let settings = { ...DEFAULTS };
let hasSkipped = false;       // true = déjà sauté pour la vidéo courante
let lastVideoUrl = "";        // dernière URL détectée
let pollInterval = null;      // intervalle de recherche du <video>
let boundOnPlay = null;       // référence pour retirer l'écouteur "play"
let currentVideo = null;      // référence à l'élément <video> courant

// ─── Chargement des paramètres ────────────────────────────────────────────────

async function loadSettings() {
  try {
    const stored = await browser.storage.sync.get(DEFAULTS);
    settings = { ...DEFAULTS, ...stored };
  } catch (err) {
    // En cas d'erreur, on conserve les valeurs par défaut
    console.warn("[YT Skipper] Impossible de lire les paramètres :", err);
  }
}

// ─── Logique de saut ──────────────────────────────────────────────────────────

/**
 * Tente d'avancer la vidéo si elle est encore dans la zone à sauter.
 * @param {HTMLVideoElement} video
 */
function performSkip(video) {
  if (!settings.enabled || hasSkipped) return;
  if (video.readyState === 0) return; // pas encore prête

  const target = settings.skipSeconds;

  if (video.currentTime < target) {
    video.currentTime = target;
    hasSkipped = true;
    showToast(`⏩ ${target}s sautées`);
  } else {
    // L'utilisateur a déjà dépassé la zone — on ne touche à rien
    hasSkipped = true;
  }
}

function onVideoPlay() {
  if (currentVideo) performSkip(currentVideo);
}

// ─── Détection de la vidéo ────────────────────────────────────────────────────

function startPolling() {
  stopPolling();
  let attempts = 0;

  pollInterval = setInterval(() => {
    attempts++;
    const video = document.querySelector("video");

    if (video && video !== currentVideo) {
      // Nouvelle vidéo trouvée — retirer l'ancien écouteur si nécessaire
      if (currentVideo && boundOnPlay) {
        currentVideo.removeEventListener("play", boundOnPlay);
      }

      currentVideo = video;
      boundOnPlay = onVideoPlay;
      video.addEventListener("play", boundOnPlay, { once: true });

      // Si la vidéo est déjà en lecture (autoplay)
      if (!video.paused) {
        performSkip(video);
      }
    }

    // Arrêter le polling après le saut ou après le délai max
    if (hasSkipped || attempts >= MAX_POLL_ATTEMPTS) {
      stopPolling();
    }
  }, 100);
}

function stopPolling() {
  if (pollInterval !== null) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// ─── Détection des changements de vidéo (SPA) ─────────────────────────────────

function onUrlChange() {
  const currentUrl = location.href;
  if (currentUrl === lastVideoUrl) return;

  lastVideoUrl = currentUrl;
  hasSkipped = false;
  currentVideo = null;

  const isWatchPage = /youtube\.com\/watch/.test(currentUrl);

  if (isWatchPage) {
    loadSettings().then(() => startPolling());
  } else {
    stopPolling();
  }
}

// Observer les mutations du DOM pour détecter les navigations SPA
const navigationObserver = new MutationObserver(onUrlChange);
navigationObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// ─── Toast de notification ────────────────────────────────────────────────────

/**
 * Affiche un message discret dans le coin inférieur droit de la page.
 * @param {string} message
 */
function showToast(message) {
  const TOAST_ID = "yt-skipper-toast";
  const existing = document.getElementById(TOAST_ID);
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = TOAST_ID;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;

  Object.assign(toast.style, {
    position:       "fixed",
    bottom:         "80px",
    right:          "24px",
    background:     "rgba(15, 15, 15, 0.88)",
    color:          "#ffffff",
    fontFamily:     "'YouTube Noto', Roboto, sans-serif",
    fontSize:       "13px",
    fontWeight:     "500",
    padding:        "8px 14px",
    borderRadius:   "6px",
    zIndex:         "2147483647",
    pointerEvents:  "none",
    opacity:        "0",
    transition:     "opacity 0.2s ease",
    backdropFilter: "blur(4px)",
  });

  document.body.appendChild(toast);

  // Animation d'entrée/sortie
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  });
}

// ─── Messages depuis la popup ─────────────────────────────────────────────────

browser.runtime.onMessage.addListener((message) => {
  if (message && message.type === "settingsUpdated") {
    settings = {
      skipSeconds: message.skipSeconds ?? settings.skipSeconds,
      enabled:     message.enabled     ?? settings.enabled,
    };
    // Permettre un nouveau saut sur la vidéo courante si les réglages changent
    hasSkipped = false;
  }
});

// ─── Initialisation ───────────────────────────────────────────────────────────

loadSettings().then(() => onUrlChange());

/**
 * YT Skipper — content.js (v1.0.1 - fixed)
 */

"use strict";

const DEFAULTS = { skipSeconds: 5, enabled: true };
const MAX_POLL_ATTEMPTS = 150;

let settings = { ...DEFAULTS };
let hasSkipped = false;
let lastVideoUrl = "";
let pollInterval = null;
let currentVideo = null;

async function loadSettings() {
  try {
    const stored = await browser.storage.sync.get(DEFAULTS);
    settings = { ...DEFAULTS, ...stored };
    console.log("[YT Skipper] Settings loaded:", settings);
  } catch (err) {
    console.warn("[YT Skipper] Could not load settings:", err);
  }
}

function performSkip(video) {
  console.log("[YT Skipper] performSkip called — enabled:", settings.enabled, "hasSkipped:", hasSkipped, "currentTime:", video.currentTime, "readyState:", video.readyState);
  if (!settings.enabled || hasSkipped) return;
  if (video.readyState === 0) return;

  const target = settings.skipSeconds;
  if (video.currentTime < target) {
    console.log("[YT Skipper] Skipping to", target);
    video.currentTime = target;
    hasSkipped = true;
    showToast(`⏩ ${target}s skipped`);
  } else {
    console.log("[YT Skipper] Already past skip zone");
    hasSkipped = true;
  }
}

function startPolling() {
  stopPolling();
  let attempts = 0;
  console.log("[YT Skipper] Starting polling...");

  pollInterval = setInterval(() => {
    attempts++;
    const video = document.querySelector("video");

    if (video) {
      if (video !== currentVideo) {
        console.log("[YT Skipper] Video element found, readyState:", video.readyState, "paused:", video.paused);
        currentVideo = video;

        // Listen for play event
        video.addEventListener("play", function onPlay() {
          console.log("[YT Skipper] Play event fired");
          performSkip(video);
          video.removeEventListener("play", onPlay);
        });

        // Also try immediately if already playing
        if (!video.paused && video.readyState > 0) {
          performSkip(video);
        }
      }

      // Keep trying to skip until we succeed (handles autoplay timing)
      if (!hasSkipped && !video.paused && video.readyState > 0) {
        performSkip(video);
      }
    }

    if (hasSkipped || attempts >= MAX_POLL_ATTEMPTS) {
      console.log("[YT Skipper] Stopping poll — hasSkipped:", hasSkipped, "attempts:", attempts);
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

function onUrlChange() {
  const currentUrl = location.href;
  console.log("[YT Skipper] URL check:", currentUrl);

  if (currentUrl === lastVideoUrl) return;
  lastVideoUrl = currentUrl;
  hasSkipped = false;
  currentVideo = null;

  const isWatchPage = /youtube\.com\/watch/.test(currentUrl);
  console.log("[YT Skipper] isWatchPage:", isWatchPage);

  if (isWatchPage) {
    loadSettings().then(() => startPolling());
  } else {
    stopPolling();
  }
}

// Watch for SPA navigation via URL polling (more reliable than MutationObserver for YouTube)
setInterval(onUrlChange, 500);

function showToast(message) {
  const TOAST_ID = "yt-skipper-toast";
  const existing = document.getElementById(TOAST_ID);
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = TOAST_ID;
  toast.textContent = message;

  Object.assign(toast.style, {
    position:      "fixed",
    bottom:        "80px",
    right:         "24px",
    background:    "rgba(15, 15, 15, 0.88)",
    color:         "#ffffff",
    fontFamily:    "Roboto, sans-serif",
    fontSize:      "13px",
    fontWeight:    "500",
    padding:       "8px 14px",
    borderRadius:  "6px",
    zIndex:        "2147483647",
    pointerEvents: "none",
    opacity:       "0",
    transition:    "opacity 0.2s ease",
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  });
}

browser.runtime.onMessage.addListener((message) => {
  if (message && message.type === "settingsUpdated") {
    settings = {
      skipSeconds: message.skipSeconds ?? settings.skipSeconds,
      enabled:     message.enabled     ?? settings.enabled,
    };
    hasSkipped = false;
  }
});

// Init
console.log("[YT Skipper] Content script loaded on:", location.href);
loadSettings().then(() => onUrlChange());

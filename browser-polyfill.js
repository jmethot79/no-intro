/**
 * browser-polyfill.js — compatibilité Chrome (chrome.*) / Firefox (browser.*)
 *
 * Firefox expose les API WebExtension sous `browser` (Promises natives).
 * Chrome les expose sous `chrome` (callbacks). Ce mini-polyfill unifie les deux
 * sous `browser` pour que le code principal n'ait pas à se soucier du navigateur.
 *
 * Note : Mozilla fournit un polyfill officiel complet (webextension-polyfill).
 * Cette version légère couvre uniquement les API utilisées par YT Skipper.
 */

if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
  // On est sur Chrome (ou un navigateur sans `browser` natif) → on crée l'alias
  globalThis.browser = {
    storage: {
      sync: {
        get: (keys) =>
          new Promise((resolve, reject) =>
            chrome.storage.sync.get(keys, (result) =>
              chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(result)
            )
          ),
        set: (items) =>
          new Promise((resolve, reject) =>
            chrome.storage.sync.set(items, () =>
              chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve()
            )
          ),
      },
    },
    runtime: {
      onMessage: chrome.runtime.onMessage,
      lastError: chrome.runtime.lastError,
    },
    tabs: {
      query: (queryInfo) =>
        new Promise((resolve, reject) =>
          chrome.tabs.query(queryInfo, (tabs) =>
            chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(tabs)
          )
        ),
      sendMessage: (tabId, message) =>
        new Promise((resolve) => {
          try {
            chrome.tabs.sendMessage(tabId, message, (response) => {
              // Ignorer l'erreur si l'onglet n'a pas de content script actif
              void chrome.runtime.lastError;
              resolve(response);
            });
          } catch (_) {
            resolve(undefined);
          }
        }),
    },
  };
}

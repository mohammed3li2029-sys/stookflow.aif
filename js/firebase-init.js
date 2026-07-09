/* ============================================================================
   StockFlow — Firebase Bootstrap (Auth + Realtime Database)
   ============================================================================
   This module:
     - Initializes Firebase only if js/firebase-config.js has been filled in.
     - Exposes a small, safe API on window.StockFlowFirebase that the rest
       of the app (js/app.js) uses. If Firebase isn't configured, every
       method degrades gracefully so the app keeps working in demo mode.
     - Provides generic Realtime Database helpers (loadCollection /
       syncCollection) used to back the Inventory and Warehouses modules
       with real, persistent data.
   ============================================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const cfg = window.STOCKFLOW_FIREBASE_CONFIG || {};
const isConfigured = Object.values(cfg).every(v => v && !String(v).includes("REPLACE_ME"));

let app = null, auth = null, db = null;
let authReady = Promise.resolve(null);

if (isConfigured) {
  try {
    app = initializeApp(cfg);
    auth = getAuth(app);
    db = getDatabase(app);

    authReady = new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
          unsubscribe();
          resolve(user);
          return;
        }
        signInAnonymously(auth).catch(err => {
          console.warn('[StockFlow] Firebase anonymous sign-in failed:', err);
          resolve(null);
        });
      }, err => {
        console.warn('[StockFlow] Firebase auth listener failed:', err);
        resolve(null);
      });
    });
  } catch (err) {
    console.error("[StockFlow] Firebase failed to initialize:", err);
  }
} else {
  console.info("[StockFlow] Firebase config not set, running in demo mode (local sample data only).");
}

/** Sign in with email + password. Rejects if Firebase isn't configured. */
function signInWithEmail(email, password) {
  if (!auth) return Promise.reject(new Error("firebase-not-configured"));
  return signInWithEmailAndPassword(auth, email, password);
}

function signOutUser() {
  if (!auth) return Promise.resolve();
  return signOut(auth);
}

function onAuthChange(cb) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, cb);
}

/** Turn a Firestore-style safe key into a Realtime Database safe key
    (RTDB keys can't contain . # $ [ ] /) */
function safeKey(raw) {
  return String(raw).replace(/[.#$\[\]\/\s]/g, "_");
}

/** Load a whole collection (stored as an object keyed by id) as a plain array. */
async function loadCollection(name) {
  if (!db) return null; // null = "not available", caller should keep demo data
  await authReady;
  try {
    const snap = await get(ref(db, name));
    if (!snap.exists()) return null;
    const val = snap.val();
    const arr = Object.values(val);
    return arr.length ? arr : null;
  } catch (err) {
    console.error(`[StockFlow] Failed to load Realtime Database node "${name}":`, err);
    return null;
  }
}

/**
 * Overwrite a Realtime Database node with the current contents of `items`.
 * Each item is stored keyed by a safe version of its unique field
 * (id/sku/name). Debounced per collection so rapid edits don't spam writes.
 */
const _timers = {};
function syncCollection(name, items, idField) {
  if (!db) return; // demo mode: nothing to sync
  clearTimeout(_timers[name]);
  _timers[name] = setTimeout(async () => {
    try {
      await authReady;
      if (!db) return;
      const obj = {};
      items.forEach((item, i) => {
        const id = safeKey(item[idField] ?? i);
        obj[id] = item;
      });
      await set(ref(db, name), obj);
    } catch (err) {
      console.error(`[StockFlow] Failed to sync Realtime Database node "${name}":`, err);
    }
  }, 500);
}

window.StockFlowFirebase = {
  enabled: isConfigured,
  signInWithEmail,
  signOutUser,
  onAuthChange,
  loadCollection,
  syncCollection
};

// Let the rest of the app know Firebase is ready to use (or confirmed demo-only).
Promise.resolve(authReady).then(() => {
  window.dispatchEvent(new CustomEvent("stockflow-firebase-ready", { detail: { enabled: isConfigured } }));
});

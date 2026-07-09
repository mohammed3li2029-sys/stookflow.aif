/* ============================================================================
   StockFlow — Firebase Bootstrap (Auth + Firestore)
   ============================================================================
   This module:
     - Initializes Firebase only if js/firebase-config.js has been filled in.
     - Exposes a small, safe API on window.StockFlowFirebase that the rest
       of the app (js/app.js) uses. If Firebase isn't configured, every
       method degrades gracefully so the app keeps working in demo mode.
     - Provides generic Firestore helpers (loadCollection / syncCollection)
       used to back the Inventory and Warehouses modules with real data.
   ============================================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const cfg = window.STOCKFLOW_FIREBASE_CONFIG || {};
const isConfigured = Object.values(cfg).every(v => v && !String(v).includes("REPLACE_ME"));

let app = null, auth = null, db = null;

if (isConfigured) {
  try {
    app = initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("[StockFlow] Firebase failed to initialize:", err);
  }
} else {
  console.info("[StockFlow] Firebase config not set — running in demo mode (local sample data only).");
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

/** Load every document from a Firestore collection as a plain array. */
async function loadCollection(name) {
  if (!db) return null; // null = "not available", caller should keep demo data
  try {
    const snap = await getDocs(collection(db, name));
    if (snap.empty) return null;
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error(`[StockFlow] Failed to load Firestore collection "${name}":`, err);
    return null;
  }
}

/**
 * Overwrite a Firestore collection with the current contents of `items`.
 * Each item must have a stable unique field (id/sku/name) used as its doc ID.
 * Debounced per collection so rapid edits don't spam writes.
 */
const _timers = {};
function syncCollection(name, items, idField) {
  if (!db) return; // demo mode: nothing to sync
  clearTimeout(_timers[name]);
  _timers[name] = setTimeout(async () => {
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(collection(db, name));
      existing.forEach(d => batch.delete(d.ref));
      items.forEach((item, i) => {
        const id = String(item[idField] ?? i).replace(/[\/\s]/g, "_");
        batch.set(doc(db, name, id), item);
      });
      await batch.commit();
    } catch (err) {
      console.error(`[StockFlow] Failed to sync Firestore collection "${name}":`, err);
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
window.dispatchEvent(new CustomEvent("stockflow-firebase-ready", { detail: { enabled: isConfigured } }));

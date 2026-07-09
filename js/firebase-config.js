/* ============================================================================
   StockFlow — Firebase Configuration (Realtime Database)
   ============================================================================
   HOW TO ACTIVATE FIREBASE (Auth + Realtime Database):

   1. Go to https://console.firebase.google.com -> your project
      (databaseURL below is already set to yours).
   2. In Project Settings -> General -> "Your apps", add a Web App and copy
      the config object Firebase gives you.
   3. Paste apiKey / authDomain / projectId / appId below, replacing every
      "REPLACE_ME" value. Leave databaseURL as is (already filled in).
   4. In the Firebase Console, enable:
        - Authentication -> Sign-in method -> Email/Password
        - Realtime Database -> make sure it exists (it does, you shared
          its URL) and deploy database.rules.json (see README.md).
   5. Create at least one user under Authentication -> Users, or let users
      self-register if you wire up a sign-up flow.

   Until apiKey/authDomain/projectId/appId are filled in, StockFlow
   automatically runs in DEMO MODE: built-in sample data + demo login
   (username: admin / password: 123456), no Firebase project required.
   This is what makes the site work immediately after deployment with
   zero configuration, while staying upgradable to a real backend
   whenever you're ready.
   ============================================================================ */

window.STOCKFLOW_FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  databaseURL: "https://stook-flow-default-rtdb.firebaseio.com",
  appId: "REPLACE_ME"
};

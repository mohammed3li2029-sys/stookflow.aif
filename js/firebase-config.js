/* ============================================================================
   StockFlow — Firebase Configuration
   ============================================================================
   HOW TO ACTIVATE FIREBASE (Auth + Firestore):

   1. Go to https://console.firebase.google.com and create a project
      (or use an existing one).
   2. In Project Settings → General → "Your apps", add a Web App and copy
      the config object Firebase gives you.
   3. Paste the values below, replacing every "REPLACE_ME" value.
   4. In the Firebase Console, enable:
        - Authentication → Sign-in method → Email/Password
        - Firestore Database → Create database (start in production mode)
   5. Deploy the firestore.rules file included in this project
      (Firebase Console → Firestore → Rules, or via the Firebase CLI:
       `firebase deploy --only firestore:rules`).
   6. Create at least one user under Authentication → Users, or let users
      self-register if you wire up a sign-up flow.

   Until you fill this in, StockFlow automatically runs in DEMO MODE:
   it uses the built-in sample data and the demo login
   (username: admin / password: 123456) — no Firebase project required.
   This is what makes the site work immediately after upload to
   Cloudflare Pages with zero configuration, while still being upgradable
   to a real backend whenever you're ready.
   ============================================================================ */

window.STOCKFLOW_FIREBASE_CONFIG = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

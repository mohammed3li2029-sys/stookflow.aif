/* ============================================================================
   StockFlow — Firebase Configuration (Auth + Realtime Database)
   ============================================================================
   This file is filled in with your real Firebase project (stook-flow).

   Still required before it goes live:
   1. Firebase Console -> Authentication -> Sign-in method -> enable
      Email/Password.
   2. Firebase Console -> Authentication -> Users -> add at least one user
      (email + password) - StockFlow only talks to Firebase when you log in
      with an EMAIL address. The demo account (admin / 123456) stays local
      on purpose and never touches Firebase.
   3. Deploy database.rules.json (included in this project) via:
        firebase deploy --only database
      or by pasting its contents into Firebase Console -> Realtime Database
      -> Rules.
   ============================================================================ */

window.STOCKFLOW_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCGsNliyDdbpZGCLwaHENqTfsq4OtLsWmI",
  authDomain: "stook-flow.firebaseapp.com",
  databaseURL: "https://stook-flow-default-rtdb.firebaseio.com",
  projectId: "stook-flow",
  appId: "1:850696711319:web:74e3221ae4a04dd9530dd2"
};

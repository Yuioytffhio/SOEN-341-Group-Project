// frontend/src/lib/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_VALUE",
  authDomain: "PASTE_YOUR_VALUE",
  projectId: "PASTE_YOUR_VALUE",
  storageBucket: "PASTE_YOUR_VALUE",
  messagingSenderId: "PASTE_YOUR_VALUE",
  appId: "PASTE_YOUR_VALUE",
};

// initialize once (prevents duplicate-app error during HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

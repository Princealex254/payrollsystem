/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Firebase Initialization
 * ============================================================
 * Initializes Firebase app, auth, db, and storage.
 * Provides the singleton instances used throughout the app.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
// Initialize Firebase with new project
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCJCrnatvZHLCz0CNm21MHzmIIBFVix0Io",
  authDomain: "prince-alex-payroll.firebaseapp.com",
  projectId: "prince-alex-payroll",
  storageBucket: "prince-alex-payroll.firebasestorage.app",
  messagingSenderId: "344752223450",
  appId: "1:344752223450:web:4238c90da59e5ef938e1e3"
};

const fbApp = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(fbApp);
const auth = getAuth(fbApp);
const storage = getStorage(fbApp);

export { fbApp, db, auth, storage };
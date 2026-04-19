import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// පද්මිනී ආරක්ෂිත සම්බන්ධතාවය
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// --- නිෂ්පාදන මට්ටමේ (Production) ආරක්ෂණ පියවර ---
let app;
try {
    if (!firebaseConfig.apiKey) {
        console.warn("Firebase Keys missing! Local storage data only mode enabled.");
        app = null;
    } else {
        app = initializeApp(firebaseConfig);
    }
} catch (error) {
    console.error("Firebase Initialization Error:", error.message);
    app = null;
}

export const firebaseApp = app;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const messaging = app ? getMessaging(app) : null;
export const googleProvider = new GoogleAuthProvider();

export { RecaptchaVerifier, signInWithPhoneNumber };

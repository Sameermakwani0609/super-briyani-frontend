// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config from environment variables (client-safe, prefixed with NEXT_PUBLIC_)
const envConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Require env vars (no hardcoded fallback)
if (!envConfig.apiKey) {
  throw new Error(
    "Firebase config is missing. Set NEXT_PUBLIC_FIREBASE_* env vars (see README)."
  );
}

const firebaseConfig = envConfig;

// Prevent re-initializing Firebase on hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth instance
export const auth = getAuth(app);

// Persist auth state in browser localStorage
setPersistence(auth, browserLocalPersistence).catch(() => {
  // ignore errors in some environments
});

// Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Firestore
export const db = getFirestore(app);
export const timestamp = serverTimestamp;
export const storage = getStorage(app);



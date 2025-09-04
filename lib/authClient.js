// lib/authClient.js
"use client";

import {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

/**
 * Try popup sign-in; if popup fails (blocked) fall back to redirect flow.
 * For redirect flow the browser will navigate away and return to your app.
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result; // contains .user
  } catch (err) {
    // Popup might be blocked (iOS Safari). Use redirect as fallback.
    await signInWithRedirect(auth, googleProvider);
    return null; // redirect flow will finish elsewhere
  }
};

export function logout() {
  // Clear user session (example: remove token from localStorage)
  localStorage.removeItem("authToken");
  // Optionally, trigger any auth change listeners
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authChange"));
  }
}

export const logOut = async () => {
  return signOut(auth);
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

export function getCurrentUser() {
  return auth?.currentUser || null;
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { signInWithGoogle, onAuthChange, logOut } from "../../lib/authClient";

export default function AuthForm({ onClose }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.backgroundColor = "black";
      return () => {
        document.body.style.backgroundColor = "";
      };
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setBusy(true);
    try {
      const result = await signInWithGoogle();
      if (result?.user) router.push("/");
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert("Google Sign-In failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm bg-yellow-600 rounded-2xl shadow-2xl p-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-black text-center mb-6 transition-colors duration-300">
          User Login
        </h2>
        {!user ? (
          <button
            type="button"
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 bg-black text-yellow-400 py-3 rounded-lg font-semibold shadow hover:bg-gray-900 transition-all duration-300"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={24} />
            {busy ? " Signing in..." : "Continue with Google"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />
            <p className="text-black font-semibold">
              Welcome, {user.displayName}
            </p>
            <button
              onClick={() => logOut()}
              className="px-4 py-2 bg-black text-yellow-400 rounded-lg shadow hover:bg-gray-900 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        )}
        {/* Back to Home */}
        <button
          type="button"
          onClick={() => {
            router.push("/");
            if (onClose) onClose();
          }}
          className="mt-6 w-full bg-black text-yellow-400 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

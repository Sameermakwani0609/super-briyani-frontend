"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import bcrypt from "bcryptjs";

export default function AdminLogin({ onClose }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.backgroundColor = "black";
      return () => {
        document.body.style.backgroundColor = "";
      };
    }
  }, []);

  useEffect(() => {
    router.prefetch("/adminlogin");
  }, [router]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMsgType("");

    if (!email || !password) {
      setMessage("Enter email & password");
      setMsgType("error");
      return;
    }

    setBusy(true);
    try {
      const inputEmail = (email || "").trim();
      const q = query(
        collection(db, "admins"),
        where("email", "==", inputEmail)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage("No admin found for this email");
        setMsgType("error");
        setBusy(false);
        return;
      }

      const adminDoc = snapshot.docs[0].data();
      let hash = adminDoc.passwordHash || adminDoc.password || null;
      if (!hash || !hash.startsWith("$2")) {
        for (const key of Object.keys(adminDoc)) {
          if (adminDoc[key]?.startsWith("$2")) {
            hash = adminDoc[key];
            break;
          }
        }
      }

      if (!hash) {
        setMessage("Admin record missing password hash.");
        setMsgType("error");
        setBusy(false);
        return;
      }

      const isValid = bcrypt.compareSync(password, hash);
      if (isValid) {
        try {
          localStorage.setItem("isAdminAuthed", "true");
          localStorage.setItem("alertMutedUntil", String(Date.now() + 15000));
        } catch {}
        setMessage("Login successful!...");
        setMsgType("success");
        setTimeout(() => router.push("/admin"), 1200);
      } else {
        setMessage("Incorrect password");
        setMsgType("error");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error logging in admin!");
      setMsgType("error");
    } finally {
      setBusy(false);
    }
  };

  const msgStyles = {
    success: "bg-green-600 text-white border-green-400",
    error: "bg-red-600 text-white border-red-400",
    info: "bg-yellow-500 text-black border-yellow-400",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-sm sm:max-w-md bg-yellow-600 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.6)] p-6 sm:p-8 flex flex-col items-center">
        {/* Lock Icon */}
        <div className="text-5xl mb-2">🔒</div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-black text-center mb-6">
          Admin Sign In
        </h2>

        {/* Message */}
        {message && (
          <div
            className={`w-full text-center mb-6 py-2 sm:py-3 px-3 sm:px-4 rounded-xl border font-semibold sm:font-bold text-base sm:text-lg shadow-lg animate-bounce-in ${
              msgStyles[msgType] || msgStyles.info
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4 w-full" onSubmit={handleAdminLogin}>
          <input
            type="text"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black placeholder-gray-600 
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
            transition-all duration-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black placeholder-gray-600 
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
            transition-all duration-300"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-black to-gray-800 text-yellow-400 
            py-3 rounded-lg font-semibold hover:from-gray-800 hover:to-black 
            transition-all duration-300 disabled:opacity-60"
          >
            {busy ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Back to Home */}
        <button
          type="button"
          onClick={() => {
            router.push("/");
            if (onClose) onClose();
          }}
          className="mt-6 w-full bg-black text-yellow-400 py-2 rounded-lg font-semibold 
          hover:bg-gray-900 transition-all duration-300"
        >
          Back to Home
        </button>
      </div>

      {/* Animations */}
      <style>{`
        .animate-bounce-in {
          animation: bounceIn 0.5s ease;
        }
        @keyframes bounceIn {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

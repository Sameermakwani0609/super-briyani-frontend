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
  const [message, setMessage] = useState(""); // Add message state
  const [msgType, setMsgType] = useState(""); // success, error, info

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.backgroundColor = "black";
      return () => {
        document.body.style.backgroundColor = "";
      };
    }
  }, []);

  // Prefetch /adminlogin route so form loads instantly
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
          // Mute new-order sound briefly right after login
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

  // Message styles
  const msgStyles = {
    success: "bg-green-700 text-white border-green-400",
    error: "bg-red-700 text-white border-red-400",
    info: "bg-yellow-600 text-black border-yellow-400",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm bg-yellow-600 rounded-2xl shadow-2xl p-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-black text-center mb-6 transition-colors duration-300">
          Admin Sign In
        </h2>
        {/* Creative centered message */}
        {message && (
          <div
            className={`w-full flex justify-center items-center mb-6 animate-fade-in py-3 px-4 rounded-xl border-2 font-bold text-lg shadow-lg transition-all duration-500 ${
              msgStyles[msgType] || msgStyles.info
            }`}
            style={{ minHeight: "56px" }}
          >
            {message}
          </div>
        )}
        <form className="space-y-4 w-full" onSubmit={handleAdminLogin}>
          <input
            type="text"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-black text-yellow-400 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300"
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
          className="mt-6 w-full bg-black text-yellow-400 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300"
        >
          Back to Home
        </button>
      </div>
      {/* Add fade-in animation */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95);}
          to { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
  );
}

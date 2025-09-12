"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "../AdminDashboard";

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let ok = false;
    try {
      ok = localStorage.getItem("isAdminAuthed") === "true";
    } catch {}
    setIsAuthed(ok);
    setAuthChecked(true);
    if (!ok) router.replace("/adminlogin");
  }, [router]);

  if (!authChecked) {
    return (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 50 }}
        className="flex items-center justify-center bg-black"
      >
        <div className="text-yellow-400 text-xl animate-pulse">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <AdminDashboard />
    </div>
  );
}

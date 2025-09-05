"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "../AdminDashboard";

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    try {
      const ok = localStorage.getItem("isAdminAuthed") === "true";
      if (!ok) router.replace("/adminlogin");
    } catch {
      router.replace("/adminlogin");
    }
  }, [router]);
  return (
    <div className="w-full h-full">
      <AdminDashboard />
    </div>
  );
}



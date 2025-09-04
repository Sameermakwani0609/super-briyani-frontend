"use client";
import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div
      id="loading"
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
    >
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-4xl md:text-5xl font-semibold text-yellow-400">Super Briyani</h2>
        <p className="mt-1 text-gray-400">Preparing your luxury experience...</p>
      </div>
    </div>
  );
}

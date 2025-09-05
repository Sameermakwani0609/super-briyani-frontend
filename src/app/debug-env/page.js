"use client";

export default function DebugEnvPage() {
  const checks = [
    {
      key: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
      ok: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
    },
    {
      key: "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
      ok: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET),
    },
    { key: "NEXT_PUBLIC_FIREBASE_API_KEY", ok: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) },
    { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", ok: Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) },
    { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", ok: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) },
    { key: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", ok: Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) },
    { key: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", ok: Boolean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) },
    { key: "NEXT_PUBLIC_FIREBASE_APP_ID", ok: Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Env Check (safe)</h1>
      <p className="text-sm text-gray-300 mb-6">Values are not shown; only presence is indicated.</p>
      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.key} className="flex items-center justify-between border border-gray-700 rounded px-4 py-2">
            <span className="font-mono text-sm">{c.key}</span>
            <span className={c.ok ? "text-green-400" : "text-red-400"}>{c.ok ? "present" : "missing"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}



"use client";

import { useEffect, useRef, useState } from "react";

export default function ImageUploader({ onUploadComplete, buttonLabel = "Upload Image", className = "" }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    // Debug log to verify env variables on the client (dev only)
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[ImageUploader] Cloudinary config:",
        { cloudName, uploadPreset }
      );
    }
  }, [cloudName, uploadPreset]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setIsUploading(true);
    setProgress(10);

    try {
      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary env vars missing");
      }

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // XHR to track progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };
      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            const uploadedUrl = res.secure_url || res.url;
            setPreviewUrl(uploadedUrl || "");
            if (uploadedUrl && typeof onUploadComplete === "function") {
              onUploadComplete(uploadedUrl);
            }
          } catch (e) {
            setError("Failed to parse upload response");
          }
        } else {
          setError("Upload failed. Please try again.");
        }
      };
      xhr.onerror = () => {
        setIsUploading(false);
        setError("Network error during upload");
      };
      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setError(err?.message || "Upload failed");
    }
  };

  const isEnvMissing = !cloudName || !uploadPreset;

  return (
    <div className={className}>
      {isEnvMissing && (
        <div className="mb-2 p-3 rounded border border-red-500 text-red-300 bg-red-900/20">
          Cloudinary env vars missing. Expected `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` in .env.local. Detected:
          <div className="mt-1 text-xs text-red-200">
            cloudName: {String(cloudName || "(undefined)")}, uploadPreset: {String(uploadPreset || "(undefined)")}
          </div>
        </div>
      )}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isEnvMissing}
        >
          {isUploading ? `Uploading ${progress}%` : buttonLabel}
        </button>
        {previewUrl && (
          <img src={previewUrl} alt="Uploaded preview" className="w-12 h-12 object-cover rounded" />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}



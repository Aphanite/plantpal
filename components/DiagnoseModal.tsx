"use client";

import { useState, useRef } from "react";
import { saveDiagnosis } from "@/lib/db";
import type { Plant, Diagnosis } from "@/lib/types";

interface Props {
  plant: Plant;
  onClose: () => void;
}

export default function DiagnoseModal({ plant, onClose }: Props) {
  const [photo, setPhoto] = useState<string | null>(plant.photo ?? null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleDiagnose() {
    if (!photo) return;
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo, plantName: plant.name }),
      });

      if (!res.ok) throw new Error("Diagnosis failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setResult(full);
      }

      // Persist diagnosis
      const diagnosis: Diagnosis = {
        id: crypto.randomUUID(),
        plantId: plant.id,
        photo,
        result: full,
        createdAt: new Date().toISOString(),
      };
      await saveDiagnosis(diagnosis);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Diagnose — {plant.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Photo selector */}
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full h-48 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors overflow-hidden"
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="plant" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm text-gray-400">📷 Tap to add / change photo</span>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

        <button
          onClick={handleDiagnose}
          disabled={!photo || loading}
          className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-2.5 font-medium text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "🔍 Diagnose with AI"}
        </button>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        {result && (
          <div className="bg-green-50 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            <p className="font-semibold text-green-800 mb-2">AI Diagnosis</p>
            {result}
            {loading && <span className="inline-block w-1.5 h-4 bg-green-600 ml-1 animate-pulse" />}
          </div>
        )}
      </div>
    </div>
  );
}

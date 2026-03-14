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
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-pp-navy border border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-white/30 tracking-widest uppercase mb-0.5">Diagnose</p>
            <h2 className="text-white font-bold text-xl tracking-tight">{plant.name}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg transition-colors">✕</button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="w-full h-52 rounded-xl border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-pp-teal/50 transition-colors overflow-hidden"
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="plant" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/30 text-sm">📷 Tap to add / change photo</span>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

        <button
          onClick={handleDiagnose}
          disabled={!photo || loading}
          className="bg-pp-teal hover:brightness-110 text-pp-navy rounded-xl py-3 font-bold text-sm tracking-wide transition-all disabled:opacity-40"
        >
          {loading ? "Analyzing..." : "🔍 Diagnose with AI"}
        </button>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
        )}

        {result && (
          <div className="bg-pp-navy-mid border border-pp-teal/20 rounded-xl px-4 py-4 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
            <p className="font-bold text-pp-teal text-xs tracking-widest uppercase mb-3">AI Diagnosis</p>
            {result}
            {loading && <span className="inline-block w-1.5 h-4 bg-pp-sky ml-1 animate-pulse rounded-sm" />}
          </div>
        )}
      </div>
    </div>
  );
}

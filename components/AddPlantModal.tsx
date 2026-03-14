"use client";

import { useState, useRef } from "react";
import { savePlant } from "@/lib/db";
import type { Plant } from "@/lib/types";

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddPlantModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [wateringDays, setWateringDays] = useState(7);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const plant: Plant = {
      id: crypto.randomUUID(),
      name: name.trim(),
      species: species.trim() || undefined,
      photo: photo ?? undefined,
      wateringIntervalDays: wateringDays,
      lastWatered: new Date().toISOString(),
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    await savePlant(plant);
    onAdded();
    onClose();
  }

  const inputClass = "bg-pp-navy-mid border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-pp-teal w-full";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-pp-navy border border-white/10 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-xl tracking-tight">Add Plant</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-lg leading-none transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Photo picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 rounded-xl border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-pp-teal/50 transition-colors overflow-hidden relative"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="plant" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/30 text-sm">📷 Add photo</span>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

          <input required placeholder="Plant name *" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          <input placeholder="Species (optional)" value={species} onChange={(e) => setSpecies(e.target.value)} className={inputClass} />

          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm whitespace-nowrap">Water every</span>
            <input
              type="number" min={1} max={60} value={wateringDays}
              onChange={(e) => setWateringDays(Number(e.target.value))}
              className="bg-pp-navy-mid border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white w-20 focus:outline-none focus:ring-2 focus:ring-pp-teal text-center"
            />
            <span className="text-white/40 text-sm">days</span>
          </div>

          <textarea
            placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={2} className={`${inputClass} resize-none`}
          />

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-pp-teal hover:brightness-110 text-pp-navy rounded-xl py-3 font-bold text-sm tracking-wide transition-all disabled:opacity-40 mt-1"
          >
            {saving ? "Saving..." : "Add Plant"}
          </button>
        </form>
      </div>
    </div>
  );
}

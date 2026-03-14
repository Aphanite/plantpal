"use client";

import { useEffect, useState } from "react";
import { getAllPlants, deletePlant } from "@/lib/db";
import type { Plant } from "@/lib/types";
import PlantCard from "@/components/PlantCard";
import AddPlantModal from "@/components/AddPlantModal";
import DiagnoseModal from "@/components/DiagnoseModal";
import NotificationManager from "@/components/NotificationManager";

// Decorative geometric strip shown under the header
function GeometricStrip() {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      <svg viewBox="0 0 800 128" preserveAspectRatio="xMidYMid slice" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Tiles */}
        <rect x="0"   y="0" width="160" height="128" fill="#02349d" />
        <rect x="160" y="0" width="160" height="128" fill="#3ce2d7" />
        <rect x="320" y="0" width="160" height="128" fill="#1eabfc" />
        <rect x="480" y="0" width="160" height="128" fill="#02349d" />
        <rect x="640" y="0" width="160" height="128" fill="#3ce2d7" />
        {/* Geometric shapes */}
        <circle cx="80"  cy="0"   r="90"  fill="#3ce2d7" opacity="0.4" />
        <circle cx="240" cy="128" r="80"  fill="#2c314a" opacity="0.5" />
        <circle cx="400" cy="64"  r="55"  fill="#02349d" opacity="0.6" />
        <circle cx="400" cy="64"  r="25"  fill="#1eabfc" opacity="0.7" />
        <circle cx="560" cy="0"   r="100" fill="#3ce2d7" opacity="0.35" />
        <circle cx="720" cy="128" r="70"  fill="#2c314a" opacity="0.5" />
        <circle cx="640" cy="30"  r="22"  fill="#1eabfc" opacity="0.7" />
      </svg>
      {/* Fade to page background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pp-navy" />
    </div>
  );
}

// "Add plant" tile — lives in the grid alongside plant cards
function AddTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl overflow-hidden relative w-full cursor-pointer group"
      style={{ aspectRatio: "4/5" }}
    >
      <div className="absolute inset-0 bg-pp-navy-mid" />
      {/* Subtle geometric bg */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="0"   r="120" fill="#3ce2d7" opacity="0.08" />
        <circle cx="0"   cy="200" r="100" fill="#1eabfc" opacity="0.08" />
      </svg>
      <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-2xl group-hover:border-pp-teal/40 transition-colors" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-full border-2 border-pp-teal/50 flex items-center justify-center group-hover:border-pp-teal transition-colors">
          <span className="text-pp-teal text-3xl leading-none">+</span>
        </div>
        <p className="text-white/30 text-xs tracking-widest uppercase group-hover:text-white/60 transition-colors">
          Add plant
        </p>
      </div>
    </button>
  );
}

export default function Home() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [diagnosing, setDiagnosing] = useState<Plant | null>(null);

  async function loadPlants() {
    setPlants(await getAllPlants());
    setLoading(false);
  }

  useEffect(() => { loadPlants(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this plant?")) return;
    await deletePlant(id);
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main className="min-h-screen bg-pp-navy">
      {/* Nav */}
      <header className="px-4 pt-5 pb-2 max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pp-teal flex items-center justify-center">
            <span className="text-pp-navy text-base leading-none">🌿</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">PlantPal</span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-pp-teal hover:brightness-110 text-pp-navy rounded-xl px-4 py-2 text-sm font-semibold tracking-wide transition-all"
        >
          + Add
        </button>
      </header>

      {/* Geometric hero strip */}
      <GeometricStrip />

      {/* Grid */}
      <div className="max-w-2xl mx-auto px-4 pb-12 -mt-4">
        {loading ? (
          <div className="text-center text-white/20 py-24 tracking-widest text-sm uppercase">Loading</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {plants.map((plant, i) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                index={i}
                onDiagnose={setDiagnosing}
                onDelete={handleDelete}
                onRefresh={loadPlants}
              />
            ))}
            <AddTile onClick={() => setShowAdd(true)} />
          </div>
        )}
      </div>

      {showAdd && (
        <AddPlantModal onClose={() => setShowAdd(false)} onAdded={loadPlants} />
      )}
      {diagnosing && (
        <DiagnoseModal plant={diagnosing} onClose={() => setDiagnosing(null)} />
      )}

      <NotificationManager />
    </main>
  );
}

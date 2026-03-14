"use client";

import { useEffect, useState } from "react";
import { getAllPlants, deletePlant } from "@/lib/db";
import type { Plant } from "@/lib/types";
import PlantCard from "@/components/PlantCard";
import AddPlantModal from "@/components/AddPlantModal";
import DiagnoseModal from "@/components/DiagnoseModal";
import NotificationManager from "@/components/NotificationManager";

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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-pp-navy sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-xl font-bold text-white">PlantPal</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-pp-teal hover:brightness-110 text-pp-navy rounded-xl px-4 py-2 text-sm font-semibold transition-all"
          >
            + Add Plant
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-pp-navy/40 py-20">Loading...</div>
        ) : plants.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <span className="text-6xl">🌱</span>
            <p className="text-pp-navy/60">No plants yet. Add your first one!</p>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-pp-teal hover:brightness-110 text-pp-navy rounded-xl px-6 py-2.5 font-semibold transition-all"
            >
              Add Plant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onDiagnose={setDiagnosing}
                onDelete={handleDelete}
                onRefresh={loadPlants}
              />
            ))}
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

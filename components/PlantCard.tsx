"use client";

import { useState } from "react";
import type { Plant } from "@/lib/types";
import { isDueForWatering, nextWateringDate, savePlant } from "@/lib/db";

interface Props {
  plant: Plant;
  onDiagnose: (plant: Plant) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function PlantCard({ plant, onDiagnose, onDelete, onRefresh }: Props) {
  const [watering, setWatering] = useState(false);
  const due = isDueForWatering(plant);
  const next = nextWateringDate(plant);

  async function handleWater() {
    setWatering(true);
    await savePlant({ ...plant, lastWatered: new Date().toISOString() });
    onRefresh();
    setWatering(false);
  }

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col ${due ? "border-pp-sky" : "border-pp-teal/30"}`}>
      {plant.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={plant.photo} alt={plant.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-pp-teal-dim flex items-center justify-center text-5xl">🌱</div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-pp-navy">{plant.name}</h3>
          {plant.species && <p className="text-xs text-pp-navy/50">{plant.species}</p>}
        </div>

        <div className={`text-xs rounded-lg px-2 py-1 w-fit font-medium ${
          due
            ? "bg-pp-sky text-white"
            : "bg-pp-teal-dim text-pp-navy"
        }`}>
          {due ? "💧 Needs water!" : `Next: ${next.toLocaleDateString()}`}
        </div>

        {plant.notes && <p className="text-xs text-pp-navy/50 line-clamp-2">{plant.notes}</p>}

        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={handleWater}
            disabled={watering}
            className="flex-1 text-xs bg-pp-sky-dim hover:bg-pp-sky/20 text-pp-deep rounded-lg px-3 py-1.5 font-medium transition-colors disabled:opacity-50"
          >
            {watering ? "..." : "💧 Watered"}
          </button>
          <button
            onClick={() => onDiagnose(plant)}
            className="flex-1 text-xs bg-pp-teal-dim hover:bg-pp-teal/30 text-pp-navy rounded-lg px-3 py-1.5 font-medium transition-colors"
          >
            🔍 Diagnose
          </button>
          <button
            onClick={() => onDelete(plant.id)}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-400 rounded-lg px-3 py-1.5 transition-colors"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

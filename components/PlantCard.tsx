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
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col ${due ? "border-amber-400" : "border-gray-200"}`}>
      {plant.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={plant.photo} alt={plant.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-green-50 flex items-center justify-center text-5xl">🌱</div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-gray-900">{plant.name}</h3>
          {plant.species && <p className="text-xs text-gray-500">{plant.species}</p>}
        </div>

        <div className={`text-xs rounded-lg px-2 py-1 w-fit font-medium ${due ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
          {due ? "💧 Needs water!" : `Next: ${next.toLocaleDateString()}`}
        </div>

        {plant.notes && <p className="text-xs text-gray-500 line-clamp-2">{plant.notes}</p>}

        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={handleWater}
            disabled={watering}
            className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg px-3 py-1.5 font-medium transition-colors disabled:opacity-50"
          >
            {watering ? "..." : "💧 Watered"}
          </button>
          <button
            onClick={() => onDiagnose(plant)}
            className="flex-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-lg px-3 py-1.5 font-medium transition-colors"
          >
            🔍 Diagnose
          </button>
          <button
            onClick={() => onDelete(plant.id)}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-500 rounded-lg px-3 py-1.5 transition-colors"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

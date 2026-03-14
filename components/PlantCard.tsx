"use client";

import { useState } from "react";
import type { Plant } from "@/lib/types";
import { isDueForWatering, nextWateringDate, savePlant } from "@/lib/db";
import PlantGeometric from "./PlantGeometric";

const PALETTES = [
  { bg: "#1eabfc", fg: "#02349d" },  // sky
  { bg: "#3ce2d7", fg: "#2c314a" },  // teal
  { bg: "#02349d", fg: "#3ce2d7" },  // deep
];

const DUE_PALETTE = { bg: "#1eabfc", fg: "#02349d" };

interface Props {
  plant: Plant;
  index: number;
  onDiagnose: (plant: Plant) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function PlantCard({ plant, index, onDiagnose, onDelete, onRefresh }: Props) {
  const [watering, setWatering] = useState(false);
  const due = isDueForWatering(plant);
  const next = nextWateringDate(plant);
  const { bg, fg } = due ? DUE_PALETTE : PALETTES[index % PALETTES.length];

  async function handleWater() {
    setWatering(true);
    await savePlant({ ...plant, lastWatered: new Date().toISOString() });
    onRefresh();
    setWatering(false);
  }

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: "4/5" }}>
      {/* Background — photo or geometric art */}
      {plant.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={plant.photo} alt={plant.name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0">
          <PlantGeometric variant={index} bg={bg} fg={fg} />
        </div>
      )}

      {/* Gradient overlay so text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2c314a] via-[#2c314a]/40 to-transparent" />

      {/* Text + actions anchored to bottom */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 gap-2.5">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-0.5">
            {plant.species ?? "Plant"}
          </p>
          <h3 className="text-white font-bold text-2xl leading-tight">{plant.name}</h3>
        </div>

        <span className={`text-xs rounded-full px-3 py-1 w-fit font-semibold tracking-wide uppercase ${
          due ? "bg-pp-sky text-white" : "bg-white/15 text-white/70"
        }`}>
          {due ? "💧 Water now" : `Next ${next.toLocaleDateString()}`}
        </span>

        <div className="flex gap-2">
          <button
            onClick={handleWater}
            disabled={watering}
            className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-2 font-medium backdrop-blur-sm transition-colors disabled:opacity-50"
          >
            {watering ? "···" : "💧 Watered"}
          </button>
          <button
            onClick={() => onDiagnose(plant)}
            className="flex-1 text-xs bg-pp-teal text-pp-navy rounded-xl px-3 py-2 font-semibold hover:brightness-110 transition-all"
          >
            🔍 Diagnose
          </button>
          <button
            onClick={() => onDelete(plant.id)}
            className="text-xs bg-white/10 hover:bg-red-500/40 text-white/50 hover:text-white rounded-xl px-3 py-2 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

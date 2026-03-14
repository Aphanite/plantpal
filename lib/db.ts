import { openDB, type IDBPDatabase } from "idb";
import type { Plant, Diagnosis } from "./types";

const DB_NAME = "plantpal";
const DB_VERSION = 1;

type PlantPalDB = {
  plants: {
    key: string;
    value: Plant;
    indexes: { "by-name": string };
  };
  diagnoses: {
    key: string;
    value: Diagnosis;
    indexes: { "by-plant": string };
  };
};

let dbPromise: Promise<IDBPDatabase<PlantPalDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PlantPalDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const plantStore = db.createObjectStore("plants", { keyPath: "id" });
        plantStore.createIndex("by-name", "name");

        const diagStore = db.createObjectStore("diagnoses", { keyPath: "id" });
        diagStore.createIndex("by-plant", "plantId");
      },
    });
  }
  return dbPromise;
}

// Plants
export async function getAllPlants(): Promise<Plant[]> {
  const db = await getDB();
  return db.getAll("plants");
}

export async function getPlant(id: string): Promise<Plant | undefined> {
  const db = await getDB();
  return db.get("plants", id);
}

export async function savePlant(plant: Plant): Promise<void> {
  const db = await getDB();
  await db.put("plants", plant);
}

export async function deletePlant(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("plants", id);
}

// Diagnoses
export async function getDiagnosesForPlant(plantId: string): Promise<Diagnosis[]> {
  const db = await getDB();
  return db.getAllFromIndex("diagnoses", "by-plant", plantId);
}

export async function saveDiagnosis(diagnosis: Diagnosis): Promise<void> {
  const db = await getDB();
  await db.put("diagnoses", diagnosis);
}

// Watering helpers
export function nextWateringDate(plant: Plant): Date {
  const last = new Date(plant.lastWatered);
  last.setDate(last.getDate() + plant.wateringIntervalDays);
  return last;
}

export function isDueForWatering(plant: Plant): boolean {
  return nextWateringDate(plant) <= new Date();
}

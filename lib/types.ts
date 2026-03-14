export interface Plant {
  id: string;
  name: string;
  species?: string;
  photo?: string; // base64 data URL
  wateringIntervalDays: number;
  lastWatered: string; // ISO date string
  notes?: string;
  createdAt: string;
}

export interface Diagnosis {
  id: string;
  plantId: string;
  photo: string; // base64 data URL
  result: string;
  createdAt: string;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  subscription: PushSubscriptionJSON;
}

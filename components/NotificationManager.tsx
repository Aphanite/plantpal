"use client";

import { useEffect, useState } from "react";
import { subscribeToPush, sendSubscriptionToServer } from "@/lib/push";

export default function NotificationManager() {
  const [state, setState] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (!("Notification" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "granted") setState("granted");
    else if (Notification.permission === "denied") setState("denied");
  }, []);

  async function handleEnable() {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setState("denied");
      return;
    }
    setState("granted");
    const sub = await subscribeToPush();
    if (sub) await sendSubscriptionToServer(sub);
  }

  if (state === "unsupported" || state === "granted") return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 z-40 max-w-sm w-[calc(100%-2rem)]">
      <span className="text-2xl">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">Enable watering reminders?</p>
        <p className="text-xs text-gray-500">Get notified when plants need water</p>
      </div>
      {state === "denied" ? (
        <span className="text-xs text-gray-400">Blocked</span>
      ) : (
        <button
          onClick={handleEnable}
          className="text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-1.5 font-medium transition-colors whitespace-nowrap"
        >
          Enable
        </button>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { subscribeToPush, sendSubscriptionToServer } from "@/lib/push";

export default function NotificationManager() {
  const [state, setState] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (!("Notification" in window)) { setState("unsupported"); return; }
    if (Notification.permission === "granted") setState("granted");
    else if (Notification.permission === "denied") setState("denied");
  }, []);

  async function handleEnable() {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { setState("denied"); return; }
    setState("granted");
    const sub = await subscribeToPush();
    if (sub) await sendSubscriptionToServer(sub);
  }

  if (state === "unsupported" || state === "granted") return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-2rem)]">
      <div className="bg-pp-navy-mid border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-xl">
        <div className="w-9 h-9 rounded-xl bg-pp-deep flex items-center justify-center shrink-0">
          <span className="text-lg">🔔</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Watering reminders</p>
          <p className="text-xs text-white/40">Never forget to water your plants</p>
        </div>
        {state === "denied" ? (
          <span className="text-xs text-white/25">Blocked</span>
        ) : (
          <button
            onClick={handleEnable}
            className="text-xs bg-pp-teal hover:brightness-110 text-pp-navy rounded-lg px-3 py-2 font-bold tracking-wide transition-all whitespace-nowrap"
          >
            Enable
          </button>
        )}
      </div>
    </div>
  );
}

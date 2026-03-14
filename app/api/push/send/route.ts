import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { readSubscriptions, writeSubscriptions } from "../_store";

function initVapid() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  // Only real VAPID keys are exactly 87 base64url chars
  if (VAPID_PUBLIC_KEY.length < 80) return false;
  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT ?? "mailto:admin@plantpal.app",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!initVapid()) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }
  try {
    const { title, body } = await req.json() as { title: string; body: string };
    const subs = await readSubscriptions();

    if (subs.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const payload = JSON.stringify({ title, body });
    const results = await Promise.allSettled(
      subs.map((sub) => webpush.sendNotification(sub as webpush.PushSubscription, payload))
    );

    // Remove expired subscriptions (410 Gone)
    const valid = subs.filter((_, i) => {
      const r = results[i];
      return !(r.status === "rejected" && (r.reason as { statusCode?: number })?.statusCode === 410);
    });
    await writeSubscriptions(valid);

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ sent });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { readSubscriptions, writeSubscriptions } from "../_store";

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json() as PushSubscriptionJSON;
    if (!sub.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    const subs = await readSubscriptions();
    // Upsert by endpoint
    const filtered = subs.filter((s) => s.endpoint !== sub.endpoint);
    filtered.push(sub);
    await writeSubscriptions(filtered);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}

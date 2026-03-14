/**
 * In-memory subscription store for development.
 * Replace with a real DB (e.g., Postgres, Redis) in production.
 */

const subscriptions: PushSubscriptionJSON[] = [];

export async function readSubscriptions(): Promise<PushSubscriptionJSON[]> {
  return [...subscriptions];
}

export async function writeSubscriptions(subs: PushSubscriptionJSON[]): Promise<void> {
  subscriptions.length = 0;
  subscriptions.push(...subs);
}

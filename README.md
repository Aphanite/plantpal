# PlantPal

A plant care PWA built with Next.js 16, Claude AI photo diagnosis, IndexedDB local storage, and Web Push notifications.

**Live repo:** https://github.com/Aphanite/plantpal

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (CSS-based config via `@theme`) |
| AI | Anthropic Claude Opus 4.6 — vision + streaming |
| Local storage | IndexedDB via `idb` |
| Push notifications | `web-push` + VAPID |
| Fonts | Geist (via `next/font/google`) |

---

## Design

Palette from [huemint.com/brand-intersection](https://huemint.com/brand-intersection/#palette=2c314a-3ce2d7-1eabfc-2349d):

| Token | Hex | Role |
|-------|-----|------|
| `--color-pp-navy` | `#2c314a` | Background, text, overlays |
| `--color-pp-teal` | `#3ce2d7` | Primary actions, CTA buttons |
| `--color-pp-sky` | `#1eabfc` | "Needs water" badge, secondary |
| `--color-pp-deep` | `#02349d` | Card variant, deep accent (`2349d` from URL, padded to 6 chars) |

**Visual style:** Dark throughout (no white surfaces). Plant cards are full-bleed colored tiles with SVG geometric circle compositions as placeholders (inspired by the Bauhaus/constructivist aesthetic of the palette tool). Modals are dark navy. Typography uses uppercase tracking-wide labels + bold oversized headings.

---

## Project structure

```
app/
  page.tsx                  Main UI — plant grid, add/diagnose/delete flows
  layout.tsx                PWA metadata, service worker registrar
  globals.css               Tailwind v4 @theme tokens + dark body bg
  api/
    diagnose/route.ts       POST — streams Claude Opus 4.6 plant diagnosis
    push/
      _store.ts             In-memory push subscription store (⚠ replace for prod)
      subscribe/route.ts    POST — save a PushSubscription
      send/route.ts         POST — broadcast a push notification via web-push

components/
  PlantCard.tsx             Full-bleed colored tile card with gradient overlay
  PlantGeometric.tsx        4 SVG circle compositions used as photo placeholders
  AddPlantModal.tsx         Dark modal — add plant with optional photo
  DiagnoseModal.tsx         Dark modal — upload photo, stream AI diagnosis
  NotificationManager.tsx   Push permission prompt banner (bottom of screen)
  ServiceWorkerRegistrar.tsx Registers /public/sw.js on mount

lib/
  types.ts                  Plant, Diagnosis, PushSubscriptionRecord types
  db.ts                     IndexedDB CRUD (plants + diagnoses stores) via idb
  push.ts                   Client-side: subscribe to push, send sub to server

public/
  manifest.json             PWA manifest (standalone, navy theme)
  sw.js                     Service worker: cache-first static, push handler
```

---

## Setup

### 1. Environment variables

`.env.local` is in the repo root with placeholder values. Fill in real ones:

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Generate with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=<87-char base64url string>
VAPID_PRIVATE_KEY=<43-char base64url string>
VAPID_SUBJECT=mailto:you@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same as VAPID_PUBLIC_KEY>
```

### 2. PWA icons

Add two PNG icons (export from Figma, use [realfavicongenerator.net](https://realfavicongenerator.net), etc.):

```
public/icon-192.png   192×192px
public/icon-512.png   512×512px
```

### 3. Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

---

## How each feature works

### Plant storage (IndexedDB)

`lib/db.ts` opens an `idb` database (`plantpal`, version 1) with two object stores:
- `plants` — keyed by `id` (UUID), indexed by `name`
- `diagnoses` — keyed by `id`, indexed by `plantId`

All reads/writes happen client-side. No server DB. Main exports: `getAllPlants`, `savePlant`, `deletePlant`, `saveDiagnosis`, `getDiagnosesForPlant`, `isDueForWatering`, `nextWateringDate`.

### AI diagnosis (`/api/diagnose`)

Accepts `{ photo: string (base64 data URL), plantName?: string }`. Strips the data URL prefix, sends raw base64 to Claude Opus 4.6 with a vision prompt asking for health assessment + actionable care tips. Streams the response back as `text/plain` chunked transfer. The client reads it with a `ReadableStream` reader and updates React state incrementally so the text appears as it's generated.

### Web Push

1. Client calls `subscribeToPush()` (`lib/push.ts`) → `pushManager.subscribe()` with VAPID public key
2. Subscription JSON is POSTed to `/api/push/subscribe` → stored in `_store.ts`
3. To send a reminder: POST `{ title, body }` to `/api/push/send` → `web-push.sendNotification()` to all stored subscriptions. Expired (410) subscriptions are pruned automatically.
4. `public/sw.js` handles the `push` event → `showNotification()`, and `notificationclick` to focus or open the app.

> ⚠ `app/api/push/_store.ts` is an **in-memory array** — subscriptions are lost on server restart. Replace with a real DB for production.

### PWA / Service Worker

`public/sw.js` is a hand-written service worker (no `next-pwa` dependency):
- **Install**: pre-caches `/` and `/manifest.json`
- **Fetch**: network-first for all GET requests, falls back to cache. API routes are skipped entirely.
- **Push**: shows a notification with title/body from the push payload JSON
- **Notificationclick**: focuses an existing app window or opens `/`

---

## What's left / known gaps

- [ ] **Push subscription persistence** — replace `_store.ts` in-memory store with a real DB (Postgres, Redis, Upstash, etc.)
- [ ] **Scheduled reminders** — push is only sent manually via `/api/push/send`. Add a cron job (Vercel cron, GitHub Actions, etc.) that calls this endpoint daily, checks which plants are due via the DB, and sends targeted notifications
- [ ] **PWA icons** — `icon-192.png` and `icon-512.png` are missing from `public/`; add before deploying
- [ ] **Diagnosis history** — `getDiagnosesForPlant()` is implemented in `db.ts` but there's no UI to browse past diagnoses per plant
- [ ] **Edit plant** — no way to edit name/species/watering interval after creation; would need an edit modal reusing the AddPlant form
- [ ] **Offline fallback page** — SW serves stale cache on network failure but there's no dedicated offline UI
- [ ] **Auth / multi-user** — app is fully local and single-user; multi-user would need auth + server-side plant storage

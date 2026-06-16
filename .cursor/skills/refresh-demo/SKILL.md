---
name: refresh-demo
description: Reset the Bloomberg demo app to its backend-only baseline between demo runs. Use when the user asks to refresh, reset, or clean up the demo so they can rebuild the dashboard from scratch.
disable-model-invocation: true
---

# Refresh Demo

Resets `demo/` to "backend only, no dashboard" so the dashboard can be built
live again from a clean slate.

## Steps

1. Stop any running dev server (free port 3000).
2. Run the refresh script:

```bash
cd demo
./refresh-demo.sh            # full reset (removes UI, clears data, npm install)
./refresh-demo.sh --no-install   # skip npm install (faster)
```

3. Start fresh:

```bash
npm run dev
```

## What it resets

- Removes `src/components/`, `src/hooks/`, `src/lib/client-types.ts`, `src/lib/format.ts`.
- Restores baseline `page.tsx`, `globals.css`, `layout.tsx` from `demo/.demo-baseline/`.
- Clears `demo/data/` (SQLite) and `demo/.next/`.

The backend (`src/app/api/**`, `src/lib/server/**`, `src/lib/mock-bbg/**`) is never touched.

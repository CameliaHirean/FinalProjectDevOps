## Medical App

This app now uses PostgreSQL for medical records and keeps the dashboard focused on four areas:

- Your daily vitals
- Workout
- History

## Setup

Create a `.env.local` file in the project root and add your PostgreSQL connection string. If you're using Supabase, copy the connection string from your project dashboard and paste it here.

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

For Supabase, you can find this under `Project Settings > Database > Connection string`.

Then install dependencies and start the app:

```bash
npm install
npm run dev
```

If your laptop runs out of memory during development, use the lower-memory mode:

```bash
npm run dev:lite
```

Open http://localhost:3000 in your browser.

## Notes

- The API route at `app/api/records/route.ts` creates the `medical_records` table automatically.
- If `DATABASE_URL` is not set, the UI falls back to demo data and local in-memory saves.
- Missing `DATABASE_URL` no longer crashes the API; reads return an empty array and writes return `503`, allowing the frontend fallback behavior.

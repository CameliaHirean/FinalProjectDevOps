## Medical App

This project is a slim Next.js app split into two clear parts:

- `app/frontend/` contains the dashboard UI
- `app/backend/` contains PostgreSQL logic

The dashboard keeps only four areas:

- Summary
- Your daily vitals
- Workout
- History

## Project Layout

The important app files are:

- `app/page.tsx` - thin Next.js entrypoint for the dashboard
- `app/layout.tsx` - shared app shell
- `app/api/records/route.ts` - thin API route that forwards to the backend folder
- `app/frontend/dashboard.tsx` - main dashboard UI
- `app/backend/records.js` - PostgreSQL API logic
- `app/backend/medical-records.js` - record payload helper
- `app/backend/medical-records.test.mjs` - unit tests for the helper

Root-level files are now limited to the app source, config, and docs. Empty folders and unused sample assets were removed.

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

## Scripts

- `npm run dev` starts the app with the default Next.js dev server
- `npm run dev:lite` uses the lower-memory Webpack dev mode
- `npm run lint` runs ESLint
- `npm run test:frontend` runs frontend unit tests
- `npm run test:backend` runs backend unit tests
- `npm test` runs all unit tests
- `npm run build` creates a production build (webpack mode)
- `npm run db:check` verifies PostgreSQL connectivity and table availability (requires `DATABASE_URL`)
- `npm run devops:proof` runs lint + unit tests + production build

## DevOps Proof Scope

Use the commands below to demonstrate frontend, backend, and database operations:

1. Frontend proof

```bash
npm run dev:lite
```

Open `http://localhost:3000` and verify the dashboard tabs render (`Summary`, `Your daily vitals`, `Workout`, `History`).

2. Backend proof

```bash
npm test
```

This validates backend helper logic in `app/backend/medical-records.test.mjs`.

3. Database proof

```bash
npm run db:check
```

This checks PostgreSQL connectivity and confirms the `medical_records` table is available.

4. CI proof

The root `Jenkinsfile` runs:

- Lint
- Backend Tests
- Frontend Tests
- Build
- Database Verification (only when `DATABASE_URL` is set in Jenkins)

## Branch and PR Workflow

Use this workflow for every change:

1. Create and switch to a feature branch

```bash
git checkout -b feature/short-description
```

2. Commit your changes on that branch

```bash
git add .
git commit -m "feat: short description"
```

3. Push branch and open a Pull Request to `main` or `release`

```bash
git push -u origin feature/short-description
```

4. Jenkins validates the PR automatically

- Non-PR builds are blocked by policy.
- PRs targeting branches other than `main` or `release` are rejected by policy.
- Merge only after Jenkins status is green.
# Expense Tracker

A cross-platform expense tracker built with **Expo (React Native + React Native
Web)** and **Supabase**. One codebase runs on **web, iOS, and Android**.

Track personal & business spending, scan receipts with OCR auto-fill, manage
custom categories, set monthly budgets with alerts, and view reports — all with
a clean, bright, eco-themed (teal/green) UI. Currency defaults to INR (₹).

## Features

- 🔐 **Google sign-in** via Supabase Auth (protected routes; unauthenticated
  users only see the login screen). Sessions persist and tokens auto-refresh.
- 💸 **Expense CRUD** — amount, date, category, Personal/Business toggle,
  merchant, payment method, notes, optional receipt image.
- 🧾 **Receipt scanning / OCR** — capture or pick an image, upload to private
  Supabase Storage, and auto-fill amount/date/merchant via a Supabase Edge
  Function (Google Cloud Vision, with a built-in mock fallback).
- 🏷️ **Categories** — seeded defaults plus add/edit/delete custom categories
  with icon + color.
- 📊 **Budgets & alerts** — monthly limits per category or per type, dashboard
  progress bars, and in-app banners at 80% and 100%.
- 📈 **Reports** — spend-by-category donut, monthly trend bars, and a
  Personal vs Business split, with This / Last / Custom month filters.

## Tech stack

Expo SDK 56 · TypeScript · expo-router · React Native Web · Supabase
(Postgres + Auth + Storage + Edge Functions) · React Query · Zustand ·
react-native-gifted-charts · expo-image-picker.

## Project structure

```
app/                     expo-router routes (login, tabs, categories, budgets)
  (tabs)/                Dashboard · Expenses · Add (FAB) · Reports · Settings
src/
  api/                   React Query hooks (expenses, categories, budgets, …)
  components/            Reusable UI + charts/
  lib/                   supabase client, query client, env
  providers/             AuthProvider (Google OAuth)
  store/                 Zustand UI store
  theme/ utils/ types/   tokens, helpers, DB types
supabase/
  migrations/0001_init.sql        schema + RLS + storage + seed trigger
  functions/parse-receipt/        OCR edge function
```

## Setup

### 1. Install

```bash
npm install
cp .env.example .env
```

### 2. Create the Supabase project & schema

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the migration — either paste `supabase/migrations/0001_init.sql` into
   the dashboard **SQL editor** and run it, or use the CLI:
   ```bash
   supabase link --project-ref YOUR-PROJECT-REF
   supabase db push
   ```
   This creates the tables, enums, Row Level Security policies, the
   new-user trigger (profile + default categories), and the private
   `receipts` storage bucket.

### 3. Enable Google auth

1. Supabase dashboard → **Authentication → Providers → Google** → enable, and
   paste your Google OAuth **Client ID / Secret**
   (create them in the [Google Cloud Console](https://console.cloud.google.com)
   → *APIs & Services → Credentials → OAuth client ID → Web application*).
2. In the Google OAuth client, add the Supabase callback as an authorized
   redirect URI:
   `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
3. Supabase dashboard → **Authentication → URL Configuration** → add your app
   redirect URLs:
   - Web (dev): `http://localhost:8081`
   - Native (Expo): `expensetracker://` (the app's `scheme`)

### 4. Configure env

Fill `.env` with values from **Project Settings → API**:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 5. Deploy the OCR edge function

```bash
supabase functions deploy parse-receipt
# Optional — enables real OCR (otherwise a mock parser is used):
supabase secrets set GOOGLE_VISION_API_KEY=your-google-cloud-vision-api-key
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into the function
runtime automatically by Supabase.

## Run

```bash
npm run web        # browser (http://localhost:8081)
npm run start      # then press i / a, or scan the QR with Expo Go
npm run ios        # iOS simulator (macOS)
npm run android    # Android emulator
```

## Notes

- The Supabase **anon key** is meant to be public; every table is protected by
  Row Level Security so users can only read/write their own rows. Receipt files
  live in per-user folders (`receipts/{user_id}/…`) enforced by storage policies.
- OCR results are best-effort and always pre-fill the form for the user to
  confirm or edit before saving.
- Currency is stored per expense (`currency` column) so additional currencies
  (e.g. AED) can be supported later without a migration.

## Useful scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
```

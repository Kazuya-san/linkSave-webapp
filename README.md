# LinkSave

LinkSave is a private article library built with Next.js, Clerk, Supabase, and Gemini. It turns pasted article text into structured briefs with summaries, key points, tags, named entities, and stored source content for later review.

## What it does

- Authenticated article dashboard with a polished App Router UI
- Manual article capture flow that summarizes and stores long-form content
- Search and filtering across titles, summaries, tags, entities, and key points
- Detail pages for each saved brief
- Clerk-authenticated Supabase access with row-level security support

## Environment

Copy `.env.example` to `.env` and provide:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional)

You also need a Clerk JWT template named `supabase` so the app can query Supabase with the authenticated user context.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run build
```

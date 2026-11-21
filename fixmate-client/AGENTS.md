# FixMate Client

Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui + Sonner frontend for the FixMate backend (see `..\Assaingment-9-server`).

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build; `npm start` to serve
- `npm run lint` — ESLint via `next lint`

## Structure

- `app/` — App Router pages/layouts (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`)
- `components/` — shadcn/ui components (`components/ui/*`) and app components
- `lib/` — helpers (`lib/utils.ts` with `cn`, `lib/api.ts` fetch wrapper, `lib/imgbb.ts`, `lib/stripe.ts`)

## Environment

`.env.local` (gitignored) with:

- `NEXT_PUBLIC_API_URL` — backend API base URL (default `http://localhost:5000`)
- `NEXT_PUBLIC_IMGBB_API_KEY` — ImgBB API key for image uploads
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key for checkout

## Notes

- Backend runs separately from `D:\Project\Assaingment-9-server` (Express + MongoDB).
- shadcn/ui components live in `components/ui/` and rely on theme tokens defined in `app/globals.css`.
- Sonner `<Toaster />` is mounted in `app/layout.tsx`.

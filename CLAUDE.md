# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Citizen Portal (aka "Edge Portal") — a Next.js web app for managing pop-up city events. Users apply to temporary cities, purchase passes/housing, manage attendees, and pay via Stripe or crypto. The backend is a separate repo ([EdgeOS_API](https://github.com/p2p-lanes/EdgeOS_API)).

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm install --legacy-peer-deps` — install dependencies (legacy peer deps required, see vercel.json)

## Tech Stack

- **Next.js 15** (App Router) with **React 19**, TypeScript, Tailwind CSS
- **shadcn/ui** (new-york style, Radix primitives, Lucide icons) — components in `src/components/ui/`
- **Axios** for API calls via `src/api/index.js` wrapper
- **@react-pdf/renderer** for PDF generation
- **Worldcoin MiniKit** for World App sign-in
- **framer-motion** for animations, **sonner** for toasts
- Deployed on **Vercel**

## Architecture

### Path alias
`@/*` maps to `./src/*` (configured in tsconfig.json).

### Routing (`src/app/`)
- `/auth` — login page (email + World ID)
- `/portal` — authenticated layout with sidebar, wraps all portal pages in context providers (`<Providers>`) and `<Authentication>` guard
  - `/portal/[popupSlug]/application` — multi-step application form
  - `/portal/[popupSlug]/passes` — pass selection and purchase
  - `/portal/[popupSlug]/attendees` — attendee management
  - `/portal/[popupSlug]/groups` — group pass management
  - `/portal/[popupSlug]/coupons` — coupon/discount codes
  - `/portal/profile` — user profile (no header bar)
  - `/portal/poaps` — POAPs
- `/checkout` — standalone checkout flow (separate from portal layout)
- `/[popup]/invite/[group]` — group invite pages
- `/online-checkin` — event check-in
- `/api/upload` and `/api/socialLayer` — Next.js API routes

### State Management (React Context)
All state is in context providers under `src/providers/`:
- `cityProvider` — selected popup city
- `applicationProvider` — current application data
- `passesProvider` — pass selection state
- `productsProvider` — available products
- `checkoutProvider` — checkout flow state
- `groupsProvider` — group pass data
- `totalProvider` — cart total calculations
- `poapsProvider` — POAPs

The portal layout (`src/app/portal/layout.tsx`) wraps children in `<Providers>` which composes these contexts. Data is fetched via hooks in `src/hooks/` (e.g., `useGetPopups`, `useGetApplications`).

### API Layer
`src/api/index.js` exports an `api` object with `get`, `post`, `put`, `patch`, `delete` methods wrapping Axios. Base URL comes from `NEXT_PUBLIC_API_URL` env var.

### Strategy Pattern (`src/strategies/`)
Pricing and purchase logic uses strategy classes:
- `TotalStrategy.ts` — cart total calculation with discount handling
- `PriceStrategy.ts` — price computation per product
- `ProductStrategies.ts` — product-specific logic
- `PurchaseStrategy.ts` — purchase flow logic

### Key Directories
- `src/components/` — shared components (Sidebar, Card, checkout, profile, UI primitives)
- `src/hooks/` — data-fetching and utility hooks
- `src/types/` — TypeScript interfaces (Application, Attendee, Products, Popup, etc.)
- `src/helpers/` — utility functions (dates, filters, validation, variable pricing, file upload)
- `src/constants/` — app config and form definitions

## Environment Variables

See `.env.example`. Key vars:
- `NEXT_PUBLIC_DEVELOP` — enables dev mode
- `NEXT_PUBLIC_API_URL` — backend API base URL (set to `http://localhost:8000` for local backend)
- `NEXT_PUBLIC_X_API_KEY` — API key
- `NEXT_PUBLIC_ACCESS_KEY` / `NEXT_PUBLIC_SECRET_KEY` — AWS credentials for file uploads

## ESLint Config

Extends `next/core-web-vitals` and `next/typescript`. `no-explicit-any` is warn-only, `no-unused-vars` is off.

## Domain Concepts

- **Popup** — a temporary pop-up city event
- **Application** — a user's application to a popup (has approval flow with voting: strong yes/no, 2-of-n)
- **Attendee** — a person attached to an application
- **Products/Passes** — purchasable items (passes, housing)
- **Discount codes** — percentage-based coupon codes managed via NocoDB backoffice
- **Group passes** — passes purchased for multiple attendees in an organization

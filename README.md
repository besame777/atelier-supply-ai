# Atelier Supply AI Platform

Standalone web application for the Atelier Supply AI platform — a premium bilingual (RU/EN) marketing website + AI procurement assistant MVP. Fully independent from the existing Atelier Supply website; intended for separate deployment at **app.atelier-supply.ru**.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Bilingual RU/EN routing (`/ru/...`, `/en/...`), Russian by default
- Fonts: Inter (UI) + Playfair Display (editorial headings)
- AI **image** generation via server-side route handlers, with a provider abstraction (OpenAI Images, or a mock fallback). AI **text/reports** are still local mock functions. Forms only switch UI state. Supabase will be added later.

> **Product rule:** every price/calculation in the app is a **preliminary estimate** ("предварительный расчёт") and every generated image is a **preliminary visualization**. The final design and quote are always prepared by an Atelier Supply manager.

## AI image generation

The empty-room flow generates a room visualization through server-side API routes. The OpenAI key is read only on the server and never sent to the client.

**Two generation modes** (the mode is detected server-side):

- **Redesign from room photo** — a photo is uploaded → `images.edit` restyles *that* room while preserving its geometry, windows, doors and camera angle.
- **Generate from parameters** — no photo → `images.generate` creates a new interior concept from room type, dimensions, style, palette and budget.

**Run in mock mode (default — no key needed):**

```bash
cp .env.example .env.local   # AI_IMAGE_PROVIDER stays "mock"
pnpm dev
```

The mock provider returns a curated local image that varies by room type, style, palette and regeneration variant.

**Run with real OpenAI image generation:**

```bash
# in .env.local
OPENAI_API_KEY=sk-...
AI_IMAGE_PROVIDER=openai
OPENAI_IMAGE_MODEL=gpt-image-1   # or the image model your account has access to
OPENAI_IMAGE_QUALITY=medium
OPENAI_IMAGE_SIZE=1536x1024
```

If `AI_IMAGE_PROVIDER=openai` but the key is missing, or if a real call fails, the request transparently falls back to the mock provider and the UI shows a "demo" notice. Detailed errors are logged server-side only.

**Where the code lives:**

| Path | Role |
| --- | --- |
| `src/lib/ai/providers/types.ts` | Provider interface + input/output types |
| `src/lib/ai/providers/index.ts` | Provider selection (`getImageProvider`) |
| `src/lib/ai/providers/openai-image-provider.ts` | OpenAI Images (generate + edit), prompt building |
| `src/lib/ai/providers/mock-provider.ts` | Deterministic local fallback |
| `src/lib/ai/providers/narrative.ts` | Shared localized summary/assumptions |
| `src/lib/ai/design-service.ts` | Request parsing, validation, provider orchestration |
| `src/app/api/ai/design/generate/route.ts` | `POST` — first generation |
| `src/app/api/ai/design/regenerate/route.ts` | `POST` — another variant |

**Env variables:** see [`.env.example`](.env.example) — `OPENAI_API_KEY`, `AI_IMAGE_PROVIDER`, `AI_TEXT_PROVIDER`, `OPENAI_IMAGE_MODEL`, `OPENAI_IMAGE_QUALITY`, `OPENAI_IMAGE_SIZE`.

## Getting Started / Запуск

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 — you will be redirected to `/ru` (or `/en` based on browser language).

Откройте http://localhost:3000 — произойдёт перенаправление на `/ru` (или `/en` в зависимости от языка браузера).

### Commands

```bash
pnpm dev        # development server
pnpm build      # production build (includes type checking)
pnpm start      # serve the production build
pnpm lint       # ESLint
pnpm typecheck  # TypeScript check only
```

(npm equivalents work too: `npm install`, `npm run dev`, …)

## Routes

| Route | Description |
| --- | --- |
| `/[locale]` | Home: hero, two AI scenarios, why China, how it works, featured projects, homeowners/designers, FAQ, contact CTA |
| `/[locale]/ai` | AI Assistant: two flows (design project / empty room), step wizard, simulated analysis, preliminary report, lead form |
| `/[locale]/projects` | Premium project grid (6 placeholder projects) |
| `/[locale]/projects/[slug]` | Project detail template |
| `/[locale]/services` | 7 services |
| `/[locale]/process` | 8-step process timeline |
| `/[locale]/about` | About page with principles and stats |
| `/[locale]/contacts` | Contact form UI + contact channels |
| `/[locale]/dashboard` | Placeholder client dashboard (mock data) |
| `/[locale]/admin` | Placeholder admin panel (mock data) |

`locale` is `ru` (default) or `en`. The middleware redirects bare paths to the detected locale; the header language switcher preserves the current page.

## Project Structure

```
src/
  app/
    globals.css              # Tailwind + premium palette tokens
    [locale]/
      layout.tsx             # Locale layout: fonts, Header, Footer, metadata
      page.tsx               # Home
      ai/ projects/ projects/[slug]/ services/ process/
      about/ contacts/ dashboard/ admin/
  components/
    layout/                  # Header, Footer, LanguageSwitcher
    ui/                      # SectionHeader, CTAButton, FAQ, StatusChip
    cards/                   # ScenarioCard, ProjectCard, ServiceCard, ProcessStep
    ai/                      # AIAssistant (wizard), WizardShell, ProgressSteps,
                             # UploadBox, ProjectDetailsForm, RoomDetailsForm,
                             # AIReportPreview, LeadForm
    hero.tsx contact-form.tsx dashboard-shell.tsx admin-shell.tsx
  i18n/
    config.ts                # locales, defaultLocale, helpers
    get-dictionary.ts        # dictionary loader + Dictionary type
    dictionaries/ru.json     # all RU user-facing text
    dictionaries/en.json     # all EN user-facing text
  app/api/ai/design/
    generate/route.ts        # POST: first room generation
    regenerate/route.ts      # POST: another variant
  lib/
    types.ts                 # Project, AIReport, generation + wizard types
    data/projects.ts         # placeholder project data (localized)
    data/palettes.ts         # curated color palettes (swatch HEX)
    ai/reports.ts            # local mock report generation (text — no real AI yet)
    ai/design-service.ts     # request parsing + provider orchestration (server)
    ai/providers/            # image provider abstraction (openai | mock)
  middleware.ts              # locale detection + redirect
```

## Adding translations

Add keys to **both** `src/i18n/dictionaries/ru.json` and `en.json` (shapes must match), then read them via `getDictionary(locale)` in server components and pass slices down as props.

## What's intentionally NOT here yet

- Supabase / database / auth
- Real AI **text/report** API (`AI_TEXT_PROVIDER=mock`; replace `src/lib/ai/reports.ts`, keep the `AIReport` contract)
- Persisted uploads (the uploaded photo is sent to the image API for redesign but not stored)
- Form submission backends (lead and contact forms switch UI state only)

## Deployment note

Self-contained, no dependency on the existing Atelier Supply website. Deploy separately (e.g. to `app.atelier-supply.ru`) via `pnpm build && pnpm start`, Docker, or a platform of your choice.

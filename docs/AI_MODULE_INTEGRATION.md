# AI Assistant — Module Integration Guide

How to transfer the **AI Interior Assistant** from this standalone sandbox into
the existing live Atelier Supply website cleanly, without breaking anything.

> **Why this exists:** this project is an intentionally separate sandbox so we
> never risk the live site. The AI Assistant was built as a self-contained
> module so it can later be lifted into the main website. This document is the
> contract for that move.

---

## 1. What the AI module does

A bilingual (RU/EN) wizard that turns a room into a **preliminary** interior
concept and procurement estimate:

- **Empty room → AI room concept.** Two modes, detected automatically:
  - **Redesign from photo** — user uploads a room photo → the same room is
    restyled (server uses an image *edit* call, preserving geometry).
  - **Generate from parameters** — no photo → a new concept is generated from
    room type, dimensions, style, palette, budget, constraints.
- **Design project → procurement analysis** — a lighter flow that shows a
  procurement-analysis preview + a text estimate (no room generation).
- **Style + palette selectors**, a **regenerate / "another option"** button, a
  text report (rooms, furniture, lighting, decor, sourcing, assumptions, next
  steps), and a **final lead step (placeholder)**.

**Wording rules baked into the copy:** every image is a *preliminary
visualization* and every number is a *preliminary estimate*; the final design
and quote are always *reviewed by an Atelier Supply manager*. Keep these.

**Image generation** runs only on the server through a provider abstraction:
OpenAI Images when configured, otherwise a deterministic **mock** fallback. The
provider name is never shown in the UI.

---

## 2. Required files & folders

### Core AI module (move all of these)

| Path | Role |
| --- | --- |
| `src/components/ai/*` | All wizard UI (see breakdown below) |
| `src/lib/ai/*` | Generation service, providers, text reports, preview helper |
| `src/app/api/ai/design/generate/route.ts` | `POST` — first generation |
| `src/app/api/ai/design/regenerate/route.ts` | `POST` — another variant |
| `src/lib/data/palettes.ts` | Curated color palettes (swatch HEX + keys) |
| `src/lib/types.ts` | Shared types — **see note**, only the AI-related types are needed |

`src/components/ai/` contents:

- `ai-assistant.tsx` — wizard orchestrator (state machine, fetch calls). **Entry point.**
- `ai-room-concept.tsx` — the generated room-concept result card.
- `ai-report-preview.tsx` — text report + which preview to show.
- `ai-design-preview.tsx` — procurement-analysis preview (design-project flow).
- `room-details-form.tsx`, `project-details-form.tsx` — input forms.
- `upload-box.tsx` — photo/file picker (client-only; returns `File[]`).
- `lead-form.tsx` — **placeholder** final contact step (see §6).
- `wizard-shell.tsx`, `progress-steps.tsx`, `field.tsx` — internal UI primitives.

`src/lib/ai/` contents:

- `design-service.ts` — server: request parsing, validation, provider orchestration + mock fallback. Used by both API routes.
- `providers/types.ts` — `ImageProvider` interface + input/output types.
- `providers/index.ts` — `getImageProvider()` / `isOpenAIImageEnabled()`.
- `providers/openai-image-provider.ts` — OpenAI Images (generate + edit) + prompt builder.
- `providers/mock-provider.ts` — deterministic local fallback.
- `providers/narrative.ts` — localized summary + assumptions (provider-agnostic).
- `reports.ts` — **text** report generator (currently mock; `AI_TEXT_PROVIDER=mock`).
- `design-preview.ts` — static procurement-analysis preview image path.

### Shared dependencies (already exist on most sites — reuse, don't duplicate)

- `src/i18n/config.ts`, `src/i18n/get-dictionary.ts` — locale helpers + `Dictionary` type. The module reads dictionary slices; map these to the main site's i18n (see §7 TODOs).
- `src/lib/images.ts` — only the `aiProject` / `aiRoom` entries are used (scenario card thumbnails). Can be inlined if the main site has no image registry.
- `src/components/cards/scenario-card.tsx` — reused on the AI scenario screen (also used by marketing). Copy or re-point.
- `src/app/globals.css` — design tokens (`--color-accent`, `--bronze`, `--beige`, `--charcoal`, `--surface-soft`, `--border`, `--on-dark`, fonts `--font-display`). The module's Tailwind classes assume these exist.

### i18n keys

The whole AI UI reads from the `ai` namespace in
`src/i18n/dictionaries/{ru,en}.json`, plus two `common` keys:

- `ai.*` — `intro`, `scenarios`, `wizard`, `upload`, `projectForm`, `roomForm`
  (incl. `styles`, `palettes`), `analyzing`, `report`, `designPreview`,
  `roomConcept`, `generation`, `lead`.
- `common.preliminaryBadge`, `common.preliminaryNote` — passed into the report.

Keep RU and EN shapes identical (the `Dictionary` type is inferred from `ru.json`).

### Image assets (`public/images/`)

Used as the mock-fallback interiors **and** scenario thumbnails:

```
hero-main.png                    project-minimalist-kitchen.png
about-image.png                  project-boutique-hotel-room.png
services-image.png               project-office-lounge.png
project-modern-apartment.png     project-luxury-villa.png
```

When real OpenAI generation is always on, the mock interiors are only used as a
fallback — but keep them so the module degrades gracefully.

### Environment variables

```
OPENAI_API_KEY=          # server-only; empty ⇒ mock mode
AI_IMAGE_PROVIDER=mock   # "openai" | "mock"
AI_TEXT_PROVIDER=mock    # only "mock" implemented today
OPENAI_IMAGE_MODEL=gpt-image-1   # brief said gpt-image-2; use the model your account has
OPENAI_IMAGE_QUALITY=medium      # low | medium | high | auto
OPENAI_IMAGE_SIZE=1536x1024      # 1024x1024 | 1536x1024 | 1024x1536 | auto
```

See `.env.example`. `OPENAI_API_KEY` is read **only** in server provider files
and never reaches the client.

---

## 3. Required API routes

Both are Node-runtime, dynamic `POST` handlers (`runtime = "nodejs"`):

| Route | Body | Returns |
| --- | --- | --- |
| `POST /api/ai/design/generate` | multipart FormData (with optional `image`) **or** JSON | `DesignGenerationResult` |
| `POST /api/ai/design/regenerate` | same payload + next `variant` | `DesignGenerationResult` |

Mode is detected server-side: an uploaded image ⇒ `room_photo_redesign`,
otherwise ⇒ `parameters_to_design`. Validation lives in `design-service.ts`
(allowed types: JPG/PNG/WEBP; max 10 MB). On any provider error the route logs
server-side only and falls back to mock (`fellBack: true`).

The client calls these from `ai-assistant.tsx` (`GENERATE_URL` / `REGENERATE_URL`
constants) — change those if you mount the routes under a different base path.

---

## 4. Module boundaries

```
AI MODULE (portable)                         SHARED (reuse on main site)
────────────────────                         ───────────────────────────
src/components/ai/*                           src/i18n/* (locale + dictionaries)
src/lib/ai/*                                  src/app/globals.css (design tokens)
src/app/api/ai/design/*                       src/components/cards/scenario-card.tsx
src/lib/data/palettes.ts                      src/lib/images.ts (aiProject/aiRoom)
ai-related types in src/lib/types.ts          public/images/*.png
```

The AI module does **not** import from marketing pages. Its only outward
dependencies are: i18n helpers, the `scenario-card` component, the `images`
registry (2 entries), design tokens in `globals.css`, and palette data. Keep it
that way — if you add a dependency on a marketing-only file, inline it instead.

> Optional later cleanup (not done now to avoid churn): the AI-only types in
> `src/lib/types.ts` (`GenerationMode`, `GenerationStatus`,
> `DesignGenerationInput/Result`, `DesignPreviewData`, `AIReport`,
> `RoomConceptInput`, `ProjectEstimateInput`) could move to `src/lib/ai/types.ts`.

---

## 5. How to integrate into the main website

1. **Copy the module folders** (§2 core) into the main app, preserving the
   `@/` path layout or updating imports to the main site's aliases.
2. **Wire i18n** — map the `ai` dictionary namespace + the two `common` keys
   into the main site's translation system (§7).
3. **Mount the API routes** under the same base (or update `GENERATE_URL` /
   `REGENERATE_URL` in `ai-assistant.tsx`). Ensure they run on a Node runtime.
4. **Ensure design tokens exist** (copy the AI-related CSS variables from
   `globals.css` if the main site doesn't define them).
5. **Add the env variables** in the main site's server environment.
6. **Mount the entry point**: render `<AIAssistant locale dict={dict.ai}
   preliminaryBadge preliminaryNote />` on the page/route you choose.
7. **Connect the lead step** to the existing lead system (§6).
8. **Add cost/rate protection** before exposing it publicly (§7).

### Lead submission (the important one)

The final step (`lead-form.tsx`) is a **deliberate placeholder** — it only flips
UI state. The main website already has working Telegram + email lead handling.

**Do this on the main site, do NOT build it here:**

- In `lead-form.tsx`'s `handleSubmit`, instead of just `onSubmitted()`, send the
  form fields **plus the generated concept context** (style, palette, room type,
  area, mode, and the preview image / data URL) to the **existing** lead
  endpoint/handler.
- Reuse the existing Telegram bot / email form / analytics goal. Fire the same
  conversion goal the site already tracks.
- Keep the "manager reviews the final quote" messaging.

---

## 6. What must NOT be duplicated

- ❌ No new Telegram integration in this module.
- ❌ No new email/SMTP integration.
- ❌ No separate lead database or CRM here.
- ❌ No second analytics/goals setup — reuse the main site's.

The module's job ends at "collect lead + concept context and hand off." The main
website owns delivery.

---

## 7. Future TODOs (before/at integration)

- [ ] **Lead submission** — connect `lead-form.tsx` to the main site's existing Telegram/email handler + analytics goal (see §5).
- [ ] **Deployment strategy** — decide: subroute `atelier-supply.ru/ai` vs. separate subdomain `app.atelier-supply.ru`. Affects routing, cookies, and the API base path.
- [ ] **i18n mapping** — fold the `ai` dictionary namespace into the main site's language system; keep RU default + EN.
- [ ] **OpenAI production config** — set `OPENAI_API_KEY`, `AI_IMAGE_PROVIDER=openai`, and a model the account can access in the production environment (server-side secrets only).
- [ ] **Rate limiting / cost protection** — see §8. Required before public launch.
- [ ] **Image upload storage** — uploaded photos are currently sent to the image API in-request and not persisted. If concepts must be saved/shared, add object storage (e.g. S3/R2) and store the result URLs.
- [ ] **Optional type relocation** — move AI-only types out of the shared `src/lib/types.ts` (see §4).

---

## 8. Cost & rate protection (required before production)

OpenAI image generation costs money per call, and `generate` + every
`regenerate` is a paid request. Before exposing the module publicly:

- **Rate limiting** — per IP / per session / per user, on both routes.
- **Max file size** — already enforced (10 MB) in `design-service.ts`; keep/tune.
- **Allowed image types** — already enforced (JPG/PNG/WEBP); keep.
- **Daily generation limits** — global and per-visitor caps with a friendly "limit reached" state.
- **Gate generation** — consider requiring phone/contact capture or a CAPTCHA **before** the first generation, so paid calls only happen for real leads.
- **Admin monitoring** — log volume, cost, fallback rate, and errors; alert on spikes. (Detailed provider errors are already logged server-side.)
- **Keep the mock fallback** — if limits are hit or the provider fails, the wizard still works in demo mode.

---

## Quick reference — module file list

```
src/components/ai/
  ai-assistant.tsx          ai-report-preview.tsx     project-details-form.tsx
  ai-room-concept.tsx       ai-design-preview.tsx     room-details-form.tsx
  lead-form.tsx (placeholder)  upload-box.tsx
  wizard-shell.tsx          progress-steps.tsx        field.tsx
src/lib/ai/
  design-service.ts         reports.ts                design-preview.ts
  providers/
    index.ts  types.ts  openai-image-provider.ts  mock-provider.ts  narrative.ts
src/app/api/ai/design/
  generate/route.ts         regenerate/route.ts
src/lib/data/palettes.ts
i18n: `ai.*` (+ common.preliminaryBadge, common.preliminaryNote) in ru.json / en.json
public/images: 8 interior PNGs (mock fallback + scenario thumbnails)
env: OPENAI_API_KEY, AI_IMAGE_PROVIDER, AI_TEXT_PROVIDER,
     OPENAI_IMAGE_MODEL, OPENAI_IMAGE_QUALITY, OPENAI_IMAGE_SIZE
```

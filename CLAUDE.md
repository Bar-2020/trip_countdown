# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check (tsc -b) then Vite production build
npm run lint       # ESLint across all TS/TSX files
npm run verify     # lint, then build: run before pushing
npm run preview    # Serve the production build locally
```

There is no test runner configured in this project. UI changes are checked by hand in a real browser (Playwright with the preinstalled Chromium works well for this in cloud sessions).

## Architecture

This is a single-page React + TypeScript + Vite app, a trip countdown timer that visitors customize themselves. There is no backend: everything the visitor sets is stored in their browser's `localStorage`.

**Files in `src/`:**
- `App.tsx`: the page. Background photo, glass card, flip clock, status text, confetti, and the Customize button.
- `SettingsPanel.tsx`: the Customize dialog (a native `<dialog>`). It is mounted only while open, so its draft state always starts from the saved trip.
- `tripSettings.ts`: the `TripSettings` type, defaults, `localStorage` load/save/clear with validation, and the `useTripSettings` hook.
- `imageUtils.ts`: `compressImage`, which resizes an uploaded photo to at most 1920 px and re-encodes it as a JPEG data URL small enough for `localStorage`.
- `pageMeta.ts`: `usePageMeta` keeps `document.title` and the favicon in sync with the destination.

**How it works:**
- A trip is `{ destination, takeoff, photo }`. `takeoff` is a UTC ISO string; the dialog's `datetime-local` input is read in the visitor's time zone. `photo` is a compressed JPEG data URL from an upload, or `null` for the default gradient background (`DEFAULT_BACKGROUND` in `tripSettings.ts`). No third-party photos are bundled, so the repo can be public.
- Only one trip is stored, under the key `tripCountdown:v1`. Saving replaces it, and a failed save (storage full or blocked) leaves the previous trip intact. If the stored shape ever changes, bump the version in the key and in `STORAGE_VERSION`.
- Stored data is untrusted. `parseStored` rejects anything malformed (including photos that are not `null` or a JPEG, PNG or WebP data URL) and the app falls back to the defaults.
- With nothing saved, a sample countdown 30 days out is shown, computed once per page load.
- Once the takeoff time passes (including on page load), the card shows the finished state and a "Plan your next trip" button, and `react-confetti` plays one burst unless the visitor prefers reduced motion.
- `FlipClockCountdown` is given the takeoff as a number and a `key` so it remounts when the trip changes. It is wrapped in `aria-hidden`; screen readers get a sentence that changes once an hour instead.
- Layout is responsive: `useWindowSize` from `react-use` drives font sizes and padding, and below 600 px the clock is zoomed to fit the card.

## Key conventions

- Styles are inline. `App.css` holds the flip clock overrides and only the things inline styles cannot express: keyframes, `:hover` and `:focus-visible` rules, `::backdrop`, `prefers-reduced-motion`, and the `#root` width fix. `index.css` is the Vite template's globals.
- `#root` needs `width: 100%` because `index.css` makes `body` a flex row. Without it the app shrinks to its content width.
- The `@ts-expect-error` comment on the `--fcc-digit-block-width` CSS custom property is intentional; the flip clock component exposes that variable but it isn't typed.
- Use 16 px (1rem) text in form controls so iOS Safari does not zoom the page on focus.

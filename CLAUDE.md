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
- `styles.ts`: every style in the app, as one object typed `satisfies Record<string, CSSProperties>`.
- `animations.ts`: the fade-in, Ken Burns and rise keyframes plus `useAnimate`, which plays them with the Web Animations API.
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

## Deployment

The site is hosted on AWS: a private S3 bucket behind CloudFront (Origin Access Control), served on the free `*.cloudfront.net` domain. The infrastructure is defined in `terraform/` (S3, CloudFront, a GitHub OIDC role in IAM, and an AWS Budgets alert through SNS).

- **Deploys are automatic.** Pushing to `main` runs `.github/workflows/deploy.yml`: lint, build, sync `dist/` to S3, then invalidate CloudFront. The workflow assumes an IAM role through OIDC, so there are no AWS keys in GitHub. It reads `AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID` (and optionally `AWS_REGION`) from the repo's Actions variables, and skips itself until `AWS_ROLE_ARN` is set.
- **Trips are not deployed.** A visitor's destination, photo and takeoff time live in their own browser (see Architecture above), so changing a trip never needs a deploy or a Terraform run. Only code changes merged to `main` go out.
- **Caching:** files under `assets/` are fingerprinted by Vite and cached for a year. `index.html` and `favicon.svg` are cached for 5 minutes and also invalidated on every deploy.

The one-time setup and teardown commands are in the README under "Deploying".

## Key conventions

- All styles live in `src/styles.ts`, typed `satisfies Record<string, CSSProperties>` (never a type assertion). Components use `style={styles.x}`. Narrow-screen and state variants are separate keys (`cardNarrow`, `buttonDisabled`) that are spread on top of the base. Only values that exist at runtime (a photo URL, the clock zoom) are set where they are used. There are no class names, and `index.css` (the Vite template's globals) is the only stylesheet.
- Anything CSS would normally do is done in TypeScript instead: animations use the Web Animations API through `useAnimate` and are switched off with `useMedia('(prefers-reduced-motion: reduce)')` (call it with no default argument, or the first render ignores the preference). The Customize `<dialog>` is itself the full-screen overlay because `::backdrop` cannot be styled inline. Hover lifts and focus rings are left to the browser.
- Style the flip clock through its typed props (`labelStyle`, `separatorStyle`, `digitBlockStyle`, `style`), not CSS overrides or custom properties. A custom property key would not satisfy `Record<string, CSSProperties>`.
- `#root` needs `width: 100%` (set in `index.css`) because the template makes `body` a flex row. Without it the app shrinks to its content width.
- Use 16 px (1rem) text in form controls so iOS Safari does not zoom the page on focus.

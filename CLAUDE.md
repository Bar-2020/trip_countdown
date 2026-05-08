# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check (tsc -b) then Vite production build
npm run lint       # ESLint across all TS/TSX files
npm run preview    # Serve the production build locally
```

There is no test runner configured in this project.

## Architecture

This is a single-page React + TypeScript + Vite app — a personal trip countdown timer. All application logic lives in one file: `src/App.tsx`.

**How it works:**
- A hardcoded takeoff datetime string is defined at the top of `App.tsx` as a constant (e.g. `GREECE_TAKEOFF`).
- `fromZonedTime` from `date-fns-tz` converts that local datetime string from `'Asia/Jerusalem'` to UTC, which is fed to `FlipClockCountdown`.
- When the countdown reaches zero, `onComplete` triggers confetti via `react-confetti`.
- Layout is responsive: `useWindowSize` from `react-use` drives inline style adjustments for font sizes and padding.
- Background images live in `public/` and are referenced directly as `/filename.jpg`.

**To update the trip date**, change the constant at the top of `src/App.tsx` and swap the background image path in the `backgroundImage` style prop. Previous trip dates are left as commented-out constants in the file for reference.

## Key conventions

- All styles are inline — there is no CSS-in-JS library or external stylesheet beyond `App.css` (resets/globals) and the flip clock's own `dist/index.css`.
- The `@ts-expect-error` comment on the `--fcc-digit-block-width` CSS custom property is intentional; the flip clock component exposes that variable but it isn't typed.

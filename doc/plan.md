# Printable Calendar — High-Level Plan

## Context

Build an app that generates a calendar meant to be printed on paper. It has a **configuration panel** (options) and a **display** (live preview of the printed page). v1: whole year on a single A4 page. Later: one month per page, portrait/landscape, and more options. The repo is currently empty, so this is a greenfield plan. No implementation yet.

## Language / stack recommendation

**TypeScript + HTML/CSS, running in the browser (Vite + React).**

Why:

- Printing is a solved problem in browsers: CSS `@page { size: A4 portrait|landscape; margin: … }`, mm units, `page-break-after`, and the browser's "Print → Save as PDF" give exact A4 output with zero extra libraries.
- The "config panel + display" split maps naturally to a web UI: panel on the left, WYSIWYG page preview on the right, panel hidden via `@media print`.
- CSS Grid makes calendar layouts (12 month grid, 7-day week grid) trivial and easily reconfigurable for later layouts.
- `Intl.DateTimeFormat` gives localized month/day names (e.g. Romanian/English) for free.
- TypeScript keeps the growing options model safe as features are added.
- Runs anywhere, no install for end users; can later be deployed as a static site or wrapped (Electron/Tauri) if desired.

Alternatives considered (not recommended for this goal): Python + ReportLab/WeasyPrint (good PDFs, but weak interactive config/preview UI); desktop GUI toolkits (more work for print layout).

## Architecture (designed for later growth)

Keep three layers strictly separated so new layouts/options don't require rewrites:

1. **Calendar model (pure logic, no UI)** — `src/core/`
   - `buildMonth(year, month, weekStart)` → weeks × 7 days (with leading/trailing days flagged).
   - `buildYear(year, …)` → 12 months.
   - Locale helpers (month/weekday names via `Intl`), week-number helper (ISO).
   - Fully unit-testable.

2. **Configuration (single typed object)** — `src/config/`
   - `CalendarConfig` type + defaults, e.g. `year`, `locale`, `weekStart` (Mon/Sun), `layout` (`"year-on-one-page"` in v1), `orientation` (`portrait` in v1), `title`, `showWeekNumbers`, `highlightWeekends`, font/colors later.
   - Persist to `localStorage`; later export/import JSON.

3. **UI** — `src/ui/`
   - `ConfigPanel` — form bound to `CalendarConfig` (hidden when printing).
   - `Preview` — renders a list of **Pages**; each page is an A4-sized box (210×297 mm) scaled to fit the screen.
   - **Layouts as plug-ins**: each layout is a component `(config, model) → Page[]`. v1 ships `YearOnePageLayout`; later `MonthPerPageLayout` (12 pages) is just another entry in a layout registry. Orientation simply swaps page dimensions + `@page size`.
   - Print stylesheet: `@page` size/margins, hide panel, remove preview scaling/shadows.

## Phased roadmap

**Phase 0 — Setup**: Vite + React + TypeScript scaffold, ESLint/Prettier, Vitest, `.gitignore`, README.

**Phase 1 — MVP (year on one A4 portrait page)**

- Calendar model + tests (leap years, week start, month boundaries).
- Minimal config: year, locale, week start, title, highlight weekends.
- Year layout: title + 3×4 (or 4×3) grid of mini-months.
- A4 preview + Print button (`window.print()`), verified via "Save as PDF".

**Phase 2 — More pages & orientation**

- Layout registry; add `MonthPerPageLayout` (12 pages, large day cells with writing space).
- Portrait/landscape toggle for every layout (grid adapts: e.g. year → 4×3 in landscape).
- Multi-page preview with page navigation/thumbnails.

**Phase 3 — Richer options**

- Week numbers, public holidays (per country, from a data file), custom events/birthdays, moon phases.
- Typography/color themes, margins, paper sizes (A4/A3/Letter), cover page.
- Save/load config as JSON; presets.

**Phase 4 — Optional**

- Direct PDF export (e.g. Paged.js or a headless-Chrome script) for consistent output across browsers.
- Deploy as a static site (GitHub Pages).

## Key risks / notes

- Browser print engines differ slightly; standardize on Chrome/Chromium for printing and document "Margins: None/Default, Scale: 100%".
- Size everything in `mm`/`pt` inside pages, never `px`, so preview == print.

## Verification (per phase)

- `npm test` — unit tests for the calendar model.
- `npm run dev` — check preview in browser; Print → Save as PDF and confirm exactly 1 A4 page (Phase 1) / 12 pages (Phase 2), correct orientation, nothing clipped.

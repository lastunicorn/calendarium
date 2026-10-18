# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Printable Calendar

Browser app (Vite + React + TypeScript) that generates a calendar to print on paper.

## Commands

- `npm run dev` / `npm run build` / `npm test` / `npm run lint` (oxlint) / `npm run format` (`format:check` to verify only) / `npm run typecheck`
- Single test file: `npx vitest run src/core/calendar.test.ts`; single test by name: `npx vitest run -t "leap year"`
- Tests are plain `src/**/*.test.ts` files (no DOM/component tests); they cover `core/` and `config/`.

## Architecture

Three layers, kept strictly separated:

- `src/core/` — pure calendar logic, no React. `buildMonth` always returns 6 weeks so every month has the same height; dates are built from components (not ms arithmetic) to stay DST-safe. `locale.ts` derives month/weekday names from `Intl.DateTimeFormat`.
- `src/config/` — the single `AppConfig`: the active `layout` plus `layouts`, one remembered set of options per layout (`LayoutConfigs`: `YearPerPageConfig`, `MonthPerPageConfig`, `DayPerPageConfig`, each extending `CommonConfig`), with each layout's defaults in `DEFAULTS`. Switching layouts copies nothing, so each layout gets back its own values. `ui/useCalendarConfig` holds it via the pure `configReducer` (`selectLayout` / `update` one layout's fields / `replaceLayout` / `importLayout`) and persists it to `localStorage` on every change; `parseConfig` validates untrusted stored data field by field and falls back to each layout's defaults. Export, import and reset act on one layout: a file holds one layout's options, flat, tagged with `layout`.
- `src/ui/` — `sidebar/` holds the `Toolbar` (print, and export/import/reset of the current layout) and `ConfigForm`: the `LayoutSection` picker, then the active layout's form from `FORMS` (`sidebar/forms.ts`; `YearPerPageForm`, …), which combines the sections (`CalendarSection`, `AppearanceSection`, `HeaderSection`, `DayPageSection`, `PageSection`, each typed `ConfigSectionProps<C>` for the options it edits) built on the typed controls in `fields/` (`SelectField`, `NumberField`, …); `preview/Preview` renders the layout chosen by `config.layout` with that layout's options, looked up in `ui/layouts/registry.ts`.

### Layouts

Three layouts: `year-per-page` (`YearPerPageLayout`: 12 `MiniMonth`s on one page, every month 6 rows so they line up), `month-per-page` (`MonthPerPageLayout`: 12 pages, each a `MonthGrid` of large writing cells showing only the month's 4–6 rows via `visibleWeeks`, adjacent-month days in gray) and `day-per-page` (`DayPerPageLayout`: a memoized `DayPage` for each day from `daysOfYear`, with the weekday heading, a corner `MiniMonth` marking the day via `markedDay`, and, per `dayPageLines`, an hourly schedule from `firstHour` to `lastHour` labeled by `hourNames` in `hourFormat` or ruled lines sized from the page height).

A layout takes its own options as `config` (`LayoutConfigs[id]`) and renders its own `Page`s (`ui/layouts/Page.tsx`, one paper sheet each, given `setup={config.page}`), so it decides the page count; consecutive pages print on separate sheets. Build the model with `useCalendarModel(config)` (takes any `CommonConfig`; memoized months, month and weekday names), reuse `CalendarHeader` for the page heading (`size="large"` or `"compact"`), and pass small view components like `MiniMonth` primitives rather than the whole config. Weekend highlighting rules live in `core/weekend.ts`.

Adding a layout: an id in `LAYOUT_IDS`, its options type in `LayoutConfigs` and its defaults in `DEFAULTS` (`CalendarConfig.ts`), its validators in `LAYOUT_VALIDATORS` and a line in `parseConfig` (`parseConfig.ts`), its component in `LAYOUTS` (`registry.ts`), its form in `FORMS` (`sidebar/forms.ts`), and its labels in `LayoutSection` and `layoutNames.ts` (all compile-enforced).

### Config options

Every option belongs to one layout's set. Adding one touches: `CommonConfig` (every layout) or one layout's type in `CalendarConfig.ts`, its default in `commonDefaults()` or that layout's `DEFAULTS` entry, a validator in `COMMON_VALIDATORS` or that layout's `LAYOUT_VALIDATORS` entry (`config/parseConfig.ts`), and a control in the matching `ui/sidebar/*Section.tsx`, shown by that layout's form. The compiler enforces the default and the validator. For a choice between fixed values, declare a `const` array in `CalendarConfig.ts` and derive the type from it (`(typeof X)[number]`); the validator is `oneOf(X)` and the select options are `optionsFrom(X, labels)`, which fails to compile if a value has no label.

Stored and exported configs are tagged with `CONFIG_VERSION`. Bump it only for a change that would misread older data (renamed or restructured field), list the new shape in its doc comment, and add a migration step in `parseConfig.ts` (`upgradeFlat` for files and old flat storage, `upgradeApp` for storage: v1 → v2 moved `paperSize`, `orientation` and `margins` under `page`; v2 → v3 split the flat config into one set per layout, copying it to every layout); adding a field needs no bump. Nested objects like `page` get their own `Validators` table (`copyValidPage`).

### Printing

- Paper sizes are defined once in `src/core/paper.ts` (`PAPERS`: CSS name and mm dimensions). `Page` sizes its box in mm from it, so the screen preview matches print, and `Preview` renders a `<style>` with the matching `@page { size }` rule. A new paper size is one entry there plus its label in `PageSection`.
- Printing targets Chrome/Chromium: Save as PDF, paper size matching the selection, Margins: None, Scale: 100%.

## Code style

- Indent with tabs (enforced by Prettier and `.editorconfig`); Markdown and YAML use 2 spaces.
- Run `npm run format` after editing.
- A `.tsx` file exports only components (oxlint `react/only-export-components`, for Fast Refresh); put shared constants in a `.ts` file next to it, as `sidebar/layoutNames.ts` does.
- `doc/` holds design and implementation plans (e.g. `per-layout-config-plan.md`) that explain why the code looks the way it does.

### Styles

- Each component's styles live in a co-located CSS Module: `Toolbar.tsx` → `Toolbar.module.css`, imported as `import styles from './Toolbar.module.css'`.
- Use camelCase class names (`.a4Portrait`) so they read as `styles.a4Portrait`.
- Keep a component's print overrides (`@media print`) in its own module file.
- `src/index.css` holds only global styles: reset, `:root` fonts/colors (CSS variables), `body`, and the global `@page { margin: 0 }`. No component classes there.
- Size anything inside a printed page in `mm`/`pt`, never `px`.
- Draw thin lines as borders, never as background gradients: a sub-pixel gradient line can vanish depending on zoom and pixel position (Firefox especially), while a non-zero border always gets at least one device pixel.
- Use the color variables from `:root` in `index.css` (`var(--color-weekend)`), never literal colors in a module; add a variable when a new color is needed.

### Event handlers

- Never write event handlers inline in JSX (`onClick={() => ...}`). Extract them as named functions and pass them by reference: `onClick={handlePrintClick}`.
- Name them `handle<Element><Event>`, e.g. `handlePrintClick`, `handleYearChange`.
- If the handler does not use props or state, declare it at module level, outside the component. Otherwise declare it inside the component, before the `return`.
- Pass the function itself, not a call to it: `onClick={handleX}`, not `onClick={handleX()}`.
- Wrap a handler in `useCallback` only when it needs a stable identity (passed to a `React.memo` child or used in a hook dependency array).
- For handlers that need per-item arguments (e.g. list rows), use a `data-*` attribute read from `event.currentTarget`, or move the handler into a child component.

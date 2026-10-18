# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Printable Calendar

Browser app (Vite + React + TypeScript) that generates a calendar to print on paper. Roadmap: [doc/plan.md](doc/plan.md).

## Commands

- `npm run dev` / `npm run build` / `npm test` / `npm run lint` (oxlint) / `npm run format` / `npm run typecheck`
- Single test file: `npx vitest run src/core/calendar.test.ts`; single test by name: `npx vitest run -t "leap year"`
- Tests are plain `src/**/*.test.ts` files (no DOM/component tests); they cover `core/` and `config/`.

## Architecture

Three layers, kept strictly separated (see [doc/plan.md](doc/plan.md)):

- `src/core/` — pure calendar logic, no React. `buildMonth` always returns 6 weeks so every month has the same height; dates are built from components (not ms arithmetic) to stay DST-safe. `locale.ts` derives month/weekday names from `Intl.DateTimeFormat`.
- `src/config/` — the single `CalendarConfig` object. `ui/useCalendarConfig` holds it via the pure `configReducer` (`update` a few fields / `replace` the whole config) and persists it to `localStorage` on every change; `parseConfig` validates untrusted stored data field by field and falls back to defaults.
- `src/ui/` — `sidebar/` holds the `Toolbar` (print, export/import, reset) and `ConfigForm`, whose sections (`CalendarSection`, `HeaderSection`, `PageSection`) build on the typed controls in `fields/` (`SelectField`, `NumberField`, …); `preview/Preview` renders the layout chosen by `config.layout`, looked up in `ui/layouts/registry.ts`.

### Layouts

A layout takes `config` and renders its own `Page`s (`ui/layouts/Page.tsx`, one paper sheet each), so it decides the page count; consecutive pages print on separate sheets. Build the model with `useCalendarModel(config)` (memoized months, month and weekday names), reuse `CalendarHeader` for the title/subtitle, and pass small view components like `MiniMonth` primitives rather than the whole config. Weekend highlighting rules live in `core/weekend.ts`.

Adding a layout: an id in `LAYOUT_IDS` (`CalendarConfig.ts`), its component in `LAYOUTS` (`registry.ts`; compile-enforced), and a layout select in the sidebar if there isn't one yet (there is none while only one layout exists).

### Config options

Adding a config option touches: `CalendarConfig` type, `defaultConfig()`, a validator in `VALIDATORS` (`config/parseConfig.ts`), and a control in the matching `ui/sidebar/*Section.tsx`. The compiler enforces the validator. For a choice between fixed values, declare a `const` array in `CalendarConfig.ts` and derive the type from it (`(typeof X)[number]`); the validator is `oneOf(X)` and the select options are `optionsFrom(X, labels)`, which fails to compile if a value has no label.

Stored and exported configs are tagged with `CONFIG_VERSION`. Bump it only for a change that would misread older data (renamed or restructured field) and migrate the old shape in `parseConfig`; adding a field needs no bump.

### Printing

- Paper sizes are defined once in `src/core/paper.ts` (`PAPERS`: CSS name and mm dimensions). `Page` sizes its box in mm from it, so the screen preview matches print, and `Preview` renders a `<style>` with the matching `@page { size }` rule. A new paper size is one entry there plus its label in `PageSection`.
- Printing targets Chrome/Chromium: Save as PDF, paper size matching the selection, Margins: None, Scale: 100%.

## Code style

- Indent with tabs (enforced by Prettier and `.editorconfig`); Markdown and YAML use 2 spaces.
- Run `npm run format` after editing.

### Styles

- Each component's styles live in a co-located CSS Module: `Toolbar.tsx` → `Toolbar.module.css`, imported as `import styles from './Toolbar.module.css'`.
- Use camelCase class names (`.a4Portrait`) so they read as `styles.a4Portrait`.
- Keep a component's print overrides (`@media print`) in its own module file.
- `src/index.css` holds only global styles: reset, `:root` fonts/colors (CSS variables), `body`, and the global `@page { margin: 0 }`. No component classes there.
- Size anything inside a printed page in `mm`/`pt`, never `px`.

### Event handlers

- Never write event handlers inline in JSX (`onClick={() => ...}`). Extract them as named functions and pass them by reference: `onClick={handlePrintClick}`.
- Name them `handle<Element><Event>`, e.g. `handlePrintClick`, `handleYearChange`.
- If the handler does not use props or state, declare it at module level, outside the component. Otherwise declare it inside the component, before the `return`.
- Pass the function itself, not a call to it: `onClick={handleX}`, not `onClick={handleX()}`.
- Wrap a handler in `useCallback` only when it needs a stable identity (passed to a `React.memo` child or used in a hook dependency array).
- For handlers that need per-item arguments (e.g. list rows), use a `data-*` attribute read from `event.currentTarget`, or move the handler into a child component.

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
- `src/config/` — the single `CalendarConfig` object. `App` holds it in state and persists it to `localStorage` on every change; `parseConfig` validates untrusted stored data field by field and falls back to defaults.
- `src/ui/` — `ConfigPanel` edits the config; `Preview` renders page boxes (A4/A3/Letter) and puts a layout from `ui/layouts/` inside each page. Layouts take `config` and build their model from `core/` (memoized).

Adding a config option touches: `CalendarConfig` type, `defaultConfig()`, `parseConfig()` validation, and a `ConfigPanel` control.

### Printing

- Preview page boxes are sized in mm (e.g. A4 210×297) so the screen preview matches print.
- Paper size and orientation work through CSS named pages: a page class in `Preview.module.css` sets `page: <size><Orientation>` (e.g. `a4Portrait`, `letterLandscape`), matching an `@page` rule of the same name in `src/index.css`. A new paper size/orientation needs both.
- Printing targets Chrome/Chromium: Save as PDF, paper size matching the selection, Margins: None, Scale: 100%.

## Code style

- Indent with tabs (enforced by Prettier and `.editorconfig`); Markdown and YAML use 2 spaces.
- Run `npm run format` after editing.

### Styles

- Each component's styles live in a co-located CSS Module: `ConfigPanel.tsx` → `ConfigPanel.module.css`, imported as `import styles from './ConfigPanel.module.css'`.
- Use camelCase class names (`.a4Portrait`) so they read as `styles.a4Portrait`.
- Keep a component's print overrides (`@media print`) in its own module file.
- `src/index.css` holds only global styles: reset, `:root` fonts/colors (CSS variables), `body`, and the `@page` rule. No component classes there.
- Size anything inside a printed page in `mm`/`pt`, never `px`.

### Event handlers

- Never write event handlers inline in JSX (`onClick={() => ...}`). Extract them as named functions and pass them by reference: `onClick={handlePrintClick}`.
- Name them `handle<Element><Event>`, e.g. `handlePrintClick`, `handleYearChange`.
- If the handler does not use props or state, declare it at module level, outside the component. Otherwise declare it inside the component, before the `return`.
- Pass the function itself, not a call to it: `onClick={handleX}`, not `onClick={handleX()}`.
- Wrap a handler in `useCallback` only when it needs a stable identity (passed to a `React.memo` child or used in a hook dependency array).
- For handlers that need per-item arguments (e.g. list rows), use a `data-*` attribute read from `event.currentTarget`, or move the handler into a child component.

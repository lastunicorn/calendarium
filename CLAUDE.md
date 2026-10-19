# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Printable Calendar

Browser app (Vite + React + TypeScript) that generates a calendar to print on paper.

## Commands

- `npm run dev` / `npm run build` / `npm test` / `npm run test:e2e` (Playwright) / `npm run lint` (oxlint) / `npm run format` (`format:check` to verify only) / `npm run typecheck`
- Single test file: `npx vitest run src/core/calendar.test.ts`; single test by name: `npx vitest run -t "leap year"`
- Unit tests are plain `src/**/*.test.ts` files, DOM-free, covering `core/` and `config/`. Component tests are `src/**/*.test.tsx` (Vitest `component` project: jsdom + Testing Library, setup in `src/test/setupDom.ts`); they check structure only (page counts, which form sections show, the import flow), never appearance. Run one project with `npx vitest run --project unit` (or `component`).
- CI (`.github/workflows/build-master.yml`) runs `format:check`, `lint`, `typecheck`, `test`, `build` and `test:e2e`, in that order; run the same before considering a change done.
- `e2e/print.spec.ts` (Playwright, Chromium) builds the app, prints each layout to PDF and checks the page count and paper size, and that no page's content is clipped in print media. First run needs `npx playwright install chromium`.

## Architecture

Three layers, kept strictly separated:

- `src/core/` — pure calendar logic, no React. `buildMonth` always returns 6 weeks so every month has the same height. A date is a `PlainDate` (`{ year, month, day, weekday, key }`, `key` = `YYYY-MM-DD`, the React key; a `CalendarDay` extends it), never a `Date`: `plainDate` builds one, and `utcDate` (UTC midnight, `setUTCFullYear`, so no DST and years below 100 as written) is the only place a `Date` is built, for `Intl` formatting (`dateFormatter` formats in UTC). `locale.ts` lists the supported `LOCALES` and derives month/weekday names from `Intl.DateTimeFormat` (through the cached `dateFormatter`) and the default week start from `Intl.Locale` week data. Any other text printed on a page comes from `PRINT_MESSAGES` (`messages.ts`), never a literal in a component, so a calendar is printed in one language; the app's own UI stays English. A new locale is one entry in `LOCALES`, its messages and its label in `AppearanceSection` (compile-enforced).
- `src/config/` — the single `AppConfig`: the active `layout` plus `layouts`, one remembered set of options per layout (`LayoutConfigs`: `YearPerPageConfig`, `MonthPerPageConfig`, `WeekPerPageConfig`, `DayPerPageConfig`, each extending `CommonConfig`). Each layout's config knowledge is one `LayoutSpec` in `config/layouts/<layout>.ts`, next to its options type: `defaults`, `validators` (extending `COMMON_VALIDATORS` from `validators.ts`) and `normalize`; `config/layouts/index.ts` collects them in `LAYOUT_SPECS` and exposes `layoutSpec(id)`, `defaultLayoutConfig`, `normalizeLayout`, `mapLayouts` and `defaultAppConfig`. Switching layouts copies nothing, so each layout gets back its own values. `ui/useCalendarConfig` holds it via the pure `configReducer` (`selectLayout` / `update` one layout's fields / `replaceLayout` / `importLayout`) and persists it to `localStorage` on every change; `parseConfig` validates untrusted stored data field by field and falls back to each layout's defaults. Export, import and reset act on one layout: a file holds one layout's options, flat, tagged with `layout`.
- `src/ui/` — `sidebar/` holds the `Toolbar` (print, and export/import/reset of the current layout) and `ConfigForm`: the `LayoutSection` picker, then the active layout's form, which combines the sections (the shared `CalendarSection`, `AppearanceSection`, `PageSection` in `sidebar/`, and sections only one layout uses, like `HeaderSection` or `DayPageSection`, in that layout's folder; each typed `ConfigSectionProps<C>` for the options it edits) built on the typed controls in `fields/` (`SelectField`, `NumberField`, …); `preview/Preview` renders the layout chosen by `config.layout` with that layout's options. Each layout's UI is one folder, `ui/layouts/<layout-id>/`, whose `index.ts` exports a `LayoutView` (`Component`, `Form`, short `name` and picker `label`); `ui/layouts/registry.ts` collects them in `LAYOUT_VIEWS` and exposes `layoutView(id)`. Parts several layouts draw (`Page`, `CalendarHeader`, `MiniMonth`, `useCalendarModel`) stay directly in `ui/layouts/`.

### Layouts

Four layouts: `year-per-page` (`YearPerPageLayout`: 12 `MiniMonth`s on one page, every month 6 rows so they line up), `month-per-page` (`MonthPerPageLayout`: 12 pages, each a `MonthGrid` of large writing cells showing only the month's 4–6 rows via `visibleWeeks`, adjacent-month days in gray), `week-per-page` (`WeekPerPageLayout`: a memoized `WeekPage` for each week from `weeksOfYear`, 53 or 54, headed by the `dateRangeName` of its days; seven writing cells side by side or stacked per `weekDayDirection` (`stacksDays`: `auto` stacks them in portrait unless the week spans two pages), per `weekendDisplay` (`weekCells`: Saturday and Sunday may share a cell or be left out), each holding an hourly schedule when `weekPageLines` is `hours`, except in a cell two days share or for a day of another year; days of the previous/next year (`WeekDay.inYear`) in gray; with `twoPagesPerWeek`, `splitWeekCells` puts the first three days on a first page under a left-aligned heading and the rest on a second whose heading space is kept by a hidden copy) and `day-per-page` (`DayPerPageLayout`: a memoized `DayPage` for each day from `daysOfYear`, with the weekday heading, a corner `MiniMonth` marking the day via `markedDay`, and, per `dayPageLines`, an hourly schedule from `firstHour` to `lastHour` labeled by `hourNames` in `hourFormat` or ruled lines sized from the page height; with `twoPagesPerDay`, a second page without a header continues the lines or holds the second half of the hours). The schedule options (`HourSchedule`: `hourFormat`, `firstHour`, `lastHour`) are shared by the week and day layouts through `config/layouts/hours.ts` (defaults, validators, the `orderHours` normalize) and `ui/sidebar/ScheduleFields`.

A layout takes its own options as `config` (`LayoutConfigs[id]`) and renders its own `Page`s (`ui/layouts/Page.tsx`, one paper sheet each, given `setup={config.page}`), so it decides the page count; consecutive pages print on separate sheets. Build the model with `useCalendarModel(config)` (takes any `CommonConfig`; memoized months, month and weekday names), reuse `CalendarHeader` for the page heading (`size="large"` or `"compact"`), and pass small view components like `MiniMonth` primitives rather than the whole config. Weekend highlighting rules live in `core/weekend.ts`.

Adding a layout: an id in `LAYOUT_IDS` and an entry in `LayoutConfigs` (`CalendarConfig.ts`); a `config/layouts/<layout>.ts` with its options type and `LayoutSpec` (`normalize: unchanged` when it has no cross-field rules), listed in `LAYOUT_SPECS`; a `ui/layouts/<layout-id>/` folder with its component, form and `LayoutView`, listed in `LAYOUT_VIEWS` (all compile-enforced).

### Config options

Every option belongs to one layout's set. Adding one touches: `CommonConfig` (every layout, `CalendarConfig.ts`) or one layout's type in `config/layouts/<layout>.ts`, its default in `commonDefaults()` or that layout's spec `defaults`, a validator in `COMMON_VALIDATORS` (`config/validators.ts`) or that layout's spec `validators`, and a control in the matching section (`ui/sidebar/*Section.tsx` for shared options, the layout's folder for its own), shown by that layout's form. The compiler enforces the default and the validator. A rule that ties several fields together (e.g. `firstHour` ≤ `lastHour`) goes in that layout's spec `normalize`, which runs after parsing and after every reducer change, so layouts render the config as is and form limits are only a hint. For a choice between fixed values, declare a `const` array in `CalendarConfig.ts` (or the layout's spec file, when only it uses the set) and derive the type from it (`(typeof X)[number]`); the validator is `oneOf(X)` and the select options are `optionsFrom(X, labels)`, which fails to compile if a value has no label.

The app version in `package.json` (semver) is the only version to edit; `config/version.ts` exposes it as `APP_VERSION` (shown in the sidebar) and its major part as `CONFIG_VERSION`, the version of the config format. Stored data (`{ version, app, layout, layouts }`) and files (`{ format, version, app, layout, ...options }`, one layout, flat, `format` being `FILE_FORMAT`) are tagged with both. Data without a valid `version` (from `FIRST_CONFIG_VERSION` = 3 up) is ignored, and a file without the `format` is rejected. A release bumps `package.json`: a minor or patch for anything older builds still read correctly (adding a field needs no major), a major for a change that would misread older data (renamed or restructured field or value). A major release appends one step to `STORAGE_MIGRATIONS` and one to `FILE_MIGRATIONS` in `config/migrations.ts` (one returning the data as is when that format did not change) and describes the new shape in their doc comments; a test fails until both lists reach the new major. Data from a later version (a later major, or a later `app` of the same major) is read best-effort: storage is never written on load (`useCalendarConfig` saves only after a change), `saveConfig` backs such data up under another key before overwriting it, and an imported file shows a notice. A nested object like `page` is checked by a nested `Validators` table (`FieldCheck`), field by field, so one bad field keeps the others.

### Printing

- Paper sizes are defined once in `src/core/paper.ts` (`PAPERS`: CSS name and mm dimensions). `Page` sizes its box in mm from it (`contentBox` gives the area inside the margins, for layouts that size content from the page), so the screen preview matches print, and `Preview` renders a `<style>` with the matching `@page { size }` rule. A new paper size is one entry there plus its label in `PageSection`.
- `Page` clips content to the paper, so on screen it shows a badge when its content doesn't fit inside the margins (`useOverflow`, checked only while the page is visible, so it doesn't undo `content-visibility`). `Preview` wraps the layout in `PreviewErrorBoundary`, which offers a reset of the layout's settings instead of a blank screen.
- Printing targets Chrome/Chromium: Save as PDF, paper size matching the selection, Margins: None, Scale: 100%.

## Code style

- Indent with tabs (enforced by Prettier and `.editorconfig`); Markdown and YAML use 2 spaces.
- Run `npm run format` after editing.
- A `.tsx` file exports only components (oxlint `react/only-export-components`, for Fast Refresh); put shared constants in a `.ts` file next to it, as each layout folder's `index.ts` does.

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

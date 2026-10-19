# Architecture review

Date: 2026-10-19. Scope: everything under `src/` at commit `456466a`, plus the build and tooling
setup. About 3,500 lines of TypeScript and CSS, 77 unit tests.

## 1. Summary

The codebase is in good shape for its size. The three layers (`core` → `config` → `ui`) are
real: nothing in `core/` imports React, and nothing in `config/` imports `ui/`. The code relies
on the type system on purpose: mapped types make a new layout, option or label fail to compile
until every place that needs it is filled in. Untrusted data (localStorage, imported files) is
validated field by field and versioned. Most choices are explained in doc comments. There are no
runtime dependencies besides React.

The weak points are less about structure and more about things that **grow badly**:

1. Adding a layout touches **7 files in 3 layers** (shotgun surgery, even though the compiler
   points to each one).
2. **Domain rules sit in the UI**: hour-range ordering is enforced in a form and re-fixed at
   render time; English text is hard-coded on the printed page.
3. **The persistence format** mixes two formats (storage, file) under one version number and can
   destroy data written by a newer build.
4. **Nothing guards `main`**: the committed tree does not pass `npm run typecheck` or
   `format:check` today, and there is no CI to catch that.
5. **No tests above the pure layer**: page count, print breaks and content clipping (the things
   users actually see on paper) are untested.

The recommendations below are ordered by value for the effort. Each says what would change and
why, and what it costs. Section 7 lists things that should **not** be added.

## 2. What to keep

These choices are good; any refactor should keep them.

| Decision                                                | Why it works                                                                                   |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Pure `core/` with no React, DST-safe date construction  | Easy to test (most of the 77 tests are here) and reusable (e.g. a future PDF or SSR renderer). |
| `const` arrays as the source of each union type         | One list feeds the type, the validator (`oneOf`) and the labels (`optionsFrom`).               |
| Mapped-type registries (`LAYOUTS`, `FORMS`, `DEFAULTS`) | A missing entry is a compile error, not a runtime `undefined`.                                 |
| Field-by-field validation, falling back to defaults     | One bad field doesn't throw away the user's other settings.                                    |
| A pure reducer behind a thin hook (`useCalendarConfig`) | State changes can be tested without a DOM.                                                     |
| `Page` sized in mm from `PAPERS`, one `@page` rule      | The preview matches print by construction, not by tuning.                                      |
| `DayPage` memoized, shared values computed once         | 366 pages stay responsive.                                                                     |
| Design docs in `doc/`                                   | Decisions are recorded with their reasons.                                                     |

## 3. Correctness issues found during the review

These are not architectural, but they belong in this review because a structural change
(section 4) would make each one impossible or easy to catch.

### 3.1 Years 1–99 render the wrong calendar — high

`isYear` allows `MIN_YEAR = 1`, but `new Date(year, month, day)` reads years 0–99 as 1900–1999:

```
new Date(50, 1, 10).getFullYear()  // 1950
```

So year `50` shows the heading "50" above the weekdays and leap days of 1950. Every
`new Date(year, …)` in `core/calendar.ts` (`buildMonth`, `daysInMonth`, `isoWeek`, `dayOfYear`)
has this problem.

**Fix (pick one):**

- Narrow the domain: `MIN_YEAR = 1900` (or 1583, the first full Gregorian year). This is the
  simplest choice and probably the right one for a printable calendar; old stored years then fall
  back to the default through `parseConfig`, as intended.
- Or keep the range and route date construction through one helper in `core/` that calls
  `setFullYear(year, month, day)` after construction. Section 4.6 explains why one helper is
  better anyway.

Add a test either way: `buildMonth(50, 1, 1)` must hold dates whose `getFullYear()` is 50, or
`isYear(50)` must be false.

### 3.2 The committed tree fails the type check — high

`src/ui/sidebar/LayoutSection.tsx:22` uses `SelectField` without its required `label` prop, so
`npm run typecheck` and `npm run build` fail. `npm run format:check` also flags the same file.
`npm test` and `npm run lint` pass, which is why this went unnoticed. The fix is one line; the
architectural fix is CI (section 5.1).

(`strict` is not set in `tsconfig.app.json`, but TypeScript 6 turns it on by default, so the
project is already strict. Writing `"strict": true` explicitly keeps it that way if the compiler
or the config template changes.)

### 3.3 English text on non-English calendars — medium

`DayPage.tsx` writes `Week ${n}` and `Day ${n} / ${total}` in English, so a calendar set to
`ja-JP` or `ro-RO` prints a mix of languages. The `locale` option only reaches `Intl` formatters.
See section 4.4.

### 3.4 A newer stored config is overwritten — medium

`useCalendarConfig` saves in a `useEffect` that also runs on mount. If storage holds data from a
**newer** build (after a rollback, or two deployed versions open in two tabs), `upgradeApp`
parses it best-effort as version 3 and the mount effect immediately writes it back as version 3,
dropping every field version 3 doesn't know. See section 4.3.

## 4. Architectural recommendations

### 4.1 Make a layout one module, not seven edits — high value, medium effort

Today a new layout needs: `LAYOUT_IDS`, `LayoutConfigs` and `DEFAULTS` (`CalendarConfig.ts`),
`LAYOUT_VALIDATORS` and a hand-written line in `parseConfig` (`parseConfig.ts`), `LAYOUTS`
(`registry.ts`), `FORMS` (`forms.ts`), and labels in both `LayoutSection.tsx` and
`layoutNames.ts`. The compiler finds them, but the knowledge "what a layout is" is spread across
three layers, and the layout's code is split between `ui/layouts/` and `ui/sidebar/`.

**Proposal:** one descriptor per layout, split along the layer boundary so `config/` still never
imports React.

```
src/config/layouts/
	dayPerPage.ts        // { defaults, validators, normalize }  (section 4.2)
	index.ts             // LAYOUT_SPECS: { [K in LayoutId]: LayoutSpec<LayoutConfigs[K]> }
src/ui/layouts/day-per-page/
	DayPerPageLayout.tsx
	DayPage.tsx + .module.css
	DayPerPageForm.tsx
	DayPageSection.tsx   // a section only this layout uses moves next to it
	index.ts             // { Component, Form, name: 'Day', label: 'Day (One day per page)' }
src/ui/layouts/registry.ts   // LAYOUT_VIEWS: { [K in LayoutId]: LayoutView<LayoutConfigs[K]> }
```

- `LAYOUT_IDS` and `LayoutConfigs` stay the single type-level list; both registries stay mapped
  types, so the compile-time checks are kept.
- `parseConfig` maps over `LAYOUT_IDS` instead of one line per layout (one cast, hidden inside a
  generic helper, as `ActiveLayout` already does).
- `LayoutSection` and `Toolbar` read `name` and `label` from `LAYOUT_VIEWS`; `layoutNames.ts`
  goes away.
- Shared sections (`CalendarSection`, `AppearanceSection`, `PageSection`) and shared view parts
  (`MiniMonth`, `CalendarHeader`, `Page`) stay where they are.

**Result:** a new layout becomes one id, one type entry, and two new folders. The checklist in
`CLAUDE.md` shrinks to match.

**Cost:** moving files and updating imports; no behavior change. Do it before the fourth layout,
not after.

### 4.2 Move invariants into the domain: `normalize` per layout — high value, low effort

The rule "first hour ≤ last hour" exists in three places:

- `DayPageSection` limits each field by the other,
- `DayPerPageLayout` sorts the range with `Math.min` / `Math.max`,
- `parseConfig` accepts a reversed pair from a file without complaint.

Each new cross-field rule (e.g. "the title fits on one line", "margins leave a usable area")
would spread the same way.

**Proposal:** every layout spec gets a pure `normalize(config): config` that enforces its
invariants. Call it in two places only: at the end of `parseCurrentLayoutConfig`, and in
`configReducer` after each `update`, `replaceLayout` and `importLayout`. Then:

- the config held in state is always valid, so layouts render it as is (remove the `min`/`max`
  sorting),
- the form can keep its limits as a UX hint, but correctness no longer depends on them,
- the rule is unit-tested once, in `config/`.

A related rule should also move: `ruledLineCount` in `DayPage.tsx` computes the printable height
itself. Add `contentBox(setup): { width, height }` to `core/paper.ts` next to
`pageDimensions`, and use it there and in any future layout that sizes content from the page.

### 4.3 Persistence: two formats, ordered migrations, and respect newer data — medium value, medium effort

> **Update (implemented):** before the first release, the format history was reset: version 3
> is the first config version, and the earlier ones and their migrations were removed. Storage
> and files share one `CONFIG_VERSION`, the major part of the app version in `package.json`
> (released as 3.0.0), and are also tagged with the full app version to detect data from a later
> minor release. See `config/version.ts` and `config/migrations.ts`.

`CONFIG_VERSION` versions two different formats: the stored app config
(`{ version, layout, layouts }`) and the exported file (`{ version, layout, ...flat }`). They
already differ in shape, and they will change for different reasons (a file is a public
interchange format; storage is private). Bumping one forces a fake bump of the other, and
`isFlat` has to guess from the version which shape it was given.

**Proposals:**

1. **Separate versions:** `STORAGE_VERSION` and `FILE_VERSION`, each with its own documented
   shape history. Give files a format marker too (`"format": "printable-calendar/layout"`) so a
   random JSON object is rejected rather than half-imported.
2. **Ordered migration list** instead of branches:
   ```ts
   const STORAGE_MIGRATIONS: Record<number, (data: StoredData) => StoredData> = {
     1: migrateFromV1, // → 2
     2: migrateFromV2, // → 3
   }
   // apply from the data's version up to the current one, in order
   ```
   Each step is tested on its own, and a new version is one new entry. `renameValues` becomes
   part of the step that introduced each rename.
3. **Never downgrade silently.** If `version > STORAGE_VERSION`, load best-effort but **don't
   save** until the user changes something (or keep the original under a backup key). For
   imports, show "This file was made by a newer version; some settings may be ignored."
4. **Skip the save on mount.** Save only on changes after the initial load (keep a ref of the
   loaded value, or save from the dispatch wrapper instead of an effect). This also removes the
   double write under `StrictMode`.
5. **Optional: sync across tabs** with the `storage` event, dispatching a `load` action. It's
   cheap, and two open tabs currently overwrite each other without warning.

### 4.4 Localize everything that gets printed — medium value, low effort

Everything on paper should follow `config.locale`; the app's own UI can stay English.

- Add `core/messages.ts` with a table keyed by `Locale` (the `Record<Locale, …>` type makes a new
  locale without translations fail to compile, as labels do today):
  ```ts
  export const PRINT_MESSAGES: Record<
    Locale,
    { week: (n: number) => string; dayOfYear: (n: number, total: number) => string }
  >
  ```
  `Locale` would have to move from `config/` to `core/locale.ts` for this, which fits better
  anyway: it is a domain value, like `WeekStart`.
- **Locale-aware defaults.** `Intl.Locale.prototype.getWeekInfo()` (available in Chromium, the
  print target) returns the first day of the week and the weekend days for a locale. Use it to
  pick the default `weekStart` in `commonDefaults()`, with today's values as the fallback.
- **Weekend days as data.** `isWeekend` hard-codes Saturday and Sunday. Making the weekend a set
  of weekdays (`readonly WeekdayIndex[]`, default from `getWeekInfo`) keeps `core/weekend.ts`
  pure and supports Friday–Saturday weekends.
- **Week numbering.** Rows are always numbered by ISO 8601, which differs from the US system
  (weeks start on Sunday, week 1 contains January 1). If week numbers matter to US users, add a
  `weekNumbering: 'iso' | 'us'` option; at least document the choice in the UI tooltip.

### 4.5 Rendering scale for `day-per-page` — medium value, low effort

The day layout puts 366 full pages in the DOM, each with a 42-cell mini month and a schedule,
for about 25–30 thousand elements. Memoization keeps updates fast, but first render, a locale or
year change, and scrolling all pay for every page.

1. **`content-visibility: auto` on `.page` for screen only**, with
   `contain-intrinsic-size` set from the page size already known in `Page`. The browser skips
   layout and paint of offscreen pages; print is unaffected because the rule sits in
   `@media screen`. One CSS rule, large gain. Check that `break-before` still applies when
   printing.
2. **Cache `Intl.DateTimeFormat` instances.** `weekdayName` and `fullDateName` build a new
   formatter on every call, so 732 formatters per locale change on the day layout, and
   `monthYearName` one per month. A small `formatter(locale, options)` cache in `core/locale.ts`
   (keyed by `locale + JSON.stringify(options)`) fixes it for every caller, current and future.
3. **Don't virtualize.** Rendering only visible pages (react-window and similar) would break
   `window.print()`, which needs every page in the DOM. Point 1 covers this.

### 4.6 A plain date value in `core/` — low value now, keeps future work cheap

`CalendarDay.date` is a mutable `Date` at local midnight, and React keys are built with
`toISOString()`, which turns local midnight into a UTC timestamp (e.g. `2025-12-31T22:00:00Z`
for January 1 in UTC+2). It works, but it uses an instant to stand for a calendar date, and it is
where issue 3.1 comes from.

**Proposal:** add a small `PlainDate` (`{ year, month, day }` plus a `key: 'YYYY-MM-DD'`) and
build every `Date` through one function in `core/calendar.ts` (which also fixes years below 100).
Views use `day.key` as the React key. When `Temporal.PlainDate` is supported in the print
target, this helper is the only place to change.

### 4.7 Fail visibly, not silently — medium value, low effort

- **Content overflow.** `Page` has `overflow: hidden`, so content that doesn't fit (e.g. Letter
  landscape, day layout, hours 0–23, 30 mm margins) is cut off without warning, in the preview
  and on paper. Add a screen-only check in `Page`: a `ResizeObserver` comparing `scrollHeight`
  with `clientHeight` that marks the page with a "content doesn't fit" badge (hidden in print).
  This turns a silent print defect into visible feedback.
- **Error boundary.** A render error anywhere (a locale `Intl` rejects, a future layout bug)
  leaves a blank screen. Wrap `Preview` in an error boundary with "Reset this layout's settings",
  so the sidebar keeps working and a bad stored config can be recovered without DevTools.
- **Import diagnostics.** `parseLayoutConfig` drops invalid fields silently. Have `copyValid`
  collect the rejected keys and return `{ config, ignored: string[] }`; the toolbar can show
  "Imported; 2 settings were invalid and kept their defaults: firstHour, margins.top."

## 5. Engineering process

### 5.1 CI — high value, very low effort

There is no `.github/` (or other CI) config. A single workflow running
`format:check`, `lint`, `typecheck`, `test` and `build` on every push and pull request would
have caught issue 3.2. Optionally add a pre-commit hook (e.g. `simple-git-hooks` with
`npm run typecheck && npm test`) since the test suite runs in under a second.

### 5.2 Tests above the pure layer — high value, medium effort

The policy "tests cover `core/` and `config/` only" kept tests fast and simple, but the risky
parts are now in rendering and print, where nothing is tested. Two narrow additions:

1. **Component tests** (Vitest + `jsdom` + Testing Library), only for structure, not appearance:
   - each layout renders the right number of `Page`s (1; 12; 365 or 366),
   - each layout's form shows its sections and only those (e.g. no title field on Day),
   - the Toolbar import flow: a valid file switches the layout; an invalid one shows the error.
     Keep them in `src/**/*.test.tsx` so the plain `.test.ts` files stay DOM-free.
2. **One Playwright print test** in Chromium: for each layout, generate a PDF with `page.pdf()`
   and check the page count and the page size. This is the only automatic check that
   `@page`, `break-before` and the mm sizing still produce what users print. Add the overflow
   check from 4.7 as an assertion too (no page reports overflow with the default settings).

### 5.3 Smaller items

- Write `"strict": true` in `tsconfig.app.json` explicitly (see 3.2), and consider
  `noUncheckedIndexedAccess`: indexes like `months[month]` and `options[selectedIndex]` are
  currently typed as never `undefined`.
- `oxlint` runs only the `react`, `typescript` and `oxc` plugins with defaults; turning on
  `react-hooks/exhaustive-deps` would protect the `useMemo` dependency lists that the day layout's
  performance relies on.
- The `README.md` "Structure" section still says "CalendarConfig type", from before per-layout
  configs; point it to `CLAUDE.md` / this document instead of repeating them.
- `useCalendarModel` lives in `ui/layouts/` but is mostly a memoized call of pure functions. If a
  non-React consumer appears (a PDF exporter, a worker), split it into a pure
  `buildCalendarModel` in `core/` and a thin hook.

## 6. Suggested order

| #   | Change                                                        | Effort | Section  |
| --- | ------------------------------------------------------------- | ------ | -------- |
| 1   | Fix `LayoutSection` label + format; add CI                    | XS     | 3.2, 5.1 |
| 2   | Fix years below 100 (narrow `MIN_YEAR` or a date helper)      | S      | 3.1      |
| 3   | `content-visibility` + `Intl` formatter cache                 | S      | 4.5      |
| 4   | `normalize` per layout; `contentBox` in `core/paper.ts`       | S      | 4.2      |
| 5   | Localized print messages; `getWeekInfo` defaults              | S–M    | 4.4      |
| 6   | Overflow badge, error boundary, import diagnostics            | S–M    | 4.7      |
| 7   | Persistence: split versions, migration list, no save on mount | M      | 4.3      |
| 8   | Component tests + one Playwright print test                   | M      | 5.2      |
| 9   | Layout modules (before adding a fourth layout)                | M      | 4.1      |
| 10  | `PlainDate` in `core/`                                        | M      | 4.6      |

Items 1–4 are each under an hour and independent. Item 9 changes the most files, so do it on a
quiet branch with no feature work in flight.

## 7. What not to do

At this size, these would cost more than they give:

- **A state library** (Redux, Zustand, Jotai). One reducer and two levels of props is the right
  amount of machinery; context would only hide the data flow.
- **A schema library** (Zod, Valibot) in place of the validator tables. The tables are about 60
  lines, compile-enforced, and already keep partial data. The one thing a schema library adds,
  error reporting, is covered by the small change in 4.7.
- **A router.** There's one screen; the active layout is state, not a location. (If shareable
  links are wanted later, encode the layout's file format in the URL hash. That reuses
  `parseConfigFile` and needs no router.)
- **Server-side PDF generation.** Browser printing with mm-sized pages already gives correct
  output in the target browser. A server would add hosting, fonts and a second renderer to keep
  in sync. Revisit only if non-Chromium output becomes a requirement.
- **Virtualizing the preview**, which breaks printing (see 4.5).
- **Generalizing `MonthGrid` and `MiniMonth` into one component.** They look alike but differ in
  intent (6 fixed rows vs. 4–6 visible rows, blank vs. gray adjacent days). Sharing the
  weekend/week-number logic in `core/` (already done) is the right amount of reuse.

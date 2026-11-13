# Architecture

Calendarium is a browser app (Vite + React + TypeScript) that generates a calendar to print on paper. This file covers how its code is organized, and `core/`, the folder every other one builds on. The other folders each have their own file:

| Folder             | Bounded context                             | Described in                               |
| ------------------ | ------------------------------------------- | ------------------------------------------ |
| `src/core/`        | Calendar, languages, paper (generic)        | [below](#srccore)                          |
| `src/layouts/`     | What each layout is and prints (core)       | [layouts.md](layouts.md)                   |
| `src/workspace/`   | The saved projects, storage, files, formats | [persistence.md](persistence.md)           |
| `src/preferences/` | The viewer's own settings                   | [ui.md](ui.md#preferences)                 |
| `src/ui/`          | React: sidebar, preview, dialogs            | [ui.md](ui.md), [printing.md](printing.md) |

The words used for each concept are in the [glossary](glossary.md); why the main decisions were made is in the [decision records](adr/README.md).

## Layers

Five folders, one per bounded context, from the bottom up: `core` ← `layouts` ← `workspace` ← `preferences` ← `ui`. Each imports only the folders below it, and only `ui/` uses React (a layout's UI, in `layouts/<layout-id>/ui/`, is `ui/`).

## Layouts as plugins

Each layout is one unit, like a plugin of the host (everything outside the layouts' folders): its files import only its own files and the host's, never another layout's, and the host knows a layout only through its entry points, its domain `layouts/<layout-id>/index.ts` and its UI's `layouts/<layout-id>/ui/index.ts`, imported by the registries alone (`layouts/index.ts`, `ui/layouts/registry.ts`). See [ADR 0005](adr/0005-layouts-are-plugins-behind-two-entry-points.md).

## The layers test

`src/layers.test.ts` fails on any import that breaks these rules, and on a layout folder not named after an id in `LAYOUT_IDS`. It lists the files with `import.meta.glob`, so `vite.config.ts` keeps Vitest from caching such a module (`freshGlobs`), which would otherwise miss files added since.

## `src/core/`

The generic subdomains: calendar, languages and paper, knowing nothing of layouts or settings.

### Calendar dates

- `buildMonth` always returns 6 weeks so every month has the same height.
- A date is a `PlainDate` (`{ year, month, day, weekday, key }`, `key` = `YYYY-MM-DD`, the React key, `weekday` a `Weekday`, 0 = Sunday … 6 as in `Date.getDay()`; a `CalendarDay` extends it, as does a `WeekDay`, seven of which make a `Week`), never a `Date`: `plainDate` builds one, a weekday's column from the week start is `weekdayColumn`, and `utcDate` (UTC midnight, `setUTCFullYear`, so no DST and years below 100 as written) is the only place a `Date` is built, for `Intl` formatting (`dateFormatter` formats in UTC). See [ADR 0001](adr/0001-calendar-dates-as-plain-records.md).
- The Gregorian range (`MIN_YEAR`, `isYear`) is in `calendar.ts`.

### Environment

What the app reads from where it runs, today's year and the browser's language, is an `Environment` (`environment.ts`), read only by `currentEnvironment` (the other `Date`) and passed down: `commonDefaults(env)`, each spec's `defaults(env)`, `defaultLayoutOptions`, `hasDefaultOptions` and `parseOptions` take it, the current one when not given, so tests pass a fixed one; `src/layers.test.ts` fails on a `new Date(` or `navigator` read anywhere else outside tests.

### Languages

- `locale.ts` lists the supported `LOCALES` and derives month/weekday names from `Intl.DateTimeFormat` (through the cached `dateFormatter`) and the default week start from `Intl.Locale` week data.
- Any other text printed on a page comes from the layout's own messages table (`layouts/<layout-id>/messages.ts`, like `DAY_PAGE_MESSAGES`), never a literal in a component, so a calendar is printed in one language; the app's own UI stays English. Each layout keeps its own table, even for text another layout prints too (the week and day layouts both have `week`), so layouts stay independent of one another. See [ADR 0006](adr/0006-printed-text-per-layout-per-locale.md) and [ADR 0007](adr/0007-english-only-editor.md).
- A new locale is one entry in `LOCALES`, its messages in each layout's table and its label in `LOCALE_OPTIONS` (`ui/sidebar/localeOptions.ts`, compile-enforced).

### Events

`events.ts` reads the event list (`CommonOptions.events`, its lines kept as typed, one `YYYY-MM-DD Name` each, year `0000` for every year; the textarea edits them as one text, `eventLines` splitting it back) into `CalendarEvent`s (`parseEvents`) and names a date's events (`eventNames`); `calendarModel` parses it once, and the month, week and day plans give each day of their month or year its `events`, and the year plan gives each month the `eventDays` its `MiniMonth` circles.

### Paper and validation

- The page setup (`PageSetup`, `Margins`, their `PAGE_VALIDATORS`) is in `paper.ts`; paper sizes are described in [printing.md](printing.md).
- The generic checks (`Validators`, `oneOf`, …) and `copyValid`, which applies a `Validators` table to untrusted data field by field, are in `validation.ts`.

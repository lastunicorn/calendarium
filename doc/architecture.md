# Architecture

Calendarium is a browser app (Vite + React + TypeScript) that generates a calendar to print on paper. This file covers how its code is organized, and `core/` and `ports/`, the folders every other one builds on. The other folders each have their own file:

| Folder             | Bounded context                             | Described in                               |
| ------------------ | ------------------------------------------- | ------------------------------------------ |
| `src/core/`        | Calendar, languages, paper (generic)        | [below](#srccore)                          |
| `src/ports/`       | What the app needs from outside it          | [below](#srcports)                         |
| `src/layouts/`     | What each layout is and prints (core)       | [layouts.md](layouts.md)                   |
| `src/workspace/`   | The saved projects, storage, files, formats | [persistence.md](persistence.md)           |
| `src/preferences/` | The viewer's own settings                   | [ui.md](ui.md#preferences)                 |
| `src/ui/`          | React: sidebar, main area, dialogs          | [ui.md](ui.md), [printing.md](printing.md) |

The words used for each concept are in the [glossary](glossary.md); why the main decisions were made is in the [decision records](adr/README.md).

## Layers

Six folders, from the bottom up: `core` ← `ports` ← `layouts` ← `workspace` ← `preferences` ← `ui`, each one bounded context but `ports`, which holds what the app needs from outside it ([below](#srcports)). Each imports only the folders below it, and only `ui/` uses React (a layout's UI, in `layouts/<layout-id>/ui/`, is `ui/`). Above `ports/`, a port is imported for its types only, except by `ui/` and the files above the layers (`main.tsx`), so only they pick its adapter.

## Layouts as plugins

Each layout is one unit, like a plugin of the host (everything outside the layouts' folders): its files import only its own files and the host's, never another layout's, and the host knows a layout only through its entry points, its domain `layouts/<layout-id>/index.ts` and its UI's `layouts/<layout-id>/ui/index.ts`, imported by the registries alone (`layouts/index.ts`, `ui/layouts/registry.ts`). See [ADR 0005](adr/0005-layouts-are-plugins-behind-two-entry-points.md).

## The layers test

`src/layers.test.ts` fails on any import that breaks these rules (`from '…'`, as an import or an export, `import '…'` or `import('…')`; one is of types only when it says `import type` or `export type`, or marks each of its names `type`), and on a layout folder not named after an id in `LAYOUT_IDS`. It lists the files with `import.meta.glob`, so `vite.config.ts` keeps Vitest from caching such a module (`freshGlobs`), which would otherwise miss files added since.

It also fails on a read of the environment outside the files allowed to make it, looked for in code, not in comments or strings, tests and their helpers in `src/test/` exempt:

| Read                                                     | Only in                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `new Date(`                                              | `core/calendar.ts` (`utcDate`), `ports/EnvironmentAccess.ts`                                                                    |
| `navigator`                                              | `ports/EnvironmentAccess.ts`                                                                                                    |
| `localStorage`, `sessionStorage`                         | `workspace/storage.ts`, `preferences/storage.ts`                                                                                |
| `crypto.`                                                | `ports/IdAccess.ts`                                                                                                             |
| `window.print`, `print()`                                | `ports/PrinterAccess.ts`                                                                                                        |
| A file's `.text()`, `createObjectURL`, `revokeObjectURL` | `ports/ProjectFileAccess.ts`                                                                                                    |
| `window.`, `document.` (the page)                        | `ui/`, a layout's `ui/` folder, the files above the layers (`main.tsx`), `ports/PrinterAccess.ts`, `ports/ProjectFileAccess.ts` |

Import cycles are left to lint: oxlint's `import/no-cycle` (`npm run lint`) fails on a cycle of value imports of any length, inside a folder too; a cycle of type imports alone is erased by the build and allowed.

## `src/core/`

The generic subdomains: calendar, languages and paper, knowing nothing of layouts or settings.

### Calendar dates

- `buildMonth` always returns 6 weeks so every month has the same height.
- A date is a `PlainDate` (`{ year, month, day, weekday, key }`, `key` = `YYYY-MM-DD`, the React key, `weekday` a `Weekday`, 0 = Sunday … 6 as in `Date.getDay()`; a `CalendarDay` extends it, as does a `WeekDay`, seven of which make a `Week`), never a `Date`: `plainDate` builds one, a weekday's column from the week start is `weekdayColumn`, and `utcDate` (UTC midnight, `setUTCFullYear`, so no DST and years below 100 as written) is the only place a `Date` is built for a date, for `Intl` formatting (`dateFormatter` formats in UTC); the other is the clock's read, in `EnvironmentAccess`. See [ADR 0001](adr/0001-calendar-dates-as-plain-records.md).
- The Gregorian range (`MIN_YEAR`, `isYear`) is in `calendar.ts`.

### Environment

What the app reads from where it runs, today's year and the browser's language, is an `Environment` (`environment.ts`), a value the composition root takes from the environment port (`EnvironmentAccess`, [below](#srcports)) and passes down: `commonDefaults(env)`, each spec's `defaults(env)`, `defaultLayoutOptions`, `hasDefaultOptions`, `parseOptions`, the parsing of a serialized project or a project file, and `loadWorkspace` require it, so nothing in the domain reads the clock, and tests pass a fixed one (`TEST_ENV`, `src/test/environment.ts`); `src/layers.test.ts` fails on a `new Date(` or `navigator` read anywhere but the port, outside tests ([the layers test](#the-layers-test)).

### Languages

- `locale.ts` lists the supported `LOCALES` and derives month/weekday names from `Intl.DateTimeFormat` (through the cached `dateFormatter`) and the default week start from `Intl.Locale` week data.
- Any other text printed on a page comes from the layout's own messages table (`layouts/<layout-id>/messages.ts`, like `DAY_PAGE_MESSAGES`), never a literal in a component, so a calendar is printed in one language; the app's own UI stays English. Each layout keeps its own table, even for text another layout prints too (the week and day layouts both have `week`), so layouts stay independent of one another. See [ADR 0006](adr/0006-printed-text-per-layout-per-locale.md) and [ADR 0007](adr/0007-english-only-editor.md).
- A new locale is one entry in `LOCALES`, its messages in each layout's table and its label in `LOCALE_OPTIONS` (`ui/sidebar/localeOptions.ts`, compile-enforced).

### Events

`events.ts` reads the event list (`CommonOptions.events`, its lines kept as typed, one `YYYY-MM-DD Name` each, year `0000` for every year; the textarea edits them as one text, `eventLines` splitting it back) into `CalendarEvent`s (`parseEvents`) and names a date's events (`eventNames`); `calendarModel` parses it once, and the month, week and day plans give each day of their month or year its `events`, and the year plan gives each month the `eventDays` its `MiniMonth` circles.

### Paper and validation

- The page setup (`PageSetup`, `Margins`, their `PAGE_VALIDATORS`) is in `paper.ts`; paper sizes are described in [printing.md](printing.md).
- The generic checks (`Validators`, `oneOf`, …) and `copyValid`, which applies a `Validators` table to untrusted data field by field, are in `validation.ts`.

## `src/ports/`

What the app needs from outside it: each external resource it reaches, behind a port named and shaped after the need, not after what fulfills it, so that two needs one resource meets are two ports. See [ADR 0015](adr/0015-external-resources-behind-ports.md).

- A port is an interface of functions in `ports/<Name>Access.ts`, beside its browser adapter, a `BROWSER_*` constant; a helper two adapters share has no `Access` suffix. `ports/index.ts` collects the ports in `Ports`, and the browser's adapters in `BROWSER_PORTS`.
- The UI takes the ports from `PortsContext` (`ui/ports.ts`, read by `usePorts()`), which `main.tsx`, the composition root, gives `BROWSER_PORTS`; the domain gets what it needs from them as arguments. Above `ports/`, outside `ui/`, a port is imported for its types only ([the layers test](#the-layers-test)).
- An adapter owns where things are kept (keys, the browser's names for its errors), the domain what they say (formats, versions, validation, which records to write). A port doesn't throw: its adapter names a failure, or drops it where the app needn't know.
- Tests give the app `testPorts()` (`src/test/ports.ts`), whose ports record what they are asked and reach nothing outside the test; each browser adapter is tested beside it.

| Port                | The need                                                                 | Browser adapter                                               |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `EnvironmentAccess` | What a new calendar starts from: this year, the user's language          | `BROWSER_ENVIRONMENT`: the system clock, `navigator.language` |
| `IdAccess`          | New project ids, unique across tabs, browsers and files                  | `BROWSER_IDS`: random v4 UUIDs, from `crypto.getRandomValues` |
| `ProjectFileAccess` | A project file the user chose, read unless too large; one saved for them | `BROWSER_PROJECT_FILES`: the file input's `File`, a download  |
| `PrinterAccess`     | The pages printed, on paper or to a PDF                                  | `BROWSER_PRINTER`: `window.print()`                           |

The other resources are read where [the layers test](#the-layers-test) says, until each moves behind its port.

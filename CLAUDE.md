# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is the index: the rules for a change are here, and the topic files in `doc/` are imported at the end, so they are read too.

# Calendarium

Browser app (Vite + React + TypeScript) that generates a calendar to print on paper.

## Commands

- `npm run dev` / `npm run build` / `npm test` / `npm run test:coverage` / `npm run test:e2e` (Playwright) / `npm run test:visual [base]` / `npm run lint` (oxlint) / `npm run format` (`format:check` to verify only) / `npm run typecheck`
- Single test file: `npx vitest run src/core/calendar.test.ts`; single test by name: `npx vitest run -t "leap year"`; one Vitest project: `npx vitest run --project unit` (or `component`)
- First e2e run needs `npx playwright install chromium firefox`.

## Documentation

| File                                                                                                                         | What it covers                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [doc/architecture.md](doc/architecture.md)                                                                                   | The five folders and their dependency rule, layouts as plugins, the layers test, `core/`       |
| [doc/layouts.md](doc/layouts.md)                                                                                             | The layout registry, specs, page plans, shared groups, options, adding a layout or an option   |
| [doc/persistence.md](doc/persistence.md)                                                                                     | Projects, the workspace, storage keys, the serialized project, files, versions, migrations     |
| [doc/ui.md](doc/ui.md)                                                                                                       | Preferences, the sidebar and its sections, the preview, dialogs, a layout's UI                 |
| [doc/printing.md](doc/printing.md)                                                                                           | Paper sizes, zoom, overflow, booklets, spreads, the print target                               |
| [doc/testing.md](doc/testing.md)                                                                                             | Unit, property, component and e2e tests, coverage, the visual comparison, CI                   |
| [doc/style.md](doc/style.md)                                                                                                 | Formatting, lint, CSS rules, event handlers                                                    |
| [doc/glossary.md](doc/glossary.md)                                                                                           | The domain language: one word per concept, with its name in code and its sidebar label         |
| [doc/release.md](doc/release.md)                                                                                             | Bumping the version, the changelog, the release, dependencies                                  |
| [doc/adr/](doc/adr/README.md)                                                                                                | Why the main decisions were made (not imported: read the one behind a rule before changing it) |
| `src/layouts/<layout-id>/README.md`                                                                                          | What each layout prints, its options and rules, its migrations, files and terms                |
| [doc/upgrading-dependencies.md](doc/upgrading-dependencies.md), [doc/typescript-strictness.md](doc/typescript-strictness.md) | Dependabot pull requests and major upgrades; the strict flags that stay off                    |

Update the file that describes what a change touches, in the same commit.

## Rules that always hold

- **Layers.** `core` ← `layouts` ← `workspace` ← `preferences` ← `ui`: each folder imports only the ones below it, and only `ui/` (and a layout's `ui/` folder) uses React. A layout imports only its own files and the host's, never another layout's; the host reaches it only through `layouts/<layout-id>/index.ts` and `layouts/<layout-id>/ui/index.ts`, from the registries. `src/layers.test.ts` enforces both.
- **Dates.** A date is a `PlainDate`, never a `Date`; `utcDate` is the only place a `Date` is built, and the `Environment` (`currentEnvironment`) the only place today's date or the browser's language is read.
- **Printed text.** Anything printed that `Intl` doesn't give comes from the layout's own messages table, never a literal; the app's own UI stays English.
- **Rules in the domain.** A rule on stored values goes in the layout's `normalize`, a rule on derived values in its page plan (`pages.ts`); components only draw the plan. Workspace changes go through `workspaceReducer`'s commands.
- **Options.** Every option is in a group, one per drawn element and sidebar section; it has a default and a validator (compile-enforced) and a control in its section. A fixed choice is a `const` array, `oneOf(X)` and `optionsFrom(X, labels)`.
- **Data formats.** Layout ids and persisted field names never change outside a major release, which appends a step to `PROJECT_MIGRATIONS` (and a layout's own step to its `migrations`). Untrusted data is read field by field (`copyValid`, `parseOptions`).
- **Printed pages.** Sized in `mm`/`pt`, never `px`; thin lines as borders, never gradients; colors from the `:root` variables in `index.css`.
- **Event handlers.** Named `handle<Element><Event>`, never inline in JSX, at module level when they use no props or state.
- **Words.** Use the glossary's term for each concept, in code, comments and docs.

## Before considering a change done

1. `npm run format` (also sorts imports), then the CI sequence: `npm run format:check`, `npm run lint` (no errors, no warnings), `npm run typecheck`, `npm run test:coverage` (never lower a threshold to pass), `npm run build`, `npm run test:e2e`.
2. `npm run test:visual`: a change meant to alter how pages look alters only the pages it means to (look at the diffs); any other alters none.
3. Tests for the change, where [doc/testing.md](doc/testing.md) puts them; a layout's new look-changing option gets a visual case.
4. A user-facing change is noted under `## Unreleased` in `CHANGELOG.md`; check the pending version against the latest tag before bumping ([doc/release.md](doc/release.md)).
5. The docs updated: the topic file in `doc/`, the layout's `README.md`, and an ADR when a lasting decision is made or reversed.

## Imported topics

@doc/architecture.md
@doc/layouts.md
@doc/persistence.md
@doc/ui.md
@doc/printing.md
@doc/testing.md
@doc/style.md
@doc/glossary.md
@doc/release.md

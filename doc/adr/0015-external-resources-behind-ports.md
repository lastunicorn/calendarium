# 0015. External resources behind ports, named after the need

- Status: Accepted
- Date: 2026-11-24

## Context

Each external resource the app reaches is read in one file: the clock and the browser's language in `core/environment.ts`, `localStorage` in the two `storage.ts`, the page in `ui/`, which `src/layers.test.ts` enforces. Others were not checked at all: the random numbers of project ids (`crypto`), the files opened and saved, the printer. Their tests stub globals (`localStorage`, `URL`), read the real clock, or don't test the call at all (Print, which jsdom lacks). [0010](0010-no-classes-no-di.md) kept the workspace repository without an interface until a second implementation appeared. The test doubles are one; the per-tab open project and cross-tab sync, and the File System Access API, would be others.

A port could be shaped after the resource (one key–value store for everything `localStorage` holds) or after what the app needs from it (the user's documents, the viewer's preferences). The first leaks storage keys into the domain and gives both needs one contract, though a failed save of documents must be reported and one of preferences can be dropped.

## Decision

Every external resource the app reaches is behind a port in `src/ports/`, named and shaped after what the app needs, not what fulfills it: two needs met by one resource are two ports, sharing a helper that is not a port (without the `Access` suffix). The ports: `WorkspaceAccess` (the projects kept in this browser, and the open one), `PreferencesAccess`, `EnvironmentAccess` (the `Environment`: this year, the browser's language), `IdAccess` (new project ids, not random numbers), `ProjectFileAccess` (a project file chosen or saved; not `FileSystemAccess`, the name of a browser API that could become one of its adapters, and a file system the app never reaches) and `PrinterAccess`.

- A port is an interface of functions in `<Name>Access.ts`, beside its browser adapter, a `BROWSER_*` constant; `ports/index.ts` collects them (`Ports`, `BROWSER_PORTS`). No classes, no container: the UI takes them from one React context (`ui/ports.ts`), `main.tsx` providing the browser's, and passes them to the domain as arguments, as it does the `Environment`.
- `ports` is a layer between `core` and `layouts`. Above it, outside `ui/` and the files above the layers, a port is imported for its types only, so only the composition root picks an adapter.
- An adapter owns where things are kept (storage keys, their old layouts, the browser's error names); the domain owns what they say (formats, versions, migrations, validation, which records to back up or write).
- Ports don't throw: an adapter names a failure, or drops it where the app doesn't need to know.

## Consequences

- Tests give the app ports that record what they are asked (`testPorts()`, `src/test/ports.ts`) instead of stubbing globals; the browser adapters are tested on their own.
- One folder lists every side effect, each with its contract.
- The storage layout moves from the repositories to the adapters, with the tests that check it; the repositories keep their rules.
- A resource moves behind its port one at a time; until it has, it is read where [architecture.md](../architecture.md#the-layers-test) says.
- Revisit a port's shape when a second adapter needs more than it gives (an asynchronous store, a file picker).

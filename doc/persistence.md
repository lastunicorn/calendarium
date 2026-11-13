# Persistence: projects, storage, files and formats

`src/workspace/` holds the saved projects, apart from the viewer preferences ([ui.md](ui.md#preferences)).

## Project

A `Project` (`Project.ts`) is one calendar being made:

- its `id` (a `ProjectId`, a lowercase v4 UUID, `isProjectId`; `newProjectId` builds one from `crypto.getRandomValues`, since `crypto.randomUUID` needs a secure context and the release zip may be served over plain HTTP);
- its `name` (kept as typed, `''` for none, trimmed only to show it or name a file, and never printed: the printed title is `header.title`);
- its `layout`, chosen when it is created and never changed afterwards;
- and that layout's `options`.

`Project<ProjectId | null>` is one read from a file that has no id yet.

## Workspace

The `Workspace` (`Workspace.ts`; `defaultWorkspace` is empty) holds every project kept in this browser, by id, and the `open` one, `null` when there is none: `openProject(workspace)` gives it, and `projectList` orders the projects as the Open project dialog lists them (by trimmed name, the unnamed ones last, then by id).

`Workspace` is the aggregate root: it changes only through the commands of the pure `workspaceReducer`, each changed project passing through its layout's `normalize`, so what a command means is decided there, not in the UI:

- `createProject`;
- `openProject`;
- `renameProject`;
- `updateOptions` by a `Patch`, a deep partial that reaches a nested object's field alone, `applyPatch` in `core/data.ts`, ignored for another layout than the open project's;
- `resetOptions`, which keeps the id and name;
- `deleteProject`, which opens the deleted open project's neighbor in `projectList`;
- and `importProject`, which adds a project or replaces the one with its id.

Ids, and the `Environment` `createProject` and `resetOptions` take the defaults in, come in the commands, made by `ui/useWorkspace`, so the reducer stays pure.

## Storage

`useWorkspace` holds the workspace and saves it after each change through `storage.ts`, its repository: `loadWorkspace`, and `saveWorkspace(previous, next)`, which writes only what changed.

Storage keeps one key per project, so two tabs editing different projects don't overwrite each other (see [ADR 0002](adr/0002-one-storage-key-per-project.md)):

| Key                               | Holds                                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `calendarium-project:<id>`        | One serialized project, compact; the key's id is authoritative, and records it can't read are skipped and left as they are |
| `calendarium-project-backup:<id>` | A record a later version wrote, kept before this one overwrites it                                                         |
| `calendarium-workspace`           | `{ version, app, open }`, also the marker that the 5.x data was migrated                                                   |

The prefixes matter, the GitHub Pages origin being shared with the user's other project pages.

### The 5.x migration

The 5.x data (`calendarium-config`) is migrated on the first load without a workspace record, the one load that writes (the projects first and the record last, so the ids stay put and StrictMode's second load just loads them): an unnamed project of each layout whose options differ from its defaults, the year aside, and always of the layout that was shown, which opens; `calendarium-config` is left as it is, for a rollback to 5.x.

## The serialized project

A file and a stored project are the same JSON, the serialized project (`projectDocument.ts`, its only reader and writer: `PROJECT_FORMAT`, `serializeProject(project, { pretty })`, `parseProjectDocument`): `{ format, version, app, id, name, layout, options }`, the tags beside the options so no option can collide with one, the options' groups in sidebar order (the key order of each layout's `defaults()`), every value written, defaults included, so a change of default never changes how an old calendar prints.

Reading one:

- another format, or `PROJECT_FORMAT` before 6, is not a project (`notProject`);
- an unknown layout is rejected with its own reason (`unknownLayout`, a later version's);
- a missing or invalid id reads as `null`, a name that isn't a string as `''`;
- and the options are read field by field by `parseOptions`, `ignored` listing the invalid ones by path (`content.schedule.firstHour`).

## Project files

`projectFile.ts` keeps what is particular to files:

- the file name (`projectFile`: the project's name in lowercase, whitespace and `\/:*?"<>|` as `-`, or `calendar-<layout>-<year>.json` when it has none);
- and reading a file (`readProjectFile(file)`, refusing one over `MAX_PROJECT_FILE_SIZE`, 1 MB, unread, then `parseProjectFile(text, fileName)`, an `OpenedProjectFile`), a legacy file's project being named after the file, unless the app generated that name.

## Versions

The app version in `package.json` (semver) is the only version to edit; `workspace/version.ts` exposes it as `APP_VERSION` (shown in the sidebar) and its major part as `FORMAT_VERSION`, the version of the data format (see [ADR 0003](adr/0003-format-version-is-the-major-version.md)).

- Stored projects and files are one shape, the serialized project (`{ format, version, app, id, name, layout, options }`, `format` being `PROJECT_FORMAT`), tagged with both, as is the workspace record (`{ version, app, open }`).
- Data without a valid `version` (from `FIRST_FORMAT_VERSION` = 3 up) is ignored, and a file without a known `format` is rejected.
- A release bumps `package.json`: a minor or patch for anything older builds still read correctly (adding a field needs no major), a major for a change that would misread older data (renamed or restructured field or value). How to release is in [release.md](release.md).

## Migrations

- A major release appends one step to `PROJECT_MIGRATIONS` in `workspace/migrations.ts`, which storage and files share, and describes the new shape in its doc comment; a test fails until `FIRST_PROJECT_VERSION` (6) plus its length reaches the new major (the workspace record needs a step list only once its shape changes).
- The formats of 3 to 5 are frozen in `workspace/legacy.ts`: their steps (`LEGACY_STORAGE_MIGRATIONS`, `LEGACY_FILE_MIGRATIONS`), the old layout ids (`LEGACY_LAYOUT_IDS`) and the conversions to 6, `legacyFile` (files tagged `LEGACY_FILE_FORMAT`, versions 3 to 5 only) and `legacyWorkspace`, which map the id first, then apply each layout's step from 5.
- A layout's options changing is a step in that layout's `migrations`, keyed by the version it starts from: steps keyed 3 to 5 run through both legacy paths, steps from 6 through `PROJECT_MIGRATIONS` (`layoutInProject(version)`; a step that also changes the shape does that around it; the helpers in `layouts/migrations.ts`, `groupFields`, `commonGroups`, `footerGroup` and `scheduleGroup`, move flat fields into their groups); a test fails if a layout's step is not applied.

## Format fixtures

Every released format is also tested against files that release wrote itself, `src/workspace/fixtures/` (a project file of each layout with every option changed, and the 3 to 5 stored settings), each read through the real path and compared with its JSON snapshot by `workspace/fixtures.test.ts`: `scripts/format-fixtures/generate.sh <tag>…` writes a release's fixtures in a temporary worktree of it, by its own code, the current major's from `HEAD` until released; a test fails until each format version has its fixtures, and a changed snapshot must be meant and said in its commit (`fixtures/README.md`).

## Data from a later version

Data from a later version (a later major, or a later `app` of the same major) is read best-effort:

- a project is written only once it changes (`saveWorkspace` writes only what changed, and loading writes nothing but the one 5.x migration);
- a later version's record is backed up under `calendarium-project-backup:<id>` before being overwritten;
- and an opened file shows a notice.

# 0002. One storage key per project

- Status: Accepted
- Date: 2026-11-12

## Context

6.0 keeps several projects in the browser's `localStorage`. Stored under one key, the whole workspace would be read and rewritten on every change, so two tabs editing different projects would overwrite each other's work, the last write winning. A later version's data in the same record would also be lost as soon as this version saved anything. The GitHub Pages origin is shared with the user's other project pages, so keys must not collide with theirs.

## Decision

Each project is stored under its own key, `calendarium-project:<id>`, as one serialized project, the same JSON as a project file; the key's id is authoritative. A separate `calendarium-workspace` record holds only `{ version, app, open }`. `saveWorkspace(previous, next)` writes only what changed. A record a later version wrote is copied to `calendarium-project-backup:<id>` before this version overwrites it, and records it can't read are skipped and left as they are. Every key starts with `calendarium-`.

## Consequences

- Two tabs on different projects don't lose each other's changes; two tabs on the same project still do, the last write winning.
- The open project is shared by all tabs, through the one workspace record.
- Loading lists every key with the prefix, which is cheap at the number of projects a person keeps.
- A rollback to an older version, or a newer one coming back, finds its data intact or backed up.

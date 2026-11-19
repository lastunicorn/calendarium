# 0013. The stored data says document

- Status: Accepted
- Date: 2026-11-19

## Context

[0012](0012-the-ui-calls-a-project-a-document.md) made the UI call a project a document and kept project in the code and the stored data, `PROJECT_FORMAT` and the storage keys included, to spare a migration and a type shadowing the DOM's `Document`. Unlike the code, the stored data is seen by users: the format tag is the first line of every file the app saves, which the UI calls a document file, and the storage keys show in the browser's developer tools, so both named the concept by the word the user never sees. 6.0.0, which introduced both, is not released yet, so they can still change without a migration. `calendarium/calendar-document` was considered and rejected: the `calendarium/` namespace already says it holds a calendar.

## Decision

`PROJECT_FORMAT` is `calendarium/document`, and a project is stored under `calendarium-document:<id>`, backed up under `calendarium-document-backup:<id>`. The code keeps project (`Project`, `PROJECT_FORMAT`, `PROJECT_KEY_PREFIX`), as 0012 decided.

## Consequences

- Files and storage name the concept by the UI's word; the code still uses another, as under 0012.
- Records and files written by unreleased 6.0.0 builds (`calendarium/project`, `calendarium-project:<id>`) are no longer read, and are left as they are; no released version wrote them.
- Once 6.0.0 is released, renaming the format or the keys again needs a major release and a migration step.

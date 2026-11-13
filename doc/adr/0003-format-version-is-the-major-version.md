# 0003. The data format's version is the app's major version

- Status: Accepted
- Date: 2026-10-22

## Context

Stored projects and project files outlive the build that wrote them: a file is shared, a browser keeps its data across releases, and someone may open a file in an older build. Each reader must know whether it can read what it is given, and each release must know whether it needs a migration step. Two independent version numbers, the app's and the format's, would have to be kept in step by hand.

## Decision

`package.json`'s version is the only version to edit. Its major part is `FORMAT_VERSION`, the data format's version (`workspace/version.ts`); data is tagged with both (`version` and `app`). A change that older builds would misread (a renamed or restructured field or value) is a major release and appends one step to `PROJECT_MIGRATIONS`; anything older builds still read correctly, adding a field included, is a minor or patch. A test fails until `FIRST_PROJECT_VERSION` plus the number of steps reaches the current major, and released formats are tested against fixtures their own release wrote.

## Consequences

- One number to bump, and semver's meaning for users matches its meaning for their data.
- Data from a later major, or a later `app` of the same major, is recognized and read best-effort, and written only once it changes.
- Every major costs a migration step and its fixtures, which keeps breaking changes rare and deliberate.
- Formats before 6 are frozen in `workspace/legacy.ts` and are never edited again.

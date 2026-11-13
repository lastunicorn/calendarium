# Format fixtures

Files each release wrote itself, kept as they were written: the contract that the app keeps reading what users saved. `fixtures.test.ts` reads each through the real path and compares what it reads as with its snapshot in `__snapshots__/`.

- `file-v<app>-<layout>.json`: a project file of each layout, as that release saved it, the layout by its id then. Every option is changed from its default, as far as the release accepts the change of that option alone; a rule tying options together may bring one back (the spine of a landscape booklet). The year (2031) and the language (`fr-FR`) are set, so nothing depends on when or where the files were made. A legacy file's project is named after its file name.
- `storage-v<app>.json`: the stored settings (`calendarium-config`) of 3 to 5, every layout's options so changed and the third layout shown, read as `legacyWorkspace` reads them, then each layout's options by `parseOptions`.

There is one release per format version: the last of each major, which has every option of that format (3.2.0, 4.6.0, 5.0.0), and the current major's.

## Writing them

`scripts/format-fixtures/generate.sh <tag>…` checks each release out in a temporary worktree and runs `scripts/format-fixtures/generate.test.ts` there, so the release's own code writes its files; it lists the options it could not change. Once released, a version's fixtures are never written again, nor edited.

- The current major's fixtures come from `HEAD` (the last commit, not the working tree) until it is released: write them again from its tag then, if they changed.
- A new major: write its fixtures from `HEAD`, and those of the previous major's last release, which may have options its first lacked, beside the earlier ones. A test fails until each format version has its files and, before 6, its stored settings.
- Then `npm test` writes the new snapshots: review them, as JSON.

## When a snapshot changes

A change to the migrations or to an option's reading that changes how an old file reads fails its test with a JSON diff. Look at it: if the change is meant, update the snapshots (`npx vitest run --project unit -u src/workspace/fixtures.test.ts`) and say why in the commit. `ignored` lists the fields a release wrote that are dropped.

# Releasing

What a version number means for the stored data, and when a change needs a major, is in [persistence.md](persistence.md#versions).

## The release

A release is a published GitHub release tagged `vX.Y.Z` matching `package.json` (only that deploys, `deploy-pages.yml`, which also attaches the built site to the release as `calendarium-X.Y.Z.zip`).

## Bumping the version

Before bumping, compare `package.json` with the latest tag on the remote (`git fetch --tags`, then `git describe --tags --abbrev=0`):

- equal means that version is released and a change needs a new bump;
- higher means a bump is pending, and a change only raises it if it needs a larger part (a breaking change on a pending minor or patch makes it the next major), while a further breaking change on a pending major amends that major's migration steps instead of appending new ones.

## The changelog

Note every user-facing change under `## Unreleased` in `CHANGELOG.md` (Added, Changed, Fixed; a major also says what older settings and files become), and on a release rename that section to the version and its date, starting a new empty `## Unreleased` above it.

## The release check

`npm run check:release` (`scripts/check-release.ts`, tested by `scripts/check-release.test.ts`) checks the version in `package.json` and `CHANGELOG.md` against the latest `v*` tag reachable from `HEAD`, and fails, naming each problem, when:

- `CHANGELOG.md` doesn't start with `## Unreleased`, or a version's heading isn't `## X.Y.Z — YYYY-MM-DD`, is repeated, or isn't below a higher version's;
- the version is below the latest tag, a section is above the version, or the latest tag's version has no section;
- the version is released (equal to the latest tag) and `## Unreleased` has notes: a change without a bump;
- the version is pending (above the latest tag, or no tag yet) and `## Unreleased` has no notes and the version no section: a bump without notes;
- or the pending version's section is written and `## Unreleased` has notes too.

Empty `###` headings count as no notes. CI runs it on every push to `master` and pull request, and the deploy before building; it needs the tags (`git fetch --tags` locally, `fetch-depth: 0` in the workflows).

## Releasing a version

1. Fetch the tags and check the state, on an up-to-date `master` with a clean tree: the check must say the version is pending (if it asks for a bump, bump `package.json` as [above](#bumping-the-version), with `npm version <major|minor|patch> --no-git-tag-version`).

   ```bash
   git switch master && git pull && git fetch --tags
   npm run check:release
   ```

2. Read `## Unreleased` again as the release notes: every user-facing change, under Added, Changed or Fixed, and for a major what older settings and files become.
3. A major: write its format fixtures from `HEAD` again if they changed since (`src/workspace/fixtures/README.md`), and review the snapshots.

   ```bash
   scripts/format-fixtures/generate.sh HEAD
   npm test
   ```

4. In `CHANGELOG.md`, rename `## Unreleased` to the version and today's date (`## 6.0.0 — 2026-11-14`), and start a new empty `## Unreleased` above it; `npm run check:release` still passes, the section now written.
5. Run the checks of a change (`CLAUDE.md`), then commit and push.

   ```bash
   git commit -am "Release 6.0.0"
   git push
   ```

6. Once CI passes on that commit, tag it and push the tag; the check now says the version is released.

   ```bash
   git tag v6.0.0
   git push origin v6.0.0
   npm run check:release
   ```

7. Publish the release, its notes the version's section of `CHANGELOG.md` (without its heading); publishing deploys the site and attaches the zip.

   ```bash
   awk '/^## 6\.0\.0 /{f=1; next} /^## /{f=0} f' CHANGELOG.md > notes.md
   gh release create v6.0.0 --title "6.0.0" --notes-file notes.md
   rm notes.md
   ```

8. Check the deploy (`gh run watch`), the online app's version in the sidebar, and the zip among the release's assets.

## Dependencies

Dependabot (`.github/dependabot.yml`) opens weekly pull requests for the npm packages and the workflows' actions; what to check before merging one, and the notes on each major upgrade, are in [upgrading-dependencies.md](upgrading-dependencies.md).

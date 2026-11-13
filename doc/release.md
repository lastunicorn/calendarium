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

## Dependencies

Dependabot (`.github/dependabot.yml`) opens weekly pull requests for the npm packages and the workflows' actions; what to check before merging one, and the notes on each major upgrade, are in [upgrading-dependencies.md](upgrading-dependencies.md).

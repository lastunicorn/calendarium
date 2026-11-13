#!/bin/sh
# Writes the format fixtures of each release given (tags, or `HEAD` for the version not yet
# released) into src/workspace/fixtures/: checks the release out in a temporary git worktree and
# runs generate.test.ts there, so its own code writes its files. Run it once per new major, for its
# last release before the next (and once for the pending major, from `HEAD`, before it is
# released); a released version's fixtures are never written again. Then run `npm test` to write
# the new snapshots, and review them.
set -eu
cd "$(dirname "$0")/../.."
root=$PWD
out="$root/src/workspace/fixtures"
[ $# -gt 0 ] || {
	echo "Usage: $0 <tag or HEAD>…" >&2
	exit 2
}

work=$(mktemp -d "${TMPDIR:-/tmp}/calendarium-fixtures.XXXXXX")
cleanup() {
	git worktree remove --force "$work/release" 2>/dev/null || true
	rm -rf "$work"
}
trap cleanup EXIT
trap 'exit 130' INT TERM

for ref in "$@"; do
	commit=$(git rev-parse --verify --quiet "$ref^{commit}") || {
		echo "Not a commit: $ref" >&2
		exit 2
	}
	echo "Writing the fixtures of $ref…"
	git worktree add --detach --quiet "$work/release" "$commit"
	# The release shares the installed packages, unless it locks others.
	if git diff --quiet "$commit" -- package-lock.json; then
		ln -s "$root/node_modules" "$work/release/node_modules"
	else
		(cd "$work/release" && npm ci --no-audit --no-fund --loglevel=error)
	fi
	cp scripts/format-fixtures/generate.test.ts "$work/release/src/formatFixtures.gen.test.ts"
	(cd "$work/release" && FIXTURES_OUT="$out" npx vitest run --project unit \
		src/formatFixtures.gen.test.ts)
	git worktree remove --force "$work/release"
done

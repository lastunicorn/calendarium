#!/bin/sh
# Shows which printed pages the working tree changes from a base commit (`HEAD` by default; a
# branch, a tag or `HEAD~1` as well): builds both, takes e2e/visual.spec.ts's screenshots of the
# base's build, then compares the working tree's with them. Further arguments go to the comparing
# `playwright test`. On a difference it fails, test-results/ holding each changed page's expected,
# actual and diff images. Nothing is kept: both builds and the screenshots are temporary.
set -eu
cd "$(dirname "$0")/.."
root=$PWD
base=${1:-HEAD}
[ $# -gt 0 ] && shift
commit=$(git rev-parse --verify --quiet "$base^{commit}") || {
	echo "Not a commit: $base" >&2
	exit 2
}

work=$(mktemp -d "${TMPDIR:-/tmp}/calendarium-visual.XXXXXX")
cleanup() {
	git worktree remove --force "$work/base" 2>/dev/null || true
	rm -rf "$work"
}
trap cleanup EXIT
trap 'exit 130' INT TERM

echo "Building $base ($(git rev-parse --short "$commit")) and the working tree…"
git worktree add --detach --quiet "$work/base" "$commit"
# The base shares the installed packages, unless it locks others.
if git diff --quiet "$commit" -- package-lock.json; then
	ln -s "$root/node_modules" "$work/base/node_modules"
else
	(cd "$work/base" && npm ci --no-audit --no-fund --loglevel=error)
fi
(cd "$work/base" && npx vite build --outDir "$work/base-dist" --emptyOutDir --logLevel warn)
npx vite build --outDir "$work/head-dist" --emptyOutDir --logLevel warn

echo "Taking the screenshots of $base…"
VISUAL_DIST="$work/base-dist" VISUAL_BASELINES="$work/screenshots" \
	npx playwright test e2e/visual.spec.ts --update-snapshots=all --reporter=dot

echo "Comparing the working tree with them…"
status=0
VISUAL_DIST="$work/head-dist" VISUAL_BASELINES="$work/screenshots" \
	npx playwright test e2e/visual.spec.ts "$@" || status=$?
[ $status -eq 0 ] || echo "Pages changed from $base: see test-results/ (or run with --reporter=html)." >&2
exit $status

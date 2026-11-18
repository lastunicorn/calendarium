// Checks that the version in `package.json` and `CHANGELOG.md` agree with the latest release tag,
// as `doc/release.md` says they must: run by CI on every push and pull request, and before a
// deploy, with `npm run check:release` (`node scripts/check-release.ts`, Node stripping the
// types). Needs the tags: `git fetch --tags` locally, `fetch-depth: 0` in CI.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

/** What the check reads: the `package.json` version, the latest tag (`null` for none), the changelog. */
export interface ReleaseState {
	version: string
	latestTag: string | null
	changelog: string
}

type Version = readonly [number, number, number]

const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const UNRELEASED = 'Unreleased'
/** A released version's heading: `## 5.0.0 — 2026-10-24`. */
const VERSION_HEADING = /^(\S+) — (\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))$/

function parseVersion(text: string): Version | null {
	const match = VERSION.exec(text)
	return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null
}

function compareVersions(a: Version, b: Version): number {
	return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

interface Section {
	heading: string
	/** The lines under the heading, up to the next `## ` heading. */
	body: string[]
}

/** The changelog's `## ` sections, in order; what comes before the first is its introduction. */
function changelogSections(changelog: string): Section[] {
	const sections: Section[] = []
	for (const line of changelog.split(/\r?\n/)) {
		if (line.startsWith('## ')) sections.push({ heading: line.slice(3).trim(), body: [] })
		else sections.at(-1)?.body.push(line)
	}
	return sections
}

/** Whether a section has notes, not just blank lines and empty `###` headings. */
function hasNotes(section: Section): boolean {
	return section.body.some((line) => line.trim() !== '' && !line.startsWith('#'))
}

/** What is wrong with the release state, each problem one sentence; none when it is consistent. */
export function releaseProblems({ version, latestTag, changelog }: ReleaseState): string[] {
	const problems: string[] = []
	const current = parseVersion(version)
	if (!current) problems.push(`package.json's version '${version}' is not MAJOR.MINOR.PATCH.`)
	const released = latestTag === null ? null : parseVersion(latestTag.replace(/^v/, ''))
	if (latestTag !== null && (!released || !latestTag.startsWith('v'))) {
		problems.push(`The latest tag '${latestTag}' is not vMAJOR.MINOR.PATCH.`)
	}

	const sections = changelogSections(changelog)
	const unreleased = sections[0]?.heading === UNRELEASED ? sections[0] : null
	if (!unreleased) problems.push(`CHANGELOG.md does not start with a '## ${UNRELEASED}' section.`)

	const versions = new Map<string, Version>()
	let previous: Version | null = null
	for (const { heading } of unreleased ? sections.slice(1) : sections) {
		const match = VERSION_HEADING.exec(heading)
		const parsed = match ? parseVersion(match[1]) : null
		if (!match || !parsed) {
			problems.push(
				`CHANGELOG.md's heading '## ${heading}' is not '## MAJOR.MINOR.PATCH — YYYY-MM-DD'.`,
			)
			continue
		}
		if (versions.has(match[1])) problems.push(`CHANGELOG.md has two sections for ${match[1]}.`)
		else if (previous && compareVersions(parsed, previous) >= 0) {
			problems.push(`CHANGELOG.md's section for ${match[1]} is not below a lower version's.`)
		}
		versions.set(match[1], parsed)
		previous = parsed
	}
	if (!current || (latestTag !== null && !released) || !unreleased) return problems

	const newest = [...versions].at(0)
	if (newest && compareVersions(newest[1], current) > 0) {
		problems.push(
			`CHANGELOG.md has a section for ${newest[0]}, above package.json's ${version}.`,
		)
	}
	if (released && !versions.has(released.join('.'))) {
		problems.push(`CHANGELOG.md has no section for the released ${released.join('.')}.`)
	}

	const order = released ? compareVersions(current, released) : 1
	if (order < 0) {
		problems.push(`package.json's version ${version} is below the latest tag ${latestTag}.`)
	} else if (order === 0) {
		if (hasNotes(unreleased)) {
			problems.push(
				`'## ${UNRELEASED}' has notes but ${version} is released: bump package.json's version.`,
			)
		}
	} else if (versions.has(version)) {
		if (hasNotes(unreleased)) {
			problems.push(
				`'## ${UNRELEASED}' has notes but ${version}'s section is already written: move them into it, or bump package.json's version.`,
			)
		}
	} else if (!hasNotes(unreleased)) {
		problems.push(
			`package.json's version ${version} is not released yet, but '## ${UNRELEASED}' has no notes.`,
		)
	}
	return problems
}

/** The latest `v*` tag reachable from `HEAD`, as `doc/release.md` compares with; `null` for none. */
function latestTag(): string | null {
	try {
		return execFileSync('git', ['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim()
	} catch {
		return null
	}
}

if (import.meta.main) {
	const root = new URL('..', import.meta.url)
	const { version } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as {
		version: string
	}
	const state = {
		version,
		latestTag: latestTag(),
		changelog: readFileSync(new URL('CHANGELOG.md', root), 'utf8'),
	}
	const problems = releaseProblems(state)
	for (const problem of problems) console.error(problem)
	if (problems.length > 0) process.exit(1)
	process.stdout.write(
		state.latestTag === `v${version}`
			? `${version} is released; CHANGELOG.md agrees.\n`
			: `${version} is pending (latest tag ${state.latestTag ?? 'none'}); CHANGELOG.md agrees.\n`,
	)
}

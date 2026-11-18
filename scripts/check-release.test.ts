import { describe, expect, test } from 'vitest'

import { releaseProblems, type ReleaseState } from './check-release.ts'

const RELEASED = `# Changelog

Intro.

## 5.0.0 — 2026-10-24

### Added

- Zoom.

## 4.6.0 — 2026-10-23

- Preferences.
`

/** `released` with an Unreleased section holding `unreleased` above its first version's. */
function changelog(unreleased: string, released = RELEASED): string {
	const section = `## Unreleased\n\n${unreleased}\n\n`
	const first = released.search(/^## /m)
	return first < 0
		? `${released}\n${section}`
		: released.slice(0, first) + section + released.slice(first)
}

function problems(state: Partial<ReleaseState>): string[] {
	return releaseProblems({
		version: '5.0.0',
		latestTag: 'v5.0.0',
		changelog: changelog(''),
		...state,
	})
}

describe('releaseProblems', () => {
	test('accepts a released version with nothing unreleased', () => {
		expect(problems({})).toEqual([])
	})

	test('accepts empty headings under Unreleased as no notes', () => {
		expect(problems({ changelog: changelog('### Added\n\n### Fixed\n') })).toEqual([])
	})

	test('accepts a pending bump with notes', () => {
		expect(
			problems({ version: '5.1.0', changelog: changelog('### Added\n\n- Projects.') }),
		).toEqual([])
	})

	test('accepts a pending bump whose section is written, ready to tag', () => {
		const prepared = changelog(
			'',
			RELEASED.replace('## 5.0.0', '## 6.0.0 — 2026-11-14\n\n- Projects.\n\n## 5.0.0'),
		)
		expect(problems({ version: '6.0.0', changelog: prepared })).toEqual([])
	})

	test('accepts the first release, with no tag yet', () => {
		expect(
			problems({ latestTag: null, changelog: changelog('- First.', '# Changelog\n') }),
		).toEqual([])
	})

	test('rejects notes on a released version: a change without a bump', () => {
		expect(problems({ changelog: changelog('- Projects.') })).toEqual([
			"'## Unreleased' has notes but 5.0.0 is released: bump package.json's version.",
		])
	})

	test('rejects a pending bump without notes', () => {
		expect(problems({ version: '5.0.1' })).toEqual([
			"package.json's version 5.0.1 is not released yet, but '## Unreleased' has no notes.",
		])
	})

	test("rejects notes beside the pending version's written section", () => {
		const prepared = changelog(
			'- Late.',
			RELEASED.replace('## 5.0.0', '## 6.0.0 — 2026-11-14\n\n- Projects.\n\n## 5.0.0'),
		)
		expect(problems({ version: '6.0.0', changelog: prepared })).toEqual([
			"'## Unreleased' has notes but 6.0.0's section is already written: move them into it, or bump package.json's version.",
		])
	})

	test('rejects a version below the latest tag', () => {
		expect(problems({ version: '4.6.0' })).toEqual([
			"CHANGELOG.md has a section for 5.0.0, above package.json's 4.6.0.",
			"package.json's version 4.6.0 is below the latest tag v5.0.0.",
		])
	})

	test('rejects a section above the version', () => {
		const ahead = changelog(
			'',
			RELEASED.replace('## 5.0.0', '## 6.0.0 — 2026-11-14\n\n## 5.0.0'),
		)
		expect(problems({ changelog: ahead })).toEqual([
			"CHANGELOG.md has a section for 6.0.0, above package.json's 5.0.0.",
		])
	})

	test('rejects a released version without a section', () => {
		expect(
			problems({ changelog: changelog('', RELEASED.replace('## 5.0.0 — 2026-10-24', '')) }),
		).toEqual(['CHANGELOG.md has no section for the released 5.0.0.'])
	})

	test('rejects a heading without a date', () => {
		const undated = changelog('', RELEASED.replace('## 4.6.0 — 2026-10-23', '## 4.6.0'))
		expect(problems({ changelog: undated })).toEqual([
			"CHANGELOG.md's heading '## 4.6.0' is not '## MAJOR.MINOR.PATCH — YYYY-MM-DD'.",
		])
	})

	test('rejects sections out of order or repeated', () => {
		const swapped = changelog('', RELEASED.replace('## 4.6.0', '## 5.1.0'))
		expect(problems({ version: '5.1.0', changelog: swapped, latestTag: 'v5.1.0' })).toContain(
			"CHANGELOG.md's section for 5.1.0 is not below a lower version's.",
		)
		const repeated = changelog('', RELEASED.replace('## 4.6.0', '## 5.0.0'))
		expect(problems({ changelog: repeated })).toEqual([
			'CHANGELOG.md has two sections for 5.0.0.',
		])
	})

	test('rejects a changelog without Unreleased first', () => {
		expect(problems({ changelog: RELEASED })).toEqual([
			"CHANGELOG.md does not start with a '## Unreleased' section.",
		])
	})

	test('rejects malformed versions and tags', () => {
		expect(problems({ version: '5.0' })).toEqual([
			"package.json's version '5.0' is not MAJOR.MINOR.PATCH.",
		])
		expect(problems({ latestTag: 'v5.0.0-beta' })).toEqual([
			"The latest tag 'v5.0.0-beta' is not vMAJOR.MINOR.PATCH.",
		])
	})
})

import { describe, expect, it } from 'vitest'

import type { Environment } from '../core/environment'
import { layoutSpec, type LayoutId } from '../layouts'
import { parseOptions } from '../layouts/LayoutSpec'
import { legacyWorkspace } from './legacy'
import { FIRST_FORMAT_VERSION } from './migrations'
import { parseProjectFile } from './projectFile'
import { FORMAT_VERSION } from './version'

// Every released file and storage format, read from files each release wrote itself
// (`scripts/format-fixtures/generate.sh`, see `fixtures/README.md`), never rebuilt from memory:
// each file's every option changed from its default. What each reads as is its snapshot in
// `fixtures/__snapshots__/`, the contract with the users' old files and settings, invalid fields
// (`ignored`) included: a change to one must be meant, and said in its commit.

const FIXTURES = import.meta.glob<string>('./fixtures/*.json', {
	query: '?raw',
	import: 'default',
	eager: true,
})

/** The fixtures by their file name. */
const fixtures = Object.entries(FIXTURES)
	.map(([path, text]) => ({ name: path.slice('./fixtures/'.length), text }))
	.toSorted((a, b) => a.name.localeCompare(b.name))

/** The format version of a fixture, the major of the release that wrote it. */
function formatVersion(name: string): number {
	return Number(/-v(\d+)\./.exec(name)![1])
}

/** An environment unlike any fixture's settings, so a setting read as a default would show. */
const ENV: Environment = { year: 2000, language: 'en-US' }

function snapshot(value: unknown): string {
	return JSON.stringify(value, null, '\t') + '\n'
}

function snapshotPath(name: string): string {
	return `./fixtures/__snapshots__/${name}`
}

describe('project files of every released format', () => {
	for (const { name, text } of fixtures.filter((fixture) => fixture.name.startsWith('file-'))) {
		it(`opens ${name}`, async () => {
			const opened = parseProjectFile(text, name)
			expect(opened.ok).toBe(true)
			await expect(snapshot(opened)).toMatchFileSnapshot(snapshotPath(name))
		})
	}
})

describe('stored settings of every released format before 6', () => {
	for (const { name, text } of fixtures.filter((fixture) =>
		fixture.name.startsWith('storage-'),
	)) {
		it(`reads ${name}`, async () => {
			const legacy = legacyWorkspace(JSON.parse(text))
			expect(legacy).not.toBeNull()
			const layouts: Partial<Record<LayoutId, unknown>> = {}
			for (const [layout, data] of Object.entries(legacy!.layouts) as [LayoutId, unknown][]) {
				const ignored: string[] = []
				const options = parseOptions(layoutSpec(layout), data, ignored, ENV)
				layouts[layout] = { options, ignored }
			}
			await expect(snapshot({ shown: legacy!.shown, layouts })).toMatchFileSnapshot(
				snapshotPath(name),
			)
		})
	}
})

describe('the fixtures', () => {
	it('cover every format version: its files and, before 6, its stored settings', () => {
		for (let version = FIRST_FORMAT_VERSION; version <= FORMAT_VERSION; version++) {
			const names = fixtures.map((fixture) => fixture.name)
			const files = names.filter(
				(name) => name.startsWith('file-') && formatVersion(name) === version,
			)
			const stored = names.filter(
				(name) => name.startsWith('storage-') && formatVersion(name) === version,
			)
			expect(files, `files of format ${version}`).not.toHaveLength(0)
			expect(stored, `stored settings of format ${version}`).toHaveLength(version < 6 ? 1 : 0)
		}
	})
})

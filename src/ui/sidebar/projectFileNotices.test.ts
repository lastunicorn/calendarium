import { describe, expect, it } from 'vitest'

import { defaultLayoutOptions } from '../../layouts'
import {
	describeOpened,
	describeRejected,
	describeSaveFailure,
	type OpenedFile,
} from './projectFileNotices'

function opened(ignored: string[], newer: boolean): OpenedFile {
	return {
		ok: true,
		project: {
			id: null,
			name: '',
			layout: 'monthly',
			options: defaultLayoutOptions('monthly'),
		},
		ignored,
		newer,
	}
}

describe('describeOpened', () => {
	it('says nothing of a file read whole by a version as recent', () => {
		expect(describeOpened('work.json', opened([], false))).toBe('')
	})

	it('names the one setting that kept the default', () => {
		expect(describeOpened('work.json', opened(['page.margins.top'], false))).toBe(
			'Opened work.json; 1 setting was invalid and kept the default: page.margins.top.',
		)
	})

	it('counts and names several settings that kept the default', () => {
		expect(describeOpened('work.json', opened(['calendar.year', 'events'], false))).toBe(
			'Opened work.json; 2 settings were invalid and kept the default: calendar.year, events.',
		)
	})

	it('warns of a newer version’s file', () => {
		expect(describeOpened('work.json', opened([], true))).toBe(
			'Opened work.json, made by a newer version; some settings may be ignored.',
		)
	})

	it('names the file once when a newer version’s file has invalid settings', () => {
		expect(describeOpened('work.json', opened(['calendar.year'], true))).toBe(
			'Opened work.json, made by a newer version; some settings may be ignored. ' +
				'1 setting was invalid and kept the default: calendar.year.',
		)
	})
})

describe('describeRejected', () => {
	it('says why each file could not be opened', () => {
		expect(describeRejected('notes.txt', { ok: false, reason: 'notProject' })).toBe(
			'notes.txt is not a calendar project file.',
		)
		expect(describeRejected('work.json', { ok: false, reason: 'unknownLayout' })).toBe(
			'work.json was made by a newer version, with a layout this one doesn’t have.',
		)
		expect(describeRejected('video.json', { ok: false, reason: 'tooLarge' })).toBe(
			'video.json is too large to be a calendar project file (over 1 MB).',
		)
	})
})

describe('describeSaveFailure', () => {
	it('says why changes aren’t saved, and how to keep them', () => {
		expect(describeSaveFailure('quota')).toBe(
			'Changes aren’t being saved: this browser’s storage is full. Save the project to a file to keep it.',
		)
		expect(describeSaveFailure('unavailable')).toBe(
			'Changes aren’t being saved: this browser’s storage is unavailable. Save the project to a file to keep it.',
		)
	})
})

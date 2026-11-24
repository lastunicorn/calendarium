import { describe, expect, it } from 'vitest'

import { defaultLayoutOptions } from '../layouts'
import { BROWSER_IDS } from '../ports/IdAccess'
import { sequentialIds } from '../test/ports'
import { isProjectId, newProjectId, projectOf, withOptions, type Project } from './Project'

const ID = '3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10'

describe('projectOf', () => {
	it('builds a project of a layout with its options', () => {
		const options = defaultLayoutOptions('weekly')
		expect(projectOf({ id: ID, name: 'Work', layout: 'weekly', options })).toEqual({
			id: ID,
			name: 'Work',
			layout: 'weekly',
			options,
		})
	})

	it('takes a layout’s own options only, and a null id for a project read from a file', () => {
		const project: Project<null> = projectOf({
			id: null,
			name: '',
			layout: 'weekly',
			// @ts-expect-error: the daily layout's options are not the weekly layout's
			options: defaultLayoutOptions('daily'),
		})
		expect(project.id).toBeNull()
	})
})

describe('withOptions', () => {
	it('changes the options only', () => {
		const project = projectOf({
			id: ID,
			name: 'Work',
			layout: 'weekly',
			options: defaultLayoutOptions('weekly'),
		})
		const options = { ...project.options, events: ['2030-01-01 New year'] }
		expect(withOptions(project, options)).toEqual({ ...project, options })
	})

	it('takes options of the project’s own layout only', () => {
		const weekly: Extract<Project, { layout: 'weekly' }> = {
			id: ID,
			name: '',
			layout: 'weekly',
			options: defaultLayoutOptions('weekly'),
		}
		// @ts-expect-error: the daily layout's options are not the weekly layout's
		expect(withOptions(weekly, defaultLayoutOptions('daily')).layout).toBe('weekly')
	})
})

describe('isProjectId', () => {
	it('accepts a lowercase v4 UUID', () => {
		expect(isProjectId('3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10')).toBe(true)
	})

	it('rejects anything else', () => {
		const ids = [
			'3F0C9A52-7D1E-4B8A-9C61-2E5F4A8B7D10',
			'3f0c9a52-7d1e-1b8a-9c61-2e5f4a8b7d10',
			'3f0c9a52-7d1e-4b8a-7c61-2e5f4a8b7d10',
			'3f0c9a527d1e4b8a9c612e5f4a8b7d10',
			' 3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10',
			'',
			42,
			null,
			undefined,
		]
		for (const id of ids) expect(isProjectId(id), String(id)).toBe(false)
	})
})

describe('newProjectId', () => {
	it('takes the id the port makes', () => {
		const ids = sequentialIds()
		expect([newProjectId(ids), newProjectId(ids)]).toEqual([
			'00000000-0000-4000-8000-000000000001',
			'00000000-0000-4000-8000-000000000002',
		])
	})

	it('is a project id, from the browser’s port', () => {
		for (let i = 0; i < 100; i += 1) {
			const id = newProjectId(BROWSER_IDS)
			expect(isProjectId(id), id).toBe(true)
		}
	})
})

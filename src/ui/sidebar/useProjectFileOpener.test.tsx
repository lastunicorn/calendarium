import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { defaultLayoutOptions } from '../../layouts'
import { projectOf, type Project } from '../../workspace/Project'
import { serializeProject } from '../../workspace/projectDocument'
import { useProjectFileOpener } from './useProjectFileOpener'

const ID = '00000000-0000-4000-8000-000000000001'

/** A monthly project named `name`, with the id `ID`. */
function monthly(name: string): Project {
	return projectOf({ id: ID, name, layout: 'monthly', options: defaultLayoutOptions('monthly') })
}

/** A file named `fileName` holding `project`. */
function fileOf(project: Project, fileName = 'desk.json'): File {
	return new File([serializeProject(project, { pretty: true })], fileName)
}

/** The opener of files into a workspace holding `projects`, with the projects it imported. */
function renderOpener(projects: Project[] = []) {
	const onImport = vi.fn()
	const kept = Object.fromEntries(projects.map((project) => [project.id, project]))
	const { result } = renderHook(() => useProjectFileOpener(kept, onImport))
	return { opener: result, onImport }
}

describe('useProjectFileOpener', () => {
	it('imports the project of a file not kept, telling which settings it ignored', async () => {
		const { opener, onImport } = renderOpener()
		const saved = JSON.parse(serializeProject(monthly('Desk'), { pretty: false }))
		saved.options.calendar.year = 'next'
		const file = new File([JSON.stringify(saved)], 'desk.json')

		await act(() => opener.current.open(file))
		expect(onImport).toHaveBeenCalledWith(expect.objectContaining({ id: ID, name: 'Desk' }))
		expect(opener.current.notice).toBe(
			'Opened desk.json; 1 setting was invalid and kept the default: calendar.year.',
		)
		expect(opener.current.error).toBe('')
		expect(opener.current.overwriting).toBeNull()
	})

	it('waits for the user before overwriting a kept project: cancelled, it keeps it; confirmed, it imports it', async () => {
		const desk = monthly('Desk')
		const { opener, onImport } = renderOpener([desk])

		await act(() => opener.current.open(fileOf(monthly('Office'))))
		expect(opener.current.overwriting).toBe(desk)
		expect(onImport).not.toHaveBeenCalled()
		act(() => opener.current.cancelOverwrite())
		expect(opener.current.overwriting).toBeNull()
		expect(onImport).not.toHaveBeenCalled()

		await act(() => opener.current.open(fileOf(monthly('Office'))))
		act(() => opener.current.confirmOverwrite())
		expect(opener.current.overwriting).toBeNull()
		expect(onImport).toHaveBeenCalledWith(expect.objectContaining({ id: ID, name: 'Office' }))
	})

	it('says why a file isn’t a project, importing nothing, until dismissed', async () => {
		const { opener, onImport } = renderOpener()

		await act(() => opener.current.open(new File(['{"year": 2030}'], 'other.json')))
		expect(opener.current.error).toBe('other.json is not a calendar document file.')
		expect(onImport).not.toHaveBeenCalled()

		act(() => opener.current.dismiss())
		expect(opener.current.error).toBe('')
	})
})

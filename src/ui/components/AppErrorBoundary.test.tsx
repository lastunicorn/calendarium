import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultLayoutOptions } from '../../layouts'
import type { Project } from '../../workspace/Project'
import { serializeProject } from '../../workspace/projectDocument'
import { AppErrorBoundary } from './AppErrorBoundary'

const WORK: Project = {
	id: '3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10',
	name: 'Work 2027',
	layout: 'weekly',
	options: defaultLayoutOptions('weekly'),
}
const HOME: Project = {
	id: '8a1d2c3b-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
	name: '',
	layout: 'daily',
	options: defaultLayoutOptions('daily'),
}

function store(project: Project) {
	localStorage.setItem(
		`calendarium-project:${project.id}`,
		serializeProject(project, { pretty: false }),
	)
}

function Broken(): never {
	throw new Error('Something broke')
}

function renderBroken(reload = vi.fn()) {
	render(
		<AppErrorBoundary reload={reload}>
			<Broken />
		</AppErrorBoundary>,
	)
	return reload
}

describe('AppErrorBoundary', () => {
	beforeEach(() => {
		// React and the boundary both log the caught error.
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	it('renders its children when nothing fails', () => {
		render(
			<AppErrorBoundary>
				<p>Calendar</p>
			</AppErrorBoundary>,
		)
		expect(screen.getByText('Calendar')).toBeDefined()
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('shows the error in place of the app', () => {
		renderBroken()
		const alert = screen.getByRole('alert')
		expect(within(alert).getByRole('heading').textContent).toBe('Calendarium stopped working')
		expect(within(alert).getByText('Something broke')).toBeDefined()
	})

	it('reloads the page from Reload', () => {
		const reload = renderBroken()
		fireEvent.click(screen.getByRole('button', { name: 'Reload' }))
		expect(reload).toHaveBeenCalledOnce()
	})

	it('lists no projects when none are stored', () => {
		renderBroken()
		expect(screen.queryByRole('list')).toBeNull()
	})

	it('lists the stored projects, each saved to a file by its button', () => {
		store(WORK)
		store(HOME)
		const createObjectURL = vi.fn(() => 'blob:project')
		vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
		renderBroken()
		const items = within(screen.getByRole('list')).getAllByRole('listitem')
		expect(items.map((item) => item.firstChild!.textContent)).toEqual([
			'Work 2027 — Weekly',
			'Untitled — Daily',
		])
		fireEvent.click(screen.getByRole('button', { name: 'Save Work 2027 — Weekly to a file' }))
		expect(click).toHaveBeenCalledOnce()
		expect(click.mock.contexts[0]).toMatchObject({ download: 'work-2027.json' })
	})
})

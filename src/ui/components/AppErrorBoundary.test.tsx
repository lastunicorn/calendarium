import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultLayoutOptions } from '../../layouts'
import { TEST_ENV } from '../../test/environment'
import { testPorts } from '../../test/ports'
import type { Project } from '../../workspace/Project'
import { serializeProject } from '../../workspace/projectDocument'
import { projectFile } from '../../workspace/projectFile'
import { PortsContext } from '../ports'
import { AppErrorBoundary } from './AppErrorBoundary'

const WORK: Project = {
	id: '3f0c9a52-7d1e-4b8a-9c61-2e5f4a8b7d10',
	name: 'Work 2027',
	layout: 'weekly',
	options: defaultLayoutOptions('weekly', TEST_ENV),
}
const HOME: Project = {
	id: '8a1d2c3b-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
	name: '',
	layout: 'daily',
	options: defaultLayoutOptions('daily', TEST_ENV),
}

function store(project: Project) {
	localStorage.setItem(
		`calendarium-document:${project.id}`,
		serializeProject(project, { pretty: false }),
	)
}

function Broken(): never {
	throw new Error('Something broke')
}

/** The boundary around a child that fails, on `ports`. */
function renderBroken(reload = vi.fn(), ports = testPorts()) {
	render(
		<PortsContext value={ports}>
			<AppErrorBoundary reload={reload}>
				<Broken />
			</AppErrorBoundary>
		</PortsContext>,
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
		const ports = testPorts()
		renderBroken(vi.fn(), ports)
		const items = within(screen.getByRole('list')).getAllByRole('listitem')
		expect(items.map((item) => item.firstChild!.textContent)).toEqual([
			'Work 2027 — Weekly',
			'Untitled — Daily',
		])
		fireEvent.click(screen.getByRole('button', { name: 'Save Work 2027 — Weekly to a file' }))
		expect(ports.projectFiles.saved).toEqual([projectFile(WORK)])
	})
})

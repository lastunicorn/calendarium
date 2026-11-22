import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { defaultLayoutOptions, LAYOUT_IDS, type LayoutId } from '../../layouts'
import { projectOf, type ProjectId } from '../../workspace/Project'
import type { Workspace } from '../../workspace/Workspace'
import { Projects } from './Projects'

const HOME = '00000000-0000-4000-8000-000000000001' as ProjectId
const WORK = '00000000-0000-4000-8000-000000000002' as ProjectId
const DESK = '00000000-0000-4000-8000-000000000003' as ProjectId

function noop() {}

function noId(): ProjectId {
	return DESK
}

/** A project of `layout` named `name`, with its defaults. */
function project(id: ProjectId, name: string, layout: LayoutId) {
	return projectOf({ id, name, layout, options: defaultLayoutOptions(layout) })
}

/** Home (yearly, open) and Work (weekly), and Desk (monthly) when `withDesk`. */
function workspace(withDesk = false): Workspace {
	const projects = {
		[HOME]: project(HOME, 'Home', 'yearly'),
		[WORK]: project(WORK, 'Work', 'weekly'),
		...(withDesk ? { [DESK]: project(DESK, 'Desk', 'monthly') } : {}),
	}
	return { projects, open: HOME }
}

/** The value the details panel shows for `term`. */
function detail(term: string): string {
	return screen.getByText(term, { selector: 'dt' }).nextElementSibling!.textContent
}

describe('Projects', () => {
	it('starts on the open project, its row focused and its details shown', () => {
		render(<Projects workspace={workspace()} onCreate={noId} onOpen={noop} />)
		expect(screen.getByRole('main', { name: 'Documents' })).not.toBeNull()
		const home = screen.getByRole<HTMLInputElement>('radio', { name: 'Home — Yearly' })
		expect(home.checked).toBe(true)
		expect(document.activeElement).toBe(home)
		expect(detail('Name')).toBe('Home')
	})

	it('shows the chosen project’s details, and opens it on Open or Enter', () => {
		const onOpen = vi.fn()
		render(<Projects workspace={workspace()} onCreate={noId} onOpen={onOpen} />)
		const work = screen.getByRole('radio', { name: 'Work — Weekly' })
		fireEvent.click(work)
		expect(detail('Name')).toBe('Work')
		expect(detail('Layout')).toBe('Weekly (one week per page)')
		expect(onOpen).not.toHaveBeenCalled()

		fireEvent.click(screen.getByRole('button', { name: 'Open' }))
		expect(onOpen).toHaveBeenLastCalledWith(WORK)
		fireEvent.submit(work)
		expect(onOpen).toHaveBeenCalledTimes(2)
		expect(onOpen).toHaveBeenLastCalledWith(WORK)
	})

	it('adds a project from New document and chooses it, the focus back on New document', () => {
		const onCreate = vi.fn(noId)
		const { rerender } = render(
			<Projects workspace={workspace()} onCreate={onCreate} onOpen={noop} />,
		)
		const button = screen.getByRole('button', { name: 'New document…' })
		// A click focuses the button it lands on.
		button.focus()
		fireEvent.click(button)
		const dialog = screen.getByRole('dialog', { name: 'New document' })
		fireEvent.change(within(dialog).getByRole('textbox', { name: 'Name' }), {
			target: { value: 'Desk' },
		})
		fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }))
		expect(onCreate).toHaveBeenCalledExactlyOnceWith('Desk', LAYOUT_IDS[0])
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(document.activeElement).toBe(button)

		rerender(<Projects workspace={workspace(true)} onCreate={onCreate} onOpen={noop} />)
		expect(
			screen.getByRole<HTMLInputElement>('radio', { name: 'Desk — Monthly' }).checked,
		).toBe(true)
		expect(detail('Name')).toBe('Desk')
	})

	it('closes from Close or Escape, but not from Escape in its dialog', () => {
		const onClose = vi.fn()
		render(<Projects workspace={workspace()} onCreate={noId} onOpen={noop} onClose={onClose} />)
		fireEvent.click(screen.getByRole('button', { name: 'Close' }))
		expect(onClose).toHaveBeenCalledOnce()
		fireEvent.keyDown(screen.getByRole('radio', { name: 'Work — Weekly' }), { key: 'Escape' })
		expect(onClose).toHaveBeenCalledTimes(2)

		fireEvent.click(screen.getByRole('button', { name: 'New document…' }))
		const dialog = screen.getByRole('dialog', { name: 'New document' })
		fireEvent.keyDown(within(dialog).getByRole('textbox', { name: 'Name' }), { key: 'Escape' })
		expect(onClose).toHaveBeenCalledTimes(2)
	})

	it('has nothing to close to without `onClose`', () => {
		const onOpen = vi.fn()
		render(<Projects workspace={workspace()} onCreate={noId} onOpen={onOpen} />)
		expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
		fireEvent.keyDown(screen.getByRole('radio', { name: 'Home — Yearly' }), { key: 'Escape' })
		expect(onOpen).not.toHaveBeenCalled()
	})

	it('focuses New document without a project', () => {
		render(<Projects workspace={{ projects: {}, open: null }} onCreate={noId} onOpen={noop} />)
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'New document…' }))
		expect(screen.getByText('No documents yet.')).not.toBeNull()
	})

	it('gives the focus back once gone, or to `returnFocus` when nothing had it', () => {
		render(<button type="button">Manage documents</button>)
		const manage = screen.getByRole('button', { name: 'Manage documents' })
		manage.focus()
		const first = render(<Projects workspace={workspace()} onCreate={noId} onOpen={noop} />)
		expect(document.activeElement).not.toBe(manage)
		first.unmount()
		expect(document.activeElement).toBe(manage)

		manage.blur()
		function returnFocus() {
			return manage
		}
		const second = render(
			<Projects
				workspace={workspace()}
				onCreate={noId}
				onOpen={noop}
				returnFocus={returnFocus}
			/>,
		)
		second.unmount()
		expect(document.activeElement).toBe(manage)
	})
})

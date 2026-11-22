import { fireEvent, render, screen, within } from '@testing-library/react'
import { useReducer } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { defaultLayoutOptions, LAYOUT_IDS, type LayoutId } from '../../layouts'
import { projectOf, type ProjectId } from '../../workspace/Project'
import type { Workspace } from '../../workspace/Workspace'
import { workspaceReducer } from '../../workspace/workspaceReducer'
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

/** Documents over `initial`, which its Delete changes as the app's workspace changes. */
function Deleting({ initial }: { initial: Workspace }) {
	const [current, dispatch] = useReducer(workspaceReducer, initial)

	function handleDelete(id: ProjectId) {
		dispatch({ type: 'deleteProject', id })
	}

	return <Projects workspace={current} onCreate={noId} onOpen={noop} onDelete={handleDelete} />
}

/** Deletes the chosen project from its Delete, once confirmed. */
function deleteChosen() {
	fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
	const question = screen.getByRole('dialog', { name: 'Delete document' })
	fireEvent.click(within(question).getByRole('button', { name: 'Delete' }))
}

/** The labels of the rows, in their order: the text beside each radio. */
function rows(): string[] {
	return screen.getAllByRole('radio').map((radio) => radio.nextElementSibling!.textContent)
}

/** The value the details panel shows for `term`. */
function detail(term: string): string {
	return screen.getByText(term, { selector: 'dt' }).nextElementSibling!.textContent
}

describe('Projects', () => {
	it('starts on the open project, its row focused and its details shown', () => {
		render(<Projects onDelete={noop} workspace={workspace()} onCreate={noId} onOpen={noop} />)
		expect(screen.getByRole('main', { name: 'Documents' })).not.toBeNull()
		const home = screen.getByRole<HTMLInputElement>('radio', { name: 'Home — Yearly' })
		expect(home.checked).toBe(true)
		expect(document.activeElement).toBe(home)
		expect(detail('Name')).toBe('Home')
	})

	it('shows the chosen project’s details, and opens it on Open or Enter', () => {
		const onOpen = vi.fn()
		render(<Projects onDelete={noop} workspace={workspace()} onCreate={noId} onOpen={onOpen} />)
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
			<Projects onDelete={noop} workspace={workspace()} onCreate={onCreate} onOpen={noop} />,
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

		rerender(
			<Projects
				onDelete={noop}
				workspace={workspace(true)}
				onCreate={onCreate}
				onOpen={noop}
			/>,
		)
		expect(
			screen.getByRole<HTMLInputElement>('radio', { name: 'Desk — Monthly' }).checked,
		).toBe(true)
		expect(detail('Name')).toBe('Desk')
	})

	it('closes from Close or Escape, but not from Escape in its dialog', () => {
		const onClose = vi.fn()
		render(
			<Projects
				onDelete={noop}
				workspace={workspace()}
				onCreate={noId}
				onOpen={noop}
				onClose={onClose}
			/>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Close' }))
		expect(onClose).toHaveBeenCalledOnce()
		fireEvent.keyDown(screen.getByRole('radio', { name: 'Work — Weekly' }), { key: 'Escape' })
		expect(onClose).toHaveBeenCalledTimes(2)

		fireEvent.click(screen.getByRole('button', { name: 'New document…' }))
		const dialog = screen.getByRole('dialog', { name: 'New document' })
		fireEvent.keyDown(within(dialog).getByRole('textbox', { name: 'Name' }), { key: 'Escape' })
		expect(onClose).toHaveBeenCalledTimes(2)
	})

	it('asks before deleting the chosen project, keeping it on Cancel, the focus back on Delete', () => {
		const onDelete = vi.fn()
		render(
			<Projects workspace={workspace()} onCreate={noId} onOpen={noop} onDelete={onDelete} />,
		)
		fireEvent.click(screen.getByRole('radio', { name: 'Work — Weekly' }))
		const remove = screen.getByRole('button', { name: 'Delete' })
		// A click focuses the button it lands on.
		remove.focus()
		fireEvent.click(remove)
		const question = screen.getByRole('dialog', { name: 'Delete document' })
		// Not the open project, which can be saved at once.
		expect(question.textContent).toContain(
			'Delete “Work”? It can’t be undone; open it and save it to a file first to keep it.',
		)
		fireEvent.click(within(question).getByRole('button', { name: 'Cancel' }))
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(onDelete).not.toHaveBeenCalled()
		expect(document.activeElement).toBe(remove)
	})

	it('deletes the open project, choosing the one taking its place in the list, its row focused', () => {
		render(<Deleting initial={workspace(true)} />)
		// Listed by name: Desk, Home (open and chosen), Work.
		fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
		expect(screen.getByRole('dialog', { name: 'Delete document' }).textContent).toContain(
			'Delete “Home”? It can’t be undone; save it to a file first to keep it.',
		)
		fireEvent.click(
			within(screen.getByRole('dialog', { name: 'Delete document' })).getByRole('button', {
				name: 'Delete',
			}),
		)
		expect(rows()).toEqual(['Desk — Monthly', 'Work — Weekly'])
		const work = screen.getByRole<HTMLInputElement>('radio', { name: 'Work — Weekly' })
		expect(work.checked).toBe(true)
		expect(document.activeElement).toBe(work)
		// Opened in its place by the workspace.
		expect(screen.getByRole('radio', { description: 'Current' })).toBe(work)
		expect(detail('Name')).toBe('Work')
	})

	it('deletes another project, the open one staying open, the next one chosen', () => {
		render(<Deleting initial={workspace(true)} />)
		fireEvent.click(screen.getByRole('radio', { name: 'Desk — Monthly' }))
		deleteChosen()
		expect(rows()).toEqual(['Home — Yearly', 'Work — Weekly'])
		const home = screen.getByRole<HTMLInputElement>('radio', { name: 'Home — Yearly' })
		expect(home.checked).toBe(true)
		expect(document.activeElement).toBe(home)
		expect(screen.getByRole('radio', { description: 'Current' })).toBe(home)
	})

	it('focuses New document once the last project is deleted', () => {
		render(
			<Deleting
				initial={{ projects: { [HOME]: project(HOME, 'Home', 'yearly') }, open: HOME }}
			/>,
		)
		deleteChosen()
		expect(screen.getByText('No documents yet.')).not.toBeNull()
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'New document…' }))
	})

	it('has nothing to close to without `onClose`', () => {
		const onOpen = vi.fn()
		render(<Projects onDelete={noop} workspace={workspace()} onCreate={noId} onOpen={onOpen} />)
		expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
		fireEvent.keyDown(screen.getByRole('radio', { name: 'Home — Yearly' }), { key: 'Escape' })
		expect(onOpen).not.toHaveBeenCalled()
	})

	it('focuses New document without a project', () => {
		render(
			<Projects
				onDelete={noop}
				workspace={{ projects: {}, open: null }}
				onCreate={noId}
				onOpen={noop}
			/>,
		)
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'New document…' }))
		expect(screen.getByText('No documents yet.')).not.toBeNull()
	})

	it('gives the focus back once gone, or to `returnFocus` when nothing had it', () => {
		render(<button type="button">Manage documents</button>)
		const manage = screen.getByRole('button', { name: 'Manage documents' })
		manage.focus()
		const first = render(
			<Projects onDelete={noop} workspace={workspace()} onCreate={noId} onOpen={noop} />,
		)
		expect(document.activeElement).not.toBe(manage)
		first.unmount()
		expect(document.activeElement).toBe(manage)

		manage.blur()
		function returnFocus() {
			return manage
		}
		const second = render(
			<Projects
				onDelete={noop}
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

import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState, type ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { margins } from '../../core/paper'
import { defaultLayoutOptions, LAYOUT_IDS, type LayoutId } from '../../layouts'
import {
	defaultPreferences,
	withSectionToggled,
	type SectionId,
} from '../../preferences/Preferences'
import { TEST_ENV } from '../../test/environment'
import { testPorts } from '../../test/ports'
import type { Project } from '../../workspace/Project'
import { defaultWorkspace, type Workspace } from '../../workspace/Workspace'
import { PortsContext } from '../ports'
import { WorkspaceForm } from './WorkspaceForm'

function noop() {}

const ID = '00000000-0000-4000-8000-000000000001'

/** A workspace holding one project of `layout`, with its defaults or `options`, open. */
function workspaceFor(
	layout: LayoutId = 'yearly',
	options: object = defaultLayoutOptions(layout, TEST_ENV),
	id = ID,
): Workspace {
	const project = { id, name: '', layout, options } as Project
	return { projects: { [id]: project }, open: id }
}

/** The project section's actions, doing nothing, every save written, the preview shown. */
const PROJECT_ACTIONS = {
	content: 'preview' as const,
	saveFailure: null,
	onRenameProject: noop,
	onNewProject: noop,
	onManageProjects: noop,
	onImportProject: noop,
}

type FormProps = Omit<ComponentProps<typeof WorkspaceForm>, 'openSection' | 'onToggleSection'>

/**
 * The form with its open section held as the app holds it, in the viewer's preferences, on test
 * ports, so its sections' defaults are in the test environment.
 */
function Form(props: FormProps) {
	const [preferences, setPreferences] = useState(defaultPreferences)
	const [ports] = useState(testPorts)

	function handleToggleSection(id: SectionId) {
		setPreferences((current) => withSectionToggled(current, id))
	}

	return (
		<PortsContext value={ports}>
			<WorkspaceForm
				{...props}
				openSection={preferences.openSection}
				onToggleSection={handleToggleSection}
			/>
		</PortsContext>
	)
}

/**
 * The titles of the form's sections, top to bottom. Each is a `<fieldset>`; groups inside one
 * (like the margins) are part of that section.
 */
function sectionTitles(layout: LayoutId): string[] {
	render(<Form workspace={workspaceFor(layout)} onUpdate={noop} {...PROJECT_ACTIONS} />)
	return screen
		.getAllByRole('group')
		.filter((group) => group.parentElement?.closest('fieldset') === null)
		.map((section) => section.querySelector('legend')!.textContent)
}

describe('WorkspaceForm', () => {
	// Each layout's sections are tested next to its form, in `layouts/<layout-id>/ui/`.
	it.each(LAYOUT_IDS)('shows the project section above the %s form', (layout) => {
		const [first, ...rest] = sectionTitles(layout)
		expect(first).toBe('Document')
		expect(rest.length).toBeGreaterThan(0)
	})

	it('keeps the project section open, starts every other section collapsed, and opens one when its title is clicked', () => {
		const [layoutTitle, ...titles] = sectionTitles('yearly')
		expect(layoutTitle).toBe('Document')
		expect(screen.queryByRole('button', { name: 'Document' })).toBeNull()
		const actions = within(screen.getByRole('group', { name: 'Document' })).getByRole('toolbar')
		expect(
			within(actions)
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual([
			'New document…',
			'Manage documents',
			'Open a document file',
			'Save document to a file',
			'Print',
		])
		const toggles = screen.getAllByRole('button', { expanded: false })
		expect(toggles.map((button) => button.textContent)).toEqual(titles)
		expect(screen.queryByLabelText('Year')).toBeNull()

		const calendar = screen.getByRole('button', { name: 'Calendar' })
		fireEvent.click(calendar)
		expect(calendar.getAttribute('aria-expanded')).toBe('true')
		expect(screen.getByLabelText('Year')).not.toBeNull()

		fireEvent.click(calendar)
		expect(screen.queryByLabelText('Year')).toBeNull()
	})

	it('closes the open section when another one is opened', () => {
		sectionTitles('yearly')
		const calendar = screen.getByRole('button', { name: 'Calendar' })
		const page = screen.getByRole('button', { name: 'Page' })
		fireEvent.click(calendar)

		fireEvent.click(page)
		expect(page.getAttribute('aria-expanded')).toBe('true')
		expect(calendar.getAttribute('aria-expanded')).toBe('false')
		expect(screen.queryByLabelText('Year')).toBeNull()
		const actions = within(screen.getByRole('group', { name: 'Document' })).getByRole('toolbar')
		expect(
			within(actions)
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual([
			'New document…',
			'Manage documents',
			'Open a document file',
			'Save document to a file',
			'Print',
		])
	})

	it('keeps a section open on another project', () => {
		const workspace = workspaceFor()
		const { rerender } = render(
			<Form workspace={workspace} onUpdate={noop} {...PROJECT_ACTIONS} />,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))

		rerender(
			<Form
				workspace={workspaceFor('daily', undefined, '00000000-0000-4000-8000-000000000002')}
				onUpdate={noop}
				{...PROJECT_ACTIONS}
			/>,
		)
		expect(screen.getByLabelText('Year')).not.toBeNull()
		expect(screen.getByRole('button', { name: 'Content' }).getAttribute('aria-expanded')).toBe(
			'false',
		)
	})

	it('shows the spine only with mirrored margins, outside a booklet', () => {
		const workspace = workspaceFor()
		const { rerender } = render(
			<Form workspace={workspace} onUpdate={noop} {...PROJECT_ACTIONS} />,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Page' }))
		expect(screen.queryByRole('group', { name: 'Spine' })).toBeNull()

		const layout = defaultLayoutOptions('yearly', TEST_ENV)
		const mirrored = workspaceFor('yearly', {
			...layout,
			page: { ...layout.page, mirrorMargins: true },
		})
		rerender(<Form workspace={mirrored} onUpdate={noop} {...PROJECT_ACTIONS} />)
		expect(screen.getByRole('group', { name: 'Spine' })).not.toBeNull()

		// A booklet's spine is its fold.
		const booklet = workspaceFor('yearly', {
			...layout,
			page: { ...layout.page, mirrorMargins: true, booklet: true },
		})
		rerender(<Form workspace={booklet} onUpdate={noop} {...PROJECT_ACTIONS} />)
		expect(screen.queryByRole('group', { name: 'Spine' })).toBeNull()
	})

	it('sets every margin from the top one with equal margins, unavailable with mirror margins', () => {
		const workspace = workspaceFor()
		const layout = defaultLayoutOptions('yearly', TEST_ENV)
		const onUpdate = vi.fn()
		function withPage(page: Partial<typeof layout.page>) {
			return workspaceFor('yearly', { ...layout, page: { ...layout.page, ...page } })
		}
		const { rerender } = render(
			<Form workspace={workspace} onUpdate={onUpdate} {...PROJECT_ACTIONS} />,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Page' }))
		const left = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Left margin' })
		expect(left.readOnly).toBe(true)
		const top = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Top margin' })
		expect(top.readOnly).toBe(false)
		fireEvent.change(top, { target: { value: '20' } })
		expect(onUpdate).toHaveBeenLastCalledWith('yearly', {
			page: expect.objectContaining({
				margins: { top: 20, right: 20, bottom: 20, left: 20 },
			}),
		})

		rerender(
			<Form
				workspace={withPage({ mirrorMargins: true, equalMargins: false })}
				onUpdate={onUpdate}
				{...PROJECT_ACTIONS}
			/>,
		)
		const equal = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Use equal margins' })
		expect(equal.disabled).toBe(true)
		expect(left.readOnly).toBe(false)

		rerender(
			<Form
				workspace={withPage({
					equalMargins: false,
					margins: { top: 5, right: 10, bottom: 15, left: 20 },
				})}
				onUpdate={onUpdate}
				{...PROJECT_ACTIONS}
			/>,
		)
		fireEvent.click(equal)
		expect(onUpdate).toHaveBeenLastCalledWith('yearly', {
			page: expect.objectContaining({ equalMargins: true, margins: margins(5) }),
		})
	})

	it('shows only New, Manage, Open and Print, and no options, beside Documents', () => {
		// Documents, the only content without a project, or beside one.
		for (const workspace of [defaultWorkspace(), workspaceFor()]) {
			const { unmount } = render(
				<Form
					workspace={workspace}
					onUpdate={noop}
					{...PROJECT_ACTIONS}
					content="projects"
				/>,
			)
			const section = screen.getByRole('group', { name: 'Document' })
			expect(
				within(within(section).getByRole('toolbar'))
					.getAllByRole('button')
					.map((button) => button.title),
			).toEqual(['New document…', 'Manage documents', 'Open a document file', 'Print'])
			expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Print' }).disabled).toBe(
				true,
			)
			expect(within(section).queryByRole('textbox', { name: 'Name' })).toBeNull()
			expect(
				screen
					.getAllByRole('group')
					.map((group) => group.querySelector('legend')!.textContent),
			).toEqual(['Document'])
			unmount()
		}
	})

	it('shows Documents from Manage documents, pressed while it shows, and the open project’s name and layout beside its preview', () => {
		const work = { ...workspaceFor('weekly').projects[ID], name: 'Work 2027' }
		const workspace = { projects: { [work.id]: work }, open: work.id }
		const onManageProjects = vi.fn()
		const { rerender } = render(
			<Form
				workspace={workspace}
				onUpdate={noop}
				{...PROJECT_ACTIONS}
				onManageProjects={onManageProjects}
			/>,
		)
		const manage = screen.getByRole('button', { name: 'Manage documents' })
		expect(manage.getAttribute('aria-pressed')).toBe('false')
		fireEvent.click(manage)
		expect(onManageProjects).toHaveBeenCalledOnce()
		const name = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' })
		expect(name.value).toBe('Work 2027')
		expect(name.placeholder).toBe('Untitled')
		expect(screen.getByLabelText('Layout').textContent).toBe('Weekly (one week per page)')

		rerender(
			<Form
				workspace={workspace}
				onUpdate={noop}
				{...PROJECT_ACTIONS}
				content="projects"
				onManageProjects={onManageProjects}
			/>,
		)
		expect(manage.getAttribute('aria-pressed')).toBe('true')
		expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull()
	})

	it('labels the hovered or focused project action under the buttons', () => {
		render(<Form workspace={workspaceFor()} onUpdate={noop} {...PROJECT_ACTIONS} />)
		const actions = screen.getByRole('toolbar', { name: 'Document' })
		const hint = actions.nextElementSibling!
		expect(hint.textContent).toBe('')

		fireEvent.pointerOver(screen.getByRole('button', { name: 'New document…' }))
		expect(hint.textContent).toBe('New document…')
		fireEvent.pointerLeave(actions)
		expect(hint.textContent).toBe('')

		fireEvent.focus(screen.getByRole('button', { name: 'Save document to a file' }))
		expect(hint.textContent).toBe('Save document to a file')
	})

	it('asks before resetting a section, and resets only that section’s fields', () => {
		const onUpdate = vi.fn()
		const workspace = workspaceFor()
		render(<Form workspace={workspace} onUpdate={onUpdate} {...PROJECT_ACTIONS} />)
		fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
		fireEvent.click(screen.getByRole('button', { name: 'Reset Calendar settings' }))
		expect(onUpdate).not.toHaveBeenCalled()

		const question = screen.getByRole('alertdialog')
		expect(document.activeElement).toBe(within(question).getByRole('button', { name: 'Reset' }))
		fireEvent.click(within(question).getByRole('button', { name: 'Reset' }))
		const { calendar } = defaultLayoutOptions('yearly', TEST_ENV)
		expect(onUpdate).toHaveBeenCalledWith('yearly', { calendar })
		expect(screen.queryByRole('alertdialog')).toBeNull()
	})

	it('cancels a section’s reset from its close button, on a click outside it, on Escape, or when it collapses', () => {
		const onUpdate = vi.fn()
		render(<Form workspace={workspaceFor()} onUpdate={onUpdate} {...PROJECT_ACTIONS} />)
		fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
		const reset = screen.getByRole('button', { name: 'Reset Calendar settings' })

		fireEvent.click(reset)
		fireEvent.click(
			within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }),
		)
		expect(screen.queryByRole('alertdialog')).toBeNull()

		fireEvent.click(reset)
		fireEvent.pointerDown(screen.getByLabelText('Year'))
		expect(screen.getByRole('alertdialog')).not.toBeNull()
		fireEvent.pointerDown(screen.getByRole('group', { name: 'Document' }))
		expect(screen.queryByRole('alertdialog')).toBeNull()

		fireEvent.click(reset)
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(screen.queryByRole('alertdialog')).toBeNull()

		fireEvent.click(reset)
		fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
		fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
		expect(screen.queryByRole('alertdialog')).toBeNull()
		expect(onUpdate).not.toHaveBeenCalled()
	})
})

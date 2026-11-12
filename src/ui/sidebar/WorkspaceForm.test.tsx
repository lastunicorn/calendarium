import { fireEvent, render, screen, within } from '@testing-library/react'
import { type ComponentProps, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { defaultLayoutOptions, LAYOUT_IDS, type LayoutId } from '../../layouts'
import type { Project } from '../../workspace/Project'
import { defaultWorkspace, type Workspace } from '../../workspace/Workspace'
import { margins } from '../../core/paper'
import { defaultPreferences, withSectionToggled } from '../../preferences/Preferences'
import { WorkspaceForm } from './WorkspaceForm'

function noop() {}

const ID = '00000000-0000-4000-8000-000000000001'

/** A workspace holding one project of `layout`, with its defaults or `options`, open. */
function workspaceFor(
	layout: LayoutId = 'yearly',
	options: object = defaultLayoutOptions(layout),
	id = ID,
): Workspace {
	const project = { id, name: '', layout, options } as Project
	return { projects: { [id]: project }, open: id }
}

/** The project section's actions, doing nothing. */
const PROJECT_ACTIONS = {
	onOpenProject: noop,
	onRenameProject: noop,
	onNewProject: noop,
	onImportProject: noop,
	onDeleteProject: noop,
}

type FormProps = Omit<ComponentProps<typeof WorkspaceForm>, 'openSection' | 'onToggleSection'>

/** The form with its open section held as the app holds it, in the viewer's preferences. */
function Form(props: FormProps) {
	const [preferences, setPreferences] = useState(defaultPreferences)

	function handleToggleSection(title: string) {
		setPreferences((current) => withSectionToggled(current, title))
	}

	return (
		<WorkspaceForm
			{...props}
			openSection={preferences.openSection}
			onToggleSection={handleToggleSection}
		/>
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
		expect(first).toBe('Project')
		expect(rest.length).toBeGreaterThan(0)
	})

	it('keeps the project section open, starts every other section collapsed, and opens one when its title is clicked', () => {
		const [layoutTitle, ...titles] = sectionTitles('yearly')
		expect(layoutTitle).toBe('Project')
		expect(screen.queryByRole('button', { name: 'Project' })).toBeNull()
		const actions = within(screen.getByRole('group', { name: 'Project' })).getByRole('toolbar')
		expect(
			within(actions)
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual([
			'New project…',
			'Open a project file',
			'Save project to a file',
			'Change project…',
			'Delete project',
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
		const actions = within(screen.getByRole('group', { name: 'Project' })).getByRole('toolbar')
		expect(
			within(actions)
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual([
			'New project…',
			'Open a project file',
			'Save project to a file',
			'Change project…',
			'Delete project',
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

		const layout = defaultLayoutOptions('yearly')
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
		const layout = defaultLayoutOptions('yearly')
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

	it('shows only New and Open, and no options, without a project', () => {
		render(<Form workspace={defaultWorkspace()} onUpdate={noop} {...PROJECT_ACTIONS} />)
		const section = screen.getByRole('group', { name: 'Project' })
		expect(
			within(within(section).getByRole('toolbar'))
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual(['New project…', 'Open a project file'])
		expect(within(section).queryByRole('combobox')).toBeNull()
		expect(within(section).queryByRole('textbox', { name: 'Name' })).toBeNull()
		expect(
			screen.getAllByRole('group').map((group) => group.querySelector('legend')!.textContent),
		).toEqual(['Project'])
	})

	it('lists the projects by name with their layout, the open one chosen, and shows its name and layout', () => {
		const work = { ...workspaceFor('weekly').projects[ID], name: 'Work 2027' } as Project
		const untitled = {
			id: '00000000-0000-4000-8000-000000000002',
			name: ' ',
			layout: 'daily',
			options: defaultLayoutOptions('daily'),
		} as Project
		const home = {
			id: '00000000-0000-4000-8000-000000000003',
			name: 'Home',
			layout: 'yearly',
			options: defaultLayoutOptions('yearly'),
		} as Project
		const workspace = {
			projects: { [work.id]: work, [untitled.id]: untitled, [home.id]: home },
			open: work.id,
		}
		render(<Form workspace={workspace} onUpdate={noop} {...PROJECT_ACTIONS} />)
		expect(
			within(screen.getByRole('group', { name: 'Project' })).queryByRole('combobox'),
		).toBeNull()
		fireEvent.click(screen.getByRole('button', { name: 'Change project…' }))
		const openProject = screen.getByRole('dialog', { name: 'Open project' })
		const radios = within(openProject).getAllByRole<HTMLInputElement>('radio')
		expect(radios.map((radio) => radio.closest('label')!.textContent)).toEqual([
			'Home — Yearly',
			'Work 2027 — Weekly',
			'Untitled — Daily',
		])
		expect(radios.map((radio) => radio.checked)).toEqual([false, true, false])
		fireEvent.click(within(openProject).getByRole('button', { name: 'Cancel' }))
		const name = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' })
		expect(name.value).toBe('Work 2027')
		expect(name.placeholder).toBe('Untitled')
		expect(screen.getByText('Layout: Weekly (one week per page)')).not.toBeNull()
	})

	it('labels the hovered or focused project action under the buttons', () => {
		render(<Form workspace={workspaceFor()} onUpdate={noop} {...PROJECT_ACTIONS} />)
		const actions = screen.getByRole('toolbar', { name: 'Project' })
		const hint = actions.nextElementSibling!
		expect(hint.textContent).toBe('')

		fireEvent.pointerOver(screen.getByRole('button', { name: 'New project…' }))
		expect(hint.textContent).toBe('New project…')
		fireEvent.pointerLeave(actions)
		expect(hint.textContent).toBe('')

		fireEvent.focus(screen.getByRole('button', { name: 'Save project to a file' }))
		expect(hint.textContent).toBe('Save project to a file')
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
		const { calendar } = defaultLayoutOptions('yearly')
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
		fireEvent.pointerDown(screen.getByRole('group', { name: 'Project' }))
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

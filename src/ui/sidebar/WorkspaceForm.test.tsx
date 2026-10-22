import { fireEvent, render, screen, within } from '@testing-library/react'
import { type ComponentProps, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { LAYOUT_IDS, type LayoutId } from '../../layouts'
import { defaultWorkspace } from '../../workspace/Workspace'
import { margins } from '../../core/paper'
import { defaultPreferences, withSectionToggled } from '../../preferences/Preferences'
import { WorkspaceForm } from './WorkspaceForm'

function noop() {}

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
	const workspace = { ...defaultWorkspace(), layout }
	render(
		<Form
			workspace={workspace}
			onSelectLayout={noop}
			onUpdate={noop}
			onNewProject={noop}
			onOpenProject={noop}
		/>,
	)
	return screen
		.getAllByRole('group')
		.filter((group) => group.parentElement?.closest('fieldset') === null)
		.map((section) => section.querySelector('legend')!.textContent)
}

describe('WorkspaceForm', () => {
	// Each layout's sections are tested next to its form, in `layouts/<layout-id>/ui/`.
	it.each(LAYOUT_IDS)('shows the layout picker above the %s form', (layout) => {
		const [first, ...rest] = sectionTitles(layout)
		expect(first).toBe('Project')
		expect(rest.length).toBeGreaterThan(0)
	})

	it('keeps the layout picker open, starts every other section collapsed, and opens one when its title is clicked', () => {
		const [layoutTitle, ...titles] = sectionTitles('year-per-page')
		expect(layoutTitle).toBe('Project')
		expect(screen.queryByRole('button', { name: 'Project' })).toBeNull()
		expect(
			screen.getByRole('group', { name: 'Project' }).querySelector('select'),
		).not.toBeNull()
		const actions = within(screen.getByRole('group', { name: 'Project' })).getByRole('toolbar')
		expect(
			within(actions)
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual(['New project', 'Open a project file', 'Save project to a file'])
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
		sectionTitles('year-per-page')
		const calendar = screen.getByRole('button', { name: 'Calendar' })
		const page = screen.getByRole('button', { name: 'Page' })
		fireEvent.click(calendar)

		fireEvent.click(page)
		expect(page.getAttribute('aria-expanded')).toBe('true')
		expect(calendar.getAttribute('aria-expanded')).toBe('false')
		expect(screen.queryByLabelText('Year')).toBeNull()
		expect(
			screen.getByRole('group', { name: 'Project' }).querySelector('select'),
		).not.toBeNull()
		const actions = within(screen.getByRole('group', { name: 'Project' })).getByRole('toolbar')
		expect(
			within(actions)
				.getAllByRole('button')
				.map((button) => button.title),
		).toEqual(['New project', 'Open a project file', 'Save project to a file'])
	})

	it('keeps a section open on another layout', () => {
		const workspace = defaultWorkspace()
		const { rerender } = render(
			<Form
				workspace={workspace}
				onSelectLayout={noop}
				onUpdate={noop}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))

		rerender(
			<Form
				workspace={{ ...workspace, layout: 'day-per-page' }}
				onSelectLayout={noop}
				onUpdate={noop}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
		expect(screen.getByLabelText('Year')).not.toBeNull()
		expect(screen.getByRole('button', { name: 'Content' }).getAttribute('aria-expanded')).toBe(
			'false',
		)
	})

	it('shows the spine only with mirrored margins', () => {
		const workspace = defaultWorkspace()
		const { rerender } = render(
			<Form
				workspace={workspace}
				onSelectLayout={noop}
				onUpdate={noop}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Page' }))
		expect(screen.queryByRole('group', { name: 'Spine' })).toBeNull()

		const layout = workspace.layouts[workspace.layout]
		const mirrored = {
			...workspace,
			layouts: {
				...workspace.layouts,
				[workspace.layout]: { ...layout, page: { ...layout.page, mirrorMargins: true } },
			},
		}
		rerender(
			<Form
				workspace={mirrored}
				onSelectLayout={noop}
				onUpdate={noop}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
		expect(screen.getByRole('group', { name: 'Spine' })).not.toBeNull()
	})

	it('sets every margin from the top one with equal margins, unavailable with mirror margins', () => {
		const workspace = defaultWorkspace()
		const layout = workspace.layouts[workspace.layout]
		const onUpdate = vi.fn()
		function withPage(page: Partial<typeof layout.page>) {
			return {
				...workspace,
				layouts: {
					...workspace.layouts,
					[workspace.layout]: { ...layout, page: { ...layout.page, ...page } },
				},
			}
		}
		const { rerender } = render(
			<Form
				workspace={workspace}
				onSelectLayout={noop}
				onUpdate={onUpdate}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Page' }))
		const left = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Left margin' })
		expect(left.readOnly).toBe(true)
		const top = screen.getByRole<HTMLInputElement>('spinbutton', { name: 'Top margin' })
		expect(top.readOnly).toBe(false)
		fireEvent.change(top, { target: { value: '20' } })
		expect(onUpdate).toHaveBeenLastCalledWith(workspace.layout, {
			page: expect.objectContaining({
				margins: { top: 20, right: 20, bottom: 20, left: 20 },
			}),
		})

		rerender(
			<Form
				workspace={withPage({ mirrorMargins: true, equalMargins: false })}
				onSelectLayout={noop}
				onUpdate={onUpdate}
				onNewProject={noop}
				onOpenProject={noop}
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
				onSelectLayout={noop}
				onUpdate={onUpdate}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
		fireEvent.click(equal)
		expect(onUpdate).toHaveBeenLastCalledWith(workspace.layout, {
			page: expect.objectContaining({ equalMargins: true, margins: margins(5) }),
		})
	})

	it('labels the hovered or focused project action under the buttons', () => {
		render(
			<Form
				workspace={defaultWorkspace()}
				onSelectLayout={noop}
				onUpdate={noop}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
		const actions = screen.getByRole('toolbar', { name: 'Project' })
		const hint = actions.nextElementSibling!
		expect(hint.textContent).toBe('')

		fireEvent.pointerOver(screen.getByRole('button', { name: 'New project' }))
		expect(hint.textContent).toBe('New project')
		fireEvent.pointerLeave(actions)
		expect(hint.textContent).toBe('')

		fireEvent.focus(screen.getByRole('button', { name: 'Save project to a file' }))
		expect(hint.textContent).toBe('Save project to a file')
	})

	it('asks before resetting a section, and resets only that section’s fields', () => {
		const onUpdate = vi.fn()
		const workspace = defaultWorkspace()
		render(
			<Form
				workspace={workspace}
				onSelectLayout={noop}
				onUpdate={onUpdate}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
		fireEvent.click(screen.getByRole('button', { name: 'Reset Calendar settings' }))
		expect(onUpdate).not.toHaveBeenCalled()

		const question = screen.getByRole('alertdialog')
		expect(document.activeElement).toBe(within(question).getByRole('button', { name: 'Reset' }))
		fireEvent.click(within(question).getByRole('button', { name: 'Reset' }))
		const { year, locale, weekStart } = workspace.layouts[workspace.layout]
		expect(onUpdate).toHaveBeenCalledWith(workspace.layout, { year, locale, weekStart })
		expect(screen.queryByRole('alertdialog')).toBeNull()
	})

	it('cancels a section’s reset from its close button, on a click outside it, on Escape, or when it collapses', () => {
		const onUpdate = vi.fn()
		render(
			<Form
				workspace={defaultWorkspace()}
				onSelectLayout={noop}
				onUpdate={onUpdate}
				onNewProject={noop}
				onOpenProject={noop}
			/>,
		)
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

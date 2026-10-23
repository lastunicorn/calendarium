import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type Workspace, defaultWorkspace } from '../../workspace/Workspace'
import { LAYOUT_IDS, type LayoutId } from '../../layouts'
import { Preview } from './Preview'

function noop() {}

/** The default workspace showing `layout`. */
function workspaceFor(layout: LayoutId): Workspace {
	return { ...defaultWorkspace(), layout }
}

// What each layout draws is tested in its folder, `layouts/<layout-id>/ui/`; these check that the
// preview draws the chosen one, whichever it is.
describe('Preview', () => {
	it.each(LAYOUT_IDS)('draws the pages of %s', (layout) => {
		const { container } = render(
			<Preview
				workspace={workspaceFor(layout)}
				onNewProject={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		expect(container.querySelectorAll('section').length).toBeGreaterThan(0)
	})

	it('sets the printed paper size from the layout', () => {
		const { container } = render(
			<Preview
				workspace={workspaceFor('month-per-page')}
				onNewProject={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		expect(container.querySelector('style')?.textContent).toBe('@page { size: A4 landscape; }')
	})

	it('prints a booklet on a sheet of two pages, completing the last sheet', () => {
		const workspace = workspaceFor('month-per-page')
		const options = workspace.layouts['month-per-page']
		const { container } = render(
			<Preview
				workspace={{
					...workspace,
					layouts: {
						...workspace.layouts,
						'month-per-page': { ...options, page: { ...options.page, booklet: true } },
					},
				}}
				onNewProject={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		// Two A4 landscape pages, one above the other.
		expect(container.querySelector('style')?.textContent).toBe('@page { size: 297mm 420mm; }')
		expect(container.querySelectorAll('section')).toHaveLength(12)
	})

	it.each([
		['week-per-page', { twoPagesPerWeek: true }],
		['day-per-page', { twoPagesPerDay: true }],
	] as const)(
		'shows the two pages of %s as facing spreads, but not in a booklet',
		(layout, changes) => {
			const workspace = workspaceFor(layout)

			/** The class of the box around the pages, with `page` changed. */
			function pagesBoxClass(page: object) {
				const options = workspace.layouts[layout]
				const { container, unmount } = render(
					<Preview
						workspace={{
							...workspace,
							layouts: {
								...workspace.layouts,
								[layout]: {
									...options,
									...changes,
									page: { ...options.page, ...page },
								},
							},
						}}
						onNewProject={noop}
						zoom={100}
						onZoom={noop}
					/>,
				)
				const className = container.querySelector('section')?.parentElement?.className
				unmount()
				return className
			}

			expect(pagesBoxClass({})).toMatch(/sideBySideSpreads/)
			expect(pagesBoxClass({ spine: 'top' })).toMatch(/stackedSpreads/)
			expect(pagesBoxClass({ booklet: true })).not.toMatch(/Spreads/)
		},
	)

	it('marks the pages with the calendar’s language', () => {
		const workspace = workspaceFor('year-per-page')
		const options = { ...workspace.layouts['year-per-page'], locale: 'el-GR' as const }
		const { container } = render(
			<Preview
				workspace={{
					...workspace,
					layouts: { ...workspace.layouts, 'year-per-page': options },
				}}
				onNewProject={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		expect(container.querySelector('main')?.lang).toBe('el-GR')
	})

	it('zooms a level in or out from the bar, and back to the printed size', () => {
		const onZoom = vi.fn()
		const { rerender } = render(
			<Preview
				workspace={workspaceFor('year-per-page')}
				onNewProject={noop}
				zoom={100}
				onZoom={onZoom}
			/>,
		)
		expect(
			(screen.getByRole('button', { name: /reset zoom/i }) as HTMLButtonElement).disabled,
		).toBe(true)
		fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
		fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
		expect(onZoom.mock.calls).toEqual([[125], [75]])

		rerender(
			<Preview
				workspace={workspaceFor('year-per-page')}
				onNewProject={noop}
				zoom={200}
				onZoom={onZoom}
			/>,
		)
		expect(
			(screen.getByRole('button', { name: 'Zoom in' }) as HTMLButtonElement).disabled,
		).toBe(true)
		fireEvent.click(screen.getByRole('button', { name: /reset zoom/i }))
		expect(onZoom).toHaveBeenLastCalledWith(100)
	})

	it('chooses a level or a fit from the zoom menu', () => {
		const onZoom = vi.fn()
		render(
			<Preview
				workspace={workspaceFor('year-per-page')}
				onNewProject={noop}
				zoom={100}
				onZoom={onZoom}
			/>,
		)
		fireEvent.change(screen.getByRole('combobox', { name: 'Zoom level' }), {
			target: { value: 'fit-width' },
		})
		expect(onZoom).toHaveBeenLastCalledWith('fit-width')
	})

	it('counts the pages, and goes to the one before, after or typed in', () => {
		render(
			<Preview
				workspace={workspaceFor('month-per-page')}
				onNewProject={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		const number = screen.getByRole('textbox', { name: 'Page number' }) as HTMLInputElement
		expect(number.value).toBe('1')
		expect(screen.getByText('/ 12')).toBeTruthy()
		expect(
			(screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled,
		).toBe(true)

		fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
		expect(number.value).toBe('2')

		fireEvent.change(number, { target: { value: '40' } })
		fireEvent.keyDown(number, { key: 'Enter' })
		expect(number.value).toBe('12')
		expect(
			(screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled,
		).toBe(true)

		fireEvent.change(number, { target: { value: 'x' } })
		fireEvent.blur(number)
		expect(number.value).toBe('12')
	})

	it('counts a booklet’s sheet sides too', () => {
		const workspace = workspaceFor('month-per-page')
		const options = workspace.layouts['month-per-page']
		render(
			<Preview
				workspace={{
					...workspace,
					layouts: {
						...workspace.layouts,
						'month-per-page': { ...options, page: { ...options.page, booklet: true } },
					},
				}}
				onNewProject={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		// The first page is on the first sheet's front, the second on its back.
		expect(screen.getByText('side 1 / 6')).toBeTruthy()
		fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
		expect(screen.getByText('side 2 / 6')).toBeTruthy()
	})

	it('hides the page indicator for a single page', () => {
		render(
			<Preview
				workspace={workspaceFor('year-per-page')}
				onNewProject={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		expect(screen.queryByRole('toolbar', { name: 'Pages' })).toBeNull()
	})

	it('lists an in-between zoom in the menu', () => {
		render(
			<Preview
				workspace={workspaceFor('year-per-page')}
				onNewProject={noop}
				zoom={87}
				onZoom={noop}
			/>,
		)
		const menu = screen.getByRole('combobox', { name: 'Zoom level' }) as HTMLSelectElement
		expect(menu.value).toBe('87')
		expect([...menu.options].map((option) => option.text).slice(2, 5)).toEqual([
			'75%',
			'87%',
			'100%',
		])
	})

	it('zooms with Ctrl and the wheel, as a pinch does, leaving the plain wheel to scroll', () => {
		const onZoom = vi.fn()
		render(
			<Preview
				workspace={workspaceFor('month-per-page')}
				onNewProject={noop}
				zoom={100}
				onZoom={onZoom}
			/>,
		)
		const preview = screen.getByRole('main', { name: 'Preview' })
		fireEvent.wheel(preview, { deltaY: 100 })
		expect(onZoom).not.toHaveBeenCalled()
		const pinch = new WheelEvent('wheel', {
			deltaY: -10,
			ctrlKey: true,
			bubbles: true,
			cancelable: true,
		})
		preview.dispatchEvent(pinch)
		expect(pinch.defaultPrevented).toBe(true)
		expect(onZoom).toHaveBeenLastCalledWith(102)
	})

	it('zooms with the keyboard shortcuts, in place of the browser', () => {
		const onZoom = vi.fn()
		render(
			<Preview
				workspace={workspaceFor('month-per-page')}
				onNewProject={noop}
				zoom={50}
				onZoom={onZoom}
			/>,
		)
		const preview = screen.getByRole('main', { name: 'Preview' })
		fireEvent.keyDown(preview, { key: '=', ctrlKey: true })
		fireEvent.keyDown(preview, { key: '-', metaKey: true })
		fireEvent.keyDown(preview, { key: '0', ctrlKey: true })
		fireEvent.keyDown(preview, { key: '0' })
		expect(onZoom.mock.calls).toEqual([[75], [25], [100]])
	})
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { defaultLayoutOptions, LAYOUT_IDS, type LayoutId } from '../../layouts'
import type { Project } from '../../workspace/Project'
import { Preview } from './Preview'

function noop() {}

/** A project of `layout`, with its defaults or `options`. */
function projectFor(layout: LayoutId, options: object = defaultLayoutOptions(layout)): Project {
	return { id: '00000000-0000-4000-8000-000000000001', name: '', layout, options } as Project
}

/** The class of the box around the pages of `layout`, with `changes` and `page` changed. */
function pagesBoxClass(layout: LayoutId, changes: object, page: object) {
	const options = defaultLayoutOptions(layout)
	const { container } = render(
		<Preview
			project={projectFor(layout, {
				...options,
				...changes,
				page: { ...options.page, ...page },
			})}
			onResetOptions={noop}
			zoom={100}
			onZoom={noop}
		/>,
	)
	return container.querySelector('section')?.parentElement?.className
}

// What each layout draws is tested in its folder, `layouts/<layout-id>/ui/`; these check that the
// preview draws the chosen one, whichever it is.
describe('Preview', () => {
	it.each(LAYOUT_IDS)('draws the pages of %s', (layout) => {
		const { container } = render(
			<Preview project={projectFor(layout)} onResetOptions={noop} zoom={100} onZoom={noop} />,
		)
		expect(container.querySelectorAll('section').length).toBeGreaterThan(0)
	})

	it('sets the printed paper size from the layout', () => {
		const { container } = render(
			<Preview
				project={projectFor('monthly')}
				onResetOptions={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		expect(container.querySelector('style')?.textContent).toBe('@page { size: A4 landscape; }')
	})

	it('prints a booklet on a sheet of two pages, completing the last sheet', () => {
		const options = defaultLayoutOptions('monthly')
		const { container } = render(
			<Preview
				project={projectFor('monthly', {
					...options,
					page: { ...options.page, booklet: true },
				})}
				onResetOptions={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		// Two A4 landscape pages, one above the other.
		expect(container.querySelector('style')?.textContent).toBe('@page { size: 297mm 420mm; }')
		expect(container.querySelectorAll('section')).toHaveLength(12)
	})

	// Two pages per week or day, without the hours, which only slow these renders of over a hundred
	// pages down.
	const facingPages = [
		[
			'weekly',
			{
				content: {
					...defaultLayoutOptions('weekly').content,
					twoPages: true,
					fill: 'none',
				},
			},
		],
		[
			'daily',
			{
				content: {
					...defaultLayoutOptions('daily').content,
					twoPages: true,
					fill: 'blank',
				},
			},
		],
	] as const

	it.each(facingPages)('shows the two pages of %s as facing spreads', (layout, changes) => {
		expect(pagesBoxClass(layout, changes, {})).toMatch(/sideBySideSpreads/)
	})

	it.each(facingPages)(
		'stacks the facing pages of %s with the spine at the top',
		(layout, changes) => {
			expect(pagesBoxClass(layout, changes, { spine: 'top' })).toMatch(/stackedSpreads/)
		},
	)

	it.each(facingPages)('shows the two pages of %s as sheets in a booklet', (layout, changes) => {
		expect(pagesBoxClass(layout, changes, { booklet: true })).not.toMatch(/Spreads/)
	})

	it('marks the pages with the calendar’s language', () => {
		const defaults = defaultLayoutOptions('yearly')
		const options = {
			...defaults,
			calendar: { ...defaults.calendar, locale: 'el-GR' as const },
		}
		const { container } = render(
			<Preview
				project={projectFor('yearly', options)}
				onResetOptions={noop}
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
				project={projectFor('yearly')}
				onResetOptions={noop}
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
				project={projectFor('yearly')}
				onResetOptions={noop}
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
				project={projectFor('yearly')}
				onResetOptions={noop}
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
				project={projectFor('monthly')}
				onResetOptions={noop}
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
		const options = defaultLayoutOptions('monthly')
		render(
			<Preview
				project={projectFor('monthly', {
					...options,
					page: { ...options.page, booklet: true },
				})}
				onResetOptions={noop}
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
				project={projectFor('yearly')}
				onResetOptions={noop}
				zoom={100}
				onZoom={noop}
			/>,
		)
		expect(screen.queryByRole('toolbar', { name: 'Pages' })).toBeNull()
	})

	it('lists an in-between zoom in the menu', () => {
		render(
			<Preview
				project={projectFor('yearly')}
				onResetOptions={noop}
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
				project={projectFor('monthly')}
				onResetOptions={noop}
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
				project={projectFor('monthly')}
				onResetOptions={noop}
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

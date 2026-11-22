import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Dialog } from './Dialog'

function noop() {}

describe('Dialog', () => {
	it('opens as a modal dialog named by its title, with Cancel and its action', () => {
		render(
			<Dialog title="Delete document" submitLabel="Delete" onSubmit={noop} onCancel={noop}>
				<p>Sure?</p>
			</Dialog>,
		)
		const dialog = screen.getByRole<HTMLDialogElement>('dialog', { name: 'Delete document' })
		expect(dialog.open).toBe(true)
		expect(screen.getByText('Sure?')).not.toBeNull()
		expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
			'',
			'Cancel',
			'Delete',
		])
	})

	it('focuses the first field, or Cancel when there is none', () => {
		const { unmount } = render(
			<Dialog title="New" submitLabel="Create" onSubmit={noop} onCancel={noop}>
				<input aria-label="Name" />
			</Dialog>,
		)
		expect(document.activeElement).toBe(screen.getByLabelText('Name'))
		unmount()

		render(
			<Dialog title="Delete" submitLabel="Delete" onSubmit={noop} onCancel={noop}>
				<p>Sure?</p>
			</Dialog>,
		)
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }))
	})

	it('focuses a radio group first by its checked radio', () => {
		render(
			<Dialog title="Open" submitLabel="Open" onSubmit={noop} onCancel={noop}>
				<input type="radio" name="project" aria-label="Home" readOnly />
				<input type="radio" name="project" aria-label="Work" checked readOnly />
				<input type="radio" name="other" aria-label="Other" checked readOnly />
			</Dialog>,
		)
		expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Work' }))
	})

	it('focuses the first field before a radio group after it, as New document has its name', () => {
		render(
			<Dialog title="New" submitLabel="Create" onSubmit={noop} onCancel={noop}>
				<input aria-label="Name" />
				<input type="radio" name="layout" aria-label="Yearly" checked readOnly />
			</Dialog>,
		)
		expect(document.activeElement).toBe(screen.getByLabelText('Name'))
	})

	it('focuses the first radio of a group none of whose radios is checked', () => {
		render(
			<Dialog title="Open" submitLabel="Open" onSubmit={noop} onCancel={noop}>
				<input type="radio" name="project" aria-label="Home" readOnly />
				<input type="radio" name="project" aria-label="Work" readOnly />
			</Dialog>,
		)
		expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Home' }))
	})

	it('acts on its action or Enter in a field', () => {
		const onSubmit = vi.fn()
		render(
			<Dialog title="New" submitLabel="Create" onSubmit={onSubmit} onCancel={noop}>
				<input aria-label="Name" />
			</Dialog>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Create' }))
		expect(onSubmit).toHaveBeenCalledTimes(1)
		fireEvent.submit(screen.getByLabelText('Name'))
		expect(onSubmit).toHaveBeenCalledTimes(2)
	})

	it('cancels from Cancel, the close button or Escape, leaving the closing to its owner', () => {
		const onCancel = vi.fn()
		render(
			<Dialog title="Delete" submitLabel="Delete" onSubmit={noop} onCancel={onCancel}>
				<p>Sure?</p>
			</Dialog>,
		)
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
		fireEvent.click(screen.getByRole('button', { name: 'Close' }))
		const dialog = screen.getByRole<HTMLDialogElement>('dialog')
		// What the browser fires on Escape.
		const escape = new Event('cancel', { cancelable: true })
		fireEvent(dialog, escape)
		expect(escape.defaultPrevented).toBe(true)
		expect(onCancel).toHaveBeenCalledTimes(3)
		expect(dialog.open).toBe(true)
	})

	it('gives the focus back to what had it once closed', () => {
		render(<button type="button">Delete document</button>)
		const opener = screen.getByRole('button', { name: 'Delete document' })
		opener.focus()
		const { unmount } = render(
			<Dialog title="Delete" submitLabel="Delete" onSubmit={noop} onCancel={noop}>
				<p>Sure?</p>
			</Dialog>,
		)
		expect(document.activeElement).not.toBe(opener)
		unmount()
		expect(document.activeElement).toBe(opener)
	})

	it('gives the focus to `returnFocus` when what had it is gone, or nothing had it', () => {
		const picker = (
			<button key="picker" type="button">
				Picker
			</button>
		)
		const { rerender } = render([
			<button key="opener" type="button">
				Opener
			</button>,
			picker,
		])
		const pickerButton = screen.getByRole('button', { name: 'Picker' })
		function returnFocus() {
			return pickerButton
		}
		const dialog = (
			<Dialog
				key="dialog"
				title="New"
				submitLabel="Create"
				onSubmit={noop}
				onCancel={noop}
				returnFocus={returnFocus}
			>
				<p>Sure?</p>
			</Dialog>
		)

		// Opened from a button that goes as it closes.
		screen.getByRole('button', { name: 'Opener' }).focus()
		rerender([
			<button key="opener" type="button">
				Opener
			</button>,
			picker,
			dialog,
		])
		rerender([picker])
		expect(document.activeElement).toBe(pickerButton)

		// Opened with nothing focused.
		pickerButton.blur()
		rerender([picker, dialog])
		rerender([picker])
		expect(document.activeElement).toBe(pickerButton)
	})

	it('still gives the focus back to what had it when it is there', () => {
		render(<button type="button">New document</button>)
		const opener = screen.getByRole('button', { name: 'New document' })
		opener.focus()
		const { unmount } = render(
			<Dialog
				title="New"
				submitLabel="Create"
				onSubmit={noop}
				onCancel={noop}
				returnFocus={() => null}
			>
				<p>Sure?</p>
			</Dialog>,
		)
		unmount()
		expect(document.activeElement).toBe(opener)
	})
})

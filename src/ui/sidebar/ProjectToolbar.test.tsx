import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ProjectToolbar } from './ProjectToolbar'

function noop() {}

/** The toolbar of an open project, passing on the files chosen to `onOpenFile`. */
function renderToolbar(onOpenFile: (file: File) => void) {
	const { container } = render(
		<ProjectToolbar
			hasProject
			onNew={noop}
			onChange={noop}
			onDelete={noop}
			onOpenFile={onOpenFile}
			onSave={noop}
		/>,
	)
	return container.querySelector<HTMLInputElement>('input[type="file"]')!
}

describe('ProjectToolbar', () => {
	it('opens the browser’s file chooser, and passes on the file chosen, if any', () => {
		const onOpenFile = vi.fn()
		const input = renderToolbar(onOpenFile)
		const click = vi.spyOn(input, 'click').mockImplementation(noop)
		fireEvent.click(screen.getByRole('button', { name: 'Open a document file' }))
		expect(click).toHaveBeenCalledOnce()

		const file = new File(['{}'], 'desk.json')
		fireEvent.change(input, { target: { files: [file] } })
		expect(onOpenFile).toHaveBeenCalledWith(file)

		fireEvent.change(input, { target: { files: [] } })
		expect(onOpenFile).toHaveBeenCalledOnce()
	})
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { testPorts, type TestPorts } from '../../test/ports'
import { PortsContext } from '../ports'
import { ProjectToolbar } from './ProjectToolbar'

function noop() {}

/**
 * The toolbar, of an open project's preview unless `showsProject` is false, on `ports`, passing on
 * the files chosen to `onOpenFile`.
 */
function renderToolbar(
	onOpenFile: (file: File) => void = noop,
	{
		showsProject = true,
		ports = testPorts(),
	}: { showsProject?: boolean; ports?: TestPorts } = {},
) {
	const { container } = render(
		<PortsContext value={ports}>
			<ProjectToolbar
				showsProject={showsProject}
				managing={false}
				onNew={noop}
				onManage={noop}
				onOpenFile={onOpenFile}
				onSave={noop}
			/>
		</PortsContext>,
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

	it('prints through the printer', () => {
		const ports = testPorts()
		renderToolbar(noop, { ports })
		fireEvent.click(screen.getByRole('button', { name: 'Print' }))
		expect(ports.printer.prints).toBe(1)
	})

	it('prints nothing without the open project’s preview', () => {
		const ports = testPorts()
		renderToolbar(noop, { showsProject: false, ports })
		const print = screen.getByRole<HTMLButtonElement>('button', { name: 'Print' })
		expect(print.disabled).toBe(true)
		fireEvent.click(print)
		expect(ports.printer.prints).toBe(0)
	})
})

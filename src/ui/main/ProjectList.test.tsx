import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ProjectId } from '../../workspace/Project'
import { ProjectList } from './ProjectList'

const HOME = '00000000-0000-4000-8000-000000000001' as ProjectId
const WORK = '00000000-0000-4000-8000-000000000002' as ProjectId
const PROJECTS = [
	{ value: HOME, label: 'Home — Yearly' },
	{ value: WORK, label: 'Work 2027 — Weekly' },
]

function noop() {}

describe('ProjectList', () => {
	it('lists the projects as one choice, the chosen one checked, the current one tagged', () => {
		render(
			<ProjectList
				projects={PROJECTS}
				currentId={WORK}
				chosenId={HOME}
				onChoose={noop}
				onOpen={noop}
				onNew={noop}
			/>,
		)
		const group = screen.getByRole('radiogroup', { name: 'Your documents' })
		expect(group).not.toBeNull()
		const radios = screen.getAllByRole<HTMLInputElement>('radio')
		expect(radios.map((radio) => radio.checked)).toEqual([true, false])
		// The tag describes the current row's radio, and isn't part of its name.
		const current = screen.getByRole('radio', { description: 'Current' })
		expect(current).toBe(screen.getByRole('radio', { name: 'Work 2027 — Weekly' }))
		expect(screen.getByRole('radio', { name: 'Home — Yearly' })).toBe(radios[0])
	})

	it('chooses a project on a click, and opens one on a double click on its row', () => {
		const onChoose = vi.fn()
		const onOpen = vi.fn()
		render(
			<ProjectList
				projects={PROJECTS}
				currentId={WORK}
				chosenId={WORK}
				onChoose={onChoose}
				onOpen={onOpen}
				onNew={noop}
			/>,
		)
		fireEvent.click(screen.getByRole('radio', { name: 'Home — Yearly' }))
		expect(onChoose).toHaveBeenCalledExactlyOnceWith(HOME)
		expect(onOpen).not.toHaveBeenCalled()
		fireEvent.doubleClick(screen.getByText('Home — Yearly'))
		expect(onOpen).toHaveBeenCalledExactlyOnceWith(HOME)
	})

	it('says there is no project, beside New document', () => {
		const onNew = vi.fn()
		render(
			<ProjectList
				projects={[]}
				currentId={null}
				chosenId={null}
				onChoose={noop}
				onOpen={noop}
				onNew={onNew}
			/>,
		)
		expect(screen.getByText('No documents yet.')).not.toBeNull()
		expect(screen.queryByRole('radiogroup')).toBeNull()
		fireEvent.click(screen.getByRole('button', { name: 'New document…' }))
		expect(onNew).toHaveBeenCalledOnce()
	})
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ProjectId } from '../../workspace/Project'
import { OpenProjectDialog } from './OpenProjectDialog'

const HOME = '00000000-0000-4000-8000-000000000001' as ProjectId
const WORK = '00000000-0000-4000-8000-000000000002' as ProjectId
const PROJECTS = [
	{ value: HOME, label: 'Home — Yearly' },
	{ value: WORK, label: 'Work 2027 — Weekly' },
]

function noop() {}

describe('OpenProjectDialog', () => {
	it('lists the projects as one choice, the open one chosen and focused', () => {
		render(
			<OpenProjectDialog projects={PROJECTS} openId={WORK} onOpen={noop} onCancel={noop} />,
		)
		const radios = screen.getAllByRole<HTMLInputElement>('radio')
		expect(radios.map((radio) => radio.closest('label')!.textContent)).toEqual([
			'Home — Yearly',
			'Work 2027 — Weekly',
		])
		expect(radios.map((radio) => radio.checked)).toEqual([false, true])
		expect(document.activeElement).toBe(radios[1])
		expect(screen.getByRole('group', { name: 'Projects' })).not.toBeNull()
	})

	it('opens the chosen project on Open', () => {
		const onOpen = vi.fn()
		render(
			<OpenProjectDialog projects={PROJECTS} openId={WORK} onOpen={onOpen} onCancel={noop} />,
		)
		fireEvent.click(screen.getByRole('radio', { name: 'Home — Yearly' }))
		expect(onOpen).not.toHaveBeenCalled()
		fireEvent.click(screen.getByRole('button', { name: 'Open' }))
		expect(onOpen).toHaveBeenCalledExactlyOnceWith(HOME)
	})

	it('opens a project at once on a double click on its row', () => {
		const onOpen = vi.fn()
		render(
			<OpenProjectDialog projects={PROJECTS} openId={WORK} onOpen={onOpen} onCancel={noop} />,
		)
		fireEvent.doubleClick(screen.getByText('Home — Yearly'))
		expect(onOpen).toHaveBeenCalledExactlyOnceWith(HOME)
	})
})

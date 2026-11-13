import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { commonDefaults } from '../../layouts/common'
import { renderWithSectionsOpen } from '../../test/formSections'
import { EventsSection } from './EventsSection'

const DEFAULTS = commonDefaults()

function renderEvents(events: string[]) {
	renderWithSectionsOpen(
		<EventsSection options={{ ...DEFAULTS, events }} defaults={DEFAULTS} onUpdate={vi.fn()} />,
	)
}

describe('EventsSection', () => {
	it('warns of nothing when every line is an event', () => {
		renderEvents(['0000-12-25 Christmas', '2026-04-05 Easter'])
		expect(screen.queryByRole('status')).toBeNull()
	})

	it('names the one line that is not an event', () => {
		renderEvents(['0000-12-25 Christmas', 'Easter'])
		expect(screen.getByRole('status').textContent).toBe(
			'Line 2 is not a date and a name (YYYY-MM-DD Name), so not printed.',
		)
	})

	it('names every line that is not an event', () => {
		renderEvents(['Christmas', '0000-12-25 Christmas', '2026-13-01 Nope', 'Easter'])
		expect(screen.getByRole('status').textContent).toBe(
			'Lines 1, 3, 4 are not a date and a name (YYYY-MM-DD Name), so not printed.',
		)
	})
})

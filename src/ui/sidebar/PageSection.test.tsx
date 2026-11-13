import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { PageSetup } from '../../core/paper'
import { commonDefaults } from '../../layouts/common'
import { renderWithSectionsOpen } from '../../test/formSections'
import { PageSection } from './PageSection'

const DEFAULTS = commonDefaults().page

function renderSection(changes: Partial<PageSetup>) {
	const onUpdate = vi.fn()
	renderWithSectionsOpen(
		<PageSection
			options={{ ...DEFAULTS, ...changes }}
			defaults={DEFAULTS}
			onUpdate={onUpdate}
		/>,
	)
	return onUpdate
}

describe('PageSection', () => {
	it('sets every margin to the top one when equal margins are turned on', () => {
		const onUpdate = renderSection({
			equalMargins: false,
			margins: { top: 10, right: 12, bottom: 14, left: 16 },
		})
		fireEvent.click(screen.getByRole('checkbox', { name: 'Use equal margins' }))
		expect(onUpdate).toHaveBeenCalledWith({
			equalMargins: true,
			margins: { top: 10, right: 10, bottom: 10, left: 10 },
		})
	})

	it('keeps the margins when equal margins are turned off', () => {
		const margins = { top: 10, right: 10, bottom: 10, left: 10 }
		const onUpdate = renderSection({ equalMargins: true, margins })
		fireEvent.click(screen.getByRole('checkbox', { name: 'Use equal margins' }))
		expect(onUpdate).toHaveBeenCalledWith({ equalMargins: false, margins })
	})
})

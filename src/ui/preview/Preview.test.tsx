import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { type AppConfig, defaultAppConfig } from '../../config/AppConfig'
import { LAYOUT_IDS, type LayoutId } from '../../layouts'
import { Preview } from './Preview'

function noop() {}

/** The default config showing `layout`. */
function configFor(layout: LayoutId): AppConfig {
	return { ...defaultAppConfig(), layout }
}

// What each layout draws is tested in its folder, `ui/layouts/<layout-id>/`; these check that the
// preview draws the chosen one, whichever it is.
describe('Preview', () => {
	it.each(LAYOUT_IDS)('draws the pages of %s', (layout) => {
		const { container } = render(<Preview config={configFor(layout)} onResetLayout={noop} />)
		expect(container.querySelectorAll('section').length).toBeGreaterThan(0)
	})

	it('sets the printed paper size from the layout', () => {
		const { container } = render(
			<Preview config={configFor('month-per-page')} onResetLayout={noop} />,
		)
		expect(container.querySelector('style')?.textContent).toBe('@page { size: A4 landscape; }')
	})
})

import { render, screen } from '@testing-library/react'
import { createElement, type ComponentType } from 'react'

import { OpenSectionsContext, type OpenSections } from '../ui/sidebar/openSections'
import type { OptionsSectionProps } from '../ui/sidebar/Section'

function noop() {}

/** Every section open, so each one's fields are drawn too. */
const ALL_OPEN: OpenSections = { isOpen: () => true, toggle: noop }

/**
 * Renders a layout's options form with its defaults, every section open, as the sidebar would,
 * and returns the titles of its sections, top to bottom. Each is a `<fieldset>`; groups inside one
 * (like the margins) are part of that section.
 */
export function formSectionTitles<O>(Form: ComponentType<OptionsSectionProps<O>>, defaults: O) {
	const form = createElement(Form, { options: defaults, defaults, onUpdate: noop })
	render(createElement(OpenSectionsContext, { value: ALL_OPEN }, form))
	return screen
		.getAllByRole('group')
		.filter((group) => group.parentElement?.closest('fieldset') === null)
		.map((section) => section.querySelector('legend')!.textContent)
}

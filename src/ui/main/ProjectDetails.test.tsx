import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defaultLayoutOptions } from '../../layouts'
import { projectOf } from '../../workspace/Project'
import { ProjectDetails } from './ProjectDetails'

/** The value shown for `term`. */
function detail(term: string): string {
	return screen.getByText(term, { selector: 'dt' }).nextElementSibling!.textContent
}

describe('ProjectDetails', () => {
	it('shows the project’s name, Untitled when blank, and its layout, then Open', () => {
		const project = projectOf({
			id: '00000000-0000-4000-8000-000000000001',
			name: ' ',
			layout: 'weekly',
			options: defaultLayoutOptions('weekly'),
		})
		render(<ProjectDetails project={project} />)
		expect(screen.getByRole('heading', { name: 'Details' })).not.toBeNull()
		expect(detail('Name')).toBe('Untitled')
		expect(detail('Layout')).toBe('Weekly (one week per page)')
		expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Open' }).type).toBe('submit')
	})

	it('says how to make a project without one', () => {
		render(<ProjectDetails project={null} />)
		expect(screen.getByText(/^Create a document, or open a document file/)).not.toBeNull()
		expect(screen.queryByRole('button')).toBeNull()
	})
})

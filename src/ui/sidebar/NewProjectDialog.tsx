import { useState } from 'react'
import { LAYOUT_IDS, type LayoutId } from '../../layouts'
import { Dialog } from '../components/Dialog'
import { RadioField } from '../fields/RadioField'
import { TextField } from '../fields/TextField'
import { LAYOUT_VIEWS } from '../layouts/registry'

const LAYOUT_OPTIONS = LAYOUT_IDS.map((layout) => ({
	value: layout,
	label: LAYOUT_VIEWS[layout].label,
}))

interface NewProjectDialogProps {
	/** Creates the project, with its name as typed (`''` for none) and its layout. */
	onCreate: (name: string, layout: LayoutId) => void
	onCancel: () => void
}

/**
 * Asks for a new project's name, which it may go without, and its layout, which it keeps: the
 * first layout preselected. Create, or Enter in the name, creates it.
 */
export function NewProjectDialog({ onCreate, onCancel }: NewProjectDialogProps) {
	const [name, setName] = useState('')
	const [layout, setLayout] = useState<LayoutId>(LAYOUT_IDS[0])

	function handleDialogSubmit() {
		onCreate(name, layout)
	}

	return (
		<Dialog
			title="New project"
			submitLabel="Create"
			onSubmit={handleDialogSubmit}
			onCancel={onCancel}
		>
			<TextField label="Name" value={name} placeholder="Untitled" onChange={setName} />
			<RadioField
				label="Layout"
				value={layout}
				options={LAYOUT_OPTIONS}
				onChange={setLayout}
			/>
		</Dialog>
	)
}

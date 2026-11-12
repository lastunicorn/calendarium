import { useState } from 'react'
import type { ProjectId } from '../../workspace/Project'
import { Dialog } from '../components/Dialog'
import { RadioField } from '../fields/RadioField'
import type { Option } from '../fields/options'
import styles from './OpenProjectDialog.module.css'

interface OpenProjectDialogProps {
	/** The projects kept in this browser, in `projectList` order, labeled "Work 2027 — Weekly". */
	projects: readonly Option<ProjectId>[]
	/** The open project, checked when the dialog opens. */
	openId: ProjectId
	/** Opens the chosen project, which may be the open one. */
	onOpen: (id: ProjectId) => void
	onCancel: () => void
}

/**
 * Lists the projects kept in this browser, the open one checked and focused, to open another.
 * Open, or Enter on a project, opens the checked one. A long list scrolls.
 */
export function OpenProjectDialog({ projects, openId, onOpen, onCancel }: OpenProjectDialogProps) {
	const [chosen, setChosen] = useState(openId)

	function handleDialogSubmit() {
		onOpen(chosen)
	}

	return (
		<Dialog
			title="Open project"
			submitLabel="Open"
			onSubmit={handleDialogSubmit}
			onCancel={onCancel}
		>
			<div className={styles.list}>
				<RadioField
					label="Projects"
					value={chosen}
					options={projects}
					onChange={setChosen}
				/>
			</div>
		</Dialog>
	)
}

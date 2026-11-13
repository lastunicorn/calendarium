import { type ChangeEvent, type MouseEvent, useId, useState } from 'react'
import type { ProjectId } from '../../workspace/Project'
import { Dialog } from '../components/Dialog'
import type { Option } from '../fields/options'
import styles from './OpenProjectDialog.module.css'

interface OpenProjectDialogProps {
	/** The projects kept in this browser, in `projectList` order, labeled "Work 2027 — Weekly". */
	projects: readonly Option<ProjectId>[]
	/** The open project, chosen when the dialog opens. */
	openId: ProjectId
	/** Opens the chosen project, which may be the open one. */
	onOpen: (id: ProjectId) => void
	onCancel: () => void
}

/**
 * Lists the projects kept in this browser, one per row, to open another: the open one chosen and
 * focused, the arrows moving the choice. Open, or Enter, opens the chosen one; a double click
 * opens the project clicked. A list longer than the dialog has room for scrolls.
 *
 * The rows are a radio group, its radios hidden, so the keyboard and screen readers treat the
 * list as one choice among several with nothing more to it.
 */
export function OpenProjectDialog({ projects, openId, onOpen, onCancel }: OpenProjectDialogProps) {
	const name = useId()
	const [chosen, setChosen] = useState(openId)

	function handleDialogSubmit() {
		onOpen(chosen)
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		// Each radio carries its index in `projects`, which maps back to the project's id.
		setChosen(projects[Number(event.currentTarget.dataset.index)].value)
	}

	function handleRowDoubleClick(event: MouseEvent<HTMLLabelElement>) {
		onOpen(projects[Number(event.currentTarget.dataset.index)].value)
	}

	return (
		<Dialog
			title="Open project"
			submitLabel="Open"
			onSubmit={handleDialogSubmit}
			onCancel={onCancel}
		>
			<fieldset className={styles.field}>
				<legend className={styles.legend}>Projects</legend>
				<div className={styles.list}>
					{projects.map((project, index) => (
						// oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- a shortcut for Open
						<label
							key={project.value}
							className={styles.row}
							data-index={index}
							onDoubleClick={handleRowDoubleClick}
						>
							<input
								type="radio"
								className={styles.radio}
								name={name}
								checked={project.value === chosen}
								data-index={index}
								onChange={handleInputChange}
							/>
							{project.label}
						</label>
					))}
				</div>
			</fieldset>
		</Dialog>
	)
}

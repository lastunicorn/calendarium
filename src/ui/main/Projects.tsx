import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

import type { LayoutId } from '../../layouts'
import type { ProjectId } from '../../workspace/Project'
import { openProject, projectList, type Workspace } from '../../workspace/Workspace'
import { firstField, takeFocus } from '../components/focus'
import { CloseIcon } from '../components/icons'
import { projectLabel } from '../projectLabel'
import { NewProjectDialog } from './NewProjectDialog'
import { chosenProject } from './projectChoice'
import { ProjectDetails } from './ProjectDetails'
import { ProjectList } from './ProjectList'
import styles from './Projects.module.css'
import { useEscapeKey } from './useEscapeKey'

interface ProjectsProps {
	workspace: Workspace
	/** Adds a project, opening it only when none is open, and gives its id. */
	onCreate: (name: string, layout: LayoutId) => ProjectId
	/** Makes a project current, and shows its preview. */
	onOpen: (id: ProjectId) => void
	/** Goes back to the preview; absent when there is no open project to go back to. */
	onClose?: () => void
	/** Where the focus goes once Documents is gone, when nothing had it before. */
	returnFocus?: () => HTMLElement | null
}

/**
 * Documents, in the main area: the projects kept in this browser in a list, the chosen one's
 * details beside it, and the New document dialog, whose project is added to the list and chosen,
 * Documents staying shown. Open, Enter in the list or a double click makes the chosen project
 * current; Close, or Escape, goes back to the preview. The focus starts on the chosen row (the
 * open project's), or New document without a project, and goes back once Documents is gone.
 * Never printed.
 */
export function Projects({ workspace, onCreate, onOpen, onClose, returnFocus }: ProjectsProps) {
	const titleId = useId()
	const main = useRef<HTMLElement>(null)
	const newButton = useRef<HTMLButtonElement>(null)
	const [chosen, setChosen] = useState(workspace.open)
	const [creating, setCreating] = useState(false)
	const project = chosenProject(workspace, chosen)
	const projects = projectList(workspace).map((listed) => ({
		value: listed.id,
		label: projectLabel(listed),
	}))

	useEffect(() => {
		const restoreFocus = takeFocus()
		;(firstField(main.current) ?? newButton.current)?.focus()
		return () => {
			restoreFocus(returnFocus)
		}
	}, [returnFocus])

	useEscapeKey(main, onClose)

	function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (project !== null) onOpen(project.id)
	}

	function handleListNew() {
		setCreating(true)
	}

	function handleNewProjectCreate(name: string, layout: LayoutId) {
		setCreating(false)
		setChosen(onCreate(name, layout))
	}

	function handleNewProjectCancel() {
		setCreating(false)
	}

	return (
		<main ref={main} className={styles.projects} aria-labelledby={titleId}>
			<div className={styles.header}>
				<h2 id={titleId} className={styles.title}>
					Documents
				</h2>
				{onClose !== undefined && (
					<button
						type="button"
						className={styles.close}
						title="Close"
						aria-label="Close"
						onClick={onClose}
					>
						<CloseIcon />
					</button>
				)}
			</div>
			{/* One form, so Open and Enter on the list's radios both submit the chosen project. */}
			<form className={styles.columns} onSubmit={handleFormSubmit}>
				<ProjectList
					projects={projects}
					currentId={openProject(workspace)?.id ?? null}
					chosenId={project?.id ?? null}
					onChoose={setChosen}
					onOpen={onOpen}
					onNew={handleListNew}
					newRef={newButton}
				/>
				<ProjectDetails project={project} />
			</form>
			{/* Outside the form: a dialog has its own. */}
			{creating && (
				<NewProjectDialog
					onCreate={handleNewProjectCreate}
					onCancel={handleNewProjectCancel}
				/>
			)}
		</main>
	)
}

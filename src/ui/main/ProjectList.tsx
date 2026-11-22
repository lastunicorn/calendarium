import { useId, type ChangeEvent, type MouseEvent, type Ref } from 'react'

import type { ProjectId } from '../../workspace/Project'
import type { Option } from '../fields/options'
import styles from './ProjectList.module.css'

interface ProjectListProps {
	/** The projects kept in this browser, in `projectList` order, labeled "Work 2027 — Weekly". */
	projects: readonly Option<ProjectId>[]
	/** The open project, tagged Current; `null` when there is none. */
	currentId: ProjectId | null
	/** The chosen project, whose details show beside the list; `null` when there is none. */
	chosenId: ProjectId | null
	onChoose: (id: ProjectId) => void
	/** Makes a project current, from a double click on its row. */
	onOpen: (id: ProjectId) => void
	/** Asks for a new project's name and layout. */
	onNew: () => void
	/** The New document button, for the focus to go to when there is no row. */
	newRef?: Ref<HTMLButtonElement>
}

/**
 * Documents' list of the projects kept in this browser, under its heading and New document: one
 * row per project, the open one tagged Current, a click or the arrows choosing one, a double click
 * opening it; or a line saying there is none. A long list grows the main area, which scrolls.
 *
 * The rows are a radio group, its radios hidden, so the keyboard and screen readers treat the
 * list as one choice among several; the Current tag describes its radio, and isn't part of its
 * name.
 */
export function ProjectList({
	projects,
	currentId,
	chosenId,
	onChoose,
	onOpen,
	onNew,
	newRef,
}: ProjectListProps) {
	const titleId = useId()
	const name = useId()
	const currentTag = useId()

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		// Each radio carries its index in `projects`, which maps back to the project's id.
		onChoose(projects[Number(event.currentTarget.dataset.index)].value)
	}

	function handleRowDoubleClick(event: MouseEvent<HTMLLabelElement>) {
		onOpen(projects[Number(event.currentTarget.dataset.index)].value)
	}

	return (
		<div className={styles.column}>
			<div className={styles.header}>
				<h3 id={titleId} className={styles.title}>
					Your documents
				</h3>
				<button ref={newRef} type="button" className={styles.action} onClick={onNew}>
					New document…
				</button>
			</div>
			{projects.length === 0 ? (
				<p className={styles.empty}>No documents yet.</p>
			) : (
				<div className={styles.list} role="radiogroup" aria-labelledby={titleId}>
					{projects.map((project, index) => {
						const current = project.value === currentId
						return (
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
									checked={project.value === chosenId}
									aria-describedby={current ? currentTag : undefined}
									data-index={index}
									onChange={handleInputChange}
								/>
								<span className={styles.label}>{project.label}</span>
								{current && (
									<span
										id={currentTag}
										className={styles.current}
										aria-hidden="true"
									>
										Current
									</span>
								)}
							</label>
						)
					})}
				</div>
			)}
		</div>
	)
}

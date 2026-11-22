import type { Project } from '../../workspace/Project'
import { LAYOUT_VIEWS } from '../layouts/registry'
import { shownName } from '../projectLabel'
import styles from './ProjectDetails.module.css'

interface ProjectDetailsProps {
	/** The project chosen in the list; `null` when there is none. */
	project: Project | null
	/** Asks before deleting the project. */
	onDelete: () => void
}

/**
 * Documents' details panel: what there is to know about the project chosen in the list, its name
 * and its layout, one term and value each, then Delete, which asks first, and Open, which submits
 * the form it is in to make it current. Without a project, how to make one.
 */
export function ProjectDetails({ project, onDelete }: ProjectDetailsProps) {
	if (project === null) {
		return (
			<div className={styles.details}>
				<p className={styles.empty}>
					Create a document, or open a document file from the sidebar.
				</p>
			</div>
		)
	}
	return (
		<div className={styles.details}>
			<h3 className={styles.title}>Details</h3>
			<dl className={styles.facts}>
				<dt className={styles.term}>Name</dt>
				<dd className={styles.value}>{shownName(project)}</dd>
				<dt className={styles.term}>Layout</dt>
				<dd className={styles.value}>{LAYOUT_VIEWS[project.layout].label}</dd>
			</dl>
			<div className={styles.actions}>
				<button type="button" className={styles.action} onClick={onDelete}>
					Delete
				</button>
				<button type="submit" className={styles.action}>
					Open
				</button>
			</div>
		</div>
	)
}

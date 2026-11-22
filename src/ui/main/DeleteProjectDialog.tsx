import type { Project } from '../../workspace/Project'
import { Dialog } from '../components/Dialog'
import { shownName } from '../projectLabel'

interface DeleteProjectDialogProps {
	/** The project to delete. */
	project: Project
	/** Whether it is the open project, the one Save document to a file saves. */
	current: boolean
	onConfirm: () => void
	onCancel: () => void
	/** Where the focus goes once the project is deleted, its Delete button gone with its details. */
	returnFocus?: () => HTMLElement | null
}

/**
 * Asks before deleting a project, which can't be undone, unless it was saved to a file: the open
 * project can be saved at once, another one once opened.
 */
export function DeleteProjectDialog({
	project,
	current,
	onConfirm,
	onCancel,
	returnFocus,
}: DeleteProjectDialogProps) {
	return (
		<Dialog
			title="Delete document"
			submitLabel="Delete"
			onSubmit={onConfirm}
			onCancel={onCancel}
			returnFocus={returnFocus}
		>
			<p>
				Delete “{shownName(project)}”? It can’t be undone;{' '}
				{current ? 'save it' : 'open it and save it'} to a file first to keep it.
			</p>
		</Dialog>
	)
}

import type { Project } from '../../workspace/Project'
import { Dialog } from '../components/Dialog'
import { shownName } from '../projectLabel'

interface DeleteProjectDialogProps {
	/** The open project, the one to delete. */
	project: Project
	onConfirm: () => void
	onCancel: () => void
}

/** Asks before deleting a project, which can't be undone, unless it was saved to a file. */
export function DeleteProjectDialog({ project, onConfirm, onCancel }: DeleteProjectDialogProps) {
	return (
		<Dialog
			title="Delete document"
			submitLabel="Delete"
			onSubmit={onConfirm}
			onCancel={onCancel}
		>
			<p>
				Delete “{shownName(project)}”? It can’t be undone; save it to a file first to keep
				it.
			</p>
		</Dialog>
	)
}

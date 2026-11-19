import type { Project } from '../../workspace/Project'
import { Dialog } from '../components/Dialog'
import { shownName } from '../projectLabel'

interface OverwriteProjectDialogProps {
	/** The project kept in this browser with the opened file's id. */
	existing: Project
	onConfirm: () => void
	onCancel: () => void
}

/** Asks whether an opened file overwrites the project with its id, whose settings are then lost. */
export function OverwriteProjectDialog({
	existing,
	onConfirm,
	onCancel,
}: OverwriteProjectDialogProps) {
	return (
		<Dialog
			title="Overwrite document"
			submitLabel="Overwrite"
			onSubmit={onConfirm}
			onCancel={onCancel}
		>
			<p>
				“{shownName(existing)}” is already one of your documents. Overwrite it with the
				file’s version? Its current settings are lost.
			</p>
		</Dialog>
	)
}

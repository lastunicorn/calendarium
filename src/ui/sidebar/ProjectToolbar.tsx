import {
	useRef,
	useState,
	type ChangeEvent,
	type FocusEvent,
	type PointerEvent,
	type Ref,
} from 'react'

import { IconButton } from '../components/IconButton'
import { NewIcon, OpenIcon, PrintIcon, SaveIcon, SwitchIcon, TrashIcon } from '../components/icons'
import styles from './ProjectToolbar.module.css'

function handlePrintClick() {
	window.print()
}

/** The label of the action button `target` is in, or empty outside a button. */
function actionLabel(target: EventTarget): string {
	return (target instanceof Element && target.closest('button')?.title) || ''
}

interface ProjectToolbarProps {
	/** Whether a project is open, for the actions on it to show and Print to be enabled. */
	hasProject: boolean
	/** Asks for a new project's name and layout. */
	onNew: () => void
	/** Asks which project to open instead. */
	onChange: () => void
	/** Asks before deleting the open project. */
	onDelete: () => void
	/** Opens the project file the user chose. */
	onOpenFile: (file: File) => void
	/** Saves the open project to a file. */
	onSave: () => void
	/** The Change document button, for the focus to go to once a project is created. */
	changeProjectRef?: Ref<HTMLButtonElement>
}

/**
 * The project section's buttons, labeled by their icons alone: New, Change and Delete document,
 * then, apart, Open a document file, through a hidden file input, and Save document to a file,
 * and, apart again, Print. The hovered or focused button's label shows under them. Without a
 * project, only New, Open and Print, disabled, show.
 */
export function ProjectToolbar({
	hasProject,
	onNew,
	onChange,
	onDelete,
	onOpenFile,
	onSave,
	changeProjectRef,
}: ProjectToolbarProps) {
	const fileInput = useRef<HTMLInputElement>(null)
	const [hint, setHint] = useState('')

	function handleActionsPointerOver(event: PointerEvent<HTMLDivElement>) {
		setHint(actionLabel(event.target))
	}

	function handleActionsFocus(event: FocusEvent<HTMLDivElement>) {
		setHint(actionLabel(event.target))
	}

	function handleActionsLeave() {
		setHint('')
	}

	function handleOpenClick() {
		fileInput.current?.click()
	}

	function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
		const input = event.currentTarget
		const file = input.files?.[0]
		// Reset so choosing the same file again still fires `change`.
		input.value = ''
		if (file) onOpenFile(file)
	}

	return (
		<div className={styles.actionsGroup}>
			<div
				className={styles.actions}
				role="toolbar"
				aria-label="Document"
				onPointerOver={handleActionsPointerOver}
				onPointerLeave={handleActionsLeave}
				onFocus={handleActionsFocus}
				onBlur={handleActionsLeave}
			>
				<IconButton label="New document…" icon={<NewIcon />} onClick={onNew} />
				{hasProject && (
					<>
						<IconButton
							label="Change document…"
							icon={<SwitchIcon />}
							onClick={onChange}
							ref={changeProjectRef}
						/>
						<IconButton
							label="Delete document"
							icon={<TrashIcon />}
							onClick={onDelete}
						/>
					</>
				)}
				{/* The file actions, importing and exporting a project, apart from the others. */}
				<div className={styles.separator} role="separator" aria-orientation="vertical" />
				<IconButton
					label="Open a document file"
					icon={<OpenIcon />}
					onClick={handleOpenClick}
				/>
				{hasProject && (
					<IconButton
						label="Save document to a file"
						icon={<SaveIcon />}
						onClick={onSave}
					/>
				)}
				<div className={styles.separator} role="separator" aria-orientation="vertical" />
				<IconButton
					label="Print"
					icon={<PrintIcon />}
					disabled={!hasProject}
					onClick={handlePrintClick}
				/>
				<input
					ref={fileInput}
					type="file"
					accept=".json,application/json"
					hidden
					onChange={handleFileInputChange}
				/>
			</div>
			{/* The buttons are already named by their labels; this repeats one for the eye. */}
			<p className={styles.hint} aria-hidden="true">
				{hint}
			</p>
		</div>
	)
}

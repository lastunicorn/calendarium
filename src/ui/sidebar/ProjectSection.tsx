import {
	type ChangeEvent,
	type FocusEvent,
	type PointerEvent,
	type Ref,
	useRef,
	useState,
} from 'react'
import { openProject, projectList, type Workspace } from '../../workspace/Workspace'
import type { Project, ProjectId } from '../../workspace/Project'
import { type OpenedProjectFile, parseProjectFile, projectFile } from '../../workspace/projectFile'
import { Dialog } from '../components/Dialog'
import { IconButton } from '../components/IconButton'
import { LayoutIcon, NewIcon, OpenIcon, SaveIcon, TrashIcon } from '../components/icons'
import { downloadFile } from '../download'
import { SelectField } from '../fields/SelectField'
import { TextField } from '../fields/TextField'
import { LAYOUT_VIEWS } from '../layouts/registry'
import styles from './ProjectSection.module.css'
import { Section } from './Section'

/** A project file that was read. */
type OpenedFile = Extract<OpenedProjectFile, { ok: true }>

/** A file waiting for the user to say whether it overwrites the project with its id. */
interface PendingOverwrite {
	fileName: string
	opened: OpenedFile
	/** The project it would overwrite. */
	existing: Project
}

interface ProjectSectionProps {
	workspace: Workspace
	/** Opens another project. */
	onOpen: (id: ProjectId) => void
	/** Renames the open project. */
	onRename: (name: string) => void
	/** Asks for a new project's name and layout. */
	onNew: () => void
	/** Adds an opened file's project, or replaces the one with its id, and opens it. */
	onImport: (project: Project<ProjectId | null>) => void
	/** Deletes a project, once confirmed. */
	onDelete: (id: ProjectId) => void
	/** The project picker, for the focus to go to once a project is created. */
	pickerRef?: Ref<HTMLSelectElement>
}

/** A project's name as shown: trimmed, or "Untitled". */
function shownName({ name }: Project): string {
	return name.trim() || 'Untitled'
}

/** The picker's label of a project: its name and its layout's short name, "Work 2027 — Weekly". */
function projectLabel(project: Project): string {
	return `${shownName(project)} — ${LAYOUT_VIEWS[project.layout].name}`
}

/**
 * What to tell the user about an opened project file made by a newer version, or with invalid fields;
 * empty when there is nothing to report.
 */
function describeOpened(fileName: string, { ignored, newer }: OpenedFile): string {
	const notices = []
	if (newer) {
		notices.push(`Opened ${fileName}, made by a newer version; some settings may be ignored.`)
	}
	if (ignored.length > 0) {
		const settings = ignored.length === 1 ? '1 setting was' : `${ignored.length} settings were`
		const fields = ignored.join(', ')
		notices.push(
			newer
				? `${settings} invalid and kept the default: ${fields}.`
				: `Opened ${fileName}; ${settings} invalid and kept the default: ${fields}.`,
		)
	}
	return notices.join(' ')
}

/** Why a file could not be opened, for the user. */
function describeRejected(
	fileName: string,
	{ reason }: Extract<OpenedProjectFile, { ok: false }>,
): string {
	switch (reason) {
		case 'notProject':
			return `${fileName} is not a calendar project file.`
		case 'unknownLayout':
			return `${fileName} was made by a newer version, with a layout this one doesn’t have.`
	}
}

/** The label of the action button `target` is in, or empty outside a button. */
function actionLabel(target: EventTarget): string {
	return (target instanceof Element && target.closest('button')?.title) || ''
}

/**
 * The project being made: the picker of the projects kept in this browser, the open one's name
 * and its layout, which it keeps, above the starting of a new project, the opening of a project
 * file, the saving of the open project to one and its deleting. Opening a file of a project
 * already kept, or deleting one, asks first. Without a project, only New and Open show. Always
 * open.
 */
export function ProjectSection({
	workspace,
	onOpen,
	onRename,
	onNew,
	onImport,
	onDelete,
	pickerRef,
}: ProjectSectionProps) {
	const project = openProject(workspace)

	const fileInput = useRef<HTMLInputElement>(null)
	const [openError, setOpenError] = useState('')
	const [openNotice, setOpenNotice] = useState('')
	const [hint, setHint] = useState('')
	const [pendingOverwrite, setPendingOverwrite] = useState<PendingOverwrite | null>(null)
	const [confirmingDelete, setConfirmingDelete] = useState(false)

	const projectOptions = projectList(workspace).map((listed) => ({
		value: listed.id,
		label: projectLabel(listed),
	}))

	function handleActionsPointerOver(event: PointerEvent<HTMLDivElement>) {
		setHint(actionLabel(event.target))
	}

	function handleActionsFocus(event: FocusEvent<HTMLDivElement>) {
		setHint(actionLabel(event.target))
	}

	function handleActionsLeave() {
		setHint('')
	}

	function handleNewClick() {
		setOpenError('')
		setOpenNotice('')
		onNew()
	}

	function handleOpenClick() {
		fileInput.current?.click()
	}

	function handleSaveClick() {
		if (project === null) return
		const file = projectFile(project)
		downloadFile(file.fileName, file.text, 'application/json')
	}

	function handleDeleteClick() {
		setConfirmingDelete(true)
	}

	function handleDeleteConfirm() {
		setConfirmingDelete(false)
		if (project !== null) onDelete(project.id)
	}

	function handleDeleteCancel() {
		setConfirmingDelete(false)
	}

	/** Adds or overwrites the project a file holds, and tells what there is to tell about it. */
	function importOpened(fileName: string, opened: OpenedFile) {
		setOpenNotice(describeOpened(fileName, opened))
		onImport(opened.project)
	}

	async function handleOpenFileChange(event: ChangeEvent<HTMLInputElement>) {
		const input = event.currentTarget
		const file = input.files?.[0]
		// Reset so choosing the same file again still fires `change`.
		input.value = ''
		if (!file) return

		const opened = parseProjectFile(await file.text(), file.name)
		setOpenError('')
		setOpenNotice('')
		if (!opened.ok) {
			setOpenError(describeRejected(file.name, opened))
			return
		}
		const { id } = opened.project
		if (id !== null && Object.hasOwn(workspace.projects, id)) {
			setPendingOverwrite({ fileName: file.name, opened, existing: workspace.projects[id] })
			return
		}
		importOpened(file.name, opened)
	}

	function handleOverwriteConfirm() {
		if (pendingOverwrite === null) return
		setPendingOverwrite(null)
		importOpened(pendingOverwrite.fileName, pendingOverwrite.opened)
	}

	function handleOverwriteCancel() {
		setPendingOverwrite(null)
	}

	return (
		<Section title="Project" icon={<LayoutIcon />} collapsible={false}>
			{project !== null && (
				<>
					<SelectField
						label="Project"
						value={project.id}
						options={projectOptions}
						onChange={onOpen}
						ref={pickerRef}
					/>
					<TextField
						label="Name"
						value={project.name}
						placeholder="Untitled"
						onChange={onRename}
					/>
					<p className={styles.layout}>Layout: {LAYOUT_VIEWS[project.layout].label}</p>
				</>
			)}
			<div className={styles.actionsGroup}>
				<div
					className={styles.actions}
					role="toolbar"
					aria-label="Project"
					onPointerOver={handleActionsPointerOver}
					onPointerLeave={handleActionsLeave}
					onFocus={handleActionsFocus}
					onBlur={handleActionsLeave}
				>
					<IconButton label="New project…" icon={<NewIcon />} onClick={handleNewClick} />
					<IconButton
						label="Open a project file"
						icon={<OpenIcon />}
						onClick={handleOpenClick}
					/>
					{project !== null && (
						<>
							<IconButton
								label="Save project to a file"
								icon={<SaveIcon />}
								onClick={handleSaveClick}
							/>
							<IconButton
								label="Delete project"
								icon={<TrashIcon />}
								onClick={handleDeleteClick}
							/>
						</>
					)}
					<input
						ref={fileInput}
						type="file"
						accept=".json,application/json"
						hidden
						onChange={handleOpenFileChange}
					/>
				</div>
				{/* The buttons are already named by their labels; this repeats one for the eye. */}
				<p className={styles.hint} aria-hidden="true">
					{hint}
				</p>
			</div>

			{openError && (
				<p className={styles.error} role="alert">
					{openError}
				</p>
			)}
			{openNotice && (
				<p className={styles.notice} role="status">
					{openNotice}
				</p>
			)}

			{pendingOverwrite !== null && (
				<Dialog
					title="Overwrite project"
					submitLabel="Overwrite"
					onSubmit={handleOverwriteConfirm}
					onCancel={handleOverwriteCancel}
				>
					<p>
						“{shownName(pendingOverwrite.existing)}” is already one of your projects.
						Overwrite it with the file’s version? Its current settings are lost.
					</p>
				</Dialog>
			)}
			{confirmingDelete && project !== null && (
				<Dialog
					title="Delete project"
					submitLabel="Delete"
					onSubmit={handleDeleteConfirm}
					onCancel={handleDeleteCancel}
				>
					<p>
						Delete “{shownName(project)}”? It can’t be undone; save it to a file first
						to keep it.
					</p>
				</Dialog>
			)}
		</Section>
	)
}

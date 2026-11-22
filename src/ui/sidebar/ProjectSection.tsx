import { useState, type Ref } from 'react'

import type { Project, ProjectId } from '../../workspace/Project'
import { projectFile } from '../../workspace/projectFile'
import type { SaveFailure } from '../../workspace/storage'
import { openProject, type Workspace } from '../../workspace/Workspace'
import { LayoutIcon } from '../components/icons'
import { downloadFile } from '../download'
import { ReadOnlyField } from '../fields/ReadOnlyField'
import { TextField } from '../fields/TextField'
import { LAYOUT_VIEWS } from '../layouts/registry'
import { DeleteProjectDialog } from './DeleteProjectDialog'
import { OverwriteProjectDialog } from './OverwriteProjectDialog'
import { describeSaveFailure } from './projectFileNotices'
import styles from './ProjectSection.module.css'
import { ProjectToolbar } from './ProjectToolbar'
import { Section } from './Section'
import { useProjectFileOpener } from './useProjectFileOpener'

interface ProjectSectionProps {
	workspace: Workspace
	/** Why the workspace's last change wasn't saved in this browser; `null` when it was. */
	saveFailure: SaveFailure | null
	/** Renames the open project. */
	onRename: (name: string) => void
	/** Asks for a new project's name and layout. */
	onNew: () => void
	/** Asks which project to open instead. */
	onChange: () => void
	/** Adds an opened file's project, or replaces the one with its id, and opens it. */
	onImport: (project: Project<ProjectId | null>) => void
	/** Deletes a project, once confirmed. */
	onDelete: (id: ProjectId) => void
	/** The Change document button, for the focus to go to once a project is created. */
	changeProjectRef?: Ref<HTMLButtonElement>
}

/**
 * The project being made: the `ProjectToolbar`'s actions on it, starting a new project, asking to
 * change the open one for another of the projects kept in this browser, deleting it, opening a
 * project file, saving it to one and printing it, above the open project's name and its layout,
 * which it keeps. Opening a file of a project already kept, or
 * deleting one, asks first. While changes can't be saved in this browser, it says so. Always open.
 */
export function ProjectSection({
	workspace,
	saveFailure,
	onRename,
	onNew,
	onChange,
	onImport,
	onDelete,
	changeProjectRef,
}: ProjectSectionProps) {
	const project = openProject(workspace)
	const fileOpener = useProjectFileOpener(workspace.projects, onImport)
	const [confirmingDelete, setConfirmingDelete] = useState(false)

	function handleToolbarNew() {
		fileOpener.dismiss()
		onNew()
	}

	function handleToolbarSave() {
		if (project === null) return
		const file = projectFile(project)
		downloadFile(file.fileName, file.text, 'application/json')
	}

	function handleToolbarDelete() {
		setConfirmingDelete(true)
	}

	function handleDeleteConfirm() {
		setConfirmingDelete(false)
		if (project !== null) onDelete(project.id)
	}

	function handleDeleteCancel() {
		setConfirmingDelete(false)
	}

	return (
		<Section id="project" title="Document" icon={<LayoutIcon />} collapsible={false}>
			<ProjectToolbar
				hasProject={project !== null}
				onNew={handleToolbarNew}
				onChange={onChange}
				onDelete={handleToolbarDelete}
				onOpenFile={fileOpener.open}
				onSave={handleToolbarSave}
				changeProjectRef={changeProjectRef}
			/>

			{/* Shown until a save is written again, since every change until then is lost on reload. */}
			{saveFailure !== null && (
				<p className={styles.error} role="alert">
					{describeSaveFailure(saveFailure)}
				</p>
			)}
			{fileOpener.error && (
				<p className={styles.error} role="alert">
					{fileOpener.error}
				</p>
			)}
			{fileOpener.notice && (
				<p className={styles.notice} role="status">
					{fileOpener.notice}
				</p>
			)}

			{project !== null && (
				<>
					<TextField
						label="Name"
						value={project.name}
						placeholder="Untitled"
						onChange={onRename}
					/>
					<ReadOnlyField label="Layout" value={LAYOUT_VIEWS[project.layout].label} />
				</>
			)}

			{fileOpener.overwriting !== null && (
				<OverwriteProjectDialog
					existing={fileOpener.overwriting}
					onConfirm={fileOpener.confirmOverwrite}
					onCancel={fileOpener.cancelOverwrite}
				/>
			)}
			{confirmingDelete && project !== null && (
				<DeleteProjectDialog
					project={project}
					onConfirm={handleDeleteConfirm}
					onCancel={handleDeleteCancel}
				/>
			)}
		</Section>
	)
}

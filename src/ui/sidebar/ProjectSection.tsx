import type { Ref } from 'react'

import type { Project, ProjectId } from '../../workspace/Project'
import { projectFile } from '../../workspace/projectFile'
import type { SaveFailure } from '../../workspace/storage'
import { openProject, type Workspace } from '../../workspace/Workspace'
import { LayoutIcon } from '../components/icons'
import { downloadFile } from '../download'
import { ReadOnlyField } from '../fields/ReadOnlyField'
import { TextField } from '../fields/TextField'
import { LAYOUT_VIEWS } from '../layouts/registry'
import type { MainContent } from '../main/mainContent'
import { OverwriteProjectDialog } from './OverwriteProjectDialog'
import { describeSaveFailure } from './projectFileNotices'
import styles from './ProjectSection.module.css'
import { ProjectToolbar } from './ProjectToolbar'
import { Section } from './Section'
import { useProjectFileOpener } from './useProjectFileOpener'

interface ProjectSectionProps {
	workspace: Workspace
	/** What the main area shows: the actions on the open project only show beside its preview. */
	content: MainContent
	/** Why the workspace's last change wasn't saved in this browser; `null` when it was. */
	saveFailure: SaveFailure | null
	/** Renames the open project. */
	onRename: (name: string) => void
	/** Asks for a new project's name and layout. */
	onNew: () => void
	/** Shows Documents, or the preview again while Documents shows. */
	onManage: () => void
	/** Adds an opened file's project, or replaces the one with its id, and opens it. */
	onImport: (project: Project<ProjectId | null>) => void
	/** The Manage documents button, for the focus to go to once Documents is gone. */
	manageRef?: Ref<HTMLButtonElement>
}

/**
 * The project being made: the `ProjectToolbar`'s actions on it, starting a new project, showing
 * Documents, the projects kept in this browser, where they are opened and deleted, opening a
 * project file, saving it to one and printing it, above the open project's name and its layout,
 * which it keeps. While the main area shows Documents, the actions on the open project and its
 * name and layout hide, as it isn't in view. Opening a file of a project already kept asks first.
 * While changes can't be saved in this browser, it says so. Always open.
 */
export function ProjectSection({
	workspace,
	content,
	saveFailure,
	onRename,
	onNew,
	onManage,
	onImport,
	manageRef,
}: ProjectSectionProps) {
	const project = openProject(workspace)
	const shown = content === 'preview' ? project : null
	const fileOpener = useProjectFileOpener(workspace.projects, onImport)

	function handleToolbarNew() {
		fileOpener.dismiss()
		onNew()
	}

	function handleToolbarSave() {
		if (project === null) return
		const file = projectFile(project)
		downloadFile(file.fileName, file.text, 'application/json')
	}

	return (
		<Section id="project" title="Document" icon={<LayoutIcon />} collapsible={false}>
			<ProjectToolbar
				showsProject={shown !== null}
				managing={content === 'projects'}
				onNew={handleToolbarNew}
				onManage={onManage}
				onOpenFile={fileOpener.open}
				onSave={handleToolbarSave}
				manageRef={manageRef}
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

			{shown !== null && (
				<>
					<TextField
						label="Name"
						value={shown.name}
						placeholder="Untitled"
						onChange={onRename}
					/>
					<ReadOnlyField label="Layout" value={LAYOUT_VIEWS[shown.layout].label} />
				</>
			)}

			{fileOpener.overwriting !== null && (
				<OverwriteProjectDialog
					existing={fileOpener.overwriting}
					onConfirm={fileOpener.confirmOverwrite}
					onCancel={fileOpener.cancelOverwrite}
				/>
			)}
		</Section>
	)
}

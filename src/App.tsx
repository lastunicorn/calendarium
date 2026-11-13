import { useCallback, useRef, useState } from 'react'
import styles from './App.module.css'
import type { LayoutId } from './layouts'
import { EmptyPreview } from './ui/preview/EmptyPreview'
import { Preview } from './ui/preview/Preview'
import { NewProjectDialog } from './ui/sidebar/NewProjectDialog'
import { WorkspaceForm } from './ui/sidebar/WorkspaceForm'
import { Sidebar } from './ui/sidebar/Sidebar'
import { usePreferences } from './ui/usePreferences'
import { useWorkspace } from './ui/useWorkspace'
import type { ProjectId } from './workspace/Project'
import { openProject } from './workspace/Workspace'

export default function App() {
	const {
		workspace,
		saveFailure,
		createProject,
		openProject: openProjectById,
		renameProject,
		updateOptions,
		resetOptions,
		deleteProject,
		importProject,
	} = useWorkspace()
	const { preferences, resizeSidebar, toggleSection, zoomPreview } = usePreferences()
	const project = openProject(workspace)
	// Held here, since the project section and the empty preview both open it. It opens by itself
	// on a first launch, with no project.
	const [creatingProject, setCreatingProject] = useState(project === null)
	// Where the focus goes once a project is created with nothing to go back to: on a first
	// launch, or from the empty preview, whose button the new project replaces.
	const changeProject = useRef<HTMLButtonElement>(null)

	// Stable, since the dialog's opening effect depends on it.
	const changeProjectElement = useCallback(() => changeProject.current, [])

	function handleNewProject() {
		setCreatingProject(true)
	}

	function handleNewProjectCreate(name: string, layout: LayoutId) {
		setCreatingProject(false)
		createProject(name, layout)
	}

	function handleNewProjectCancel() {
		setCreatingProject(false)
	}

	// Deleting the last project asks for a new one, as a first launch does.
	function handleProjectDelete(id: ProjectId) {
		const projectIds = Object.keys(workspace.projects)
		deleteProject(id)
		if (projectIds.length === 1 && projectIds[0] === id) setCreatingProject(true)
	}

	return (
		<div className={styles.app}>
			<Sidebar width={preferences.sidebarWidth} onResize={resizeSidebar}>
				<WorkspaceForm
					workspace={workspace}
					saveFailure={saveFailure}
					onOpenProject={openProjectById}
					onRenameProject={renameProject}
					onUpdate={updateOptions}
					onNewProject={handleNewProject}
					onImportProject={importProject}
					onDeleteProject={handleProjectDelete}
					openSection={preferences.openSection}
					onToggleSection={toggleSection}
					changeProjectRef={changeProject}
				/>
			</Sidebar>
			{project === null ? (
				<EmptyPreview onNewProject={handleNewProject} />
			) : (
				<Preview
					project={project}
					onResetOptions={resetOptions}
					zoom={preferences.previewZoom}
					onZoom={zoomPreview}
				/>
			)}
			{creatingProject && (
				<NewProjectDialog
					onCreate={handleNewProjectCreate}
					onCancel={handleNewProjectCancel}
					returnFocus={changeProjectElement}
				/>
			)}
		</div>
	)
}

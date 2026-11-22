import { useCallback, useRef, useState } from 'react'

import styles from './App.module.css'
import type { LayoutId } from './layouts'
import { Main } from './ui/main/Main'
import { shownContent, type MainContent } from './ui/main/mainContent'
import { Sidebar } from './ui/sidebar/Sidebar'
import { WorkspaceForm } from './ui/sidebar/WorkspaceForm'
import { usePreferences } from './ui/usePreferences'
import { useTheme } from './ui/useTheme'
import { useWorkspace } from './ui/useWorkspace'
import type { Project, ProjectId } from './workspace/Project'

export default function App() {
	const {
		workspace,
		saveFailure,
		createProject,
		openProject,
		renameProject,
		updateOptions,
		resetOptions,
		deleteProject,
		importProject,
	} = useWorkspace()
	const { preferences, resizeSidebar, toggleSection, zoomPreview, changeTheme } = usePreferences()
	useTheme(preferences.theme)
	// What the main area is asked to show, held here since the sidebar's Manage documents asks too;
	// never stored, so a reload shows the preview. Documents shows anyway while no project is open.
	const [requested, setRequested] = useState<MainContent>('preview')
	const content = shownContent(requested, workspace)
	// The sidebar's New document dialog, held here since it opens from the sidebar over the main area.
	const [creatingProject, setCreatingProject] = useState(false)
	// Where the focus goes once Documents or the New document dialog is gone, when there is nothing
	// to go back to.
	const manageProjects = useRef<HTMLButtonElement>(null)

	// Stable, since the opening effects of Documents and the dialog depend on it.
	const manageProjectsElement = useCallback(() => manageProjects.current, [])

	function handleNewProject() {
		setCreatingProject(true)
	}

	function handleNewProjectCreate(name: string, layout: LayoutId) {
		setCreatingProject(false)
		createProject(name, layout)
		setRequested('preview')
	}

	function handleNewProjectCancel() {
		setCreatingProject(false)
	}

	function handleManageProjects() {
		setRequested(content === 'projects' ? 'preview' : 'projects')
	}

	// Asked for too, as Documents may show only for want of a project, which this one may become.
	function handleProjectsAdd(name: string, layout: LayoutId): ProjectId {
		setRequested('projects')
		return createProject(name, layout, false)
	}

	function handleProjectsOpen(id: ProjectId) {
		openProject(id)
		setRequested('preview')
	}

	function handleProjectsClose() {
		setRequested('preview')
	}

	function handleImportProject(project: Project<ProjectId | null>) {
		importProject(project)
		setRequested('preview')
	}

	return (
		<div className={styles.app}>
			<Sidebar
				width={preferences.sidebarWidth}
				onResize={resizeSidebar}
				theme={preferences.theme}
				onThemeChange={changeTheme}
			>
				<WorkspaceForm
					workspace={workspace}
					content={content}
					saveFailure={saveFailure}
					onRenameProject={renameProject}
					onUpdate={updateOptions}
					onNewProject={handleNewProject}
					onManageProjects={handleManageProjects}
					onImportProject={handleImportProject}
					openSection={preferences.openSection}
					onToggleSection={toggleSection}
					manageProjectsRef={manageProjects}
				/>
			</Sidebar>
			<Main
				workspace={workspace}
				content={content}
				onAddProject={handleProjectsAdd}
				onOpenProject={handleProjectsOpen}
				onDeleteProject={deleteProject}
				onCloseProjects={handleProjectsClose}
				creatingProject={creatingProject}
				onCreateProject={handleNewProjectCreate}
				onCancelNewProject={handleNewProjectCancel}
				onResetOptions={resetOptions}
				zoom={preferences.previewZoom}
				onZoom={zoomPreview}
				returnFocus={manageProjectsElement}
			/>
		</div>
	)
}

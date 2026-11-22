import { useCallback, useRef, useState } from 'react'

import styles from './App.module.css'
import type { LayoutId } from './layouts'
import { EmptyPreview } from './ui/preview/EmptyPreview'
import { Preview } from './ui/preview/Preview'
import { projectLabel } from './ui/projectLabel'
import { NewProjectDialog } from './ui/sidebar/NewProjectDialog'
import { OpenProjectDialog } from './ui/sidebar/OpenProjectDialog'
import { Sidebar } from './ui/sidebar/Sidebar'
import { WorkspaceForm } from './ui/sidebar/WorkspaceForm'
import { usePreferences } from './ui/usePreferences'
import { useTheme } from './ui/useTheme'
import { useWorkspace } from './ui/useWorkspace'
import type { ProjectId } from './workspace/Project'
import { openProject, projectList } from './workspace/Workspace'

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
	const { preferences, resizeSidebar, toggleSection, zoomPreview, changeTheme } = usePreferences()
	useTheme(preferences.theme)
	const project = openProject(workspace)
	// The Open document dialog's rows, in the order it lists them.
	const projectOptions = projectList(workspace).map((listed) => ({
		value: listed.id,
		label: projectLabel(listed),
	}))
	// Held here, since the project section and the empty preview both open it. It opens only when
	// asked: with no project, the empty preview offers it, beside the sidebar's other actions.
	const [creatingProject, setCreatingProject] = useState(false)
	// Held here too, as the project section's Change document asks for it.
	const [choosingProject, setChoosingProject] = useState(false)
	// Where the focus goes once a project is created with nothing to go back to: from the empty
	// preview, whose button the new project replaces.
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

	function handleChangeProject() {
		setChoosingProject(true)
	}

	function handleOpenProjectSubmit(id: ProjectId) {
		setChoosingProject(false)
		openProjectById(id)
	}

	function handleOpenProjectCancel() {
		setChoosingProject(false)
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
					saveFailure={saveFailure}
					onRenameProject={renameProject}
					onUpdate={updateOptions}
					onNewProject={handleNewProject}
					onChangeProject={handleChangeProject}
					onImportProject={importProject}
					onDeleteProject={deleteProject}
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
			{choosingProject && project !== null && (
				<OpenProjectDialog
					projects={projectOptions}
					openId={project.id}
					onOpen={handleOpenProjectSubmit}
					onCancel={handleOpenProjectCancel}
				/>
			)}
		</div>
	)
}

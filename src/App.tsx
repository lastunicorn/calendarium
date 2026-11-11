import styles from './App.module.css'
import { Preview } from './ui/preview/Preview'
import { WorkspaceForm } from './ui/sidebar/WorkspaceForm'
import { Sidebar } from './ui/sidebar/Sidebar'
import { Toolbar } from './ui/sidebar/Toolbar'
import { usePreferences } from './ui/usePreferences'
import { useWorkspace } from './ui/useWorkspace'
import { openProject } from './workspace/Workspace'

export default function App() {
	const { workspace, selectLayout, update, resetOptions, importProject } = useWorkspace()
	const { preferences, resizeSidebar, toggleSection, zoomPreview } = usePreferences()
	// `useWorkspace` always opens a project.
	const project = openProject(workspace)
	if (project === null) return null

	return (
		<div className={styles.app}>
			<Sidebar width={preferences.sidebarWidth} onResize={resizeSidebar}>
				<Toolbar />
				<WorkspaceForm
					project={project}
					onSelectLayout={selectLayout}
					onUpdate={update}
					onNewProject={resetOptions}
					onOpenProject={importProject}
					openSection={preferences.openSection}
					onToggleSection={toggleSection}
				/>
			</Sidebar>
			<Preview
				project={project}
				onNewProject={resetOptions}
				zoom={preferences.previewZoom}
				onZoom={zoomPreview}
			/>
		</div>
	)
}

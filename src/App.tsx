import styles from './App.module.css'
import { Preview } from './ui/preview/Preview'
import { WorkspaceForm } from './ui/sidebar/WorkspaceForm'
import { Sidebar } from './ui/sidebar/Sidebar'
import { Toolbar } from './ui/sidebar/Toolbar'
import { usePreferences } from './ui/usePreferences'
import { useWorkspace } from './ui/useWorkspace'

export default function App() {
	const { workspace, selectLayout, update, newProject, openProject } = useWorkspace()
	const { preferences, resizeSidebar, toggleSection, zoomPreview } = usePreferences()

	return (
		<div className={styles.app}>
			<Sidebar width={preferences.sidebarWidth} onResize={resizeSidebar}>
				<Toolbar />
				<WorkspaceForm
					workspace={workspace}
					onSelectLayout={selectLayout}
					onUpdate={update}
					onNewProject={newProject}
					onOpenProject={openProject}
					openSection={preferences.openSection}
					onToggleSection={toggleSection}
				/>
			</Sidebar>
			<Preview
				workspace={workspace}
				onNewProject={newProject}
				zoom={preferences.previewZoom}
				onZoom={zoomPreview}
			/>
		</div>
	)
}

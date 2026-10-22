import styles from './App.module.css'
import { Preview } from './ui/preview/Preview'
import { WorkspaceForm } from './ui/sidebar/WorkspaceForm'
import { Sidebar } from './ui/sidebar/Sidebar'
import { Toolbar } from './ui/sidebar/Toolbar'
import { useWorkspace } from './ui/useWorkspace'

export default function App() {
	const { workspace, selectLayout, update, newProject, openProject } = useWorkspace()

	return (
		<div className={styles.app}>
			<Sidebar>
				<Toolbar />
				<WorkspaceForm
					workspace={workspace}
					onSelectLayout={selectLayout}
					onUpdate={update}
					onNewProject={newProject}
					onOpenProject={openProject}
				/>
			</Sidebar>
			<Preview workspace={workspace} onNewProject={newProject} />
		</div>
	)
}

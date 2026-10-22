import styles from './App.module.css'
import { Preview } from './ui/preview/Preview'
import { WorkspaceForm } from './ui/sidebar/WorkspaceForm'
import { Sidebar } from './ui/sidebar/Sidebar'
import { Toolbar } from './ui/sidebar/Toolbar'
import { useWorkspace } from './ui/useWorkspace'

export default function App() {
	const { workspace, selectLayout, update, resetLayout, importLayout } = useWorkspace()

	return (
		<div className={styles.app}>
			<Sidebar>
				<Toolbar />
				<WorkspaceForm
					workspace={workspace}
					onSelectLayout={selectLayout}
					onUpdate={update}
					onResetLayout={resetLayout}
					onImportLayout={importLayout}
				/>
			</Sidebar>
			<Preview workspace={workspace} onResetLayout={resetLayout} />
		</div>
	)
}

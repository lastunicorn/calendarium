import styles from './App.module.css'
import { Preview } from './ui/preview/Preview'
import { ConfigForm } from './ui/sidebar/ConfigForm'
import { Sidebar } from './ui/sidebar/Sidebar'
import { Toolbar } from './ui/sidebar/Toolbar'
import { useCalendarConfig } from './ui/useCalendarConfig'

export default function App() {
	const { config, selectLayout, update, resetLayout, importLayout } = useCalendarConfig()

	return (
		<div className={styles.app}>
			<Sidebar>
				<Toolbar config={config} onReset={resetLayout} onImport={importLayout} />
				<ConfigForm config={config} onSelectLayout={selectLayout} onUpdate={update} />
			</Sidebar>
			<Preview config={config} onResetLayout={resetLayout} />
		</div>
	)
}

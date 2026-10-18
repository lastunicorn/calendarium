import styles from './App.module.css'
import { Preview } from './ui/preview/Preview'
import { ConfigForm } from './ui/sidebar/ConfigForm'
import { Sidebar } from './ui/sidebar/Sidebar'
import { Toolbar } from './ui/sidebar/Toolbar'
import { useCalendarConfig } from './ui/useCalendarConfig'

export default function App() {
	const { config, update, replace } = useCalendarConfig()

	return (
		<div className={styles.app}>
			<Sidebar>
				<Toolbar config={config} onReplace={replace} />
				<ConfigForm config={config} onUpdate={update} />
			</Sidebar>
			<Preview config={config} />
		</div>
	)
}

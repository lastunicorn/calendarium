import styles from './App.module.css'
import { ConfigPanel } from './ui/ConfigPanel'
import { Preview } from './ui/Preview'
import { useCalendarConfig } from './ui/useCalendarConfig'

export default function App() {
	const { config, update, replace } = useCalendarConfig()

	return (
		<div className={styles.app}>
			<ConfigPanel config={config} onUpdate={update} onReplace={replace} />
			<Preview config={config} />
		</div>
	)
}

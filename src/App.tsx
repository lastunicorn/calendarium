import styles from './App.module.css'
import { ConfigPanel } from './ui/ConfigPanel'
import { Preview } from './ui/Preview'

export default function App() {
	return (
		<div className={styles.app}>
			<ConfigPanel />
			<Preview />
		</div>
	)
}

import { useEffect, useState } from 'react'
import styles from './App.module.css'
import { loadConfig, saveConfig } from './config/storage'
import { ConfigPanel } from './ui/ConfigPanel'
import { Preview } from './ui/Preview'

export default function App() {
	const [config, setConfig] = useState(loadConfig)

	useEffect(() => {
		saveConfig(config)
	}, [config])

	return (
		<div className={styles.app}>
			<ConfigPanel config={config} onChange={setConfig} />
			<Preview config={config} />
		</div>
	)
}

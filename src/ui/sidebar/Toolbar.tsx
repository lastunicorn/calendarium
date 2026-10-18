import { type ChangeEvent, useRef, useState } from 'react'
import { type CalendarConfig, defaultConfig } from '../../config/CalendarConfig'
import { parseConfigFile, serializeConfig } from '../../config/storage'
import { IconButton } from '../components/IconButton'
import { ExportIcon, ImportIcon, PrintIcon, ResetIcon } from '../components/icons'
import { downloadFile } from '../download'
import styles from './Toolbar.module.css'

interface ToolbarProps {
	config: CalendarConfig
	/** Replaces the whole config (import, reset). */
	onReplace: (config: CalendarConfig) => void
}

function handlePrintClick() {
	window.print()
}

/** Calendar-wide actions: print, export/import the config as a file, reset to defaults. */
export function Toolbar({ config, onReplace }: ToolbarProps) {
	const fileInput = useRef<HTMLInputElement>(null)
	const [importError, setImportError] = useState('')

	function handleExportClick() {
		downloadFile(`calendar-${config.year}.json`, serializeConfig(config), 'application/json')
	}

	function handleImportClick() {
		fileInput.current?.click()
	}

	function handleResetClick() {
		if (!window.confirm('Reset all settings to their defaults?')) return
		setImportError('')
		onReplace(defaultConfig())
	}

	async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
		const input = event.currentTarget
		const file = input.files?.[0]
		// Reset so choosing the same file again still fires `change`.
		input.value = ''
		if (!file) return

		const imported = parseConfigFile(await file.text())
		if (imported === null) {
			setImportError(`${file.name} is not a valid configuration file.`)
			return
		}
		setImportError('')
		onReplace(imported)
	}

	return (
		<>
			<div className={styles.toolbar} role="toolbar" aria-label="Calendar actions">
				<IconButton label="Print" icon={<PrintIcon />} onClick={handlePrintClick} />
				<IconButton
					label="Export settings to a file"
					icon={<ExportIcon />}
					onClick={handleExportClick}
				/>
				<IconButton
					label="Import settings from a file"
					icon={<ImportIcon />}
					onClick={handleImportClick}
				/>
				<IconButton
					label="Reset all settings"
					icon={<ResetIcon />}
					onClick={handleResetClick}
				/>
				<input
					ref={fileInput}
					type="file"
					accept=".json,application/json"
					hidden
					onChange={handleImportFileChange}
				/>
			</div>

			{importError && (
				<p className={styles.error} role="alert">
					{importError}
				</p>
			)}
		</>
	)
}

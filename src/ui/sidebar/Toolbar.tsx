import { type ChangeEvent, useRef, useState } from 'react'
import type { AppConfig, LayoutId } from '../../config/CalendarConfig'
import {
	type ImportedLayoutConfig,
	parseConfigFile,
	serializeLayoutConfig,
} from '../../config/configFile'
import { IconButton } from '../components/IconButton'
import { ExportIcon, ImportIcon, PrintIcon, ResetIcon } from '../components/icons'
import { downloadFile } from '../download'
import { LAYOUT_NAMES } from './layoutNames'
import styles from './Toolbar.module.css'

interface ToolbarProps {
	config: AppConfig
	/** Restores one layout's default options. */
	onReset: (layout: LayoutId) => void
	/** Replaces one layout's options with an imported file's and shows that layout. */
	onImport: (imported: ImportedLayoutConfig) => void
}

/** What to tell the user about an imported file's invalid fields; empty when there were none. */
function ignoredFieldsNotice(fileName: string, ignored: string[]): string {
	if (ignored.length === 0) return ''
	const settings = ignored.length === 1 ? '1 setting was' : `${ignored.length} settings were`
	return `Imported ${fileName}; ${settings} invalid and kept the default: ${ignored.join(', ')}.`
}

function handlePrintClick() {
	window.print()
}

/** Print, and export/import/reset the current layout's options. */
export function Toolbar({ config, onReset, onImport }: ToolbarProps) {
	const { layout } = config
	const options = config.layouts[layout]

	const fileInput = useRef<HTMLInputElement>(null)
	const [importError, setImportError] = useState('')
	const [importNotice, setImportNotice] = useState('')

	function handleExportClick() {
		downloadFile(
			`calendar-${layout}-${options.year}.json`,
			serializeLayoutConfig(layout, options),
			'application/json',
		)
	}

	function handleImportClick() {
		fileInput.current?.click()
	}

	function handleResetClick() {
		if (!window.confirm(`Reset ${LAYOUT_NAMES[layout]} settings to their defaults?`)) return
		setImportError('')
		setImportNotice('')
		onReset(layout)
	}

	async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
		const input = event.currentTarget
		const file = input.files?.[0]
		// Reset so choosing the same file again still fires `change`.
		input.value = ''
		if (!file) return

		const imported = parseConfigFile(await file.text(), layout)
		if (imported === null) {
			setImportError(`${file.name} is not a valid configuration file.`)
			setImportNotice('')
			return
		}
		setImportError('')
		setImportNotice(ignoredFieldsNotice(file.name, imported.ignored))
		onImport(imported)
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
					label="Reset layout settings"
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
			{importNotice && (
				<p className={styles.notice} role="status">
					{importNotice}
				</p>
			)}
		</>
	)
}

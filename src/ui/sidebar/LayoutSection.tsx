import { type ChangeEvent, type FocusEvent, type PointerEvent, useRef, useState } from 'react'
import type { AppConfig } from '../../config/AppConfig'
import { LAYOUT_IDS, type LayoutId } from '../../layouts'
import {
	exportLayoutFile,
	type ImportedLayoutConfig,
	parseConfigFile,
} from '../../config/configFile'
import { IconButton } from '../components/IconButton'
import { ExportIcon, ImportIcon, LayoutIcon, ResetIcon } from '../components/icons'
import { downloadFile } from '../download'
import { SelectField } from '../fields/SelectField'
import { LAYOUT_VIEWS } from '../layouts/registry'
import styles from './LayoutSection.module.css'
import { Section } from './Section'

const LAYOUT_OPTIONS = LAYOUT_IDS.map((layout) => ({
	value: layout,
	label: LAYOUT_VIEWS[layout].label,
}))

interface LayoutSectionProps {
	config: AppConfig
	/** Shows another layout, with the options it had last. */
	onSelect: (layout: LayoutId) => void
	/** Restores one layout's default options. */
	onReset: (layout: LayoutId) => void
	/** Replaces one layout's options with an imported file's and shows that layout. */
	onImport: (imported: ImportedLayoutConfig) => void
}

/**
 * What to tell the user about an imported file made by a newer version, or with invalid fields;
 * empty when there is nothing to report.
 */
function describeImport(fileName: string, { ignored, newer }: ImportedLayoutConfig): string {
	const notices = []
	if (newer) {
		notices.push(`Imported ${fileName}, made by a newer version; some settings may be ignored.`)
	}
	if (ignored.length > 0) {
		const settings = ignored.length === 1 ? '1 setting was' : `${ignored.length} settings were`
		const fields = ignored.join(', ')
		notices.push(
			newer
				? `${settings} invalid and kept the default: ${fields}.`
				: `Imported ${fileName}; ${settings} invalid and kept the default: ${fields}.`,
		)
	}
	return notices.join(' ')
}

/** The label of the action button `target` is in, or empty outside a button. */
function actionLabel(target: EventTarget): string {
	return (target instanceof Element && target.closest('button')?.title) || ''
}

/**
 * How the calendar is spread over pages, above the export, import and reset of the shown
 * layout's options; each layout keeps its own options. Always open.
 */
export function LayoutSection({ config, onSelect, onReset, onImport }: LayoutSectionProps) {
	const { layout } = config

	const fileInput = useRef<HTMLInputElement>(null)
	const [importError, setImportError] = useState('')
	const [importNotice, setImportNotice] = useState('')
	const [hint, setHint] = useState('')

	function handleActionsPointerOver(event: PointerEvent<HTMLDivElement>) {
		setHint(actionLabel(event.target))
	}

	function handleActionsFocus(event: FocusEvent<HTMLDivElement>) {
		setHint(actionLabel(event.target))
	}

	function handleActionsLeave() {
		setHint('')
	}

	function handleExportClick() {
		const file = exportLayoutFile(config)
		downloadFile(file.fileName, file.text, 'application/json')
	}

	function handleImportClick() {
		fileInput.current?.click()
	}

	function handleResetClick() {
		if (!window.confirm(`Reset ${LAYOUT_VIEWS[layout].name} settings to their defaults?`))
			return
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
		setImportNotice(describeImport(file.name, imported))
		onImport(imported)
	}

	return (
		<Section title="Layout" icon={<LayoutIcon />} collapsible={false}>
			<SelectField label="" value={layout} options={LAYOUT_OPTIONS} onChange={onSelect} />
			<div className={styles.actionsGroup}>
				<div
					className={styles.actions}
					role="toolbar"
					aria-label="Layout settings"
					onPointerOver={handleActionsPointerOver}
					onPointerLeave={handleActionsLeave}
					onFocus={handleActionsFocus}
					onBlur={handleActionsLeave}
				>
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
				{/* The buttons are already named by their labels; this repeats one for the eye. */}
				<p className={styles.hint} aria-hidden="true">
					{hint}
				</p>
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
		</Section>
	)
}

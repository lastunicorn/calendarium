import { type ChangeEvent, useRef, useState } from 'react'
import {
	type CalendarConfig,
	defaultConfig,
	isMargin,
	LOCALES,
	MARGIN_SIDES,
	type MarginSide,
	MAX_MARGIN,
	type Orientation,
	type PaperSize,
	type WeekendHighlight,
} from '../config/CalendarConfig'
import { parseConfigFile, serializeConfig } from '../config/storage'
import type { WeekStart } from '../core/calendar'
import type { WeekdayFormat } from '../core/locale'
import styles from './ConfigPanel.module.css'
import { NumberInput } from './fields/NumberInput'
import { ExportIcon, ImportIcon, PrintIcon, ResetIcon } from './icons'

interface ConfigPanelProps {
	config: CalendarConfig
	onChange: (config: CalendarConfig) => void
}

/** Week start options in panel order, Monday first. */
const WEEK_STARTS: { value: WeekStart; label: string }[] = [
	{ value: 1, label: 'Monday' },
	{ value: 2, label: 'Tuesday' },
	{ value: 3, label: 'Wednesday' },
	{ value: 4, label: 'Thursday' },
	{ value: 5, label: 'Friday' },
	{ value: 6, label: 'Saturday' },
	{ value: 0, label: 'Sunday' },
]

const MARGIN_LABELS: Record<MarginSide, string> = {
	top: 'Top',
	right: 'Right',
	bottom: 'Bottom',
	left: 'Left',
}

function isValidYear(year: number): boolean {
	return Number.isInteger(year) && year >= 1 && year <= 9999
}

interface MarginInputProps {
	side: MarginSide
	value: number
	onChange: (side: MarginSide, margin: number) => void
}

function MarginInput({ side, value, onChange }: MarginInputProps) {
	function handleInputChange(margin: number) {
		onChange(side, margin)
	}

	return (
		<label className={styles.margin}>
			{MARGIN_LABELS[side]}
			<NumberInput
				value={value}
				min={0}
				max={MAX_MARGIN}
				step={0.5}
				isValid={isMargin}
				onChange={handleInputChange}
			/>
		</label>
	)
}

function handlePrintClick() {
	window.print()
}

function downloadFile(name: string, text: string, type: string) {
	const url = URL.createObjectURL(new Blob([text], { type }))
	const link = document.createElement('a')
	link.href = url
	link.download = name
	link.click()
	URL.revokeObjectURL(url)
}

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
	const fileInput = useRef<HTMLInputElement>(null)
	const [importError, setImportError] = useState('')

	function handleYearChange(year: number) {
		onChange({ ...config, year })
	}

	function handleLocaleChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, locale: event.currentTarget.value })
	}

	function handleWeekStartChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, weekStart: Number(event.currentTarget.value) as WeekStart })
	}

	function handleWeekdayFormatChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, weekdayFormat: event.currentTarget.value as WeekdayFormat })
	}

	function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange({ ...config, title: event.currentTarget.value })
	}

	function handleSubtitleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange({ ...config, subtitle: event.currentTarget.value })
	}

	function handleHighlightWeekendsChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, highlightWeekends: event.currentTarget.value as WeekendHighlight })
	}

	function handleShowWeekNumbersChange(event: ChangeEvent<HTMLInputElement>) {
		onChange({ ...config, showWeekNumbers: event.currentTarget.checked })
	}

	function handlePaperSizeChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, paperSize: event.currentTarget.value as PaperSize })
	}

	function handleOrientationChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, orientation: event.currentTarget.value as Orientation })
	}

	function handleMarginChange(side: MarginSide, margin: number) {
		onChange({ ...config, margins: { ...config.margins, [side]: margin } })
	}

	function handleExportClick() {
		downloadFile(`calendar-${config.year}.json`, serializeConfig(config), 'application/json')
	}

	function handleImportClick() {
		fileInput.current?.click()
	}

	function handleResetClick() {
		if (!window.confirm('Reset all settings to their defaults?')) return
		setImportError('')
		onChange(defaultConfig())
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
		onChange(imported)
	}

	return (
		<aside className={styles.panel}>
			<h1 className={styles.heading}>Calendar</h1>

			<div className={styles.toolbar} role="toolbar" aria-label="Calendar actions">
				<button
					type="button"
					className={styles.iconButton}
					title="Print"
					aria-label="Print"
					onClick={handlePrintClick}
				>
					<PrintIcon />
				</button>
				<button
					type="button"
					className={styles.iconButton}
					title="Export settings to a file"
					aria-label="Export settings to a file"
					onClick={handleExportClick}
				>
					<ExportIcon />
				</button>
				<button
					type="button"
					className={styles.iconButton}
					title="Import settings from a file"
					aria-label="Import settings from a file"
					onClick={handleImportClick}
				>
					<ImportIcon />
				</button>
				<button
					type="button"
					className={styles.iconButton}
					title="Reset all settings"
					aria-label="Reset all settings"
					onClick={handleResetClick}
				>
					<ResetIcon />
				</button>
				<input
					ref={fileInput}
					type="file"
					accept=".json,application/json"
					hidden
					onChange={handleImportFileChange}
				/>
			</div>

			{importError && <p className={styles.error}>{importError}</p>}

			<label className={styles.field}>
				Year
				<NumberInput
					value={config.year}
					min={1}
					max={9999}
					isValid={isValidYear}
					onChange={handleYearChange}
				/>
			</label>

			<label className={styles.field}>
				Title
				<input
					type="text"
					value={config.title}
					placeholder={String(config.year)}
					onChange={handleTitleChange}
				/>
			</label>

			<label className={styles.field}>
				Subtitle
				<input type="text" value={config.subtitle} onChange={handleSubtitleChange} />
			</label>

			<label className={styles.field}>
				Language
				<select value={config.locale} onChange={handleLocaleChange}>
					{LOCALES.map((locale) => (
						<option key={locale.value} value={locale.value}>
							{locale.label}
						</option>
					))}
				</select>
			</label>

			<label className={styles.field}>
				Week starts on
				<select value={config.weekStart} onChange={handleWeekStartChange}>
					{WEEK_STARTS.map((weekStart) => (
						<option key={weekStart.value} value={weekStart.value}>
							{weekStart.label}
						</option>
					))}
				</select>
			</label>

			<label className={styles.field}>
				Weekday names
				<select value={config.weekdayFormat} onChange={handleWeekdayFormatChange}>
					<option value="short">Three letters (MON)</option>
					<option value="narrow">One letter (M)</option>
				</select>
			</label>

			<label className={styles.field}>
				Paper size
				<select value={config.paperSize} onChange={handlePaperSizeChange}>
					<option value="a4">A4</option>
					<option value="a3">A3</option>
					<option value="letter">Letter</option>
				</select>
			</label>

			<label className={styles.field}>
				Orientation
				<select value={config.orientation} onChange={handleOrientationChange}>
					<option value="portrait">Portrait</option>
					<option value="landscape">Landscape</option>
				</select>
			</label>

			<fieldset className={styles.margins}>
				<legend>Margins (mm)</legend>
				{MARGIN_SIDES.map((side) => (
					<MarginInput
						key={side}
						side={side}
						value={config.margins[side]}
						onChange={handleMarginChange}
					/>
				))}
			</fieldset>

			<label className={styles.field}>
				Highlight weekends
				<select value={config.highlightWeekends} onChange={handleHighlightWeekendsChange}>
					<option value="off">Off</option>
					<option value="days">Days only</option>
					<option value="columns">Whole columns</option>
				</select>
			</label>

			<label className={styles.checkbox}>
				<input
					type="checkbox"
					checked={config.showWeekNumbers}
					onChange={handleShowWeekNumbersChange}
				/>
				Week numbers
			</label>
		</aside>
	)
}

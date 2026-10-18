import type { ChangeEvent } from 'react'
import { type CalendarConfig, LOCALES } from '../config/CalendarConfig'
import type { WeekStart } from '../core/calendar'
import styles from './ConfigPanel.module.css'

interface ConfigPanelProps {
	config: CalendarConfig
	onChange: (config: CalendarConfig) => void
}

function handlePrintClick() {
	window.print()
}

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
	function handleYearChange(event: ChangeEvent<HTMLInputElement>) {
		const year = event.currentTarget.valueAsNumber
		if (Number.isInteger(year) && year >= 1 && year <= 9999) onChange({ ...config, year })
	}

	function handleLocaleChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, locale: event.currentTarget.value })
	}

	function handleWeekStartChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, weekStart: Number(event.currentTarget.value) as WeekStart })
	}

	function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
		onChange({ ...config, title: event.currentTarget.value })
	}

	function handleHighlightWeekendsChange(event: ChangeEvent<HTMLInputElement>) {
		onChange({ ...config, highlightWeekends: event.currentTarget.checked })
	}

	return (
		<aside className={styles.panel}>
			<h1 className={styles.heading}>Calendar</h1>

			<label className={styles.field}>
				Year
				<input
					type="number"
					min={1}
					max={9999}
					defaultValue={config.year}
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
					<option value={1}>Monday</option>
					<option value={0}>Sunday</option>
				</select>
			</label>

			<label className={styles.checkbox}>
				<input
					type="checkbox"
					checked={config.highlightWeekends}
					onChange={handleHighlightWeekendsChange}
				/>
				Highlight weekends
			</label>

			<button type="button" className={styles.print} onClick={handlePrintClick}>
				Print
			</button>
		</aside>
	)
}

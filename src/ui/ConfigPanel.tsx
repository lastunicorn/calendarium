import type { ChangeEvent } from 'react'
import {
	type CalendarConfig,
	LOCALES,
	type Orientation,
	type WeekendHighlight,
} from '../config/CalendarConfig'
import type { WeekStart } from '../core/calendar'
import type { WeekdayFormat } from '../core/locale'
import styles from './ConfigPanel.module.css'

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

	function handleOrientationChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...config, orientation: event.currentTarget.value as Orientation })
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
				Orientation
				<select value={config.orientation} onChange={handleOrientationChange}>
					<option value="portrait">Portrait</option>
					<option value="landscape">Landscape</option>
				</select>
			</label>

			<label className={styles.field}>
				Highlight weekends
				<select value={config.highlightWeekends} onChange={handleHighlightWeekendsChange}>
					<option value="off">Off</option>
					<option value="days">Days only</option>
					<option value="columns">Whole columns</option>
				</select>
			</label>

			<button type="button" className={styles.print} onClick={handlePrintClick}>
				Print
			</button>
		</aside>
	)
}

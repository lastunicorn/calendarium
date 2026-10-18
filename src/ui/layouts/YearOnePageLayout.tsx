import { useMemo } from 'react'
import type { CalendarConfig } from '../../config/CalendarConfig'
import { buildYear } from '../../core/calendar'
import { monthNames, weekdayNames } from '../../core/locale'
import { MiniMonth } from './MiniMonth'
import styles from './YearOnePageLayout.module.css'

interface YearOnePageLayoutProps {
	config: CalendarConfig
}

export function YearOnePageLayout({ config }: YearOnePageLayoutProps) {
	const {
		year,
		locale,
		weekStart,
		weekdayFormat,
		title,
		subtitle,
		highlightWeekends,
		showWeekNumbers,
		orientation,
	} = config
	const months = useMemo(() => buildYear(year, weekStart), [year, weekStart])
	const names = useMemo(() => monthNames(locale), [locale])
	const weekdays = useMemo(
		() => weekdayNames(locale, weekStart, weekdayFormat),
		[locale, weekStart, weekdayFormat],
	)

	return (
		<div className={styles.layout}>
			<header className={styles.header}>
				<h1 className={styles.title}>{title.trim() || year}</h1>
				{subtitle.trim() && <p className={styles.subtitle}>{subtitle.trim()}</p>}
			</header>

			<div className={`${styles.grid} ${styles[orientation]}`}>
				{months.map((month) => (
					<MiniMonth
						key={month.month}
						month={month}
						name={names[month.month]}
						weekdays={weekdays}
						highlightWeekends={highlightWeekends}
						showWeekNumbers={showWeekNumbers}
					/>
				))}
			</div>
		</div>
	)
}

import styles from './CalendarHeader.module.css'

interface CalendarHeaderProps {
	year: number
	title: string
	subtitle: string
}

/** The title (the year when empty) and optional subtitle at the top of a page. */
export function CalendarHeader({ year, title, subtitle }: CalendarHeaderProps) {
	return (
		<header className={styles.header}>
			<h1 className={styles.title}>{title.trim() || year}</h1>
			{subtitle.trim() && <p className={styles.subtitle}>{subtitle.trim()}</p>}
		</header>
	)
}

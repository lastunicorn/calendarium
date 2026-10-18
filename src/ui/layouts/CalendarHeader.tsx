import styles from './CalendarHeader.module.css'

interface CalendarHeaderProps {
	heading: string
	/** Smaller line below the heading; hidden when empty. */
	subheading: string
	/** `large` heads a single-page calendar; `compact` leaves room for a month grid. */
	size?: 'large' | 'compact'
}

/** The heading block at the top of a page. */
export function CalendarHeader({ heading, subheading, size = 'large' }: CalendarHeaderProps) {
	return (
		<header className={`${styles.header} ${styles[size]}`}>
			<h1 className={styles.title}>{heading}</h1>
			{subheading.trim() && <p className={styles.subtitle}>{subheading.trim()}</p>}
		</header>
	)
}

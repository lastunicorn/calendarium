import styles from './CalendarHeader.module.css'

interface CalendarHeaderProps {
	heading: string
	/** Smaller line below the heading; hidden when empty or left out. */
	subheading?: string
	/** `large` heads a single-page calendar; `compact` leaves room for a month grid. */
	size?: 'large' | 'compact'
	/** `start` sits the header beside other content instead of centered above it. */
	align?: 'center' | 'start'
	/** Draws the heading in the weekend color. */
	highlight?: boolean
}

/** The heading block at the top of a page. */
export function CalendarHeader({
	heading,
	subheading = '',
	size = 'large',
	align = 'center',
	highlight = false,
}: CalendarHeaderProps) {
	return (
		<header
			className={[
				styles.header,
				styles[size],
				align === 'start' ? styles.start : '',
				highlight ? styles.highlight : '',
			].join(' ')}
		>
			<h1 className={styles.title}>{heading}</h1>
			{subheading.trim() && <p className={styles.subtitle}>{subheading.trim()}</p>}
		</header>
	)
}

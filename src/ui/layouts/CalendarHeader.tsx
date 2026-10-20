import styles from './CalendarHeader.module.css'

interface CalendarHeaderProps {
	heading: string
	/** Smaller line below the heading; hidden when empty or left out. */
	subheading?: string
	/** `large` heads a single-page calendar; `compact` leaves room for a month grid. */
	size?: 'large' | 'compact'
	/** Where the lines sit across the header's box: `left` beside other content, `center` above it. */
	align?: 'left' | 'center' | 'right'
	/** The heading's font size in pt, instead of the one `size` sets. */
	headingFontSize?: number
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
	headingFontSize,
}: CalendarHeaderProps) {
	return (
		<header
			className={[
				styles.header,
				styles[size],
				styles[align],
				highlight ? styles.highlight : '',
			].join(' ')}
		>
			<h1
				className={styles.title}
				style={
					headingFontSize === undefined ? undefined : { fontSize: `${headingFontSize}pt` }
				}
			>
				{heading}
			</h1>
			{subheading.trim() && <p className={styles.subtitle}>{subheading.trim()}</p>}
		</header>
	)
}

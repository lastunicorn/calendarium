import { memo } from 'react'
import type { PageSetup } from '../../../core/paper'
import type { DayFill, DayPages } from '../../../layouts/day-per-page/pages'
import { CalendarHeader } from '../CalendarHeader'
import styles from './DayPage.module.css'
import { MiniMonth } from '../MiniMonth'
import { Page } from '../Page'

interface DayLinesProps {
	fill: DayFill
}

/** The writing area filling a day's page under its header, or all of its second page. */
function DayLines({ fill }: DayLinesProps) {
	if (fill.kind === 'ruled') {
		return (
			<div className={styles.ruled} style={{ gridAutoRows: `${fill.spacing}mm` }}>
				{Array.from({ length: fill.lines }, (_, index) => (
					// The lines are identical and never reorder, so the index is the key.
					<div key={index} className={styles.ruledLine} />
				))}
			</div>
		)
	}
	return (
		<div
			className={styles.schedule}
			style={{ gridTemplateRows: `repeat(${fill.hours.length}, 1fr)` }}
		>
			{fill.hours.map((hour) => (
				<div key={hour} className={styles.hour}>
					<span className={styles.hourLabel}>{hour}</span>
				</div>
			))}
		</div>
	)
}

interface DayPageProps {
	/** The day as `planDayPages` plans it. */
	plan: DayPages
	setup: PageSetup
}

/**
 * One day's sheet, or two when the day spans a second one without a header. Memoized because a
 * year has 366 of them and an unchanged plan keeps its page objects.
 */
export const DayPage = memo(function DayPage({ plan, setup }: DayPageProps) {
	const { miniMonth, details } = plan
	const [firstFill, ...nextFills] = plan.fills
	return (
		<>
			<Page setup={setup}>
				<div className={styles.layout}>
					<div className={styles.top}>
						<div className={styles.heading}>
							<CalendarHeader
								heading={plan.heading}
								subheading={plan.subheading}
								size="compact"
								align="left"
								highlight={plan.weekend}
							/>
							{details && <p className={styles.details}>{details}</p>}
						</div>
						{miniMonth && (
							<div className={styles.miniMonth}>
								<MiniMonth {...miniMonth} size="small" />
							</div>
						)}
					</div>
					<DayLines fill={firstFill} />
				</div>
			</Page>
			{nextFills.map((fill, index) => (
				// The sheets after the first never reorder, so the index is the key.
				<Page key={index} setup={setup}>
					<div className={styles.layout}>
						<DayLines fill={fill} />
					</div>
				</Page>
			))}
		</>
	)
})

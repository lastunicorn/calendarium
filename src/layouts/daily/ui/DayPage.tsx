import { memo } from 'react'

import type { PageSetup } from '../../../core/paper'
import { CalendarHeader } from '../../../ui/layouts/CalendarHeader'
import { MiniMonth } from '../../../ui/layouts/MiniMonth'
import { miniMonthSizeClass } from '../../../ui/layouts/miniMonthSize'
import { Page } from '../../../ui/layouts/Page'
import type { DayFill, DayPages } from '../pages'
import styles from './DayPage.module.css'
import { dayFillComponent } from './fills'

interface DayLinesProps {
	fill: DayFill
}

/** The writing area filling a day's page under its header, or all of its second page. */
function DayLines({ fill }: DayLinesProps) {
	const Fill = dayFillComponent(fill.kind)
	// oxlint-disable-next-line react/static-components -- a lookup of the fills' module-level components, not one created here
	return Fill && <Fill fill={fill} />
}

interface DayFooterProps {
	/** Its height, in mm. */
	height: number
	/** Whether it is under the schedule, whose last hour's border draws its top edge. */
	underSchedule: boolean
}

/** The empty bordered footer at the bottom of a day's sheet, under its fill. */
function DayFooter({ height, underSchedule }: DayFooterProps) {
	const className = underSchedule
		? `${styles.footer} ${styles.footerUnderSchedule}`
		: styles.footer
	return <div className={className} style={{ height: `${height}mm` }} />
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
	const { miniMonth, events } = plan
	const [firstFill, ...nextFills] = plan.fills
	// Every sheet of a day has the same kind of fill.
	const footer = plan.footerHeight !== undefined && (
		<DayFooter height={plan.footerHeight} underSchedule={firstFill.kind === 'hours'} />
	)
	return (
		<>
			<Page setup={setup}>
				<div className={styles.layout}>
					<div className={`${styles.top} ${miniMonthSizeClass(miniMonth?.size)}`}>
						<div className={styles.heading}>
							<CalendarHeader
								heading={plan.heading}
								subheading={plan.subheading}
								size="compact"
								align="left"
								highlight={plan.weekend}
								headingFontSize={plan.headingFontSize}
							/>
							{events.map((name, index) => (
								// Two events may share a name, and they never reorder.
								<p key={index} className={styles.event}>
									{name}
								</p>
							))}
						</div>
						{miniMonth && (
							<div className={styles.miniMonth}>
								<MiniMonth {...miniMonth} />
							</div>
						)}
					</div>
					<DayLines fill={firstFill} />
					{footer}
				</div>
			</Page>
			{nextFills.map((fill, index) => (
				// The sheets after the first never reorder, so the index is the key.
				<Page key={index} setup={setup}>
					<div className={styles.layout}>
						<DayLines fill={fill} />
						{footer}
					</div>
				</Page>
			))}
		</>
	)
})

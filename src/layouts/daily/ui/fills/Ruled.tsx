import type { DayFill } from '../../pages'
import styles from './Ruled.module.css'

interface RuledProps {
	/** The lines as `planDayPages` plans them. */
	fill: Extract<DayFill, { kind: 'ruled' }>
}

/** Ruled lines filling the area left under a day's header. */
export function Ruled({ fill }: RuledProps) {
	return (
		<div className={styles.ruled} style={{ gridAutoRows: `${fill.spacing}mm` }}>
			{Array.from({ length: fill.lines }, (_, index) => (
				// The lines are identical and never reorder, so the index is the key.
				<div key={index} className={styles.ruledLine} />
			))}
		</div>
	)
}

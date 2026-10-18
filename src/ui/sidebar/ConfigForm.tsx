import { CalendarSection } from './CalendarSection'
import styles from './ConfigForm.module.css'
import { HeaderSection } from './HeaderSection'
import { LayoutSection } from './LayoutSection'
import { PageSection } from './PageSection'
import type { ConfigSectionProps } from './Section'

/** Every calendar option, grouped by what it affects. */
export function ConfigForm({ config, onUpdate }: ConfigSectionProps) {
	return (
		<div className={styles.form}>
			<LayoutSection config={config} onUpdate={onUpdate} />
			<CalendarSection config={config} onUpdate={onUpdate} />
			<HeaderSection config={config} onUpdate={onUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
		</div>
	)
}

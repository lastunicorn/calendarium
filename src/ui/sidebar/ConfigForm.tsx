import { AppearanceSection } from './AppearanceSection'
import { CalendarSection } from './CalendarSection'
import styles from './ConfigForm.module.css'
import { PageSection } from './PageSection'
import type { ConfigSectionProps } from './Section'
import { TextSection } from './TextSection'

/** Every calendar option, grouped by what it affects. */
export function ConfigForm({ config, onUpdate }: ConfigSectionProps) {
	return (
		<div className={styles.form}>
			<CalendarSection config={config} onUpdate={onUpdate} />
			<TextSection config={config} onUpdate={onUpdate} />
			<PageSection config={config} onUpdate={onUpdate} />
			<AppearanceSection config={config} onUpdate={onUpdate} />
		</div>
	)
}

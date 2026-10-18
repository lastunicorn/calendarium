import type { ComponentType } from 'react'
import type { AppConfig, LayoutConfigs, LayoutId } from '../../config/CalendarConfig'
import type { UpdateLayoutConfig } from '../useCalendarConfig'
import styles from './ConfigForm.module.css'
import { FORMS } from './forms'
import { LayoutSection } from './LayoutSection'
import type { ConfigSectionProps } from './Section'

interface ConfigFormProps {
	config: AppConfig
	onSelectLayout: (layout: LayoutId) => void
	onUpdate: UpdateLayoutConfig
}

interface LayoutFormProps<K extends LayoutId> {
	layout: K
	config: LayoutConfigs[K]
	onUpdate: UpdateLayoutConfig
}

/** The form of `layout`'s options; generic so the form and its options stay paired. */
function LayoutForm<K extends LayoutId>({ layout, config, onUpdate }: LayoutFormProps<K>) {
	const Form: ComponentType<ConfigSectionProps<LayoutConfigs[K]>> = FORMS[layout]

	function handleUpdate(patch: Partial<LayoutConfigs[K]>) {
		onUpdate(layout, patch)
	}

	return <Form config={config} onUpdate={handleUpdate} />
}

/** The layout picker and the chosen layout's options, grouped by what they affect. */
export function ConfigForm({ config, onSelectLayout, onUpdate }: ConfigFormProps) {
	const { layout } = config
	return (
		<div className={styles.form}>
			<LayoutSection layout={layout} onSelect={onSelectLayout} />
			{/* Keyed so half-typed field drafts don't carry over to another layout. */}
			<LayoutForm
				key={layout}
				layout={layout}
				config={config.layouts[layout]}
				onUpdate={onUpdate}
			/>
		</div>
	)
}

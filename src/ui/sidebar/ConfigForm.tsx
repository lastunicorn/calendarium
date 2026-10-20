import type { AppConfig } from '../../config/AppConfig'
import type { LayoutConfigs, LayoutId } from '../../layouts'
import { layoutView } from '../layouts/registry'
import type { UpdateLayoutConfig } from '../useCalendarConfig'
import styles from './ConfigForm.module.css'
import { LayoutSection } from './LayoutSection'
import { OpenSectionsContext, useOpenSections } from './useOpenSections'

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
	const Form = layoutView(layout).Form

	function handleUpdate(patch: Partial<LayoutConfigs[K]>) {
		onUpdate(layout, patch)
	}

	return <Form config={config} onUpdate={handleUpdate} />
}

/**
 * The layout picker and the chosen layout's options, grouped by what they affect, in sections
 * that stay open or closed across layouts and reloads.
 */
export function ConfigForm({ config, onSelectLayout, onUpdate }: ConfigFormProps) {
	const { layout } = config
	const openSections = useOpenSections()
	return (
		<OpenSectionsContext value={openSections}>
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
		</OpenSectionsContext>
	)
}

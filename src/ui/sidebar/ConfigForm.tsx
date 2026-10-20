import type { AppConfig } from '../../config/AppConfig'
import type { ImportedLayoutConfig } from '../../config/configFile'
import { useMemo } from 'react'
import { defaultLayoutConfig, type LayoutConfigs, type LayoutId } from '../../layouts'
import { layoutView } from '../layouts/registry'
import type { UpdateLayoutConfig } from '../useCalendarConfig'
import styles from './ConfigForm.module.css'
import { LayoutSection } from './LayoutSection'
import { OpenSectionsContext, useOpenSections } from './useOpenSections'

interface ConfigFormProps {
	config: AppConfig
	onSelectLayout: (layout: LayoutId) => void
	onUpdate: UpdateLayoutConfig
	onResetLayout: (layout: LayoutId) => void
	onImportLayout: (imported: ImportedLayoutConfig) => void
}

interface LayoutFormProps<K extends LayoutId> {
	layout: K
	config: LayoutConfigs[K]
	onUpdate: UpdateLayoutConfig
}

/**
 * The form of `layout`'s options, with their defaults for its sections' resets; generic so the form
 * and its options stay paired.
 */
function LayoutForm<K extends LayoutId>({ layout, config, onUpdate }: LayoutFormProps<K>) {
	const Form = layoutView(layout).Form
	// Fresh defaults hold today's year; computed once per layout, so they don't change while shown.
	const defaults = useMemo(() => defaultLayoutConfig(layout), [layout])

	function handleUpdate(patch: Partial<LayoutConfigs[K]>) {
		onUpdate(layout, patch)
	}

	return <Form config={config} defaults={defaults} onUpdate={handleUpdate} />
}

/**
 * The layout picker with the export, import and reset of its options, and the chosen layout's options, grouped by what they affect, in sections
 * of which one at a time is open, staying open across layouts and reloads.
 */
export function ConfigForm({
	config,
	onSelectLayout,
	onUpdate,
	onResetLayout,
	onImportLayout,
}: ConfigFormProps) {
	const { layout } = config
	const openSections = useOpenSections()
	return (
		<OpenSectionsContext value={openSections}>
			<div className={styles.form}>
				<LayoutSection
					config={config}
					onSelect={onSelectLayout}
					onReset={onResetLayout}
					onImport={onImportLayout}
				/>
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

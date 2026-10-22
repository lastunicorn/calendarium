import type { AppConfig } from '../../config/AppConfig'
import type { ImportedLayoutOptions } from '../../config/configFile'
import { useMemo } from 'react'
import { defaultLayoutOptions, type LayoutOptions, type LayoutId } from '../../layouts'
import { layoutView } from '../layouts/registry'
import type { UpdateLayoutOptions } from '../useCalendarConfig'
import styles from './ConfigForm.module.css'
import { LayoutSection } from './LayoutSection'
import { OpenSectionsContext, useOpenSections } from './useOpenSections'

interface ConfigFormProps {
	config: AppConfig
	onSelectLayout: (layout: LayoutId) => void
	onUpdate: UpdateLayoutOptions
	onResetLayout: (layout: LayoutId) => void
	onImportLayout: (imported: ImportedLayoutOptions) => void
}

interface LayoutFormProps<K extends LayoutId> {
	layout: K
	options: LayoutOptions[K]
	onUpdate: UpdateLayoutOptions
}

/**
 * The form of `layout`'s options, with their defaults for its sections' resets; generic so the form
 * and its options stay paired.
 */
function LayoutForm<K extends LayoutId>({ layout, options, onUpdate }: LayoutFormProps<K>) {
	const Form = layoutView(layout).Form
	// Fresh defaults hold today's year; computed once per layout, so they don't change while shown.
	const defaults = useMemo(() => defaultLayoutOptions(layout), [layout])

	function handleUpdate(patch: Partial<LayoutOptions[K]>) {
		onUpdate(layout, patch)
	}

	return <Form options={options} defaults={defaults} onUpdate={handleUpdate} />
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
					options={config.layouts[layout]}
					onUpdate={onUpdate}
				/>
			</div>
		</OpenSectionsContext>
	)
}

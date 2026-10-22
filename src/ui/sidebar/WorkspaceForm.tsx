import type { Workspace } from '../../workspace/Workspace'
import type { OpenedProject } from '../../workspace/projectFile'
import { useMemo } from 'react'
import { defaultLayoutOptions, type LayoutOptions, type LayoutId } from '../../layouts'
import { layoutView } from '../layouts/registry'
import type { UpdateLayoutOptions } from '../useWorkspace'
import styles from './WorkspaceForm.module.css'
import { LayoutSection } from './LayoutSection'
import { OpenSectionsContext, useOpenSections } from './useOpenSections'

interface WorkspaceFormProps {
	workspace: Workspace
	onSelectLayout: (layout: LayoutId) => void
	onUpdate: UpdateLayoutOptions
	onNewProject: (layout: LayoutId) => void
	onOpenProject: (opened: OpenedProject) => void
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
 * The layout picker with the saving, opening and starting over of its project, and the chosen layout's
 * options, grouped by what they affect, in sections of which one at a time is open, staying open across layouts and reloads.
 */
export function WorkspaceForm({
	workspace,
	onSelectLayout,
	onUpdate,
	onNewProject,
	onOpenProject,
}: WorkspaceFormProps) {
	const { layout } = workspace
	const openSections = useOpenSections()
	return (
		<OpenSectionsContext value={openSections}>
			<div className={styles.form}>
				<LayoutSection
					workspace={workspace}
					onSelect={onSelectLayout}
					onNew={onNewProject}
					onOpen={onOpenProject}
				/>
				{/* Keyed so half-typed field drafts don't carry over to another layout. */}
				<LayoutForm
					key={layout}
					layout={layout}
					options={workspace.layouts[layout]}
					onUpdate={onUpdate}
				/>
			</div>
		</OpenSectionsContext>
	)
}

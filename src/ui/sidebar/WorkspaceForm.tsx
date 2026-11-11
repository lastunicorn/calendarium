import type { Project, ProjectId } from '../../workspace/Project'
import { openProject, type Workspace } from '../../workspace/Workspace'
import { type Ref, useMemo } from 'react'
import type { Patch } from '../../core/data'
import { defaultLayoutOptions, type LayoutOptions, type LayoutId } from '../../layouts'
import { layoutView } from '../layouts/registry'
import type { UpdateLayoutOptions } from '../useWorkspace'
import styles from './WorkspaceForm.module.css'
import { ProjectSection } from './ProjectSection'
import { type OpenSections, OpenSectionsContext } from './openSections'

interface WorkspaceFormProps {
	workspace: Workspace
	/** Opens another project. */
	onOpenProject: (id: ProjectId) => void
	/** Renames the open project. */
	onRenameProject: (name: string) => void
	onUpdate: UpdateLayoutOptions
	/** Asks for a new project's name and layout. */
	onNewProject: () => void
	/** Adds an opened file's project, or replaces the one with its id, and opens it. */
	onImportProject: (project: Project<ProjectId | null>) => void
	onDeleteProject: (id: ProjectId) => void
	/** The title of the open section, from the viewer's preferences; `null` when all are closed. */
	openSection: string | null
	onToggleSection: (title: string) => void
	/** The project picker, for the focus to go to once a project is created. */
	pickerRef?: Ref<HTMLSelectElement>
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

	function handleUpdate(patch: Patch<LayoutOptions[K]>) {
		onUpdate(layout, patch)
	}

	return <Form options={options} defaults={defaults} onUpdate={handleUpdate} />
}

/**
 * The project section, then the open project's options, grouped by what they affect, in sections
 * of which one at a time is open, staying open across projects. Without a project, the project
 * section alone.
 */
export function WorkspaceForm({
	workspace,
	onOpenProject,
	onRenameProject,
	onUpdate,
	onNewProject,
	onImportProject,
	onDeleteProject,
	openSection,
	onToggleSection,
	pickerRef,
}: WorkspaceFormProps) {
	const project = openProject(workspace)

	function isOpen(title: string) {
		return title === openSection
	}

	const openSections: OpenSections = { isOpen, toggle: onToggleSection }
	return (
		<OpenSectionsContext value={openSections}>
			<div className={styles.form}>
				<ProjectSection
					workspace={workspace}
					onOpen={onOpenProject}
					onRename={onRenameProject}
					onNew={onNewProject}
					onImport={onImportProject}
					onDelete={onDeleteProject}
					pickerRef={pickerRef}
				/>
				{/* Keyed so half-typed field drafts don't carry over to another project. */}
				{project !== null && (
					<LayoutForm
						key={project.id}
						layout={project.layout}
						options={project.options}
						onUpdate={onUpdate}
					/>
				)}
			</div>
		</OpenSectionsContext>
	)
}

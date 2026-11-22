import { useMemo, type Ref } from 'react'

import type { Patch } from '../../core/data'
import { defaultLayoutOptions, type LayoutId, type LayoutOptions } from '../../layouts'
import type { SectionId } from '../../preferences/Preferences'
import type { Project, ProjectId } from '../../workspace/Project'
import type { SaveFailure } from '../../workspace/storage'
import { openProject, type Workspace } from '../../workspace/Workspace'
import { layoutView } from '../layouts/registry'
import type { MainContent } from '../main/mainContent'
import type { UpdateLayoutOptions } from '../useWorkspace'
import { OpenSectionsContext, type OpenSections } from './openSections'
import { ProjectSection } from './ProjectSection'
import styles from './WorkspaceForm.module.css'

interface WorkspaceFormProps {
	workspace: Workspace
	/** What the main area shows: the options only show beside their preview. */
	content: MainContent
	/** Why the workspace's last change wasn't saved in this browser; `null` when it was. */
	saveFailure: SaveFailure | null
	/** Renames the open project. */
	onRenameProject: (name: string) => void
	onUpdate: UpdateLayoutOptions
	/** Asks for a new project's name and layout. */
	onNewProject: () => void
	/** Shows Documents, or the preview again while Documents shows. */
	onManageProjects: () => void
	/** Adds an opened file's project, or replaces the one with its id, and opens it. */
	onImportProject: (project: Project<ProjectId | null>) => void
	/** The open section, from the viewer's preferences; `null` when all are closed. */
	openSection: SectionId | null
	onToggleSection: (id: SectionId) => void
	/** The Manage documents button, for the focus to go to once Documents is gone. */
	manageProjectsRef?: Ref<HTMLButtonElement>
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
 * of which one at a time is open, staying open across projects. While the main area shows
 * Documents, or without a project, the project section alone.
 */
export function WorkspaceForm({
	workspace,
	content,
	saveFailure,
	onRenameProject,
	onUpdate,
	onNewProject,
	onManageProjects,
	onImportProject,
	openSection,
	onToggleSection,
	manageProjectsRef,
}: WorkspaceFormProps) {
	const project = openProject(workspace)

	function isOpen(id: SectionId) {
		return id === openSection
	}

	const openSections: OpenSections = { isOpen, toggle: onToggleSection }
	return (
		<OpenSectionsContext value={openSections}>
			<div className={styles.form}>
				<ProjectSection
					workspace={workspace}
					content={content}
					saveFailure={saveFailure}
					onRename={onRenameProject}
					onNew={onNewProject}
					onManage={onManageProjects}
					onImport={onImportProject}
					manageRef={manageProjectsRef}
				/>
				{/* Keyed so half-typed field drafts don't carry over to another project. */}
				{content === 'preview' && project !== null && (
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

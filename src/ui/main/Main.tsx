import type { LayoutId } from '../../layouts'
import type { PreviewZoom } from '../../preferences/zoom'
import type { ProjectId } from '../../workspace/Project'
import { openProject, projectList, type Workspace } from '../../workspace/Workspace'
import { EmptyPreview } from '../preview/EmptyPreview'
import { Preview } from '../preview/Preview'
import { projectLabel } from '../projectLabel'
import { NewProjectDialog } from './NewProjectDialog'
import { OpenProjectDialog } from './OpenProjectDialog'

interface MainProps {
	workspace: Workspace
	/** Asks for a new project's name and layout, from the empty preview. */
	onNewProject: () => void
	/** Whether the New document dialog shows. */
	creatingProject: boolean
	/** Creates the project the New document dialog describes, and opens it. */
	onCreateProject: (name: string, layout: LayoutId) => void
	onCancelNewProject: () => void
	/** Whether the Open document dialog shows; it never does without an open project. */
	choosingProject: boolean
	/** Opens the project chosen in the Open document dialog. */
	onOpenProject: (id: ProjectId) => void
	onCancelOpenProject: () => void
	/** Puts the open project's options back to its layout's defaults, offered when its pages fail to render. */
	onResetOptions: () => void
	/** How large the pages are drawn on screen, from the viewer's preferences. */
	zoom: PreviewZoom
	onZoom: (zoom: PreviewZoom) => void
	/** Where the focus goes once a project is created with nothing to go back to. */
	returnFocus: () => HTMLElement | null
}

/**
 * The main area, right of the sidebar: the open project's preview, or the empty preview without
 * one, and the New and Open document dialogs over it, which the app holds since the sidebar asks
 * for them too.
 */
export function Main({
	workspace,
	onNewProject,
	creatingProject,
	onCreateProject,
	onCancelNewProject,
	choosingProject,
	onOpenProject,
	onCancelOpenProject,
	onResetOptions,
	zoom,
	onZoom,
	returnFocus,
}: MainProps) {
	const project = openProject(workspace)
	// The Open document dialog's rows, in the order it lists them.
	const projectOptions = projectList(workspace).map((listed) => ({
		value: listed.id,
		label: projectLabel(listed),
	}))

	return (
		<>
			{project === null ? (
				<EmptyPreview onNewProject={onNewProject} />
			) : (
				<Preview
					project={project}
					onResetOptions={onResetOptions}
					zoom={zoom}
					onZoom={onZoom}
				/>
			)}
			{creatingProject && (
				<NewProjectDialog
					onCreate={onCreateProject}
					onCancel={onCancelNewProject}
					returnFocus={returnFocus}
				/>
			)}
			{choosingProject && project !== null && (
				<OpenProjectDialog
					projects={projectOptions}
					openId={project.id}
					onOpen={onOpenProject}
					onCancel={onCancelOpenProject}
				/>
			)}
		</>
	)
}

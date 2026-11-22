import type { LayoutId } from '../../layouts'
import type { PreviewZoom } from '../../preferences/zoom'
import type { ProjectId } from '../../workspace/Project'
import { openProject, type Workspace } from '../../workspace/Workspace'
import { Preview } from '../preview/Preview'
import type { MainContent } from './mainContent'
import { NewProjectDialog } from './NewProjectDialog'
import { Projects } from './Projects'

interface MainProps {
	workspace: Workspace
	/** What the main area shows, as `shownContent` resolves it. */
	content: MainContent
	/** Adds a project from Documents, opening it only when none is open, and gives its id. */
	onAddProject: (name: string, layout: LayoutId) => ProjectId
	/** Makes a project current from Documents, and shows its preview. */
	onOpenProject: (id: ProjectId) => void
	/** Goes back from Documents to the preview. */
	onCloseProjects: () => void
	/** Whether the sidebar's New document dialog shows. */
	creatingProject: boolean
	/** Creates the project the sidebar's New document dialog describes, opens it and shows its preview. */
	onCreateProject: (name: string, layout: LayoutId) => void
	onCancelNewProject: () => void
	/** Puts the open project's options back to its layout's defaults, offered when its pages fail to render. */
	onResetOptions: () => void
	/** How large the pages are drawn on screen, from the viewer's preferences. */
	zoom: PreviewZoom
	onZoom: (zoom: PreviewZoom) => void
	/** Where the focus goes once Documents or the dialog is gone, when there is nothing to go back to. */
	returnFocus: () => HTMLElement | null
}

/**
 * The main area, right of the sidebar: the open project's preview, or Documents, and the
 * sidebar's New document dialog, which the app holds since the sidebar asks for it.
 */
export function Main({
	workspace,
	content,
	onAddProject,
	onOpenProject,
	onCloseProjects,
	creatingProject,
	onCreateProject,
	onCancelNewProject,
	onResetOptions,
	zoom,
	onZoom,
	returnFocus,
}: MainProps) {
	const project = openProject(workspace)

	return (
		<>
			{content === 'preview' && project !== null ? (
				<Preview
					project={project}
					onResetOptions={onResetOptions}
					zoom={zoom}
					onZoom={onZoom}
				/>
			) : (
				<Projects
					workspace={workspace}
					onCreate={onAddProject}
					onOpen={onOpenProject}
					onClose={project !== null ? onCloseProjects : undefined}
					returnFocus={returnFocus}
				/>
			)}
			{creatingProject && (
				<NewProjectDialog
					onCreate={onCreateProject}
					onCancel={onCancelNewProject}
					returnFocus={returnFocus}
				/>
			)}
		</>
	)
}

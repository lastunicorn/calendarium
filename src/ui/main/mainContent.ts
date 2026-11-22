import { openProject, type Workspace } from '../../workspace/Workspace'

/** What the main area shows: the open project's preview, or Documents, the projects kept in this browser. */
export const MAIN_CONTENTS = ['preview', 'projects'] as const
export type MainContent = (typeof MAIN_CONTENTS)[number]

/** What the main area shows when `requested` is asked for: Documents while no project is open, there being no preview. */
export function shownContent(requested: MainContent, workspace: Workspace): MainContent {
	return openProject(workspace) === null ? 'projects' : requested
}

import type { Project, ProjectId } from '../../workspace/Project'
import { openProject, type Workspace } from '../../workspace/Workspace'

/**
 * The project chosen in Documents, whose details show: the one `chosen` names, else the open one,
 * when none was chosen or it is gone; `null` with no project.
 */
export function chosenProject(workspace: Workspace, chosen: ProjectId | null): Project | null {
	return chosen !== null && Object.hasOwn(workspace.projects, chosen)
		? workspace.projects[chosen]
		: openProject(workspace)
}

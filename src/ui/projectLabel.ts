import type { Project } from '../workspace/Project'
import { LAYOUT_VIEWS } from './layouts/registry'

/** A project's name as shown: trimmed, or "Untitled". */
export function shownName({ name }: Project): string {
	return name.trim() || 'Untitled'
}

/** A project's label in a list of projects: its name and its layout's short name, "Work 2027 — Weekly". */
export function projectLabel(project: Project): string {
	return `${shownName(project)} — ${LAYOUT_VIEWS[project.layout].name}`
}

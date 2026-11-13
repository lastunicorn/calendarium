import { Component, type ErrorInfo, type MouseEvent, type ReactNode } from 'react'

import type { Project } from '../../workspace/Project'
import { projectFile } from '../../workspace/projectFile'
import { loadWorkspace } from '../../workspace/storage'
import { APP_VERSION } from '../../workspace/version'
import { projectList } from '../../workspace/Workspace'
import { downloadFile } from '../download'
import { projectLabel } from '../projectLabel'
import styles from './AppErrorBoundary.module.css'

interface AppErrorBoundaryProps {
	/** Reloads the page; a prop so tests can see it called, `location.reload` being unmockable in jsdom. */
	reload?: () => void
	children: ReactNode
}

interface AppErrorBoundaryState {
	error: Error | null
	/** The projects kept in this browser, read once the error happened, to save each to a file. */
	projects: readonly Project[]
}

function reloadPage() {
	location.reload()
}

/** The stored projects, in `projectList` order; none when even reading them fails. */
function storedProjects(): Project[] {
	try {
		return projectList(loadWorkspace())
	} catch {
		return []
	}
}

/**
 * Catches an error anywhere in the app, which would otherwise leave a blank page, and says the
 * projects are safe: it offers to reload, and to save each stored project to a file, so they can
 * be rescued even when reloading fails the same way. The preview has its own boundary
 * (`PreviewErrorBoundary`), which keeps the sidebar working.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
	state: AppErrorBoundaryState = { error: null, projects: [] }

	static getDerivedStateFromError(error: unknown): Partial<AppErrorBoundaryState> {
		return {
			error: error instanceof Error ? error : new Error(String(error)),
			projects: storedProjects(),
		}
	}

	componentDidCatch(error: unknown, info: ErrorInfo) {
		console.error('Calendarium failed to render:', error, info.componentStack)
	}

	handleReloadClick = () => {
		;(this.props.reload ?? reloadPage)()
	}

	handleSaveClick = (event: MouseEvent<HTMLButtonElement>) => {
		// Each button carries its project's index in `projects`.
		const project = this.state.projects[Number(event.currentTarget.dataset.index)]
		const file = projectFile(project)
		downloadFile(file.fileName, file.text, 'application/json')
	}

	render() {
		const { error, projects } = this.state
		if (error === null) return this.props.children
		return (
			<main className={styles.page} lang="en">
				<div className={styles.error} role="alert">
					<h1 className={styles.title}>Calendarium stopped working</h1>
					<pre className={styles.message}>{error.message}</pre>
					<button
						type="button"
						className={styles.button}
						onClick={this.handleReloadClick}
					>
						Reload
					</button>
					{projects.length > 0 ? (
						<>
							<p className={styles.text}>
								Your projects are kept in this browser. If reloading doesn’t help,
								save them to files, to open them again later:
							</p>
							<ul className={styles.projects}>
								{projects.map((project, index) => (
									<li key={project.id} className={styles.project}>
										<span className={styles.label}>
											{projectLabel(project)}
										</span>
										<button
											type="button"
											data-index={index}
											aria-label={`Save ${projectLabel(project)} to a file`}
											onClick={this.handleSaveClick}
										>
											Save to a file
										</button>
									</li>
								))}
							</ul>
						</>
					) : null}
					<p className={styles.hint}>
						If this keeps happening, please report it with the message above and the
						version, Calendarium {APP_VERSION}.
					</p>
				</div>
			</main>
		)
	}
}

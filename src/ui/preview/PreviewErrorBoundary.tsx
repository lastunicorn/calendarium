import { Component, type ErrorInfo, type ReactNode } from 'react'
import type { AnyLayoutOptions, LayoutId } from '../../layouts'
import styles from './PreviewErrorBoundary.module.css'

interface PreviewErrorBoundaryProps {
	layout: LayoutId
	/** The options being drawn; a new value (an edit, an opened file, a new project) tries drawing again. */
	options: AnyLayoutOptions
	/** Starts the layout's project over from its default options. */
	onNewProject: (layout: LayoutId) => void
	children: ReactNode
}

interface PreviewErrorBoundaryState {
	error: Error | null
	/** The options the error happened with; other options clear it. */
	layout: LayoutId
	options: AnyLayoutOptions
}

/**
 * Catches an error while drawing the pages, so the sidebar keeps working and the settings that
 * caused it can be changed or a new project started, instead of the whole app going blank.
 */
export class PreviewErrorBoundary extends Component<
	PreviewErrorBoundaryProps,
	PreviewErrorBoundaryState
> {
	state: PreviewErrorBoundaryState = {
		error: null,
		layout: this.props.layout,
		options: this.props.options,
	}

	static getDerivedStateFromError(error: unknown): Partial<PreviewErrorBoundaryState> {
		return { error: error instanceof Error ? error : new Error(String(error)) }
	}

	static getDerivedStateFromProps(
		{ layout, options }: PreviewErrorBoundaryProps,
		state: PreviewErrorBoundaryState,
	): Partial<PreviewErrorBoundaryState> | null {
		if (layout === state.layout && options === state.options) return null
		return { error: null, layout, options }
	}

	componentDidCatch(error: unknown, info: ErrorInfo) {
		console.error('The preview failed to render:', error, info.componentStack)
	}

	handleNewProjectClick = () => {
		this.props.onNewProject(this.props.layout)
	}

	render() {
		const { error } = this.state
		if (error === null) return this.props.children
		return (
			<div className={styles.error} role="alert" lang="en">
				<h2 className={styles.title}>The calendar can't be drawn with these settings</h2>
				<p className={styles.message}>{error.message}</p>
				<p className={styles.hint}>
					Change the settings in the sidebar, or start a new project from this layout's
					defaults.
				</p>
				<button type="button" onClick={this.handleNewProjectClick}>
					Start a new project
				</button>
			</div>
		)
	}
}

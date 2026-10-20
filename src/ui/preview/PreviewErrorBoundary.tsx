import { Component, type ErrorInfo, type ReactNode } from 'react'
import type { LayoutConfig, LayoutId } from '../../layouts'
import styles from './PreviewErrorBoundary.module.css'

interface PreviewErrorBoundaryProps {
	layout: LayoutId
	/** The options being drawn; a new value (an edit, an import, a reset) tries drawing again. */
	config: LayoutConfig
	/** Restores the layout's default options. */
	onReset: (layout: LayoutId) => void
	children: ReactNode
}

interface PreviewErrorBoundaryState {
	error: Error | null
	/** The options the error happened with; other options clear it. */
	layout: LayoutId
	config: LayoutConfig
}

/**
 * Catches an error while drawing the pages, so the sidebar keeps working and the settings that
 * caused it can be changed or reset, instead of the whole app going blank.
 */
export class PreviewErrorBoundary extends Component<
	PreviewErrorBoundaryProps,
	PreviewErrorBoundaryState
> {
	state: PreviewErrorBoundaryState = {
		error: null,
		layout: this.props.layout,
		config: this.props.config,
	}

	static getDerivedStateFromError(error: unknown): Partial<PreviewErrorBoundaryState> {
		return { error: error instanceof Error ? error : new Error(String(error)) }
	}

	static getDerivedStateFromProps(
		{ layout, config }: PreviewErrorBoundaryProps,
		state: PreviewErrorBoundaryState,
	): Partial<PreviewErrorBoundaryState> | null {
		if (layout === state.layout && config === state.config) return null
		return { error: null, layout, config }
	}

	componentDidCatch(error: unknown, info: ErrorInfo) {
		console.error('The preview failed to render:', error, info.componentStack)
	}

	handleResetClick = () => {
		this.props.onReset(this.props.layout)
	}

	render() {
		const { error } = this.state
		if (error === null) return this.props.children
		return (
			<div className={styles.error} role="alert">
				<h2 className={styles.title}>The calendar can't be drawn with these settings</h2>
				<p className={styles.message}>{error.message}</p>
				<p className={styles.hint}>
					Change the settings in the sidebar, or reset this layout to its defaults.
				</p>
				<button type="button" onClick={this.handleResetClick}>
					Reset this layout's settings
				</button>
			</div>
		)
	}
}

import { type ChangeEvent, type FocusEvent, type PointerEvent, useRef, useState } from 'react'
import { activeProject, type Workspace } from '../../workspace/Workspace'
import { LAYOUT_IDS, type LayoutId } from '../../layouts'
import { type OpenedProject, parseProjectFile, projectFile } from '../../workspace/projectFile'
import { IconButton } from '../components/IconButton'
import { LayoutIcon, OpenIcon, ResetIcon, SaveIcon } from '../components/icons'
import { downloadFile } from '../download'
import { SelectField } from '../fields/SelectField'
import { LAYOUT_VIEWS } from '../layouts/registry'
import styles from './LayoutSection.module.css'
import { Section } from './Section'

const LAYOUT_OPTIONS = LAYOUT_IDS.map((layout) => ({
	value: layout,
	label: LAYOUT_VIEWS[layout].label,
}))

interface LayoutSectionProps {
	workspace: Workspace
	/** Shows another layout, with the options it had last. */
	onSelect: (layout: LayoutId) => void
	/** Starts one layout's project over from its default options. */
	onNew: (layout: LayoutId) => void
	/** Replaces the last project of a file's layout with the file's and shows that layout. */
	onOpen: (opened: OpenedProject) => void
}

/**
 * What to tell the user about an opened project file made by a newer version, or with invalid fields;
 * empty when there is nothing to report.
 */
function describeOpened(fileName: string, { ignored, newer }: OpenedProject): string {
	const notices = []
	if (newer) {
		notices.push(`Opened ${fileName}, made by a newer version; some settings may be ignored.`)
	}
	if (ignored.length > 0) {
		const settings = ignored.length === 1 ? '1 setting was' : `${ignored.length} settings were`
		const fields = ignored.join(', ')
		notices.push(
			newer
				? `${settings} invalid and kept the default: ${fields}.`
				: `Opened ${fileName}; ${settings} invalid and kept the default: ${fields}.`,
		)
	}
	return notices.join(' ')
}

/** The label of the action button `target` is in, or empty outside a button. */
function actionLabel(target: EventTarget): string {
	return (target instanceof Element && target.closest('button')?.title) || ''
}

/**
 * How the calendar is spread over pages, above the saving, opening and starting over of the shown
 * layout's project; each layout keeps its own last project. Always open.
 */
export function LayoutSection({ workspace, onSelect, onNew, onOpen }: LayoutSectionProps) {
	const { layout } = workspace

	const fileInput = useRef<HTMLInputElement>(null)
	const [openError, setOpenError] = useState('')
	const [openNotice, setOpenNotice] = useState('')
	const [hint, setHint] = useState('')

	function handleActionsPointerOver(event: PointerEvent<HTMLDivElement>) {
		setHint(actionLabel(event.target))
	}

	function handleActionsFocus(event: FocusEvent<HTMLDivElement>) {
		setHint(actionLabel(event.target))
	}

	function handleActionsLeave() {
		setHint('')
	}

	function handleSaveClick() {
		const file = projectFile(activeProject(workspace))
		downloadFile(file.fileName, file.text, 'application/json')
	}

	function handleOpenClick() {
		fileInput.current?.click()
	}

	function handleNewClick() {
		const question = `Start a new ${LAYOUT_VIEWS[layout].name} project? Its settings go back to their defaults; save the current project to a file first to keep it.`
		if (!window.confirm(question)) return
		setOpenError('')
		setOpenNotice('')
		onNew(layout)
	}

	async function handleOpenFileChange(event: ChangeEvent<HTMLInputElement>) {
		const input = event.currentTarget
		const file = input.files?.[0]
		// Reset so choosing the same file again still fires `change`.
		input.value = ''
		if (!file) return

		const opened = parseProjectFile(await file.text(), layout)
		if (opened === null) {
			setOpenError(`${file.name} is not a calendar project file.`)
			setOpenNotice('')
			return
		}
		setOpenError('')
		setOpenNotice(describeOpened(file.name, opened))
		onOpen(opened)
	}

	return (
		<Section title="Project" icon={<LayoutIcon />} collapsible={false}>
			<SelectField
				label="Layout"
				value={layout}
				options={LAYOUT_OPTIONS}
				onChange={onSelect} />
			<div className={styles.actionsGroup}>
				<div
					className={styles.actions}
					role="toolbar"
					aria-label="Project"
					onPointerOver={handleActionsPointerOver}
					onPointerLeave={handleActionsLeave}
					onFocus={handleActionsFocus}
					onBlur={handleActionsLeave}
				>
					<IconButton
						label="Save project to a file"
						icon={<SaveIcon />}
						onClick={handleSaveClick}
					/>
					<IconButton
						label="Open a project file"
						icon={<OpenIcon />}
						onClick={handleOpenClick}
					/>
					<IconButton
						label="New project"
						icon={<ResetIcon />}
						onClick={handleNewClick}
					/>
					<input
						ref={fileInput}
						type="file"
						accept=".json,application/json"
						hidden
						onChange={handleOpenFileChange}
					/>
				</div>
				{/* The buttons are already named by their labels; this repeats one for the eye. */}
				<p className={styles.hint} aria-hidden="true">
					{hint}
				</p>
			</div>

			{openError && (
				<p className={styles.error} role="alert">
					{openError}
				</p>
			)}
			{openNotice && (
				<p className={styles.notice} role="status">
					{openNotice}
				</p>
			)}
		</Section>
	)
}

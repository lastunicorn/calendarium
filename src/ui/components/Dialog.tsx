import {
	type FormEvent,
	type ReactNode,
	type SyntheticEvent,
	useEffect,
	useId,
	useRef,
} from 'react'
import { CloseIcon } from './icons'
import styles from './Dialog.module.css'

interface DialogProps {
	title: string
	/** The primary action's label, on the submit button: Create, Overwrite, Delete. */
	submitLabel: string
	onSubmit: () => void
	/** Closes the dialog without acting: Cancel, the close button, or Escape. */
	onCancel: () => void
	/**
	 * Where the focus goes once the dialog closes when there is nothing to go back to: nothing had
	 * it, or what had it is gone, like the empty preview's button the created project replaces.
	 */
	returnFocus?: () => HTMLElement | null
	/** The question or the fields, above the actions. */
	children: ReactNode
}

/**
 * A modal dialog over the whole app, shown while it is mounted: a native `<dialog>` opened with
 * `showModal`, so the rest of the page is out of reach. A title with a close button, its body,
 * then Cancel and the primary action, which submits its form, so Enter in a field acts too.
 * Escape and the close button cancel. Focus moves to the body's checked radio, or its first field,
 * or to Cancel when it has none (a question), and goes back where it was once the dialog closes,
 * or to `returnFocus` when that is gone. Never printed.
 */
export function Dialog({
	title,
	submitLabel,
	onSubmit,
	onCancel,
	returnFocus,
	children,
}: DialogProps) {
	const titleId = useId()
	const dialog = useRef<HTMLDialogElement>(null)
	const body = useRef<HTMLDivElement>(null)
	const cancel = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		const element = dialog.current
		if (element === null) return
		// The page itself has the focus when nothing does.
		const opener = document.activeElement === document.body ? null : document.activeElement
		element.showModal()
		// A checked radio before the first field, so a list of choices starts on the chosen one.
		const field =
			body.current?.querySelector<HTMLElement>('input:checked') ??
			body.current?.querySelector<HTMLElement>('input, select, textarea')
		;(field ?? cancel.current)?.focus()
		return () => {
			element.close()
			const back = opener instanceof HTMLElement && opener.isConnected ? opener : null
			// Asked once closed: the element may have appeared with the dialog's closing.
			;(back ?? returnFocus?.())?.focus()
		}
	}, [returnFocus])

	// The browser closes the dialog on Escape; the owner decides instead, by unmounting it.
	function handleDialogCancel(event: SyntheticEvent<HTMLDialogElement>) {
		event.preventDefault()
		onCancel()
	}

	function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		onSubmit()
	}

	return (
		<dialog
			ref={dialog}
			className={styles.dialog}
			aria-labelledby={titleId}
			onCancel={handleDialogCancel}
		>
			<form className={styles.form} onSubmit={handleFormSubmit}>
				<div className={styles.header}>
					<h2 id={titleId} className={styles.title}>
						{title}
					</h2>
					<button
						type="button"
						className={styles.close}
						title="Close"
						aria-label="Close"
						onClick={onCancel}
					>
						<CloseIcon />
					</button>
				</div>
				<div ref={body} className={styles.body}>
					{children}
				</div>
				<div className={styles.actions}>
					<button ref={cancel} type="button" className={styles.action} onClick={onCancel}>
						Cancel
					</button>
					<button type="submit" className={styles.action}>
						{submitLabel}
					</button>
				</div>
			</form>
		</dialog>
	)
}

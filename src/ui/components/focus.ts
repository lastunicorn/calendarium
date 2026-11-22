/**
 * Where the focus starts in `container`: its checked radio, so a list of choices starts on the
 * chosen one, else its first field; `null` when it has neither.
 */
export function firstField(container: HTMLElement | null): HTMLElement | null {
	return (
		container?.querySelector<HTMLElement>('input:checked') ??
		container?.querySelector<HTMLElement>('input, select, textarea') ??
		null
	)
}

/**
 * Remembers what has the focus, before something shown takes it: the function returned gives it
 * back, or gives it to what `fallback` returns when there is nothing to go back to (nothing had
 * the focus, or what had it is gone). Called once what took the focus is gone, so `fallback` may
 * return an element that appeared with its going.
 */
export function takeFocus(): (fallback?: () => HTMLElement | null) => void {
	// The page itself has the focus when nothing does.
	const opener = document.activeElement === document.body ? null : document.activeElement
	return (fallback) => {
		const back = opener instanceof HTMLElement && opener.isConnected ? opener : null
		;(back ?? fallback?.())?.focus()
	}
}

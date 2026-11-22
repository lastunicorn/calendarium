import { useEffect, useEffectEvent, type RefObject } from 'react'

/**
 * Calls `onEscape` on Escape inside `ref`'s element, unless in a dialog shown from it, whose own
 * Escape closes the dialog only; nothing while `onEscape` is undefined.
 */
export function useEscapeKey(
	ref: RefObject<HTMLElement | null>,
	onEscape: (() => void) | undefined,
) {
	const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
		if (event.key !== 'Escape' || onEscape === undefined) return
		if (event.target instanceof Element && event.target.closest('dialog') !== null) return
		event.preventDefault()
		onEscape()
	})

	useEffect(() => {
		const element = ref.current
		if (element === null) return
		element.addEventListener('keydown', handleKeyDown)
		return () => {
			element.removeEventListener('keydown', handleKeyDown)
		}
	}, [ref])
}

import type { MouseEventHandler, ReactNode, Ref } from 'react'

import styles from './IconButton.module.css'

interface IconButtonProps {
	/** Accessible name, also shown as the hover tooltip. */
	label: string
	icon: ReactNode
	onClick: MouseEventHandler<HTMLButtonElement>
	disabled?: boolean
	/** Whether what it shows is shown, for a button that shows something and hides it again. */
	pressed?: boolean
	ref?: Ref<HTMLButtonElement>
}

export function IconButton({
	label,
	icon,
	onClick,
	disabled = false,
	pressed,
	ref,
}: IconButtonProps) {
	return (
		<button
			ref={ref}
			type="button"
			className={styles.iconButton}
			title={label}
			aria-label={label}
			disabled={disabled}
			aria-pressed={pressed}
			onClick={onClick}
		>
			{icon}
		</button>
	)
}

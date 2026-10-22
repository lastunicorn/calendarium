import type { MouseEventHandler, ReactNode } from 'react'
import styles from './IconButton.module.css'

interface IconButtonProps {
	/** Accessible name, also shown as the hover tooltip. */
	label: string
	icon: ReactNode
	onClick: MouseEventHandler<HTMLButtonElement>
	disabled?: boolean
}

export function IconButton({ label, icon, onClick, disabled = false }: IconButtonProps) {
	return (
		<button
			type="button"
			className={styles.iconButton}
			title={label}
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
		>
			{icon}
		</button>
	)
}

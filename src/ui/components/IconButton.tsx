import type { MouseEventHandler, ReactNode, Ref } from 'react'
import styles from './IconButton.module.css'

interface IconButtonProps {
	/** Accessible name, also shown as the hover tooltip. */
	label: string
	icon: ReactNode
	onClick: MouseEventHandler<HTMLButtonElement>
	disabled?: boolean
	ref?: Ref<HTMLButtonElement>
}

export function IconButton({ label, icon, onClick, disabled = false, ref }: IconButtonProps) {
	return (
		<button
			ref={ref}
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

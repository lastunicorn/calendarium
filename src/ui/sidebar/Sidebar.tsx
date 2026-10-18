import type { ReactNode } from 'react'
import styles from './Sidebar.module.css'

interface SidebarProps {
	children: ReactNode
}

/** The left-hand panel with the app heading; hidden when printing. */
export function Sidebar({ children }: SidebarProps) {
	return (
		<aside className={styles.sidebar}>
			<h1 className={styles.heading}>Calendar</h1>
			{children}
		</aside>
	)
}

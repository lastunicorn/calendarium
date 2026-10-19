import type { ReactNode } from 'react'
import { APP_VERSION } from '../../config/version'
import styles from './Sidebar.module.css'

interface SidebarProps {
	children: ReactNode
}

/** The left-hand panel with the app heading; hidden when printing. */
export function Sidebar({ children }: SidebarProps) {
	return (
		<aside className={styles.sidebar}>
			<h1 className={styles.heading}>
				Calendarium <span className={styles.version}>v{APP_VERSION}</span>
			</h1>
			{children}
		</aside>
	)
}

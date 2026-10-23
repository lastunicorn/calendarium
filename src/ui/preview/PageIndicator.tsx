import { type ChangeEvent, type FocusEvent, type KeyboardEvent, useState } from 'react'
import { bookletSides } from '../../core/booklet'
import { IconButton } from '../components/IconButton'
import { ChevronIcon, ChevronLeftIcon } from '../components/icons'
import floating from './FloatingBar.module.css'
import styles from './PageIndicator.module.css'

interface PageIndicatorProps {
	/** The page shown, 0-based, in reading order. */
	current: number
	/** The pages drawn, a booklet's blank ones included. */
	count: number
	/** Whether the pages are a booklet's, whose sheet sides it also counts. */
	booklet: boolean
	onGoToPage: (index: number) => void
}

function handlePageFocus(event: FocusEvent<HTMLInputElement>) {
	event.currentTarget.select()
}

/**
 * Where the preview is among its pages, `n / total` in reading order, and for a booklet the side
 * of a sheet that page is printed on: the page before or after, or the page typed in (on Enter or
 * when leaving the field). Hidden when there is one page only.
 */
export function PageIndicator({ current, count, booklet, onGoToPage }: PageIndicatorProps) {
	// What the viewer is typing, `null` when the field shows the current page.
	const [draft, setDraft] = useState<string | null>(null)
	if (count <= 1) return null
	const sides = booklet ? bookletSides(count) : null
	const side = sides?.findIndex((pages) => pages.includes(current)) ?? -1

	function goToDraft() {
		if (draft === null) return
		const number = Number.parseInt(draft, 10)
		if (Number.isFinite(number)) onGoToPage(Math.min(Math.max(number, 1), count) - 1)
		setDraft(null)
	}

	function handlePreviousClick() {
		onGoToPage(current - 1)
	}

	function handleNextClick() {
		onGoToPage(current + 1)
	}

	function handlePageChange(event: ChangeEvent<HTMLInputElement>) {
		setDraft(event.currentTarget.value)
	}

	function handlePageKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter') goToDraft()
		else if (event.key === 'Escape') setDraft(null)
	}

	return (
		<div
			className={`${floating.floatingBar} ${styles.pageIndicator}`}
			role="toolbar"
			aria-label="Pages"
		>
			<IconButton
				label="Previous page"
				icon={<ChevronLeftIcon />}
				disabled={current === 0}
				onClick={handlePreviousClick}
			/>
			<input
				className={styles.number}
				type="text"
				inputMode="numeric"
				aria-label="Page number"
				size={String(count).length}
				value={draft ?? String(current + 1)}
				onChange={handlePageChange}
				onKeyDown={handlePageKeyDown}
				onFocus={handlePageFocus}
				onBlur={goToDraft}
			/>
			<span className={styles.count}>/ {count}</span>
			{sides !== null && side >= 0 && (
				<span className={styles.side}>
					side {side + 1} / {sides.length}
				</span>
			)}
			<IconButton
				label="Next page"
				icon={<ChevronIcon />}
				disabled={current >= count - 1}
				onClick={handleNextClick}
			/>
		</div>
	)
}

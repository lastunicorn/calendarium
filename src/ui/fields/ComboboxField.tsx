import {
	type ChangeEvent,
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'
import styles from './ComboboxField.module.css'
import { Field } from './Field'
import { type FilterOption, matchesFilter, searchText } from './filter'
import type { Description } from './description'

interface ComboboxFieldProps<T extends string | number> {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: Description
	value: T
	/** Matched by the filter on their label and their `keywords`. */
	options: readonly FilterOption<T>[]
	onChange: (value: T) => void
}

/** Keeps the focus in the filter box when an option or the list's scroll bar is pressed. */
function handlePopupMouseDown(event: MouseEvent<HTMLDivElement>) {
	if (!(event.target instanceof HTMLInputElement)) event.preventDefault()
}

/**
 * A select for long lists: a button showing the chosen option, opening a list under a filter box.
 * Typing narrows the list (case and accents ignored), the arrow keys move through it, Enter picks,
 * and Escape, Tab or a click elsewhere closes it unchanged.
 */
export function ComboboxField<T extends string | number>({
	label,
	description,
	value,
	options,
	onChange,
}: ComboboxFieldProps<T>) {
	const listId = useId()
	const box = useRef<HTMLDivElement>(null)
	const button = useRef<HTMLButtonElement>(null)
	const list = useRef<HTMLUListElement>(null)
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [activeIndex, setActiveIndex] = useState(0)

	const searchable = useMemo(
		() => options.map((option) => ({ option, text: searchText(option) })),
		[options],
	)
	const shown = searchable.filter(({ text }) => matchesFilter(text, query))
	const selected = options.find((option) => option.value === value)

	useEffect(() => {
		if (!open) return
		list.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
	}, [open, activeIndex])

	function openList(initialQuery: string) {
		const index =
			initialQuery === '' ? options.findIndex((option) => option.value === value) : 0
		setQuery(initialQuery)
		setActiveIndex(Math.max(index, 0))
		setOpen(true)
	}

	function close() {
		setOpen(false)
		button.current?.focus()
	}

	function pick(index: number) {
		const entry = shown[index]
		if (entry === undefined) return
		onChange(entry.option.value)
		close()
	}

	function handleButtonClick() {
		if (open) close()
		else openList('')
	}

	function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			openList('')
		} else if (
			event.key.length === 1 &&
			event.key !== ' ' &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.altKey
		) {
			// Typing on the closed field starts the filter with that letter.
			event.preventDefault()
			openList(event.key)
		}
	}

	function handleFilterChange(event: ChangeEvent<HTMLInputElement>) {
		setQuery(event.currentTarget.value)
		setActiveIndex(0)
	}

	function handleFilterKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		const last = shown.length - 1
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				setActiveIndex(activeIndex >= last ? 0 : activeIndex + 1)
				break
			case 'ArrowUp':
				event.preventDefault()
				setActiveIndex(activeIndex <= 0 ? last : activeIndex - 1)
				break
			case 'PageDown':
				event.preventDefault()
				setActiveIndex(last)
				break
			case 'PageUp':
				event.preventDefault()
				setActiveIndex(0)
				break
			case 'Enter':
				event.preventDefault()
				pick(activeIndex)
				break
			case 'Escape':
				event.preventDefault()
				close()
				break
			case 'Tab':
				setOpen(false)
				break
		}
	}

	function handleFilterBlur(event: FocusEvent<HTMLInputElement>) {
		if (!box.current?.contains(event.relatedTarget)) setOpen(false)
	}

	function handleOptionClick(event: MouseEvent<HTMLLIElement>) {
		pick(Number(event.currentTarget.dataset.index))
	}

	function handleOptionMouseMove(event: MouseEvent<HTMLLIElement>) {
		const index = Number(event.currentTarget.dataset.index)
		if (index !== activeIndex) setActiveIndex(index)
	}

	return (
		<Field label={label} description={description}>
			{(control) => (
				<div ref={box} className={styles.box}>
					<button
						{...control}
						ref={button}
						type="button"
						className={styles.button}
						aria-haspopup="listbox"
						aria-expanded={open}
						onClick={handleButtonClick}
						onKeyDown={handleButtonKeyDown}
					>
						<span className={styles.value}>{selected?.label}</span>
						<svg className={styles.arrow} viewBox="0 0 16 16" aria-hidden="true">
							<path d="M4 6l4 4 4-4" />
						</svg>
					</button>
					{open && (
						<div className={styles.popup} onMouseDown={handlePopupMouseDown}>
							<input
								className={styles.filter}
								type="text"
								role="combobox"
								aria-label={`Filter ${label}`}
								aria-expanded="true"
								aria-controls={listId}
								aria-autocomplete="list"
								aria-activedescendant={
									shown.length > 0 ? `${listId}-${activeIndex}` : undefined
								}
								placeholder="Type to filter…"
								autoComplete="off"
								spellCheck={false}
								autoFocus
								value={query}
								onChange={handleFilterChange}
								onKeyDown={handleFilterKeyDown}
								onBlur={handleFilterBlur}
							/>
							<ul
								ref={list}
								id={listId}
								role="listbox"
								aria-label={label}
								className={styles.list}
							>
								{shown.map(({ option }, index) => (
									<li
										key={option.value}
										id={`${listId}-${index}`}
										role="option"
										aria-selected={option.value === value}
										data-index={index}
										className={
											index === activeIndex
												? `${styles.option} ${styles.active}`
												: styles.option
										}
										onClick={handleOptionClick}
										onMouseMove={handleOptionMouseMove}
									>
										{option.label}
									</li>
								))}
							</ul>
							{shown.length === 0 && <p className={styles.empty}>No matches</p>}
						</div>
					)}
				</div>
			)}
		</Field>
	)
}

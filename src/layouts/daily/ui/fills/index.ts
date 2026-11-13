import type { ComponentType } from 'react'
import type { DayFill } from '../../pages'
import { Dots } from './Dots'
import { GenkoYoshi } from './GenkoYoshi'
import { Ruled } from './Ruled'
import { Schedule } from './Schedule'
import { Squares } from './Squares'

/** The component drawing a fill of a kind, given that fill; `null` for one that draws nothing. */
type FillComponent<K extends DayFill['kind']> = ComponentType<{
	fill: Extract<DayFill, { kind: K }>
}> | null

/** What draws each kind of fill under a day's header, or on all of its second sheet. */
const DAY_FILLS: { [K in DayFill['kind']]: FillComponent<K> } = {
	hours: Schedule,
	ruled: Ruled,
	squares: Squares,
	dots: Dots,
	genkoYoshi: GenkoYoshi,
	blank: null,
}

/** The component drawing a fill of `kind`, `null` for a blank one. */
export function dayFillComponent<K extends DayFill['kind']>(kind: K): FillComponent<K> {
	return DAY_FILLS[kind]
}

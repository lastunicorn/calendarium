import { defineLayout } from '../LayoutSpec'
import { DAY_PER_PAGE_SPEC } from './options'

// The day-per-page layout's entry point: what the registry (`layouts/index.ts`) knows of it.
// Everything else in this folder is the layout's own.
export const DAY_PER_PAGE = defineLayout('day-per-page', DAY_PER_PAGE_SPEC)

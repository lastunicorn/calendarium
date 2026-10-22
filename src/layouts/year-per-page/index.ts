import { defineLayout } from '../LayoutSpec'
import { YEAR_PER_PAGE_SPEC } from './options'

// The year-per-page layout's entry point: what the registry (`layouts/index.ts`) knows of it.
// Everything else in this folder is the layout's own.
export const YEAR_PER_PAGE = defineLayout('year-per-page', YEAR_PER_PAGE_SPEC)

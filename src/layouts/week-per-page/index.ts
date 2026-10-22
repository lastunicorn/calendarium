import { defineLayout } from '../LayoutSpec'
import { WEEK_PER_PAGE_SPEC } from './options'

// The week-per-page layout's entry point: what the registry (`layouts/index.ts`) knows of it.
// Everything else in this folder is the layout's own.
export const WEEK_PER_PAGE = defineLayout('week-per-page', WEEK_PER_PAGE_SPEC)

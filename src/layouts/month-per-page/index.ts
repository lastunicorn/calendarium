import { defineLayout } from '../LayoutSpec'
import { MONTH_PER_PAGE_SPEC } from './options'

// The month-per-page layout's entry point: what the registry (`layouts/index.ts`) knows of it.
// Everything else in this folder is the layout's own.
export const MONTH_PER_PAGE = defineLayout('month-per-page', MONTH_PER_PAGE_SPEC)

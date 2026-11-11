import { defineLayout } from '../LayoutSpec'
import { WEEKLY_SPEC } from './options'

// The weekly layout's entry point: what the registry (`layouts/index.ts`) knows of it.
// Everything else in this folder is the layout's own.
export const WEEKLY = defineLayout('weekly', WEEKLY_SPEC)

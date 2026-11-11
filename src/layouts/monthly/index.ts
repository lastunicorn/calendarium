import { defineLayout } from '../LayoutSpec'
import { MONTHLY_SPEC } from './options'

// The monthly layout's entry point: what the registry (`layouts/index.ts`) knows of it.
// Everything else in this folder is the layout's own.
export const MONTHLY = defineLayout('monthly', MONTHLY_SPEC)

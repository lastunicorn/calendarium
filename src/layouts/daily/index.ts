import { defineLayout } from '../LayoutSpec'
import { DAILY_SPEC } from './options'

// The daily layout's entry point: what the registry (`layouts/index.ts`) knows of it.
// Everything else in this folder is the layout's own.
export const DAILY = defineLayout('daily', DAILY_SPEC)

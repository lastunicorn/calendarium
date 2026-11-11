import { defineLayout } from '../LayoutSpec'
import { YEARLY_SPEC } from './options'

// The yearly layout's entry point: what the registry (`layouts/index.ts`) knows of it.
// Everything else in this folder is the layout's own.
export const YEARLY = defineLayout('yearly', YEARLY_SPEC)

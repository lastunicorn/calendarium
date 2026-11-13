import { createContext } from 'react'

/** Told by each `Page`, keyed by an object of its own, when its content stops or starts fitting. */
export type ReportPageOverflow = (page: object, overflows: boolean) => void

function ignoreOverflow() {}

/** Where pages report their overflow: the `Preview`, which counts them; nowhere outside one. */
export const PageOverflowContext = createContext<ReportPageOverflow>(ignoreOverflow)

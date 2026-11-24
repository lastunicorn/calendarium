import { createContext, useContext } from 'react'

import { BROWSER_PORTS, type Ports } from '../ports'

/**
 * The ports the app reaches external resources through: the browser's, which `main.tsx` provides,
 * unless a test gives its own.
 */
export const PortsContext = createContext<Ports>(BROWSER_PORTS)

/** The ports the app reaches external resources through. */
export function usePorts(): Ports {
	return useContext(PortsContext)
}

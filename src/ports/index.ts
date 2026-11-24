import { BROWSER_PRINTER, type PrinterAccess } from './PrinterAccess'

/** Every external resource the app reaches, each through the port of what it needs. */
export interface Ports {
	printer: PrinterAccess
}

/** The browser's adapters: what the app runs on. */
export const BROWSER_PORTS: Ports = {
	printer: BROWSER_PRINTER,
}

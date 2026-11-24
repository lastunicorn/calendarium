import { BROWSER_ENVIRONMENT, type EnvironmentAccess } from './EnvironmentAccess'
import { BROWSER_IDS, type IdAccess } from './IdAccess'
import { BROWSER_PRINTER, type PrinterAccess } from './PrinterAccess'
import { BROWSER_PROJECT_FILES, type ProjectFileAccess } from './ProjectFileAccess'

/** Every external resource the app reaches, each through the port of what it needs. */
export interface Ports {
	environment: EnvironmentAccess
	ids: IdAccess
	projectFiles: ProjectFileAccess
	printer: PrinterAccess
}

/** The browser's adapters: what the app runs on. */
export const BROWSER_PORTS: Ports = {
	environment: BROWSER_ENVIRONMENT,
	ids: BROWSER_IDS,
	projectFiles: BROWSER_PROJECT_FILES,
	printer: BROWSER_PRINTER,
}

import type { Environment } from '../core/environment'

/** Where the app runs: what a new calendar starts from. */
export interface EnvironmentAccess {
	/** The environment now: this year by the system clock, in its time zone, and the browser's language. */
	current: () => Environment
}

/** The browser's: the system clock, and the language the browser is set to. */
export const BROWSER_ENVIRONMENT: EnvironmentAccess = {
	current: () => ({
		year: new Date().getFullYear(),
		language: globalThis.navigator?.language,
	}),
}

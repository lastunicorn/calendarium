/**
 * What the app reads from where it runs: the clock and the browser's language. Read only by
 * `currentEnvironment`, and passed down from there, so the domain stays deterministic.
 */
export interface Environment {
	/** The current year, the year a new calendar starts from. */
	year: number
	/** The browser's language tag (`navigator.language`), `undefined` outside a browser. */
	language: string | undefined
}

/** The environment the app runs in now: the only place the clock and the browser language are read. */
export function currentEnvironment(): Environment {
	return {
		year: new Date().getFullYear(),
		language: globalThis.navigator?.language,
	}
}

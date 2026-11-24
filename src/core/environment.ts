/**
 * What the app reads from where it runs: the current year and the browser's language, what a new
 * calendar starts from. The composition root takes it from the environment port
 * (`EnvironmentAccess`) and passes it down, so the domain stays deterministic.
 */
export interface Environment {
	/** The current year, the year a new calendar starts from. */
	year: number
	/** The browser's language tag (`navigator.language`), `undefined` outside a browser. */
	language: string | undefined
}

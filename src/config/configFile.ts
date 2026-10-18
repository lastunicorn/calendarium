import type { CalendarConfig } from './CalendarConfig'
import { parseConfig, toStoredConfig } from './parseConfig'

/** Pretty-printed JSON for a downloadable config file. */
export function serializeConfig(config: CalendarConfig): string {
	return JSON.stringify(toStoredConfig(config), null, '\t') + '\n'
}

/** Parses an imported config file; `null` when it is not a JSON object. */
export function parseConfigFile(text: string): CalendarConfig | null {
	try {
		const data: unknown = JSON.parse(text)
		if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
		return parseConfig(data)
	} catch {
		return null
	}
}

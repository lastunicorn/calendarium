import type { LayoutConfigs, LayoutId } from './CalendarConfig'
import { parseLayoutConfig, parseLayoutId, toStoredLayoutConfig } from './parseConfig'

/** Pretty-printed JSON for a downloadable file holding one layout's options. */
export function serializeLayoutConfig<K extends LayoutId>(
	layout: K,
	config: LayoutConfigs[K],
): string {
	return JSON.stringify(toStoredLayoutConfig(layout, config), null, '\t') + '\n'
}

/**
 * One layout's options read from a file, with the layout they belong to and the fields that
 * were invalid (see `ParsedLayoutConfig`).
 */
export type ImportedLayoutConfig = {
	[K in LayoutId]: { layout: K; config: LayoutConfigs[K]; ignored: string[] }
}[LayoutId]

function imported<K extends LayoutId>(layout: K, data: unknown) {
	return { layout, ...parseLayoutConfig(layout, data) } as ImportedLayoutConfig
}

/**
 * Parses an imported config file; `null` when it is not a JSON object. The options go to the
 * layout the file names, or to `fallbackLayout` when it names none.
 */
export function parseConfigFile(
	text: string,
	fallbackLayout: LayoutId,
): ImportedLayoutConfig | null {
	try {
		const data: unknown = JSON.parse(text)
		if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
		return imported(parseLayoutId(data) ?? fallbackLayout, data)
	} catch {
		return null
	}
}

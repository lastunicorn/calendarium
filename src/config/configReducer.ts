import type { CalendarConfig } from './CalendarConfig'

export type ConfigAction =
	/** Changes some fields, keeping the rest. */
	| { type: 'update'; patch: Partial<CalendarConfig> }
	/** Swaps in a whole config, e.g. an imported file or the defaults. */
	| { type: 'replace'; config: CalendarConfig }

export function configReducer(config: CalendarConfig, action: ConfigAction): CalendarConfig {
	switch (action.type) {
		case 'update':
			return { ...config, ...action.patch }
		case 'replace':
			return action.config
	}
}

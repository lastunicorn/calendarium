import type { Patch } from '../../core/data'
import type { OptionsSectionProps } from './Section'

/**
 * The props of a section editing the nested group `group` of the options `props` edit: that
 * group's values and defaults, and an update patching it inside the options.
 */
export function optionsGroup<O extends object, K extends keyof O & string>(
	{ options, defaults, onUpdate }: OptionsSectionProps<O>,
	group: K,
): OptionsSectionProps<O[K]> {
	function handleGroupUpdate(patch: Patch<O[K]>) {
		// The patch of one group, under its key, is a patch of the options.
		onUpdate({ [group]: patch } as Patch<O>)
	}
	return { options: options[group], defaults: defaults[group], onUpdate: handleGroupUpdate }
}

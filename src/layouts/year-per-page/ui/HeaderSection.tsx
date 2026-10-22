import { yearName } from '../../../core/locale'
import type { YearPerPageOptions } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { TextField } from '../../../ui/fields/TextField'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

/** The heading printed above the calendar. */
export function HeaderSection({
	options,
	defaults,
	onUpdate,
}: OptionsSectionProps<YearPerPageOptions>) {
	function handleTitleChange(title: string) {
		onUpdate({ title })
	}

	function handleSubtitleChange(subtitle: string) {
		onUpdate({ subtitle })
	}

	function handleReset() {
		onUpdate(defaultFields(defaults, ['title', 'subtitle']))
	}

	return (
		<Section title="Header" icon={<HeaderIcon />} onReset={handleReset}>
			<TextField
				label="Title"
				value={options.title}
				placeholder={yearName(options.locale, options.year)}
				onChange={handleTitleChange}
			/>
			<TextField label="Subtitle" value={options.subtitle} onChange={handleSubtitleChange} />
		</Section>
	)
}

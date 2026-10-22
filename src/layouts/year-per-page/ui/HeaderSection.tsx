import { yearName } from '../../../core/locale'
import type { YearPerPageConfig } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { TextField } from '../../../ui/fields/TextField'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { type ConfigSectionProps, Section } from '../../../ui/sidebar/Section'

/** The heading printed above the calendar. */
export function HeaderSection({
	config,
	defaults,
	onUpdate,
}: ConfigSectionProps<YearPerPageConfig>) {
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
				value={config.title}
				placeholder={yearName(config.locale, config.year)}
				onChange={handleTitleChange}
			/>
			<TextField label="Subtitle" value={config.subtitle} onChange={handleSubtitleChange} />
		</Section>
	)
}

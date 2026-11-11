import { yearName } from '../../../core/locale'
import type { YearlyOptions } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { TextField } from '../../../ui/fields/TextField'
import { HeadingFontSizeField } from '../../../ui/sidebar/HeadingFontSizeField'
import { defaultFields } from '../../../ui/sidebar/defaultFields'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

/** The heading printed above the calendar, and its size. */
export function HeaderSection({ options, defaults, onUpdate }: OptionsSectionProps<YearlyOptions>) {
	function handleTitleChange(title: string) {
		onUpdate({ title })
	}

	function handleSubtitleChange(subtitle: string) {
		onUpdate({ subtitle })
	}

	function handleHeadingFontSizeChange(headingFontSize: number) {
		onUpdate({ headingFontSize })
	}

	function handleReset() {
		onUpdate(defaultFields(defaults, ['title', 'subtitle', 'headingFontSize']))
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
			<HeadingFontSizeField
				value={options.headingFontSize}
				onChange={handleHeadingFontSizeChange}
			/>
		</Section>
	)
}

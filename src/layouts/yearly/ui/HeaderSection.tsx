import { yearName } from '../../../core/locale'
import type { CalendarOptions } from '../../common'
import type { YearlyHeader } from '../options'
import { HeaderIcon } from '../../../ui/components/icons'
import { TextField } from '../../../ui/fields/TextField'
import { HeadingFontSizeField } from '../../../ui/sidebar/HeadingFontSizeField'
import { type OptionsSectionProps, Section } from '../../../ui/sidebar/Section'

interface HeaderSectionProps extends OptionsSectionProps<YearlyHeader> {
	/** The calendar the header is printed on: the year it names when the title is empty. */
	calendar: CalendarOptions
}

/** The heading printed above the calendar, and its size. */
export function HeaderSection({ options, defaults, calendar, onUpdate }: HeaderSectionProps) {
	function handleTitleChange(title: string) {
		onUpdate({ title })
	}

	function handleSubtitleChange(subtitle: string) {
		onUpdate({ subtitle })
	}

	function handleFontSizeChange(fontSize: number) {
		onUpdate({ fontSize })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section title="Header" icon={<HeaderIcon />} onReset={handleReset}>
			<TextField
				label="Title"
				value={options.title}
				placeholder={yearName(calendar.locale, calendar.year)}
				onChange={handleTitleChange}
			/>
			<TextField label="Subtitle" value={options.subtitle} onChange={handleSubtitleChange} />
			<HeadingFontSizeField value={options.fontSize} onChange={handleFontSizeChange} />
		</Section>
	)
}

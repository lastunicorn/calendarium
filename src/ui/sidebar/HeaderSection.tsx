import { TextField } from '../fields/TextField'
import { type ConfigSectionProps, Section } from './Section'

/** The heading printed above the calendar. */
export function HeaderSection({ config, onUpdate }: ConfigSectionProps) {
	function handleTitleChange(title: string) {
		onUpdate({ title })
	}

	function handleSubtitleChange(subtitle: string) {
		onUpdate({ subtitle })
	}

	return (
		<Section title="Header">
			<TextField
				label="Title"
				value={config.title}
				placeholder={String(config.year)}
				onChange={handleTitleChange}
			/>
			<TextField label="Subtitle" value={config.subtitle} onChange={handleSubtitleChange} />
		</Section>
	)
}

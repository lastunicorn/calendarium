import {
	isFooterHeight,
	MAX_FOOTER_HEIGHT,
	MIN_FOOTER_HEIGHT,
	type PageFooter,
} from '../../layouts/footer'
import { FooterIcon } from '../components/icons'
import { CheckboxField } from '../fields/CheckboxField'
import { NumberField } from '../fields/NumberField'
import { type OptionsSectionProps, Section } from './Section'

/** Whether a layout's sheets keep an empty footer, and its height. */
export function FooterSection({ options, defaults, onUpdate }: OptionsSectionProps<PageFooter>) {
	function handleShowChange(show: boolean) {
		onUpdate({ show })
	}

	function handleHeightChange(height: number) {
		onUpdate({ height })
	}

	function handleReset() {
		onUpdate(defaults)
	}

	return (
		<Section title="Footer" icon={<FooterIcon />} onReset={handleReset}>
			<CheckboxField
				label="Show footer"
				description={'Displays an empty space at the bottom of the page under the content.'}
				checked={options.show}
				onChange={handleShowChange}
			/>
			{options.show && (
				<NumberField
					label="Footer height (mm)"
					description={`Whole mm, from ${MIN_FOOTER_HEIGHT} to ${MAX_FOOTER_HEIGHT}.`}
					value={options.height}
					min={MIN_FOOTER_HEIGHT}
					max={MAX_FOOTER_HEIGHT}
					step={1}
					isValid={isFooterHeight}
					onChange={handleHeightChange}
				/>
			)}
		</Section>
	)
}

import {
	isFooterHeight,
	MAX_FOOTER_HEIGHT,
	MIN_FOOTER_HEIGHT,
	type PageFooter,
} from '../../layouts/footer'
import { FooterIcon } from '../components/icons'
import { CheckboxField } from '../fields/CheckboxField'
import { NumberField } from '../fields/NumberField'
import { defaultFields } from './defaultFields'
import { type OptionsSectionProps, Section } from './Section'

const FOOTER_HEIGHT_DESCRIPTION = `Whole mm, from ${MIN_FOOTER_HEIGHT} to ${MAX_FOOTER_HEIGHT}.`

interface FooterSectionProps extends OptionsSectionProps<PageFooter> {
	/** What the footer is, under the checkbox. */
	description: string
}

/** Whether a layout's sheets keep an empty footer, and its height. */
export function FooterSection({ options, defaults, description, onUpdate }: FooterSectionProps) {
	function handleShowFooterChange(showFooter: boolean) {
		onUpdate({ showFooter })
	}

	function handleFooterHeightChange(footerHeight: number) {
		onUpdate({ footerHeight })
	}

	function handleReset() {
		onUpdate(defaultFields(defaults, ['showFooter', 'footerHeight']))
	}

	return (
		<Section title="Footer" icon={<FooterIcon />} onReset={handleReset}>
			<CheckboxField
				label="Show footer"
				description={description}
				checked={options.showFooter}
				onChange={handleShowFooterChange}
			/>
			{options.showFooter && (
				<NumberField
					label="Footer height (mm)"
					description={FOOTER_HEIGHT_DESCRIPTION}
					value={options.footerHeight}
					min={MIN_FOOTER_HEIGHT}
					max={MAX_FOOTER_HEIGHT}
					step={1}
					isValid={isFooterHeight}
					onChange={handleFooterHeightChange}
				/>
			)}
		</Section>
	)
}

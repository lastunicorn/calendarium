import {
	isFooterHeight,
	MAX_FOOTER_HEIGHT,
	MIN_FOOTER_HEIGHT,
	type PageFooter,
} from '../../layouts/footer'
import { CheckboxField } from '../fields/CheckboxField'
import { NumberField } from '../fields/NumberField'
import type { OptionsFieldsProps } from './Section'

const FOOTER_HEIGHT_DESCRIPTION = `Whole mm, from ${MIN_FOOTER_HEIGHT} to ${MAX_FOOTER_HEIGHT}.`

interface FooterFieldsProps extends OptionsFieldsProps<PageFooter> {
	/** What the footer is, under the checkbox. */
	description: string
}

/** Whether a layout's sheets keep an empty footer, and its height. */
export function FooterFields({ options, description, onUpdate }: FooterFieldsProps) {
	function handleShowFooterChange(showFooter: boolean) {
		onUpdate({ showFooter })
	}

	function handleFooterHeightChange(footerHeight: number) {
		onUpdate({ footerHeight })
	}

	return (
		<>
			<CheckboxField
				label="Footer"
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
		</>
	)
}

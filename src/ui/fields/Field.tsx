import { type ReactNode, useId } from 'react'
import styles from './Field.module.css'
import { InfoBalloon, InfoButton } from './Info'

/** What a field's control spreads onto itself: its id, which the label points at, and its description. */
export interface FieldControlProps {
	id: string
	'aria-describedby'?: string
}

interface FieldProps {
	label: string
	/** A short note opened in a balloon from an info button next to the label. */
	description?: string
	/** Renders the form control, labelled by `label`, given the props tying it to the label. */
	children: (control: FieldControlProps) => ReactNode
}

/** A label stacked above its control; the shared frame of the text, number and select fields. */
export function Field({ label, description, children }: FieldProps) {
	const controlId = useId()
	const balloonId = useId()

	return (
		<div className={styles.field}>
			{(label !== '' || description !== undefined) && (
				<div className={styles.labelRow}>
					<label className={styles.label} htmlFor={controlId}>
						{label}
					</label>
					{description !== undefined && (
						<InfoButton balloonId={balloonId} label={label} />
					)}
				</div>
			)}
			{children({
				id: controlId,
				'aria-describedby': description === undefined ? undefined : balloonId,
			})}
			{description !== undefined && <InfoBalloon id={balloonId}>{description}</InfoBalloon>}
		</div>
	)
}

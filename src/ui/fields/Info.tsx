import { Balloon } from '../components/Balloon'
import { InfoIcon } from '../components/icons'
import { type Description, descriptionParagraphs } from './description'
import styles from './Info.module.css'

interface InfoButtonProps {
	/** The id of the `InfoBalloon` it opens. */
	balloonId: string
	/** The label of the field the balloon describes. */
	label: string
}

/** The small info button placed after a field's label, opening that field's `InfoBalloon`. */
export function InfoButton({ balloonId, label }: InfoButtonProps) {
	return (
		<button
			type="button"
			className={styles.infoButton}
			popoverTarget={balloonId}
			aria-label={`About ${label}`}
		>
			<InfoIcon />
		</button>
	)
}

interface InfoBalloonProps {
	id: string
	/** What it says, each paragraph in its own `<p>`. */
	children: Description
}

/** The balloon of a field's description, opened by its `InfoButton` (`balloonId={id}`). */
export function InfoBalloon({ id, children }: InfoBalloonProps) {
	return (
		<Balloon id={id}>
			{descriptionParagraphs(children).map((paragraph, index) => (
				<p key={index} className={styles.paragraph}>
					{paragraph}
				</p>
			))}
		</Balloon>
	)
}

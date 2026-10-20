/** A field's note, shown in its `InfoBalloon`: one paragraph, or several, one string each. */
export type Description = string | readonly string[]

/** A description's paragraphs, in order. */
export function descriptionParagraphs(description: Description): readonly string[] {
	return typeof description === 'string' ? [description] : description
}

const ISO_WEEK = 'ISO 8601 numbering: week 1 is the one holding the year’s first Thursday.'

/** The info balloon of a day's week number. */
export const DAY_WEEK_NUMBER_DESCRIPTION = ISO_WEEK

/** The info balloon of a week's number, for a row of seven days that may not start on Monday. */
export const WEEK_NUMBER_DESCRIPTION = [
	ISO_WEEK,
	'A week starting on another day takes the number of the ISO week holding its Thursday.',
]

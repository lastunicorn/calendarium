import { expect, test, type Page } from '@playwright/test'

import { openProjectFile } from './helpers.ts'

// Which printed pages a change alters: `scripts/visual-diff.sh` (`npm run test:visual`) runs these
// once on the base commit's build, taking the screenshots, then on the working tree's, comparing.
// The other tests check what the pages hold and their size; these catch a change to a shared part
// (`Page`, `CalendarHeader`, `MiniMonth`, the colors in `index.css`) altering another layout's look
// unnoticed. The pages are captured in print media, as `clippedPages` lays them out. Both builds
// are drawn on the same machine, with the same fonts, so nothing is kept between runs.
test.skip(
	process.env.VISUAL_BASELINES === undefined,
	'compares two builds of the app: run `npm run test:visual`',
)
test.use({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 })

/** A leap year starting on a Monday, as in `print.spec.ts`. */
const CALENDAR = { year: 2024, locale: 'en-GB', weekStart: 'auto' }

/** Events on the first pages, so each layout draws its event marks and names. */
const EVENTS = [
	'2024-01-01 New Year',
	'0000-01-06 Epiphany',
	'2024-01-17 Dentist',
	'2024-02-14 Valentine',
]

interface VisualCase {
	name: string
	layout: string
	options: object
	/**
	 * Which pages to capture, by their index in reading order, one image showing them as they
	 * stack in print; `firstSide` for a booklet's first sheet side. The first page by default.
	 */
	pages?: number[] | 'firstSide'
}

const CASES: VisualCase[] = [
	{ name: 'yearly-default', layout: 'yearly', options: { calendar: CALENDAR } },
	{
		name: 'yearly-large-months',
		layout: 'yearly',
		options: {
			calendar: CALENDAR,
			events: EVENTS,
			header: { title: 'Family calendar', subtitle: 'Twenty twenty-four' },
			content: { monthSize: 'large', highlightWeekends: 'columns', showWeekNumbers: true },
		},
	},
	{
		name: 'yearly-event-list',
		layout: 'yearly',
		options: { calendar: CALENDAR, events: EVENTS },
		pages: [1],
	},
	{ name: 'monthly-default', layout: 'monthly', options: { calendar: CALENDAR } },
	{
		name: 'monthly-full-weekdays-columns',
		layout: 'monthly',
		options: {
			calendar: CALENDAR,
			events: EVENTS,
			header: { alignment: 'left' },
			miniMonth: { showPreviousMonth: true, showNextMonth: true },
			content: {
				weekdayFormat: 'full',
				highlightWeekends: 'columns',
				showWeekNumbers: true,
				dayNumber: { horizontalAlignment: 'center', verticalAlignment: 'center' },
			},
		},
	},
	{
		name: 'monthly-booklet',
		layout: 'monthly',
		options: { calendar: CALENDAR, page: { booklet: true } },
		pages: 'firstSide',
	},
	{
		name: 'monthly-ru-RU',
		layout: 'monthly',
		options: { calendar: { ...CALENDAR, locale: 'ru-RU' } },
	},
	{ name: 'weekly-default', layout: 'weekly', options: { calendar: CALENDAR } },
	{
		name: 'weekly-two-pages',
		layout: 'weekly',
		options: {
			calendar: CALENDAR,
			events: EVENTS,
			miniMonth: { showCurrentMonth: true, showNextMonth: true },
			content: { twoPages: true, fill: 'hours' },
		},
		pages: [0, 1],
	},
	{
		name: 'weekly-rows',
		layout: 'weekly',
		options: {
			calendar: CALENDAR,
			header: { showWeek: true },
			content: { dayDirection: 'horizontal', weekendDisplay: 'reduced' },
			footer: { show: true },
		},
	},
	{ name: 'daily-default', layout: 'daily', options: { calendar: CALENDAR, events: EVENTS } },
	{
		name: 'daily-ruled',
		layout: 'daily',
		options: { calendar: CALENDAR, content: { fill: 'ruled' }, footer: { show: true } },
	},
	{
		name: 'daily-squares',
		layout: 'daily',
		options: { calendar: CALENDAR, content: { fill: 'squares' } },
	},
	{
		name: 'daily-dots',
		layout: 'daily',
		options: { calendar: CALENDAR, content: { fill: 'dots', fillAlignment: 'left' } },
	},
	{
		name: 'daily-genko-yoshi-vertical',
		layout: 'daily',
		options: {
			calendar: CALENDAR,
			content: {
				fill: 'genkoYoshi',
				genkoYoshi: { direction: 'vertical', furigana: 'right', guides: true },
			},
		},
	},
	{
		name: 'daily-genko-yoshi-horizontal',
		layout: 'daily',
		options: {
			calendar: CALENDAR,
			content: {
				fill: 'genkoYoshi',
				genkoYoshi: { direction: 'horizontal', furigana: 'top' },
			},
		},
	},
	{
		name: 'daily-mirrored-margins',
		layout: 'daily',
		options: {
			calendar: CALENDAR,
			header: { heading: 'date', highlightWeekendDays: true },
			content: { fill: 'ruled' },
			page: {
				margins: { top: 10, right: 8, bottom: 10, left: 25 },
				equalMargins: false,
				mirrorMargins: true,
			},
		},
		// The even page, its margins swapped, and the next one: the first Saturday and Sunday.
		pages: [5, 6],
	},
	{
		name: 'daily-ja-JP',
		layout: 'daily',
		options: { calendar: { ...CALENDAR, locale: 'ja-JP' } },
	},
]

/** The area of the document covering the pages `pages` stands for, as they lie in print media. */
async function pagesClip(page: Page, pages: number[] | 'firstSide') {
	return page.locator('main section').evaluateAll((sections, chosen) => {
		const boxes = sections.map((section) => section.getBoundingClientRect())
		// A booklet's second side starts at the page marked `data-side-start` placed highest.
		const secondSide = Math.min(
			...sections
				.filter((section) => section.hasAttribute('data-side-start'))
				.map((section) => section.getBoundingClientRect().top),
		)
		const picked =
			chosen === 'firstSide'
				? boxes.filter((box) => box.top < secondSide)
				: chosen.map((index) => boxes[index])
		const left = Math.min(...picked.map((box) => box.left))
		const right = Math.max(...picked.map((box) => box.right))
		const pickedTop = Math.min(...picked.map((box) => box.top))
		const bottom = Math.max(...picked.map((box) => box.bottom))
		return {
			x: left + window.scrollX,
			y: pickedTop + window.scrollY,
			width: right - left,
			height: bottom - pickedTop,
		}
	}, pages)
}

for (const { name, layout, options, pages = [0] } of CASES) {
	test(`${name} looks as in its baseline`, async ({ page }) => {
		await openProjectFile(page, layout, options)
		await page.emulateMedia({ media: 'print' })
		await page.evaluate(() => document.fonts.ready)

		await expect(page).toHaveScreenshot(`${name}.png`, {
			clip: await pagesClip(page, pages),
			fullPage: true,
		})
	})
}

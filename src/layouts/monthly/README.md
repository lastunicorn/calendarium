# Monthly layout (`monthly`)

One sheet per month, 12 in all: a heading between the previous and the next month drawn small, above a grid of large writing cells. Landscape by default, with room for full weekday names.

## Pages

`planMonthPages` (`pages.ts`) plans 12 pages. Each has:

- the heading: the month and year, or the header's `title` with the month and year below it, set per its `alignment` (`HEADING_ALIGNS` in `layouts/heading.ts`: left, center or right, no `auto`, as nothing is ever beside it), in its `fontSize` pt;
- the adjacent months, as `MiniMonth`s: the previous month top left (`previousMonth`) and the next top right (`nextMonth`), per `miniMonth.showPreviousMonth` / `showNextMonth`, each named with its month, and its year per `miniMonth.showYear`, at `miniMonth.size`;
- a `MonthGrid` (`ui/MonthGrid`, its props a `MonthGridPlan`) of large writing cells showing only the month's 4–6 rows (`visibleWeeks`). The adjacent months' days are gray, or left blank per the content's `showAdjacentMonthDays`; the grid's lines are drawn per `showGridLines`; its weekday names are `weekdayFontSize` pt, each day's number `dayNumber.fontSize` pt, the number and the day's events set in its cell per `dayNumber.horizontalAlignment` and `dayNumber.verticalAlignment`.

## Options

`MonthlyOptions` (`options.ts`): `CommonOptions` (`calendar`, `events`, `page`) and three groups of its own, one per sidebar section, each reset whole:

| Sidebar section | Group                         | Fields                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header          | `header: MonthlyHeader`       | `title`, `alignment`, `fontSize` (`isHeadingFontSize`, the shared `HeadingFontSizeField`) (`ui/HeaderSection`)                                                                                                                                                                                                                                                                              |
| Mini calendar   | `miniMonth: MonthlyMiniMonth` | `showPreviousMonth`, `showNextMonth`, then the mini month's look (`MiniMonthStyle`: `showYear`, `size` and the month grid options) (`ui/MiniMonthsSection`, through the shared `MiniMonthFields`)                                                                                                                                                                                           |
| Content         | `content: MonthlyContent`     | the month grid options (`MonthGridOptions`): `weekdayFormat` (full names allowed here only, its validator allowing `full`), `highlightWeekends`, `showWeekNumbers`; then `showAdjacentMonthDays`, `showGridLines`, `weekdayFontSize` and `dayNumber` (`DayNumber`: `fontSize`, `horizontalAlignment`, `verticalAlignment`) (`ui/MonthContentSection`, through the shared `MonthGridFields`) |

The mini months keep to abbreviated weekday names, as every small month grid does. It has no cross-field rules of its own (`normalize: normalizeCommon`).

## Migrations

`MONTHLY_MIGRATIONS` (`migrations.ts`), one step:

- 5 to 6: the fields every layout has were grouped (`commonGroups`); `title`, `monthHeadingAlignment` (now `alignment`) and `headingFontSize` (now `fontSize`) went under `header`, `adjacentMonths` became `miniMonth`, its fields keeping their names, and the month grid options with `showAdjacentMonthDays`, `showGridLines`, `weekdayFontSize` and the day number's fields (`dayNumberFontSize`, `dayNumberHorizontalAlignment`, `dayNumberVerticalAlignment`, now `dayNumber`'s `fontSize`, `horizontalAlignment` and `verticalAlignment`) under `content`.

## Files

| File                                                                             | What it holds                                                                                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`                                                                       | The entry point: `MONTHLY = defineLayout(…)`                                                                                                      |
| `options.ts`                                                                     | `MonthlyOptions`, its groups `MonthlyHeader`, `MonthlyMiniMonth`, `MonthlyContent` and `DayNumber`, its value sets and bounds, and `MONTHLY_SPEC` |
| `migrations.ts`                                                                  | `MONTHLY_MIGRATIONS`, the step from 5                                                                                                             |
| `pages.ts`                                                                       | `planMonthPages`, `MonthGridPlan`                                                                                                                 |
| `ui/index.ts`                                                                    | The UI's entry point: `MONTHLY_VIEW`                                                                                                              |
| `ui/MonthlyLayout.tsx`                                                           | Draws the plan                                                                                                                                    |
| `ui/MonthGrid.tsx`                                                               | The large month grid                                                                                                                              |
| `ui/MonthlyForm.tsx`                                                             | The options form, combining the sections                                                                                                          |
| `ui/HeaderSection.tsx`, `ui/MiniMonthsSection.tsx`, `ui/MonthContentSection.tsx` | The layout's own sections                                                                                                                         |

## Domain language

| Term            | Meaning                                                                                     | In code                                                        | Sidebar label              |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------- |
| Adjacent months | The month layout's mini months: the previous month top left, the next top right             | `miniMonth` (`MonthlyMiniMonth`), `previousMonth`, `nextMonth` | Mini calendar              |
| Day number      | A grid day's number: its size and where it sits in its cell, its events' names following it | `DayNumber`, `content.dayNumber`                               | Day number size, alignment |

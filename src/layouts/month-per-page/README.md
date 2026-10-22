# Month per page (`month-per-page`)

One sheet per month, 12 in all: a heading between the previous and the next month drawn small, above a grid of large writing cells. Landscape by default, with room for full weekday names.

## Pages

`planMonthPages` (`pages.ts`) plans 12 pages. Each has:

- the heading: the month and year, or the `title` with the month and year below it, set per `monthHeadingAlignment` (`HEADING_ALIGNS` in `layouts/heading.ts`: left, center or right, no `auto`, as nothing is ever beside it);
- the adjacent months, as `MiniMonth`s: the previous month top left (`previousMonth`) and the next top right (`nextMonth`), per `adjacentMonths.showPreviousMonth` / `showNextMonth`, each named with its month, and its year per `adjacentMonths.showYear`;
- a `MonthGrid` (`ui/MonthGrid`, its props a `MonthGridPlan`) of large writing cells showing only the month's 4–6 rows (`visibleWeeks`). The adjacent months' days are gray, or left blank per `showAdjacentMonthDays`; the grid's lines are drawn per `showGridLines`; its weekday names are `weekdayFontSize` pt, each day's number `dayNumberFontSize` pt, the number and the day's events set in its cell per `dayNumberHorizontalAlignment` and `dayNumberVerticalAlignment`.

## Options

`MonthPerPageOptions` (`options.ts`): `CommonOptions`, the month grid options (`MonthGridOptions`) for its grid, and its own:

| Sidebar section | Fields                                                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Header          | `title`, `monthHeadingAlignment` (`ui/HeaderSection`)                                                                                                                                                                                                                                            |
| Mini calendar   | `adjacentMonths` (`AdjacentMonthsOptions`: the month grid options plus `showPreviousMonth`, `showNextMonth`, `showYear`) (`ui/AdjacentMonthsSection`)                                                                                                                                            |
| Content         | `weekdayFormat` (full names allowed here only, its validator allowing `full`), `highlightWeekends`, `showWeekNumbers`, `showAdjacentMonthDays`, `showGridLines`, `weekdayFontSize`, `dayNumberFontSize`, `dayNumberHorizontalAlignment`, `dayNumberVerticalAlignment` (`ui/MonthContentSection`) |

The adjacent months keep to abbreviated weekday names, as every small month grid does. It has no cross-field rules of its own (`normalize: normalizeCommon`) and no migration steps.

## Files

| File                                                                                 | What it holds                                                               |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `index.ts`                                                                           | The entry point: `MONTH_PER_PAGE = defineLayout(…)`                         |
| `options.ts`                                                                         | `MonthPerPageOptions`, its value sets and bounds, and `MONTH_PER_PAGE_SPEC` |
| `pages.ts`                                                                           | `planMonthPages`, `MonthGridPlan`                                           |
| `ui/index.ts`                                                                        | The UI's entry point: `MONTH_PER_PAGE_VIEW`                                 |
| `ui/MonthPerPageLayout.tsx`                                                          | Draws the plan                                                              |
| `ui/MonthGrid.tsx`                                                                   | The large month grid                                                        |
| `ui/MonthPerPageForm.tsx`                                                            | The options form, combining the sections                                    |
| `ui/HeaderSection.tsx`, `ui/AdjacentMonthsSection.tsx`, `ui/MonthContentSection.tsx` | The layout's own sections                                                   |

## Domain language

| Term            | Meaning                                                                         | In code                                        | Sidebar label |
| --------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- | ------------- |
| Adjacent months | The month layout's mini months: the previous month top left, the next top right | `adjacentMonths`, `previousMonth`, `nextMonth` | Mini calendar |

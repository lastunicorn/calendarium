# Year per page (`year-per-page`)

The whole year on one sheet: the title, or else the year, above the 12 months as `MiniMonth`s, then, when the year has events, a second sheet listing them. Portrait by default, with one-letter weekday names so the small months stay narrow.

## Pages

`planYearPage` (`pages.ts`) plans one `YearPage`:

- the heading: the `title`, or the year (`yearName`) when the title is empty; the `subtitle` below it, hidden when empty;
- the 12 months, each a `MiniMonthPlan` spread into `MiniMonth`. Every month has 6 rows, so they line up, and the days with an event are circled (`eventDays`);
- when the year has events (`eventsOfYear`), an `eventList` page: headed by `YEAR_PAGE_MESSAGES[locale].events` above the year page's heading, listing each event with its `dayMonthName`, drawn by `ui/EventList`.

## Options

`YearPerPageConfig` (`options.ts`): `CommonConfig`, the month grid options (`MonthGridOptions`) for its 12 months, and its own:

| Sidebar section | Fields                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Header          | `title`, `subtitle` (`ui/HeaderSection`)                                                                                                                                 |
| Content         | `weekdayFormat` (abbreviated only, `MONTH_GRID_WEEKDAY_FORMATS`), `highlightWeekends`, `showWeekNumbers` (`ui/YearContentSection`, through the shared `MonthGridFields`) |

It has no cross-field rules of its own (`normalize: normalizeCommon`) and no migration steps.

## Printed text

`messages.ts`: `YEAR_PAGE_MESSAGES`, the event list's heading in each locale.

## Files

| File                                                | What it holds                                      |
| --------------------------------------------------- | -------------------------------------------------- |
| `index.ts`                                          | The entry point: `YEAR_PER_PAGE = defineLayout(…)` |
| `options.ts`                                        | `YearPerPageConfig` and `YEAR_PER_PAGE_SPEC`       |
| `pages.ts`                                          | `planYearPage`, `YearPage`, `EventListPage`        |
| `messages.ts`                                       | `YEAR_PAGE_MESSAGES`                               |
| `ui/index.ts`                                       | The UI's entry point: `YEAR_PER_PAGE_VIEW`         |
| `ui/YearPerPageLayout.tsx`                          | Draws the plan: the year page and the event list   |
| `ui/EventList.tsx`                                  | The event list's page                              |
| `ui/YearPerPageForm.tsx`                            | The options form, combining the sections           |
| `ui/HeaderSection.tsx`, `ui/YearContentSection.tsx` | The layout's own sections                          |

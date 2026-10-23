# Week per page (`week-per-page`)

One sheet per week of the year, or two, each day getting a writing cell, maybe an hourly schedule. Landscape by default, with three-letter weekday names, the weekend sharing a cell to leave the weekdays room for a schedule.

## Pages

`planWeekPages` (`pages.ts`) plans a `WeekPages` for each week from `weeksOfYear`, 53 or 54 (a week reaches into the previous or next year):

- **Heading:** the `dateRangeName` of its days, set per `headingAlignment` (`headingAlign`: `auto` is left beside the mini month or over two pages, centered otherwise; `HEADING_ALIGNMENTS` in `layouts/heading.ts`), in `headingFontSize` pt, with the week's ISO number below it per `showHeaderWeek` (`WEEK_PAGE_MESSAGES`).
- **Cells:** per `weekendDisplay` (`weekCells`, `cells.ts`): Saturday and Sunday get a cell each, share one, or are left out, and a week whose only days of the year are a hidden weekend gets no page. They are side by side or stacked per `weekDayDirection`.
- **Days:** each is a `WeekPageDay` with its weekday label (`weekdayFormat`), its month's name where the month changes and on each sheet's first day, its weekend highlight (`highlightWeekendDays`, never for a day of another year, `WeekDay.inYear`, drawn in gray) and whether it holds the hourly schedule (`weekPageLines` is `hours`, not in a cell two days share, nor for a day of another year).
- **Two pages per week:** with `twoPagesPerWeek`, `splitWeekCells` puts the first three days on a first sheet whose header row shows the heading, and the rest on a second showing the mini month, each keeping the other part's space hidden.
- **Mini month:** with `miniMonth.show`, a `MiniMonth` of the `weekMonth` beside the heading fills the week's row in black (`markedWeek`), at `miniMonth.size`.
- **Start page:** with `startPage` set to `even`, a blank page comes first (`blankFirstPage`).
- **Footer:** with `showFooter`, each sheet keeps an empty bordered footer, `footerHeight` whole mm tall (`isFooterHeight`), under its cells. The footer options (`PageFooter`) are shared with the day layout through `layouts/footer.ts` and `ui/sidebar/FooterFields`.

`WeekPage` is memoized, so the plan builds its shared label arrays (weekday names, hour labels) once.

## Options

`WeekPerPageOptions` (`options.ts`): `CommonOptions`, the schedule (`HourSchedule`, shared with the day layout through `layouts/schedule.ts`), and its own:

| Sidebar section | Fields                                                                                                                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header          | `headingAlignment`, `headingFontSize` (`isHeadingFontSize`, the shared `HeadingFontSizeField`), `showHeaderWeek` (`ui/HeaderSection`)                                                                                                                             |
| Mini calendar   | `miniMonth` (`MiniMonthOptions`, the shared `MiniMonthSection`)                                                                                                                                                                                                   |
| Content         | `twoPagesPerWeek`, `startPage`, `weekDayDirection`, `weekdayFormat` (full names allowed), `highlightWeekendDays`, `weekendDisplay`, `weekPageLines`, the schedule (`hourFormat`, `firstHour`, `lastHour`), `showFooter`, `footerHeight` (`ui/WeekContentSection`) |

`normalize` puts a reversed schedule in order (`orderHours`).

## Migrations

`migrations.ts`, from 3 to 4: the month grid options went; `highlightWeekends` became `highlightWeekendDays`, on or off, and `showWeekNumbers` (the heading's "Week N") `showHeaderWeek`; the new `miniMonth` starts from its defaults. From 4 to 5: `weekDayDirection` lost `auto`, which became what it drew: `horizontal` on portrait paper with one page per week, `vertical` otherwise.

## Printed text

`messages.ts`: `WEEK_PAGE_MESSAGES`, the week's number ("Week 42") in each locale. The day layout has its own copy, so the two stay independent.

## Files

| File                                                | What it holds                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| `index.ts`                                          | The entry point: `WEEK_PER_PAGE = defineLayout(…)`                        |
| `options.ts`                                        | `WeekPerPageOptions`, its value sets and bounds, and `WEEK_PER_PAGE_SPEC` |
| `cells.ts`                                          | The cell rules: `weekCells`, `splitWeekCells`                             |
| `pages.ts`                                          | `planWeekPages`, `WeekPages`, `WeekPageDay`                               |
| `messages.ts`, `migrations.ts`                      | `WEEK_PAGE_MESSAGES`, `WEEK_PER_PAGE_MIGRATIONS`                          |
| `ui/index.ts`                                       | The UI's entry point: `WEEK_PER_PAGE_VIEW`                                |
| `ui/WeekPerPageLayout.tsx`, `ui/WeekPage.tsx`       | Draw the plan: the pages, then each sheet                                 |
| `ui/WeekPerPageForm.tsx`                            | The options form, combining the sections                                  |
| `ui/HeaderSection.tsx`, `ui/WeekContentSection.tsx` | The layout's own sections                                                 |

## Domain language

| Term               | Meaning                                                                        | In code                  | Sidebar label      |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------ | ------------------ |
| Cell               | A week page's writing area for one day, or for Saturday and Sunday sharing one | `WeekCell` (`weekCells`) | —                  |
| Weekend display    | Saturday and Sunday get a cell each, share one, or are left out                | `WeekendDisplay`         | Weekend            |
| Direction          | Days as columns side by side (`vertical`) or as stacked rows (`horizontal`)    | `WeekDayDirection`       | Days               |
| Two pages per week | A week spread over two sheets                                                  | `twoPagesPerWeek`        | Two pages per week |

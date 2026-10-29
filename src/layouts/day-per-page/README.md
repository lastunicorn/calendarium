# Day per page (`day-per-page`)

One sheet per day of the year, or two: a header naming the day, with a corner mini month, above a fill to write on, an hourly schedule, ruled lines, squares, dots or nothing. Portrait by default.

## Pages

`planDayPages` (`pages.ts`) plans a `DayPages` for each day from `daysOfYear`:

- **Heading:** the weekday or the date per `dayPageTitle`, in `headingFontSize` pt and in the weekend color on Saturdays and Sundays per `highlightWeekendDays`; the other one below it, followed on its line by the details line ("Week N · Day N / 365", dot-separated, each part per `showHeaderWeek` and `showHeaderDayOfYear`, from `DAY_PAGE_MESSAGES`).
- **Mini month:** per `miniMonth.show`, a corner `MiniMonth` of the day's month marking the day (`markedDay`), at `miniMonth.size`.
- **Fills:** the `fills` of its one or two sheets, the same for every day, per `dayPageLines`:
  - `hours`: an hourly schedule from `firstHour` to `lastHour`, labeled by `hourNames` in `hourFormat`. With `twoPagesPerDay` it is split in half over two sheets, the second, without a header, taking an odd count's extra hour;
  - `ruled`: ruled lines `ruledLineSpacing` mm apart;
  - `squares`: as many whole squares `squareSize` mm a side as fit (the grid is cut down in CSS, the header's height being known only once drawn), set across the page per `squareGridAlignment`, filling the `contentBox`;
  - `dots`: the dots at those squares' corners, one SVG pattern a sheet;
  - `blank`: nothing.
- **Footer:** with `showFooter`, each sheet, the second one too, keeps an empty bordered footer, `footerHeight` whole mm tall (`isFooterHeight`), at its bottom under the fill (`footerHeight`, the same for every day).

With `twoPagesPerDay`, the view's `facingPages` has the preview show the pages as facing spreads, as the bound calendar opens.

`DayPage` is memoized, so the plan builds its shared label arrays (weekday names, hour labels) once.

## Options

`DayPerPageOptions` (`options.ts`): `CommonOptions`, the schedule (`HourSchedule`, shared with the week layout through `layouts/schedule.ts`), the footer (`PageFooter`, shared with the week layout through `layouts/footer.ts` and `ui/sidebar/FooterSection`), and its own:

| Sidebar section | Fields                                                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header          | `dayPageTitle`, `headingFontSize` (`isHeadingFontSize`, the shared `HeadingFontSizeField`), `showHeaderWeek`, `showHeaderDayOfYear`, `highlightWeekendDays` (`ui/HeaderSection`) |
| Mini calendar   | `miniMonth` (`MiniMonthOptions`, the shared `MiniMonthSection`)                                                                                                                  |
| Content         | `twoPagesPerDay`, `dayPageLines`, the schedule (`hourFormat`, `firstHour`, `lastHour`), `ruledLineSpacing`, `squareSize`, `squareGridAlignment` (`ui/DayContentSection`)         |
| Footer          | `showFooter`, `footerHeight` (the shared `FooterSection`)                                                                                                                        |

It has no title: the heading is always the weekday or the date. `normalize` puts a reversed schedule in order (`orderHours`).

## Migrations

`migrations.ts`, from 3 to 4: the month grid options and `showMiniMonth` moved under `miniMonth` (`show`), and `highlightWeekends`, for the heading, became `highlightWeekendDays`, on or off.

## Printed text

`messages.ts`: `DAY_PAGE_MESSAGES`, the details line's week ("Week 42") and day of the year ("Day 292 / 365") in each locale. The week layout has its own copy of the week, so the two stay independent.

## Files

| File                                               | What it holds                                                           |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| `index.ts`                                         | The entry point: `DAY_PER_PAGE = defineLayout(…)`                       |
| `options.ts`                                       | `DayPerPageOptions`, its value sets and bounds, and `DAY_PER_PAGE_SPEC` |
| `pages.ts`                                         | `planDayPages`, `DayPages`, the fills                                   |
| `messages.ts`, `migrations.ts`                     | `DAY_PAGE_MESSAGES`, `DAY_PER_PAGE_MIGRATIONS`                          |
| `ui/index.ts`                                      | The UI's entry point: `DAY_PER_PAGE_VIEW`, with its `facingPages`       |
| `ui/DayPerPageLayout.tsx`, `ui/DayPage.tsx`        | Draw the plan: the pages, then each sheet                               |
| `ui/DayPerPageForm.tsx`                            | The options form, combining the sections                                |
| `ui/HeaderSection.tsx`, `ui/DayContentSection.tsx` | The layout's own sections                                               |

## Domain language

| Term              | Meaning                                                             | In code                                      | Sidebar label     |
| ----------------- | ------------------------------------------------------------------- | -------------------------------------------- | ----------------- |
| Details line      | "Week N · Day N / 365" after a day page's subheading, dot-separated | `showHeaderWeek`, `showHeaderDayOfYear`      | Show … (Header)   |
| Ruled lines       | Plain writing lines, `ruledLineSpacing` mm apart                    | `dayPageLines` = `ruled`, `ruledLineSpacing` | Fill: Ruled lines |
| Squares           | A grid of squares, like a math notebook's, `squareSize` mm a side   | `dayPageLines` = `squares`, `squareSize`     | Fill: Squares     |
| Dots              | The corners of the squares alone, `squareSize` mm apart             | `dayPageLines` = `dots`, `squareSize`        | Fill: Dots        |
| Two pages per day | A day spread over two sheets                                        | `twoPagesPerDay`                             | Two pages per day |

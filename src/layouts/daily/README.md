# Daily layout (`daily`)

One sheet per day of the year, or two: a header naming the day, with a corner mini month, above a fill to write on, an hourly schedule, ruled lines, squares, dots, genkō yōshi or nothing. Portrait by default.

## Pages

`planDayPages` (`pages.ts`) plans a `DayPages` for each day from `daysOfYear`:

- **Heading:** the weekday or the date per the header's `heading`, in its `fontSize` pt and in the weekend color on Saturdays and Sundays per its `highlightWeekendDays`; the other one below it, followed on its line by the details line ("Week N · Day N / 365", dot-separated, each part per the header's `showWeek` and `showDayOfYear`, from `DAY_PAGE_MESSAGES`).
- **Mini month:** per `miniMonth.show`, a corner `MiniMonth` of the day's month marking the day (`markedDay`) and, with `miniMonth.showEvents`, circling the days with an event (`eventDays`, by `monthEventDays`), as the year layout's months do, at `miniMonth.size`.
- **Fills:** the `fills` of its one or two sheets, the same for every day, per the content's `fill`:
  - `hours`: an hourly schedule from the content's `schedule.firstHour` to `lastHour`, labeled by `hourNames` in its `hourFormat`. With `twoPages` it is split in half over two sheets, the second, without a header, taking an odd count's extra hour;
  - `ruled`: ruled lines `ruledLineSpacing` mm apart;
  - `squares`: as many whole squares `squareSize` mm a side as fit (the grid is cut down in CSS, the header's height being known only once drawn), set across the page per `fillAlignment`, filling the `contentBox`;
  - `dots`: the dots at those squares' corners, `DOT_SIZE` (0.5 mm) across, cut down in CSS as the squares are, one SVG path a sheet of a round-capped segment of no length per dot (as Chrome prints a pattern as a blurry image);
  - `genkoYoshi`: columns of genkō yōshi squares, or rows of them per `genkoYoshi.direction`, `genkoYoshi.squareSize` mm a side (`isGenkoYoshiSquareSize`, 10 to 20), a blank `GENKO_YOSHI_COLUMN_GAP_PERCENT` (40 %) of that side between the columns (or rows), as many whole squares as fit, cut down in CSS as the squares are, set across the page per `fillAlignment`, each square with a bordered furigana strip a third of its side (`GENKO_YOSHI_FURIGANA_DIVISOR`) above it or right of it per `genkoYoshi.furigana`, drawn by `ui/GenkoYoshi` in darker lines (the lines across the columns, or rows, cut to them by a `clip-path`), with dotted guides halving each square, not its strip, across and down per `genkoYoshi.guides` (one SVG path a sheet, as Chrome prints a pattern as a blurry image);
  - `blank`: nothing.
- **Footer:** with `footer.show`, each sheet, the second one too, keeps an empty bordered footer, `footer.height` whole mm tall (`isFooterHeight`), at its bottom under the fill (`footerHeight`, the same for every day).

With the content's `twoPages`, the view's `facingPages` has the preview show the pages as facing spreads, as the bound calendar opens.

`DayPage` is memoized, so the plan builds its shared label arrays (weekday names, hour labels) once.

## Options

`DailyOptions` (`options.ts`): `CommonOptions` (`calendar`, `events`, `page`), the mini month (`miniMonth`, the shared `MiniMonthOptions`), the footer (`footer`, a `PageFooter`, shared with the week layout through `layouts/footer.ts` and `ui/sidebar/FooterSection`), and two groups of its own, one per sidebar section, each reset whole:

| Sidebar section | Group                         | Fields                                                                                                                                                                                                                                                                                                              |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header          | `header: DailyHeader`         | `heading` (`DAY_PAGE_HEADINGS`), `fontSize` (`isHeadingFontSize`, the shared `HeadingFontSizeField`), `showWeek`, `showDayOfYear`, `highlightWeekendDays`, which colors the heading (`ui/HeaderSection`)                                                                                                            |
| Mini calendar   | `miniMonth: MiniMonthOptions` | `show`, `showEvents` (labeled "Show events"), then the mini month's look (`MiniMonthStyle`) (the shared `MiniMonthSection`)                                                                                                                                                                                         |
| Content         | `content: DailyContent`       | `twoPages`, `fill` (`DAY_PAGE_FILLS`), `ruledLineSpacing`, `squareSize`, `fillAlignment`, `genkoYoshi` (`GenkoYoshiOptions`: `squareSize`, `direction`, `furigana`, `guides`), `schedule` (`HourSchedule`, shared with the week layout through `layouts/schedule.ts` and `ScheduleFields`) (`ui/DayContentSection`) |
| Footer          | `footer: PageFooter`          | `show`, `height` (the shared `FooterSection`)                                                                                                                                                                                                                                                                       |

It has no title: the heading is always the weekday or the date. `normalize` puts a reversed `content.schedule` in order (`orderContentHours`).

## Migrations

`DAILY_MIGRATIONS` (`migrations.ts`):

- 3 to 4: the month grid options and `showMiniMonth` moved under `miniMonth` (`show`), and `highlightWeekends`, for the heading, became `highlightWeekendDays`, on or off.
- 5 to 6: the fields every layout has were grouped (`commonGroups`), and the footer's (`footerGroup`); `dayPageTitle` (now `heading`), `headingFontSize` (now `fontSize`), `showHeaderWeek` (now `showWeek`), `showHeaderDayOfYear` (now `showDayOfYear`) and `highlightWeekendDays` went under `header`; `twoPagesPerDay` (now `twoPages`), `dayPageLines` (now `fill`), `ruledLineSpacing`, `squareSize`, `squareGridAlignment` (now `fillAlignment`, aligning the genkō yōshi too) and the schedule's fields (`scheduleGroup`, under `schedule`) under `content`. It also reads the 6 development builds' `dayPageFill` and `fillAlignment`. The genkō yōshi options are new in 6, so no step maps them.

## Printed text

`messages.ts`: `DAY_PAGE_MESSAGES`, the details line's week ("Week 42") and day of the year ("Day 292 / 365") in each locale. The week layout has its own copy of the week, so the two stay independent.

## Files

| File                                               | What it holds                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`                                         | The entry point: `DAILY = defineLayout(…)`                                                                                    |
| `options.ts`                                       | `DailyOptions`, its groups `DailyHeader`, `DailyContent` and `GenkoYoshiOptions`, its value sets and bounds, and `DAILY_SPEC` |
| `pages.ts`                                         | `planDayPages`, `DayPages`, the fills                                                                                         |
| `messages.ts`, `migrations.ts`                     | `DAY_PAGE_MESSAGES`, `DAILY_MIGRATIONS`                                                                                       |
| `ui/index.ts`                                      | The UI's entry point: `DAILY_VIEW`, with its `facingPages`                                                                    |
| `ui/DailyLayout.tsx`, `ui/DayPage.tsx`             | Draw the plan: the pages, then each sheet                                                                                     |
| `ui/DailyForm.tsx`                                 | The options form, combining the sections                                                                                      |
| `ui/GenkoYoshi.tsx`                                | Draws the genkō yōshi fill                                                                                                    |
| `ui/HeaderSection.tsx`, `ui/DayContentSection.tsx` | The layout's own sections                                                                                                     |

## Domain language

| Term              | Meaning                                                             | In code                                      | Sidebar label     |
| ----------------- | ------------------------------------------------------------------- | -------------------------------------------- | ----------------- |
| Details line      | "Week N · Day N / 365" after a day page's subheading, dot-separated | `header.showWeek`, `header.showDayOfYear`    | Show … (Header)   |
| Ruled lines       | Plain writing lines, `ruledLineSpacing` mm apart                    | `content.fill` = `ruled`, `ruledLineSpacing` | Fill: Ruled lines |
| Squares           | A grid of squares, like a math notebook's, `squareSize` mm a side   | `content.fill` = `squares`, `squareSize`     | Fill: Squares     |
| Dots              | The corners of the squares alone, `squareSize` mm apart             | `content.fill` = `dots`, `squareSize`        | Fill: Dots        |
| Genkō yōshi       | Japanese manuscript paper: columns of squares, one per character    | `content.fill` = `genkoYoshi`, `GenkoYoshi`  | Fill: Genkō yōshi |
| Two pages per day | A day spread over two sheets                                        | `content.twoPages`                           | Two pages per day |

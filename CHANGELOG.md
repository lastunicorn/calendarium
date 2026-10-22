# Changelog

The features each release brought, newest first. Versions follow the app version in `package.json`: a major release changes the settings format, and settings and files from an older major are migrated when read.

## Unreleased

### Added

- Every layout: a Use equal margins option in the Page section, on by default, gives every side the top margin, the other margins becoming read-only. It is off and unavailable with mirror margins. Saved settings and files whose margins differ keep them, with the option off.
- Day layout: a Dots fill dots the page in a square grid, like the Squares fill with only the corners drawn, its spacing and alignment set like the squares'.

### Changed

- Day layout: the squares, and the new dots, are centered across the page by default, instead of set to the left. Saved settings keep their alignment.
- Day layout: an hourly schedule over two pages puts the extra hour of an odd count on the second page, which has no header and so more room, instead of the first.

## 4.4.0 — 2026-10-21

Settings and files from 4.3.0 are read as they are; the new options start at their defaults.

### Added

- Day layout: a Blank fill leaves the page empty under its header, for drawing or free writing.
- 21 more languages: Afrikaans, Amharic, Catalan, Estonian, Filipino, Gujarati, Hindi, Indonesian, Kannada, Latvian, Lithuanian, Malay, Malayalam, Serbian, Slovenian, Swahili, Tamil, Telugu, Thai (with Gregorian years), Traditional Chinese and Vietnamese.
- The Language field explains, under its info icon, that it sets the printed calendar's language, the editor staying in English, and the Week starts on field what it sets and what Language default means.
- Month layout: the weekday names above the grid can be set from 6 to 24 pt (9 pt by default).
- Month, week and day layouts: the mini calendars' titles can name the year after the month, or the month alone, per a Show year in title option in the Mini calendar section (the month layout's show the year by default, the week and day layouts' don't, as before).

### Changed

- The Events field is taller, showing seven lines instead of four.

### Fixed

- Year layout: without a title, the year is written in the calendar's language, e.g. "2026年" in Japanese, "2026 г." in Russian, in the heading and in the Title field's placeholder.
- Month layout: with whole weekend columns highlighted, the weekday names above them are shaded too, as part of the column.
- A browser in a language whose code starts like another's (Filipino, `fil`, and Finnish, `fi`) starts in its own language, and a Taiwanese browser in Traditional Chinese.

## 4.3.0 — 2026-10-21

Settings and files from 4.2.0 are read as they are; the new options start at their defaults, and saved settings keep the values whose default changed.

### Added

- Month layout: the previous and the next month are drawn small at the top left and top right of each page, titled with their month and year, each shown by default and hidden by its own option in the Mini calendar section, without week numbers by default.
- Month layout: the grayed days of the previous and next month can be left out of the grid, their cells blank (left out by default).
- Month layout: the day numbers can be set left, centered or right, and at the top, middle or bottom of their cells, with the events' names following them (top left by default).
- Month layout: the grid's lines can be left out, only the weekday names, the days and their events being drawn (shown by default).
- Month layout: the day numbers' font size can be set, from 8 to 36 pt (14 pt by default).
- Every sidebar section but the layout picker ends with a small reset button, at its bottom right. It veils the section's fields with a question and a Reset button that restores just that section's settings to their defaults; a click outside the section, Escape or collapsing the section cancels.
- Week layout: the weeks can start on an even page, after a blank first page, so that printed double-sided each week's two pages face each other.
- Day layout: the grid of squares can be aligned left, centered or right on the page, inside its margins (left by default).
- The Language list opens with a filter box: typing narrows it by the language's or the country's name, in English or in the language itself ("Deutsch", "Brasil"), accents and case ignored.
- Week layout: each page can keep an empty bordered footer under the days (off by default), its height set from 5 to 100 mm (20 mm by default).
- Week and day layouts: the title's font size can be set, from 12 to 48 pt (20 pt by default on the week layout, 24 pt on the day layout).

### Changed

- Month layout: the grid no longer shows week numbers by default; saved settings keep their value.
- Day layout: the title is the date by default, the weekday below it.

### Fixed

- Mini months and the year layout's months: a trailing row with no day of the month no longer draws the rule beside its blank week number.
- Day layout: the squares fill only as many whole squares as fit, leaving the rest blank, instead of half-drawn squares along the right and bottom edges.

## 4.2.0 — 2026-10-20

Settings and files from 4.1.0 are read as they are; the new options start at their defaults.

### Added

- Month layout: a title printed on every page, the month and year then below it.
- An info button next to the month layout's title explains it, in two short paragraphs.
- The day layout's ruled lines can be set closer or further apart, from 4 to 20 mm.
- The day layout's pages can be filled with squares, like a math notebook, from 3 to 10 mm a side (5 mm by default).
- Text boxes show an × button at their right end that clears them.
- Events, in a section of their own on every layout: one per line, a date (`YYYY-MM-DD`) and a name, the year `0000` repeating it every year. The month layout writes them in the days' cells, the week layout under the days' labels and the day layout under the page's heading, and the year layout circles their days. Lines that aren't an event are named under the box.
- The year layout lists the year's events, each with its date, on a second page.

### Changed

- Day layout: the week number and the day of the year follow the subheading on its line, separated by dots, in its font and color.
- The export, import and reset buttons sit in the layout section, under the layout they act on.
- The layout section's buttons show what they do in a line under them, on hover or focus.
- Less space under an open sidebar section.
- The reset button's icon is a power symbol with a dashed ring.
- The year and month layouts' Appearance section and the week and day layouts' Week page and Day page sections are named Content.
- Two pages per day comes first in the day layout's content section.
- The line above a day page's schedule, ruled lines or squares is drawn like their other lines, no longer darker.
- The month layout writes weekday names in full by default.
- Info buttons explain more options (mirror margins, week numbers, two pages per week or day, a hidden weekend), and their notes are clearer, split into short paragraphs.
- The mini calendar on week and day pages is a little smaller.
- The week layout's mini calendar marks the week like the day layout's marks the day: white on black, no longer framed.

## 4.1.0 — 2026-10-20

Settings and files from 4.0.0 are read as they are; the new options start at their defaults.

### Added

- Week layout: the page title can be set left, centered or right, or automatically (left beside the mini calendar or over two pages, centered otherwise).
- Week layout: a Header section, holding the title alignment and the week number option.
- Week and month layouts: weekday names can be written in full.
- Month layout: the month title can be set left, centered or right.
- Mirrored margins can bind at the top, for flip calendars.

### Changed

- The margin inputs are placed around a drawn page, so their sides need no labels.
- Every field's description opens in a balloon from an info button next to its label.
- Day layout: a Header section holds the title, details line and weekend highlight options.
- The mini calendar section comes before the week and day page sections, and two pages per week comes first in its section.
- Week layout: the mini calendar is shown by default.
- Sidebar sections collapse, and only one is open at a time; the layout section always stays open.

## 4.0.0 — 2026-10-19

Settings and files from 3.x are migrated: the week layout's weekend highlight becomes on or off, the week number and the day page's options are renamed, and the day layout's mini calendar options move into their own group.

### Added

- Week layout: a Weekend option (Saturday and Sunday in a cell each, sharing one, or left out).
- Week layout: an hourly schedule in each day's cell, skipping days outside the year.
- Week layout: a week spread over two pages.
- Week layout: days laid out as columns side by side or as stacked rows.
- Week layout: a mini calendar framing the week, drawn on the second page when the week spans two.
- Day layout: a day spread over two pages.
- Mirrored margins, for printing on both sides.
- Seventeen more languages: Portuguese (Brazil), Dutch, Polish, Czech, Slovak, Hungarian, Croatian, Bulgarian, Turkish, Ukrainian, Russian, Swedish, Danish, Norwegian, Finnish, Chinese and Korean, sorted alphabetically in the picker.

### Changed

- The week and day layouts have their own options: each layout's weekend highlight, header and mini calendar options are set separately, the day layout's mini calendar in its own Mini calendar section.
- A smaller mini calendar.
- Some defaults changed.

### Fixed

- One bad field in a nested setting, such as the page setup, no longer resets the others.

## 3.2.0 — 2026-10-19

### Added

- Week layout: one week per page.
- Day layout: show or hide the mini calendar.
- Day layout: a details line under the title, with the week number and the day of the year.
- Day layout: the title can be the weekday or the date.

### Changed

- The Fill and Hour format options are radio buttons.

## 3.1.0 — 2026-10-19

### Added

- A5 paper.
- A website icon.
- The sidebar can be resized.

### Changed

- Toolbar buttons rearranged, and page sizes reordered.
- Some options are radio buttons, and the sidebar sections have a new design.

### Fixed

- Dates no longer shift around daylight-saving changes, since they are built in UTC.

## 3.0.0 — 2026-10-19

The first versioned release. Settings saved by earlier builds are not read.

### Added

- Year layout: the whole year on one page, as twelve month grids.
- Month layout: one month per page, with large writing cells.
- Day layout: one day per page, with an hourly schedule (12- or 24-hour clock, first and last hour) or ruled lines.
- Each layout remembers its own settings.
- Any weekday as the week start, or the language's default.
- Weekday name formats, weekend highlighting options and week numbers.
- A title and subtitle.
- Calendar languages: English (US and UK, UK the default), Romanian, German, French, Spanish, Italian and Japanese; the printed text is localized too.
- A4, A3 and Letter paper, portrait or landscape, with configurable margins.
- Export, import and reset of the settings.
- A warning when a page's content does not fit inside its margins.
- The app version, shown in the sidebar.

### Fixed

- Years before 1583, which the Gregorian calendar does not cover, are no longer accepted.

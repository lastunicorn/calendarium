# Changelog

The features each release brought, newest first. Versions follow the app version in `package.json`: a major release changes the settings format, and settings and files from an older major are migrated when read.

## Unreleased

### Added

- The day layout's ruled lines can be set closer or further apart, from 4 to 20 mm.
- The day layout's pages can be filled with squares, like a math notebook, from 3 to 10 mm a side (5 mm by default).

### Changed

- The export, import and reset buttons sit in the layout section, under the layout they act on.
- The layout section's buttons show what they do in a line under them, on hover or focus.
- Less space under an open sidebar section.
- The reset button's icon is a power symbol with a dashed ring.
- The year and month layouts' Appearance section and the week and day layouts' Week page and Day page sections are named Content.
- Two pages per day comes first in the day layout's content section.
- The line above a day page's schedule, ruled lines or squares is drawn like their other lines, no longer darker.

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

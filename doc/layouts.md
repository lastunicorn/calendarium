# Layouts and their options

`src/layouts/` is the core domain: what each layout is and prints. Four layouts, `yearly`, `monthly`, `weekly` and `daily`. Each one's folder has a `README.md` describing what it prints, its options and the rules they follow, its migration steps, its files and its own domain terms: read it before changing that layout, and update it with the layout.

- [`yearly`](../src/layouts/yearly/README.md)
- [`monthly`](../src/layouts/monthly/README.md)
- [`weekly`](../src/layouts/weekly/README.md)
- [`daily`](../src/layouts/daily/README.md)

How a layout stays independent of the others is in [architecture.md](architecture.md#layouts-as-plugins).

## The registry

- `index.ts` lists the layouts once, in `LAYOUTS` (the picker's order), each the `defineLayout(id, spec)` its folder's `index.ts` exports, and derives the rest from it: `LayoutId`, `LAYOUT_IDS`, each layout's options (`LayoutOptions`: `YearlyOptions`, `MonthlyOptions`, `WeeklyOptions`, `DailyOptions`, each extending `CommonOptions` from `common.ts`, which `defineLayout` requires) and the specs.
- The id is stored in settings and files, so it never changes once released, except in a major release, whose migration steps map the old id to the new one (`LEGACY_LAYOUT_IDS` in `workspace/legacy.ts`, as 6.0.0 maps `year-per-page` to `yearly`).
- `index.ts` collects the specs in `LAYOUT_SPECS` and exposes `layoutSpec(id)`, `defaultLayoutOptions`, `normalizeLayout`, `migrateLayoutOptions` and `mapLayouts`; the first of the `LAYOUT_IDS` is the one the New project dialog preselects.

## A layout's spec

Each layout's knowledge of its options is one `LayoutSpec` in `layouts/<layout-id>/options.ts`, next to its options type: `defaults`, `validators` (extending `COMMON_VALIDATORS`), `normalize` and `migrations` (its own steps between format versions, in `layouts/<layout-id>/migrations.ts`, `{}` when it has none); `parseOptions(spec, data)` (`LayoutSpec.ts`) reads untrusted options by them.

Everything only one layout uses lives in its folders; what several share stays in the host (`common.ts`, `monthGrid.ts`, `schedule.ts`, `heading.ts`, `migrations.ts`). Rules a layout's pages follow sit next to its options, like `weekly/cells.ts` (`weekCells`, `splitWeekCells`).

## Page plans

Each layout is planned by a pure function in `layouts/<layout-id>/pages.ts`, `(options, model) => plan`, that says what every sheet holds, and drawn by its component in `layouts/<layout-id>/ui/`, which gets the plan from `usePagePlan(plan, options)` and only turns it into markup. See [ADR 0004](adr/0004-page-plans-separate-rules-from-drawing.md).

- A layout takes its own options as `options` (`LayoutOptions[id]`) and renders its own `Page`s (`ui/layouts/Page.tsx`, one paper sheet each, given `setup={options.page}`), so it decides the page count; consecutive pages print on separate sheets.
- A rule deciding what a sheet shows goes in the plan, not the component: `normalize` holds the rules on stored values, the plan the rules on derived ones (the resolved week start, the year's weeks, the content box).
- A plan starts from the `CalendarModel` (`calendarModel(options)` in `layouts/common.ts`: resolved week start, the year's months and month names), builds shared label arrays (weekday names, hour labels) once so the memoized pages (`WeekPage`, `DayPage`) keep equal props, and describes the drawn elements by their component's props, spread into it, like `MiniMonthPlan` (`layouts/monthGrid.ts`) into the shared `MiniMonth`.
- Reuse `CalendarHeader` for the page heading (`size="large"` or `"compact"`).

## What several layouts share

What several layouts share stays in the host:

- **Headings.** The heading alignments are in `layouts/heading.ts`: `HEADING_ALIGNS` (left, center, right) for the month's `header.alignment`, nothing being beside its heading, and `HEADING_ALIGNMENTS`, adding `auto`, for the week's `header.alignment`; their sidebar options share labels in `ui/sidebar/fieldOptions.ts`. Every layout's heading font size (pt; each layout's `header.fontSize`) is checked there too (`isHeadingFontSize`) and edited by `ui/sidebar/HeadingFontSizeField`.
- **Schedule.** The schedule options (`HourSchedule`: `hourFormat`, `firstHour`, `lastHour`) are shared by the week and day layouts through `layouts/schedule.ts` (defaults, validators, the `orderHours` normalize) and `ui/sidebar/ScheduleFields` (the week and day layouts' `content.schedule`, `orderContentHours` ordering it).
- **Footer.** The footer options (`footer`, a `PageFooter`: `show`, `height`) likewise through `layouts/footer.ts` and `ui/sidebar/FooterSection`, a section of its own.
- **Month grid.** The month grid options (`MonthGridOptions`: `weekdayFormat`, `highlightWeekends`, `showWeekNumbers`) likewise through `layouts/monthGrid.ts` and `ui/sidebar/MonthGridFields`, shown in `YearContentSection` for the year layout's 12 months (its `content` group, which adds `monthSize`) and in the month layout's `MonthContentSection` (its `content` group, which adds the cells' settings and the `dayNumber` group; a grid has room for abbreviated weekday names only, `MONTH_GRID_WEEKDAY_FORMATS`, except the month page's, whose validator and `weekdayFormats` allow `full`).
- **Mini months.** A mini month's look is `MiniMonthStyle` (the grid options plus `showYear`, whether its title names the year, and `size`, one of `MINI_MONTH_SIZES`), edited by `MiniMonthFields`; the day layout's `miniMonth` is a `MiniMonthOptions` (the style plus `show` and `showEvents`), edited by the shared `MiniMonthSection`, and the month and week layouts' `miniMonth` (the style plus `showPreviousMonth` and `showNextMonth`, or `showCurrentMonth`, `showNextMonth` and `showEvents`) each by its own `MiniMonthsSection`. Each size is defined once, in `ui/layouts/MiniMonth.module.css`: one class per size setting the box (`--mini-month-width`, `--mini-month-height`) and the text; `miniMonthSizeClass` gives it, and a layout puts it on the header holding the mini month, whose corner it sizes by those variables.
- **Weekends.** Weekend highlighting rules live in `core/weekend.ts`.

## Adding a layout

1. A `layouts/<layout-id>/` folder with a `README.md` (as the other layouts' are) and an `index.ts` (its entry point) that exports `defineLayout('<layout-id>', spec)`, listed in `LAYOUTS` (`layouts/index.ts`).
2. A `layouts/<layout-id>/options.ts` with its options type and `LayoutSpec` (`normalize: normalizeCommon`, the shared options' rules, when it has no cross-field rules of its own), with an `options.test.ts`, and a `pages.ts` with its plan and a `pages.test.ts`.
3. A `layouts/<layout-id>/ui/` folder with its component (drawing the plan), form and `LayoutView`, listed in `LAYOUT_VIEWS` (compile-enforced, as the spec's fields are; `layers.test.ts` checks the folder is named after the id).

## Options

### Groups

Every option belongs to one layout's set, and every option is in a group: one per drawn element, which is one per sidebar section, so a section edits one group and resets it whole.

- `CommonOptions` holds only what every layout uses with the same meaning: the `calendar` group (`CalendarOptions`: `year`, `locale`, `weekStart`), the `events` (a list of lines, at most `MAX_EVENT_LINES` when read) and `page`.
- Each layout has its own `header`, `miniMonth` and `content` types (`YearlyHeader`, `WeeklyContent`, …, in `layouts/<layout-id>/options.ts`, in sidebar order: calendar, events, header, miniMonth, content, footer, page), built from the groups several layouts share, each defined once with its type, defaults, validators and fields component: `PageFooter` (`footer`), `HourSchedule` (`content.schedule`), `MonthGridOptions`, `MiniMonthStyle` and `MiniMonthOptions`.

### Naming

- A prefix naming a sub-element of two or more fields becomes a nested group (`content.schedule`, `content.dayNumber`, `content.genkoYoshi`); a single field keeps its descriptive name (`content.ruledLineSpacing`).
- A field name means the same thing in every layout that has it, which is up to naming (`fontSize` is always pt), though its type may differ (`header.alignment` has `auto` on the week layout only), so a field that would mean something else gets another name.

### Adding an option

Adding an option touches:

1. `CommonOptions` (every layout, `layouts/common.ts`), a shared group, or one of a layout's groups in `layouts/<layout-id>/options.ts`;
2. its default in `commonDefaults()`, the group's defaults or that layout's spec `defaults`;
3. a validator in `COMMON_VALIDATORS` (`layouts/common.ts`), the group's validators or that layout's spec `validators` (a nested `Validators` table per group);
4. and a control in the matching section (`ui/sidebar/*Section.tsx` for shared options, the layout's `ui/` folder for its own), shown by that layout's form.

The compiler enforces the default and the validator. A layout's new option that changes its look deserves a case in the visual comparison ([testing.md](testing.md#visual-comparison)).

### Cross-field rules

A rule that ties several fields together (e.g. `firstHour` ≤ `lastHour`, `orderContentHours`) goes in that layout's spec `normalize` (or, for the shared options, in `normalizeCommon`, which every layout's `normalize` starts from, like `normalizePage`: margins that differ, or mirrored margins, turn equal margins off), which runs after parsing and after every reducer change, so layouts render the options as is and form limits are only a hint.

A nested object like `page` is checked by a nested `Validators` table (`FieldCheck`), field by field, so one bad field keeps the others.

### Fixed choices

For a choice between fixed values, declare a `const` array next to the concept it belongs to (`core/` for a generic one, the layout's folder when only it uses the set) and derive the type from it (`(typeof X)[number]`); the validator is `oneOf(X)` and the select options are `optionsFrom(X, labels)`, which fails to compile if a value has no label.

### Options that change between versions

A layout's options changing is a step in that layout's `migrations`; how those steps run is in [persistence.md](persistence.md#migrations).

# User interface and preferences

`src/ui/` is the only folder that uses React ([architecture.md](architecture.md#layers)). The app's own UI stays English ([ADR 0007](adr/0007-english-only-editor.md)). How the preview prints is in [printing.md](printing.md).

## Preferences

`src/preferences/` holds the viewer's own settings, apart from any calendar: never printed, never in a project file.

- `Preferences` (`Preferences.ts`, with `defaultPreferences`, `PREFERENCE_VALIDATORS` and `parsePreferences`, read field by field like a layout's options) holds the sidebar width, the theme (`theme`, one of `THEMES`: `system`, or `light` or `dark` whatever the system's; `nextTheme` stepping through them, as the sidebar's `ThemeButton` beside the heading does, and `ui/useTheme` setting it as `data-theme` on `<html>`), the open sidebar section (`withSectionToggled`: one open at a time) and the preview's zoom (`previewZoom`: a whole percent from `MIN_ZOOM` to `MAX_ZOOM`, the menu's `ZOOM_LEVELS` or in between, or one of the fits `ZOOM_FITS`; `zoomScale` resolving a fit from the preview's size, `zoomedIn` / `zoomedOut` stepping between levels, `zoomAt` rounding a scale, in `zoom.ts`).
- `storage.ts` loads and saves it under one key, keeping the fields a later version stored, and reads the separate keys of builds before 4.6.0 until it first saves.
- `ui/usePreferences` holds it; `App` passes the width to the `Sidebar`, which keeps it within the window, the open section to the `WorkspaceForm`, which gives its `Section`s an `OpenSections` context, and the zoom to the `Preview`.
- A new preference is a field, its default and its validator there, and a control in the UI.

## Sidebar

`sidebar/` holds the `WorkspaceForm`.

### Document section

The `ProjectSection`, titled Document (the UI's word for a project, [ADR 0012](adr/0012-the-ui-calls-a-project-a-document.md)), its actions in the `ProjectToolbar`, the hovered or focused one's label under them:

- New document…;
- Change document… (the `OpenProjectDialog`, titled Open document, the projects one per row, scrolling past about eight, a radio group with its radios hidden, the open one chosen, Open or a double click opening another);
- and Delete document;
- then, past a separator, the file actions Open a document file and Save document to a file;
- then, past another, Print (disabled without a project);
- above the open project's name and its layout, shown read only.

Opening a file of a project already kept, or deleting one, asks first (`OverwriteProjectDialog`, `DeleteProjectDialog`). `useProjectFileOpener` reads the file chosen, waits for that answer, imports it and holds what to tell about it, an error or a notice (`projectFileNotices.ts`), which the section shows under the toolbar, after why changes aren't being saved, if they aren't. The `ProjectSection` composes these parts and keeps the open project's name and layout.

### The open project's form

Then the open project's form, keyed by its id so half-typed drafts don't carry over, which combines the sections:

- the shared `CalendarSection` (for a layout whose `calendar` is `CalendarOptions` alone; a layout extending that group, like the daily one, has its own copy, its week start choices, `WEEK_START_OPTIONS`, shared in `sidebar/fieldOptions.ts`), `EventsSection`, `MiniMonthSection`, `FooterSection`, `PageSection` in `sidebar/`, and sections only one layout uses, like `HeaderSection` or `YearContentSection`, in that layout's `ui/` folder;
- each typed `OptionsSectionProps<C>` for the options it edits, or for the one group it edits (`CalendarSection` on `CalendarOptions`, `PageSection` on `PageSetup`, `FooterSection` on `PageFooter`), the form then giving it `optionsGroup(props, key)`, whose update patches the group inside the options;
- with their `defaults`, which its `Section`'s `onReset` button restores once confirmed on the veil it lays over the fields, passing its group's defaults whole (`onUpdate(defaults)`), and a nested group inside it patched by a named handler (`{ schedule: patch }`);
- `MonthGridFields`, `MiniMonthFields` and `ScheduleFields` take `OptionsFieldsProps<C>`, without defaults;
- built on the typed controls in `fields/` (`SelectField`, `NumberField`, …).

## Preview

- `preview/Preview` renders the open project's layout with its options, and `preview/EmptyPreview` a New document… button when no project is open.
- The `Preview` draws its `ZoomBar` over the pages and keeps the middle of the view in place when zooming (with the wheel, the point under the pointer); `useZoomGestures` zooms it with Ctrl (or ⌘) and +, − or 0 while the focus is in the preview, and with Ctrl (or ⌘) and the wheel, as a trackpad's pinch sends, over it, in place of the browser's zoom.
- The `Preview` also draws the `PageIndicator`: the page showing the most of itself in the view (`useCurrentPage`), in reading order, with a booklet's sheet side, and the page before, after or typed in.

## Dialogs

`App` holds whether the `NewProjectDialog` (titled New document: a name, optional, and the layout) shows: the project section and the empty preview both open it, and it never opens by itself: on a first launch, or once the last project is deleted, the empty preview shows, leaving the user to create a project or open a file.

Dialogs are `ui/components/Dialog`: a native `<dialog>` opened with `showModal` while it is mounted, whose primary action submits its form, Escape and its close button cancelling, the focus going to its checked radio, or its first field, or to Cancel, and back once it closes, or to its `returnFocus` when there is nothing to go back to (a project created from the empty preview focuses Change document…) (`src/test/setupDom.ts` gives jsdom `showModal` and `close`); `window.confirm` is not used.

## A layout's UI

Each layout's UI is one folder inside the layout's, `layouts/<layout-id>/ui/`, whose `index.ts` exports a `LayoutView` (`Component`, `Form`, short `name` and picker `label`); `ui/layouts/registry.ts` collects them in `LAYOUT_VIEWS` and exposes `layoutView(id)`. Parts several layouts draw (`Page`, `CalendarHeader`, `MiniMonth`, `usePagePlan`) stay in `ui/layouts/`, with `LayoutView` and the registry. Everything one layout has, its domain and its UI, is in its one folder, `layouts/<layout-id>/`.

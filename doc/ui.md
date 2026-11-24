# User interface and preferences

`src/ui/` is the only folder that uses React ([architecture.md](architecture.md#layers)). The app's own UI stays English ([ADR 0007](adr/0007-english-only-editor.md)). How the preview prints is in [printing.md](printing.md).

## Preferences

`src/preferences/` holds the viewer's own settings, apart from any calendar: never printed, never in a project file.

- `Preferences` (`Preferences.ts`, with `defaultPreferences`, `PREFERENCE_VALIDATORS` and `parsePreferences`, read field by field like a layout's options) holds the sidebar width, the theme (`theme`, one of `THEMES`: `system`, or `light` or `dark` whatever the system's; `nextTheme` stepping through them, as the sidebar's `ThemeButton` beside the heading does, and `ui/useTheme` setting it as `data-theme` on `<html>`), the open sidebar section (`openSection`, by its id, one of `SECTION_IDS`: `project`, then each option group's key, never by its title, which can change; `withSectionToggled`: one open at a time) and the preview's zoom (`previewZoom`: a whole percent from `MIN_ZOOM` to `MAX_ZOOM`, the menu's `ZOOM_LEVELS` or in between, or one of the fits `ZOOM_FITS`; `zoomScale` resolving a fit from the preview's size, `zoomedIn` / `zoomedOut` stepping between levels, `zoomAt` rounding a scale, in `zoom.ts`).
- `storage.ts` loads and saves it under one key, keeping the fields a later version stored, reads the separate keys of builds before 4.6.0 until it first saves, and the open section's title that builds up to 6.0.0 stored in place of its id (`LEGACY_SECTION_IDS`).
- `ui/usePreferences` holds it; `App` passes the width to the `Sidebar`, which keeps it within the window, the open section to the `WorkspaceForm`, which gives its `Section`s an `OpenSections` context, each `Section` given its `id`, and the zoom to the `Preview`.
- A new preference is a field, its default and its validator there, and a control in the UI.

## Sidebar

`sidebar/` holds the `WorkspaceForm`.

### Document section

The `ProjectSection`, titled Document (the UI's word for a project, [ADR 0012](adr/0012-the-ui-calls-a-project-a-document.md)), its actions in the `ProjectToolbar`, the hovered or focused one's label under them:

- New document…, which opens the project it creates in the preview;
- and Manage documents, which shows [Documents](#documents) in the main area, where projects are opened and deleted, pressed while it shows, and the preview again;
- then, past a separator, the file actions Open a document file, whose project opens in the preview, and Save document to a file;
- then, past another, Print;
- above the open project's name and its layout, shown read only.

They act on the open project only beside its preview: while the main area shows Documents, Save hides, Print is disabled, and neither the name and layout nor the project's form shows, their open section kept for when the preview shows again.

Opening a file of a project already kept asks first (`OverwriteProjectDialog`). `useProjectFileOpener` reads the file chosen (`projectFiles.read`), waits for that answer, imports it and holds what to tell about it, an error or a notice (`projectFileNotices.ts`), which the section shows under the toolbar, after why changes aren't being saved, if they aren't. The `ProjectSection` composes these parts and keeps the open project's name and layout.

### The open project's form

Then the open project's form, keyed by its id so half-typed drafts don't carry over, which combines the sections:

- the shared `CalendarSection` (for a layout whose `calendar` is `CalendarOptions` alone; a layout extending that group, like the daily one, has its own copy, its week start choices, `WEEK_START_OPTIONS`, shared in `sidebar/fieldOptions.ts`), `EventsSection`, `MiniMonthSection`, `FooterSection`, `PageSection` in `sidebar/`, and sections only one layout uses, like `HeaderSection` or `YearContentSection`, in that layout's `ui/` folder;
- each typed `OptionsSectionProps<C>` for the options it edits, or for the one group it edits (`CalendarSection` on `CalendarOptions`, `PageSection` on `PageSetup`, `FooterSection` on `PageFooter`), the form then giving it `optionsGroup(props, key)`, whose update patches the group inside the options;
- with their `defaults`, which its `Section`'s `onReset` button restores once confirmed on the veil it lays over the fields, passing its group's defaults whole (`onUpdate(defaults)`), and a nested group inside it patched by a named handler (`{ schedule: patch }`);
- `MonthGridFields`, `MiniMonthFields` and `ScheduleFields` take `OptionsFieldsProps<C>`, without defaults;
- built on the typed controls in `fields/` (`SelectField`, `NumberField`, …).

## Main area

`main/Main`, the main area right of the sidebar, draws one content at a time (`MainContent`, `main/mainContent.ts`): the open project's preview, or Documents. `App` holds the one asked for, never stored, so a reload shows the preview, and `shownContent` gives Documents while no project is open; Manage documents asks for Documents, and creating a project from the sidebar, opening one from Documents or opening a file asks for the preview. Each content is its own `<main>`, named "Preview" or by Documents' heading, and holds no `<section>` but the printed pages. Why the main area does this, rather than dialogs: [ADR 0014](adr/0014-documents-are-managed-in-the-main-area.md).

### Documents

`main/Projects`, titled Documents, lists the projects kept in this browser and never prints:

- on the left, the document list (`ProjectList`): Your documents with its New document… button, then the projects in `projectList` order, one row each, a radio group with its radios hidden, the open project tagged Current (its radio's description, not its name), a click or the arrows choosing one; or "No documents yet.";
- on the right, the details panel (`ProjectDetails`, keyed by the project, so another project's Delete is another button): the chosen project's name and layout, one term and value each in a `<dl>`, so more is one more pair, then Delete and Open; below the list when the main area is too narrow for both;
- the chosen project starts as the open one (`chosenProject`, `main/projectChoice.ts`, falling back to it when the chosen one is gone);
- Open, Enter in the list (both submit the form around them) or a double click on a row makes the chosen project current and shows its preview;
- Delete asks first (`DeleteProjectDialog`, saying to open the project to save it when it isn't the open one), then deletes the chosen project and chooses the one taking its place in the list (`neighborOf`, the one the workspace opens when the open project is deleted), its row focused, or New document… once none is left, Documents staying shown;
- its New document… opens the `NewProjectDialog`, whose project is added without being opened (`createProject` with `open: false`, unless no project is open) and chosen, Documents staying shown;
- Close (×) or Escape (`useEscapeKey`, ignoring an Escape in a dialog over it) shows the preview again, both absent without a project;
- the focus starts on the chosen row, or on New document… without a project, and goes back where it was once Documents is gone, or to Manage documents.

## Preview

- `preview/Preview` draws the open project's layout with its options.
- The `Preview` draws its `ZoomBar` over the pages and keeps the middle of the view in place when zooming (with the wheel, the point under the pointer); `useZoomGestures` zooms it with Ctrl (or ⌘) and +, − or 0 while the focus is in the preview, and with Ctrl (or ⌘) and the wheel, as a trackpad's pinch sends, over it, in place of the browser's zoom.
- The `Preview` also draws the `PageIndicator`: the page showing the most of itself in the view (`useCurrentPage`), in reading order, with a booklet's sheet side, and the page before, after or typed in.

## Dialogs

The `NewProjectDialog` (titled New document: a name, optional, and the layout) opens from the project section's New document…, `App` holding whether it shows and `Main` drawing it, and from Documents' New document…, which holds its own. It never opens by itself: on a first launch, or once the last project is deleted, Documents shows, leaving the user to create a project or open a file. A dialog only asks: New, Delete and Overwrite document.

Dialogs are `ui/components/Dialog`: a native `<dialog>` opened with `showModal` while it is mounted, whose primary action submits its form, Escape and its close button cancelling, the focus going to its first field (a radio group's checked radio, so New document starts on its name), or to Cancel, and back once it closes, or to its `returnFocus` when there is nothing to go back to (the sidebar's New document dialog focuses Manage documents), through `ui/components/focus.ts` (`firstField`, where the focus starts, and `takeFocus`, which gives it back). `src/test/setupDom.ts` gives jsdom `showModal` and `close`; `window.confirm` is not used.

## A layout's UI

Each layout's UI is one folder inside the layout's, `layouts/<layout-id>/ui/`, whose `index.ts` exports a `LayoutView` (`Component`, `Form`, short `name` and picker `label`); `ui/layouts/registry.ts` collects them in `LAYOUT_VIEWS` and exposes `layoutView(id)`. Parts several layouts draw (`Page`, `CalendarHeader`, `MiniMonth`, `usePagePlan`) stay in `ui/layouts/`, with `LayoutView` and the registry. Everything one layout has, its domain and its UI, is in its one folder, `layouts/<layout-id>/`.

## Ports

A component or hook that reaches outside the app does it through a port ([architecture.md](architecture.md#srcports)), taken from `PortsContext` by `usePorts()` (`ui/ports.ts`): the browser's, which `main.tsx` provides around `AppErrorBoundary` and `App` and the context gives by default, or a test's (`testPorts()`). `useWorkspace` takes new projects' ids from `ids`; the project toolbar's Print asks `printer.print()`; Save document to a file, and the error boundary's saves, `projectFiles.save`. `AppErrorBoundary` reads the stored projects in `componentDidCatch`, its static `getDerivedStateFromError` having no ports.

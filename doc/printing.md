# Printing

The preview is drawn as it prints: each layout renders `Page`s, one paper sheet each ([layouts.md](layouts.md#page-plans)).

## Paper sizes

Paper sizes are defined once in `src/core/paper.ts` (`PAPERS`: CSS name and mm dimensions). `Page` sizes its box in mm from it (`contentBox` gives the area inside the margins, for layouts that size content from the page), so the screen preview matches print, and `Preview` renders a `<style>` with the matching `@page { size }` rule. A new paper size is one entry there plus its label in `PageSection`.

## Zoom

The preview's zoom scales the pages with the CSS `zoom` property on screen only (`Preview.module.css`), so printing always keeps the paper size. See [ADR 0009](adr/0009-css-zoom-for-the-preview.md).

## Overflow and errors

- `Page` clips content to the paper, so on screen it shows a badge when its content doesn't fit inside the margins (`useOverflow`, checked only while the page is visible, so it doesn't undo `content-visibility`), and reports it through `PageOverflowContext` (`ui/layouts/pageOverflow.ts`) to the `Preview`, which counts the pages that don't fit (`useOverflowCount`) in one `role="status"`, announced, rather than a live region per page.
- `index.css` turns transitions and animations off under `prefers-reduced-motion: reduce`.
- `Preview` wraps the layout in `PreviewErrorBoundary`, which offers to reset the project's settings, keeping its id and name, instead of a blank screen. Any other error is caught by `ui/components/AppErrorBoundary`, around `App` in `main.tsx`, which offers to reload and to save each stored project to a file.

## Booklets

A booklet (`PageSetup.booklet`) keeps the paper size and orientation as each page's and prints two pages on each side of a sheet twice that size (`sheetDimensions`, the `@page` size then given in mm): `ui/preview/Booklet` wraps the layout in a grid and, from the pages actually drawn, appends blank pages to a multiple of 4 and places each on its sheet side by `bookletSides` (`core/booklet.ts`), leaving the pages in reading order in the document so mirrored margins still count them. A booklet's spine is its fold (`normalizePage`). Layouts draw the same pages either way.

## Spreads

Outside a booklet, a layout whose `LayoutView.facingPages` says its pages face each other (the week and day layouts with two pages per week or day) is shown, on screen only, as spreads by `ui/preview/Spreads`: the first page alone on the far side of the spine, then each even page facing the next odd one, side by side for a `left` spine, one above the other for a `top` one, a ring binding drawn between them (not printed) so they read as separate sheets, unlike a booklet's; the zoom's fits then fit a spread (`spreadDimensions`, in `ui/preview/spreadLayout.ts`).

## The print target

Printing targets Chrome/Chromium: Save as PDF, paper size matching the selection (twice it for a booklet, printed double-sided flipping on the short edge), Margins: None, Scale: 100%. See [ADR 0008](adr/0008-chromium-is-the-print-target.md).

# 0009. The preview zooms with CSS `zoom`, on screen only

- Status: Accepted
- Date: 2026-10-23

## Context

The preview draws pages at their real size in mm, which is too large or too small for many screens. A `transform: scale()` doesn't change the layout box, so the scroll area keeps the unscaled size and centering and scrolling break. Changing the pages' sizes would change what prints. The browser's own zoom scales the whole app, sidebar included.

## Decision

The viewer's zoom (`--preview-zoom`, set by `Preview`) is applied with the CSS `zoom` property on the pages' container, inside `@media screen` (`Preview.module.css`). Pages keep their mm sizes; printing ignores the zoom. Ctrl (or ⌘) with the wheel or +, − and 0 zoom the preview in place of the browser.

## Consequences

- The scroll area follows the zoomed size, so fits and centering are simple.
- Print always keeps the paper size, whatever the zoom.
- `zoom` became standard only recently; the target browsers support it.
- Keeping a point in place while zooming is the `Preview`'s job: it records where the point falls on the pages, as a fraction of their box, and scrolls it back there once the new zoom is drawn.

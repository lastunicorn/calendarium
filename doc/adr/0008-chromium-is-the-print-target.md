# 0008. Chromium is the print target

- Status: Accepted
- Date: 2026-10-18

## Context

The product is a printed page that must match its preview to the millimeter. Browsers differ in how they honor `@page { size }`, margins, background colors and fractional sizes in print; making every browser print identically is not achievable from CSS alone. Testing print needs a browser that can render to PDF from a script.

## Decision

Printing targets Chrome and Chromium-based browsers: Save as PDF, paper size matching the selection (twice it for a booklet), Margins: None, Scale: 100%. The print tests (`e2e/print.spec.ts`) run in Chromium, through `page.pdf()`, and the visual comparison screenshots Chromium. The preview and the screen behavior are also tested in Firefox (`e2e/projects.spec.ts`, `e2e/screen.spec.ts`).

## Consequences

- One print engine to match, tested on every change.
- The app works in other browsers, but printing there may not match the preview; the README says so.
- Chromium snaps border widths to whole CSS pixels, which the visual comparison inherits.
- Revisit if another engine's print output is ever tested the same way.

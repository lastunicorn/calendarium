# 0011. Only current browsers are supported

- Status: Accepted
- Date: 2026-11-18

## Context

The app draws printed pages in CSS sized to the millimeter, and leans on recent CSS and DOM features to do it simply: `round()` for the daily layout's grids, the standard `zoom` for the preview, `content-visibility` to keep a year of pages fast, `popover` and `<dialog>` for the UI. Supporting older browsers would mean a fallback for each, tested in browsers CI doesn't run, for users who can update their browser for free. Its users print from a desktop browser, which updates itself.

## Decision

The app supports the last two major versions of Chrome, Edge, Firefox and Safari, printing in Chromium only ([0008](0008-chromium-is-the-print-target.md)). The floor the features in use set (Chrome 125, Firefox 126, Safari 18) is written in [browser-support.md](../browser-support.md) with the feature behind each version, and encoded as the build's target in `vite.config.ts`. No polyfills, and no notice for an unsupported browser.

## Consequences

- A new feature may be used as soon as the last two majors of each browser have it; one that would raise the floor past them needs a fallback.
- Older browsers may draw some pages wrongly, or fail, without saying why; worth a notice if users report it.
- Safari is not tested; the floor is not tested either, only the current Chromium and Firefox.

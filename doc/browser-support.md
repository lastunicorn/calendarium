# Browser support

The app supports the last two major versions of Chrome, Edge, Firefox and Safari; printing to PDF is supported in Chrome and other Chromium-based browsers only ([ADR 0008](adr/0008-chromium-is-the-print-target.md)). Why it supports no older ones is [ADR 0011](adr/0011-current-browsers-only.md).

## The floor

The features below bound it: Chrome and Edge 125, Firefox 126, Safari 18. `vite.config.ts` encodes it as the build's target (`BROWSER_TARGETS`, `build.target`, which the CSS follows), so the build lowers nothing these versions read as written; it never adds polyfills, so the floor is what the code uses, not what the build makes of it.

| Feature                                                        | Where                                                       | Chrome | Firefox | Safari | Without it                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------- | ------ | ------- | ------ | --------------------------------------------------- |
| CSS `round(down, …)`                                           | `Squares`, `Dots`, `GenkoYoshi` (`layouts/daily/ui/fills/`) | 125    | 118     | 15.4   | The daily layout's grids lose their size            |
| CSS `zoom` (standard)                                          | `Preview.module.css`                                        | 1      | 126     | 3.1    | The preview doesn't zoom                            |
| `content-visibility: auto`                                     | `Page.module.css`                                           | 85     | 125     | 18     | A year of pages is slow to scroll                   |
| `popover` attribute, `popoverTarget`                           | `ui/fields/Info.tsx`                                        | 114    | 125     | 17     | The options' descriptions don't open                |
| `:has()`                                                       | `OpenProjectDialog.module.css`                              | 105    | 121     | 15.4   | The chosen project's row isn't marked               |
| `lh` unit                                                      | `ProjectSection.module.css`                                 | 109    | 120     | 16.4   | The sections jump as a button's hint comes and goes |
| `Array.prototype.toSorted`                                     | several                                                     | 110    | 115     | 16     | The app fails                                       |
| `inert`                                                        | `ui/sidebar/Section.tsx`                                    | 102    | 112     | 15.5   | A section's fields stay usable under its veil       |
| `<dialog>`, `showModal`                                        | `ui/components/Dialog.tsx`                                  | 37     | 98      | 15.4   | No dialog opens                                     |
| `Array.prototype.findLast`, `Object.hasOwn`, `structuredClone` | several                                                     | 98     | 104     | 15.4   | The app fails                                       |
| `Intl.DateTimeFormat.formatRange`                              | `core/locale.ts`                                            | 76     | 91      | 14.1   | The app fails                                       |
| `overflow-clip-margin`                                         | `Squares`, `GenkoYoshi`                                     | 90     | 102     | no     | A grid's last line may be clipped by a hair         |
| `Intl.Locale.getWeekInfo`                                      | `core/locale.ts`                                            | 130    | 153     | 17     | Falls back to the `weekInfo` getter, then Monday    |

Versions from MDN's browser compatibility data (8.1.9, 2026-11-12). The two last rows don't bound the floor: the app works without them, as said.

## Changing it

- A feature that needs a later version than the floor raises it: its row here, `BROWSER_TARGETS` and the README's Browser support section, in the same commit, as long as the floor stays within the last two majors; otherwise the feature needs a fallback.
- A feature the app works without, as `getWeekInfo`, gets a row without raising the floor, saying what happens without it.
- The e2e tests run in the current Chromium and Firefox only ([testing.md](testing.md#end-to-end-tests)); Safari, and the floor itself, are not tested.

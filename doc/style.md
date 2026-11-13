# Code style

## Formatting, types and lint

- Indent with tabs (enforced by Prettier and `.editorconfig`); Markdown and YAML use 2 spaces.
- Both tsconfigs set `"strict": true` explicitly; `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` were tried and stay off, for the reasons in [typescript-strictness.md](typescript-strictness.md).
- Run `npm run format` after editing. It also sorts imports (`@ianvs/prettier-plugin-sort-imports`, configured in `.prettierrc.json`): Node built-ins, then packages, a blank line, then relative paths, each block alphabetical; side-effect imports (`import './index.css'`) stay where they are and split the blocks around them.
- oxlint (`.oxlintrc.json`) runs the `react`, `typescript`, `oxc`, `import`, `jsx-a11y` and `unicorn` plugins, correctness as errors and suspicious as warnings, and `npm run lint` must show neither. A finding that is deliberate gets an `// oxlint-disable-next-line <rule> -- <reason>` comment, not a config change; tests may use `!` and nested helpers.
- A `.tsx` file exports only components (oxlint `react/only-export-components`, for Fast Refresh); put shared constants in a `.ts` file next to it, as each layout folder's `index.ts` does.
- Plain records and functions, no classes or dependency injection ([ADR 0010](adr/0010-no-classes-no-di.md)).

## Styles

- Each component's styles live in a co-located CSS Module: `ProjectSection.tsx` → `ProjectSection.module.css`, imported as `import styles from './ProjectSection.module.css'`.
- Use camelCase class names (`.a4Portrait`) so they read as `styles.a4Portrait`.
- Keep a component's print overrides (`@media print`) in its own module file.
- `src/index.css` holds only global styles: reset, `:root` fonts, colors, spacing and rule widths (CSS variables), `body`, and the global `@page { margin: 0 }`. No component classes there.
- Size anything inside a printed page in `mm`/`pt`, never `px`.
- Draw thin lines as borders, never as background gradients: a sub-pixel gradient line can vanish depending on zoom and pixel position (Firefox especially), while a non-zero border always gets at least one device pixel.
- Use the color variables from `:root` in `index.css` (`var(--color-weekend)`), never literal colors in a module; add a variable when a new color is needed.
- Space the app's chrome with the `--space-*` scale in `index.css`; the sidebar's padding (`--sidebar-padding`, which the section bands and the form reach across) and the space between pages on screen (`--page-gap`) have their own tokens. Printed rules are `--rule-light` or `--rule-heavy`.

## Event handlers

- Never write event handlers inline in JSX (`onClick={() => ...}`). Extract them as named functions and pass them by reference: `onClick={handlePrintClick}`.
- Name them `handle<Element><Event>`, e.g. `handlePrintClick`, `handleYearChange`.
- If the handler does not use props or state, declare it at module level, outside the component. Otherwise declare it inside the component, before the `return`.
- Pass the function itself, not a call to it: `onClick={handleX}`, not `onClick={handleX()}`.
- Wrap a handler in `useCallback` only when it needs a stable identity (passed to a `React.memo` child or used in a hook dependency array).
- For handlers that need per-item arguments (e.g. list rows), use a `data-*` attribute read from `event.currentTarget`, or move the handler into a child component.

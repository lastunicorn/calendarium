# Printable Calendar

Browser app (Vite + React + TypeScript) that generates a calendar to print on paper. Roadmap: [doc/plan.md](doc/plan.md).

## Commands

- `npm run dev` / `npm run build` / `npm test` / `npm run lint` / `npm run format`

## Code style

- Indent with tabs (enforced by Prettier and `.editorconfig`); Markdown and YAML use 2 spaces.
- Run `npm run format` after editing.

### Styles

- Each component's styles live in a co-located CSS Module: `ConfigPanel.tsx` → `ConfigPanel.module.css`, imported as `import styles from './ConfigPanel.module.css'`.
- Use camelCase class names (`.a4Portrait`) so they read as `styles.a4Portrait`.
- Keep a component's print overrides (`@media print`) in its own module file.
- `src/index.css` holds only global styles: reset, `:root` fonts/colors (CSS variables), `body`, and the `@page` rule. No component classes there.
- Size anything inside a printed page in `mm`/`pt`, never `px`.

### Event handlers

- Never write event handlers inline in JSX (`onClick={() => ...}`). Extract them as named functions and pass them by reference: `onClick={handlePrintClick}`.
- Name them `handle<Element><Event>`, e.g. `handlePrintClick`, `handleYearChange`.
- If the handler does not use props or state, declare it at module level, outside the component. Otherwise declare it inside the component, before the `return`.
- Pass the function itself, not a call to it: `onClick={handleX}`, not `onClick={handleX()}`.
- Wrap a handler in `useCallback` only when it needs a stable identity (passed to a `React.memo` child or used in a hook dependency array).
- For handlers that need per-item arguments (e.g. list rows), use a `data-*` attribute read from `event.currentTarget`, or move the handler into a child component.

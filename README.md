# Printable Calendar

A browser app that generates a calendar to print on paper: a configuration panel on the left and a WYSIWYG A4 page preview on the right. See [doc/plan.md](doc/plan.md) for the roadmap.

## Requirements

- Node.js 20+ and npm

## Commands

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm install`        | Install dependencies                         |
| `npm run dev`        | Start the dev server (http://localhost:5173) |
| `npm run build`      | Type-check and build to `dist/`              |
| `npm test`           | Run unit tests once (Vitest)                 |
| `npm run test:watch` | Run tests in watch mode                      |
| `npm run lint`       | Lint with oxlint                             |
| `npm run format`     | Format with Prettier                         |
| `npm run typecheck`  | Type-check only                              |

## Printing

Use Chrome/Chromium: **Print → Destination: Save as PDF, Paper: A4, Margins: None, Scale: 100%**.

## Structure

```
src/
  core/    pure calendar logic (no UI)
  config/  CalendarConfig type, defaults, persistence
  ui/      ConfigPanel, Preview and page layouts
```

# Calendarium

[![GitHub Build](https://img.shields.io/github/actions/workflow/status/lastunicorn/bcr-toolkit/build-master.yml?logo=github)](https://github.com/lastunicorn/calendarium/actions/workflows/build-master.yml)

A browser app that generates a calendar to print on paper: a configuration panel on the left and a WYSIWYG page preview (A4, A3 or Letter, portrait or landscape) on the right.

## How to use

1. **Open the app in your browser:**
   - <https://lastunicorn.github.io/calendarium/>
2. **Configure calendar** in the left panel
3. **Print** with the print button in the toolbar (see [Printing](#printing)).

## Configuration

Each layout remembers its own project, the settings you last gave it, so switching layouts never loses what you set. Settings are saved automatically in your browser, so they are still there the next time you open the app.

The toolbar lets you:

- **Save project**: the current layout and its settings, to a JSON file, to keep or share them.
- **Open** such a project file, which switches to its layout.
- **New project**: start the current layout over from its default settings.

## Printing

Use Chrome/Chromium: **Print → Destination: Save as PDF, Paper size: matching the selection, Margins: None, Scale: 100%**.

## Running locally

### From a release

Each [release](https://github.com/lastunicorn/calendarium/releases) has the built app attached as `printable-calendar-X.Y.Z.zip`, the same files the online app serves. To run it without building:

1. Download the zip from the release's assets and unzip it into a folder.
2. Serve that folder over HTTP with any static server, for example:

   ```bash
   python3 -m http.server 8080 -d printable-calendar-X.Y.Z
   ```

   or, with Node.js, `npx serve printable-calendar-X.Y.Z`.

3. Open http://localhost:8080 (or the address the server prints).

Opening `index.html` directly from the disk doesn't work: browsers don't load the app's scripts from a `file://` page. Settings are saved per address, so the local app starts from the defaults; save a project from the online app and open it locally to carry it over.

### From source

#### Requirements

- Node.js 20+ and npm

#### Clone and run

```bash
git clone https://github.com/lastunicorn/calendarium.git
cd calendarium
npm install
npm run dev
```

Then open http://localhost:5173.

#### Commands

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm install`        | Install dependencies                         |
| `npm run dev`        | Start the dev server (http://localhost:5173) |
| `npm run build`      | Type-check and build to `dist/`              |
| `npm test`           | Run unit and component tests once (Vitest)   |
| `npm run test:watch` | Run tests in watch mode                      |
| `npm run test:e2e`   | Run the Playwright print tests (Chromium)    |
| `npm run lint`       | Lint with oxlint                             |
| `npm run format`     | Format with Prettier                         |
| `npm run typecheck`  | Type-check only                              |

# Calendarium

[![GitHub Build](https://img.shields.io/github/actions/workflow/status/lastunicorn/bcr-toolkit/build-master.yml?logo=github)](https://github.com/lastunicorn/calendarium/actions/workflows/build-master.yml)

A browser app that generates a calendar to print on paper: a configuration panel on the left and a WYSIWYG page preview (A4, A3 or Letter, portrait or landscape) on the right.

## How to use

1. **Open the app in your browser:**
   - <https://lastunicorn.github.io/calendarium/>
2. **Configure calendar** in the left panel
3. **Print** with the Print button in the Project section (see [Printing](#printing)).

## Configuration

Each calendar you make is a project, with a name (optional) and a layout, chosen when you create it: yearly, monthly, weekly or daily. Projects are kept in your browser and saved automatically as you edit them, so they are still there the next time you open the app.

The Project section at the top of the sidebar lets you:

- **New project…**: create one, naming it and choosing its layout. The app asks for one on its first launch.
- **Change project…**: pick another of your projects to work on.
- **Delete project**: remove it from your browser, once you confirm; save it to a file first to keep it.
- **Open a project file**: add the project the file holds. If it was saved from a project you already have, the app asks whether to overwrite it.
- **Save project to a file**: the open project, to a JSON file named after it, to keep or share it.
- **Print** the open project's calendar (see [Printing](#printing)).
- **Rename** the open project, in the Name field under the buttons.

Project files from earlier versions open as new projects, named after the file. The first time 6.0 opens, the settings an earlier version saved in your browser become projects: one for each layout whose settings you changed, and one for the layout that was shown.

## Printing

Use Chrome/Chromium: **Print → Destination: Save as PDF, Paper size: matching the selection, Margins: None, Scale: 100%**.

## Running locally

### From a release

Each [release](https://github.com/lastunicorn/calendarium/releases) has the built app attached as `calendarium-X.Y.Z.zip`, the same files the online app serves. To run it without building:

1. Download the zip from the release's assets and unzip it into a folder.
2. Serve that folder over HTTP with any static server, for example:

   ```bash
   python3 -m http.server 8080 -d calendarium-X.Y.Z
   ```

   or, with Node.js, `npx serve calendarium-X.Y.Z`.

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

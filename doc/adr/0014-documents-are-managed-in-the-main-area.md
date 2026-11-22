# 0014. Documents are managed in the main area

- Status: Accepted
- Date: 2026-11-23

## Context

Switching documents took the Open document dialog: a modal over the whole app, its list capped at about eight rows, with room for each document's label and nothing more; with no document, an empty preview repeated the sidebar's New document…. Seeing the documents, telling them apart and creating them needs more room as the list grows and more is known about each one, and the main area, right of the sidebar, has that room whenever no pages need to show. A larger dialog would still cover the pages and be a second place beside the sidebar; the sidebar has no room beside the options.

## Decision

The main area shows one content at a time (`MainContent`): the open project's preview, or Documents, which lists the projects kept in this browser with the chosen one's details beside the list, makes one current (Open, or a double click), deletes one once confirmed, and adds one through the New document dialog without opening it or leaving the list. Documents shows by itself while no project is open. Dialogs only ask: New, Delete and Overwrite document. Which content shows is the UI's state, never stored.

## Consequences

- The open project's options and the actions on it (Save, Print) show only beside its preview, and projects are deleted only in Documents; Documents prints nothing.
- Each content is its own `<main>`, and tests find one by its name; the printed pages stay the only `<section>`s in the main area.
- Another content is one entry in `MAIN_CONTENTS`; more about a document is one more term and value in the details panel.
- A project created from Documents isn't opened (`createProject` with `open: false`), unless none is open, so a workspace with projects always has one open.

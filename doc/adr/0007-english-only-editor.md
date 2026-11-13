# 0007. The editor stays in English

- Status: Accepted
- Date: 2026-10-22

## Context

The app prints calendars in many languages ([0006](0006-printed-text-per-layout-per-locale.md)). Its own interface (sidebar, dialogs, notices) is a separate question: translating it means a message table for every label, help text and error, kept complete for every locale, for an audience that picks a language per calendar rather than per app.

## Decision

The app's own UI stays English. Only what is printed on a page is localized, by the calendar's `locale` option. Sidebar labels are literals in the components.

## Consequences

- No UI message tables to maintain; adding a printed language doesn't mean translating the editor.
- The printed language and the editor's are independent: a Japanese calendar is edited in English.
- Revisit if users who don't read English become a significant audience; the editor's strings would then move to tables as the printed ones did.

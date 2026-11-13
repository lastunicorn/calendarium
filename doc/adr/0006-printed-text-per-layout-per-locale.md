# 0006. Printed text comes from each layout's own messages table

- Status: Accepted
- Date: 2026-10-22

## Context

A calendar is printed in the language its options name, which is not necessarily the browser's. Month and weekday names come from `Intl`, but layouts also print words of their own (week, notes, a week number's label). A literal in a component would print English on a Japanese calendar. A shared table across layouts would couple them.

## Decision

Any text printed on a page that `Intl` doesn't give comes from the layout's own messages table, `layouts/<layout-id>/messages.ts` (like `DAY_PAGE_MESSAGES`), typed `Record<Locale, …>` so a missing translation fails to compile; never a literal in a component. Each layout keeps its own table, even for words another layout prints too (the week and day layouts both have `week`).

## Consequences

- A calendar is printed in one language, whatever the browser's.
- A new locale is one entry in `LOCALES`, its messages in each layout's table and its label in `LOCALE_OPTIONS`, all compile-enforced.
- The same word may be translated in several tables; that is the price of layouts staying independent ([0005](0005-layouts-are-plugins-behind-two-entry-points.md)).

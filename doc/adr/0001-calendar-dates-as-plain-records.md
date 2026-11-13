# 0001. Calendar dates are plain records, not `Date`s

- Status: Accepted
- Date: 2026-10-19

## Context

A calendar cell stands for a day: no time of day, no time zone. JavaScript's `Date` is an instant. Built from local parts, a date can land on the wrong day around a daylight-saving change or in a time zone east or west of the one it was made in, and `new Date(y, m, d)` maps years 0 to 99 to 1900 to 1999. Dates also serve as React keys and are compared in memoized props, where an object with identity and mutable state is a poor fit. `Temporal.PlainDate` is the right type, but is not available everywhere the app prints.

## Decision

A date is a `PlainDate`, a plain record `{ year, month, day, weekday, key }` (`core/calendar.ts`), built by `plainDate`. `utcDate` (UTC midnight, `setUTCFullYear`) is the only place a `Date` is built, and only to format a date through `Intl` (`dateFormatter` formats in UTC). Today's date is read once, by `currentEnvironment`, and passed down as an `Environment`; `src/layers.test.ts` fails on a `new Date(` or `navigator` read anywhere else outside tests.

## Consequences

- No DST or time-zone bugs, and years below 100 work as written.
- `key` (`YYYY-MM-DD`) is a ready React key and a cheap equality check.
- Plans and tests are deterministic: a test passes a fixed `Environment` instead of mocking the clock.
- Date arithmetic goes through the helpers in `calendar.ts`, not `Date` methods.
- When `Temporal.PlainDate` is available in the print target, `plainDate` and `utcDate` are the only places to change.

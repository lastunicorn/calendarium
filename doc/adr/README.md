# Architecture decision records

Each record says why one lasting decision was made, so it isn't undone by someone who only sees its cost. The rules themselves are in the topic files in [`doc/`](../); a record is the reason behind one of them.

| No.                                                         | Decision                                                 | Status   |
| ----------------------------------------------------------- | -------------------------------------------------------- | -------- |
| [0001](0001-calendar-dates-as-plain-records.md)             | Calendar dates are plain records, not `Date`s            | Accepted |
| [0002](0002-one-storage-key-per-project.md)                 | One storage key per project                              | Accepted |
| [0003](0003-format-version-is-the-major-version.md)         | The data format's version is the app's major version     | Accepted |
| [0004](0004-page-plans-separate-rules-from-drawing.md)      | Page plans separate a layout's rules from its drawing    | Accepted |
| [0005](0005-layouts-are-plugins-behind-two-entry-points.md) | Layouts are plugins behind two entry points              | Accepted |
| [0006](0006-printed-text-per-layout-per-locale.md)          | Printed text comes from each layout's own messages table | Accepted |
| [0007](0007-english-only-editor.md)                         | The editor stays in English                              | Accepted |
| [0008](0008-chromium-is-the-print-target.md)                | Chromium is the print target                             | Accepted |
| [0009](0009-css-zoom-for-the-preview.md)                    | The preview zooms with CSS `zoom`, on screen only        | Accepted |
| [0010](0010-no-classes-no-di.md)                            | Plain records and functions: no classes, no DI           | Accepted |

## Writing one

A new record takes the next number and this shape, one page at most, and is linked from the topic file whose rule it explains. A decision that is reversed keeps its record, its status changed to "Superseded by NNNN", and the new decision gets its own.

```markdown
# NNNN. The decision, as a sentence

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Context

What forced a choice: the problem, the constraints, the options.

## Decision

What was chosen, in a few sentences.

## Consequences

What follows, good and bad, and what would make it worth revisiting.
```

The date is the day the decision landed in the code; the records 0001 to 0010 were written down on 2026-11-13 from the code, its comments and the commits that made them.

# 0004. Page plans separate a layout's rules from its drawing

- Status: Accepted
- Date: 2026-10-20

## Context

The rules deciding what a printed sheet shows (which days are grayed, which week cells merge, how many sheets, where a mini month goes) lived inside the React components. Testing them needed a DOM, components took 15 or more props, and some rules depend on derived values, like the week start `auto` resolves to once the language is known, so they can't be `normalize` rules on the stored options.

## Decision

Each layout has a pure function in `layouts/<layout-id>/pages.ts`, `(options, model) => plan`, that says what every sheet holds, starting from the `CalendarModel`. Its component gets the plan through `usePagePlan` and only turns it into markup. `normalize` holds the rules on stored values; the plan holds the rules on derived ones. The plan describes drawn elements by their component's props, and builds shared label arrays once so memoized pages keep equal props.

## Consequences

- One file answers "what is on a week page", and its rules are unit-tested in milliseconds without jsdom.
- Components are small and only draw.
- Plan types are another thing to learn, named after what is printed.
- `memo` needs care: shared arrays and a memoized model, or every page re-renders.

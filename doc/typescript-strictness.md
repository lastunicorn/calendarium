# TypeScript strictness

Both tsconfigs (`tsconfig.app.json`, `tsconfig.node.json`) set `"strict": true`. TypeScript has turned it on by default since 6.0, but the project's checks shouldn't depend on a compiler default that has already changed once, nor differ for an editor running an older TypeScript.

Two stricter flags outside `strict` were tried, on TypeScript 7.0.2, in November 2026, and both stay off. Try them again if the code they flag changes a lot; the counts below are the bar to beat.

## `noUncheckedIndexedAccess`: off

It reports 235 errors: about 170 in tests (`pages.test.ts`, `calendar.test.ts`, `weekend.test.ts`, …, which read `pages[0]`, `weeks[1][3]` from plans they just built) and about 60 in the source. Nearly all the source ones read arrays whose length the code itself guarantees:

- a week's first day (`week[0].key`, `days[0]`, `weeks[0].map(...)`): `buildMonth` always returns 6 weeks of 7 days, and a week plan always has days;
- a select's or radio's chosen option (`options[event.currentTarget.selectedIndex]`), always one of the options it lists;
- the 16 bytes of `newProjectId`, the parts of a version `isLaterAppVersion` compares, `LAYOUT_IDS[0]`;
- the CSS Modules' class names (`styles.alignLeft`), typed as an index signature, which each `Record<Align, string>` of classes would need asserted.

Each site would take a `!` and a comment saying why, or a narrowing that can never fail: noise around invariants the tests already hold, against no bug found. The few lookups by untrusted keys (`workspace.projects[id]`, `LEGACY_LAYOUT_IDS[id]`) already check `Object.hasOwn` first.

## `exactOptionalPropertyTypes`: off

It reports 26 errors. 23 are the same pattern: a component passing on an optional prop it received (`description={description}`, `hours={hours}`, `ref={ref}`), or a plan building an object with a field that may be `undefined` (`hours`, `CalendarEvent.year`). Each would need `| undefined` added to the optional field or a conditional spread, across the field components and every layout's plan, without changing what any of them does. One is the intended behavior of `Patch` (`applyPatch` skips a field patched with `undefined`, which a test checks). The last two are in `vite.config.ts` and `playwright.config.ts`, from the libraries' own option types, which the project can't fix.

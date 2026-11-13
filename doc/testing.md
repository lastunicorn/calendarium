# Testing and CI

The commands are listed in `CLAUDE.md` and the README. Single test file: `npx vitest run src/core/calendar.test.ts`; single test by name: `npx vitest run -t "leap year"`.

## Unit tests

Unit tests are plain `src/**/*.test.ts` files, DOM-free, covering `core/`, `layouts/`, `workspace/` and `preferences/`, and the pure logic of `ui/`, kept out of its hooks and components in `.ts` files next to them so it is tested without a DOM (`preview/zoomGestures.ts`, `preview/currentPage.ts`, `preview/spreadLayout.ts`, `sidebar/projectFileNotices.ts`, `sidebar/localeOptions.ts`, `fields/filter.ts`), the hook or component only wiring it to the DOM.

### Property tests

The calendar, booklet and patch math (`core/calendar.ts`, `booklet.ts`, `data.ts`) also has property tests, `*.property.test.ts` beside the example tests: rules that hold for every input (every day of a year in its weeks once, every booklet page printed once, a patch applied twice changing nothing), checked by `fast-check` on 200 random inputs each, which it shrinks to the smallest failing one.

### Where a layout's tests go

A layout's own rules are tested in its folder (its options in `options.test.ts` through `parseOptions`, its migration steps in `migrations.test.ts`, what its pages hold in `pages.test.ts`), what every layout's spec must do in `layouts/index.test.ts` (run for each id in `LAYOUT_IDS`), and the host's tests in `workspace/` and `ui/` check only the mechanics, through any layout.

## Component tests

Component tests are `src/**/*.test.tsx` (Vitest `component` project: jsdom + Testing Library, setup in `src/test/setupDom.ts`); they check structure only (page counts, which form sections show, the import flow), never appearance. What a layout draws and which sections its form shows are tested next to its component and form in `layouts/<layout-id>/ui/` (`formSectionTitles` in `src/test/formSections.ts` renders a form alone). Run one project with `npx vitest run --project unit` (or `component`).

## Coverage

`npm run test:coverage` runs them all with V8 coverage, a summary in the terminal and the report in `coverage/index.html`, and fails below the thresholds in `vite.config.ts`'s `test.coverage`: close to full for the domain folders (`core`, a layout's own files but not its `ui/`, `workspace`, `preferences`), looser for the whole app; they sit a little under the measured values, so raise them when coverage rises and never lower them to let a change pass.

## End-to-end tests

- `e2e/print.spec.ts` (Playwright, Chromium) builds the app, creates a project of each layout through the New project dialog, prints it to PDF and checks the page count and paper size, and that no page's content is clipped in print media.
- `e2e/projects.spec.ts` saves a project to a file and opens it back.
- `e2e/screen.spec.ts` checks the preview's screen behavior (zooming with Ctrl and the wheel or the keys, spreads, the language's week start, the squares fill inside the margins in print media).
- Those two also run in Firefox (the `firefox` project's `testMatch` in `playwright.config.ts`), for the code's Firefox paths; a test there must not call `page.pdf()`, which only Chromium has.
- First run needs `npx playwright install chromium firefox`.
- The e2e helpers (`showLayout`, `openSection`, `openProjectFile`, `pdfPageSizes`, `clippedPages`) are in `e2e/helpers.ts`.

## Visual comparison

`e2e/visual.spec.ts` shows which printed pages a change alters, comparing two builds rather than committed images: `npm run test:visual [base]` (`scripts/visual-diff.sh`; `base` is `HEAD` by default, so it checks the uncommitted changes; `master` or `HEAD~1` as well) builds the base commit in a temporary git worktree and the working tree, screenshots each case's pages (print media, each case a project file of partial options, opened by `openProjectFile`) on the base's build, then compares the working tree's with them, exactly (`threshold: 0`, a 0.01 % pixel allowance, in `playwright.config.ts`), keeping each changed page's expected, actual and diff images in `test-results/`.

- Both builds are drawn on the same machine, so fonts don't matter and nothing is stored; `npm run test:e2e` skips these tests.
- Before considering a change done, run it: a change meant to alter how pages look must alter only the pages it means to (look at the diffs), any other must alter none.
- CI runs it on every push to `master` (against the commit before) and pull request (against its base) without failing the build, uploading the images as the `playwright-results` artifact.
- A layout's new option that changes its look deserves a case there.
- Chromium snaps border widths to whole CSS pixels, so thin rules that differ by less than a pixel print the same and don't show.

## CI

CI (`.github/workflows/build-master.yml`, on pushes to `master` and on pull requests, a pull request's new push cancelling its previous run; Chromium and Firefox cached by Playwright version; an e2e test failing on CI retried twice, its first retry's trace and each try's screenshot uploaded as the `playwright-results` artifact, and the HTML reports, `playwright-report/e2e` and `playwright-report/visual`, as `playwright-report`) runs `format:check`, `lint`, `typecheck`, `test:coverage` (uploading `coverage/` as the `coverage` artifact), `build`, `test:e2e` and the visual comparison, in that order; run the same before considering a change done.

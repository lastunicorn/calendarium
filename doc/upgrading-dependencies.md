# Upgrading dependencies

Dependabot (`.github/dependabot.yml`) opens pull requests every week: one for React and its types together, one for the other development packages' minor and patch versions, one per major version of any other package, and one for the GitHub Actions the workflows use. Each runs CI, whose visual comparison builds the pull request's base and its head and screenshots both with the head's Playwright: a page that changes is one the upgrade draws differently (a Vite, React or plugin update), so look at the `playwright-results` artifact before merging. A Playwright update changes nothing there, both builds being drawn by the same Chromium.

Before merging, or when upgrading by hand (`npm outdated`, then `npm install -D <package>@<version>`), run what CI runs: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` and `npm run test:visual`. An upgrade is not a user-facing change, so it has no `CHANGELOG.md` entry, unless it changes what the app does or prints.

## Notes on the major versions

- **TypeScript 7**, the native compiler. `package.json` pins `~6.0.x`, so only its own pull request proposes 7. Try it on a branch: `npm install -D typescript@7`, then `npm run typecheck && npm run build`. Keep 6.x, closing the pull request, if `tsc -b` with the project references (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`) or the editor tooling complains, and note here why.
- **jsdom**: used only by the component tests (the Vitest `component` project, `src/test/setupDom.ts`, which adds `showModal` and `close` to `<dialog>`). Run `npx vitest run --project component`; if jsdom implements `<dialog>` itself, check the polyfill still agrees with it.
- **@types/node**: follow the oldest Node.js version `package.json`'s `engines` supports, not the newest; CI's version is in `.nvmrc`. A later major may type APIs the oldest supported version lacks.
- **Playwright**: keep the CI image or browsers in step if one is ever pinned; the first `npm run test:e2e` after an upgrade may need `npx playwright install chromium`.
- **Vite and Vitest**: Vitest follows Vite's majors; upgrade them together, and check `vite.config.ts` (the test projects and `freshGlobs`, which `src/layers.test.ts` relies on).
- **GitHub Actions**: a new major of `actions/upload-pages-artifact` or `actions/deploy-pages` changes the deployment (`deploy-pages.yml`), which runs only on a release; read their release notes before merging.

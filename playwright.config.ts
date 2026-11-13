import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

/**
 * A build to serve instead of building the working tree, and the folder of the screenshots to
 * compare with: both set by `scripts/visual-diff.sh` for `visual.spec.ts`, which runs it once on
 * the base commit's build to take the screenshots, then on the working tree's to compare.
 */
const VISUAL_DIST = process.env.VISUAL_DIST
const VISUAL_BASELINES = process.env.VISUAL_BASELINES

/** Apart from the other tests' port, so a visual run never reuses their server, nor they its. */
const VISUAL_PORT = 4174

const port = VISUAL_DIST === undefined ? PORT : VISUAL_PORT

const CI = !!process.env.CI

/**
 * Where CI's HTML report goes, apart for the visual run, so it doesn't replace the e2e tests'
 * (each run empties its report's folder); CI uploads `playwright-report/`.
 */
const REPORT_FOLDER = `playwright-report/${VISUAL_DIST === undefined ? 'e2e' : 'visual'}`

/**
 * End-to-end tests: the built app in Chromium, the print target. They check what unit tests can't:
 * that `@page`, page breaks and mm sizing produce the expected PDF, and (`visual.spec.ts`) which
 * printed pages a change alters. The preview's screen behavior (`screen.spec.ts`) and the file
 * round trip run in Firefox too, which can't print to PDF.
 */
export default defineConfig({
	testDir: 'e2e',
	snapshotDir: VISUAL_BASELINES,
	snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
	// Both builds are drawn on the same machine, so any pixel that differs is a change.
	expect: { toHaveScreenshot: { threshold: 0, maxDiffPixelRatio: 0.0001 } },
	forbidOnly: CI,
	// A test failing then passing on CI is reported as flaky, not failed. A visual difference is
	// a change, never flaky, so the visual run doesn't retry.
	retries: CI && VISUAL_DIST === undefined ? 2 : 0,
	reporter: CI ? [['github'], ['html', { open: 'never', outputFolder: REPORT_FOLDER }]] : 'list',
	use: {
		baseURL: `http://localhost:${port}`,
		// Month and weekday names follow the browser language by default.
		locale: 'en-GB',
		// A failed test's first retry records its trace, and each failed try its screenshot, in
		// test-results/, which CI uploads; the HTML report shows them.
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
			testMatch: /(projects|screen)\.spec\.ts$/,
		},
	],
	webServer: {
		command:
			VISUAL_DIST === undefined
				? `npm run build && npx vite preview --port ${PORT} --strictPort`
				: `npx vite preview --outDir "${VISUAL_DIST}" --port ${VISUAL_PORT} --strictPort`,
		url: `http://localhost:${port}`,
		reuseExistingServer: VISUAL_DIST === undefined && !process.env.CI,
		timeout: 120_000,
	},
})

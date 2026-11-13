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

/**
 * End-to-end print tests: the built app in Chromium, the print target. They check what unit tests
 * can't: that `@page`, page breaks and mm sizing produce the expected PDF, and (`visual.spec.ts`)
 * which printed pages a change alters.
 */
export default defineConfig({
	testDir: 'e2e',
	snapshotDir: VISUAL_BASELINES,
	snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
	// Both builds are drawn on the same machine, so any pixel that differs is a change.
	expect: { toHaveScreenshot: { threshold: 0, maxDiffPixelRatio: 0.0001 } },
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://localhost:${port}`,
		// Month and weekday names follow the browser language by default.
		locale: 'en-GB',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
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

import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

/**
 * End-to-end print tests: the built app in Chromium, the print target. They check what unit tests
 * can't: that `@page`, page breaks and mm sizing produce the expected PDF.
 */
export default defineConfig({
	testDir: 'e2e',
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: `http://localhost:${PORT}`,
		// Month and weekday names follow the browser language by default.
		locale: 'en-GB',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
})

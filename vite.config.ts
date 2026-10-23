/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Keeps Vitest from caching a module that lists files with `import.meta.glob`: its cache is keyed
 * by the module's own source, so it would miss files added or removed since, and
 * `src/layers.test.ts` would pass without checking them.
 */
const freshGlobs: Plugin = {
	name: 'fresh-globs',
	configureVitest({ defineCacheKeyGenerator }) {
		defineCacheKeyGenerator(({ sourceCode }) =>
			sourceCode.includes('import.meta.glob') ? false : undefined,
		)
	},
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), freshGlobs],
	// Relative asset URLs, so the build works under any path (e.g. GitHub Pages' /calendarium/).
	base: './',
	// Lets tooling (e.g. the Claude preview) pick the port; Vite's default is used otherwise.
	server: { port: Number(process.env.PORT) || undefined },
	test: {
		passWithNoTests: true,
		// Plain `.test.ts` files stay DOM-free; component tests (`.test.tsx`) run in jsdom.
		projects: [
			{ extends: true, test: { name: 'unit', include: ['src/**/*.test.ts'] } },
			{
				extends: true,
				test: {
					name: 'component',
					include: ['src/**/*.test.tsx'],
					environment: 'jsdom',
					setupFiles: ['src/test/setupDom.ts'],
					// Drawing a year of pages in jsdom takes seconds on a shared CI runner.
					testTimeout: 15_000,
				},
			},
		],
	},
})

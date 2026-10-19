/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
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
				},
			},
		],
	},
})

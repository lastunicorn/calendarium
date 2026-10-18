/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	// Lets tooling (e.g. the Claude preview) pick the port; Vite's default is used otherwise.
	server: { port: Number(process.env.PORT) || undefined },
	test: {
		include: ['src/**/*.test.ts'],
		passWithNoTests: true,
	},
})

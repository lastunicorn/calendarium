import type { Environment } from '../core/environment'

/**
 * The environment tests run in, whatever the real clock and language: a year not the current one,
 * so a test still reading the clock shows.
 */
export const TEST_ENV: Environment = { year: 2031, language: 'en-US' }

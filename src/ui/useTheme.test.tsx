import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Theme } from '../preferences/Preferences'
import { useTheme } from './useTheme'

describe('useTheme', () => {
	it('marks the document with a chosen theme, and with none to follow the system', () => {
		const { rerender } = renderHook((theme: Theme) => useTheme(theme), {
			initialProps: 'dark',
		})
		expect(document.documentElement.dataset.theme).toBe('dark')

		rerender('light')
		expect(document.documentElement.dataset.theme).toBe('light')

		rerender('system')
		expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
	})
})

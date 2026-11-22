import { describe, expect, it } from 'vitest'

import { firstField } from './focus'

// Where the focus starts in a dialog or in Documents is tested through them, with a DOM.
describe('firstField', () => {
	it('gives no field without a container, as before a ref is set', () => {
		expect(firstField(null)).toBeNull()
	})
})

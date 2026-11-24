/** New ids, unique across tabs, browsers and the files that carry them. */
export interface IdAccess {
	/** A new random v4 UUID, in lowercase. */
	newId: () => string
}

/**
 * A v4 UUID from `crypto.getRandomValues`, which works everywhere, rather than from
 * `crypto.randomUUID`, which needs a secure context: the release zip may be served over plain
 * HTTP.
 */
function randomUuid(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16))
	bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
	bytes[8] = (bytes[8] & 0x3f) | 0x80 // the RFC 4122 variant
	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		hex.slice(12, 16),
		hex.slice(16, 20),
		hex.slice(20),
	].join('-')
}

/** The browser's: random ids, from its cryptographic random numbers. */
export const BROWSER_IDS: IdAccess = {
	newId: randomUuid,
}

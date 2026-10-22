import { version } from '../../package.json'

/** The app's version from `package.json`, as `major.minor.patch`. */
export const APP_VERSION = version

/** `major.minor.patch` as three numbers; `null` when `text` is not in that form. */
function parseVersion(text: unknown): [number, number, number] | null {
	if (typeof text !== 'string') return null
	const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(text)
	return match === null ? null : [Number(match[1]), Number(match[2]), Number(match[3])]
}

/** Whether app version `text` is later than this app's; `false` when it is not a valid version. */
export function isLaterAppVersion(text: unknown): boolean {
	const other = parseVersion(text)
	const current = parseVersion(APP_VERSION)
	if (other === null || current === null) return false
	const index = other.findIndex((part, i) => part !== current[i])
	return index !== -1 && other[index] > current[index]
}

/**
 * Version of the data format, in storage and in files: the app's major version, so a major
 * release is one whose saved data older builds would misread.
 */
export const FORMAT_VERSION = parseVersion(APP_VERSION)?.[0] ?? 0

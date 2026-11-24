import type { Ports } from '../ports'
import type { PrinterAccess } from '../ports/PrinterAccess'

/** A printer that counts what it is asked to print, in place of the print dialog. */
export interface CountingPrinter extends PrinterAccess {
	readonly prints: number
}

function countingPrinter(): CountingPrinter {
	let prints = 0
	return {
		print: () => {
			prints += 1
		},
		get prints() {
			return prints
		},
	}
}

/** The ports a test runs on: each records what it is asked, and reaches nothing outside the test. */
export interface TestPorts extends Ports {
	printer: CountingPrinter
}

/** Fresh test ports, for a test to give the app (`PortsContext`) and read back. */
export function testPorts(): TestPorts {
	return { printer: countingPrinter() }
}

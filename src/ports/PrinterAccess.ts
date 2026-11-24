/** The app's pages going to paper, or to a PDF. */
export interface PrinterAccess {
	/** Opens the print dialog for the page as it prints (`@page`, print media). */
	print: () => void
}

/** The browser's print dialog, Save as PDF included. */
export const BROWSER_PRINTER: PrinterAccess = {
	print: () => window.print(),
}

/** Saves `text` as a file through the browser's download flow. */
export function downloadFile(name: string, text: string, type: string) {
	const url = URL.createObjectURL(new Blob([text], { type }))
	const link = document.createElement('a')
	link.href = url
	link.download = name
	link.click()
	// Revoking synchronously can cancel the download before it starts in some browsers.
	setTimeout(() => URL.revokeObjectURL(url), 0)
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import App from './App.tsx'
import { BROWSER_PORTS } from './ports'
import { AppErrorBoundary } from './ui/components/AppErrorBoundary'
import { PortsContext } from './ui/ports'

// oxlint-disable-next-line typescript/no-non-null-assertion -- index.html has the root element
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* The composition root: the app runs on the browser's ports. */}
		<PortsContext value={BROWSER_PORTS}>
			<AppErrorBoundary>
				<App />
			</AppErrorBoundary>
		</PortsContext>
	</StrictMode>,
)

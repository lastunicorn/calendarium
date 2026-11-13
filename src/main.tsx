import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import App from './App.tsx'
import { AppErrorBoundary } from './ui/components/AppErrorBoundary'

// oxlint-disable-next-line typescript/no-non-null-assertion -- index.html has the root element
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppErrorBoundary>
			<App />
		</AppErrorBoundary>
	</StrictMode>,
)

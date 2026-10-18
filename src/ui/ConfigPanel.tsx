export function ConfigPanel() {
  return (
    <aside className="config-panel">
      <h1>Calendar</h1>
      <p>Configuration options will appear here.</p>
      <button type="button" onClick={() => window.print()}>
        Print
      </button>
    </aside>
  )
}

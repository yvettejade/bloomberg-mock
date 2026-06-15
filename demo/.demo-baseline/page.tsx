export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-lg font-semibold">BBG Market Data — Backend</h1>
      <p className="max-w-md text-sm text-muted">
        The dashboard UI has been removed. The market-data backend is still
        running: the mock <code>@glue42/bbg-market-data</code> feed persists ticks
        to SQLite and exposes the following endpoints.
      </p>
      <ul className="text-left font-mono text-xs text-muted">
        <li>GET&nbsp;&nbsp;/api/securities</li>
        <li>GET&nbsp;&nbsp;/api/stream</li>
        <li>GET&nbsp;&nbsp;/api/history?security=…</li>
        <li>GET&nbsp;&nbsp;/api/reports</li>
        <li>POST&nbsp;/api/reports/run</li>
      </ul>
    </main>
  );
}

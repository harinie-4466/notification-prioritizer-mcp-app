import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      padding: '40px 24px',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      color: '#0f172a'
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Notification Prioritizer Widgets</h1>
        <p style={{ fontSize: '16px', lineHeight: 1.6, marginBottom: '24px', color: '#475569' }}>
          Choose a widget to view. These routes are served by the Next.js app and are available directly in the browser.
        </p>

        <div style={{ display: 'grid', gap: '16px' }}>
          <Link
            href="/priority-dashboard"
            style={{
              display: 'block',
              padding: '20px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#111827',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              border: '1px solid #e2e8f0'
            }}
          >
            <strong>Priority Dashboard</strong>
            <div style={{ marginTop: '6px', color: '#64748b' }}>
              View prioritized notifications grouped by urgency.
            </div>
          </Link>

          <Link
            href="/calculator-result"
            style={{
              display: 'block',
              padding: '20px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#111827',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              border: '1px solid #e2e8f0'
            }}
          >
            <strong>Calculator Result</strong>
            <div style={{ marginTop: '6px', color: '#64748b' }}>
              See an example calculation result widget.
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

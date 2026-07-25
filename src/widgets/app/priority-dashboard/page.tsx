'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface PrioritizedNotification {
  id: string;
  source: 'slack' | 'jira' | 'github' | 'gmail' | 'calendar' | 'pagerduty';
  sender: string;
  title: string;
  snippet: string;
  timestamp: string;
  link: string;
  accountId: string;
  accountEmail: string | null;
  rawMetadata?: Record<string, any>;
  tier: 'urgent_now' | 'normal' | 'fyi_only';
  reason: string;
}

export default function PriorityDashboard() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();

  const data = getToolOutput<PrioritizedNotification[]>();
  const isDark = theme === 'dark';

  if (!data) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: isDark ? '#ffffff' : '#111827',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '500' }}>Loading notifications...</div>
        <div style={{ fontSize: '14px', opacity: 0.6, marginTop: '8px' }}>
          Please execute the <code>prioritizeNotifications</code> tool to view the dashboard.
        </div>
      </div>
    );
  }

  const notifications = Array.isArray(data) ? data : [];

  const urgentList = notifications.filter(n => n.tier === 'urgent_now');
  const normalList = notifications.filter(n => n.tier === 'normal' || !n.tier);
  const fyiList = notifications.filter(n => n.tier === 'fyi_only');

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'slack': return '💬';
      case 'gmail': return '✉️';
      case 'jira': return '📊';
      case 'github': return '🐙';
      case 'calendar': return '📅';
      case 'pagerduty': return '🚨';
      default: return '🔔';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'slack': return '#4a154b';
      case 'gmail': return '#ea4335';
      case 'jira': return '#0052cc';
      case 'github': return '#24292e';
      case 'calendar': return '#4285f4';
      case 'pagerduty': return '#df0024';
      default: return '#6b7280';
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  // Styles
  const dashboardStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px',
    backgroundColor: isDark ? '#111827' : '#f9fafb',
    color: isDark ? '#f3f4f6' : '#1f2937',
    borderRadius: '16px',
    minHeight: '400px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e5e7eb',
    paddingBottom: '16px',
  };

  const columnsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    alignItems: 'start',
  };

  const columnStyle = (borderColor: string): React.CSSProperties => ({
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: '12px',
    borderTop: `4px solid ${borderColor}`,
    padding: '16px',
    boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  });

  const columnHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    fontWeight: 'bold',
    fontSize: '16px',
  };

  const badgeStyle = (bgColor: string, textColor: string): React.CSSProperties => ({
    backgroundColor: bgColor,
    color: textColor,
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    cursor: 'pointer',
  };

  const sourceBadgeStyle = (source: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#ffffff',
    backgroundColor: getSourceColor(source),
    padding: '2px 6px',
    borderRadius: '4px',
    marginBottom: '6px',
  });

  const renderCard = (notif: PrioritizedNotification) => (
    <div 
      key={notif.id} 
      style={cardStyle}
      onClick={() => notif.link && window.open(notif.link, '_blank')}
      title="Click to view notification source"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={sourceBadgeStyle(notif.source)}>
          <span>{getSourceIcon(notif.source)}</span>
          <span>{notif.source}</span>
        </div>
        <span style={{ fontSize: '11px', opacity: 0.6 }}>{formatTime(notif.timestamp)}</span>
      </div>

      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>
        {notif.sender}
      </div>

      <div style={{ fontWeight: '500', fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>
        {notif.title}
      </div>

      <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', lineHeight: '1.4' }}>
        {notif.snippet}
      </div>

      <div style={{
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.05)',
        borderLeft: `3px solid ${notif.tier === 'urgent_now' ? '#ef4444' : notif.tier === 'normal' ? '#f59e0b' : '#9ca3af'}`,
        padding: '6px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
        color: isDark ? '#f9fafb' : '#374151',
        marginBottom: '6px',
      }}>
        💡 {notif.reason}
      </div>

      {notif.accountEmail && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '10px',
            backgroundColor: isDark ? '#1f2937' : '#e5e7eb',
            color: isDark ? '#9ca3af' : '#4b5563',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '500',
          }}>
            📧 {notif.accountEmail}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div style={dashboardStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Priority Notification Dashboard</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.6 }}>
            Context-aware workspace prioritization
          </p>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.6 }}>
          {notifications.length} Total Notifications
        </div>
      </div>

      <div style={columnsGridStyle}>
        {/* Urgent Now Column */}
        <div style={columnStyle('#ef4444')}>
          <div style={columnHeaderStyle}>
            <span style={{ color: '#ef4444' }}>🔥 Urgent Now</span>
            <span style={badgeStyle('#fee2e2', '#991b1b')}>{urgentList.length}</span>
          </div>
          <div style={{ minHeight: '100px' }}>
            {urgentList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5, fontSize: '13px' }}>
                No urgent tasks
              </div>
            ) : (
              urgentList.map(renderCard)
            )}
          </div>
        </div>

        {/* Normal Column */}
        <div style={columnStyle('#3b82f6')}>
          <div style={columnHeaderStyle}>
            <span style={{ color: '#3b82f6' }}>⚡ Normal</span>
            <span style={badgeStyle('#dbeafe', '#1e40af')}>{normalList.length}</span>
          </div>
          <div style={{ minHeight: '100px' }}>
            {normalList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5, fontSize: '13px' }}>
                No normal priority items
              </div>
            ) : (
              normalList.map(renderCard)
            )}
          </div>
        </div>

        {/* FYI Only Column */}
        <div style={columnStyle('#10b981')}>
          <div style={columnHeaderStyle}>
            <span style={{ color: '#10b981' }}>☕ FYI Only</span>
            <span style={badgeStyle('#d1fae5', '#065f46')}>{fyiList.length}</span>
          </div>
          <div style={{ minHeight: '100px' }}>
            {fyiList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5, fontSize: '13px' }}>
                No informational updates
              </div>
            ) : (
              fyiList.map(renderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

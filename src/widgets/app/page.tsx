'use client';

import React, { useState, useEffect } from 'react';

// Define types matching our MCP server
interface Notification {
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
  tier?: 'urgent_now' | 'normal' | 'fyi_only';
  reason?: string;
}

interface UserContext {
  activeProject: string;
  upcomingMeeting: Notification | null;
  keyCollaborators: string[];
}

export default function ClientDashboard() {
  // Theme configuration (fixed dark theme for premium developer console feel)
  const isDark = true;

  // Mock server responses matching our actual MCP tools
  const mockConnectedAccounts = [
    { accountId: 'gmail_work', accountEmail: 'jane@company.com' },
    { accountId: 'gmail_personal', accountEmail: 'jane.personal@gmail.com' }
  ];

  const mockGmailNotifications: Notification[] = [
    {
      id: 'gmail_work_1',
      source: 'gmail',
      sender: 'security-alerts@company.com',
      title: '[ACTION REQUIRED] Update your SSH keys',
      snippet: 'Please update your SSH keys by Friday to maintain access to internal repos.',
      timestamp: '2026-07-26T03:00:00Z',
      link: 'https://mail.google.com/mail/u/0/#inbox/1',
      accountId: 'gmail_work',
      accountEmail: 'jane@company.com',
      rawMetadata: { priority: 'high', labels: ['Work', 'Security'] }
    },
    {
      id: 'gmail_work_2',
      source: 'gmail',
      sender: 'product-leads@company.com',
      title: 'Q3 Product Strategy Alignment',
      snippet: 'Hey everyone, I have shared the slide deck for tomorrow\'s planning. Let me know if you have feedback.',
      timestamp: '2026-07-26T02:30:00Z',
      link: 'https://mail.google.com/mail/u/0/#inbox/2',
      accountId: 'gmail_work',
      accountEmail: 'jane@company.com',
      rawMetadata: { priority: 'medium', labels: ['Work', 'Strategy'] }
    },
    {
      id: 'gmail_personal_1',
      source: 'gmail',
      sender: 'landlord@rentalgroup.com',
      title: 'Lease Renewal Agreement Draft',
      snippet: 'Attached is the lease agreement for 2026-2027. Please sign and return it by end of the week.',
      timestamp: '2026-07-26T01:15:00Z',
      link: 'https://mail.google.com/mail/u/1/#inbox/1',
      accountId: 'gmail_personal',
      accountEmail: 'jane.personal@gmail.com',
      rawMetadata: { priority: 'high', category: 'Personal' }
    },
    {
      id: 'gmail_personal_3',
      source: 'gmail',
      sender: 'netflix@info.netflix.com',
      title: 'New Season of your favorite show is out!',
      snippet: 'Start streaming the final season now on Netflix.',
      timestamp: '2026-07-25T20:00:00Z',
      link: 'https://mail.google.com/mail/u/1/#inbox/3',
      accountId: 'gmail_personal',
      accountEmail: 'jane.personal@gmail.com',
      rawMetadata: { priority: 'low', category: 'Promotions' }
    }
  ];

  const mockSlackNotifications: Notification[] = [
    {
      id: 'slack_1',
      source: 'slack',
      sender: 'Alice Chen',
      title: 'Direct Message from Alice Chen',
      snippet: 'Hey, are you free to jump on a quick call? Need to align on the database schema changes for the user service.',
      timestamp: '2026-07-26T03:30:00Z',
      link: 'https://slack.com/archives/D12345/p1720000000',
      accountId: 'default',
      accountEmail: null,
      rawMetadata: { channel: 'DM', isMention: true }
    },
    {
      id: 'slack_2',
      source: 'slack',
      sender: 'Bob Smith',
      title: 'Mention in #project-phoenix',
      snippet: '@jane please review the PR for the auth module before the meeting. We need it merged today.',
      timestamp: '2026-07-26T03:15:00Z',
      link: 'https://slack.com/archives/C67890/p1720000001',
      accountId: 'default',
      accountEmail: null,
      rawMetadata: { channel: '#project-phoenix', isMention: true }
    },
    {
      id: 'slack_3',
      source: 'slack',
      sender: 'Build Bot',
      title: 'Failed Build in #ci-alerts',
      snippet: 'Failed: build pipeline for repository \'user-service\', branch \'main\'. Commit: d3b90a1 by @bob.',
      timestamp: '2026-07-26T02:00:00Z',
      link: 'https://slack.com/archives/C11111/p1720000002',
      accountId: 'default',
      accountEmail: null,
      rawMetadata: { channel: '#ci-alerts', isMention: false }
    }
  ];

  const mockJiraNotifications: Notification[] = [
    {
      id: 'jira_1',
      source: 'jira',
      sender: 'Sarah Jenkins',
      title: 'Ticket Assigned: SEC-402 - Resolve SSRF Vulnerability in Auth Endpoint',
      snippet: 'You have been assigned to SEC-402. High priority security vulnerability reported in staging.',
      timestamp: '2026-07-26T02:45:00Z',
      link: 'https://jira.company.com/browse/SEC-402',
      accountId: 'default',
      accountEmail: null,
      rawMetadata: { ticketId: 'SEC-402', priority: 'High', action: 'assigned' }
    },
    {
      id: 'jira_2',
      source: 'jira',
      sender: 'David Miller',
      title: 'New Comment on PHOENIX-89 - Database Migration Strategy',
      snippet: '@jane I reviewed the schema changes. We need to make sure this migration is backwards-compatible to prevent downtime.',
      timestamp: '2026-07-26T01:30:00Z',
      link: 'https://jira.company.com/browse/PHOENIX-89',
      accountId: 'default',
      accountEmail: null,
      rawMetadata: { ticketId: 'PHOENIX-89', priority: 'Medium', action: 'comment' }
    },
    {
      id: 'jira_3',
      source: 'jira',
      sender: 'Jira Automation',
      title: 'Due Date Warning: PHOENIX-55 - Finalize API Contract for User Profiles',
      snippet: 'WARNING: Ticket PHOENIX-55 is due today. Please update status or request extension.',
      timestamp: '2026-07-26T00:00:00Z',
      link: 'https://jira.company.com/browse/PHOENIX-55',
      accountId: 'default',
      accountEmail: null,
      rawMetadata: { ticketId: 'PHOENIX-55', priority: 'High', action: 'due_date' }
    }
  ];

  const mockCalendarEvents = () => {
    const now = new Date();
    const m1Start = new Date(now.getTime() + 40 * 60 * 1000);
    const m1End = new Date(now.getTime() + 70 * 60 * 1000);
    const m2Start = new Date(now.getTime() - 120 * 60 * 1000);
    const m2End = new Date(now.getTime() - 90 * 60 * 1000);

    return [
      {
        id: 'calendar_1',
        source: 'calendar' as const,
        sender: 'David Miller',
        title: 'PHOENIX-89 Sync: Database Migration Review',
        snippet: 'Quick alignment on DB changes before we merge. Bring questions on backward compatibility.',
        timestamp: m1Start.toISOString(),
        link: 'https://meet.google.com/abc-defg-hij',
        accountId: 'default',
        accountEmail: null,
        rawMetadata: { endTime: m1End.toISOString(), organizer: 'David Miller', status: 'accepted' }
      },
      {
        id: 'calendar_2',
        source: 'calendar' as const,
        sender: 'HR Team',
        title: 'Company All-Hands Q3 Review',
        snippet: 'Quarterly update on company roadmap, financial health, and team goals.',
        timestamp: m2Start.toISOString(),
        link: 'https://meet.google.com/xyz-uvwx-yza',
        accountId: 'default',
        accountEmail: null,
        rawMetadata: { endTime: m2End.toISOString(), organizer: 'HR Team', status: 'accepted' }
      }
    ];
  };

  const mockGithubNotifications: Notification[] = [
    {
      id: 'github_1',
      source: 'github',
      sender: 'Bob Smith',
      title: 'Review Request: PHOENIX-89 Auth Integration',
      snippet: '@bob requested your review on PR #142: "Implement database migration and schema update for User auth sessions".',
      timestamp: '2026-07-26T03:05:00Z',
      link: 'https://github.com/company/project-phoenix/pull/142',
      accountId: 'default',
      accountEmail: null,
      rawMetadata: { repo: 'company/project-phoenix', prNumber: 142, type: 'review_request' }
    },
    {
      id: 'github_2',
      source: 'github',
      sender: 'github-actions[bot]',
      title: 'CI Build Failure: user-service (main)',
      snippet: 'Workflow "Continuous Integration" failed for commit d3b90a1 on branch main. Error in test stage.',
      timestamp: '2026-07-26T02:00:00Z',
      link: 'https://github.com/company/user-service/actions/runs/987654321',
      accountId: 'default',
      accountEmail: null,
      rawMetadata: { repo: 'company/user-service', runId: 987654321, type: 'ci_failure' }
    }
  ];

  // State Management
  const [chatLogs, setChatLogs] = useState<{ sender: 'user' | 'agent'; text: string; timestamp: Date }[]>([
    {
      sender: 'agent',
      text: 'Hello! I am your Notification Prioritization Agent. I can fetch updates from Slack, Teams, Gmail, Jira, GitHub, and Calendar, synthesize your workspace context, and prioritize what matters right now.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'json'>('board');

  // Load initial data
  useEffect(() => {
    runPrioritizationPipeline(false);
  }, []);

  const appendToChat = (sender: 'user' | 'agent', text: string) => {
    setChatLogs(prev => [...prev, { sender, text, timestamp: new Date() }]);
  };

  // Runs the mock prioritization logic client-side mirroring our backend prioritizer rules
  const runPrioritizationPipeline = async (verbose = true) => {
    setIsPipelineRunning(true);
    if (verbose) {
      appendToChat('user', 'Run Full Prioritization Pipeline');
      appendToChat('agent', 'Connecting to MCP Server... Fetching Gmail, Slack, Jira, Calendar, and GitHub notifications.');
    }

    // 1. Fetch from all sources
    const allEvents = mockCalendarEvents();
    const merged = [
      ...mockGmailNotifications,
      ...mockSlackNotifications,
      ...mockJiraNotifications,
      ...allEvents,
      ...mockGithubNotifications
    ];

    // 2. Build context
    const upcomingMeeting = allEvents.find(event => {
      const diff = new Date(event.timestamp).getTime() - new Date().getTime();
      return diff > 0 && diff <= 60 * 60 * 1000;
    }) || null;

    const context: UserContext = {
      activeProject: 'Project Phoenix',
      upcomingMeeting,
      keyCollaborators: ['Alice Chen', 'Bob Smith', 'David Miller', 'Sarah Jenkins']
    };

    // 3. Classify based on scoring rules
    const prioritized: Notification[] = merged.map(notif => {
      let tier: 'urgent_now' | 'normal' | 'fyi_only' = 'fyi_only';
      let reason = 'General update notification.';

      const isCollaborator = context.keyCollaborators.some(
        c => c.toLowerCase() === notif.sender.toLowerCase()
      );
      const referencesProject = 
        notif.title.toLowerCase().includes('phoenix') || 
        notif.snippet.toLowerCase().includes('phoenix');

      if (notif.source === 'calendar') {
        if (context.upcomingMeeting && context.upcomingMeeting.id === notif.id) {
          tier = 'urgent_now';
          reason = 'Starts within the next hour.';
        } else {
          tier = 'normal';
          reason = 'Scheduled meeting.';
        }
      } else if (notif.source === 'jira') {
        if (notif.rawMetadata?.action === 'due_date') {
          tier = 'urgent_now';
          reason = 'Action required: Task is due today.';
        } else if (notif.rawMetadata?.action === 'assigned') {
          tier = 'normal';
          reason = 'Jira ticket assigned to you.';
        } else {
          tier = 'normal';
          reason = isCollaborator ? 'Comment from key collaborator.' : 'Ticket comments update.';
        }
      } else if (notif.source === 'github') {
        if (notif.rawMetadata?.type === 'ci_failure') {
          tier = 'urgent_now';
          reason = 'CI pipeline failure on main branch.';
        } else if (notif.rawMetadata?.type === 'review_request') {
          tier = 'normal';
          reason = 'Pull Request review requested.';
        } else {
          tier = 'normal';
          reason = 'GitHub mention update.';
        }
      } else if (notif.source === 'slack') {
        const isDM = notif.rawMetadata?.channel === 'DM';
        const isMention = notif.rawMetadata?.isMention === true;

        if (isDM && isCollaborator) {
          tier = 'urgent_now';
          reason = 'Direct message from key collaborator.';
        } else if (isMention && referencesProject) {
          tier = 'urgent_now';
          reason = 'Mentioned in channel discussing active project.';
        } else if (isDM || isMention) {
          tier = 'normal';
          reason = isDM ? 'Slack direct message.' : 'Slack mention in channel.';
        } else {
          tier = 'fyi_only';
          reason = 'Slack channel update.';
        }
      } else if (notif.source === 'gmail') {
        if (notif.sender === 'security-alerts@company.com') {
          tier = 'urgent_now';
          reason = 'Critical security alert requiring action.';
        } else if (notif.sender === 'landlord@rentalgroup.com') {
          tier = 'normal';
          reason = 'Personal communication (lease renewal).';
        } else {
          tier = 'fyi_only';
          reason = 'Standard email alert.';
        }
      }

      return { ...notif, tier, reason };
    });

    // Simulate network delay
    setTimeout(() => {
      setNotifications(prioritized);
      setIsPipelineRunning(false);
      if (verbose) {
        appendToChat('agent', `Context analysis complete! Found active project "Project Phoenix". Prioritized ${prioritized.length} notifications: ${prioritized.filter(n => n.tier === 'urgent_now').length} Urgent Now, ${prioritized.filter(n => n.tier === 'normal').length} Normal, and ${prioritized.filter(n => n.tier === 'fyi_only').length} FYI.`);
      }
    }, 800);
  };

  const handleToolClick = (toolName: string) => {
    setSelectedTool(toolName);
    let output: any = null;

    switch (toolName) {
      case 'listConnectedAccounts':
        output = mockConnectedAccounts;
        break;
      case 'fetchGmailNotifications':
        output = mockGmailNotifications;
        break;
      case 'fetchSlackNotifications':
        output = mockSlackNotifications;
        break;
      case 'fetchJiraNotifications':
        output = mockJiraNotifications;
        break;
      case 'fetchCalendarEvents':
        output = mockCalendarEvents();
        break;
      case 'fetchGithubNotifications':
        output = mockGithubNotifications;
        break;
      case 'buildUserContext':
        const events = mockCalendarEvents();
        output = {
          activeProject: 'Project Phoenix',
          upcomingMeeting: events.find(e => {
            const diff = new Date(e.timestamp).getTime() - new Date().getTime();
            return diff > 0 && diff <= 60 * 60 * 1000;
          }) || null,
          keyCollaborators: ['Alice Chen', 'Bob Smith', 'David Miller', 'Sarah Jenkins']
        };
        break;
      case 'prioritizeNotifications':
        output = notifications;
        break;
      default:
        output = { error: 'Unknown tool' };
    }

    setToolOutput(output);
    appendToChat('user', `Execute MCP Tool: ${toolName}`);
    appendToChat('agent', `Invoked <code>${toolName}</code>. Returning response from MCP Server.`);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.trim();
    appendToChat('user', query);
    setInputText('');

    const lowerQuery = query.toLowerCase();
    setTimeout(() => {
      if (lowerQuery.includes('prioritize') || lowerQuery.includes('run') || lowerQuery.includes('dashboard')) {
        runPrioritizationPipeline(true);
      } else if (lowerQuery.includes('gmail') || lowerQuery.includes('email')) {
        handleToolClick('fetchGmailNotifications');
      } else if (lowerQuery.includes('slack')) {
        handleToolClick('fetchSlackNotifications');
      } else if (lowerQuery.includes('jira')) {
        handleToolClick('fetchJiraNotifications');
      } else if (lowerQuery.includes('calendar') || lowerQuery.includes('meeting')) {
        handleToolClick('fetchCalendarEvents');
      } else if (lowerQuery.includes('github') || lowerQuery.includes('pr')) {
        handleToolClick('fetchGithubNotifications');
      } else if (lowerQuery.includes('context')) {
        handleToolClick('buildUserContext');
      } else {
        appendToChat('agent', `I heard you say "${query}". You can run the prioritization engine by typing "prioritize" or clicking the glowing button on the top right.`);
      }
    }, 500);
  };

  const dismissCard = (id: string, sender: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    appendToChat('agent', `Notification from **${sender}** has been marked as resolved.`);
  };

  // Render variables
  const urgentList = notifications.filter(n => n.tier === 'urgent_now');
  const normalList = notifications.filter(n => n.tier === 'normal');
  const fyiList = notifications.filter(n => n.tier === 'fyi_only');

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'slack': return '💬';
      case 'gmail': return '✉️';
      case 'jira': return '📊';
      case 'github': return '🐙';
      case 'calendar': return '📅';
      default: return '🔔';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'slack': return '#e01e5a';
      case 'gmail': return '#ea4335';
      case 'jira': return '#0052cc';
      case 'github': return '#4b5563';
      case 'calendar': return '#4285f4';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#0b0f19',
      color: '#f3f4f6',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Banner Navigation */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 28px',
        backgroundColor: '#111827',
        borderBottom: '1px solid #1f2937',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🤖</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px', color: '#6366f1' }}>
              ANTIGRAVITY PRIORITIZER
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
              Next-Gen AI Workspace Notification Prioritization Agent
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => runPrioritizationPipeline(true)}
            disabled={isPipelineRunning}
            style={{
              padding: '10px 20px',
              backgroundColor: isPipelineRunning ? '#374151' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: isPipelineRunning ? 'not-allowed' : 'pointer',
              boxShadow: isPipelineRunning ? 'none' : '0 0 15px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isPipelineRunning ? '🔄 Prioritizing...' : '⚡ Run Prioritizer Pipeline'}
          </button>
        </div>
      </header>

      {/* Main Workspace split screen */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar: MCP Controls & Chat */}
        <aside style={{
          width: '400px',
          borderRight: '1px solid #1f2937',
          backgroundColor: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Section: MCP Server Info */}
          <div style={{ padding: '16px', borderBottom: '1px solid #1f2937' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔌 MCP Server Tools Registry
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'listConnectedAccounts',
                'fetchGmailNotifications',
                'fetchSlackNotifications',
                'fetchJiraNotifications',
                'fetchCalendarEvents',
                'fetchGithubNotifications',
                'buildUserContext',
                'prioritizeNotifications'
              ].map(tool => (
                <button
                  key={tool}
                  onClick={() => handleToolClick(tool)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    backgroundColor: selectedTool === tool ? 'rgba(99, 102, 241, 0.15)' : '#1e293b',
                    color: selectedTool === tool ? '#818cf8' : '#cbd5e1',
                    border: selectedTool === tool ? '1px solid #6366f1' : '1px solid #334155',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{tool}</span>
                  <span style={{ fontSize: '10px', opacity: 0.6 }}>▶ Run</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Agent Chat Logs */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#1e293b',
              borderBottom: '1px solid #1f2937',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#818cf8'
            }}>
              💬 AI Agent Chat Simulation
            </div>
            
            {/* Messages Display */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {chatLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: log.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: log.sender === 'user' ? '#6366f1' : '#1e293b',
                    color: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    borderTopRightRadius: log.sender === 'user' ? '2px' : '12px',
                    borderTopLeftRadius: log.sender === 'agent' ? '2px' : '12px',
                    fontSize: '13px',
                    lineHeight: '1.4',
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: log.text }} />
                  <div style={{
                    fontSize: '9px',
                    opacity: 0.5,
                    textAlign: log.sender === 'user' ? 'right' : 'left',
                    marginTop: '4px'
                  }}>
                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} style={{
              padding: '12px',
              borderTop: '1px solid #1f2937',
              backgroundColor: '#0b0f19',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask prioritizer to run or query tools..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                Send
              </button>
            </form>
          </div>
        </aside>

        {/* Right Section: Priority Board or Tool JSON Output */}
        <main style={{
          flex: 1,
          backgroundColor: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Tabs header */}
          <div style={{
            display: 'flex',
            backgroundColor: '#111827',
            borderBottom: '1px solid #1f2937',
          }}>
            <button
              onClick={() => setActiveTab('board')}
              style={{
                padding: '14px 24px',
                backgroundColor: activeTab === 'board' ? '#0f172a' : 'transparent',
                color: activeTab === 'board' ? '#818cf8' : '#9ca3af',
                border: 'none',
                borderBottom: activeTab === 'board' ? '2px solid #6366f1' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              📋 Live Dashboard Board
            </button>
            <button
              onClick={() => setActiveTab('json')}
              style={{
                padding: '14px 24px',
                backgroundColor: activeTab === 'json' ? '#0f172a' : 'transparent',
                color: activeTab === 'json' ? '#818cf8' : '#9ca3af',
                border: 'none',
                borderBottom: activeTab === 'json' ? '2px solid #6366f1' : 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              💻 Raw MCP JSON Viewer {selectedTool ? `(${selectedTool})` : ''}
            </button>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {activeTab === 'board' ? (
              /* Prioritizer Board View */
              <div>
                {/* Context Overview banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                  border: '1px solid #312e81',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Active Context
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
                      📂 Project: <span style={{ color: '#fbbf24' }}>Project Phoenix</span>
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                    <div>
                      <div style={{ opacity: 0.6, fontSize: '11px' }}>Key Collaborators</div>
                      <div style={{ fontWeight: '600', marginTop: '2px' }}>Alice, Bob, David, Sarah</div>
                    </div>
                    {mockCalendarEvents().length > 0 && (
                      <div>
                        <div style={{ opacity: 0.6, fontSize: '11px' }}>Upcoming Sync</div>
                        <div style={{ fontWeight: '600', color: '#ef4444', marginTop: '2px' }}>
                          📅 PHOENIX-89 Sync (In 40m)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* The 3 Columns Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                  alignItems: 'start',
                }}>
                  {/* 1. Urgent Now */}
                  <div style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    borderTop: '4px solid #ef4444',
                    padding: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                    }}>
                      <span style={{ color: '#f87171' }}>🔥 Urgent Now</span>
                      <span style={{
                        backgroundColor: '#7f1d1d',
                        color: '#fca5a5',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                      }}>{urgentList.length}</span>
                    </div>

                    <div style={{ minHeight: '100px' }}>
                      {urgentList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', opacity: 0.4, fontSize: '13px' }}>
                          No urgent items
                        </div>
                      ) : (
                        urgentList.map(notif => (
                          <div
                            key={notif.id}
                            style={{
                              backgroundColor: '#334155',
                              borderRadius: '8px',
                              padding: '12px',
                              marginBottom: '12px',
                              border: '1px solid #475569',
                              position: 'relative',
                            }}
                          >
                            <div style={{ display: 'flex', justifySelf: 'space-between', justifyItems: 'center', marginBottom: '6px' }}>
                              <span style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundColor: getSourceColor(notif.source),
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}>
                                {getSourceIcon(notif.source)} {notif.source}
                              </span>
                              <button
                                onClick={() => dismissCard(notif.id, notif.sender)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#9ca3af',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                }}
                                title="Resolve notification"
                              >
                                ✓
                              </button>
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>{notif.sender}</div>
                            <div style={{ fontWeight: '500', fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>{notif.title}</div>
                            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', lineHeight: '1.4' }}>{notif.snippet}</div>
                            <div style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              borderLeft: '3px solid #ef4444',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#fca5a5',
                            }}>
                              💡 {notif.reason}
                            </div>
                            {notif.accountEmail && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>📧 {notif.accountEmail}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 2. Normal Column */}
                  <div style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    borderTop: '4px solid #3b82f6',
                    padding: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                    }}>
                      <span style={{ color: '#60a5fa' }}>⚡ Normal</span>
                      <span style={{
                        backgroundColor: '#1e3a8a',
                        color: '#93c5fd',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                      }}>{normalList.length}</span>
                    </div>

                    <div style={{ minHeight: '100px' }}>
                      {normalList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', opacity: 0.4, fontSize: '13px' }}>
                          No normal items
                        </div>
                      ) : (
                        normalList.map(notif => (
                          <div
                            key={notif.id}
                            style={{
                              backgroundColor: '#334155',
                              borderRadius: '8px',
                              padding: '12px',
                              marginBottom: '12px',
                              border: '1px solid #475569',
                            }}
                          >
                            <div style={{ display: 'flex', justifySelf: 'space-between', justifyItems: 'center', marginBottom: '6px' }}>
                              <span style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundColor: getSourceColor(notif.source),
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}>
                                {getSourceIcon(notif.source)} {notif.source}
                              </span>
                              <button
                                onClick={() => dismissCard(notif.id, notif.sender)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#9ca3af',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                }}
                                title="Resolve notification"
                              >
                                ✓
                              </button>
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>{notif.sender}</div>
                            <div style={{ fontWeight: '500', fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>{notif.title}</div>
                            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', lineHeight: '1.4' }}>{notif.snippet}</div>
                            <div style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              borderLeft: '3px solid #3b82f6',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#93c5fd',
                            }}>
                              💡 {notif.reason}
                            </div>
                            {notif.accountEmail && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>📧 {notif.accountEmail}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 3. FYI Column */}
                  <div style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    borderTop: '4px solid #10b981',
                    padding: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                    }}>
                      <span style={{ color: '#34d399' }}>☕ FYI Only</span>
                      <span style={{
                        backgroundColor: '#064e3b',
                        color: '#6ee7b7',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                      }}>{fyiList.length}</span>
                    </div>

                    <div style={{ minHeight: '100px' }}>
                      {fyiList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', opacity: 0.4, fontSize: '13px' }}>
                          No FYI items
                        </div>
                      ) : (
                        fyiList.map(notif => (
                          <div
                            key={notif.id}
                            style={{
                              backgroundColor: '#334155',
                              borderRadius: '8px',
                              padding: '12px',
                              marginBottom: '12px',
                              border: '1px solid #475569',
                            }}
                          >
                            <div style={{ display: 'flex', justifySelf: 'space-between', justifyItems: 'center', marginBottom: '6px' }}>
                              <span style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundColor: getSourceColor(notif.source),
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}>
                                {getSourceIcon(notif.source)} {notif.source}
                              </span>
                              <button
                                onClick={() => dismissCard(notif.id, notif.sender)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#9ca3af',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                }}
                                title="Resolve notification"
                              >
                                ✓
                              </button>
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>{notif.sender}</div>
                            <div style={{ fontWeight: '500', fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>{notif.title}</div>
                            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px', lineHeight: '1.4' }}>{notif.snippet}</div>
                            <div style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              borderLeft: '3px solid #10b981',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#6ee7b7',
                            }}>
                              💡 {notif.reason}
                            </div>
                            {notif.accountEmail && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>📧 {notif.accountEmail}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* JSON Code Viewer */
              <div style={{
                backgroundColor: '#0b0f19',
                border: '1px solid #1f2937',
                borderRadius: '8px',
                padding: '20px',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#34d399',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {toolOutput ? (
                  <div>
                    <div style={{ color: '#818cf8', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #1f2937', paddingBottom: '6px' }}>
                      // Output response for: {selectedTool}
                    </div>
                    {JSON.stringify(toolOutput, null, 2)}
                  </div>
                ) : (
                  <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
                    Select an MCP tool from the sidebar to inspect its JSON response output here.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { Notification } from '../shared/notification.types.js';

export class JiraTools {
  @Tool({
    name: 'fetchJiraNotifications',
    description: 'Fetch recent Jira ticket updates (assignments, comments, and due dates). Returns a flattened list of notifications.',
    inputSchema: z.object({
      since: z.string().optional().describe('ISO 8601 timestamp. Only returns notifications created after this time.')
    })
  })
  async fetchJiraNotifications(input: any, ctx: ExecutionContext): Promise<Notification[]> {
    ctx.logger.info('Fetching Jira notifications', { since: input.since });

    let notifications: Notification[] = [
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

    if (input.since) {
      const sinceTime = new Date(input.since).getTime();
      if (!isNaN(sinceTime)) {
        notifications = notifications.filter(n => new Date(n.timestamp).getTime() > sinceTime);
      }
    }

    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return notifications;
  }
}

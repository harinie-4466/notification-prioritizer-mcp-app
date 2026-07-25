import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { Notification } from '../shared/notification.types.js';
import { ConnectedAccount } from './gmail.types.js';

export const MOCK_ACCOUNTS: ConnectedAccount[] = [
  { accountId: 'gmail_work', accountEmail: 'jane@company.com' },
  { accountId: 'gmail_personal', accountEmail: 'jane.personal@gmail.com' }
];

export class GmailTools {
  @Tool({
    name: 'listConnectedAccounts',
    description: 'Retrieve all connected Gmail accounts configured for the user.',
    inputSchema: z.object({})
  })
  async listConnectedAccounts(input: any, ctx: ExecutionContext): Promise<ConnectedAccount[]> {
    ctx.logger.info('Listing connected Gmail accounts');
    return MOCK_ACCOUNTS;
  }

  @Tool({
    name: 'fetchGmailNotifications',
    description: 'Fetch recent emails across all connected Gmail accounts. Returns a flattened list of notifications.',
    inputSchema: z.object({
      since: z.string().optional().describe('ISO 8601 timestamp. Only returns notifications created after this time.')
    })
  })
  async fetchGmailNotifications(input: any, ctx: ExecutionContext): Promise<Notification[]> {
    ctx.logger.info('Fetching Gmail notifications', { since: input.since });

    const mockEmails: Record<string, Omit<Notification, 'accountId' | 'accountEmail'>[]> = {
      gmail_work: [
        {
          id: 'gmail_work_1',
          source: 'gmail',
          sender: 'security-alerts@company.com',
          title: '[ACTION REQUIRED] Update your SSH keys',
          snippet: 'Please update your SSH keys by Friday to maintain access to internal repos.',
          timestamp: '2026-07-26T03:00:00Z',
          link: 'https://mail.google.com/mail/u/0/#inbox/1',
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
          rawMetadata: { priority: 'medium', labels: ['Work', 'Strategy'] }
        },
        {
          id: 'gmail_work_3',
          source: 'gmail',
          sender: 'hr-no-reply@company.com',
          title: 'Action: Submit Q2 Review Feedback',
          snippet: 'This is a reminder that the deadline for peer reviews is tomorrow afternoon.',
          timestamp: '2026-07-25T18:00:00Z',
          link: 'https://mail.google.com/mail/u/0/#inbox/3',
          rawMetadata: { priority: 'low', labels: ['Work', 'HR'] }
        }
      ],
      gmail_personal: [
        {
          id: 'gmail_personal_1',
          source: 'gmail',
          sender: 'landlord@rentalgroup.com',
          title: 'Lease Renewal Agreement Draft',
          snippet: 'Attached is the lease agreement for 2026-2027. Please sign and return it by end of the week.',
          timestamp: '2026-07-26T01:15:00Z',
          link: 'https://mail.google.com/mail/u/1/#inbox/1',
          rawMetadata: { priority: 'high', category: 'Personal' }
        },
        {
          id: 'gmail_personal_2',
          source: 'gmail',
          sender: 'newsletter@substack.com',
          title: 'The Future of AI Agents in Production',
          snippet: 'Weekly roundup of agentic architectures, state machines, and real-world execution environments.',
          timestamp: '2026-07-26T00:45:00Z',
          link: 'https://mail.google.com/mail/u/1/#inbox/2',
          rawMetadata: { priority: 'low', category: 'Newsletters' }
        },
        {
          id: 'gmail_personal_3',
          source: 'gmail',
          sender: 'netflix@info.netflix.com',
          title: 'New Season of your favorite show is out!',
          snippet: 'Start streaming the final season now on Netflix.',
          timestamp: '2026-07-25T20:00:00Z',
          link: 'https://mail.google.com/mail/u/1/#inbox/3',
          rawMetadata: { priority: 'low', category: 'Promotions' }
        }
      ]
    };

    let notifications: Notification[] = [];

    // Loop over all connected accounts and build the list
    for (const account of MOCK_ACCOUNTS) {
      const emails = mockEmails[account.accountId] || [];
      const accountNotifications = emails.map(email => ({
        ...email,
        accountId: account.accountId,
        accountEmail: account.accountEmail
      }));
      notifications.push(...accountNotifications);
    }

    // Filter by timestamp if since is provided
    if (input.since) {
      const sinceTime = new Date(input.since).getTime();
      if (!isNaN(sinceTime)) {
        notifications = notifications.filter(n => new Date(n.timestamp).getTime() > sinceTime);
      }
    }

    // Sort by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return notifications;
  }
}

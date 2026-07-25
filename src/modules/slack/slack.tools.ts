import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { Notification } from '../shared/notification.types.js';

export class SlackTools {
  @Tool({
    name: 'fetchSlackNotifications',
    description: 'Fetch recent Slack DMs, mentions, and channel messages. Returns a flattened list of notifications.',
    inputSchema: z.object({
      since: z.string().optional().describe('ISO 8601 timestamp. Only returns notifications created after this time.')
    })
  })
  async fetchSlackNotifications(input: any, ctx: ExecutionContext): Promise<Notification[]> {
    ctx.logger.info('Fetching Slack notifications', { since: input.since });

    let notifications: Notification[] = [
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
      },
      {
        id: 'slack_4',
        source: 'slack',
        sender: 'Charlie Davis',
        title: 'Mention in #product-launch',
        snippet: '@jane is the landing page copy ready? The marketing team needs it to start setting up the campaigns.',
        timestamp: '2026-07-26T01:45:00Z',
        link: 'https://slack.com/archives/C22222/p1720000003',
        accountId: 'default',
        accountEmail: null,
        rawMetadata: { channel: '#product-launch', isMention: true }
      },
      {
        id: 'slack_5',
        source: 'slack',
        sender: 'Slackbot',
        title: 'Reminder from Slackbot',
        snippet: 'Reminder: Submit your weekly status report by the end of today.',
        timestamp: '2026-07-25T17:00:00Z',
        link: 'https://slack.com/archives/D00000/p1720000004',
        accountId: 'default',
        accountEmail: null,
        rawMetadata: { channel: 'Slackbot', isMention: false }
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

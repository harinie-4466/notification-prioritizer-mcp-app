import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { Notification } from '../shared/notification.types.js';

export class CalendarTools {
  @Tool({
    name: 'fetchCalendarEvents',
    description: 'Fetch upcoming and recent calendar events. Returns a list of meetings in Notification format.',
    inputSchema: z.object({
      since: z.string().optional().describe('ISO 8601 timestamp. Only returns events starting after this time.')
    })
  })
  async fetchCalendarEvents(input: any, ctx: ExecutionContext): Promise<Notification[]> {
    ctx.logger.info('Fetching calendar events', { since: input.since });

    const now = new Date();

    // Meeting starting in 40 minutes (within the 30-60 min window)
    const m1Start = new Date(now.getTime() + 40 * 60 * 1000);
    const m1End = new Date(now.getTime() + 70 * 60 * 1000);

    // Past meeting (started 2 hours ago)
    const m2Start = new Date(now.getTime() - 120 * 60 * 1000);
    const m2End = new Date(now.getTime() - 90 * 60 * 1000);

    // Future meeting tomorrow
    const m3Start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    m3Start.setHours(10, 0, 0, 0);
    const m3End = new Date(m3Start.getTime() + 60 * 60 * 1000);

    let notifications: Notification[] = [
      {
        id: 'calendar_1',
        source: 'calendar',
        sender: 'David Miller',
        title: 'PHOENIX-89 Sync: Database Migration Review',
        snippet: 'Quick alignment on DB changes before we merge. Bring questions on backward compatibility.',
        timestamp: m1Start.toISOString(),
        link: 'https://meet.google.com/abc-defg-hij',
        accountId: 'default',
        accountEmail: null,
        rawMetadata: {
          endTime: m1End.toISOString(),
          organizer: 'David Miller',
          status: 'accepted'
        }
      },
      {
        id: 'calendar_2',
        source: 'calendar',
        sender: 'HR Team',
        title: 'Company All-Hands Q3 Review',
        snippet: 'Quarterly update on company roadmap, financial health, and team goals.',
        timestamp: m2Start.toISOString(),
        link: 'https://meet.google.com/xyz-uvwx-yza',
        accountId: 'default',
        accountEmail: null,
        rawMetadata: {
          endTime: m2End.toISOString(),
          organizer: 'HR Team',
          status: 'accepted'
        }
      },
      {
        id: 'calendar_3',
        source: 'calendar',
        sender: 'Sarah Jenkins',
        title: '1-on-1: Sarah & Jane',
        snippet: 'Bi-weekly sync to discuss career growth, project progress, and roadblocks.',
        timestamp: m3Start.toISOString(),
        link: 'https://meet.google.com/qwe-rtyu-iop',
        accountId: 'default',
        accountEmail: null,
        rawMetadata: {
          endTime: m3End.toISOString(),
          organizer: 'Sarah Jenkins',
          status: 'accepted'
        }
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

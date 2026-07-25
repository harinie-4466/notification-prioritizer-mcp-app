import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { Notification } from '../shared/notification.types.js';

export interface PrioritizedNotification extends Notification {
  tier: 'urgent_now' | 'normal' | 'fyi_only';
  reason: string;
}

const NotificationSchema = z.object({
  id: z.string(),
  source: z.enum(['slack', 'jira', 'github', 'gmail', 'calendar', 'pagerduty']),
  sender: z.string(),
  title: z.string(),
  snippet: z.string(),
  timestamp: z.string(),
  link: z.string(),
  accountId: z.string(),
  accountEmail: z.string().nullable(),
  rawMetadata: z.record(z.any()).optional()
});

const UserContextSchema = z.object({
  activeProject: z.string(),
  upcomingMeeting: NotificationSchema.nullable(),
  keyCollaborators: z.array(z.string())
});

export class PrioritizerTools {
  @Tool({
    name: 'prioritizeNotifications',
    description: 'Prioritize a list of notifications into Urgent, Normal, and FYI tiers based on the user\'s current work context.',
    inputSchema: z.object({
      notifications: z.array(NotificationSchema).describe('The list of notifications to prioritize across all sources.'),
      context: UserContextSchema.describe('The user\'s current work context.')
    })
  })
  @Widget('priority-dashboard')
  async prioritizeNotifications(input: any, ctx: ExecutionContext): Promise<PrioritizedNotification[]> {
    ctx.logger.info('Prioritizing notifications', { count: input.notifications.length });

    const notifications: Notification[] = input.notifications;
    const context = input.context;

    const prioritized: PrioritizedNotification[] = notifications.map(notif => {
      let tier: 'urgent_now' | 'normal' | 'fyi_only' = 'fyi_only';
      let reason = 'General notification.';

      const isCollaborator = context.keyCollaborators.some(
        (c: string) => c.toLowerCase() === notif.sender.toLowerCase()
      );
      const referencesProject = 
        notif.title.toLowerCase().includes(context.activeProject.toLowerCase()) || 
        notif.title.toLowerCase().includes('phoenix') || 
        notif.snippet.toLowerCase().includes(context.activeProject.toLowerCase()) ||
        notif.snippet.toLowerCase().includes('phoenix');

      // 1. Calendar
      if (notif.source === 'calendar') {
        const isUpcoming = context.upcomingMeeting && context.upcomingMeeting.id === notif.id;
        if (isUpcoming) {
          tier = 'urgent_now';
          reason = 'Starts within the next hour.';
        } else {
          tier = 'normal';
          reason = 'Scheduled meeting.';
        }
      }
      // 2. Jira
      else if (notif.source === 'jira') {
        if (notif.rawMetadata?.action === 'due_date') {
          tier = 'urgent_now';
          reason = 'Action required: Task is due today.';
        } else if (notif.rawMetadata?.action === 'assigned') {
          tier = 'normal';
          reason = 'Jira ticket assigned to you.';
        } else if (notif.rawMetadata?.action === 'comment') {
          if (isCollaborator) {
            tier = 'normal';
            reason = 'Comment from a key collaborator.';
          } else {
            tier = 'normal';
            reason = 'New comment on a ticket.';
          }
        }
      }
      // 3. GitHub
      else if (notif.source === 'github') {
        if (notif.rawMetadata?.type === 'ci_failure') {
          if (notif.snippet.includes('branch main') || notif.snippet.includes('branch \'main\'')) {
            tier = 'urgent_now';
            reason = 'CI pipeline failure on main branch.';
          } else {
            tier = 'normal';
            reason = 'CI pipeline failure on branch.';
          }
        } else if (notif.rawMetadata?.type === 'review_request') {
          tier = 'normal';
          reason = 'Pull Request review request.';
        } else if (notif.rawMetadata?.type === 'mention') {
          if (isCollaborator && referencesProject) {
            tier = 'urgent_now';
            reason = 'GitHub mention by key collaborator on active project.';
          } else {
            tier = 'normal';
            reason = 'GitHub mention in an issue.';
          }
        }
      }
      // 4. Slack
      else if (notif.source === 'slack') {
        const isDM = notif.rawMetadata?.channel === 'DM';
        const isMention = notif.rawMetadata?.isMention === true;

        if (isDM && isCollaborator) {
          tier = 'urgent_now';
          reason = 'Direct message from a key collaborator.';
        } else if (isMention && referencesProject) {
          tier = 'urgent_now';
          reason = 'Mentioned in channel discussing active project.';
        } else if (isMention && isCollaborator) {
          tier = 'urgent_now';
          reason = 'Mentioned in channel by key collaborator.';
        } else if (isDM || isMention) {
          tier = 'normal';
          reason = isDM ? 'Slack direct message.' : 'Slack mention in channel.';
        } else {
          tier = 'fyi_only';
          reason = 'Channel update message.';
        }
      }
      // 5. Gmail
      else if (notif.source === 'gmail') {
        if (notif.sender === 'security-alerts@company.com') {
          tier = 'urgent_now';
          reason = 'Critical security alert requiring action.';
        } else if (notif.sender === 'landlord@rentalgroup.com') {
          tier = 'normal';
          reason = 'Important personal email (lease renewal).';
        } else if (isCollaborator) {
          tier = 'normal';
          reason = 'Email from a key collaborator.';
        } else {
          tier = 'fyi_only';
          reason = 'Standard newsletter or email alert.';
        }
      }

      return {
        ...notif,
        tier,
        reason
      };
    });

    return prioritized;
  }
}

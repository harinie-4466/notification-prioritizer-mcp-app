import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { Notification } from '../shared/notification.types.js';

export class GithubTools {
  @Tool({
    name: 'fetchGithubNotifications',
    description: 'Fetch recent GitHub notifications (PR review requests, CI failures, and mentions). Returns a flattened list of notifications.',
    inputSchema: z.object({
      since: z.string().optional().describe('ISO 8601 timestamp. Only returns notifications created after this time.')
    })
  })
  async fetchGithubNotifications(input: any, ctx: ExecutionContext): Promise<Notification[]> {
    ctx.logger.info('Fetching GitHub notifications', { since: input.since });

    let notifications: Notification[] = [
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
      },
      {
        id: 'github_3',
        source: 'github',
        sender: 'Alice Chen',
        title: 'Mention in issue #88: Database performance bottleneck',
        snippet: '@jane could you take a look at this query execution plan? The user profiles fetch query is taking over 500ms.',
        timestamp: '2026-07-26T01:50:00Z',
        link: 'https://github.com/company/project-phoenix/issues/88',
        accountId: 'default',
        accountEmail: null,
        rawMetadata: { repo: 'company/project-phoenix', issueNumber: 88, type: 'mention' }
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

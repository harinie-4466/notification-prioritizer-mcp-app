import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { CalendarTools } from '../calendar/calendar.tools.js';
import { Notification } from '../shared/notification.types.js';

export interface UserContext {
  activeProject: string;
  upcomingMeeting: Notification | null;
  keyCollaborators: string[];
}

export class ContextTools {
  private calendarTools = new CalendarTools();

  @Tool({
    name: 'buildUserContext',
    description: 'Compile context about the user\'s current work state, including active project, upcoming meetings within the hour, and key collaborators.',
    inputSchema: z.object({})
  })
  async buildUserContext(input: any, ctx: ExecutionContext): Promise<UserContext> {
    ctx.logger.info('Building user context');

    const now = new Date();

    // Call calendar tools to get upcoming meetings
    const calendarEvents = await this.calendarTools.fetchCalendarEvents({}, ctx);

    // Find a meeting starting within the next hour
    const upcomingMeeting = calendarEvents.find(event => {
      const eventTime = new Date(event.timestamp).getTime();
      const diffMs = eventTime - now.getTime();
      return diffMs > 0 && diffMs <= 60 * 60 * 1000;
    }) || null;

    return {
      activeProject: 'Project Phoenix',
      upcomingMeeting,
      keyCollaborators: ['Alice Chen', 'Bob Smith', 'David Miller', 'Sarah Jenkins']
    };
  }
}

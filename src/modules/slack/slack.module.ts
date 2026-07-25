import { Module } from '@nitrostack/core';
import { SlackTools } from './slack.tools.js';

@Module({
  name: 'slack',
  description: 'Slack notifications module',
  controllers: [SlackTools]
})
export class SlackModule {}

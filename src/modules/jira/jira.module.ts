import { Module } from '@nitrostack/core';
import { JiraTools } from './jira.tools.js';

@Module({
  name: 'jira',
  description: 'Jira notifications module',
  controllers: [JiraTools]
})
export class JiraModule {}

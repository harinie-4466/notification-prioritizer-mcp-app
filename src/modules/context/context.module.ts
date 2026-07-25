import { Module } from '@nitrostack/core';
import { ContextTools } from './context.tools.js';

@Module({
  name: 'context',
  description: 'Context aggregation module',
  controllers: [ContextTools]
})
export class ContextModule {}

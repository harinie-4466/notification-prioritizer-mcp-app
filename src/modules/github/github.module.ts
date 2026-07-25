import { Module } from '@nitrostack/core';
import { GithubTools } from './github.tools.js';

@Module({
  name: 'github',
  description: 'GitHub notifications module',
  controllers: [GithubTools]
})
export class GithubModule {}

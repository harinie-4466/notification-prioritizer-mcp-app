import { Module } from '@nitrostack/core';
import { GmailTools } from './gmail.tools.js';

@Module({
  name: 'gmail',
  description: 'Gmail notifications and accounts module',
  controllers: [GmailTools]
})
export class GmailModule {}

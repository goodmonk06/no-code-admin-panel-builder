#!/usr/bin/env node

import { Command } from 'commander'
import { version } from '../../package.json'
import { seedCommand } from './commands/seed'
import { migrateCommand } from './commands/migrate'
import { healthCommand } from './commands/health'
import { metricsCommand } from './commands/metrics'

const program = new Command()

program
  .name('admin-panel-cli')
  .description('CLI tools for No-Code Admin Panel Builder')
  .version(version)

// Seed command
program
  .command('seed')
  .description('Seed the database with demo data')
  .option('-c, --clear', 'Clear existing data before seeding')
  .action(seedCommand)

// Migrate command
program
  .command('migrate')
  .description('Run database migrations')
  .option('-r, --reset', 'Reset database before migrating')
  .action(migrateCommand)

// Health check command
program
  .command('health')
  .description('Check system health and connectivity')
  .action(healthCommand)

// Metrics command
program
  .command('metrics')
  .description('Display system metrics')
  .option('-r, --reset', 'Reset metrics after displaying')
  .action(metricsCommand)

program.parse()

import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Clusters table - needs to be defined first for foreign key reference
export const clusters = sqliteTable('clusters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  size: integer('size').default(0),
  xPosition: real('x_position'),
  yPosition: real('y_position'),
  color: text('color'),
  createdAt: text('created_at').notNull(),
});

// Feedback table
export const feedback = sqliteTable('feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  source: text('source').notNull(),
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  clusterId: integer('cluster_id').references(() => clusters.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// SwarmScores table
export const swarmScores = sqliteTable('swarm_scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  feedbackId: integer('feedback_id').references(() => feedback.id).notNull(),
  agentType: text('agent_type').notNull(),
  score: real('score'),
  reasoning: text('reasoning'),
  createdAt: text('created_at').notNull(),
});

// TopPriorities table
export const topPriorities = sqliteTable('top_priorities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  feedbackId: integer('feedback_id').references(() => feedback.id).notNull(),
  rank: integer('rank').notNull(),
  consensusScore: real('consensus_score').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
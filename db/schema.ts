import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const exercises = sqliteTable('exercises', {
 id: text('id').primaryKey(), userId: text('user_id').notNull(), name: text('name').notNull(),
 day: text('day').notNull(), sets: integer('sets').notNull(), reps: integer('reps').notNull(),
 video: text('video').notNull().default(''), notes: text('notes').notNull().default(''),
 completed: integer('completed',{mode:'boolean'}).notNull().default(false), createdAt: text('created_at').notNull()
},t=>[index('exercises_user_idx').on(t.userId)]);
export const users = sqliteTable('users', {
 id:text('id').primaryKey(), email:text('email').notNull(), name:text('name').notNull(),
 firstSeen:text('first_seen').notNull(),lastSeen:text('last_seen').notNull()
},t=>[index('users_last_seen_idx').on(t.lastSeen)]);
export const bodyProfiles=sqliteTable('body_profiles',{userId:text('user_id').primaryKey(),data:text('data').notNull(),updatedAt:text('updated_at').notNull()});
export const workoutProgress=sqliteTable('workout_progress',{id:text('id').primaryKey(),userId:text('user_id').notNull(),exerciseId:text('exercise_id').notNull(),date:text('date').notNull(),completedSets:integer('completed_sets').notNull().default(0),updatedAt:text('updated_at').notNull()},t=>[index('progress_user_date_idx').on(t.userId,t.date)]);
export const planImports=sqliteTable('plan_imports',{id:text('id').primaryKey(),userId:text('user_id').notNull(),createdAt:text('created_at').notNull()});
export const planRequests=sqliteTable('plan_requests',{id:text('id').primaryKey(),userId:text('user_id').notNull(),week:text('week').notNull(),profile:text('profile').notNull(),status:text('status').notNull().default('pending'),answer:text('answer').notNull().default(''),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()},t=>[index('requests_user_idx').on(t.userId),index('requests_status_idx').on(t.status)]);
export const setLogs=sqliteTable('set_logs',{id:text('id').primaryKey(),userId:text('user_id').notNull(),exerciseId:text('exercise_id').notNull(),name:text('name').notNull(),day:text('day').notNull(),date:text('date').notNull(),setNumber:integer('set_number').notNull(),weight:text('weight').notNull(),reps:integer('reps').notNull(),effort:integer('effort').notNull(),createdAt:text('created_at').notNull()},t=>[index('set_logs_user_date_idx').on(t.userId,t.date)]);
export const sessionFeedback=sqliteTable('session_feedback',{id:text('id').primaryKey(),userId:text('user_id').notNull(),date:text('date').notNull(),day:text('day').notNull(),difficulty:integer('difficulty').notNull(),pain:integer('pain',{mode:'boolean'}).notNull(),notes:text('notes').notNull(),createdAt:text('created_at').notNull()},t=>[index('feedback_user_date_idx').on(t.userId,t.date)]);
export const reviewedPlans=sqliteTable('reviewed_plans',{id:text('id').primaryKey(),requestId:text('request_id').notNull(),userId:text('user_id').notNull(),moves:text('moves').notNull(),createdAt:text('created_at').notNull()},t=>[index('reviewed_plans_user_idx').on(t.userId)]);

export const authAccounts=sqliteTable('auth_accounts',{userId:text('user_id').primaryKey(),email:text('email').notNull().unique(),passwordHash:text('password_hash').notNull(),role:text('role').notNull().default('user'),createdAt:text('created_at').notNull()});
export const authSessions=sqliteTable('auth_sessions',{tokenHash:text('token_hash').primaryKey(),userId:text('user_id').notNull().references(()=>authAccounts.userId,{onDelete:'cascade'}),expiresAt:integer('expires_at').notNull()},t=>[index('auth_sessions_user_idx').on(t.userId)]);
export const authLimits=sqliteTable('auth_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),resetAt:integer('reset_at').notNull()});
// OAuth tables are defined by 0007_google_auth.sql; their composite key is managed by that migration.


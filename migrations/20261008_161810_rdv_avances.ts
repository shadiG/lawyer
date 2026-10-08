import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`settings_availability_weekdays\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_availability_weekdays_order_idx\` ON \`settings_availability_weekdays\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`settings_availability_weekdays_parent_idx\` ON \`settings_availability_weekdays\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_availability_closed_dates\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`date\` text NOT NULL,
  	\`reason\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_availability_closed_dates_order_idx\` ON \`settings_availability_closed_dates\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_availability_closed_dates_parent_id_idx\` ON \`settings_availability_closed_dates\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`slot\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`message_to_client\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`notify_client\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`notified_at\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`notified_status\` text;`)
  await db.run(sql`ALTER TABLE \`bookings\` ADD \`notify_error\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`availability_min_notice_days\` numeric DEFAULT 1;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`availability_days_shown\` numeric DEFAULT 12;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`settings_availability_weekdays\`;`)
  await db.run(sql`DROP TABLE \`settings_availability_closed_dates\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`slot\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`message_to_client\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`notify_client\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`notified_at\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`notified_status\`;`)
  await db.run(sql`ALTER TABLE \`bookings\` DROP COLUMN \`notify_error\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`availability_min_notice_days\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`availability_days_shown\`;`)
}

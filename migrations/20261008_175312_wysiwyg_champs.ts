import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`practices\` ADD \`body\` text;`)
  await db.run(sql`ALTER TABLE \`home_steps\` ADD \`body\` text;`)
  await db.run(sql`ALTER TABLE \`home_fees_items\` ADD \`body\` text;`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`hero_lead_rich\` text;`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`about_body\` text;`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`fees_lead_rich\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`practices\` DROP COLUMN \`body\`;`)
  await db.run(sql`ALTER TABLE \`home_steps\` DROP COLUMN \`body\`;`)
  await db.run(sql`ALTER TABLE \`home_fees_items\` DROP COLUMN \`body\`;`)
  await db.run(sql`ALTER TABLE \`home\` DROP COLUMN \`hero_lead_rich\`;`)
  await db.run(sql`ALTER TABLE \`home\` DROP COLUMN \`about_body\`;`)
  await db.run(sql`ALTER TABLE \`home\` DROP COLUMN \`fees_lead_rich\`;`)
}

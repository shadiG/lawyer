import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`home_hero_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_hero_highlights_order_idx\` ON \`home_hero_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_hero_highlights_parent_id_idx\` ON \`home_hero_highlights\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`practices\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`practices_image_idx\` ON \`practices\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_card_filename\` text;`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`home_hero_highlights\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_practices\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text DEFAULT 'criminal' NOT NULL,
  	\`text\` text NOT NULL,
  	\`order\` numeric DEFAULT 10,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_practices\`("id", "title", "icon", "text", "order", "updated_at", "created_at") SELECT "id", "title", "icon", "text", "order", "updated_at", "created_at" FROM \`practices\`;`)
  await db.run(sql`DROP TABLE \`practices\`;`)
  await db.run(sql`ALTER TABLE \`__new_practices\` RENAME TO \`practices\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`practices_updated_at_idx\` ON \`practices\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`practices_created_at_idx\` ON \`practices\` (\`created_at\`);`)
  await db.run(sql`DROP INDEX \`media_sizes_card_sizes_card_filename_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_card_filename\`;`)
}

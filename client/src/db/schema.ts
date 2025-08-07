import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const timestamps = {
    updated_at: text('updated_at').default(sql`(current_timestamp)`),
    created_at: text('created_at').default(sql`(current_timestamp)`).notNull(),
    deleted_at: text('deleted_at').default(sql`(current_timestamp)`),
}

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name'),
    walletAddress: text('wallet_address'),
    email: text('email').unique(),
    userName: text('user_name'),
    bio: text('bio'),
    ...timestamps
});
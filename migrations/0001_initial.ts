import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("user")
        .addColumn("id", "uuid", c =>
            c.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn("telegram", "text", c => c.notNull().unique())
        .addColumn("token", "text", c => c.notNull().unique())
        .addColumn("chatId", "text", c => c.notNull().unique())
        .execute();
    await db.schema
        .createTable("note")
        .addColumn("id", "uuid", c =>
            c.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn("userId", "uuid", c => c.references("user.id"))
        .addColumn("header", "text", c => c.notNull())
        .addColumn("content", "text", c => c.notNull())
        .addColumn("createdAt", "timestamp", c =>
            c.notNull().defaultTo(sql`NOW()`)
        )
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    const tables = ["note", "user"];
    await Promise.all(
        tables.map(t => db.schema.dropTable(t).ifExists().execute())
    );
}

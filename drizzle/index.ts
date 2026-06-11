import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Переиспользуем pool между hot-reload'ами в dev
const globalForDb = globalThis as unknown as { pool: Pool | undefined };

export const pool =
	globalForDb.pool ??
	new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 10,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 10_000,
		// SSL нужен только для удалённой БД; для localhost-подключения он выключен.
		ssl: process.env.DATABASE_SSL === "true",
	});

if (process.env.NODE_ENV !== "production") {
	globalForDb.pool = pool;
}

export const db = drizzle(pool, {
	schema,
	logger: false,
	casing: "snake_case",
});

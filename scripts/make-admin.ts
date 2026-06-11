/**
 * Назначает пользователя администратором по email.
 * Использование: pnpm admin:grant user@example.com
 */
import { eq } from "drizzle-orm";
import { db, pool } from "../drizzle";
import { user } from "../drizzle/schema";

async function main() {
	const email = process.argv[2]?.trim().toLowerCase();
	if (!email) {
		console.error("Использование: pnpm admin:grant <email>");
		process.exit(1);
	}

	const updated = await db
		.update(user)
		.set({ role: "admin", updatedAt: new Date() })
		.where(eq(user.email, email))
		.returning({ id: user.id, email: user.email });

	if (updated.length === 0) {
		console.error(`Пользователь с email «${email}» не найден.`);
		process.exit(1);
	}

	console.log(`Готово: ${updated[0].email} теперь администратор.`);
	await pool.end();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

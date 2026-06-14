import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getWalletState } from "@/lib/wallet/service";

/**
 * Текущее состояние кошелька (баланс + история операций). Клиент перечитывает
 * его, когда баланс мог измениться вне обычного потока — например, после
 * автовозврата за неудавшийся анализ (возврат происходит в фоне).
 */
export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
	}

	const wallet = await getWalletState(session.user.id);
	return NextResponse.json(wallet);
}

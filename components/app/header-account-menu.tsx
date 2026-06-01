"use client";

import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";
import { HEADER_SCALE } from "@/lib/app/header-scale";
import { MOCK_ACCOUNT } from "@/lib/wallet/mock-data";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Mail, User, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const DROPDOWN_TRANSITION = { duration: 0.15 } as const;

const BTN =
	"cursor-pointer border border-stone-700/80 bg-stone-900/90 transition hover:border-stone-600 hover:bg-stone-800/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40";

const PANEL =
	"absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-stone-700/80 bg-stone-900 shadow-2xl shadow-black/50 ring-1 ring-white/5";

const MENU_ROW =
	"flex w-full cursor-pointer items-center gap-3 border-b border-stone-800/80 px-4 py-2.5 text-left text-sm transition last:border-0 hover:bg-stone-800/60";

const MENU_ICON =
	"flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-800";

function formatMemberSince(iso: string) {
	return new Intl.DateTimeFormat("ru-RU", {
		month: "long",
		year: "numeric",
	}).format(new Date(iso));
}

export function accountInitials(): string {
	const local = MOCK_ACCOUNT.email.split("@")[0];
	return (local[0] ?? "?").toUpperCase();
}

function providerLabel() {
	return MOCK_ACCOUNT.provider === "google" ? "Google" : "Email";
}

type AccountMenuDropdownProps = {
	menuId: string;
	onClose: () => void;
	balanceOnTrigger?: boolean;
	showBalance?: boolean;
	balance?: number;
	onTopUp?: () => void;
};

function EmailHeader() {
	return (
		<div className="border-b border-stone-800/80 px-4 py-2.5">
			<p className="truncate text-sm font-medium text-stone-100">
				{MOCK_ACCOUNT.email}
			</p>
			<p className="mt-0.5 text-xs text-stone-500">
				{providerLabel()} · с {formatMemberSince(MOCK_ACCOUNT.memberSince)}
			</p>
		</div>
	);
}

function BalanceBlock({
	balance,
	onTopUp,
	onClose,
}: {
	balance: number;
	onTopUp?: () => void;
	onClose: () => void;
}) {
	return (
		<div className="border-b border-stone-800/80 px-4 py-2.5">
			<p className="text-xs text-stone-500">Баланс</p>
			<p className="mt-0.5 text-lg font-bold tabular-nums text-stone-50">
				{balance} ₽
			</p>
			{onTopUp ? (
				<button
					type="button"
					role="menuitem"
					onClick={() => {
						onClose();
						onTopUp();
					}}
					className="mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-stone-700 bg-stone-950/60 px-2.5 py-1.5 text-xs font-medium text-stone-300 transition hover:border-stone-600 hover:bg-stone-800 hover:text-stone-100"
				>
					<Wallet className="size-3.5 text-amber-400" />
					Пополнить
				</button>
			) : null}
		</div>
	);
}

function MenuActions({
	onClose,
	onTopUp,
	onLogout,
}: {
	onClose: () => void;
	onTopUp?: () => void;
	onLogout: () => void;
}) {
	return (
		<>
			{onTopUp ? (
				<button
					type="button"
					role="menuitem"
					onClick={() => {
						onClose();
						onTopUp();
					}}
					className={MENU_ROW}
				>
					<span className={`${MENU_ICON} text-amber-400`}>
						<Wallet className="size-4" />
					</span>
					<span className="font-medium text-stone-100">Пополнить баланс</span>
				</button>
			) : null}
			<button
				type="button"
				role="menuitem"
				onClick={onLogout}
				className={`group ${MENU_ROW}`}
			>
				<span
					className={`${MENU_ICON} text-stone-400 transition group-hover:text-red-400/90`}
				>
					<LogOut className="size-4" />
				</span>
				<span className="text-stone-400 transition group-hover:text-red-300/85">
					Выйти
				</span>
			</button>
		</>
	);
}

function AccountMenuDropdownContent({
	onClose,
	balanceOnTrigger = false,
	showBalance = false,
	balance = 0,
	onTopUp,
}: Omit<AccountMenuDropdownProps, "menuId">) {
	const router = useRouter();
	const showBalanceBlock = showBalance && !balanceOnTrigger;

	const onLogout = () => {
		onClose();
		router.push("/login");
	};

	return (
		<>
			<EmailHeader />
			{showBalanceBlock ? (
				<BalanceBlock balance={balance} onTopUp={onTopUp} onClose={onClose} />
			) : null}
			<MenuActions
				onClose={onClose}
				onTopUp={balanceOnTrigger ? onTopUp : undefined}
				onLogout={onLogout}
			/>
		</>
	);
}

function AnimatedAccountMenuPanel({
	menuId,
	open,
	children,
}: {
	menuId: string;
	open: boolean;
	children: ReactNode;
}) {
	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					id={menuId}
					role="menu"
					initial={{ opacity: 0, y: 6, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 4, scale: 0.98 }}
					transition={DROPDOWN_TRANSITION}
					className={PANEL}
				>
					{children}
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}

export function useAccountMenu() {
	const menuId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		function onPointerDown(e: PointerEvent) {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		window.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return {
		menuId,
		rootRef,
		open,
		toggle: () => setOpen((v) => !v),
		close: () => setOpen(false),
	};
}

type MenuShellProps = {
	trigger: ReactNode;
	balanceOnTrigger?: boolean;
	ariaLabel?: string;
};

export function AccountMenuShell({
	trigger,
	balanceOnTrigger = true,
	ariaLabel = "Меню аккаунта",
}: MenuShellProps) {
	const { balance, openWallet } = useIdeasDemo();
	const { menuId, rootRef, open, toggle, close } = useAccountMenu();

	return (
		<div
			ref={rootRef}
			className="group/account relative"
			data-state={open ? "open" : "closed"}
		>
			<button
				type="button"
				onClick={toggle}
				aria-expanded={open}
				aria-haspopup="menu"
				aria-controls={menuId}
				aria-label={ariaLabel}
				className="contents"
			>
				{trigger}
			</button>
			<AnimatedAccountMenuPanel menuId={menuId} open={open}>
				<AccountMenuDropdownContent
					onClose={close}
					balanceOnTrigger={balanceOnTrigger}
					balance={balance}
					onTopUp={openWallet}
				/>
			</AnimatedAccountMenuPanel>
		</div>
	);
}

export function AccountEmailButton() {
	const { menuId, rootRef, open, toggle, close } = useAccountMenu();

	return (
		<div ref={rootRef} className="relative">
			<button
				type="button"
				onClick={toggle}
				aria-expanded={open}
				aria-haspopup="menu"
				aria-controls={menuId}
				className={`flex max-w-44 items-center gap-1.5 rounded-xl ${BTN} font-medium text-stone-200 sm:max-w-52 ${HEADER_SCALE.balance}`}
			>
				<Mail className={`${HEADER_SCALE.icon} shrink-0 text-stone-400`} />
				<span className="hidden min-w-0 truncate text-sm sm:inline">
					{MOCK_ACCOUNT.email}
				</span>
			</button>
			<AnimatedAccountMenuPanel menuId={menuId} open={open}>
				<AccountMenuDropdownContent onClose={close} />
			</AnimatedAccountMenuPanel>
		</div>
	);
}

export function AccountIconButton({ round = false }: { round?: boolean }) {
	return (
		<AccountMenuShell
			ariaLabel="Аккаунт"
			trigger={
				<span
					className={`flex items-center justify-center text-stone-300 ${BTN} ${
						round
							? "size-9 rounded-full sm:size-10"
							: `rounded-xl ${HEADER_SCALE.balance}`
					}`}
				>
					<User className={HEADER_SCALE.icon} />
				</span>
			}
		/>
	);
}

export function InitialsAvatar({ size = "md" }: { size?: "sm" | "md" }) {
	const dim = size === "sm" ? "size-8 text-xs" : "size-9 text-sm";
	return (
		<span
			className={`flex shrink-0 items-center justify-center rounded-full bg-stone-800 font-semibold text-amber-200/90 ring-1 ring-stone-600/80 ${dim}`}
		>
			{accountInitials()}
		</span>
	);
}

"use client";

import { TicketCardItem } from "@/components/support/ticket-list-items";
import { SupportHeader } from "@/components/support/support-header";
import { useSupport } from "@/components/support/support-provider";
import { motion } from "framer-motion";
import Link from "next/link";

export function SupportInbox() {
	const { tickets, viewedIds } = useSupport();

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28 }}
			className="w-full space-y-6 pb-8"
		>
			<SupportHeader />

			{tickets.length === 0 ? (
				<div className="rounded-3xl border border-dashed border-stone-700 bg-stone-900/20 px-6 py-12 text-center">
					<p className="text-sm text-stone-500">Обращений пока нет</p>
					<Link
						href="/app/support/new"
						className="mt-4 inline-flex text-sm font-medium text-amber-400/90 hover:text-amber-300"
					>
						Создать обращение
					</Link>
				</div>
			) : (
				<ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{tickets.map((ticket) => (
						<TicketCardItem
							key={ticket.id}
							ticket={ticket}
							viewedIds={viewedIds}
						/>
					))}
				</ul>
			)}
		</motion.div>
	);
}

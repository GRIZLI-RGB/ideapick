"use client";

import { TicketThreadPanel } from "@/components/support/ticket-thread-panel";
import { useSupportDemo } from "@/components/support/support-demo-provider";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type TicketThreadProps = {
	ticketId: string;
};

export function TicketThread({ ticketId }: TicketThreadProps) {
	const { getTicket } = useSupportDemo();
	const ticket = getTicket(ticketId);

	if (!ticket) {
		return (
			<div className="w-full py-12 text-center">
				<p className="text-stone-500">Обращение не найдено</p>
				<Link
					href="/app/support"
					className="mt-4 inline-block text-sm text-amber-400/90 hover:text-amber-300"
				>
					К списку
				</Link>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28 }}
			className="w-full space-y-4 pb-8"
		>
			<Link
				href="/app/support"
				className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-1 py-1 text-sm text-stone-500 transition hover:text-stone-300"
			>
				<ArrowLeft className="size-4" />
				К списку
			</Link>
			<TicketThreadPanel ticket={ticket} />
		</motion.div>
	);
}

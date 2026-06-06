"use client";

import { ErrorPage } from "@/components/error/error-page";
import { useEffect } from "react";

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return <ErrorPage onReset={reset} />;
}

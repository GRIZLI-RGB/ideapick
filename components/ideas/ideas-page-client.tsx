"use client";

import { useEffect } from "react";
import { IdeasPage } from "@/components/ideas/ideas-page";
import { useIdeasDemo } from "@/components/ideas/ideas-demo-provider";

function StartEmptyOnMount() {
	const { resetForEmptyDemo } = useIdeasDemo();
	useEffect(() => {
		resetForEmptyDemo();
	}, [resetForEmptyDemo]);
	return null;
}

type IdeasPageClientProps = {
	startEmpty?: boolean;
};

export function IdeasPageClient({ startEmpty }: IdeasPageClientProps) {
	return (
		<>
			{startEmpty ? <StartEmptyOnMount /> : null}
			<IdeasPage />
		</>
	);
}

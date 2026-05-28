"use client";

import { AddIdeaMenu } from "@/components/ideas/add-idea-menu";
import { IdeasFilterMenu } from "@/components/ideas/ideas-filter-menu";
import { IdeasPageTitle } from "@/components/ideas/ideas-page-title";

export function IdeasToolbar() {
	return (
		<div className="flex flex-wrap items-end justify-between gap-3">
			<IdeasPageTitle />
			<div className="flex shrink-0 items-center gap-2">
				<IdeasFilterMenu />
				<AddIdeaMenu />
			</div>
		</div>
	);
}

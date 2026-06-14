import { PromptEditor } from "@/components/admin/prompt-editor";
import { listTemplates } from "@/lib/llm/prompt-service";
import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage() {
	const templates = await listTemplates();

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-50 sm:text-3xl">
					<ScrollText className="size-7 text-amber-400/90 sm:size-8" />
					Промпты
				</h1>
				<p className="text-sm text-stone-500">
					Настройки запроса к нейросети для анализа идей. Активный шаблон по
					ключу используется при генерации отчёта.
				</p>
			</div>

			<div className="space-y-6">
				{templates.map((t) => (
					<PromptEditor key={t.id} template={t} />
				))}
			</div>
		</div>
	);
}

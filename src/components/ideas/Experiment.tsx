'use client';

import { RotateCcw } from 'lucide-react';
import { useId, type ReactNode } from 'react';

export const experimentButton = 'min-h-10 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted disabled:hover:bg-background';
export const primaryExperimentButton = `${experimentButton} border-emerald-700 bg-emerald-800 text-white hover:bg-emerald-900 dark:border-emerald-400 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200`;

export function Experiment({ title, description, onReset, children }: {
	title: string;
	description: string;
	onReset: () => void;
	children: ReactNode;
}) {
	const id = useId();
	return (
		<section aria-labelledby={id} className="idea-widget not-prose overflow-hidden rounded-md border border-border bg-background/80">
			<header className="border-b border-border px-4 py-4 sm:px-5">
				<div className="flex items-start justify-between gap-4">
					<h3 id={id} className="text-sm font-medium leading-6">{title}</h3>
					<button type="button" onClick={onReset} className="-mt-1 -mr-2 inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded px-2 text-xs text-muted-foreground hover:text-foreground" aria-label={`Reset ${title}`}><RotateCcw size={12} aria-hidden="true" /> Reset</button>
				</div>
				<p className="mt-1 text-xs leading-6 text-muted-foreground">{description}</p>
			</header>
			<div className="p-4 sm:p-5">{children}</div>
		</section>
	);
}

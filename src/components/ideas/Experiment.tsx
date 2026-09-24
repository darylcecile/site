'use client';

import { FlaskConical, RotateCcw } from 'lucide-react';
import { useId, type ReactNode } from 'react';

export const experimentButton = 'min-h-10 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted disabled:hover:bg-background';
export const primaryExperimentButton = `${experimentButton} border-emerald-700 bg-emerald-800 text-white hover:bg-emerald-900 dark:border-emerald-400 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200`;

export function Experiment({ number, title, description, kind, onReset, children }: {
	number: string;
	title: string;
	description: string;
	kind: string;
	onReset: () => void;
	children: ReactNode;
}) {
	const id = useId();
	return (
		<section aria-labelledby={id} className="idea-widget not-prose overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
			<header className="border-b border-border bg-muted/35 p-5 sm:p-6">
				<div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
					<span className="inline-flex items-center gap-2"><FlaskConical size={13} aria-hidden="true" /> Try it {number}</span>
					<span>{kind}</span>
				</div>
				<h3 id={id} className="text-base font-medium tracking-tight">{title}</h3>
				<p className="mt-2 text-sm text-muted-foreground">{description}</p>
			</header>
			<div className="p-5 sm:p-6">{children}</div>
			<footer className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 text-xs text-muted-foreground sm:px-6">
				<span>An illustration — no files are changed</span>
				<button type="button" onClick={onReset} className="inline-flex min-h-9 items-center gap-1.5 rounded px-2 hover:text-foreground" aria-label={`Reset ${title}`}><RotateCcw size={12} aria-hidden="true" /> Reset</button>
			</footer>
		</section>
	);
}

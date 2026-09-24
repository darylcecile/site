import { ArrowUpRight, Sprout } from 'lucide-react';
import Link from 'next/link';
import type { Idea } from '@/lib/repo/ideasRepo';

export function IdeaCard({ idea }: { idea: Idea }) {
	return (
		<Link href={`/ideas/${idea.slug}`} className="group block rounded-2xl border border-border bg-background/70 p-6 sm:p-8 hover:border-emerald-600/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">
			<div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
				<span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />{idea.metadata.status}</span>
				<span>{idea.readTime}</span>
			</div>
			<div className="my-8 flex items-center justify-between gap-6">
				<h2 className="max-w-md text-2xl tracking-tight text-balance">{idea.metadata.title}</h2>
				<Sprout className="size-12 shrink-0 text-emerald-700 dark:text-emerald-400" strokeWidth={1} aria-hidden="true" />
			</div>
			<p className="max-w-lg text-sm leading-7 text-muted-foreground">{idea.metadata.snippet}</p>
			<div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs">
				<span className="text-muted-foreground">{idea.metadata.topics.join(' / ')}</span>
				<span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">Explore the idea <ArrowUpRight size={14} aria-hidden="true" /></span>
			</div>
		</Link>
	);
}

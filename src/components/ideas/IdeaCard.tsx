import { ArrowUpRight, Database, Fish, Package, Sprout } from 'lucide-react';
import Link from 'next/link';
import type { Idea } from '@/lib/repo/ideasRepo';
import { rainbowAt } from '@/components/projects/rainbow';
import { cn } from '@/lib/utils';

const icons = { sprout: Sprout, fish: Fish, database: Database, package: Package };

export function IdeaCard({ idea, index = 0 }: { idea: Idea; index?: number }) {
	const Icon = icons[idea.metadata.icon ?? 'sprout'];
	const rainbow = rainbowAt(index);
	return (
		<Link href={`/ideas/${idea.slug}`} className={cn(
			'group relative block overflow-hidden rounded-2xl border border-border bg-background/70 p-6 sm:p-8',
			'transition-colors duration-300 ease-in-out motion-reduce:transition-none',
			'hover:bg-muted/40 hover:backdrop-blur-2xl hover:backdrop-saturate-150',
			'outline-transparent focus-visible:outline-2 focus-visible:outline-muted focus-visible:outline-offset-1',
			'focus-visible:bg-muted/40 focus-visible:backdrop-blur-2xl focus-visible:backdrop-saturate-150',
		)}>
			<div className="relative z-2 flex items-center justify-between gap-4 text-xs text-muted-foreground">
				<span className="inline-flex items-center gap-2"><span className={cn('size-1.5 rounded-full bg-current', rainbow.text)} />{idea.metadata.status}</span>
				<span>{idea.readTime}</span>
			</div>
			<div className="relative z-2 my-8 flex items-center justify-between gap-6">
				<h2 className="max-w-md text-2xl tracking-tight text-balance">{idea.metadata.title}</h2>
				<Icon className={cn('size-12 shrink-0', rainbow.text)} strokeWidth={1} aria-hidden="true" />
			</div>
			<p className="relative z-2 max-w-lg text-sm leading-7 text-muted-foreground">{idea.metadata.snippet}</p>
			<div className="relative z-2 mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs">
				<span className="text-muted-foreground">{idea.metadata.topics.join(' / ')}</span>
				<span className={cn('inline-flex items-center gap-1.5', rainbow.text)}>Explore the idea <ArrowUpRight size={14} aria-hidden="true" /></span>
			</div>
			{/* Clip the glow separately from the link's backdrop filter, as on Projects. */}
			<div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
				<div
					className="absolute inset-0 opacity-0 blur-2xl transition-opacity duration-300 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
					style={{ background: `linear-gradient(to bottom left, transparent 25%, transparent 75%, var(${rainbow.var}) 100%)` }}
				/>
			</div>
		</Link>
	);
}

import type { Metadata } from 'next';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { getIdeas } from '@/lib/repo/ideasRepo';

export const metadata: Metadata = {
	title: 'Ideas — Daryl Cecile',
	description: 'A working notebook for ideas, experiments, and things I want to understand by building them.',
	alternates: { canonical: 'https://darylcecile.net/ideas' },
	openGraph: { title: 'Ideas — Daryl Cecile', images: ['/og?page=ideas'] },
	twitter: { card: 'summary_large_image', title: 'Ideas — Daryl Cecile', images: ['/og?page=ideas'] },
};

export default async function IdeasPage() {
	const ideas = await getIdeas();
	return (
		<main className="relative mx-auto max-w-2xl px-6 pt-20 pb-12 sm:px-8 lg:px-0">
			<header className="mb-14">
				<p className="mb-4 font-mono text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-300">A working notebook</p>
				<h1 className="text-4xl tracking-tight">Ideas</h1>
				<p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">A place to think out loud, pull at a thread, and see where it leads.</p>
				<p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">These are ideas I’m exploring through writing, code, and little interactive experiments. Some might become something. Others might just help me understand a problem better. All of them are works in progress.</p>
			</header>
			<div className="mb-5 flex justify-between border-b border-border pb-3 font-mono text-xs text-muted-foreground">
				<span>EXPLORATIONS</span><span>{String(ideas.length).padStart(2, '0')}</span>
			</div>
			{ideas.length ? (
				<div className="grid gap-6">{ideas.map(idea => <IdeaCard key={idea.slug} idea={idea} />)}</div>
			) : (
				<p className="rounded-2xl border border-dashed border-border p-6 text-sm leading-7 text-muted-foreground">Nothing published here yet. I’m taking some time to explore the first idea.</p>
			)}
		</main>
	);
}

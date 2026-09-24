import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { IdeaMarkdown } from '@/components/ideas/IdeaMarkdown';
import FancyLink from '@/components/utils/FancyLink';
import { getIdea, getIdeas, getIdeaSections } from '@/lib/repo/ideasRepo';
import '../ideas.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
	const params = (await getIdeas()).map(idea => ({ slug: idea.slug }));
	// Cache Components requires a sample route even before an idea is published.
	// The placeholder has no entry, so the page returns notFound().
	return params.length ? params : [{ slug: '__empty__' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const idea = await getIdea((await params).slug);
	if (!idea) notFound();
	const { title, snippet, date, lastUpdated } = idea.metadata;
	const url = `https://darylcecile.net/ideas/${idea.slug}`;
	const image = `/og?page=${encodeURIComponent(`ideas/${idea.slug}`)}`;
	return {
		title: `${title} — Daryl Cecile`, description: snippet,
		alternates: { canonical: url },
		openGraph: { title, description: snippet, url, type: 'article', publishedTime: date, modifiedTime: lastUpdated ?? date, images: [image] },
		twitter: { card: 'summary_large_image', title, description: snippet, images: [image] },
	};
}

export default async function IdeaPage({ params }: Props) {
	const idea = await getIdea((await params).slug);
	if (!idea) notFound();
	const sections = getIdeaSections(idea.content);
	const date = idea.metadata.lastUpdated ?? idea.metadata.date;
	return (
		<main className="relative px-6 pt-16 pb-12 sm:px-8">
			<article className="mx-auto max-w-2xl">
				<Link href="/ideas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} aria-hidden="true" /> All ideas</Link>
				<header className="mt-12 mb-10">
					<div className="mb-5 flex flex-wrap items-center gap-3 font-mono text-xs text-emerald-800 dark:text-emerald-300">
						<span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-current" />{idea.metadata.status}</span>
						<span aria-hidden="true">/</span><span>Living document</span>
					</div>
					<h1 className="text-4xl leading-tight tracking-tight text-balance sm:text-5xl">{idea.metadata.title}</h1>
					<p className="mt-6 text-lg leading-8 text-muted-foreground">{idea.metadata.snippet}</p>
					<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
						<span>{idea.metadata.lastUpdated ? 'Updated ' : ''}<time dateTime={date}>{new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></span>
						<span>{idea.readTime}</span>
						{idea.metadata.repository && <a href={idea.metadata.repository} className="inline-flex items-center gap-1 underline underline-offset-4">Source on GitHub <ArrowUpRight size={12} aria-hidden="true" /></a>}
					</div>
				</header>
				<nav aria-label="In this idea" className="mb-12 rounded-xl border border-border bg-background/60 p-5 sm:p-6">
					<p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">In this idea</p>
					<ol className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
						{sections.map((section, i) => <li key={section.id}><FancyLink href={`#${section.id}`} className="flex gap-3 text-sm whitespace-normal!"><span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>{section.title}</FancyLink></li>)}
					</ol>
				</nav>
				<div className="idea-prose prose dark:prose-invert max-w-none text-foreground/85">
					<IdeaMarkdown content={idea.content} />
				</div>
				<footer className="mt-16 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
					<Link href="/ideas" className="hover:text-foreground">← Back to ideas</Link>
					<a href="#" className="hover:text-foreground">Back to top ↑</a>
				</footer>
			</article>
		</main>
	);
}

import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import IdeaPage from '@/pages/IdeaPage';

const getIdeaData = createServerFn({ method: 'GET' })
	.validator((slug: string) => {
		if (typeof slug !== 'string' || !slug) throw notFound();
		return slug;
	})
	.handler(async ({ data: slug }) => {
		const { getIdeaPage } = await import('@/lib/repo/ideasRepo');
		const idea = await getIdeaPage(slug);
		if (!idea) throw notFound();
		return idea;
	});

export const Route = createFileRoute('/ideas/$slug')({
	loader: ({ params }) => getIdeaData({ data: params.slug }),
	head: ({ loaderData: idea }) => {
		if (!idea) return {};
		const { title, snippet, date, lastUpdated } = idea.metadata;
		const url = `https://darylcecile.net/ideas/${idea.slug}`;
		const image = `https://darylcecile.net/og?page=${encodeURIComponent(`ideas/${idea.slug}`)}`;
		return {
			meta: [
				{ title: `${title} — Daryl Cecile` },
				{ name: 'description', content: snippet },
				{ property: 'og:title', content: title },
				{ property: 'og:description', content: snippet },
				{ property: 'og:url', content: url },
				{ property: 'og:type', content: 'article' },
				{ property: 'og:image', content: image },
				{ property: 'article:published_time', content: date },
				{ property: 'article:modified_time', content: lastUpdated ?? date },
				{ name: 'twitter:title', content: title },
				{ name: 'twitter:description', content: snippet },
				{ name: 'twitter:image', content: image },
			],
			links: [{ rel: 'canonical', href: url }],
		};
	},
	component: IdeaRoute,
});

function IdeaRoute() {
	return <IdeaPage idea={Route.useLoaderData()} />;
}
